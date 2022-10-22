const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors);
app.use(express.static(path.join(__dirname, "client")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {},
});

io.on("connection", (socket) => {
  socket.on("join", ({ room, global }) => {
    if (global) socket.join(1);
    else socket.join(room);
  });

  socket.on("sendMessage", (messageData) => {
    socket.to(messageData.room).emit("receivedMessage", messageData);
  });

  socket.on("disconnect", () => {
    console.log(`Usuario ${socket.id} desconectado`);
  });
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`SERVER RUNNING: ${port}`);
});
