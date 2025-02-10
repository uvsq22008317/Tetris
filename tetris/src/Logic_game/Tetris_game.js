import React, { useEffect, useRef } from 'react';

function TetrisGame() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = 300;
    canvas.height = 600;

    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';
    context.font = '20px Arial';
    //context.fillText('Tetris plateau', 30, 50);

    // logique jeu ICI
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: '1px solid #fff' }} />
    </div>
  );
}

export default TetrisGame;
