const { readFileSync } = require("fs");
const { createSecureServer } = require("http2");
const { Server } = require("socket.io");

const httpServer = createSecureServer({
  allowHTTP1: true,
  key: readFileSync("_wildcard_.rero0124.com.key.pem"),
  cert: readFileSync("_wildcard_.rero0124.com.crt.pem"),
  ca: [
    readFileSync("certificates/localhost.pem")
  ]
});

const io = new Server(httpServer, {
  cors: {
    origin: 'https://home.rero0124.com:3000',
    credentials: true
  }
});

io.engine.on("connection", (rawSocket) => {
  rawSocket.peerCertificate = rawSocket.request.client?.getPeerCertificate();
});

io.on("connection", (socket) => {
  console.log(socket.conn.peerCertificate);
  // ...
});

httpServer.listen(4000);