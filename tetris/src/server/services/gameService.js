let games = {};

const createGame = (roomId) => {
    if (games[roomId]) {
        return { error: "Room already exists !"};
    }
    games[roomId] = {
        player: [],
        state: "waiting",
    };
    return game[roomId];
};

const joinGame = (roomId, playerId) => {
    if(!games[roomId]) {
        return { error: "Room not found !"};
    }
    if(games[roomId].players.length < 2) {
        games[roomId].player.push(playerId);
        games[roomId].state = "playing";
        return games[roomId];
    }
    return { error: "Room is full !"};
};

module.exports = { createGame, joinGame };
