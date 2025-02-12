class RouletteGame {  
    constructor(questions) {  
        this.options = ["Vocabulary", "Grammar", "Phrasal Verbs", "Idioms", "Synonyms", "Antonyms"];  
        this.questions = questions;  
        this.startAngle = 0;  
        this.arc = Math.PI / (this.options.length / 2);  
        this.spinTimeout = null;  
        this.spinAngleStart = 10;  
        this.spinTime = 0;  
        this.spinTimeTotal = 0;  
        this.ctx = null;  
        this.score = 0;  

        // Sonidos  
        this.spinSound = new Audio('spin.mp3');  
        this.backgroundMusic = new Audio('background.mp3');  
        this.correctSound = new Audio('correct.mp3');  
        this.incorrectSound = new Audio('incorrect.mp3');  
        this.backgroundMusic.loop = true; // Música de fondo en bucle  

        this.initialize();  
    }  

    initialize() {  
        document.getElementById("spin").addEventListener("click", () => this.spin());  
        document.getElementById("submit").addEventListener("click", () => this.checkAnswer());  
        this.drawRouletteWheel();  
        this.startBackgroundMusic();  
    }  

    startBackgroundMusic() {  
        this.backgroundMusic.play();  
    }  

    stopBackgroundMusic() {  
        this.backgroundMusic.pause();  
        this.backgroundMusic.currentTime = 0; // Reinicia la música al principio  
    }  

    drawRouletteWheel() {  
        const canvas = document.getElementById("canvas");  
        if (canvas.getContext) {  
            const outsideRadius = 200;  
            const textRadius = 160;  
            const insideRadius = 120;  

            this.ctx = canvas.getContext("2d");  
            this.ctx.clearRect(0, 0, 500, 500);  
            this.ctx.strokeStyle = "black";  
            this.ctx.lineWidth = 5;  
            this.ctx.font = 'bold 20px Montserrat, Arial';  

            for (let i = 0; i < this.options.length; i++) {  
                const angle = this.startAngle + i * this.arc;  
                this.ctx.fillStyle = this.getColor(i, this.options.length);  

                this.ctx.beginPath();  
                this.ctx.arc(250, 250, outsideRadius, angle, angle + this.arc, false);  
                this.ctx.arc(250, 250, insideRadius, angle + this.arc, angle, true);  
                this.ctx.stroke();  
                this.ctx.fill();  

                this.ctx.save();  
                this.ctx.fillStyle = "black";  
                this.ctx.translate(250 + Math.cos(angle + this.arc / 2) * textRadius,   
                                   250 + Math.sin(angle + this.arc / 2) * textRadius);  
                this.ctx.rotate(angle + this.arc / 2 + Math.PI / 2);  
                const text = this.options[i];  
                this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, 0);  
                this.ctx.restore();  
            }  

            // Draw the arrow  
            this.ctx.fillStyle = "black";  
            this.ctx.beginPath();  
            this.ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));  
            this.ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));  
            this.ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));  
            this.ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));  
            this.ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));  
            this.ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));  
            this.ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));  
            this.ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));  
            this.ctx.fill();  
        }  
    }  

    spin() {  
        this.spinSound.play(); // Reproduce el sonido al girar  
        this.spinAngleStart = Math.random() * 10 + 10;  
        this.spinTime = 0;  
        this.spinTimeTotal = Math.random() * 3 + 4 * 1000;  
        this.rotateWheel();  
    }  

    rotateWheel() {  
        this.spinTime += 30;  
        if (this.spinTime >= this.spinTimeTotal) {  
            this.stopRotateWheel();  
            return;  
        }  
        const spinAngle = this.spinAngleStart - this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);  
        this.startAngle += (spinAngle * Math.PI / 180);  
        this.drawRouletteWheel();  
        this.spinTimeout = setTimeout(() => this.rotateWheel(), 30);  
    }  

    stopRotateWheel() {  
        clearTimeout(this.spinTimeout);  
        const degrees = this.startAngle * 180 / Math.PI + 90;  
        const arcd = this.arc * 180 / Math.PI;  
        const index = Math.floor((360 - degrees % 360) / arcd);  
        
        this.ctx.save();  
        this.ctx.font = 'bold 30px Helvetica, Arial';  
        document.getElementById("question").innerText = this.questions[index].question;  
        
        // Populate answer options  
        this.populateOptions(index);  
        this.ctx.fillText(this.options[index], 250 - this.ctx.measureText(this.options[index]).width / 2, 250 + 10);  
        this.ctx.restore();  
    }  

    populateOptions(index) {  
        const optionsDiv = document.getElementById("options");  
        optionsDiv.innerHTML = ""; // Clear previous options  
        this.questions[index].options.forEach(option => {  
            const label = document.createElement("label");  
            label.innerHTML = `<input type="radio" name="answer" value="${option}"> ${option}<br>`;  
            optionsDiv.appendChild(label);  
        });  
    }  

    checkAnswer() {  
        const selectedOption = document.querySelector('input[name="answer"]:checked');  
        if (!selectedOption) {  
            document.getElementById("feedback").innerText = "Please select an answer.";  
            return;  
        }  
        
        const userAnswer = selectedOption.value;   
        const currentQuestionIndex = this.questions.findIndex(q => q.question === document.getElementById("question").innerText);  
        
        if (userAnswer === this.questions[currentQuestionIndex].answer) {  
            this.score++;  
            document.getElementById("feedback").innerText = "Correct! 🎉";  
            this.correctSound.play(); // Reproduce el sonido correcto  
        } else {  
            document.getElementById("feedback").innerText = "Incorrect. Try again. 😢";  
            this.incorrectSound.play(); // Reproduce el sonido incorrecto  
        }  

        document.getElementById("score-value").innerText = this.score;  
        document.getElementById("options").innerHTML = ""; // Clear options  
    }  

    getColor(item, maxitem) {  
        const phase = 0;  
        const center = 128;  
        const width = 127;  
        const frequency = Math.PI * 2 / maxitem;  

        const red = Math.sin(frequency * item + 2 + phase) * width + center;  
        const green = Math.sin(frequency * item + 0 + phase) * width + center;  
        const blue = Math.sin(frequency * item + 4 + phase) * width + center;  

        return this.RGB2Color(red, green, blue);  
    }  

    byte2Hex(n) {  
        const nybHexString = "0123456789ABCDEF";  
        return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);  
    }  

    RGB2Color(r, g, b) {  
        return '#' + this.byte2Hex(r) + this.byte2Hex(g) + this.byte2Hex(b);  
    }  

    easeOut(t, b, c, d) {  
        const ts = (t /= d) * t;  
        const tc = ts * t;  
        return b + c * (tc + -3 * ts + 3 * t);  
    }  
}  

