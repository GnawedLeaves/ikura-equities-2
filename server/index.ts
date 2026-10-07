import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import WebSocket, { WebSocketServer } from "ws";

// dotenv/config only reads `.env`; our key lives in `.env.local` (git-ignored by *.local)
dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, hello: "hello" }));

//instruments endpoint

const INSTRUMENTS = [
  { symbol: "AAPL", name: "Apple Inc" },
  { symbol: "MSFT", name: "Microsoft Corp" },
  { symbol: "NVDA", name: "NVIDIA Corp" },
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin / Tether" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum / Tether" },
];
app.get("/api/instruments", async (_req, res) => {
  try {
    const items = await Promise.all(
      INSTRUMENTS.map(async (inst) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(inst.symbol)}&token=${process.env.FINNHUB_API_KEY}`;
        const r = await fetch(url);
        const quote = r.ok ? await r.json() : null;
        // c = last traded price (still valid when the market is closed), pc = previous close
        return { ...inst, lastPrice: quote?.c || null, prevClose: quote?.pc || null };
      }),
    );
    res.json(items);
  } catch {
    res.status(502).json({ message: "Failed to load instruments" });
  }
});

// symbol search, done server-side so the API key never reaches the browser
app.get("/api/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    res.json([]);
    return;
  }
  try {
    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${process.env.FINNHUB_API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) {
      res.status(r.status).json({ message: "Search failed" });
      return;
    }
    const data = (await r.json()) as {
      result: { description: string; symbol: string; type: string }[];
    };
    res.json(
      data.result.slice(0, 10).map((item) => ({
        symbol: item.symbol,
        name: item.description,
        type: item.type,
      })),
    );
  } catch {
    res.status(502).json({ message: "Search failed" });
  }
});

// 1-minute candles kept in memory, no DB: a candle is just open/high/low/close per time bucket
interface Candle {
  time: number; // unix seconds, start of the minute (what lightweight-charts expects)
  open: number;
  high: number;
  low: number;
  close: number;
}
const MAX_CANDLES = 240; // ~4 hours per symbol, so memory stays bounded
const candles = new Map<string, Candle[]>();

const addTradeToCandles = (symbol: string, price: number, tsMs: number) => {
  const time = Math.floor(tsMs / 60_000) * 60;
  const list = candles.get(symbol) ?? [];
  const last = list[list.length - 1];

  if (last?.time === time) {
    last.high = Math.max(last.high, price);
    last.low = Math.min(last.low, price);
    last.close = price;
  } else if (!last || time > last.time) {
    list.push({ time, open: price, high: price, low: price, close: price });
    if (list.length > MAX_CANDLES) list.shift();
  }
  candles.set(symbol, list);
};

// Finnhub's candle API is paid-only, so crypto history comes from Binance's free public klines
const seedFromBinance = async (symbol: string) => {
  if (!symbol.startsWith("BINANCE:") || candles.get(symbol)?.length) return;
  try {
    const pair = symbol.slice("BINANCE:".length);
    const r = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1m&limit=120`,
    );
    if (!r.ok) return;
    const rows = (await r.json()) as [number, string, string, string, string][];
    const history = rows.map(([openTime, o, h, l, c]) => ({
      time: openTime / 1000,
      open: Number(o),
      high: Number(h),
      low: Number(l),
      close: Number(c),
    }));
    const lastSeeded = history[history.length - 1];
    if (!lastSeeded) return;
    // keep any live candles that arrived while we were fetching
    const live = (candles.get(symbol) ?? []).filter((c) => c.time > lastSeeded.time);
    candles.set(symbol, [...history, ...live]);
  } catch {
    // no history is fine, the chart just builds up from live ticks
  }
};

app.get("/api/candles", async (req, res) => {
  const symbol = String(req.query.symbol ?? "").trim();
  if (!symbol) {
    res.status(400).json({ message: "symbol is required" });
    return;
  }
  await seedFromBinance(symbol);
  res.json(candles.get(symbol) ?? []);
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

// one shared upstream socket to Finnhub (free plan allows 1 connection per key)
const subscribed = new Set<string>();
const finnhub = new WebSocket(
  `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`,
);

const sendToFinnhub = (type: "subscribe" | "unsubscribe", symbol: string) => {
  if (finnhub.readyState === WebSocket.OPEN) {
    console.log("[flow 5] SERVER -> Finnhub:", { type, symbol });
    finnhub.send(JSON.stringify({ type, symbol }));
  } else {
    console.log("[flow 5] SERVER: Finnhub not open yet, will replay on open:", symbol);
  }
};

// the browser may ask for symbols before Finnhub is connected, so replay them on open
finnhub.on("open", () => {
  console.log("finnhub connected");
  console.log("[flow 5] SERVER: replaying subscriptions:", [...subscribed]);
  subscribed.forEach((symbol) => sendToFinnhub("subscribe", symbol));
});

finnhub.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.type !== "trade") return;

  for (const trade of msg.data as { s: string; p: number; v: number; t: number }[]) {
    addTradeToCandles(trade.s, trade.p, trade.t);
    const tick = JSON.stringify({
      type: "tick",
      symbol: trade.s,
      price: trade.p,
      volume: trade.v,
      ts: trade.t,
    });
    console.log("[flow 6] SERVER: Finnhub trade", trade.s, trade.p, "-> tick to", wss.clients.size, "browser(s)");
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(tick);
    });
  }
});

finnhub.on("error", (err) => console.error("finnhub error", err.message));
finnhub.on("close", (code) => console.log("finnhub closed", code));

wss.on("connection", (socket) => {
  console.log("browser connected");

  // browser sends { type, symbols[] }; Finnhub takes one symbol per message
  socket.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type !== "subscribe" && msg.type !== "unsubscribe") return;
    console.log("[flow 4] SERVER: browser asked to", msg.type, msg.symbols);

    for (const symbol of msg.symbols as string[]) {
      if (msg.type === "subscribe") subscribed.add(symbol);
      else subscribed.delete(symbol);
      sendToFinnhub(msg.type, symbol);
    }
    console.log("[flow 4] SERVER: subscribed set is now", [...subscribed]);
  });
});

server.listen(Number(process.env.PORT ?? 3001), () =>
  console.log("Server on http://localhost:3001"),
);
