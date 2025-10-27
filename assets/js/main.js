// O TABULEIRO AGORA É 10x7 (GRID_COLS=10, GRID_ROWS=7)

// --- NOVAS CONSTANTES DE NÍVEIS ---
const START_POS = { col: 0, row: 6 }; // Posição inicial do navio
const FINAL_TREASURE_POS = { col: 9, row: 2 }; // Posição final (Tesouro)

// 3 NÍVEIS DE CAMINHO
const LEVEL_PATHS = [
    // Nível 1: De (0, 6) a (5, 5) - 6 passos
    ['RIGHT', 'RIGHT', 'UP', 'RIGHT', 'RIGHT', 'RIGHT'], 
    
    // Nível 2: De (5, 5) a (2, 2) - 6 passos
    ['UP', 'UP', 'LEFT', 'UP', 'LEFT', 'LEFT'], 
    
    // Nível 3 (Final): De (2, 2) a (9, 2) - 12 passos
    ['RIGHT', 'UP', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP'] 
];

const MINI_GAME_UNLOCK_POSITIONS = [
    { col: 5, row: 5}, // Fim Nível 1
    { col: 2, row: 2 }  // Fim Nível 2
];

// --- NOVOS ELEMENTOS DO MAPA ---
const KRAKEN_POSITIONS = [{ col: 7, row: 0 }];
const ISLAND_POSITIONS = [{ col: 1, row: 1 }, { col: 8, row: 5 }];
const DOLPHIN_POSITIONS = [{ col: 4, row: 0 }, { col: 9, row: 6 }];


// --- VARIÁVEIS DE ESTADO ---
let currentLevel = 0; 
let pathCoordinates = [];
let userSequence = [];
let currentShipPos = { ...START_POS }; 
let isGameActive = true;

const gameBoard = document.getElementById('game-board');
const commandSequenceDiv = document.getElementById('command-sequence');
// Mantemos a messageDiv para mensagens não-alert
const messageDiv = document.getElementById('mensagem-jogo');


const GRID_COLS = 10;
const GRID_ROWS = 7; 

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
// FUNÇÕES PRINCIPAIS DO JOGO (DESENHO E MOVIMENTO)
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

            // Marca Posições de Mini-Game (Chaves)
            const isMiniGameSpot = MINI_GAME_UNLOCK_POSITIONS.some((pos, index) => 
                col === pos.col && row === pos.row
            );

            if (isMiniGameSpot) {
                cell.classList.add('mini-game-spot'); 
                cell.innerHTML = '🔑'; 
            }
            
            // Marca Elementos Visuais
            if (KRAKEN_POSITIONS.some(pos => pos.col === col && pos.row === row)) {
                cell.innerHTML = '🦑'; // Kraken
            } else if (ISLAND_POSITIONS.some(pos => pos.col === col && pos.row === row)) {
                cell.innerHTML = '🏝️'; // Ilha
            } else if (DOLPHIN_POSITIONS.some(pos => pos.col === col && pos.row === row)) {
                cell.innerHTML = '🐬'; // Golfinho
            }

            // Só marca o Tesouro se for o ÚLTIMO NÍVEL
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
            'mini-game-spot': '🔑',
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

/**
 * 🟢 NOVO: Função para carregar o script do mini-game.
 * @param {number} levelIndex - Índice do nível que acabou de ser concluído.
 */
function loadMiniGameScript(levelIndex) {
    // 1. Desativa a interface do jogo (opcional, podes ocultar com CSS também)
    isGameActive = false; 
    gameBoard.style.opacity = 0.5; // Escurece o mapa

    // 2. Avisa o jogador (usando alert, conforme solicitado)
    alert(`MINI-GAME DESBLOQUEADO! Jogue o Mini-Game ${levelIndex + 1} para desbloquear a próxima rota!`);

    // 3. Carrega o script do mini-game (usando um placeholder para o caminho real)
    const script = document.createElement('script');
    script.src = `assets/js/minigame_${levelIndex + 1}.js`; 
    script.id = 'minigame-script';

    // 4. Adiciona ao corpo. O script do mini-game deve ter uma função que chama handleMiniGameComplete()
    document.body.appendChild(script);
}

/**
 * 🟢 NOVO: Função chamada pelo script do Mini-Game quando ele é concluído com sucesso.
 */
window.handleMiniGameComplete = function() {
    // Remove o script do mini-game do DOM, se existir (limpeza)
    const oldScript = document.getElementById('minigame-script');
    if (oldScript) {
        oldScript.remove();
    }
    
    // Retorna a opacidade do mapa (simulando que o mini-game acabou)
    gameBoard.style.opacity = 1;
    
    alert("MINI-GAME CONCLUÍDO! Nova rota desbloqueada!");
    advanceLevel(); 
};

function startMiniGame() {
    // Confirma a posição do navio antes de iniciar o mini-game
    currentShipPos.col = MINI_GAME_UNLOCK_POSITIONS[currentLevel].col;
    currentShipPos.row = MINI_GAME_UNLOCK_POSITIONS[currentLevel].row;
    
    loadMiniGameScript(currentLevel); // Passa o nível atual (0 ou 1)
}

function advanceLevel() {
    currentLevel++; 
    // O navio já está na posição correta (final do nível anterior), por isso apenas reiniciamos o tabuleiro.
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
    let isSequenceFailed = false;

    userSequence.forEach((move, userMoveIndex) => {
        
        if (isSequenceFailed || userMoveIndex >= requiredPath.length) {
            return;
        }

        const requiredMove = requiredPath[userMoveIndex];
        
        // 🛑 LÓGICA DE FALHA: Se o movimento do utilizador for diferente do esperado
        if (move !== requiredMove) {
            isSequenceFailed = true;
            
            setTimeout(() => {
                // Move uma última vez (para a posição de erro)
                switch (move) {
                    case 'UP': tempShipPos.row--; break;
                    case 'DOWN': tempShipPos.row++; break;
                    case 'LEFT': tempShipPos.col--; break;
                    case 'RIGHT': tempShipPos.col++; break;
                }
                placeShip(tempShipPos.col, tempShipPos.row);
                
                handleGameOver(false, false); 
            }, 500 * (userMoveIndex + 1));
            return;
        }

        // Movimento Correto
        setTimeout(() => {
            
            switch (move) {
                case 'UP': tempShipPos.row--; break;
                case 'DOWN': tempShipPos.row++; break;
                case 'LEFT': tempShipPos.col--; break;
                case 'RIGHT': tempShipPos.col++; break;
            }

            placeShip(tempShipPos.col, tempShipPos.row);

            // Verificação de estado após o último movimento da sequência
            if (userMoveIndex === userSequence.length - 1 && !isSequenceFailed) {
                
                if (userSequence.length !== requiredPath.length) {
                    handleGameOver(false, false); // Falha de tamanho
                    return;
                }
                
                const isFinalLevel = currentLevel === LEVEL_PATHS.length - 1;
                
                // Chegou ao Tesouro?
                if (isFinalLevel && tempShipPos.col === FINAL_TREASURE_POS.col && tempShipPos.row === FINAL_TREASURE_POS.row) {
                    handleGameOver(true, true);
                
                // Chegou ao Ponto de Mini-Game?
                } else if (!isFinalLevel) {
                    
                    const expectedUnlockPos = MINI_GAME_UNLOCK_POSITIONS[currentLevel];
                    
                    if (tempShipPos.col === expectedUnlockPos.col && tempShipPos.row === expectedUnlockPos.row) {
                        startMiniGame(); // Inicia o Mini-Game
                    } else {
                        handleGameOver(false, false); // Posição final incorreta
                    }
                } else {
                    // Último nível, mas não chegou ao tesouro
                    handleGameOver(false, false); 
                }
            }
        }, 500 * (userMoveIndex + 1)); 
    });
}

function handleGameOver(isWin, isFinalGame) {
    isGameActive = false; 

    if (isWin) {
        alert("🎉 Tesouro Encontrado! Você é um Mestre Navegador!");
    } else {
        alert("💀 Caiu em Águas Rasas! O seu Navio encalhou. Tente o Nível Novamente!");
        
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