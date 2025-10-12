document.addEventListener('DOMContentLoaded', () => {
    const questionImage = document.getElementById('question-image');
    const questionText = document.getElementById('question-text');
    const trueBtn = document.getElementById('true-btn');
    const falseBtn = document.getElementById('false-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionArea = document.getElementById('question-area');

    const backgroundMusic = document.getElementById('background-music');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    // --- Dữ liệu câu hỏi (thay thế bằng dữ liệu thực của bạn) ---
    const questions = [
        {
            image: 'https://media.coolmate.me/image/October2025/mceclip0_77.jpg', // Thay bằng đường dẫn hình ảnh của bạn
            text: 'Đây là con mèo.',
            answer: true
        },
        {
            image: 'https://media.coolmate.me/image/October2025/mceclip1_63.jpg', // Thay bằng đường dẫn hình ảnh của bạn
            text: 'Đây là con voi.',
            answer: true
        },
        {
            image: 'https://media.coolmate.me/image/October2025/mceclip2_52.jpg', // Thay bằng đường dẫn hình ảnh của bạn
            text: 'Đây là con gà.',
            answer: false
        }
    ];

    let currentQuestionIndex = 0;
    let canAnswer = true;

    function loadQuestion() {
        canAnswer = true;
        const question = questions[currentQuestionIndex];
        questionImage.src = question.image;
        questionText.textContent = question.text;

        // Reset styles and buttons
        trueBtn.classList.remove('correct', 'wrong');
        falseBtn.classList.remove('correct', 'wrong');
        nextBtn.style.display = 'none';
        trueBtn.disabled = false;
        falseBtn.disabled = false;

        // Animation: Enter
        questionArea.classList.remove('exit', 'enter');
        void questionArea.offsetWidth; // Trigger reflow
        questionArea.classList.add('active');
    }

    function handleAnswer(userAnswer) {
        if (!canAnswer) return;
        canAnswer = false;

        const question = questions[currentQuestionIndex];
        const correctButton = question.answer ? trueBtn : falseBtn;
        const wrongButton = question.answer ? falseBtn : trueBtn;

        if (userAnswer === question.answer) {
            correctButton.classList.add('correct');
            correctSound.play();
        } else {
            wrongButton.classList.add('wrong');
            correctButton.classList.add('correct'); // Show correct answer
            wrongSound.play();
        }

        trueBtn.disabled = true;
        falseBtn.disabled = true;
        nextBtn.style.display = 'block';
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex >= questions.length) {
            // End of game
            questionArea.innerHTML = `<h2>Chúc mừng!</h2><p>Bạn đã hoàn thành tất cả các câu hỏi.</p>`;
            nextBtn.style.display = 'none';
            trueBtn.style.display = 'none';
            falseBtn.style.display = 'none';
            return;
        }

        // Animation: Exit
        questionArea.classList.add('exit');

        setTimeout(() => {
            questionArea.classList.add('enter');
            loadQuestion();
        }, 500); // Match CSS transition duration
    }

    // --- Event Listeners ---
    trueBtn.addEventListener('click', () => handleAnswer(true));
    falseBtn.addEventListener('click', () => handleAnswer(false));
    nextBtn.addEventListener('click', nextQuestion);

    // --- Khởi tạo game ---
    function initGame() {
        // Thiết lập đường dẫn âm thanh
        backgroundMusic.src = 'sounds/background_music.mp3';
        correctSound.src = 'sounds/correct.mp3';
        wrongSound.src = 'sounds/wrong.mp3';

        // Bắt đầu nhạc nền (cần tương tác của người dùng để tự động phát trên một số trình duyệt)
        document.body.addEventListener('click', () => {
            backgroundMusic.play().catch(e => console.log("Không thể phát nhạc nền tự động."));
        }, { once: true });

        loadQuestion();
    }

    initGame();
});