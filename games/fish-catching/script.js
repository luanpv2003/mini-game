// ===== Audio (WebAudio, không cần file ngoài) =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audio = new AudioCtx();
function pop() {
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = "triangle";
  o.frequency.value = 760;
  g.gain.value = 0.08;
  o.connect(g);
  g.connect(audio.destination);
  o.start();
  const t = audio.currentTime;
  g.gain.setValueAtTime(0.09, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
  o.stop(t + 0.14);
}

// ===== Canvas Setup (HiDPI) =====
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0); // draw in CSS pixels
}
addEventListener("resize", resize);

// ===== Game State =====
let running = false;
const fishes = []; // active fish
const bombs = []; // active bombs
const splashes = []; // ripple effects
let lastSpawn = 0;
let lastBombSpawn = 0;
let score = 0;
let caught = 0;

// Assets
const bombImg = new Image();
bombImg.src = "bomb.png";

function rand(a, b) {
  return a + Math.random() * (b - a);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
];

function makeFish() {
  const h = canvas.getBoundingClientRect().height; // CSS px
  const y = rand(60, Math.max(120, h - 80));
  const dir = Math.random() < 0.5 ? 1 : -1; // swim left->right or reverse
  const speed = rand(60, 120) * dir; // px/sec
  const scale = rand(0.9, 1.35);
  const color = pick(COLORS);
  const x = dir > 0 ? -80 : canvas.getBoundingClientRect().width + 80;
  return {
    x,
    y,
    vx: speed,
    w: 70 * scale,
    h: 38 * scale,
    color,
    dir,
    blink: Math.random() * 2,
    t: 0,
  };
}

function makeBomb() {
  const h = canvas.getBoundingClientRect().height; // CSS px
  const w_canvas = canvas.getBoundingClientRect().width;
  const y = rand(60, Math.max(120, h - 80));
  const dir = Math.random() < 0.5 ? 1 : -1;
  const speed = rand(40, 90) * dir;
  const x = dir > 0 ? -60 : w_canvas + 60;
  return { x, y, vx: speed, r: 25, t: 0, dir };
}

