document.addEventListener("DOMContentLoaded", () => {
  const questionImage = document.getElementById("question-image");
  const questionText = document.getElementById("question-text");
  const answerButtons = document.getElementById("answer-buttons");
  const trueBtn = document.getElementById("true-btn");
  const falseBtn = document.getElementById("false-btn");
  const imageAnswersContainer = document.getElementById("image-answers");
  const nextBtn = document.getElementById("next-btn");
  const questionArea = document.getElementById("question-area");
  const gameContainer = document.getElementById("game-container"); // Thêm gameContainer

  const correctSound = document.getElementById("correct-sound");
  const wrongSound = document.getElementById("wrong-sound");

  const questions = [
    {
      type: "true_false",
      image: "https://media.coolmate.me/image/October2025/mceclip6_8.png",
      text: "Câu 1: Đây là túi thơm?",
      answer: true,
    },
    {
      type: "true_false",
      image: "https://media.coolmate.me/image/October2025/mceclip3_34.png",
      text: "Câu 2: Đây là hoa hồng khô?",
      answer: true,
    },
    {
      type: "image_question",
      text: "Câu 3: Đâu là túi vải?",
      answers: [
        {
          image: "https://media.coolmate.me/image/October2025/mceclip4_55.png",
          isCorrect: false,
        },
        {
          image: "https://media.coolmate.me/image/October2025/mceclip5_32.png",
          isCorrect: true,
        },
      ],
    },
    {
      type: "true_false",
      image: "https://media.coolmate.me/image/October2025/mceclip3_34.png",
      text: "Câu 4: Hoa hồng khô có mùi thơm?",
      answer: true,
    },
    {
      type: "multi_select_image",
      text: "Câu 5: Nguyên liệu làm túi thơm?",
      answers: [
        {
          image: "https://media.coolmate.me/image/October2025/mceclip3_34.png",
          isCorrect: true,
        },
        {
          image: "https://media.coolmate.me/image/October2025/mceclip4_55.png",
          isCorrect: false,
        },
        {
          image: "https://media.coolmate.me/image/October2025/mceclip5_32.png",
          isCorrect: true,
        },
      ],
    },
  ];

  let currentQuestionIndex = 0;
  let canAnswer = true;

  function loadQuestion() {
    canAnswer = true;
    const question = questions[currentQuestionIndex];

    // Thay đổi kích thước container cho câu hỏi trắc nghiệm
    if (question.type === "multi_select_image") {
      gameContainer.style.maxWidth = "750px";
    } else {
      gameContainer.style.maxWidth = "500px";
    }

    // Reset chung
    nextBtn.style.display = "none";
    nextBtn.textContent = "Câu tiếp theo";
    imageAnswersContainer.innerHTML = "";

    questionImage.style.display =
      question.type === "true_false" ? "block" : "none";
    answerButtons.style.display =
      question.type === "true_false" ? "flex" : "none";
    imageAnswersContainer.style.display = question.type.includes("image")
      ? "flex"
      : "none";

    questionText.textContent = question.text;
    if (question.type === "true_false") {
      questionImage.src = question.image;
      [trueBtn, falseBtn].forEach((btn) => {
        btn.classList.remove("correct", "wrong");
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

        Object.assign(img.style, {
          display: "",
          transform: "scale(1)",
          opacity: "1",
          width: "",
          margin: "",
          borderWidth: "",
        });
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
      if (currentQuestionIndex === questions.length - 1)
        nextBtn.textContent = "Kết thúc";

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
    if (
      clickedImg.classList.contains("correct") ||
      clickedImg.classList.contains("wrong")
    )
      return;
    if (question.type === "multi_select_image" && !canAnswer) return;

    const isCorrect = clickedImg.dataset.isCorrect === "true";

    if (question.type === "image_question") {
      if (!canAnswer) return;
      if (isCorrect) {
        canAnswer = false;
        correctSound.play();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        nextBtn.style.display = "block";
        if (currentQuestionIndex === questions.length - 1)
          nextBtn.textContent = "Kết thúc";

        Array.from(imageAnswersContainer.children).forEach((img) => {
          img.style.pointerEvents = "none";
          if (img.dataset.isCorrect === "true") {
            img.classList.add("correct");
          } else {
            Object.assign(img.style, {
              transform: "scale(0)",
              opacity: "0",
              width: "0px",
              margin: "0",
              borderWidth: "0px",
            });
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
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          scalar: 0.8,
        });
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
    const totalCorrectAnswers = question.answers.filter(
      (a) => a.isCorrect
    ).length;
    const selectedCorrectAnswers = allAnswerElements.filter((img) =>
      img.classList.contains("correct")
    ).length;

    if (selectedCorrectAnswers === totalCorrectAnswers) {
      canAnswer = false;
      setTimeout(() => {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
      }, 100);
      nextBtn.style.display = "block";
      if (currentQuestionIndex === questions.length - 1)
        nextBtn.textContent = "Kết thúc";

      allAnswerElements.forEach((img) => {
        // Ẩn tất cả các đáp án không phải là đáp án đúng
        if (!img.classList.contains("correct")) {
          Object.assign(img.style, {
            transform: "scale(0)",
            opacity: "0",
            width: "0px",
            margin: "0",
            borderWidth: "0px",
          });
        }
      });
    }
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      questionArea.innerHTML = `<h2>Chúc mừng!</h2><p>Bạn đã hoàn thành tất cả các câu hỏi.</p>`;
      nextBtn.style.display = "none";
      answerButtons.style.display = "none";
      imageAnswersContainer.style.display = "none";
      gameContainer.style.maxWidth = "500px"; // Reset lại khi kết thúc
      return;
    }

    questionArea.classList.add("exit");
    setTimeout(() => {
      questionArea.classList.add("enter");
      loadQuestion();
    }, 500);
  }

  // --- Event Listeners ---
  trueBtn.addEventListener("click", () =>
    handleTrueFalseAnswer(questions[currentQuestionIndex].answer, trueBtn)
  );
  falseBtn.addEventListener("click", () =>
    handleTrueFalseAnswer(!questions[currentQuestionIndex].answer, falseBtn)
  );
  nextBtn.addEventListener("click", nextQuestion);

  // --- Logic Toàn màn hình ---
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const docElement = document.documentElement;

  const enterIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V5h-2v5h5V7h-3z"/></svg>`;
  const exitIcon = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;

  function setupFullscreen() {
    if (!document.fullscreenEnabled) {
      fullscreenBtn.style.display = "none";
      return;
    }
    fullscreenBtn.innerHTML = enterIcon;

    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        docElement.requestFullscreen().catch((err) => {
          alert(
            `Lỗi khi vào chế độ toàn màn hình: ${err.message} (${err.name})`
          );
        });
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        fullscreenBtn.innerHTML = exitIcon;
      } else {
        fullscreenBtn.innerHTML = enterIcon;
      }
    });
  }

  // --- Khởi tạo game ---
  function initGame() {
    setupFullscreen();
    correctSound.src = "sounds/correct-6033.mp3";
    wrongSound.src = "sounds/error-04-199275.mp3";
    loadQuestion();
  }

  initGame();
});
