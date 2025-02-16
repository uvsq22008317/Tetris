const Game = require("../models/userModel");

const createGame = async (roomId) => {
    try{
        let game = await Game.findOne({ roomId });
        if (game) {
            return { error: "Room already exists !"};
        }
        game = new Game({
            roomId,
            players: [],
            state: "waiting",
        });
        await game.save();
        return game;
    } catch (error) {
        console.error("Error creating game : ", error);
        return { error: "server error" };
    }
};

const joinGame = async (roomId, userId, username) => {
    try{
        let game = await Game.findOne({ roomId });
        if (!game) {
            return { error: "Room not found !"};
        }
        if(game.user.length < 2) {
            game.user.push(userId, username);
            game.state = "playing";
            await game.save();
            return game;
        }
        return { error: "Room is full !"};
    } catch (error) {
        console.error("Error joining game : ", error);
        return { error: "server error" };
    }
};

module.exports = { createGame, joinGame };
