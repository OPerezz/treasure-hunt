const boardEl = document.getElementById('sudoku-board');
const newBtn = document.getElementById('new');
const checkBtn = document.getElementById('check');
const solveBtn = document.getElementById('solve');
const msgEl = document.getElementById('msg');
const minigame2 = document.getElementById('modal-minigame2');

let current = { solution: null, puzzle: null, mask: null };

const BASE = [
    [1, 2, 3],
    [2, 3, 1],
    [3, 1, 2]
];

function cloneMatrix(m) {
    return m.map(row => row.slice());
}

function permuteRows(mat) {
    const idx = [0, 1, 2].slice();
    shuffle(idx);
    const res = [[], [], []];
    for (let i = 0; i < 3; i++) res[i] = mat[idx[i]].slice();
    return res;
}

function permuteCols(mat) {
    const idx = [0, 1, 2].slice();
    shuffle(idx);
    const res = [[], [], []];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            res[r][c] = mat[r][idx[c]];
        }
    }
    return res;
}

function permuteSymbols(mat) {
    const perm = [0, 1, 2, 3]; // índice 0 inutil
    const map = [0, 1, 2, 3].slice(1);
    shuffle(map);
    const mapping = { 1: map[0], 2: map[1], 3: map[2] };
    const res = cloneMatrix(mat);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            res[r][c] = mapping[mat[r][c]];
        }
    }
    return res;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function gerarSolucaoValida() {
    let m = cloneMatrix(BASE);
    m = permuteRows(m);
    m = permuteCols(m);
    m = permuteSymbols(m);
    return m;
}


function criarPuzzleFromSolution(sol, minClues = 3) {
    const puzzle = cloneMatrix(sol);
    const mask = Array.from({ length: 3 }, () => [1, 1, 1]);

    let visible = 9;
    const indices = [];
    for (let i = 0; i < 9; i++) indices.push(i);
    shuffle(indices);
    for (let idx of indices) {
        if (visible <= minClues) break;
        const r = Math.floor(idx / 3), c = idx % 3;
        if (Math.random() < 0.6) {
            puzzle[r][c] = "";
            mask[r][c] = 0;
            visible--;
        }
    }
    if (visible > minClues) {
        for (let k = 0; k < 9 && visible > minClues; k++) {
            const r = Math.floor(k / 3), c = k % 3;
            if (mask[r][c] === 1) {
                puzzle[r][c] = "";
                mask[r][c] = 0;
                visible--;
            }
        }
    }
    return { puzzle, mask };
}

function renderBoard(puzzle, mask) {
    boardEl.innerHTML = '';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const input = document.createElement('input');
            input.inputMode = 'numeric';
            input.maxLength = 1;
            input.dataset.r = r;
            input.dataset.c = c;
            const val = puzzle[r][c];
            if (val !== "" && val !== undefined) {
                input.value = val;
                input.readOnly = true;
                input.classList.add('prefilled');
            } else {
                input.value = '';
                input.readOnly = false;
                input.addEventListener('input', e => {
                    e.target.value = e.target.value.replace(/[^1-3]/g, '').slice(0, 1);
                });
            }
            boardEl.appendChild(input);
        }
    }
}

function verificarTudo() {
    const inputs = boardEl.querySelectorAll('input');
    const grid = Array.from({ length: 3 }, () => ['', '', '']);
    inputs.forEach(inp => {
        const r = +inp.dataset.r;
        const c = +inp.dataset.c;
        grid[r][c] = inp.value.trim();
        inp.classList.remove('wrong');
    });

    let ok = true;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const v = grid[r][c];
            if (v === '' || !['1', '2', '3'].includes(v)) {
                ok = false;
            }
        }
    }

    function groupValid(arr) {
        const s = new Set(arr);
        return s.size === 3 && s.has('1') && s.has('2') && s.has('3');
    }

    for (let r = 0; r < 3; r++) {
        if (!groupValid(grid[r])) ok = false;
    }
    for (let c = 0; c < 3; c++) {
        const col = [grid[0][c], grid[1][c], grid[2][c]];
        if (!groupValid(col)) ok = false;
    }

    const sol = current.solution;
    if (sol) {
        inputs.forEach(inp => {
            const r = +inp.dataset.r;
            const c = +inp.dataset.c;
            if (inp.value !== '' && !inp.readOnly) {
                if (String(sol[r][c]) !== inp.value) {
                    inp.classList.add('wrong');
                }
            }
        });
    }

    if (ok) {
        msgEl.textContent = '✅ Parabéns — Sudoku correto!';
        msgEl.className = 'msg ok';

        minigame2.classList.add("hidden")
        window.GamePrincipal.classList.remove("hidden")

        window.handleMiniGameComplete();
    } else {
        msgEl.textContent = '❌ Existem erros ou espaços vazios. Células incorretas estão em destaque.';
        msgEl.className = 'msg err';
    }
    return ok;
}

function solveShow() {
    const sol = current.solution;
    if (!sol) return;
    const inputs = boardEl.querySelectorAll('input');
    inputs.forEach(inp => {
        const r = +inp.dataset.r;
        const c = +inp.dataset.c;
        inp.value = sol[r][c];
        inp.classList.remove('wrong');
    });
    msgEl.textContent = 'Solução mostrada.';
    msgEl.className = 'msg';
}

function newGame() {
    const sol = gerarSolucaoValida();
    const { puzzle, mask } = criarPuzzleFromSolution(sol, 3);
    current.solution = sol;
    current.puzzle = puzzle;
    current.mask = mask;
    renderBoard(puzzle, mask);
    msgEl.textContent = '';
    msgEl.className = 'msg';
}

newBtn.addEventListener('click', newGame);
checkBtn.addEventListener('click', verificarTudo);
solveBtn.addEventListener('click', solveShow);


newGame();
