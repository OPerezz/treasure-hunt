const { CorridaMatematica } = window;

// --- NOVAS CONSTANTES DE NÍVEIS ---

const miniGameCorrida = document.getElementById("modal-minigame");
const miniGameEnigma = document.getElementById("modal-minigame2");
const GamePrincipal = document.getElementById("game-principal");
const papiroFinish = document.getElementById("modal-finish");
const videoPath = "assets/img/video-kraken.mp4"
let videoKraken = `
            <video id="video-kraken" no-controls muted  style="width:97vw; height: auto; z-index: 1000; aspect-ratio: 16/9; position: absolute; top:50%; left:50%; transform: translate(-50%, -50%) "> 
                <source src="${videoPath}"> 
            </video>

`


window.GamePrincipal = GamePrincipal; //variável global para o GamePrincipal

const START_POS = { col: 0, row: 6 };
const FINAL_TREASURE_POS = { col: 9, row: 3 };

const LEVEL_PATHS = [
    ['RIGHT', 'RIGHT', 'UP', 'RIGHT', 'RIGHT', 'RIGHT'],

    ['UP', 'UP', 'LEFT', 'UP', 'LEFT', 'LEFT'],

    ['RIGHT', 'UP', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP']
];

const MINI_GAME_UNLOCK_POSITIONS = [
    { col: 5, row: 5 },
    { col: 2, row: 2 }
];

const KRAKEN_POSITIONS = [{ col: 7, row: 0 }];
const ISLAND_POSITIONS = [{ col: 1, row: 1 }, { col: 8, row: 5 }];
const DOLPHIN_POSITIONS = [{ col: 4, row: 0 }, { col: 9, row: 6 }];


let currentLevel = 0;
let pathCoordinates = [];
let userSequence = [];
let currentShipPos = { ...START_POS };
let isGameActive = true;

const gameBoard = document.getElementById('game-board');
const commandSequenceDiv = document.getElementById('command-sequence');
const messageDiv = document.getElementById('mensagem-jogo');


const GRID_COLS = 10;
const GRID_ROWS = 8;

// ----------------------------------------------------------------------
// FUNÇÕES UTILITÁRIAS
// ----------------------------------------------------------------------

function getCellIndex(col, row) {
    return row * GRID_COLS + col;
}

function getCellElement(col, row) {
    const index = getCellIndex(col, row);
    return (index >= 0 && index < GRID_COLS * GRID_ROWS) ? gameBoard.children[index] : null;
}

function generatePathCoordinates() {
    pathCoordinates = [];

    let current = { ...currentShipPos };
    pathCoordinates.push({ ...current });

    const moveMap = {
        'RIGHT': { col: 1, row: 0 },
        'LEFT': { col: -1, row: 0 },
        'UP': { col: 0, row: -1 },
        'DOWN': { col: 0, row: 1 }
    };

    const currentPath = LEVEL_PATHS[currentLevel];

    currentPath.forEach(move => {
        const delta = moveMap[move];
        current.col += delta.col;
        current.row += delta.row;
        pathCoordinates.push({ col: current.col, row: current.row });
    });
}

// ----------------------------------------------------------------------
// FUNÇÕES PRINCIPAIS DO JOGO
// ----------------------------------------------------------------------

function drawGameBoard() {
    gameBoard.innerHTML = '';

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.col = col;
            cell.dataset.row = row;

            const onPath = pathCoordinates.some(coord => coord.col === col && coord.row === row);
            if (onPath) {
                cell.classList.add('path');
            }

            const miniGameSpotIndex = MINI_GAME_UNLOCK_POSITIONS.findIndex(pos =>
                pos.col === col && pos.row === row
            );

            if (miniGameSpotIndex !== -1) {
                if (miniGameSpotIndex === currentLevel) {
                    cell.classList.add('mini-game-spot');
                    cell.innerHTML = '✕';
                }
            }

            if (KRAKEN_POSITIONS.some(pos => pos.col === col && pos.row === row)) {
                cell.innerHTML = '🦑';
            } else if (ISLAND_POSITIONS.some(pos => pos.col === col && pos.row === row)) {
                cell.innerHTML = '🏝️';
            } else if (DOLPHIN_POSITIONS.some(pos => pos.col === col && pos.row === row)) {
                cell.innerHTML = '🐬';
            }

            const isFinalLevel = currentLevel === LEVEL_PATHS.length - 1;
            if (isFinalLevel && col === FINAL_TREASURE_POS.col && row === FINAL_TREASURE_POS.row) {
                cell.classList.add('treasure');
                cell.innerHTML = '👑';
                cell.classList.remove('mini-game-spot');
            }
            gameBoard.appendChild(cell);

        }

    }

    placeShip(currentShipPos.col, currentShipPos.row);
}



