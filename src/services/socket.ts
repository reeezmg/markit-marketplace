// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3005'; // change to your server URL

// Create socket connection
const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'], // capacitor prefers websockets
});

export default socket;
