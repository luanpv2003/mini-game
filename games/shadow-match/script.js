// Web Audio API Synthesizer
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Âm thanh phép thuật hóa giải bóng đen
function playMagicFanfare() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    }, idx * 60);
  });
}

// Âm thanh boing nhẹ nhàng khi chọn nhầm
function playBoingSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.12);
  osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.28);

  gain.gain.setValueAtTime(0.16, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

// Giọng nói tiếng Việt vui vẻ
function speakVietnamese(text) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.25;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.log('Speech synthesis error', e);
  }
}

// Danh sách các bạn thú với hình dáng đặc trưng
const SHADOW_ANIMALS = [
  {
    name: 'Chú Voi',
    emoji: '🐘',
    hint: 'Bạn này có chiếc vòi dài và đôi tai rất to nè!',
    successText: 'Hoan hô! Đúng là Chú Voi rồi! Bé giỏi quá!'
  },
  {
    name: 'Hươu Cao Cổ',
    emoji: '🦒',
    hint: 'Bạn này có chiếc cổ siêu cao để ăn lá cây trên ngọn!',
    successText: 'Chuẩn luôn! Bạn Hươu Cao Cổ đây rồi!'
  },
  {
    name: 'Chú Thỏ',
    emoji: '🐰',
    hint: 'Bạn này có đôi tai dài dựng đứng và rất thích cà rốt!',
    successText: 'Chính xác! Bạn Thỏ trắng đáng yêu quá!'
  },
  {
    name: 'Chú Sư Tử',
    emoji: '🦁',
    hint: 'Bạn này có bờm tròn xoe như mặt trời!',
    successText: 'Wow! Chú Sư Tử dũng mãnh đây rồi!'
  },
  {
    name: 'Vịt Con',
    emoji: '🦆',
    hint: 'Bạn này có cái mỏ dẹp kêu quác quác bơi dưới nước!',
    successText: 'Quác quác! Vịt con cảm ơn bé nhé!'
  },
  {
    name: 'Chú Ếch',
    emoji: '🐸',
    hint: 'Bạn này màu xanh, mắt tròn xoe hay nhảy ộp ộp!',
    successText: 'Ộp ộp! Đúng là chú Ếch xanh rồi!'
  },
  {
    name: 'Bướm Xinh',
    emoji: '🦋',
    hint: 'Bạn này có đôi cánh rộng xòe bay lượn bên bông hoa!',
    successText: 'Bươm bướm bay lượn đẹp quá! Bé tài thật!'
  },
  {
    name: 'Chú Rùa',
    emoji: '🐢',
    hint: 'Bạn này có chiếc mai tròn cứng như chiếc khiên!',
    successText: 'Rùa con chậm chạp vẫy tay chào bé nè!'
  },
  {
    name: 'Cua Biển',
    emoji: '🦀',
    hint: 'Bạn này có hai cái càng to giơ lên trời kẹp kẹp!',
    successText: 'Đúng rồi! Chú Cua biển với hai chiếc càng to!'
  },
  {
    name: 'Cá Heo',
    emoji: '🐬',
    hint: 'Bạn này uốn cong lưng nhảy múa trên mặt biển!',
    successText: 'Tuyệt vời! Chú Cá Heo thông minh bơi tới rồi!'
  },
  {
    name: 'Khủng Long',
    emoji: '🦖',
    hint: 'Bạn này có chiếc đuôi dài ngoằng và hai tay nhỏ xíu!',
    successText: 'Gầm gừ! Bạn Khủng Long ngầu quá!'
  },
  {
    name: 'Cú Mèo',
    emoji: '🦉',
    hint: 'Bạn này có đôi mắt to tròn đậu trên cành cây!',
    successText: 'Cú Mèo thông thái chớp mắt khen bé ngoan!'
  }
];

