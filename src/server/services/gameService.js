const Game = require("../models/gameModel");

// Create a game
const createGame = async (roomId) => {
    try{
        let game = await Game.findOne({ roomId });
        if (game) {
            throw new Error("Room already exists !");
        }
        game = new Game({
            roomId,
            players: [],
        });
        await game.save();
        return game;
    } catch (error) {
        console.error("Error creating room : ", error);
        throw new Error("Error creating room !");
    }
};

// Join a game
const joinGame = async (roomId, userId, username) => {
    try{
        let game = await Game.findOne({ roomId: roomId });
        console.log("game : ", game);
        if (!game) {
            throw new Error("Room not found !");
        }
        if(game.players.length < 100) {
            game.players.push({ id: userId, username });
            game.state = "playing";
            await game.save();
            return game;
        }
        throw new Error("Room is full !");
    } catch (error) {
        console.error("Error joining room : ", error);
        throw new Error("Error joining the room");
    }
};

module.exports = { createGame, joinGame };
