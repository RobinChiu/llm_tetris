const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetromino shapes
const SHAPES = {
    I: [[1,1,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]],
    O: [[1,1],[1,1]],
    S: [[0,1,1],[1,1,0]],
    T: [[0,1,0],[1,1,1]],
    Z: [[1,1,0],[0,1,1]]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

let score = 0;
let level = 1;
let gameBoard = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let nextPiece = null;
let ctx = document.getElementById('game-board').getContext('2d');
let nextCtx = document.getElementById('next-piece').getContext('2d');
let gameInterval;
let isAIEnabled = false;
let aiMoveInterval;
let moveInterval;

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = Math.floor(BOARD_WIDTH/2) - Math.floor(shape[0].length/2);
        this.y = 0;
    }
}

// 核心遊戲邏輯
function createNewPiece() {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return new Piece(SHAPES[randomShape], COLORS[randomShape]);
}

function drawBoard() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 繪製現有方塊
    for(let y = 0; y < BOARD_HEIGHT; y++) {
        for(let x = 0; x < BOARD_WIDTH; x++) {
            if(gameBoard[y][x]) {
                ctx.fillStyle = gameBoard[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
            }
        }
    }
    
    // 繪製當前方塊
    if(currentPiece) {
        ctx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value) {
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE-1,
                        BLOCK_SIZE-1
                    );
                }
            });
        });
    }
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCtx.canvas.width, nextCtx.canvas.height);
    if(nextPiece) {
        nextCtx.fillStyle = nextPiece.color;
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value) {
                    nextCtx.fillRect(
                        x * BLOCK_SIZE/2 + 20,
                        y * BLOCK_SIZE/2 + 20,
                        BLOCK_SIZE/2-1,
                        BLOCK_SIZE/2-1
                    );
                }
            });
        });
    }
}

function isValidMove(piece, newX, newY, board) {
    return piece.shape.every((row, dy) => {
        return row.every((value, dx) => {
            let x = newX + dx;
            let y = newY + dy;
            return (
                value === 0 ||
                 (x >= 0 && x < BOARD_WIDTH &&
                 y >= 0 && y < BOARD_HEIGHT &&
                 !board[y][x])
            );
        }); 
    });
}

function mergePiece(board, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                board[piece.y + y][piece.x + x] = piece.color;
            }
        });
    });
}

function clearLines(board) {
    let linesCleared = 0;
    
    for(let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if(board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if(linesCleared > 0) {
        score += linesCleared * 100 * level;
        document.getElementById('score').textContent = score;
        if(score >= level * 1000) {
            level++;
            document.getElementById('level').textContent = level;
        }
    }
    return linesCleared
}

function gameLoop() {
    if(currentPiece && isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1, gameBoard)) {
        currentPiece.y++;
    } else {
        if(currentPiece) {
            mergePiece(gameBoard, currentPiece);
            clearLines(gameBoard);
        }
        currentPiece = nextPiece || createNewPiece();
        nextPiece = createNewPiece();
        drawNextPiece();
        
        if(!isValidMove(currentPiece, currentPiece.x, currentPiece.y, gameBoard)) {
            alert(`遊戲結束! 得分: ${score}`);
            resetGame();
        }
    }
    drawBoard();
}

function resetGame() {
    gameBoard = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    setTimer()
}

function rotatePiece(shape) {
    return shape[0].map((_, i) => 
        shape.map(row => row[i]).reverse()
    );
}

function setTimer() {
    if(moveInterval)
        clearInterval(moveInterval)
    if(aiMoveInterval)
        clearInterval(aiMoveInterval)
    if (isAIEnabled) {
        aiMoveInterval = setInterval(executeAIMove, 1000 / level);
    } else {
        moveInterval = setInterval(gameLoop, 1000 / level);
    }
}

// 手動控制
document.addEventListener('keydown', event => {
    if(!currentPiece || isAIEnabled) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            if(isValidMove(currentPiece, currentPiece.x - 1, currentPiece.y, gameBoard)) {
                currentPiece.x--;
                drawBoard();
            }
            break;
        case 'ArrowRight':
            if(isValidMove(currentPiece, currentPiece.x + 1, currentPiece.y, gameBoard)) {
                currentPiece.x++;
                drawBoard();
            }
            break;
        case 'ArrowDown':
            if(isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1, gameBoard)) {
                currentPiece.y++;
                drawBoard();
            }
            break;
        case 'ArrowUp':
            const rotated = currentPiece.shape[0].map((_, i) =>
                currentPiece.shape.map(row => row[i]).reverse()
            );
            const originalShape = currentPiece.shape;
            currentPiece.shape = rotated;
            if(!isValidMove(currentPiece, currentPiece.x, currentPiece.y, gameBoard)) {
                currentPiece.shape = originalShape;
            }
            drawBoard();
            break;
        case ' ':
            while(isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1, gameBoard)) {
                currentPiece.y++;
            }
            gameLoop();
            break;
    }
});

// 初始化遊戲
nextPiece = createNewPiece();
setTimer()

module.exports = { 
    createNewPiece, 
    isValidMove, 
    mergePiece, 
    clearLines, 
    rotatePiece 
}
