export interface Tick {
  symbol: string;
  price: number;
  volume: number;
  ts: number; // milliseconds since epoch
}

export interface Quote extends Tick {
  prevPrice: number | null;
}

// one bar of the candle chart; time is unix seconds at the start of the minute
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Instrument {
  symbol: string;
  name: string;
  lastPrice: number | null; // snapshot from /quote at load time, shown until a live tick arrives
  prevClose: number | null;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string; // e.g. "Common Stock", "ADR"
}

export type ServerMsg =
  | ({ type: "tick" } & Tick)
  | { type: "ping" }
  | { type: "error"; message: string };

export type ClientMsg =
  | { type: "subscribe"; symbols: string[] }
  | { type: "unsubscribe"; symbols: string[] }
  | { type: "pong" };
