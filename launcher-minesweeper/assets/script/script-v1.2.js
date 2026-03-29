let rows, cols, minesCount;
let board = [];
let firstClick = true;
let gameOver = false;
let timer = 0;
let timerInterval;
let flagsPlaced = 0;

const boardElement = document.getElementById("board");
const timerText = document.getElementById("timer");
const bombText = document.getElementById("bombCount");
const statusMessage = document.getElementById("statusMessage");

function startGame() {
    statusMessage.textContent = "";
    const level = document.getElementById("level").value;

    if (level === "easy") { rows = cols = 8; minesCount = 10; }
    if (level === "medium") { rows = cols = 12; minesCount = 25; }
    if (level === "hard") { rows = cols = 16; minesCount = 50; }

    boardElement.style.gridTemplateColumns = `repeat(${cols}, 35px)`;
    board = [];
    boardElement.innerHTML = "";
    firstClick = true;
    gameOver = false;
    flagsPlaced = 0;
    bombText.textContent = minesCount;
    timer = 0;
    timerText.textContent = 0;
    clearInterval(timerInterval);

    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = { mine: false, opened: false, flag: false, count: 0 };

            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.onclick = handleClick;
            cell.oncontextmenu = handleRightClick;

            boardElement.appendChild(cell);
        }
    }
}

function placeMines(safeRow, safeCol) {
    let placed = 0;
    while (placed < minesCount) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);

        if (!board[r][c].mine && !(r == safeRow && c == safeCol)) {
            board[r][c].mine = true;
            placed++;
        }
    }
}

function calculateNumbers() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) continue;
            let count = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    let nr = r + i, nc = c + j;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        if (board[nr][nc].mine) count++;
                    }
                }
            }
            board[r][c].count = count;
        }
    }
}

function handleClick(e) {
    if (gameOver) return;
    let r = parseInt(e.target.dataset.row);
    let c = parseInt(e.target.dataset.col);

    if (firstClick) {
        placeMines(r, c);
        calculateNumbers();
        startTimer();
        firstClick = false;
    }

    openCell(r, c);
    checkWin();
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;

    let r = e.target.dataset.row;
    let c = e.target.dataset.col;
    let cell = board[r][c];

    if (!cell.opened) {
        cell.flag = !cell.flag;
        e.target.classList.toggle("flag");
        e.target.textContent = cell.flag ? "🚩" : "";
        flagsPlaced += cell.flag ? 1 : -1;
        bombText.textContent = minesCount - flagsPlaced;
    }
}

function openCell(r, c) {
    let cell = board[r][c];
    let index = r * cols + c;
    let el = boardElement.children[index];

    if (cell.opened || cell.flag) return;

    cell.opened = true;
    el.classList.add("opened");

    if (cell.mine) {
        el.classList.add("mine");
        el.textContent = "💣";
        gameOver = true;
        revealMines();
        clearInterval(timerInterval);
        return;
    }

    if (cell.count > 0) {
        el.textContent = cell.count;
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nr = r + i, nc = c + j;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    openCell(nr, nc);
                }
            }
        }
    }
}

function revealMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) {
                boardElement.children[r * cols + c].textContent = "💣";
            }
        }
    }
}

function checkWin() {
    let opened = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].opened) opened++;
        }
    }
    if (opened === rows * cols - minesCount) {
        gameOver = true;
        clearInterval(timerInterval);
        statusMessage.textContent = "🎉 You Win!";
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerText.textContent = timer;
    }, 1000);
}

startGame();

function submitQuit() {
    window.location.href="../main.html";
}