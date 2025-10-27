

// --- NOVAS CONSTANTES DE NÍVEIS ---
const START_POS = { col: 0, row: 6 };
const FINAL_TREASURE_POS = { col: 9, row: 2 };

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
// FUNÇÕES UTILITÁRIAS (mantidas)
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
// FUNÇÕES PRINCIPAIS DO JOGO (mantidas)
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

            const isMiniGameSpot = MINI_GAME_UNLOCK_POSITIONS.some((pos, index) =>
                col === pos.col && row === pos.row
            );

            if (isMiniGameSpot) {
                cell.classList.add('mini-game-spot');
                cell.innerHTML = '✕';
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
// LÓGICA DE NÍVEIS E MINI-GAME (mantidas)
// ----------------------------------------------------------------------

function loadMiniGameScript(levelIndex) {
    isGameActive = false;
    gameBoard.style.opacity = 0.5;

    alert(`MINI-GAME DESBLOQUEADO! Jogue o Mini-Game ${levelIndex + 1} para desbloquear a próxima rota!`);

    const script = document.createElement('script');
    script.src = `assets/js/minigame_${levelIndex + 1}.js`;
    script.id = 'minigame-script';

    document.body.appendChild(script);
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


/**
 * 💥 NOVO: Função para executar a sequência de movimentos de forma sequencial.
 * Assim, a execução para assim que um erro é detetado.
 */
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

    // 🧠 Lógica Sequencial: Usa uma função recursiva ou loop para processar 
    // um movimento por vez, com atraso.
    function executeMove(moveIndex) {

        // 1. Condição de Paragem: Se todos os comandos foram executados
        if (moveIndex >= userSequence.length) {

            // 2. Verifica se a sequência é muito curta (todos os movimentos foram corretos)
            if (userSequence.length < requiredPath.length) {
                handleGameOver(false, false, 'incomplete_path');
                return;
            }

            // 3. Verifica a posição final (se a sequência é do tamanho certo)
            const isFinalLevel = currentLevel === LEVEL_PATHS.length - 1;

            if (isFinalLevel) {
                if (tempShipPos.col === FINAL_TREASURE_POS.col && tempShipPos.row === FINAL_TREASURE_POS.row) {
                    handleGameOver(true, true); // Vitória Final
                } else {
                    handleGameOver(false, false, 'wrong_position'); // Posição Final Errada
                }
            } else { // Não é o nível final (chegou ao ponto de mini-game?)
                const expectedUnlockPos = MINI_GAME_UNLOCK_POSITIONS[currentLevel];
                if (tempShipPos.col === expectedUnlockPos.col && tempShipPos.row === expectedUnlockPos.row) {
                    // Confirma a posição para o próximo nível
                    currentShipPos = { ...tempShipPos };
                    startMiniGame();
                } else {
                    handleGameOver(false, false, 'wrong_position'); // Posição Mini-Game Errada
                }
            }
            return; // Fim da execução
        }

        const move = userSequence[moveIndex];
        const requiredMove = requiredPath[moveIndex];
        const delta = moveMap[move];

        // 4. Validação do Movimento
        if (move !== requiredMove) {
            // 🛑 ERRO: Move apenas uma última vez (para a posição de erro) e para a execução.
            tempShipPos.col += delta.col;
            tempShipPos.row += delta.row;
            placeShip(tempShipPos.col, tempShipPos.row);

            // Dá o alerta e reinicia o nível após o atraso.
            setTimeout(() => handleGameOver(false, false, 'wrong_move'), 500);
            return; // 💥 Para a recursão/execução aqui!
        }

        // 5. Movimento Correto: Atualiza a posição e o visual
        tempShipPos.col += delta.col;
        tempShipPos.row += delta.row;
        placeShip(tempShipPos.col, tempShipPos.row);

        // 6. Próxima Etapa: Agenda o próximo movimento com um atraso
        setTimeout(() => executeMove(moveIndex + 1), 500);
    }

    // Inicia a sequência de movimentos
    executeMove(0);
}


function handleGameOver(isWin, isFinalGame, reason = 'unknown') {
    isGameActive = false;

    if (isWin) {
        alert("🎉 Tesouro Encontrado! Você é um Mestre Navegador!");
    } else {
        let msg = '';
        if (reason === 'incomplete_path') {
            msg = "⚠️ Caminho Incompleto! Infelizmente, o vento já não faz mais nosso navio andar. Adicione mais comandos!";
        } else if (reason === 'wrong_move') {
            msg = "💀 Caiu em Águas Rasas! O seu Navio encalhou. Tente o Nível Novamente!";
        } else {
            msg = "💀 Falha na Navegação! O seu Navio encalhou. Tente o Nível Novamente!";
        }

        alert(msg);

        setTimeout(() => {
            if (isFinalGame) {
                resetGame(true);
            } else {
                // Reverte para a posição inicial do nível
                if (currentLevel === 0) {
                    currentShipPos = { ...START_POS };
                } else {
                    currentShipPos = { ...MINI_GAME_UNLOCK_POSITIONS[currentLevel - 1] };
                }
                resetGame(false); // Reset de nível
            }
        }, 3000);
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