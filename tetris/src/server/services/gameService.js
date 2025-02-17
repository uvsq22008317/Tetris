const Game = require("../models/userModel");

const createGame = async (roomId) => {
    try{
        let game = await Game.findOne({ roomId });
        if (game) {
            throw new Error("Room already exists !");
        }
        game = new Game({
            roomId,
            players: [],
            state: "waiting",
        });
        await game.save();
        return game;
    } catch (error) {
        console.error("Error creating room : ", error);
        throw new Error("Error creating room !");
    }
};

const joinGame = async (roomId, userId, username) => {
    try{
        let game = await Game.findOne({ roomId });
        if (!game) {
            throw new Error("Room not found !");
        }
        if(game.user.length < 2) {
            game.user.push(userId, username);
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
