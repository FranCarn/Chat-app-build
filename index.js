const path = require("path");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static(path.join(__dirname, "client")));

const usersInRooms = {};

io.on("connection", (socket) => {
  socket.on("join", ({ room, global }) => {
    if (global) socket.join(1);
    else socket.join(room);
  });

  socket.on("sendMessage", (messageData) => {
    socket.to(messageData.room).emit("receivedMessage", messageData);
  });

  socket.on("set-user", ({ name, room }) => {
    socket.user = { name, room: room ? room : 1 };
    if (!usersInRooms[socket.user.room]) {
      usersInRooms[socket.user.room] = [];
    }

    usersInRooms[socket.user.room].push({
      id: socket.id,
      name,
    });
    io.to(socket.user.room).emit("usersInRoom", usersInRooms[socket.user.room]);

    socket.to(socket.user.room).emit("receivedMessage", {
      room: room ? room : 1,
      user: "Live Chat",
      message: `Now ${socket.user.name} are connected to the room`,
      time: `${new Date(Date.now()).getHours()}:${new Date(
        Date.now()
      ).getMinutes()}`,
      id: new Date(Date.now()).getMilliseconds(),
    });
  });

  socket.on("disconnect", () => {
    usersInRooms[socket.user?.room] = usersInRooms[socket.user?.room]?.filter(
      (item) => item.id !== socket.id
    );

    io.to(socket.user?.room).emit(
      "usersInRoom",
      usersInRooms[socket.user?.room]
    );

    if (!socket.user?.room || !socket.user?.name) return;
    socket.to(socket?.user?.room).emit("receivedMessage", {
      room: socket.user.room,
      user: "Live Chat",
      message: `${socket?.user?.name} disconnected`,
      time: `${new Date(Date.now()).getHours()}:${new Date(
        Date.now()
      ).getMinutes()}`,
      id: new Date(Date.now()).getMilliseconds(),
    });
  });
});

const port = process.env.PORT || 4000;

http.listen(port, () => {
  console.log(`SERVER RUNNING: ${port}`);
});