function placeShip(newCol, newRow) {
    const oldShipCell = getCellElement(currentShipPos.col, currentShipPos.row);
    if (oldShipCell) {
        oldShipCell.classList.remove('ship');

        const emojiMap = {
            'treasure': '👑',
            'mini-game-spot': '✕',
            'kraken': '🦑',
            'island': '🏝️',
            'dolphin': '🐬'
        };

        let content = '';

        if (oldShipCell.classList.contains('treasure')) {
            content = emojiMap.treasure;
        } else if (oldShipCell.classList.contains('mini-game-spot')) {
            content = emojiMap['mini-game-spot'];
        } else if (KRAKEN_POSITIONS.some(pos => pos.col == currentShipPos.col && pos.row == currentShipPos.row)) {
            content = emojiMap.kraken;
        } else if (ISLAND_POSITIONS.some(pos => pos.col == currentShipPos.col && pos.row == currentShipPos.row)) {
            content = emojiMap.island;
        } else if (DOLPHIN_POSITIONS.some(pos => pos.col == currentShipPos.col && pos.row == currentShipPos.row)) {
            content = emojiMap.dolphin;
        }

        oldShipCell.innerHTML = content;
    }

    currentShipPos.col = newCol;
    currentShipPos.row = newRow;

    const newShipCell = getCellElement(newCol, newRow);
    if (newShipCell) {
        newShipCell.classList.add('ship');
        newShipCell.innerHTML = '⛵';
    }
}


function addMovementCard(direction) {
    if (!isGameActive) return;

    userSequence.push(direction);

    const cardOption = document.querySelector(`.movement-card[data-direction="${direction}"]`);
    const cardClone = cardOption.cloneNode(true);

    cardClone.addEventListener('click', clearSequence);

    commandSequenceDiv.appendChild(cardClone);
}

function removeCardFromSequence(cardElement, direction) {
    clearSequence();
    alert("Sequência Limpa. Tente novamente!");
}

function clearSequence() {
    userSequence = [];
    commandSequenceDiv.innerHTML = '';
}

// ----------------------------------------------------------------------
// LÓGICA DE NÍVEIS E MINI-GAME
// ----------------------------------------------------------------------

function loadMiniGameScript(levelIndex) {
    isGameActive = false;
    // gameBoard.style.opacity = 0.5;

    alert(`MINI-GAME DESBLOQUEADO! Jogue o Mini-Game ${levelIndex + 1} para desbloquear a próxima rota!`);
    if (currentLevel == 0) {
        GamePrincipal.classList.add("hidden")
        miniGameCorrida.classList.remove("hidden");

        const corrida = new CorridaMatematica();
        corrida.startGame();

    } else if (currentLevel == 1) {
        GamePrincipal.classList.add("hidden");
        miniGameEnigma.classList.remove("hidden");

        const enigma = new miniGameEnigma();
        enigma.startGame();
    }
}

window.handleMiniGameComplete = function () {
    const oldScript = document.getElementById('minigame-script');
    if (oldScript) {
        oldScript.remove();
    }

    gameBoard.style.opacity = 1;

    alert("MINI-GAME CONCLUÍDO! Nova rota desbloqueada!");
    advanceLevel();
};

function startMiniGame() {
    currentShipPos.col = MINI_GAME_UNLOCK_POSITIONS[currentLevel].col;
    currentShipPos.row = MINI_GAME_UNLOCK_POSITIONS[currentLevel].row;

    loadMiniGameScript(currentLevel);
}

function advanceLevel() {
    currentLevel++;
    resetGame(false);
}

