// script.js

let sessionDuration = 25 * 60; // in seconds
let remainingTime = sessionDuration;
let isRunning = false;
let timerInterval = null;
let volume = 0.5;
let completedMinutes = 0;
let streakDays = 0;
let yesterdayMinutes = 0;
let skipBreaks = false;

const statusText = document.getElementById("statusText");
const timerDisplay = document.getElementById("timerDisplay");
const progressCircle = document.getElementById("progressCircle");
const completedSpan = document.getElementById("completedMinutes");
const streakSpan = document.getElementById("streakDays");
const yesterdaySpan = document.getElementById("yesterdayMinutes");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingTime);
    const progress = 1 - remainingTime / sessionDuration;
    progressCircle.style.strokeDasharray = "502";
    progressCircle.style.strokeDashoffset = `${502 - 502 * progress}`;
}

function playSound() {
    const audio = new Audio('notification.mp3');
    audio.volume = volume;
    audio.play();
}

function completeSession() {
    playSound();
    completedMinutes += sessionDuration / 60;
    completedSpan.textContent = completedMinutes;
    showNotification("Time’s up!", "Take a break or start the next session.");
}

function showNotification(title, message) {
    const notification = document.getElementById("notification");
    document.getElementById("notificationTitle").textContent = title;
    document.getElementById("notificationMessage").textContent = message;
    notification.classList.remove("hidden");
    setTimeout(() => notification.classList.add("hidden"), 10000);
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    statusText.textContent = "Focus Time";

    timerInterval = setInterval(() => {
        remainingTime--;
        updateDisplay();

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            completeSession();

            if (!skipBreaks) {
                // Start short break
                remainingTime = 5 * 60;
                statusText.textContent = "Short Break";
                startTimer();
            } else {
                remainingTime = sessionDuration;
                statusText.textContent = "Focus Time";
                updateDisplay();
            }
        }
    }, 1000);
}

document.getElementById("startBtn").addEventListener("click", () => {
    startTimer();
});

document.getElementById("increaseBtn").addEventListener("click", () => {
    sessionDuration += 60;
    remainingTime = sessionDuration;
    updateDisplay();
});

document.getElementById("decreaseBtn").addEventListener("click", () => {
    if (sessionDuration > 60) {
        sessionDuration -= 60;
        remainingTime = sessionDuration;
        updateDisplay();
    }
});

document.getElementById("skipBreaks").addEventListener("click", () => {
    skipBreaks = !skipBreaks;
    document.getElementById("skipBreaks").textContent = skipBreaks ? "Unskip Breaks" : "Skip Breaks";
});

volumeSlider.addEventListener("input", () => {
    volume = parseFloat(volumeSlider.value);
    volumeValue.textContent = volume.toFixed(1);
});

// Initialize
updateDisplay();
completedSpan.textContent = completedMinutes;
streakSpan.textContent = streakDays;
yesterdaySpan.textContent = yesterdayMinutes;
volumeSlider.value = volume;
volumeValue.textContent = volume.toFixed(1);
