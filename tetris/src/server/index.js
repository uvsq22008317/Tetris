require("dotenv").config;
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const gameRoutes = require("./routes/gameRoutes")
const socketConfig = require("./config/socketConfig");
const DB = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

DB();
app.use(cors());
app.use(express.json);

// Routes
app.use("/api/game", gameRoutes);

// socket.io config
socketConfig(io);

// start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server start on port ${PORT}`));