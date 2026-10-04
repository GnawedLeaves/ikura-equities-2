import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, hello: "hello" }));

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  console.log("browser connected");
  socket.send(JSON.stringify({ type: "hello" }));
});

server.listen(Number(process.env.PORT ?? 3001), () =>
  console.log("Server on http://localhost:3001"),
);
