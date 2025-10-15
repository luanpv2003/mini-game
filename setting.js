document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email-input');
    const loadBtn = document.getElementById('load-questions-btn');
    const saveBtn = document.getElementById('save-questions-btn');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const editorContainer = document.getElementById('editor-container');
    const questionsList = document.getElementById('questions-list');
    const statusMessage = document.getElementById('status-message');
    const logoutBtn = document.getElementById('logout-btn');

    let currentQuestions = [];
    let currentEmail = '';

    // --- API Functions ---
    async function fetchQuestionSet(email) {
        try {
            const res = await fetch(`/api/questions?email=${encodeURIComponent(email)}`);
            if (res.status === 404) return await fetchDefaultQuestions();
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            const data = await res.json();
            return data.questions;
        } catch (error) {
            updateStatus(`Lỗi tải câu hỏi: ${error.message}`, 'error');
            return null;
        }
    }

    async function fetchDefaultQuestions() {
        try {
            const res = await fetch('/questions.json');
            if (!res.ok) throw new Error('Không thể tải file questions.json mặc định.');
            return await res.json();
        } catch (error) {
            updateStatus(`Lỗi: ${error.message}`, 'error');
            return null;
        }
    }

    async function saveQuestionSet(email, questions) {
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, questions }),
            });
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            updateStatus('Lưu thành công!', 'success');
        } catch (error) {
            updateStatus(`Lỗi khi lưu: ${error.message}`, 'error');
        }
    }
    
    function updateStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.style.color = 'white';
        if (type === 'success') {
            statusMessage.style.backgroundColor = 'var(--success-color)';
        } else if (type === 'error') {
            statusMessage.style.backgroundColor = 'var(--danger-color)';
        } else {
            statusMessage.style.backgroundColor = 'var(--gray-500)';
        }
        statusMessage.style.display = 'block';
        setTimeout(() => { statusMessage.style.display = 'none'; }, 3000);
    }

    // --- Editor Rendering ---
    function renderQuestions() {
        questionsList.innerHTML = '';
        currentQuestions.forEach((q, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question-editor';
            questionElement.dataset.index = index;

            let content = `
                <div class="question-header">
                    <h3>Câu hỏi ${index + 1}</h3>
                    <button class="btn btn-danger remove-question-btn">Xóa</button>
                </div>
                <div class="field-group">
                    <label>Loại câu hỏi:</label>
                    <select class="question-type">
                        <option value="true_false" ${q.type === 'true_false' ? 'selected' : ''}>Đúng/Sai</option>
                        <option value="image_question" ${q.type === 'image_question' ? 'selected' : ''}>Chọn 1 ảnh đúng</option>
                        <option value="multi_select_image" ${q.type === 'multi_select_image' ? 'selected' : ''}>Chọn nhiều ảnh đúng</option>
                    </select>
                </div>
                <div class="field-group">
                    <label>Nội dung câu hỏi:</label>
                    <textarea class="question-text">${q.text}</textarea>
                </div>
                <div class="specific-fields"></div>
            `;
            questionElement.innerHTML = content;
            questionsList.appendChild(questionElement);
            renderSpecificFields(questionElement, q);
        });
    }

    function renderSpecificFields(questionElement, questionData) {
        const container = questionElement.querySelector('.specific-fields');
        const type = questionElement.querySelector('.question-type').value;
        container.innerHTML = '';

        if (type === 'true_false') {
            container.innerHTML = `
                <div class="field-group">
                    <label>Link ảnh:</label>
                    <div class="image-input-group">
                        ${questionData.image ? `<img src="${questionData.image}" class="image-preview">` : `<div class="image-preview"></div>`}
                        <input type="text" class="question-image" value="${questionData.image || ''}">
                        <button class="btn btn-secondary upload-btn">Upload</button>
                        <input type="file" class="file-input" accept="image/*" style="display: none;">
                    </div>
                </div>
                <div class="field-group">
                    <label>Đáp án đúng là:</label>
                    <select class="question-answer">
                        <option value="true" ${questionData.answer === true ? 'selected' : ''}>Đúng</option>
                        <option value="false" ${questionData.answer === false ? 'selected' : ''}>Sai</option>
                    </select>
                </div>
            `;
        } else if (type === 'image_question' || type === 'multi_select_image') {
            let answersHtml = '<div class="field-group"><label>Các đáp án hình ảnh:</label><div class="answers-editor">';
            if (questionData.answers) {
                questionData.answers.forEach((ans, i) => {
                    answersHtml += `
                        <div class="answer" data-answer-index="${i}">
                             <div class="image-input-group">
                                ${ans.image ? `<img src="${ans.image}" class="image-preview">` : `<div class="image-preview"></div>`}
                                <input type="text" placeholder="Link ảnh đáp án" value="${ans.image}">
                                <button class="btn btn-secondary upload-btn">Upload</button>
                                <input type="file" class="file-input" accept="image/*" style="display: none;">
                            </div>
                            <div class="answer-check">
                                <input type="checkbox" id="check-${questionElement.dataset.index}-${i}" ${ans.isCorrect ? 'checked' : ''}>
                                <label for="check-${questionElement.dataset.index}-${i}">Đúng</label>
                            </div>
                            <button class="btn btn-danger remove-answer-btn">Xóa</button>
                        </div>
                    `;
                });
            }
            answersHtml += '</div></div><button class="btn btn-secondary add-answer-btn">+ Thêm đáp án ảnh</button>';
            container.innerHTML = answersHtml;
        }
    }

    // --- Event Handlers ---
    loadBtn.addEventListener('click', async () => {
        currentEmail = emailInput.value.trim();
        if (!currentEmail) {
            alert('Vui lòng nhập email.');
            return;
        }
        updateStatus('Đang tải...', 'info');
        const questions = await fetchQuestionSet(currentEmail);
        if (questions) {
            currentQuestions = questions;
            renderQuestions();
            editorContainer.style.display = 'block';
            statusMessage.style.display = 'none';
        }
    });

    addQuestionBtn.addEventListener('click', () => {
        currentQuestions.push({ type: 'true_false', text: 'Câu hỏi mới?', answer: true, image: '' });
        renderQuestions();
    });

    saveBtn.addEventListener('click', () => {
        const newQuestions = [];
        const questionElements = questionsList.querySelectorAll('.question-editor');
        
        questionElements.forEach(el => {
            const type = el.querySelector('.question-type').value;
            const text = el.querySelector('.question-text').value;
            const question = { type, text };

            if (type === 'true_false') {
                question.image = el.querySelector('.question-image').value;
                question.answer = el.querySelector('.question-answer').value === 'true';
            } else {
                question.answers = [];
                el.querySelectorAll('.answer').forEach(ansEl => {
                    const image = ansEl.querySelector('input[type="text"]').value;
                    const isCorrect = ansEl.querySelector('input[type="checkbox"]').checked;
                    if(image) question.answers.push({ image, isCorrect });
                });
            }
            newQuestions.push(question);
        });

        currentQuestions = newQuestions;
        updateStatus('Đang lưu...', 'info');
        saveQuestionSet(currentEmail, currentQuestions);
        renderQuestions();
    });

    questionsList.addEventListener('input', (e) => {
        if (e.target.matches('input[type="text"]') && e.target.closest('.image-input-group')) {
            const group = e.target.closest('.image-input-group');
            const url = e.target.value;
            let previewContainer = group.querySelector('.image-preview');

            // Create a new preview element based on the URL
            let newPreview;
            if (url) {
                newPreview = document.createElement('img');
                newPreview.src = url;
                newPreview.className = 'image-preview';
            } else {
                newPreview = document.createElement('div');
                newPreview.className = 'image-preview';
            }

            if (previewContainer) {
                previewContainer.replaceWith(newPreview);
            }
        }
    });

    questionsList.addEventListener('click', (e) => {
        const questionEditor = e.target.closest('.question-editor');
        if (!questionEditor) return;

        if (e.target.classList.contains('remove-question-btn')) {
            const index = parseInt(questionEditor.dataset.index, 10);
            currentQuestions.splice(index, 1);
            renderQuestions();
        }
        if (e.target.classList.contains('add-answer-btn')) {
            const index = parseInt(questionEditor.dataset.index, 10);
            if (!currentQuestions[index].answers) currentQuestions[index].answers = [];
            currentQuestions[index].answers.push({ image: '', isCorrect: false });
            renderQuestions();
        }
        if (e.target.classList.contains('remove-answer-btn')) {
            const answerEl = e.target.closest('.answer');
            const qIndex = parseInt(questionEditor.dataset.index, 10);
            const aIndex = parseInt(answerEl.dataset.answerIndex, 10);
            currentQuestions[qIndex].answers.splice(aIndex, 1);
            renderQuestions();
        }

        if (e.target.classList.contains('upload-btn')) {
            const group = e.target.closest('.image-input-group');
            const fileInput = group.querySelector('.file-input');
            fileInput.click();
        }
    });

    questionsList.addEventListener('change', async (e) => {
        // Handle file input change for image uploads
        if (e.target.classList.contains('file-input')) {
            const file = e.target.files[0];
            if (!file) return;

            const group = e.target.closest('.image-input-group');
            const uploadBtn = group.querySelector('.upload-btn');
            const originalText = uploadBtn.textContent;
            uploadBtn.textContent = 'Đang tải...';
            uploadBtn.disabled = true;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const result = await response.json();

                if (result.success) {
                    const urlInput = group.querySelector('input[type="text"]');
                    urlInput.value = result.url;
                    urlInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('Upload ảnh thất bại.');
            } finally {
                uploadBtn.textContent = originalText;
                uploadBtn.disabled = false;
            }
        }

        // Handle question type change
        if (e.target.classList.contains('question-type')) {
            const questionEditor = e.target.closest('.question-editor');
            const index = parseInt(questionEditor.dataset.index, 10);
            const newType = e.target.value;
            
            const newQuestionData = { type: newType, text: currentQuestions[index].text };

            if (newType === 'true_false') {
                newQuestionData.answer = true;
                newQuestionData.image = '';
            } else {
                newQuestionData.answers = [{ image: '', isCorrect: true }];
            }
            
            currentQuestions[index] = newQuestionData;
            renderQuestions();
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('miniGameEmail');
        window.location.href = '/';
    });

    // --- Auto-login and Initialization ---
    async function initializePage() {
        const savedEmail = localStorage.getItem('miniGameEmail');
        if (savedEmail) {
            emailInput.value = savedEmail;
            document.querySelector('header.card').style.display = 'none';
            
            // Automatically trigger loading questions
            currentEmail = savedEmail;
            updateStatus('Đang tải câu hỏi của bạn...', 'info');
            const questions = await fetchQuestionSet(currentEmail);
            if (questions) {
                currentQuestions = questions;
                renderQuestions();
                editorContainer.style.display = 'block';
                statusMessage.style.display = 'none';
            }
        }
    }

    initializePage();
});