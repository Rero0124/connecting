import { io } from "socket.io-client";

export const socket = io('https://home.rero0124.com:4000', { 
  secure: true,
  withCredentials: true
});