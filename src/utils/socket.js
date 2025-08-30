// src/lib/socket.js
import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://alumni-backend-d9k9.onrender.com"; //"http://localhost:5000";

const socket = io(URL, {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
