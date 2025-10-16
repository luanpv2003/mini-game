// --- Audio --- //
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audio = new AudioCtx();
function beep({ freq = 660, type = "sine", dur = 0.18, vol = 0.07 }) {
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(audio.destination);
  o.start();
  setTimeout(() => o.stop(), dur * 1000);
}
function chord(freqs) {
  freqs.forEach((f, i) =>
    setTimeout(() => beep({ freq: f, type: "square", vol: 0.05 }), i * 25)
  );
}
document.body.addEventListener(
  "click",
  () => {
    if (audio.state === "suspended") audio.resume();
  },
  { once: true }
);

// --- UI Elements --- //
const screens = {
  start: document.getElementById("start-screen"),
  game: document.getElementById("game-screen"),
  gameOver: document.getElementById("game-over-screen"),
};
const playerNameInput = document.getElementById("player-name");
const startForm = document.getElementById("start-form");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timerBar = document.getElementById("timer");
const timerFill = document.getElementById('timer-fill');
const grid = document.getElementById("colorGrid");
const targetDot = document.querySelector("#target .dot");
const targetName = document.getElementById("targetName");
const finalScoreDisplay = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const settingsForm = document.getElementById("settings-form");
const timerEnabledCheckbox = document.getElementById("timer-enabled");
const timerDurationInput = document.getElementById('timer-duration');
const livesCountInput = document.getElementById('lives-count');
const leaderboardPreview = document.getElementById("leaderboard-preview");
const leaderboardFinal = document.getElementById("leaderboard-final");
const toast = document.getElementById("toast");
const confetti = document.getElementById("confetti");

// --- Game State & Settings --- //
const COLORS = [
  { name: "Đỏ", hex: "#ef4444" },
  { name: "Vàng", hex: "#f59e0b" },
  { name: "Xanh lá", hex: "#22c55e" },
  { name: "Xanh dương", hex: "#3b82f6" },
  { name: "Tím", hex: "#8b5cf6" },
  { name: "Hồng", hex: "#ec4899" },
];
let score = 0,
  lives = 3,
  targetIdx = 0,
  timerInterval,
  timeLeft;
let currentPlayer = "";
let settings = { timerEnabled: false, timerDuration: 5, lives: 1 };

// --- Core Functions --- //
function switchScreen(screenName) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[screenName].classList.add("active");
}
function updateHUD() {
    scoreDisplay.innerText = `Điểm: ${score}`;
    livesDisplay.innerText = "❤️".repeat(Math.max(0, lives));
}

function startGame() {
    currentPlayer = playerNameInput.value;
    score = 0;
    lives = settings.lives;
    updateHUD();
    nextRound();
    switchScreen('game');
}

function gameOver() {
  switchScreen("gameOver");
  finalScoreDisplay.textContent = score;
  saveToLeaderboard(playerNameInput.value, score);
  renderLeaderboard(leaderboardFinal);
}

function nextRound() {
    targetIdx = Math.floor(Math.random() * COLORS.length);
    updateTarget();
    renderGrid();
    if (settings.timerEnabled) startTimer();
}

function handleCorrect(e) {
    score += 10;
    updateHUD();
    chord([660, 880, 1320]);
    const rect = e.currentTarget.getBoundingClientRect();
    makeConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    setTimeout(nextRound, 400);
}

function handleIncorrect() {
    lives--;
    updateHUD();
    beep({ freq: 220, type: "sawtooth" });
    if (lives <= 0) {
        gameOver();
    } else {
        setTimeout(nextRound, 400);
    }
}

