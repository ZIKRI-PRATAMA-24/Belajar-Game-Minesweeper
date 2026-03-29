let rows, cols, minesCount
let board = []
let firstClick = true
let gameOver = false
let timer = 0
let interval
let flags = 0

const boardEl = document.getElementById("board")
const timerEl = document.getElementById("timer")
const bombsLeftEl = document.getElementById("bombsLeft")
const bestScoreEl = document.getElementById("bestScore")
const statusMessage = document.getElementById("statusMessage")
const face = document.getElementById("faceButton")

const totalGamesEl = document.getElementById("totalGames")
const totalWinsEl = document.getElementById("totalWins")
const winRateEl = document.getElementById("winRate")

function startGame() {

    const level = document.getElementById("level").value

    statusMessage.textContent = ""

    face.textContent = "🙂"

    if (level === "easy") { rows = cols = 8; minesCount = 10 }
    if (level === "medium") { rows = cols = 12; minesCount = 25 }
    if (level === "hard") { rows = cols = 16; minesCount = 50 }

    boardEl.style.gridTemplateColumns = `repeat(${cols},34px)`

    board = []
    boardEl.innerHTML = ""
    firstClick = true
    gameOver = false
    flags = 0

    bombsLeftEl.textContent = minesCount

    timer = 0
    timerEl.textContent = 0

    clearInterval(interval)

    loadBestScore()
    renderStats()

    for (let r = 0; r < rows; r++) {

        board[r] = []

        for (let c = 0; c < cols; c++) {

            board[r][c] = { mine: false, opened: false, flag: false, count: 0 }

            const cell = document.createElement("div")

            cell.className = "cell"
            cell.dataset.r = r
            cell.dataset.c = c

            cell.onclick = handleClick
            cell.oncontextmenu = handleRightClick

            boardEl.appendChild(cell)

        }

    }

}

function placeMines(sr, sc) {

    let placed = 0

    while (placed < minesCount) {

        let r = Math.floor(Math.random() * rows)
        let c = Math.floor(Math.random() * cols)

        if (!board[r][c].mine && !(r === sr && c === sc)) {

            board[r][c].mine = true
            placed++

        }

    }

}

function calcNumbers() {

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (board[r][c].mine) continue

            let count = 0

            for (let i = -1; i <= 1; i++) {

                for (let j = -1; j <= 1; j++) {

                    let nr = r + i
                    let nc = c + j

                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {

                        if (board[nr][nc].mine) count++

                    }

                }

            }

            board[r][c].count = count

        }

    }

}

function handleClick(e) {

    if (gameOver) return

    let r = +e.target.dataset.r
    let c = +e.target.dataset.c

    if (firstClick) {

        placeMines(r, c)
        calcNumbers()
        startTimer()

        firstClick = false

    }

    openCell(r, c)

    if (gameOver) return

    chordOpen(r, c)

    checkWin()

}

function handleRightClick(e) {

    e.preventDefault()

    if (gameOver) return

    let r = +e.target.dataset.r
    let c = +e.target.dataset.c

    let cell = board[r][c]

    if (!cell.opened) {

        cell.flag = !cell.flag

        e.target.classList.toggle("flag")

        e.target.textContent = cell.flag ? "🚩" : ""

        flags += cell.flag ? 1 : -1

        bombsLeftEl.textContent = minesCount - flags

    }

}

function openCell(r, c) {

    let cell = board[r][c]

    let index = r * cols + c

    let el = boardEl.children[index]

    if (cell.opened || cell.flag) return

    cell.opened = true

    el.classList.add("opened")

    if (cell.mine) {

        el.classList.add("mine")
        el.textContent = "💣"

        face.textContent = "😵"

        gameOver = true

        revealMines()

        clearInterval(interval)

        updateStats(false)

        statusMessage.textContent = "💥 Game Over"

        return

    }

    if (cell.count > 0) {

        el.textContent = cell.count
        el.dataset.num = cell.count

    } else {

        for (let i = -1; i <= 1; i++) {

            for (let j = -1; j <= 1; j++) {

                let nr = r + i
                let nc = c + j

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {

                    openCell(nr, nc)

                }

            }

        }

    }

}

function revealMines() {

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (board[r][c].mine) {

                let index = r * cols + c

                boardEl.children[index].textContent = "💣"

            }

        }

    }

}

function checkWin() {

    let opened = 0

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (board[r][c].opened) opened++

        }

    }

    if (opened === rows * cols - minesCount) {

        gameOver = true

        clearInterval(interval)

        face.textContent = "😎"

        saveBestScore()

        updateStats(true)

        statusMessage.textContent = "🏆 YOU WIN"

    }

}

function chordOpen(r, c) {

    let cell = board[r][c]

    if (!cell.opened || cell.count === 0) return

    let flagCount = 0

    for (let i = -1; i <= 1; i++) {

        for (let j = -1; j <= 1; j++) {

            let nr = r + i
            let nc = c + j

            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {

                if (board[nr][nc].flag) flagCount++

            }

        }

    }

    if (flagCount === cell.count) {

        for (let i = -1; i <= 1; i++) {

            for (let j = -1; j <= 1; j++) {

                let nr = r + i
                let nc = c + j

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {

                    openCell(nr, nc)

                }

            }

        }

    }

}

function startTimer() {

    interval = setInterval(() => {

        timer++
        timerEl.textContent = timer

    }, 1000)

}

function toggleTheme() {

    document.body.classList.toggle("light")

}

function saveBestScore() {

    let level = document.getElementById("level").value

    let best = localStorage.getItem("ms_" + level)

    if (!best || timer < best) {

        localStorage.setItem("ms_" + level, timer)

    }

    loadBestScore()

}

function loadBestScore() {

    let level = document.getElementById("level").value

    let best = localStorage.getItem("ms_" + level)

    bestScoreEl.textContent = best ? best + "s" : "-"

}

function updateStats(win = false) {

    let games = Number(localStorage.getItem("ms_games")) || 0
    let wins = Number(localStorage.getItem("ms_wins")) || 0

    games++

    if (win) wins++

    localStorage.setItem("ms_games", games)
    localStorage.setItem("ms_wins", wins)

    renderStats()

}

function renderStats() {

    let games = Number(localStorage.getItem("ms_games")) || 0
    let wins = Number(localStorage.getItem("ms_wins")) || 0

    totalGamesEl.textContent = games
    totalWinsEl.textContent = wins

    let rate = games ? Math.round((wins / games) * 100) : 0

    winRateEl.textContent = rate + "%"

}

function giveHint() {

    if (gameOver) return

    let safeCells = []

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            let cell = board[r][c]

            if (!cell.mine && !cell.opened && !cell.flag) {

                safeCells.push({ r, c })

            }

        }

    }

    if (safeCells.length === 0) return

    let pick = safeCells[Math.floor(Math.random() * safeCells.length)]

    let index = pick.r * cols + pick.c

    let el = boardEl.children[index]

    el.style.outline = "3px solid yellow"
    el.style.transform = "scale(1.15)"

    setTimeout(() => {

        el.style.outline = ""
        el.style.transform = ""

    }, 1200)

}

startGame()

const colorPicker=document.getElementById("colorTheme")

colorPicker.addEventListener("input",e=>{

document.documentElement.style.setProperty(
"--accent",
e.target.value
)

})

function submitQuit() {
    window.location.href="../main.html";
}