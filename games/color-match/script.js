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
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    fullscreenBtn.innerHTML = document.fullscreenElement ? exitIcon : enterIcon;
  });
}

const COLORS = [
  { name: "Đỏ", hex: "#ef4444" },
  { name: "Vàng", hex: "#f59e0b" },
  { name: "Xanh lá", hex: "#22c55e" },
  { name: "Xanh dương", hex: "#3b82f6" },
  { name: "Tím", hex: "#8b5cf6" },
  { name: "Hồng", hex: "#ec4899" },
];
const grid = document.getElementById("colorGrid");
const targetDot = document.querySelector("#target .dot");
const targetName = document.getElementById("targetName");
const toast = document.getElementById("toast");
const confetti = document.getElementById("confetti");

function setToast(text = "Giỏi lắm! 👏") {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 900);
}
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

let targetIdx = 0;
function pickTarget() {
  targetIdx = Math.floor(Math.random() * COLORS.length);
  updateTarget();
  renderGrid();
}
function updateTarget() {
  targetDot.style.background = COLORS[targetIdx].hex;
  targetName.textContent = COLORS[targetIdx].name;
}
function renderGrid() {
  grid.innerHTML = "";
  let opts = COLORS.slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  if (!opts.find((c) => c.name === COLORS[targetIdx].name)) {
    opts[Math.floor(Math.random() * 4)] = COLORS[targetIdx];
  }
  opts.sort(() => Math.random() - 0.5); // Xáo trộn lần cuối để vị trí của đáp án đúng là ngẫu nhiên

  opts.forEach((c) => {
    const d = document.createElement("button");
    d.className = "swatch";
    d.style.background = c.hex;
    d.setAttribute("aria-label", c.name);
    d.addEventListener("click", (e) => {
      if (c.name === COLORS[targetIdx].name) {
        setToast("Đúng rồi! 🎉");
        chord([660, 880, 1320]);
        const rect = e.currentTarget.getBoundingClientRect();
        makeConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        setTimeout(pickTarget, 700);
      } else {
        setToast("Thử lại nhé!");
        beep({ freq: 220, type: "sawtooth" });
      }
    });
    grid.appendChild(d);
  });
}

function init() {
  setupFullscreen();
  pickTarget();
}

init();
