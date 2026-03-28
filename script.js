let board = [];
let score = 0;
const scoreElement = document.getElementById('score');
const tileContainer = document.getElementById('tile-container');
const gameOverScreen = document.getElementById('game-over');

// Initialize Game
function initGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    score = 0;
    scoreElement.innerText = score;
    gameOverScreen.classList.add('hidden');
    addRandomTile();
    addRandomTile();
    updateDOM();
}

function addRandomTile() {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) emptyCells.push({r, c});
        }
    }
    if (emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    }
}

// Core Logic: Slide a single row to the left
function slide(row) {
    let arr = row.filter(val => val); // Remove zeros
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i+1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i+1] = 0;
        }
    }
    arr = arr.filter(val => val); // Remove zeros again after merge
    while (arr.length < 4) arr.push(0); // Pad with zeros
    return arr;
}

// Matrix Rotations to reuse the slide-left logic for all directions
function rotateLeft(matrix) {
    let result = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) result[3-c][r] = matrix[r][c];
    }
    return result;
}

function rotateRight(matrix) {
    let result = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) result[c][3-r] = matrix[r][c];
    }
    return result;
}

function move(direction) {
    let oldBoard = JSON.stringify(board);
    
    if (direction === 'Left') {
        for (let r = 0; r < 4; r++) board[r] = slide(board[r]);
    } else if (direction === 'Right') {
        board = rotateRight(rotateRight(board));
        for (let r = 0; r < 4; r++) board[r] = slide(board[r]);
        board = rotateRight(rotateRight(board));
    } else if (direction === 'Up') {
        board = rotateLeft(board);
        for (let r = 0; r < 4; r++) board[r] = slide(board[r]);
        board = rotateRight(board);
    } else if (direction === 'Down') {
        board = rotateRight(board);
        for (let r = 0; r < 4; r++) board[r] = slide(board[r]);
        board = rotateLeft(board);
    }

    if (oldBoard !== JSON.stringify(board)) {
        addRandomTile();
        updateDOM();
        checkGameOver();
    }
}

function updateDOM() {
    tileContainer.innerHTML = '';
    scoreElement.innerText = score;
    
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] !== 0) {
                let tile = document.createElement('div');
                let val = board[r][c];
                tile.classList.add('tile', `tile-${val}`);
                tile.innerText = val;
                
                // Calculate position based on grid gap (10px) and cell size
                tile.style.transform = `translate(calc(${c * 100}% + ${c * 10}px), calc(${r * 100}% + ${r * 10}px))`;
                tileContainer.appendChild(tile);
            }
        }
    }
}

function checkGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) return;
            if (c < 3 && board[r][c] === board[r][c+1]) return;
            if (r < 3 && board[r][c] === board[r+1][c]) return;
        }
    }
    gameOverScreen.classList.remove('hidden');
}

// Controls: Keyboard
document.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        move(e.key.replace('Arrow', ''));
    }
});

// Controls: Touch Swipes
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: false});

document.addEventListener('touchend', e => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
});

function handleSwipe(startX, startY, endX, endY) {
    let dx = endX - startX;
    let dy = endY - startY;
    let absDx = Math.abs(dx);
    let absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) { // Minimum swipe distance
        if (absDx > absDy) {
            move(dx > 0 ? 'Right' : 'Left');
        } else {
            move(dy > 0 ? 'Down' : 'Up');
        }
    }
}

document.getElementById('restart-btn').addEventListener('click', initGame);

// Start
initGame();
