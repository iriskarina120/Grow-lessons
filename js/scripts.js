// Initialize scores  
let colorScore = 0;  
let verbScore = 0;  

// Function to play audio  
function playSound(greeting) {  
    const audio = document.getElementById(greeting);  
    audio.play();  
}  

// Greet user by name  
function greetUser() {  
    const name = document.getElementById('name').value;  
    const feedback = document.getElementById('name-feedback');  
    feedback.innerText = `Nice to meet you, ${name}!`; // Greet the user  
}  

// Change the color of the color box  
function changeColor() {  
    const colors = ['red', 'blue', 'green'];  
    const randomColor = colors[Math.floor(Math.random() * colors.length)];  
    document.getElementById('colorBox').style.backgroundColor = randomColor;  
    return randomColor; // Return the current random color  
}  

// Guess color function  
function guessColor(selectedColor) {  
    const currentColor = document.getElementById('colorBox').style.backgroundColor;  
    const feedback = document.getElementById('color-feedback');  
    if (selectedColor.toLowerCase() === currentColor) {  
        colorScore += 1; // Increment score  
        feedback.innerText = "Correct! 🎉 You earned 1 point!";  
    } else {  
        feedback.innerText = "Try again! 😢"; // User guessed incorrectly  
    }  
    document.getElementById('color-score').innerText = colorScore; // Update score display  
}  

// Check the answer for the 'to be' game  
function checkAnswer() {  
    const answer = document.getElementById('verbSelect').value;  
    const feedback = document.getElementById('verb-feedback');  
    if (answer === 'am') {  
        verbScore += 1; // Increment score  
        feedback.innerText = "Correct! 🎉 You earned 1 point!";  
    } else {  
        feedback.innerText = "Try again. 😢"; // Incorrect answer  
    }  
    document.getElementById('verb-score').innerText = verbScore; // Update score display  
}  