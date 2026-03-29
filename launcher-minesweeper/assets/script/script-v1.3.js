let rows, cols, minesCount;
let board = [];
let firstClick = true;
let gameOver = false;
let timer = 0;
let interval;
let flags = 0;

const boardEl = document.getElementById("board");
const timerEl = document.getElementById("timer");
const bombsLeftEl = document.getElementById("bombsLeft");
const bestScoreEl = document.getElementById("bestScore");
const statusMessage = document.getElementById("statusMessage");

const clickSound = new Audio(
  "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
);
const boomSound = new Audio(
  "https://actions.google.com/sounds/v1/explosions/explosion.ogg",
);

function startGame() {
  const level = document.getElementById("level").value;
  statusMessage.textContent = "";
  if (level === "easy") {
    rows = cols = 8;
    minesCount = 10;
  }
  if (level === "medium") {
    rows = cols = 12;
    minesCount = 25;
  }
  if (level === "hard") {
    rows = cols = 16;
    minesCount = 50;
  }

  boardEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
  board = [];
  boardEl.innerHTML = "";
  firstClick = true;
  gameOver = false;
  flags = 0;
  bombsLeftEl.textContent = minesCount;
  timer = 0;
  timerEl.textContent = 0;
  clearInterval(interval);

  loadBestScore();

  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = { mine: false, opened: false, flag: false, count: 0 };
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.onclick = handleClick;
      cell.oncontextmenu = handleRightClick;
      boardEl.appendChild(cell);
    }
  }
}

function placeMines(sr, sc) {
  let placed = 0;
  while (placed < minesCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine && !(r === sr && c === sc)) {
      board[r][c].mine = true;
      placed++;
    }
  }
}

function calcNumbers() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let nr = r + i,
            nc = c + j;
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
  let r = +e.target.dataset.r;
  let c = +e.target.dataset.c;

  if (firstClick) {
    placeMines(r, c);
    calcNumbers();
    startTimer();
    firstClick = false;
  }

  openCell(r, c);
  checkWin();
}

function handleRightClick(e) {
  e.preventDefault();
  if (gameOver) return;
  let r = +e.target.dataset.r;
  let c = +e.target.dataset.c;
  let cell = board[r][c];
  if (!cell.opened) {
    cell.flag = !cell.flag;
    e.target.classList.toggle("flag");
    e.target.textContent = cell.flag ? "🚩" : "";
    flags += cell.flag ? 1 : -1;
    bombsLeftEl.textContent = minesCount - flags;
  }
}

function openCell(r, c) {
  let cell = board[r][c];
  let index = r * cols + c;
  let el = boardEl.children[index];
  if (cell.opened || cell.flag) return;

  cell.opened = true;
  el.classList.add("opened");
  clickSound.play();

  if (cell.mine) {
    el.classList.add("mine");
    el.textContent = "💣";
    boomSound.play();
    gameOver = true;
    revealMines();
    clearInterval(interval);
    return;
  }

  if (cell.count > 0) {
    el.textContent = cell.count;
  } else {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let nr = r + i,
          nc = c + j;
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
        boardEl.children[r * cols + c].textContent = "💣";
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
    clearInterval(interval);
    saveBestScore();
    statusMessage.textContent = "🏆 You Win!";
  }
}

function startTimer() {
  interval = setInterval(() => {
    timer++;
    timerEl.textContent = timer;
  }, 1000);
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

function saveBestScore() {
  let level = document.getElementById("level").value;
  let best = localStorage.getItem("ms_" + level);
  if (!best || timer < best) {
    localStorage.setItem("ms_" + level, timer);
  }
  loadBestScore();
}

function loadBestScore() {
  let level = document.getElementById("level").value;
  let best = localStorage.getItem("ms_" + level);
  bestScoreEl.textContent = best ? best + "s" : "-";
}

startGame();

function submitQuit() {
    window.location.href="../main.html";
}