import { readFileSync } from "fs";
import http from "http";
import https from "https";
import next from "next";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({
  path: 
    process.env.NODE_ENV !== "production" ? [
      '.env', '.env.local'
    ] : [
      '.env'
    ]
})

const dev = process.env.NODE_ENV !== "production";
const isHttps = process.env.HTTPS === 'true';
const turbo = dev;
const hostname = process.env.HOST ?? 'localhost';
const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT);

const app = next({ dev, hostname, port, turbo });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  let server;
  if(isHttps) {
    server = https.createServer({
      key: readFileSync("./_wildcard_.rero0124.com.key.pem"),
      cert: readFileSync("./_wildcard_.rero0124.com.crt.pem")
    }, handler);
  } else {
    server = http.createServer(handler);
  }
  
  const socketArr: {
    id: string,
    userId: number,
  }[] = []
  
  const io = new Server(server);

  const findSocketIdByUserId = (userId: number | number[]) => socketArr.find((socket) => userId instanceof Array ? userId.indexOf(socket.userId) > -1 : socket.userId === userId )
  const socktArrDeleteByUserId = (userId: number | number[]) => { socketArr.splice(socketArr.findIndex((socket) => socket.userId === userId), 1) }
  const socktArrDeleteBySessionId = (socketId: string | string[]) => { socketArr.splice(socketArr.findIndex((socket) => socket.id === socketId), 1) }

  io.engine.on("connection", (rawSocket) => {
    
  });

  io.on("connection", (socket) => {
    socket.on('send', (type, data) => {
      switch(type) {
        case 'userId':
          if(data !== undefined || data > -1) {
            socktArrDeleteByUserId(data);
            socketArr.push({ id: socket.id, userId: data })
          }
          break;
      }
    })
    socket.on("disconnect", (reason) => {
      socktArrDeleteBySessionId(socket.id);
    })
  });
  
  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on ${isHttps ? 'https' : 'http'}://${hostname}:${port}`);
    });
});