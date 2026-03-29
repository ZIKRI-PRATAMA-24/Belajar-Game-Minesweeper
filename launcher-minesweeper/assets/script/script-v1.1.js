const rows = 10;
const cols = 10;
const minesCount = 15;

let board = [];
let gameOver = false;

const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");

function init() {
    board = [];
    boardElement.innerHTML = "";
    gameOver = false;
    statusText.textContent = "";

    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = {
                mine: false,
                opened: false,
                flag: false,
                count: 0,
            };

            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener("click", handleClick);
            cell.addEventListener("contextmenu", handleRightClick);

            boardElement.appendChild(cell);
        }
    }

    placeMines();
    calculateNumbers();
}

function placeMines() {
    let placed = 0;
    while (placed < minesCount) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        if (!board[r][c].mine) {
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
                    let nr = r + i;
                    let nc = c + j;
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

    let r = e.target.dataset.row;
    let c = e.target.dataset.col;

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
    }
}

function openCell(r, c) {
    let cell = board[r][c];
    let index = r * cols + parseInt(c);
    let cellElement = boardElement.children[index];

    if (cell.opened || cell.flag) return;

    cell.opened = true;
    cellElement.classList.add("opened");

    if (cell.mine) {
        cellElement.classList.add("mine");
        cellElement.textContent = "💣";
        gameOver = true;
        statusText.textContent = "Game Over!";
        revealMines();
        return;
    }

    if (cell.count > 0) {
        cellElement.textContent = cell.count;
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nr = parseInt(r) + i;
                let nc = parseInt(c) + j;
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
                let index = r * cols + c;
                boardElement.children[index].textContent = "💣";
            }
        }
    }
}

function checkWin() {
    let openedCount = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].opened) openedCount++;
        }
    }

    if (openedCount === rows * cols - minesCount) {
        gameOver = true;
        statusText.textContent = "You Win! 🎉";
    }
}

init();

function submitQuit() {
    window.location.href="../main.html";
}