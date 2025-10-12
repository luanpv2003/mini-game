document.addEventListener('DOMContentLoaded', () => {
    const questionImage = document.getElementById('question-image');
    const questionText = document.getElementById('question-text');
    const answerButtons = document.getElementById('answer-buttons');
    const trueBtn = document.getElementById('true-btn');
    const falseBtn = document.getElementById('false-btn');
    const imageAnswersContainer = document.getElementById('image-answers');
    const nextBtn = document.getElementById('next-btn');
    const questionArea = document.getElementById('question-area');

    const backgroundMusic = document.getElementById('background-music');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    // --- Dữ liệu câu hỏi với 2 dạng ---
    const questions = [
        {
            type: 'true_false', // Dạng 1: Câu hỏi hình, đáp án Đúng/Sai
            image: 'https://media.coolmate.me/image/October2025/mceclip3_34.png',
            text: 'Câu 1: Đây là hoa khô?',
            answer: true
        },
        {
            type: 'image_question', // Dạng 2: Câu hỏi chữ, đáp án hình
            text: 'Câu 2: Đâu là túi vải?',
            answers: [
                { image: 'https://media.coolmate.me/image/October2025/mceclip4_55.png', isCorrect: false },
                { image: 'https://media.coolmate.me/image/October2025/mceclip5_32.png', isCorrect: true }
            ]
        },
        {
            type: 'true_false',
            image: 'https://media.coolmate.me/image/October2025/mceclip6_8.png',
            text: 'Câu 3: Đây là túi thơm?',
            answer: true
        }
    ];

    let currentQuestionIndex = 0;
    let canAnswer = true;

    function loadQuestion() {
        canAnswer = true;
        const question = questions[currentQuestionIndex];

        // Reset chung
        nextBtn.style.display = 'none';
        nextBtn.textContent = 'Câu tiếp theo'; // Đặt lại văn bản nút
        imageAnswersContainer.innerHTML = '';

        if (question.type === 'true_false') {
            questionImage.style.display = 'block';
            answerButtons.style.display = 'flex';
            imageAnswersContainer.style.display = 'none';

            questionImage.src = question.image;
            questionText.textContent = question.text;

            [trueBtn, falseBtn].forEach(btn => {
                btn.classList.remove('correct', 'wrong');
                btn.disabled = false;
                btn.style.pointerEvents = 'auto';
                btn.style.visibility = 'visible';
                btn.style.opacity = '1';
            });

        } else if (question.type === 'image_question') {
            questionImage.style.display = 'none';
            answerButtons.style.display = 'none';
            imageAnswersContainer.style.display = 'flex';

            questionText.textContent = question.text;

            question.answers.forEach((answer, index) => {
                const img = document.createElement('img');
                img.src = answer.image;
                img.classList.add('image-answer');
                img.dataset.isCorrect = answer.isCorrect;

                // Reset styles để đảm bảo chúng không bị ảnh hưởng từ câu hỏi trước
                img.style.display = ''; // Xóa display:none nếu có
                img.style.transform = 'scale(1)';
                img.style.opacity = '1';
                img.style.width = ''; // Reset về giá trị mặc định trong CSS
                img.style.margin = ''; // Reset về giá trị mặc định trong CSS
                img.style.borderWidth = ''; // Reset về giá trị mặc định trong CSS

                img.style.animation = `fade-in-up 0.5s ${index * 0.1}s ease-out both`;
                img.addEventListener('click', () => handleAnswer(answer.isCorrect, img));
                imageAnswersContainer.appendChild(img);
            });
        }

        // Animation
        questionArea.classList.remove('exit', 'enter');
        void questionArea.offsetWidth; // Trigger reflow
        questionArea.classList.add('active');
    }

    function handleAnswer(isCorrect, clickedElement) {
        if (!canAnswer) return;

        const question = questions[currentQuestionIndex];

        if (isCorrect) {
            canAnswer = false;
            correctSound.play();
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            nextBtn.style.display = 'block';

            // Nếu là câu hỏi cuối cùng, đổi chữ trên nút
            if (currentQuestionIndex === questions.length - 1) {
                nextBtn.textContent = 'Kết thúc';
            }

            if (question.type === 'true_false') {
                clickedElement.classList.add('correct');
                // Ẩn nút còn lại
                if (clickedElement === trueBtn) {
                    falseBtn.style.visibility = 'hidden';
                    falseBtn.style.opacity = '0';
                } else {
                    trueBtn.style.visibility = 'hidden';
                    trueBtn.style.opacity = '0';
                }
                trueBtn.disabled = true;
                falseBtn.disabled = true;
            } else {
                Array.from(imageAnswersContainer.children).forEach(img => {
                    img.style.pointerEvents = 'none';
                    if (img.dataset.isCorrect === 'true') {
                        img.classList.add('correct');
                    } else {
                        // Kích hoạt chuỗi hiệu ứng được định nghĩa trong CSS
                        img.style.transform = 'scale(0)';
                        img.style.opacity = '0';
                        img.style.width = '0px';
                        img.style.margin = '0';
                        img.style.borderWidth = '0px';
                    }
                });
            }
        } else {
            wrongSound.play();
            clickedElement.classList.add('wrong');
            clickedElement.style.pointerEvents = 'none';
        }
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex >= questions.length) {
            questionArea.innerHTML = `<h2>Chúc mừng!</h2><p>Bạn đã hoàn thành tất cả các câu hỏi.</p>`;
            nextBtn.style.display = 'none';
            answerButtons.style.display = 'none';
            imageAnswersContainer.style.display = 'none';
            return;
        }

        questionArea.classList.add('exit');
        setTimeout(() => {
            questionArea.classList.add('enter');
            loadQuestion();
        }, 500);
    }

    // --- Event Listeners ---
    trueBtn.addEventListener('click', () => handleAnswer(questions[currentQuestionIndex].answer, trueBtn));
    falseBtn.addEventListener('click', () => handleAnswer(!questions[currentQuestionIndex].answer, falseBtn));
    nextBtn.addEventListener('click', nextQuestion);

    // --- Khởi tạo game ---
    function initGame() {
        backgroundMusic.src = 'sounds/urban-chill-with-scratch-loop-130bpm-273349.mp3';
        correctSound.src = 'sounds/correct-6033.mp3';
        wrongSound.src = 'sounds/error-04-199275.mp3';

        document.body.addEventListener('click', () => {
            backgroundMusic.play().catch(e => console.log("Không thể phát nhạc nền tự động."));
        }, { once: true });

        loadQuestion();
    }

    initGame();
});