// Canvas Hạt Pháo Hoa Lấp Lánh
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 5.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2.5;
    this.size = 14 + Math.random() * 16;
    this.emoji = ['⭐', '✨', '🌟', '💖', '🎉', '🐾', '🎈'][Math.floor(Math.random() * 7)];
    this.alpha = 1;
    this.decay = 0.015 + Math.random() * 0.015;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.18;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12;
    this.rotation += this.rotSpeed;
    this.alpha -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = `${this.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

function burstParticles(x, y, count = 25) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y));
  }
}

function animLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw(ctx);
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }
  requestAnimationFrame(animLoop);
}
animLoop();

// Trạng thái Trò Chơi
let currentIdx = 0;
let isBusy = false;
let starCount = 0;
let shuffledList = [...SHADOW_ANIMALS].sort(() => Math.random() - 0.5);
let choiceCardsList = [];

const shadowCard = document.getElementById('shadow-card');
const shadowAnimalEl = document.getElementById('shadow-animal');
const revealedNameEl = document.getElementById('revealed-name');
const hintTextEl = document.getElementById('hint-text');
const choicesGridEl = document.getElementById('choices-grid');
const toastEl = document.getElementById('toast');
const starsCountEl = document.getElementById('stars-count');
const btnNext = document.getElementById('btn-next');
const btnSound = document.getElementById('btn-sound');
const soundLabel = document.getElementById('sound-label');

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1600);
}

function renderPuzzle() {
  isBusy = false;
  const current = shuffledList[currentIdx];

  // Đặt lại trạng thái bóng đen bí ẩn
  shadowCard.className = 'shadow-card';
  shadowAnimalEl.className = 'animal-figure silhouette';
  shadowAnimalEl.textContent = current.emoji;
  revealedNameEl.textContent = '???';
  revealedNameEl.style.background = '#7c3aed';
  hintTextEl.textContent = 'Bóng của bạn nào đây nhỉ?';

  // Lấy 2 bạn thú gây nhiễu có hình dáng khác nhau
  const others = SHADOW_ANIMALS.filter(a => a.name !== current.name).sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [
    { ...current, isCorrect: true },
    { ...others[0], isCorrect: false },
    { ...others[1], isCorrect: false }
  ].sort(() => Math.random() - 0.5);

  choicesGridEl.innerHTML = '';
  choiceCardsList = [];
  choices.forEach((animal, index) => {
    const card = document.createElement('div');
    card.className = 'choice-card';
    card.tabIndex = 0;
    card.dataset.name = animal.name;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="tv-key-badge">${index + 1}</div>
      <div class="choice-emoji">${animal.emoji}</div>
      <div class="choice-name">${animal.name}</div>
    `;

    card.addEventListener('click', () => handleChoice(card, animal));
    choicesGridEl.appendChild(card);
    choiceCardsList.push({ card, animal });
  });

  // Tự động focus thẻ đầu tiên cho Remote TV
  setTimeout(() => {
    if (choiceCardsList.length > 0) {
      choiceCardsList[0].card.focus();
    }
  }, 100);

  // Giọng đọc gợi ý sau 300ms
  setTimeout(() => {
    speakVietnamese('Bóng của bạn nào đây nhỉ?');
  }, 300);
}

// Xử lý khi bé chạm vào 1 lựa chọn
function handleChoice(card, animal) {
  if (isBusy) return;
  getAudioContext();

  if (animal.isCorrect) {
    onMatchSuccess(card, animal);
  } else {
    onMatchWrong(card, animal);
  }
}

// Khi chọn nhầm
function onMatchWrong(card, animal) {
  playBoingSound();
  card.classList.add('wrong');

  const current = shuffledList[currentIdx];
  const hintMsg = current.hint || `Hông phải bạn ${animal.name} rồi, bé tìm lại xem!`;
  hintTextEl.textContent = hintMsg;
  showToast(`💡 ${hintMsg}`);
  speakVietnamese(hintMsg);

  setTimeout(() => {
    card.classList.remove('wrong');
  }, 500);
}

