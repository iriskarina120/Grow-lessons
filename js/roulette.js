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
        this.soundEnabled = true; // Estado del sonido  

        // Sonidos  
        this.spinSound = new Audio('/sounds/wheel-spin.wav');  
        this.backgroundMusic = new Audio('/sounds/background-loop.wav');  
        this.correctSound = new Audio('/sounds/correct.wav');  
        this.incorrectSound = new Audio('/sounds/incorrect.wav');  
        this.backgroundMusic.loop = true; // Background music 

        this.initialize();  
    }  

    initialize() {  
        document.getElementById("spin").addEventListener("click", () => this.spin());  
        document.getElementById("submit").addEventListener("click", () => this.checkAnswer());  
        document.getElementById("sound-toggle").addEventListener("click", () => this.toggleSound());  
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

    toggleSound() {  
        this.soundEnabled = !this.soundEnabled;  
        if (this.soundEnabled) {  
            document.getElementById("sound-toggle").innerText = "Desactivar Sonido";  
            this.startBackgroundMusic();  
        } else {  
            document.getElementById("sound-toggle").innerText = "Activar Sonido";  
            this.stopBackgroundMusic();  
        }  
    }  

    playSound(sound) {  
        if (this.soundEnabled) {  
            sound.play();  
        }  
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
        // Limpiar el GIF al girar la ruleta  
        document.getElementById("celebration").innerHTML = "";  
        this.playSound(this.spinSound); // Reproduce el sonido al girar  
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
        const celebrationDiv = document.getElementById("celebration");  
        celebrationDiv.innerHTML = ""; // Clear previous GIFs  

        if (!selectedOption) {  
            document.getElementById("feedback").innerText = "Please select an answer.";  
            return;  
        }  
        
        const userAnswer = selectedOption.value;   
        const currentQuestionIndex = this.questions.findIndex(q => q.question === document.getElementById("question").innerText);  
        
        if (userAnswer === this.questions[currentQuestionIndex].answer) {  
            this.score++;  
            document.getElementById("score-value").innerText = this.score;  
            document.getElementById("feedback").innerText = "Correct! 🎉";  
            this.playSound(this.correctSound); // Reproduce el sonido correcto  

            // Display correct answer GIF  
            const img = document.createElement("img");  
            img.src = "https://media.giphy.com/media/vLJlaDZYCNOaBVWimP/giphy.gif?cid=790b7611mkfo7kd8rm7k8h7gjva0rvvu29ss6qk135hdul3n&ep=v1_gifs_search&rid=giphy.gif&ct=g"; // Replace with your GIF URL  
            img.alt = "Correct Answer";  
            img.style.width = '90%';  // Ajusta el tamaño aquí  
            img.style.height = 'auto';  
            celebrationDiv.appendChild(img);  
        } else {  
            document.getElementById("feedback").innerText = "Incorrect. Try again! 😥";  
            this.playSound(this.incorrectSound); // Reproduce el sonido incorrecto  

            // Display incorrect answer GIF  
            const img = document.createElement("img");  
            img.src = "https://media.giphy.com/media/CoND5j6Bn1QZUgm1xX/giphy.gif?cid=790b7611tm1234vn5y8eses1bgxfgybp4171o3o1ppvczgmp&ep=v1_gifs_search&rid=giphy.gif&ct=g"; // Replace with your GIF URL  
            img.alt = "Incorrect Answer";  
            img.style.width = '90%';  // Ajusta el tamaño aquí  
            img.style.height = 'auto';  
            celebrationDiv.appendChild(img);  
        }  
    }  

    getColor(index, total) {  
        const hue = index * 360 / total;  
        return 'hsl(' + hue + ', 100%, 80%)';  
    }  

    easeOut(t, b, c, d) {  
        t = t / d - 1;  
        return c * (t*t*t + 1) + b;  
    }  
}  

// Initialize the game  
document.addEventListener("DOMContentLoaded", function() {  
    const questions = [  
        {  
            question: "What is a synonym for 'happy'?",  
            options: ["Sad", "Joyful", "Angry", "Tired"],  
            answer: "Joyful"  
        },  
        {  
            question: "Which of these is a phrasal verb?",  
            options: ["Run", "Think", "Look up", "Eat"],  
            answer: "Look up"  
        },  
        {  
            question: "What part of speech is 'quickly'?",  
            options: ["Noun", "Verb", "Adjective", "Adverb"],  
            answer: "Adverb"  
        },  
        {  
            question: "Choose the correct tense: I _____ to the store yesterday.",  
            options: ["go", "went", "going", "gone"],  
            answer: "went"  
        },  
        {  
            question: "What is an antonym for 'brave'?",  
            options: ["Courageous", "Fearful", "Bold", "Heroic"],  
            answer: "Fearful"  
        },  
        {  
            question: "Which idiom means 'to be mistaken'?",  
            options: ["Barking up the wrong tree", "Break a leg", "Hit the nail on the head", "See eye to eye"],  
            answer: "Barking up the wrong tree"  
        }  
    ];  

    const game = new RouletteGame(questions);  
});  