function runSequence() {
    if (!isGameActive || userSequence.length === 0) {
        alert('Por favor, adicione comandos antes de navegar.');
        return;
    }

    isGameActive = false;

    const requiredPath = LEVEL_PATHS[currentLevel];
    let tempShipPos = { ...currentShipPos };
    const moveMap = {
        'RIGHT': { col: 1, row: 0 },
        'LEFT': { col: -1, row: 0 },
        'UP': { col: 0, row: -1 },
        'DOWN': { col: 0, row: 1 }
    };

    function executeMove(moveIndex) {

        if (moveIndex >= userSequence.length) {


            if (userSequence.length < requiredPath.length) {
                handleGameOver(false, false, 'incomplete_path');
                return;
            }

            const isFinalLevel = currentLevel === LEVEL_PATHS.length - 1;

            if (isFinalLevel) {
                if (tempShipPos.col === FINAL_TREASURE_POS.col && tempShipPos.row === FINAL_TREASURE_POS.row) {
                    handleGameOver(true, true);
                } else {
                    handleGameOver(false, false, 'wrong_position');
                }
            } else {
                const expectedUnlockPos = MINI_GAME_UNLOCK_POSITIONS[currentLevel];
                if (tempShipPos.col === expectedUnlockPos.col && tempShipPos.row === expectedUnlockPos.row) {

                    currentShipPos = { ...tempShipPos };
                    startMiniGame();
                } else {
                    handleGameOver(false, false, 'wrong_position');
                }
            }
            return;
        }

        const move = userSequence[moveIndex];
        const requiredMove = requiredPath[moveIndex];
        const delta = moveMap[move];


        if (move !== requiredMove) {

            tempShipPos.col += delta.col;
            tempShipPos.row += delta.row;
            placeShip(tempShipPos.col, tempShipPos.row);

            setTimeout(() => handleGameOver(false, false, 'wrong_move'), 500);
            return;
        }

        tempShipPos.col += delta.col;
        tempShipPos.row += delta.row;
        placeShip(tempShipPos.col, tempShipPos.row);

        setTimeout(() => executeMove(moveIndex + 1), 500);
    }
    executeMove(0);
}


function handleGameOver(isWin, isFinalGame, reason = 'unknown') {
    isGameActive = false;

    if (isWin) {
        GamePrincipal.classList.add("hidden")
        papiroFinish.classList.remove("hidden")
        const videoBau = document.getElementById("video")
        const contentFinish = document.getElementById("finish-content")
        papiroFinish.style.overflow = "hidden"
        videoBau.play();

        setTimeout(() => {
            videoBau.classList.add("hidden")
            papiroFinish.style.overflow = "scroll"
            contentFinish.classList.remove("hidden")
        }, 8000);

    } else {
        let msg = '';
        if (reason === 'incomplete_path') {
            msg = "⚠️ Caminho Incompleto! Infelizmente, o vento já não faz mais nosso navio andar. Adicione mais comandos!";
        } else if (reason === 'wrong_move') {
            GamePrincipal.innerHTML += videoKraken;
            const videoWrong = document.getElementById('video-kraken');
            videoWrong.play();
            
                msg = "💀 Caiu em Águas Profundas! O Kraken detruiu seu navio. Tente o Nível Novamente!";

            setTimeout(() => {
                videoWrong.remove();
            }, 5000)

        } else {
            msg = "💀 Falha na Navegação! O seu Navio encalhou. Tente o Nível Novamente!";

        }

        alert(msg);


        setTimeout(() => {
            if (isFinalGame) {
                resetGame(true);
            } else {
                if (currentLevel === 0) {
                    currentShipPos = { ...START_POS };
                } else {
                    currentShipPos = { ...MINI_GAME_UNLOCK_POSITIONS[currentLevel - 1] };
                }
                resetGame(false);
            }
        }, 500);
    }
}

function showMessage(msg, type = 'info') {
    if (!messageDiv) return;

    messageDiv.textContent = msg;
    messageDiv.className = '';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
    } else if (type === 'warning') {
        messageDiv.style.backgroundColor = '#fff3cd';
        messageDiv.style.color = '#856404';
    } else {
        messageDiv.style.backgroundColor = '#fffacd';
        messageDiv.style.color = '#333';
    }
}

function resetGame(fullReset = true) {
    clearSequence();

    if (fullReset) {
        currentLevel = 0;
        currentShipPos = { ...START_POS };
    }

    generatePathCoordinates();
    drawGameBoard();
    isGameActive = true;

    let msg = fullReset
        ? `Nível 1 ativado! Inicie a sua rota de (${START_POS.col}, ${START_POS.row}).`
        : `Nível ${currentLevel + 1} ativado! Inicie a nova rota de (${currentShipPos.col}, ${currentShipPos.row}).`;

    showMessage(msg, 'info');
}

function setupEventListeners() {
    document.querySelectorAll('.movement-card').forEach(button => {
        button.addEventListener('click', () => {
            const direction = button.getAttribute('data-direction');
            addMovementCard(direction);
        });
    });

    document.getElementById('run-button').addEventListener('click', runSequence);
    document.getElementById('clear-button').addEventListener('click', clearSequence);
    document.getElementById('reset-button').addEventListener('click', () => resetGame(true));
}

function initGame() {
    setupEventListeners();
    resetGame(true);
}

initGame();