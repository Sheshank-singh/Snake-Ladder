// Game configuration
const config = {
    boardSize: 10,
    totalCells: 100,
    playerStartPos: 1,
    playerEndPos: 100,
    diceSides: 6,
    animationDuration: 500
};

// Non-biased snakes and ladders
const snakes = {
    99: 41,
    95: 77,
    89: 53,
    66: 45,
    54: 31,
    43: 18,
    40: 3,
    27: 5
};

const ladders = {
    4: 25,
    13: 46,
    33: 49,
    42: 63,
    50: 69,
    62: 81,
    74: 92
};

// Game state
let gameState = {
    playerPosition: config.playerStartPos,
    isRolling: false,
    gameOver: false
};

// DOM elements
const boardElement = document.getElementById('board');
const playerElement = document.getElementById('player');
const diceElement = document.getElementById('dice');
const statusElement = document.getElementById('status');

// Initialize the game board
function initializeBoard() {
    boardElement.innerHTML = '';
    
    // Create cells in zigzag pattern
    for (let row = config.boardSize - 1; row >= 0; row--) {
        const isReverse = row % 2 !== (config.boardSize % 2);
        
        for (let col = 0; col < config.boardSize; col++) {
            const cellNumber = isReverse 
                ? (row + 1) * config.boardSize - col 
                : row * config.boardSize + col + 1;
            
            const cell = document.createElement('div');
            cell.className = 'cell';
            // cell.textContent = cellNumber;
            cell.dataset.number = cellNumber;
            
            // Add snake or ladder indicator
            if (snakes[cellNumber]) {
                cell.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
            } else if (ladders[cellNumber]) {
                cell.style.backgroundColor = 'rgba(78, 205, 196, 0.2)';
            }
            
            boardElement.appendChild(cell);
        }
    }
    
    // Draw snakes and ladders
    drawSnakesAndLadders();
    
    // Position player at start
    updatePlayerPosition(config.playerStartPos);
}

// Draw snakes and ladders on the board
function drawSnakesAndLadders() {
    // Clear existing snakes and ladders
    document.querySelectorAll('.snake, .ladder').forEach(el => el.remove());
    
    // Draw snakes
    Object.entries(snakes).forEach(([start, end]) => {
        drawConnection(parseInt(start), parseInt(end), 'snake');
    });
    
    // Draw ladders
    Object.entries(ladders).forEach(([start, end]) => {
        drawConnection(parseInt(start), parseInt(end), 'ladder');
    });
}

// Draw a connection (snake or ladder) between two cells
function drawConnection(start, end, type) {
    const startCell = document.querySelector(`.cell[data-number="${start}"]`);
    const endCell = document.querySelector(`.cell[data-number="${end}"]`);
    
    if (!startCell || !endCell) return;
    
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();
    const boardRect = boardElement.getBoundingClientRect();
    
    const startX = startRect.left + startRect.width / 2 - boardRect.left;
    const startY = startRect.top + startRect.height / 2 - boardRect.top;
    const endX = endRect.left + endRect.width / 2 - boardRect.left;
    const endY = endRect.top + endRect.height / 2 - boardRect.top;
    
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    
    const connection = document.createElement('div');
    connection.className = type;
    connection.style.width = `${length}px`;
    connection.style.height = '8px';
    connection.style.left = `${startX}px`;
    connection.style.top = `${startY}px`;
    connection.style.transformOrigin = '0 0';
    connection.style.transform = `rotate(${angle}deg)`;
    
    if (type === 'snake') {
        connection.style.backgroundColor = 'transparent';
        connection.style.borderTop = '4px dashed var(--snake-color)';
    } else {
        connection.style.backgroundColor = 'var(--ladder-color)';
        // Add ladder rungs
        for (let i = 0.1; i < 1; i += 0.1) {
            const rung = document.createElement('div');
            rung.style.position = 'absolute';
            rung.style.width = '20px';
            rung.style.height = '4px';
            rung.style.backgroundColor = 'white';
            rung.style.left = `${i * 100}%`;
            rung.style.top = '2px';
            rung.style.transform = 'translateX(-10px)';
            connection.appendChild(rung);
        }
    }
    
    boardElement.appendChild(connection);
}

// Update player position with animation
function updatePlayerPosition(newPosition) {
    const cell = document.querySelector(`.cell[data-number="${newPosition}"]`);
    if (!cell) return;
    
    const cellRect = cell.getBoundingClientRect();
    const boardRect = boardElement.getBoundingClientRect();
    
    const x = cellRect.left + cellRect.width / 2 - boardRect.left - 10;
    const y = cellRect.top + cellRect.height / 2 - boardRect.top - 10;
    
    playerElement.style.left = `${x}px`;
    playerElement.style.top = `${y}px`;
    
    gameState.playerPosition = newPosition;
    
    // Check for win condition
    if (newPosition === config.playerEndPos) {
        gameState.gameOver = true;
        statusElement.textContent = "Congratulations! You've won the game!";
        diceElement.style.display = 'none';
        return;
    }
    
    // Check for snake or ladder
    if (snakes[newPosition]) {
        setTimeout(() => {
            statusElement.textContent = `Oops! Snake bite! Sliding down to ${snakes[newPosition]}`;
            updatePlayerPosition(snakes[newPosition]);
        }, config.animationDuration);
    } else if (ladders[newPosition]) {
        setTimeout(() => {
            statusElement.textContent = `Yay! Ladder climb! Moving up to ${ladders[newPosition]}`;
            updatePlayerPosition(ladders[newPosition]);
        }, config.animationDuration);
    } else {
        statusElement.textContent = `You're now at position ${newPosition}. Click the dice to continue.`;
    }
}

// Roll the dice
function rollDice() {
    if (gameState.isRolling || gameState.gameOver) return;
    
    gameState.isRolling = true;
    statusElement.textContent = "Rolling the dice...";
    
    // Animate dice
    let rolls = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
        const randomValue = Math.floor(Math.random() * config.diceSides) + 1;
        diceElement.textContent = randomValue;
        rolls++;
        
        if (rolls >= maxRolls) {
            clearInterval(rollInterval);
            const finalValue = Math.floor(Math.random() * config.diceSides) + 1;
            diceElement.textContent = finalValue;
            movePlayer(finalValue);
        }
    }, 100);
}

// Move player based on dice roll
function movePlayer(steps) {
    const newPosition = gameState.playerPosition + steps;
    
    if (newPosition > config.totalCells) {
        statusElement.textContent = `You need exactly ${config.totalCells - gameState.playerPosition} to win! Try again.`;
        gameState.isRolling = false;
        return;
    }
    
    statusElement.textContent = `Moving to position ${newPosition}...`;
    updatePlayerPosition(newPosition);
    gameState.isRolling = false;
}

// Event listeners
diceElement.addEventListener('click', rollDice);

// Initialize the game
initializeBoard();