// Aquí puedes configurar las preguntas y opciones  
const questionsData = [  
    { question: "What is the synonym of 'happy'?",   
      options: ["joyful", "sad", "angry", "surprised"],   
      answer: "joyful" },  
    { question: "What is the past tense of 'go'?",   
      options: ["went", "gone", "going", "goes"],   
      answer: "went" },  
    { question: "What does 'give up' mean?",   
      options: ["to quit", "to continue", "to win", "to lose"],   
      answer: "to quit" },  
    { question: "What does 'piece of cake' mean?",   
      options: ["difficult task", "easy", "sweet dessert", "meal"],   
      answer: "easy" },  
    { question: "What is a synonym for 'big'?",   
      options: ["large", "tiny", "small", "petite"],   
      answer: "large" },  
    { question: "What is the antonym of 'hot'?",   
      options: ["cold", "warm", "boiling", "freezing"],   
      answer: "cold" }  
];  

// Iniciar el juego  
const game = new RouletteGame(questionsData);  

// Memory Game  
let memoryCards = ["A", "A", "B", "B", "C", "C", "D", "D"];  
let firstCard = null;  
let secondCard = null;  
let lockBoard = false;  

function shuffle(array) {  
    return array.sort(() => Math.random() - 0.5); // Shuffle the cards  
}  

