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

function setToast(text = "♪") {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 900);
}

const PAD_CFG = [
  { label: "Do", color: "#fee2e2", notes: [261.63] },
  { label: "Re", color: "#fef3c7", notes: [293.66] },
  { label: "Mi", color: "#dcfce7", notes: [329.63] },
  { label: "Fa", color: "#dbeafe", notes: [349.23] },
  { label: "Sol", color: "#ede9fe", notes: [392.0] },
  { label: "La", color: "#fae8ff", notes: [440.0] },
  { label: "Si", color: "#e0f2fe", notes: [493.88] },
  { label: "Do↑", color: "#fff7ed", notes: [523.25] },
  { label: "🥁", color: "#f1f5f9", notes: [220, 330, 440] },
];
const padGrid = document.getElementById("padGrid");
function renderPads() {
  padGrid.innerHTML = "";
  PAD_CFG.forEach((p) => {
    const el = document.createElement("button");
    el.className = "pad";
    el.style.background = p.color;
    el.textContent = p.label;
    el.addEventListener("pointerdown", () => {
      chord(p.notes);
      setToast(p.label);
    });
    padGrid.appendChild(el);
  });
}

function init() {
  setupFullscreen();
  renderPads();
}

init();
