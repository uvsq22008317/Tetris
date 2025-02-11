window.onload = function () {
    const GRID_COLUMNS = 10;  // number of columns
    const GRID_ROWS = 20;    // number of rows
    const CELL_SIZE = 30;   // cell size in px

    let lastFallTime = 0; // time of the last piece drop
    const fallSpeed = 500; // time in ms between each drop

    let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLUMNS).fill(0));

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    const shapes = [
        // O (square)
        [[[1, 1],
          [1, 1]]],

        // I
        [[[0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]],

         [[0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0]]],

        // T
        [[[0, 1, 0],
          [1, 1, 1],
          [0, 0, 0]],

         [[0, 1, 0],
          [0, 1, 1],
          [0, 1, 0]],

         [[0, 0, 0],
          [1, 1, 1],
          [0, 1, 0]],

         [[0, 1, 0],
          [1, 1, 0],
          [0, 1, 0]]],

        // L 
        [[[0, 0, 1],
          [1, 1, 1],
          [0, 0, 0]],

         [[0, 1, 0],
          [0, 1, 0],
          [0, 1, 1]],

         [[0, 0, 0],
          [1, 1, 1],
          [1, 0, 0]],

         [[1, 1, 0],
          [0, 1, 0],
          [0, 1, 0]]],

        // J
        [[[1, 0, 0],
          [1, 1, 1],
          [0, 0, 0]],

         [[0, 1, 1],
          [0, 1, 0],
          [0, 1, 0]],

         [[0, 0, 0],
          [1, 1, 1],
          [0, 0, 1]],

         [[0, 1, 0],
          [0, 1, 0],
          [1, 1, 0]]],

        // Z
        [[[1, 1, 0],
          [0, 1, 1],
          [0, 0, 0]],

         [[0, 0, 1],
          [0, 1, 1],
          [0, 1, 0]]],

        // S
        [[[0, 1, 1],
          [1, 1, 0],
          [0, 0, 0]],

         [[0, 1, 0],
          [0, 1, 1],
          [0, 0, 1]]]
    ];

    let shapeIndex = Math.floor(Math.random() * shapes.length); // random shape selection
    let rotation = 0;
    let shapeX = 4;
    let shapeY = 0;

    function drawStoredShapes(scene) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLUMNS; col++) {
                if (grid[row][col] !== 0) {
                    scene.add.rectangle(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, 
                        CELL_SIZE, CELL_SIZE, grid[row][col]);
                }
            }
        }
    }

    function saveToGrid() {
        for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
            for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                if (shapes[shapeIndex][rotation][y][x] === 1) {
                    let newX = shapeX + x;
                    let newY = shapeY + y;
                    if (newY < GRID_ROWS && newX < GRID_COLUMNS) {
                        grid[newY][newX] = colors[shapeIndex];
                    }
                }
            }
        }
    }

    function resetPiece() {
        shapeIndex = Math.floor(Math.random() * shapes.length);
        rotation = 0;
        shapeX = 4;
        shapeY = 0;
    }

    function canMoveLeft() {
        for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
            for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                if (shapes[shapeIndex][rotation][y][x] === 1) {
                    let newX = shapeX + x - 1;
                    if (newX < 0 || grid[shapeY + y][newX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    function canMoveRight() {
        for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
            for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                if (shapes[shapeIndex][rotation][y][x] === 1) {
                    let newX = shapeX + x + 1;
                    if (newX >= GRID_COLUMNS || grid[shapeY + y][newX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function canMoveDown() {
        for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
            for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                if (shapes[shapeIndex][rotation][y][x] === 1) {
                    let newY = shapeY + y + 1;
                    if (newY >= GRID_ROWS || grid[newY][shapeX + x] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    

    class TetrisScene extends Phaser.Scene {
        constructor() {
            super({ key: 'TetrisScene' });
        }

        create() {
            this.drawGrid();
            drawStoredShapes(this);
            this.drawShape();
            this.input.keyboard.on('keydown', this.handleKey, this);
        }

        drawGrid() {
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLUMNS; col++) {
                    let x = col * CELL_SIZE;
                    let y = row * CELL_SIZE;

                    this.add.rectangle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 
                        CELL_SIZE, CELL_SIZE, 0x444444)
                        .setStrokeStyle(0.25, 0xD3D3D3);
                }
            }
        }

        drawShape() {
            // draw the stored blocks from the grid
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLUMNS; col++) {
                    if (grid[row][col] !== 0) {
                        this.add.rectangle(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, 
                            CELL_SIZE, CELL_SIZE, grid[row][col]);
                    }
                }
            }
        
            // draw the current falling shape
            let color = colors[shapeIndex];
            for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
                for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                    if (shapes[shapeIndex][rotation][y][x] == 1) {
                        let posX = (shapeX + x) * CELL_SIZE;
                        let posY = (shapeY + y) * CELL_SIZE;
        
                        this.add.rectangle(posX + CELL_SIZE / 2, posY + CELL_SIZE / 2, 
                            CELL_SIZE, CELL_SIZE, color);
                    }
                }
            }
        }
        

        update(time) {
            if (time - lastFallTime > fallSpeed) {
                if (!canMoveDown()) {
                    saveToGrid();
                    resetPiece();
                } else {
                    shapeY++; // move piece down
                }
                lastFallTime = time;
                this.scene.restart();
            }
        }
        

        handleKey(event) {
            switch (event.key) {
                case 'ArrowUp': // clockwise rotation
                    rotation = (rotation + 1) % shapes[shapeIndex].length;
                    this.scene.restart();
                    break;

                case 'Control': // counterclockwise rotation
                    rotation = (rotation - 1 + shapes[shapeIndex].length) % shapes[shapeIndex].length;
                    this.scene.restart();
                    break;

                case 'a': // 180 rotation
                    rotation = (rotation + 2) % shapes[shapeIndex].length;
                    this.scene.restart();
                    break;
        
                case 'ArrowLeft': // move left
                    if (canMoveLeft()) shapeX--;
                    this.scene.restart();
                    break;
        
                case 'ArrowRight': // move right
                    if (canMoveRight()) shapeX++;
                    this.scene.restart();
                    break;
        
                case 'ArrowDown': // move down
                    if (canMoveDown()) shapeY++;
                    this.scene.restart();
                    break;
        
                case 't': // test change piece
                    shapeIndex = (shapeIndex + 1) % shapes.length;
                    rotation = 0;
                    shapeX = 4;
                    shapeY = 0;
                    this.scene.restart();
                    break;
            }
        }
    }

    const config = {
        type: Phaser.AUTO,
        width: GRID_COLUMNS * CELL_SIZE,
        height: GRID_ROWS * CELL_SIZE,
        backgroundColor: '#000',
        scene: TetrisScene
    };
     
    const game = new Phaser.Game(config);
};
