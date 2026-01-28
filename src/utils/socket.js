// src/lib/socket.js
import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const socket = io(URL, {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
