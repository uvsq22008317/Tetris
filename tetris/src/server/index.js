require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const gameRoutes = require("./routes/gameRoutes")
const socketConfig = require("./config/socketConfig");
const DB = require("./config/db");
const { instrument } = require("@socket.io/admin-ui")

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io/"],
        methods: ["GET", "POST"],
    },
});

DB();
app.use(cors());
app.use(express.json());

// Routes
app.use("/game", gameRoutes);

// socket.io config
socketConfig(io);

instrument(io, { auth: false });

// start the express server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server start on port ${PORT}`));