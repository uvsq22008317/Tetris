const gameSockets = require("../sockets/gameSockets");

const socketConfig = (io) => {
    gameSockets(io);
};

module.exports = socketConfig;