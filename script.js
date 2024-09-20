const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let points = [];

// Set canvas background color to black
canvas.style.backgroundColor = 'black';

// Center point of the circle
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const targetRadius = 100; // The radius of the target circle

// Styling for the drawn circle
const baseLineColor = 'gold'; // Base color for the circle
const lineWidth = 3; // Reduced line thickness
const glowEffect = 5; // Glow for a subtler light effect
let currentColorIndex = 0;

// Colors for the multi-colored effect
const colors = ['gold', 'blue', 'green', 'white', 'orange'];

// Draw the center point
function drawCenterPoint() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red'; // Center point color red
    ctx.fill();
}

// Event listeners for mouse and touch events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', endDrawing);

function startDrawing(e) {
    isDrawing = true;
    points = []; // Reset the points array
    ctx.beginPath();
    e.preventDefault(); // Prevent scrolling on mobile
}

function draw(e) {
    if (!isDrawing) return;
    
    const x = e.offsetX;
    const y = e.offsetY;
    
    points.push({ x, y }); // Store the drawn points

    // Cycle through colors to add visual appeal
    ctx.strokeStyle = colors[currentColorIndex];
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = glowEffect;
    ctx.shadowColor = ctx.strokeStyle;

    ctx.lineTo(x, y);
    ctx.stroke();

    // Change color every 10 points
    if (points.length % 10 === 0) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }
}

function drawTouch(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    points.push({ x, y });

    // Cycle through colors to add visual appeal
    ctx.strokeStyle = colors[currentColorIndex];
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = glowEffect;
    ctx.shadowColor = ctx.strokeStyle;

    ctx.lineTo(x, y);
    ctx.stroke();

    // Change color every 10 points
    if (points.length % 10 === 0) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }
}

function endDrawing() {
    isDrawing = false;

    // Ensure the user draws enough points and a relatively closed shape
    if (points.length < 20 || !isShapeClosed(points)) {
        displayScore('Sarriga draw cheyi ra babu!');
        return;
    }
    
    calculateAccuracy(points);
}

// Check if the shape is closed by comparing start and end points
function isShapeClosed(points) {
    const start = points[0];
    const end = points[points.length - 1];

    // Check if the start and end points are close enough to consider the shape closed
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    
    return distance < 30; // More lenient threshold for closing the shape
}

// Calculate the accuracy of the drawn shape
function calculateAccuracy(points) {
    let sumDeviation = 0;
    let maxDeviation = 0;
    const count = points.length;

    // Calculate the ideal radius for each point
    let distances = points.map(point => {
        const dx = point.x - centerX;
        const dy = point.y - centerY;
        return Math.sqrt(dx * dx + dy * dy); // Distance from the center
    });

    // Calculate the mean radius
    const meanRadius = distances.reduce((a, b) => a + b, 0) / count;

    // Calculate deviation from the target radius
    distances.forEach(distance => {
        const deviation = Math.abs(distance - targetRadius);
        sumDeviation += deviation;

        if (deviation > maxDeviation) maxDeviation = deviation;
    });

    const averageDeviation = sumDeviation / count;

    // Define a threshold for the maximum allowable deviation
    const maxAllowedDeviation = targetRadius * 0.3; // 30% deviation allowed

    // Calculate the accuracy based on deviation from the target radius
    const accuracy = Math.max(0, 100 - (averageDeviation * 2)); // Penalize higher deviations

    // Provide feedback based on accuracy
    if (maxDeviation > maxAllowedDeviation) {
        const scoreMessage = `Not a better circle! Max deviation: ${maxDeviation.toFixed(2)}px`;
        displayScore(scoreMessage);
    } else {
        const scoreValue = accuracy.toFixed(2);
        displayScore(`Your accuracy: ${scoreValue}%`, scoreValue);
    }
}

// Display the score or feedback message in red and white
function displayScore(message, score) {
    const scoreDiv = document.getElementById('score');
    scoreDiv.style.color = 'white'; // Text color white
    scoreDiv.style.backgroundColor = 'red'; // Background color red
    scoreDiv.style.padding = '10px'; // Add some padding for better visibility
    scoreDiv.textContent = message;

    // Update URL with score
    if (score !== undefined) {
        const newUrl = `${window.location.origin}${window.location.pathname}?score=${score}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }
}

// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// On page load, check for score parameter
window.onload = function () {
    const score = getQueryParam('score');
    if (score) {
        displayScore(`Your friend's score: ${score}`, score);
    }
};

// Function to reset the canvas and start over
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCenterPoint(); // Redraw center point
    document.getElementById('score').textContent = ''; // Clear the score
}

// Initial setup
drawCenterPoint();

// Reset button functionality
document.getElementById('resetButton').addEventListener('click', resetCanvas);
