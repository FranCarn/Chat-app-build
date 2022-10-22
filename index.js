const path = require("path");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static(path.join(__dirname, "client")));

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

http.listen(port, () => {
  console.log(`SERVER RUNNING: ${port}`);
});
