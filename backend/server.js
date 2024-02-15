const cors = require("cors");
// const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  users,
  userJoin,
  getCurrentUser,
  userLeave,
  endRoom,
  getRoomUsers,
} = require("./utils/users");

console.log(users);

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.post("/check-room", (req, res) => {
  const { room } = req.body;
  const roomCodes = users.map((user) => user.room);
  console.log("from server.js: /check-room: " + room);
  console.log("from server.js: /check-room: find->" + roomCodes.includes(room));
  const result = roomCodes.includes(room);
  res.json({ available: result });
});

const botName = "Bot";

io.on("connection", (socket) => {
  console.log("socket.id: " + socket.id);
  socket.on("joinRoom", ({ username, room, prevSocketId }) => {
    console.log("joinRoom prevID: ", prevSocketId);
    const user = userJoin(socket.id, username, room, prevSocketId);

    socket.join(user.room);
    console.log(users);

    // Welcome current user
    socket.emit(
      "message",
      formatMessage(botName, "<i>Welcome to Chatter-HUB!</i>")
    );

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `<i>${user.username} has joined the chat</i>`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    if (user && user.room) {
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    }
  });

  socket.on("ping", (message) => {
    if (message && socket && socket.id) {
      const user = getCurrentUser(socket.id);
      if (user && user.room) io.to(user.room).emit("ping", message);
    }
  });

  socket.on("videoCode", (message) => {
    console.log("videoCode: ", message);
    if (message && socket && socket.id) {
      const user = getCurrentUser(socket.id);
      if (user && user.room) io.to(user.room).emit("videoCode", message);
    }
  });

  // Runs when client disconnects

  socket.on("endroom", () => {
    console.log("endroom: " + Date.now());
    const user = endRoom(socket.id);
    console.log(user);
    io.to(user.room).emit("redirect");
    console.log(users);
  });

  socket.on("disconnect", () => {
    console.log("disconnect: " + Date.now());
    const user = userLeave(socket.id);
    console.log(users);

    if (user) {
      // localStorage.removeItem("socketId");
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `<i>${user.username} has left the chat</i>`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });

      if (user.isAdmin === true) {
        console.log("admin left");
        // Emit a message to all clients in the room to redirect them
        io.to(user.room).emit("redirect");
      }
      socket.disconnect(true);
    }
  });
});

const PORT = process.env.PORT || 8080;
// const HOST = process.env.SERVER_URL || "http://localhost";

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
