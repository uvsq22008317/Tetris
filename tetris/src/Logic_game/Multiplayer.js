import socketHooks from "../socketHooks";

const Multiplayer = () => {
    const { roomId, playerGrid, otherPlayersGrids, sendMove } = socketHooks();

    const handleMove = (move) => {
        sendMove(move);
    };

    return (
        <div>
            <h1>Tetris - Room {roomId}</h1>
            <h2>playerGrid</h2>
            <h2>otherPlayersGrids</h2>
            <button></button>
        </div>
    );
};

export default Multiplayer;