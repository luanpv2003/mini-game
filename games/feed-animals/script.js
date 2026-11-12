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

// Âm thanh nhai nhóp nhép
function playMunchSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  const times = [0, 0.12, 0.24];
  times.forEach((t, i) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    }, t * 1000);
  });
}

// Âm thanh vui sướng khi ăn xong
function playHappySound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }, idx * 75);
  });
}

// Âm thanh boing ngộ nghĩnh khi chọn chưa đúng
function playBoingSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.12);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.32);
}

// Giọng nói tiếng Việt vui vẻ
function speakVietnamese(text) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.25; // Giọng cao, dễ thương cho trẻ
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.log('Speech synthesis not available', e);
  }
}

// Danh sách các bạn thú và món ăn
const ANIMAL_DATA = [
  {
    name: 'Bạn Khỉ Con',
    emoji: '🐵',
    favorite: { name: 'Quả Chuối', emoji: '🍌' },
    wrongs: [
      { name: 'Con Cá', emoji: '🐟' },
      { name: 'Hòn Đá', emoji: '🪨' },
      { name: 'Chiếc Tất', emoji: '🧦' }
    ],
    hungryText: 'Tớ đói quá! Tớ thèm chuối chín ngọt lịm!',
    thanksText: 'Chuối ngon quá! Cảm ơn bé nhé!'
  },
  {
    name: 'Bạn Thỏ Trắng',
    emoji: '🐰',
    favorite: { name: 'Cà Rốt', emoji: '🥕' },
    wrongs: [
      { name: 'Khúc Xương', emoji: '🍖' },
      { name: 'Xe Ô Tô', emoji: '🚗' },
      { name: 'Chiếc Dép', emoji: '👞' }
    ],
    hungryText: 'Tớ thèm củ cà rốt cam giòn rụm nè!',
    thanksText: 'Cà rốt ngon tuyệt cú mèo! Cảm ơn bé!'
  },
  {
    name: 'Bạn Mèo Mướp',
    emoji: '🐱',
    favorite: { name: 'Con Cá', emoji: '🐟' },
    wrongs: [
      { name: 'Quả Chuối', emoji: '🍌' },
      { name: 'Quả Bóng', emoji: '⚽' },
      { name: 'Bụi Cỏ', emoji: '🌿' }
    ],
    hungryText: 'Meo meo! Cho tớ xin một chú cá tươi nhé!',
    thanksText: 'Meo meo! Cá thơm ngon quá đi thôi!'
  },
  {
    name: 'Bạn Cún Con',
    emoji: '🐶',
    favorite: { name: 'Khúc Xương', emoji: '🍖' },
    wrongs: [
      { name: 'Cà Rốt', emoji: '🥕' },
      { name: 'Bong Bóng', emoji: '🎈' },
      { name: 'Quả Táo', emoji: '🍎' }
    ],
    hungryText: 'Gâu gâu! Có khúc xương thơm nào cho tớ không?',
    thanksText: 'Gâu gâu! Xương gặm đã quá! Cảm ơn bé!'
  },
  {
    name: 'Bạn Gấu Trúc',
    emoji: '🐼',
    favorite: { name: 'Cây Trúc', emoji: '🎋' },
    wrongs: [
      { name: 'Cây Kem', emoji: '🍦' },
      { name: 'Điện Thoại', emoji: '📱' },
      { name: 'Miếng Bánh', emoji: '🍰' }
    ],
    hungryText: 'Tớ muốn ăn lá trúc xanh non mơn mởn cơ!',
    thanksText: 'Lá trúc mát rượi! Gấu trúc no bụng rồi!'
  },
  {
    name: 'Bạn Bò Sữa',
    emoji: '🐮',
    favorite: { name: 'Cỏ Tươi', emoji: '🌿' },
    wrongs: [
      { name: 'Khúc Xương', emoji: '🍖' },
      { name: 'Bánh Pizza', emoji: '🍕' },
      { name: 'Chiếc Giày', emoji: '👟' }
    ],
    hungryText: 'Ùm bò... Cho tớ một bó cỏ xanh mướt nào!',
    thanksText: 'Cỏ ngọt thơm lành! Bé ngoan lắm nha!'
  },
  {
    name: 'Bạn Chuột Nhắt',
    emoji: '🐭',
    favorite: { name: 'Phô Mai', emoji: '🧀' },
    wrongs: [
      { name: 'Dưa Hấu', emoji: '🍉' },
      { name: 'Chìa Khóa', emoji: '🔑' },
      { name: 'Gà Rán', emoji: '🍗' }
    ],
    hungryText: 'Chít chít! Tớ mê miếng phô mai béo ngậy nhất!',
    thanksText: 'Phô mai béo ơi là béo! Chít chít thích quá!'
  },
  {
    name: 'Bạn Cánh Cụt',
    emoji: '🐧',
    favorite: { name: 'Con Tôm', emoji: '🦐' },
    wrongs: [
      { name: 'Cà Rốt', emoji: '🥕' },
      { name: 'Khúc Gỗ', emoji: '🪵' },
      { name: 'Hamburger', emoji: '🍔' }
    ],
    hungryText: 'Tớ sống ở băng tuyết, tớ thích ăn tôm cá mát lạnh!',
    thanksText: 'Tôm tươi ngọt lịm! Cảm ơn bé yêu nhé!'
  },
  {
    name: 'Bạn Voi Con',
    emoji: '🐘',
    favorite: { name: 'Dưa Hấu', emoji: '🍉' },
    wrongs: [
      { name: 'Khúc Xương', emoji: '🍖' },
      { name: 'Đồng Hồ', emoji: '⏰' },
      { name: 'Cái Kéo', emoji: '✂️' }
    ],
    hungryText: 'Vòi tớ dài ngoằng, tớ muốn ăn quả dưa hấu mát lành!',
    thanksText: 'Dưa hấu nhiều nước quá! Voi vẫy tai cảm ơn bé!'
  },
  {
    name: 'Bạn Gấu Nâu',
    emoji: '🐻',
    favorite: { name: 'Mật Ong', emoji: '🍯' },
    wrongs: [
      { name: 'Hòn Đá', emoji: '🪨' },
      { name: 'Chiếc Giày', emoji: '👞' },
      { name: 'Cà Rốt', emoji: '🥕' }
    ],
    hungryText: 'Gấu mê hũ mật ong vàng óng ngọt ngào nhất trên đời!',
    thanksText: 'Mật ong thơm lừng! Bé thật là tuyệt vời!'
  }
];

