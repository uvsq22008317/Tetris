import { io } from "socket.io-client";

const socket = io("https://tetraws.onrender.com/");

export default socket;