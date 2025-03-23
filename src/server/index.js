require("dotenv").config({ path: './.env' });
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");  
const socketConfig = require("./config/socketConfig");
const DB = require("./config/db");
const { instrument } = require("@socket.io/admin-ui")
const RegisterRoutes = require("./routes/RegisterRoutes");
const LoginRoutes = require("./routes/LoginRoutes");
const authentificationRoutes = require("./routes/LoginRoutes");
const logout = require('./routes/LogoutRoutes');


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:3000", "https://tetraws.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

const server = http.createServer(app);
const io = socketIo(server, {   
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io/", "https://tetraws.onrender.com"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    },
});

DB();

app.use("/tok", authentificationRoutes);
app.use("/reg", RegisterRoutes);
app.use("/log", LoginRoutes);
app.use("/logo", logout);

// socket.io config
socketConfig(io);

instrument(io, { auth: false });

// start the express server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "localhost", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});