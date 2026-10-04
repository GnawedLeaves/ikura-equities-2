export interface Tick {
  symbol: string;
  price: number;
  volume: number;
  ts: number; // milliseconds since epoch
}

export interface Quote extends Tick {
  prevPrice: number | null;
}

export interface Instrument {
  symbol: string;
  name: string;
  prevClose: number | null;
}

export type ServerMsg =
  | ({ type: "tick" } & Tick)
  | { type: "ping" }
  | { type: "error"; message: string };

export type ClientMsg =
  | { type: "subscribe"; symbols: string[] }
  | { type: "unsubscribe"; symbols: string[] }
  | { type: "pong" };
