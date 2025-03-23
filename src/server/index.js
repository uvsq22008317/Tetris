require("dotenv").config({ path: './.env' });
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit"); 
const cookieParser = require("cookie-parser");  
const socketConfig = require("./config/socketConfig");
const DB = require("./config/db");
const { instrument } = require("@socket.io/admin-ui")
const RegisterRoutes = require("./routes/RegisterRoutes");
const LoginRoutes = require("./routes/LoginRoutes");
const LeaderboardRoutes = require("./routes/LeaderboardsRoutes");
const authentificationRoutes = require("./routes/LoginRoutes");
const logout = require('./routes/LogoutRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:3000", "https://tetris-ig97.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

const server = http.createServer(app);
const io = socketIo(server, {   
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io/", "https://tetris-ig97.onrender.com"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    },
});

DB();

app.use(express.json());
app.use(mongoSanitize());

// 5 tentatives de connexion max par ip en 15 min (protection brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
});

// création de 5 comptes max par ip en 1h (protection contre les spams)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: "Trop de tentatives d'inscription, veuillez réessayer plus tard.",
});

app.use("/tok", authentificationRoutes);
app.use("/reg", RegisterRoutes);
app.use("/log", LoginRoutes);
app.use("", LeaderboardRoutes);
app.use("/logo", logout);

// socket.io config
socketConfig(io);
instrument(io, { auth: false });

// start the express server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});