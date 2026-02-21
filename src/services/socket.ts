// src/services/socket.ts
import { io, Socket } from 'socket.io-client';
const apiUrl = import.meta.env.VITE_OSRM_URL;

  const SOCKET_URL = apiUrl; // change to your server URL

// Create socket connection
const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'], // capacitor prefers websockets
});

export default socket;
