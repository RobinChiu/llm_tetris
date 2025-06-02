import { 
    isValidMove, 
    mergePiece, 
    rotatePiece, 
    gameBoard, 
    currentPiece, 
    BOARD_WIDTH, 
    BOARD_HEIGHT,
    getAIEnabled,
    setAIEnabled,
    Piece,
    drawBoard,
    gameLoop,
    initTimer
} from './script.js';

// AI 配置參數
const HEURISTIC_WEIGHTS = {
    landingHeight: 0.5,
    rowsCleared: 0.7,
    holes: -0.9,
    bumpiness: -0.2
};

// 輔助函數
function calculateHoles(board) {
    let holes = 0;
    for (let x = 0; x < BOARD_WIDTH; x++) {
        let blockFound = false;
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            if (board[y][x]) {
                blockFound = true;
            } else if (blockFound) {
                holes++;
            }
        }
    }
    return holes;
}

function calculateBumpiness(board) {    
    let bumpiness = 0;
    let prevHeight = 0;
    for (let x = 0; x < BOARD_WIDTH; x++) {
        let height = 0;
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            if (board[y][x]) {
                height = BOARD_HEIGHT - y;
                break;
            }
        }
        if (x > 0) {
            bumpiness += Math.abs(height - prevHeight);
        }
        prevHeight = height;
    }
    return bumpiness;
}

// 核心AI邏輯
function evaluatePosition(piece, board) {
    const simulatedBoard = board.map(row => [...row]);
    let lowestY = 0;
    
    while (isValidMove(piece, piece.x, lowestY + 1, gameBoard)) {
        lowestY++;
    }
    
    piece.y = lowestY;
    mergePiece(simulatedBoard, piece);
    
    const rowsCleared = simulatedBoard.reduce((count, row) => 
        row.every(cell => cell !== 0) ? count + 1 : count, 0);
        
    return (
        piece.y * HEURISTIC_WEIGHTS.landingHeight +
        rowsCleared * HEURISTIC_WEIGHTS.rowsCleared +
        calculateHoles(simulatedBoard) * HEURISTIC_WEIGHTS.holes +
        calculateBumpiness(simulatedBoard) * HEURISTIC_WEIGHTS.bumpiness
    );
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestRotation = 0;
    let bestX = 0;
    const originalPiece = {...currentPiece};
    
    for (let rotation = 0; rotation < 4; rotation++) {
        const testPiece = new Piece(currentPiece.shape, currentPiece.color);
        for (let r = 0; r < rotation; r++) {
            testPiece.shape = rotatePiece(testPiece.shape);
        }
        
        const minX = -Math.floor(testPiece.shape[0].length/2);
        const maxX = BOARD_WIDTH - Math.floor(testPiece.shape[0].length/2);
        
        for (let x = minX; x < maxX; x++) {
            testPiece.x = x;
            testPiece.y = 0;
            if (isValidMove(testPiece, testPiece.x, testPiece.y, gameBoard)) {
                const score = evaluatePosition(testPiece, gameBoard);
                if (score > bestScore) {
                    bestScore = score;
                    bestRotation = rotation;
                    bestX = x;
                }
            }
        }
    }
    
    return {bestRotation, bestX};
}

function executeAIMove() {
    if (!getAIEnabled() || !currentPiece) return;
    
    const {bestRotation, bestX} = findBestMove();
    
    for (let i = 0; i < bestRotation; i++) {
        currentPiece.shape = rotatePiece(currentPiece.shape);
    }
    
    currentPiece.x = bestX;
    
    while (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1, gameBoard)) {
        currentPiece.y++;
    }
    drawBoard();
    gameLoop();
}


export function setupButton(document) {
    // AI 控制介面
    document.getElementById('ai-toggle').addEventListener('click', () => {
        setAIEnabled(!getAIEnabled());
        document.getElementById('ai-status').textContent = getAIEnabled() ? '(已啟用)' : '(已停用)';
        // 初始化 AI
        initTimer(executeAIMove);
    });
}


