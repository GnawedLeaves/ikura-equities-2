import "dotenv/config";
import ws from "ws";
import WebSocket from "ws";

const socket = new WebSocket(
  "wss://ws.finnhub.io?token=daepl5hr01qqo7ntga4gdaepl5hr01qqo7ntga50",
);

socket.on("open", () =>
  socket.send(JSON.stringify({ type: "subscribe", symbol: "BINANCE:BTCUSDT" })),
);
socket.on("message", (raw) => console.log(raw.toString()));
socket.on("close", (code) => console.log("closed", code));

// https://finnhub.io/docs/api/open-data
// Connection opened -> Subscribe, both ways work too
// socket.addEventListener("open", function (event) {
//   socket.send(JSON.stringify({ type: "subscribe", symbol: "AAPL" }));
//   socket.send(JSON.stringify({ type: "subscribe", symbol: "BINANCE:BTCUSDT" }));
//   socket.send(JSON.stringify({ type: "subscribe", symbol: "IC MARKETS:1" }));
// });

// // Listen for messages
// socket.addEventListener("message", function (event) {
//   console.log("Message from server ", event.data);
// });

// // Unsubscribe
// var unsubscribe = function (symbol: string) {
//   socket.send(JSON.stringify({ type: "unsubscribe", symbol: symbol }));
// };