// Khi chọn đúng
function onMatchSuccess(card, animal) {
  isBusy = true;
  playMagicFanfare();

  // Hiệu ứng thẻ bay từ dưới lên khớp với chiếc bóng
  const cardRect = card.getBoundingClientRect();
  const shadowRect = shadowCard.getBoundingClientRect();

  const flyer = document.createElement('div');
  flyer.className = 'choice-flying';
  flyer.style.left = `${cardRect.left}px`;
  flyer.style.top = `${cardRect.top}px`;
  flyer.style.width = `${cardRect.width}px`;
  flyer.style.height = `${cardRect.height}px`;
  flyer.innerHTML = card.innerHTML;
  document.body.appendChild(flyer);

  card.style.opacity = '0.2';

  requestAnimationFrame(() => {
    const targetX = shadowRect.left + shadowRect.width / 2 - cardRect.width / 2;
    const targetY = shadowRect.top + shadowRect.height / 2 - cardRect.height / 2;
    flyer.style.transform = `translate(${targetX - cardRect.left}px, ${targetY - cardRect.top}px) scale(1.15)`;
    flyer.style.opacity = '0';
  });

  setTimeout(() => {
    flyer.remove();

    // Hóa phép chiếc bóng thành con vật đầy màu sắc
    shadowCard.classList.add('revealed');
    shadowAnimalEl.className = 'animal-figure revealed';
    revealedNameEl.textContent = animal.name;
    revealedNameEl.style.background = '#16a34a';

    // Nổ pháo hoa hạt lấp lánh
    const canvasRect = canvas.getBoundingClientRect();
    const burstX = shadowRect.left + shadowRect.width / 2 - canvasRect.left;
    const burstY = shadowRect.top + shadowRect.height / 2 - canvasRect.top;
    burstParticles(burstX, burstY, 30);

    // Tăng số sao
    starCount++;
    starsCountEl.textContent = starCount;

    // Lời khen
    hintTextEl.textContent = animal.successText;
    showToast(`✨ ${animal.successText}`);
    speakVietnamese(animal.successText);

    // Chuyển sang bóng tiếp theo sau 2 giây
    setTimeout(() => {
      currentIdx = (currentIdx + 1) % shuffledList.length;
      renderPuzzle();
    }, 1900);
  }, 450);
}

// Nút đổi bạn thú khác
btnNext.addEventListener('click', () => {
  if (isBusy) return;
  getAudioContext();
  currentIdx = (currentIdx + 1) % shuffledList.length;
  renderPuzzle();
});

// Nút bật/tắt âm thanh
btnSound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundLabel.textContent = soundEnabled ? 'Âm thanh: Bật 🔊' : 'Âm thanh: Tắt 🔇';
  showToast(soundEnabled ? 'Đã bật âm thanh 🔊' : 'Đã tắt âm thanh 🔇');
});

// Cài đặt Fullscreen
function setupFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (!document.fullscreenEnabled) {
    fullscreenBtn.style.display = 'none';
    return;
  }
  const enterIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V5h-2v5h5V7h-3z"/></svg>`;
  const exitIcon = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
  fullscreenBtn.innerHTML = enterIcon;

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.innerHTML = document.fullscreenElement ? exitIcon : enterIcon;
  });
}

// Điều khiển bằng Remote TV (D-Pad & Phím Số)
window.addEventListener('keydown', (e) => {
  const key = e.key;
  const code = e.keyCode;

  // TV Back Button (Return / Escape / Backspace / Tizen 10009 / webOS 461)
  if (key === 'Escape' || key === 'Backspace' || code === 10009 || code === 461) {
    e.preventDefault();
    window.location.href = '/';
    return;
  }

  // Phím số 1, 2, 3 trên Remote TV
  if (key >= '1' && key <= '3') {
    const num = parseInt(key, 10);
    if (choiceCardsList[num - 1]) {
      e.preventDefault();
      choiceCardsList[num - 1].card.click();
      return;
    }
  }

  // Điều hướng Mũi tên TV
  const active = document.activeElement;
  let activeCardIdx = choiceCardsList.findIndex(c => c.card === active);

  if (key === 'ArrowRight') {
    e.preventDefault();
    if (activeCardIdx !== -1) {
      const nextIdx = (activeCardIdx + 1) % choiceCardsList.length;
      choiceCardsList[nextIdx].card.focus();
    } else if (active === btnNext) {
      btnSound.focus();
    } else {
      choiceCardsList[0]?.card.focus();
    }
  } else if (key === 'ArrowLeft') {
    e.preventDefault();
    if (activeCardIdx !== -1) {
      const prevIdx = (activeCardIdx - 1 + choiceCardsList.length) % choiceCardsList.length;
      choiceCardsList[prevIdx].card.focus();
    } else if (active === btnSound) {
      btnNext.focus();
    } else {
      choiceCardsList[choiceCardsList.length - 1]?.card.focus();
    }
  } else if (key === 'ArrowDown') {
    e.preventDefault();
    if (activeCardIdx !== -1) {
      btnNext.focus();
    }
  } else if (key === 'ArrowUp') {
    e.preventDefault();
    if (active === btnNext || active === btnSound) {
      choiceCardsList[1]?.card.focus() || choiceCardsList[0]?.card.focus();
    } else {
      document.querySelector('.back-link')?.focus();
    }
  } else if (key === 'Enter' || code === 13) {
    if (active && typeof active.click === 'function') {
      active.click();
    }
  }
});

// Chạy khởi tạo
setupFullscreen();
renderPuzzle();

