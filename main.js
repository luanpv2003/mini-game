document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const questionImage = document.getElementById("question-image");
  const questionText = document.getElementById("question-text");
  const answerButtons = document.getElementById("answer-buttons");
  const trueBtn = document.getElementById("true-btn");
  const falseBtn = document.getElementById("false-btn");
  const imageAnswersContainer = document.getElementById("image-answers");
  const nextBtn = document.getElementById("next-btn");
  const questionArea = document.getElementById("question-area");
  const gameContainer = document.getElementById("game-container");
  const emailModal = document.getElementById("email-modal");
  const emailForm = document.getElementById("email-form");
  const emailInput = document.getElementById("email-input");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const authBtn = document.getElementById("auth-btn");
  const createQuestionBtn = document.getElementById("create-question-btn");
  const correctSound = document.getElementById("correct-sound");
  const wrongSound = document.getElementById("wrong-sound");

  // --- Game State ---
  let questions = [];
  let currentQuestionIndex = 0;
  let canAnswer = true;

  // --- Core Functions ---
  async function getQuestionSet(email) {
    try {
      const res = await fetch(`/api/questions?email=${encodeURIComponent(email)}`);
      if (res.status === 404) {
        console.log("No custom question set found for this email.");
        return null; // Explicitly return null for not found
      }
      if (!res.ok) {
        throw new Error(`API fetch failed with status ${res.status}`);
      }
      const data = await res.json();
      return data.questions;
    } catch (error) {
      console.error("Error fetching question set:", error);
      return null;
    }
  }

  async function loadDefaultQuestions() {
    try {
      const response = await fetch("questions.json");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Could not load default questions:", error);
      return null;
    }
  }

  function startGame(questionSet) {
    if (!questionSet || questionSet.length === 0) {
      questionArea.innerHTML = `<p style="color: red;">Lỗi: Không tìm thấy bộ câu hỏi. Vui lòng vào trang cài đặt để tạo một bộ câu hỏi mới hoặc kiểm tra lại email.</p>`;
      return;
    }
    questions = questionSet;
    emailModal.style.display = "none";
    gameContainer.style.display = "block";
    loadQuestion();
  }

  function loadQuestion() {
    canAnswer = true;
    const question = questions[currentQuestionIndex];

    gameContainer.style.maxWidth = question.type === "multi_select_image" ? "750px" : "500px";

    nextBtn.style.display = "none";
    nextBtn.textContent = "Câu tiếp theo";
    imageAnswersContainer.innerHTML = "";

    questionImage.style.display = question.type === "true_false" ? "block" : "none";
    answerButtons.style.display = question.type === "true_false" ? "flex" : "none";
    imageAnswersContainer.style.display = question.type.includes("image") ? "flex" : "none";

    questionText.textContent = question.text;

    if (question.type === "true_false") {
      questionImage.src = question.image;
      [trueBtn, falseBtn].forEach((btn) => {
        btn.className = 'btn icon-btn'; // Reset classes
        btn.disabled = false;
        btn.style.pointerEvents = "auto";
        btn.style.visibility = "visible";
        btn.style.opacity = "1";
      });
    } else if (question.type.includes("image")) {
      question.answers.forEach((answer, index) => {
        const img = document.createElement("img");
        img.src = answer.image;
        img.classList.add("image-answer");
        img.dataset.isCorrect = answer.isCorrect;
        img.style.animation = `fade-in-up 0.5s ${index * 0.1}s ease-out both`;
        img.addEventListener("click", () => handleImageClick(img, question));
        imageAnswersContainer.appendChild(img);
      });
    }

    questionArea.classList.remove("exit", "enter");
    void questionArea.offsetWidth;
    questionArea.classList.add("active");
  }

  function handleTrueFalseAnswer(isCorrect, clickedElement) {
    if (!canAnswer || clickedElement.classList.contains("wrong")) return;
    if (isCorrect) {
      canAnswer = false;
      correctSound.play();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      nextBtn.style.display = "block";
      if (currentQuestionIndex === questions.length - 1) nextBtn.textContent = "Kết thúc";

      clickedElement.classList.add("correct");
      const otherBtn = clickedElement === trueBtn ? falseBtn : trueBtn;
      otherBtn.style.visibility = "hidden";
      otherBtn.style.opacity = "0";
      trueBtn.disabled = true;
      falseBtn.disabled = true;
    } else {
      wrongSound.play();
      clickedElement.classList.add("wrong");
      clickedElement.style.pointerEvents = "none";
    }
  }

  function handleImageClick(clickedImg, question) {
    if (clickedImg.classList.contains("correct") || clickedImg.classList.contains("wrong")) return;
    if (question.type === "multi_select_image" && !canAnswer) return;

    const isCorrect = clickedImg.dataset.isCorrect === "true";

    if (question.type === "image_question") {
      if (!canAnswer) return;
      if (isCorrect) {
        canAnswer = false;
        correctSound.play();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        nextBtn.style.display = "block";
        if (currentQuestionIndex === questions.length - 1) nextBtn.textContent = "Kết thúc";

        Array.from(imageAnswersContainer.children).forEach((img) => {
          img.style.pointerEvents = "none";
          if (img.dataset.isCorrect === "true") {
            img.classList.add("correct");
          } else {
            Object.assign(img.style, { transform: "scale(0)", opacity: "0", width: "0px", margin: "0", borderWidth: "0px" });
          }
        });
      } else {
        wrongSound.play();
        clickedImg.classList.add("wrong");
        clickedImg.style.pointerEvents = "none";
      }
    } else if (question.type === "multi_select_image") {
      if (isCorrect) {
        correctSound.play();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 }, scalar: 0.8 });
        clickedImg.classList.add("correct");
      } else {
        wrongSound.play();
        clickedImg.classList.add("wrong");
      }
      clickedImg.style.pointerEvents = "none";
      checkMultiSelectCompletion(question);
    }
  }

  function checkMultiSelectCompletion(question) {
    const allAnswerElements = Array.from(imageAnswersContainer.children);
    const totalCorrectAnswers = question.answers.filter((a) => a.isCorrect).length;
    const selectedCorrectAnswers = allAnswerElements.filter((img) => img.classList.contains("correct")).length;

    if (selectedCorrectAnswers === totalCorrectAnswers) {
      canAnswer = false;
      setTimeout(() => {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
        nextBtn.style.display = "block";
        if (currentQuestionIndex === questions.length - 1) nextBtn.textContent = "Kết thúc";
      }, 100);

      allAnswerElements.forEach((img) => {
        if (!img.classList.contains("correct")) {
          Object.assign(img.style, { transform: "scale(0)", opacity: "0", width: "0px", margin: "0", borderWidth: "0px" });
        }
      });
    }
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      questionArea.innerHTML = `<h2>Chúc mừng!</h2><p>Bạn đã hoàn thành tất cả các câu hỏi.</p><button class="btn" onclick="location.reload()">Chơi lại</button>`;
      nextBtn.style.display = "none";
      answerButtons.style.display = "none";
      imageAnswersContainer.style.display = "none";
      gameContainer.style.maxWidth = "500px";
      return;
    }

    questionArea.classList.add("exit");
    setTimeout(() => {
      questionArea.classList.add("enter");
      loadQuestion();
    }, 500);
  }

  function setupFullscreen() {
    const docElement = document.documentElement;
    const enterIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V5h-2v5h5V7h-3z"/></svg>`;
    const exitIcon = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;

    if (!document.fullscreenEnabled) {
      fullscreenBtn.style.display = "none";
      return;
    }
    fullscreenBtn.innerHTML = enterIcon;

    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        docElement.requestFullscreen().catch((err) => {
          alert(`Lỗi khi vào chế độ toàn màn hình: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", () => {
      fullscreenBtn.innerHTML = document.fullscreenElement ? exitIcon : enterIcon;
    });
  }

  function updateAuthUI(isLoggedIn) {
    if (isLoggedIn) {
      authBtn.textContent = "Đăng xuất";
      createQuestionBtn.style.display = "block";
      authBtn.onclick = () => {
        localStorage.removeItem("miniGameEmail");
        location.reload();
      };
    } else {
      authBtn.textContent = "Đăng nhập";
      createQuestionBtn.style.display = "none";
      authBtn.onclick = () => {
        emailModal.style.display = "flex";
        gameContainer.style.display = "none";
      };
    }
  }

  async function initGame() {
    setupFullscreen();
    correctSound.src = "sounds/correct-6033.mp3";
    wrongSound.src = "sounds/error-04-199275.mp3";

    const savedEmail = localStorage.getItem("miniGameEmail");
    updateAuthUI(!!savedEmail);

    if (savedEmail) {
      let questionSet = await getQuestionSet(savedEmail);
      if (!questionSet) {
        questionSet = await loadDefaultQuestions();
      }
      startGame(questionSet);
    } else {
      emailModal.style.display = "flex";
      gameContainer.style.display = "none";
    }
  }

  // --- Event Listeners ---
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;
    localStorage.setItem("miniGameEmail", email);

    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Đang tìm bộ câu hỏi của bạn...';
    emailForm.appendChild(loadingMessage);

    let questionSet = await getQuestionSet(email);

    if (!questionSet) {
      loadingMessage.textContent = 'Không tìm thấy, đang tải bộ câu hỏi mặc định...';
      questionSet = await loadDefaultQuestions();
    }

    loadingMessage.remove();
    updateAuthUI(true);
    startGame(questionSet);
  });
  
  trueBtn.addEventListener("click", () => handleTrueFalseAnswer(questions[currentQuestionIndex].answer, trueBtn));
  falseBtn.addEventListener("click", () => handleTrueFalseAnswer(!questions[currentQuestionIndex].answer, falseBtn));
  nextBtn.addEventListener("click", nextQuestion);

  // --- Start Everything ---
  initGame();
});