function drawFish(f) {
  const { x, y, w, h, color, dir } = f;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  // Body (ellipse)
  ctx.fillStyle = color;
  ctx.strokeStyle = "#00000020";
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Tail (triangle)
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-w / 2 - h * 0.6, -h * 0.35);
  ctx.lineTo(-w / 2 - h * 0.6, h * 0.35);
  ctx.closePath();
  ctx.fill();
  // Fin
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-w * 0.05, 0);
  ctx.quadraticCurveTo(0, -h * 0.35, w * 0.2, -h * 0.05);
  ctx.quadraticCurveTo(0, h * 0.35, -w * 0.05, 0);
  ctx.fillStyle = "#ffffff66";
  ctx.fill();
  ctx.globalAlpha = 1;
  // Eye (blink)
  const eyeOpen = Math.sin(f.t + f.blink) > -0.5;
  ctx.fillStyle = "#111";
  if (eyeOpen) {
    ctx.beginPath();
    ctx.arc(w * 0.22, -h * 0.1, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.18, -h * 0.1);
    ctx.lineTo(w * 0.26, -h * 0.1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBomb(b) {
  ctx.save();
  ctx.translate(b.x, b.y);
  // Draw bomb image
  const size = b.r * 2.8;
  ctx.drawImage(bombImg, -size / 2, -size / 2, size, size);

  // Pulse effect
  ctx.beginPath();
  ctx.arc(0, 0, b.r + Math.sin(b.t * 10) * 2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawBubbles(dt) {
  // gentle bubbles from bottom
  if (Math.random() < dt * 0.8) {
    splashes.push({
      x: rand(10, canvas.getBoundingClientRect().width - 10),
      y: canvas.getBoundingClientRect().height + 10,
      r: rand(2, 4),
      vy: rand(-30, -60),
      life: 1,
      type: "bubble",
    });
  }
}

function drawRipple(s) {
  ctx.save();
  if (s.type === "bubble") {
    ctx.globalAlpha = Math.max(0, s.life);
    ctx.fillStyle = "#ffffffaa";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // click ripple
    ctx.globalAlpha = Math.max(0, s.life);
    ctx.strokeStyle = "#ffffffaa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, (1 - s.life) * 60 + 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== Hit Test =====
function hitFish(px, py) {
  // return index of fish that contains point (ellipse hit test)
  for (let i = fishes.length - 1; i >= 0; i--) {
    const f = fishes[i];
    // transform point to fish local coordinates considering direction
    const dx = (px - f.x) * (1 / f.dir); // mirror when dir=-1
    const dy = py - f.y;
    const a = f.w / 2,
      b = f.h / 2;
    if ((dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1) {
      return i;
    }
  }
  return -1;
}

function hitBomb(px, py) {
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    const dx = px - b.x;
    const dy = py - b.y;
    if (Math.sqrt(dx * dx + dy * dy) <= b.r + 10) {
      return i;
    }
  }
  return -1;
}

// ===== Pointer Events =====
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - r.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - r.top;
  return { x, y };
}

function onDown(e) {
  if (!running) return;
  if (audio.state === "suspended") {
    audio.resume();
  }
  const { x, y } = canvasPoint(e);

  // Check bomb first
  const bombIdx = hitBomb(x, y);
  if (bombIdx > -1) {
    gameOver();
    return;
  }

  const idx = hitFish(x, y);
  splashes.push({ x, y, life: 1, type: "ripple" });
  if (idx > -1) {
    const f = fishes[idx];
    fishes.splice(idx, 1);
    caught++;
    score += 10;
    pop();
    updateHUD();
  }
}

canvas.addEventListener("pointerdown", onDown, { passive: true });

// ===== HUD =====
const elScore = document.querySelector("#score b");
const elCaught = document.querySelector("#caught b");
function updateHUD() {
  elScore.textContent = score;
  elCaught.textContent = caught;
}

// ===== Game Loop =====
let last = performance.now();
function frame(t) {
  if (!running) {
    requestAnimationFrame(frame);
    return;
  }
  const dt = Math.min(0.033, (t - last) / 1000);
  last = t;

  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // spawn fish
  lastSpawn += dt;
  const spawnEvery = Math.max(0.5, 1.4 - caught * 0.02); // nhẹ nhàng, tăng dần mật độ
  if (lastSpawn > spawnEvery && fishes.length < 8) {
    fishes.push(makeFish());
    lastSpawn = 0;
  }

  // update & draw fish
  const W = canvas.getBoundingClientRect().width;
  const H = canvas.getBoundingClientRect().height;
  for (let i = fishes.length - 1; i >= 0; i--) {
    const f = fishes[i];
    f.t += dt;
    f.x += f.vx * dt;
    // gentle bobbing
    f.y += Math.sin((f.t + i) * 2) * 0.6;
    drawFish(f);
    if ((f.dir > 0 && f.x > W + 120) || (f.dir < 0 && f.x < -120)) {
      fishes.splice(i, 1);
    }
  }

  // spawn bomb
  lastBombSpawn += dt;
  const bombSpawnEvery = Math.max(2, 4 - caught * 0.05);
  if (lastBombSpawn > bombSpawnEvery && bombs.length < 3) {
    bombs.push(makeBomb());
    lastBombSpawn = 0;
  }

  // update & draw bombs
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    b.t += dt;
    b.x += b.vx * dt;
    b.y += Math.cos((b.t + i) * 3) * 0.8;
    drawBomb(b);
    if ((b.dir > 0 && b.x > W + 120) || (b.dir < 0 && b.x < -120)) {
      bombs.splice(i, 1);
    }
  }

  // bubbles and ripples
  drawBubbles(dt);
  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i];
    if (s.type === "bubble") {
      s.y += s.vy * dt;
      s.life -= dt * 0.2;
    } else {
      s.life -= dt * 1.6;
    }
    drawRipple(s);
    if (s.life <= 0 || s.y < -10) splashes.splice(i, 1);
  }

  requestAnimationFrame(frame);
}

// ===== Controls =====
function start() {
  running = true;
  last = performance.now();
  lastSpawn = 999;
  lastBombSpawn = 0;
  document.getElementById("startPanel").style.display = "none";
  document.getElementById("gameOverPanel").style.display = "none";
  updateHUD();
}

function gameOver() {
  running = false;
  document.getElementById("gameOverPanel").style.display = "grid";
  document.getElementById("finalScore").innerHTML =
    `Bạn đã đạt được <b>${score}</b> điểm!`;
}

function restart() {
  score = 0;
  caught = 0;
  fishes.length = 0;
  bombs.length = 0;
  splashes.length = 0;
  lastSpawn = 999;
  lastBombSpawn = 0;
  updateHUD();
  start();
}

document.getElementById("btnStart").addEventListener("click", () => {
  if (audio.state === "suspended") audio.resume();
  start();
});
document.getElementById("btnRestart").addEventListener("click", () => {
  restart();
});
document.getElementById("btnRestartFinal").addEventListener("click", () => {
  restart();
});

document.getElementById("btnFS").addEventListener("click", () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    el.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

// ===== Init =====
function init() {
  resize();
  updateHUD();
  requestAnimationFrame(frame);
}
init();