function startTimer() {
    stopTimer();
    timeLeft = settings.timerDuration;
    
    // Reset timer bar
    timerFill.style.transition = 'none';
    timerFill.style.width = '100%';

    // Force reflow to apply the reset instantly before re-enabling transition
    void timerFill.offsetWidth;

    // Start the animation
    timerFill.style.transition = `width ${settings.timerDuration}s linear`;
    timerFill.style.width = '0%';

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            handleIncorrect();
        }
    }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function renderGrid() {
    grid.innerHTML = "";
    let opts = [...COLORS].sort(() => 0.5 - Math.random()).slice(0, 4);
    if (!opts.includes(COLORS[targetIdx])) opts[Math.floor(Math.random() * 4)] = COLORS[targetIdx];
    opts.sort(() => 0.5 - Math.random());
    opts.forEach(c => {
        const d = document.createElement("button");
        d.className = "swatch";
        d.style.background = c.hex;
        d.setAttribute("aria-label", c.name);
        d.addEventListener("click", e => { c.name === COLORS[targetIdx].name ? handleCorrect(e) : handleIncorrect(); });
        grid.appendChild(d);
    });
}

function loadLeaderboard() { return JSON.parse(localStorage.getItem("colorMatchLeaderboard")) || []; }

function saveToLeaderboard(name, score) {
    let board = loadLeaderboard();
    board.push({ name, score, date: new Date().toISOString() });
    board.sort((a, b) => b.score - a.score);
    localStorage.setItem("colorMatchLeaderboard", JSON.stringify(board.slice(0, 3)));
}

function renderLeaderboard(container) {
    const board = loadLeaderboard();
    if (board.length === 0) { container.innerHTML = '<p>Chưa có ai chơi!</p>'; return; }
    container.innerHTML = '<h3>Bảng xếp hạng</h3><ul class="leaderboard-list">' +
        board.map(item => `<li class="leaderboard-item"><span class="name">${item.name}</span><span class="score">${item.score} điểm</span></li>`).join('') + '</ul>';
}

function updateTarget() { targetDot.style.background = COLORS[targetIdx].hex; targetName.textContent = COLORS[targetIdx].name; }

function makeConfetti(x, y) {
  for (let i = 0; i < 28; i++) {
    const el = document.createElement("div");
    el.className = "piece";
    const color = COLORS[i % COLORS.length].hex;
    el.style.background = color;
    el.style.left = x + "px";
    el.style.top = y + "px";
    const tx = (Math.random() * 2 - 1) * 180 + "px";
    const ty = (Math.random() * 2 - 1) * 220 + "px";
    const rot = Math.random() * 720 - 360 + "deg";
    el.style.setProperty("--tx", tx);
    el.style.setProperty("--ty", ty);
    el.style.setProperty("--rot", rot);
    confetti.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}

// --- Event Listeners --- //
startForm.addEventListener('submit', e => { e.preventDefault(); if (playerNameInput.value) startGame(); });
restartBtn.addEventListener('click', () => { switchScreen('start'); renderLeaderboard(leaderboardPreview); });

settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveSettings();
  settingsModal.classList.add("hidden");
});

// --- Init --- //
function init() {
  setupFullscreen();
  loadSettings();
  renderLeaderboard(leaderboardPreview);
  switchScreen('start');
}

function setupFullscreen() {
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    if (!document.fullscreenEnabled) {
        fullscreenBtn.style.display = "none";
        return;
    }
    const enterIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V5h-2v5h5V7h-3z"/></svg>`;
    const exitIcon = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
    fullscreenBtn.innerHTML = enterIcon;

    fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => console.error(err));
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener("fullscreenchange", () => {
        fullscreenBtn.innerHTML = document.fullscreenElement ? exitIcon : enterIcon;
    });
}

function loadSettings() {
    const s = localStorage.getItem('colorMatchSettings');
    if (s) {
        settings = JSON.parse(s);
        timerEnabledCheckbox.checked = settings.timerEnabled;
        timerDurationInput.value = settings.timerDuration;
        livesCountInput.value = settings.lives;
    }
}

function saveSettings() {
    settings.timerEnabled = timerEnabledCheckbox.checked;
    settings.timerDuration = parseInt(timerDurationInput.value);
    settings.lives = parseInt(livesCountInput.value);
    localStorage.setItem('colorMatchSettings', JSON.stringify(settings));
}

settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });

init();