// Canvas Hạt Hiệu Ứng (Confetti & Hearts)
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
    const speed = 2 + Math.random() * 5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2;
    this.size = 12 + Math.random() * 16;
    this.emoji = ['⭐', '❤️', '✨', '💖', '🎉', '🌸'][Math.floor(Math.random() * 6)];
    this.alpha = 1;
    this.decay = 0.015 + Math.random() * 0.015;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.15;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12; // trọng lực nhẹ
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

function burstParticles(x, y, count = 20) {
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

// Trạng thái Game
let currentIdx = 0;
let isBusy = false;
let shuffledAnimals = [...ANIMAL_DATA].sort(() => Math.random() - 0.5);
let foodCardsList = [];

const animalAvatar = document.getElementById('animal-avatar');
const animalEmojiEl = document.getElementById('animal-emoji');
const animalNameEl = document.getElementById('animal-name');
const speechBubbleEl = document.getElementById('speech-bubble');
const speechTextEl = document.getElementById('speech-text');
const foodOptionsEl = document.getElementById('food-options');
const toastEl = document.getElementById('toast');
const btnNext = document.getElementById('btn-next');
const btnSound = document.getElementById('btn-sound');
const soundLabel = document.getElementById('sound-label');

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1600);
}

function renderCurrentAnimal() {
  isBusy = false;
  const current = shuffledAnimals[currentIdx];

  animalEmojiEl.textContent = current.emoji;
  animalNameEl.textContent = current.name;
  speechTextEl.textContent = current.hungryText;

  animalAvatar.className = 'animal-avatar';

  // Lấy món đúng + 2 món sai ngẫu nhiên
  const wrongPool = [...current.wrongs].sort(() => Math.random() - 0.5).slice(0, 2);
  const foodList = [
    { ...current.favorite, isCorrect: true },
    { ...wrongPool[0], isCorrect: false },
    { ...wrongPool[1], isCorrect: false }
  ].sort(() => Math.random() - 0.5);

  foodOptionsEl.innerHTML = '';
  foodCardsList = [];
  foodList.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.tabIndex = 0;
    card.dataset.correct = item.isCorrect ? 'true' : 'false';
    card.dataset.name = item.name;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="tv-key-badge">${index + 1}</div>
      <div class="food-emoji">${item.emoji}</div>
      <div class="food-label">${item.name}</div>
    `;

    // Hỗ trợ chạm (Tap / Click)
    card.addEventListener('click', (e) => handleFoodClick(card, item));

    // Hỗ trợ Kéo Thả (Touch / Pointer drag)
    setupDragDrop(card, item);

    foodOptionsEl.appendChild(card);
    foodCardsList.push({ card, item });
  });

  // Tự động focus thẻ đầu tiên cho Remote TV
  setTimeout(() => {
    if (foodCardsList.length > 0) {
      foodCardsList[0].card.focus();
    }
  }, 100);

  // Giọng nói mở đầu
  setTimeout(() => {
    speakVietnamese(current.hungryText);
  }, 300);
}

// Xử lý khi chạm vào món ăn
function handleFoodClick(card, item) {
  if (isBusy) return;
  getAudioContext();

  if (item.isCorrect) {
    feedSuccess(card, item);
  } else {
    feedWrong(card, item);
  }
}

// Xử lý khi chọn sai
function feedWrong(card, item) {
  playBoingSound();
  card.classList.add('wrong');
  animalAvatar.classList.add('shake');

  const randomHints = [
    `Hổng phải ${item.name} đâu nè hihi!`,
    `Bạn ấy hổng ăn ${item.name} đâu bé ơi!`,
    `Bé thử tìm món khác ngon hơn xem nào!`
  ];
  const hint = randomHints[Math.floor(Math.random() * randomHints.length)];
  speechTextEl.textContent = hint;
  showToast(hint);
  speakVietnamese(hint);

  setTimeout(() => {
    card.classList.remove('wrong');
    animalAvatar.classList.remove('shake');
  }, 600);
}

// Xử lý khi chọn đúng
function feedSuccess(card, item) {
  isBusy = true;
  playMunchSound();

  // Tạo thẻ bay từ vị trí hiện tại vào miệng thú
  const cardRect = card.getBoundingClientRect();
  const animalRect = animalAvatar.getBoundingClientRect();

  const flyer = document.createElement('div');
  flyer.className = 'food-flying';
  flyer.style.left = `${cardRect.left}px`;
  flyer.style.top = `${cardRect.top}px`;
  flyer.style.width = `${cardRect.width}px`;
  flyer.style.height = `${cardRect.height}px`;
  flyer.innerHTML = card.innerHTML;
  document.body.appendChild(flyer);

  card.style.opacity = '0.2';
  animalAvatar.classList.add('mouth-open');

  // Bay vào miệng
  requestAnimationFrame(() => {
    const targetX = animalRect.left + animalRect.width / 2 - cardRect.width / 2;
    const targetY = animalRect.top + animalRect.height / 2 - cardRect.height / 2;
    flyer.style.transform = `translate(${targetX - cardRect.left}px, ${targetY - cardRect.top}px) scale(0.35)`;
    flyer.style.opacity = '0';
  });

  setTimeout(() => {
    flyer.remove();
    animalAvatar.classList.remove('mouth-open');
    animalAvatar.classList.add('chewing');

    // Hiệu ứng hạt sao từ miệng
    const canvasRect = canvas.getBoundingClientRect();
    const burstX = animalRect.left + animalRect.width / 2 - canvasRect.left;
    const burstY = animalRect.top + animalRect.height / 2 - canvasRect.top;
    burstParticles(burstX, burstY, 25);

    const current = shuffledAnimals[currentIdx];
    speechTextEl.textContent = current.thanksText;
    showToast(`😋 ${current.thanksText}`);
    speakVietnamese(current.thanksText);

    setTimeout(() => {
      playHappySound();
      animalAvatar.classList.remove('chewing');
      animalAvatar.classList.add('jump');

      burstParticles(burstX, burstY - 20, 20);

      // Chuyển sang bạn thú tiếp theo sau 1.8s
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % shuffledAnimals.length;
        renderCurrentAnimal();
      }, 1500);
    }, 900);
  }, 450);
}

// Kéo thả cảm ứng mượt mà
function setupDragDrop(card, item) {
  let isDragging = false;
  let startX, startY;
  let origRect;

  function onPointerDown(e) {
    if (isBusy) return;
    isDragging = true;
    card.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    origRect = card.getBoundingClientRect();
    card.style.zIndex = '1000';
    card.style.transition = 'none';
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    card.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;

    // Kiểm tra gần miệng thú
    const animalRect = animalAvatar.getBoundingClientRect();
    const curX = e.clientX;
    const curY = e.clientY;
    const dist = Math.hypot(
      curX - (animalRect.left + animalRect.width / 2),
      curY - (animalRect.top + animalRect.height / 2)
    );

    if (dist < 110) {
      animalAvatar.classList.add('mouth-open');
    } else {
      animalAvatar.classList.remove('mouth-open');
    }
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    animalAvatar.classList.remove('mouth-open');

    const animalRect = animalAvatar.getBoundingClientRect();
    const curX = e.clientX;
    const curY = e.clientY;
    const dist = Math.hypot(
      curX - (animalRect.left + animalRect.width / 2),
      curY - (animalRect.top + animalRect.height / 2)
    );

    card.style.transition = 'transform 0.25s ease';
    card.style.transform = '';
    card.style.zIndex = '';

    // Nếu thả vào gần miệng thú
    if (dist < 120) {
      if (item.isCorrect) {
        feedSuccess(card, item);
      } else {
        feedWrong(card, item);
      }
    }
  }

  card.addEventListener('pointerdown', onPointerDown);
  card.addEventListener('pointermove', onPointerMove);
  card.addEventListener('pointerup', onPointerUp);
  card.addEventListener('pointercancel', onPointerUp);
}

// Chuyển bạn thú tiếp theo bằng nút
btnNext.addEventListener('click', () => {
  if (isBusy) return;
  getAudioContext();
  currentIdx = (currentIdx + 1) % shuffledAnimals.length;
  renderCurrentAnimal();
});

// Bật/tắt âm thanh
btnSound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundLabel.textContent = soundEnabled ? 'Âm thanh: Bật 🔊' : 'Âm thanh: Tắt 🔇';
  showToast(soundEnabled ? 'Đã bật âm thanh 🔊' : 'Đã tắt âm thanh 🔇');
});

// Khởi tạo Fullscreen
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
    if (foodCardsList[num - 1]) {
      e.preventDefault();
      foodCardsList[num - 1].card.click();
      return;
    }
  }

  // Điều hướng Mũi tên TV
  const active = document.activeElement;
  let activeCardIdx = foodCardsList.findIndex(f => f.card === active);

  if (key === 'ArrowRight') {
    e.preventDefault();
    if (activeCardIdx !== -1) {
      const nextIdx = (activeCardIdx + 1) % foodCardsList.length;
      foodCardsList[nextIdx].card.focus();
    } else if (active === btnNext) {
      btnSound.focus();
    } else {
      foodCardsList[0]?.card.focus();
    }
  } else if (key === 'ArrowLeft') {
    e.preventDefault();
    if (activeCardIdx !== -1) {
      const prevIdx = (activeCardIdx - 1 + foodCardsList.length) % foodCardsList.length;
      foodCardsList[prevIdx].card.focus();
    } else if (active === btnSound) {
      btnNext.focus();
    } else {
      foodCardsList[foodCardsList.length - 1]?.card.focus();
    }
  } else if (key === 'ArrowDown') {
    e.preventDefault();
    if (activeCardIdx !== -1) {
      btnNext.focus();
    }
  } else if (key === 'ArrowUp') {
    e.preventDefault();
    if (active === btnNext || active === btnSound) {
      foodCardsList[1]?.card.focus() || foodCardsList[0]?.card.focus();
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
renderCurrentAnimal();

