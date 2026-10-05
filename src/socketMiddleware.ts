import { createAction, type Middleware } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { ClientMsg, ServerMsg, Tick } from "./types";
import { pricesUpdated } from "./features/prices/pricesSlice";
import {
  symbolAdded,
  symbolRemoved,
} from "./features/watchlist/watchlistSlice";

export const socketConnection = createAction<{ url: string }>("socket/connect");
export const socketDisconnect = createAction("socket/disconnect");

export const socketMiddleware: Middleware<{}, RootState> = (store) => {
  let ws: WebSocket | null = null;
  const buffer = new Map<string, Tick>(); // latest tick per symbol
  let flushScheduled = false;

  const send = (msg: ClientMsg) => {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  };

  const flush = () => {
    flushScheduled = false;
    if (buffer.size === 0) return;
    console.log("[flow 8] MW: animation frame -> dispatch pricesUpdated with", buffer.size, "latest tick(s)", [...buffer.keys()]);
    store.dispatch(pricesUpdated([...buffer.values()]));
    buffer.clear();
  };

  const close = () => {
    if (ws) {
      ws.onclose = null; // so a deliberate close doesn't trigger any reconnect logic
      ws.close();
      ws = null;
    }
    buffer.clear();
  };

  return (next) => (action) => {
    if (socketConnection.match(action)) {
      close(); // never keep two sockets open

      ws = new WebSocket(action.payload.url);

      ws.onopen = () => {
        const symbols = store.getState().watchlist.symbols;
        console.log("[flow 0] MW: socket open, subscribing everything already in Redux:", symbols);
        if (symbols.length > 0) send({ type: "subscribe", symbols });
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        const msg = JSON.parse(event.data) as ServerMsg;
        if (msg.type === "ping") {
          send({ type: "pong" });
          return;
        }
        if (msg.type !== "tick") return;

        console.log("[flow 7] MW: tick received from server", msg.symbol, msg.price, "-> buffered");
        const { type: _type, ...tick } = msg; // strip `type`, keep the Tick fields
        buffer.set(tick.symbol, tick);
        if (!flushScheduled) {
          flushScheduled = true;
          requestAnimationFrame(flush); // dispatch once, just before the next paint
        }
      };

      ws.onerror = () => console.error("WebSocket error on fe");
    }

    if (socketDisconnect.match(action)) close();

    if (symbolAdded.match(action)) {
      console.log("[flow 2] MW: saw symbolAdded -> sending to server", { type: "subscribe", symbols: [action.payload] });
      send({ type: "subscribe", symbols: [action.payload] });
    }
    if (symbolRemoved.match(action))
      send({ type: "unsubscribe", symbols: [action.payload] });

    const result = next(action);
    if (symbolAdded.match(action))
      console.log("[flow 3] reducer: watchlist is now", store.getState().watchlist.symbols);
    return result;
  };
};