function createMemoryBoard() {  
    const board = document.getElementById("memory-board");  
    memoryCards = shuffle(memoryCards);  
    board.innerHTML = ""; // Clear the board  
    memoryCards.forEach((card) => {  
        const cardElement = document.createElement("div");  
        cardElement.classList.add("memory-card");  
        cardElement.dataset.cardValue = card;  
        cardElement.addEventListener("click", flipCard);  
        board.appendChild(cardElement);  
    });  
}  

function flipCard() {  
    if (lockBoard) return;  
    this.classList.toggle("flipped");   
    if (!firstCard) {  
        firstCard = this;  
        return;  
    }  
    secondCard = this;  

    checkForMatch();  
}  

function checkForMatch() {  
    const isMatch = firstCard.dataset.cardValue === secondCard.dataset.cardValue;  
    isMatch ? disableCards() : unflipCards();  
}  

function disableCards() {  
    firstCard.removeEventListener("click", flipCard);  
    secondCard.removeEventListener("click", flipCard);  
    resetBoard();  
}  

function unflipCards() {  
    lockBoard = true;  
    setTimeout(() => {  
        firstCard.classList.remove("flipped");  
        secondCard.classList.remove("flipped");  
        resetBoard();  
    }, 1500);  
}  

function resetBoard() {  
    [firstCard, secondCard, lockBoard] = [null, null, false];  
}  

createMemoryBoard(); // Initialize memory game  

// Matching Game  
const matchingData = ["1", "1", "2", "2", "3", "3", "4", "4"];  
let firstMatch = null;  
let secondMatch = null;  
let matchLocked = false;  
let matchedPairs = 0;  

function shuffleMatching(array) {  
    return array.sort(() => Math.random() - 0.5); // Shuffle matching cards  
}  

function createMatchingBoard() {  
    const board = document.getElementById("matching-board");  
    matchingData = shuffleMatching(matchingData);  
    board.innerHTML = ""; // Clear previous cards  
    matchingData.forEach((card) => {  
        const cardElement = document.createElement("div");  
        cardElement.classList.add("matching-card");  
        cardElement.dataset.cardValue = card;  
        cardElement.addEventListener("click", revealCard);  
        board.appendChild(cardElement);  
    });  
}  

function revealCard() {  
    if (matchLocked) return;  
    this.innerText = this.dataset.cardValue; // Show card value  
    this.classList.add("revealed");  

    if (!firstMatch) {  
        firstMatch = this;  
        return;  
    }  
    secondMatch = this;  

    checkForMatching();  
}  

function checkForMatching() {  
    const isMatch = firstMatch.dataset.cardValue === secondMatch.dataset.cardValue;  
    isMatch ? lockMatches() : hideCards();  
}  

function lockMatches() {  
    matchedPairs++;  
    firstMatch.removeEventListener("click", revealCard);  
    secondMatch.removeEventListener("click", revealCard);  
    firstMatch = secondMatch = null; // Reset matches  
    if (matchedPairs === matchingData.length / 2) {  
        document.getElementById("matching-feedback").innerText = "¡Felicidades, has emparejado todas las cartas! 🎉";  
    }  
}  

function hideCards() {  
    matchLocked = true;  
    setTimeout(() => {  
        firstMatch.innerText = "";  
        secondMatch.innerText = "";  
        firstMatch.classList.remove("revealed");  
        secondMatch.classList.remove("revealed");  
        firstMatch = secondMatch = null; // Reset matches  
        matchLocked = false; // Unlock the board  
    }, 1500);  
}  

createMatchingBoard(); // Initialize matching game  