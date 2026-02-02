// 存储题库数据
let quizData = [];

// 加载题库数据
async function loadQuizData() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Failed to load quiz data');
        }
        quizData = await response.json();
        // 随机排序题目
        shuffleArray(quizData);
        return true;
    } catch (error) {
        console.error('Error loading quiz data:', error);
        alert('加载题库数据失败，请刷新页面重试');
        return false;
    }
}

// 随机打乱数组函数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 应用状态
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let startTime = 0;
let endTime = 0;
let timerInterval = null;

// DOM 元素
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const submitBtn = document.getElementById('submit-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const timerElement = document.getElementById('timer');

const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const resultDetails = document.getElementById('result-details');

// 初始化应用
async function initApp() {
    // 加载题库数据
    await loadQuizData();
    
    startBtn.addEventListener('click', startQuiz);
    prevBtn.addEventListener('click', goToPreviousQuestion);
    nextBtn.addEventListener('click', goToNextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
    backHomeBtn.addEventListener('click', goToHome);
    submitBtn.addEventListener('click', endQuiz);
}

// 开始答题
function startQuiz() {
    welcomeScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    resultScreen.style.display = 'none';
    
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(quizData.length).fill(-1);
    startTime = Date.now();
    
    // 启动计时器
    startTimer();
    
    showQuestion(currentQuestionIndex);
    updateProgress();
}

// 显示问题
function showQuestion(index) {
    const question = quizData[index];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    feedback.innerHTML = '';
    
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.index = i;
        
        // 检查是否已经回答过
        if (userAnswers[index] !== -1) {
            optionElement.classList.add('selected');
            if (i === userAnswers[index]) {
                if (i === question.correct) {
                    optionElement.classList.add('correct');
                } else {
                    optionElement.classList.add('incorrect');
                }
            } else if (i === question.correct) {
                optionElement.classList.add('correct');
            }
        }
        
        optionElement.addEventListener('click', () => selectOption(index, i));
        optionsContainer.appendChild(optionElement);
    });
    
    // 更新导航按钮
    updateNavigationButtons();
}

// 选择选项
function selectOption(questionIndex, optionIndex) {
    if (userAnswers[questionIndex] !== -1) return;
    
    const question = quizData[questionIndex];
    userAnswers[questionIndex] = optionIndex;
    
    // 更新选项样式
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach((option, i) => {
        option.classList.add('selected');
        if (i === optionIndex) {
            if (i === question.correct) {
                option.classList.add('correct');
                feedback.innerHTML = '<div class="feedback correct">✓ 回答正确！</div>';
                score++;
                
                // 如果答案正确，延迟1秒后自动进入下一题
                setTimeout(() => {
                    goToNextQuestion();
                }, 1000);
            } else {
                option.classList.add('incorrect');
                feedback.innerHTML = `<div class="feedback incorrect">✗ 回答错误！正确答案是：${question.options[question.correct]}</div>`;
            }
        } else if (i === question.correct) {
            option.classList.add('correct');
        }
    });
    
    // 显示下一题按钮（仅当答案错误时需要）
    if (optionIndex !== question.correct) {
        nextBtn.style.display = 'inline-block';
    }
}

// 更新导航按钮
function updateNavigationButtons() {
    prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
    
    if (userAnswers[currentQuestionIndex] !== -1) {
        if (currentQuestionIndex === quizData.length - 1) {
            nextBtn.textContent = '完成答题';
        } else {
            nextBtn.textContent = '下一题';
        }
        nextBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'none';
    }
}

// 上一题
function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateProgress();
    }
}

// 下一题
function goToNextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateProgress();
    } else {
        // 完成答题
        endQuiz();
    }
}

// 更新进度条
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestionIndex + 1}/${quizData.length}`;
}

// 启动计时器
function startTimer() {
    // 清除之前的计时器
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // 重置计时器显示
    timerElement.textContent = '0';
    
    // 启动新的计时器
    let elapsedTime = 0;
    timerInterval = setInterval(() => {
        elapsedTime++;
        timerElement.textContent = elapsedTime;
    }, 1000);
}

// 结束答题
function endQuiz() {
    // 清除计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    endTime = Date.now();
    const timeTaken = Math.round((endTime - startTime) / 1000);
    
    // 显示结果
    quizScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    
    scoreElement.textContent = score;
    timeElement.textContent = timeTaken;
    
    // 显示详细结果
    resultDetails.innerHTML = '';
    quizData.forEach((question, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const isCorrect = userAnswers[index] === question.correct;
        resultItem.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        resultItem.innerHTML = `
            <strong>问题 ${index + 1}：</strong>${question.question}<br>
            <strong>你的答案：</strong>${userAnswers[index] !== -1 ? question.options[userAnswers[index]] : '未回答'}<br>
            <strong>正确答案：</strong>${question.options[question.correct]}
        `;
        
        resultDetails.appendChild(resultItem);
    });
}

// 重新答题
function restartQuiz() {
    startQuiz();
}

// 返回首页
function goToHome() {
    welcomeScreen.style.display = 'block';
    quizScreen.style.display = 'none';
    resultScreen.style.display = 'none';
}

// 初始化应用
initApp();