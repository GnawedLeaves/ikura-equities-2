import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

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
        return { ...inst, prevClose: quote?.pc || null };
      }),
    );
    res.json(items);
  } catch {
    res.status(502).json({ message: "Failed to load instruments" });
  }
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  console.log("browser connected");
  socket.send(JSON.stringify({ type: "hello" }));
});

server.listen(Number(process.env.PORT ?? 3001), () =>
  console.log("Server on http://localhost:3001"),
);
