class IslamicFocusTimer {
    constructor() {
        this.sessionMinutes = 25;
        this.remainingSeconds = this.sessionMinutes * 60;
        this.totalSessionSeconds = this.sessionMinutes * 60;
        this.isRunning = false;
        this.isBreak = false;
        this.breakMinutes = 5;
        this.timer = null;
        this.volume = 0.5;
        
        // Progress tracking
        this.todayMinutes = parseInt(this.getStorageItem('islamicTodayMinutes')) || 0;
        this.dailyGoalHours = 5;
        this.streak = parseInt(this.getStorageItem('islamicStreak')) || 0;
        this.yesterdayMins = parseInt(this.getStorageItem('islamicYesterdayMinutes')) || 0;
        
        this.islamicQuotes = [
            { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", english: "My Lord, expand my chest and ease my task for me" },
            { arabic: "وَقُل رَّبِّ زِدْنِي عِلْماً", english: "And say: My Lord, increase me in knowledge" },
            { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْراً", english: "Indeed, with hardship comes ease" },
            { arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", english: "And whoever relies upon Allah, He is sufficient for him" },
            { arabic: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ", english: "And be patient, and your patience is not but through Allah" },
            { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", english: "So remember Me; I will remember you" }
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.updateProgress();
        this.checkDailyReset();
        this.rotateQuote();
        
        this.quoteInterval = setInterval(() => {
            if (!this.isRunning) this.rotateQuote();
        }, 30000);
    }

    getStorageItem(key) {
        return localStorage.getItem(key);
    }

    setStorageItem(key, value) {
        localStorage.setItem(key, value);
    }

    removeStorageItem(key) {
        localStorage.removeItem(key);
    }

    initializeElements() {
        this.statusText = document.getElementById('statusText');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.increaseBtn = document.getElementById('increaseBtn');
        this.decreaseBtn = document.getElementById('decreaseBtn');
        this.skipBreaks = document.getElementById('skipBreaks');
        this.duaText = document.getElementById('duaText');
        this.progressCircle = document.getElementById('progressCircle');
        this.completedMinutes = document.getElementById('completedMinutes');
        this.streakDays = document.getElementById('streakDays');
        this.yesterdayDisplay = document.getElementById('yesterdayMinutes');
        this.timerSection = document.getElementById('timerSection');
        this.notification = document.getElementById('notification');
        this.notificationTitle = document.getElementById('notificationTitle');
        this.notificationMessage = document.getElementById('notificationMessage');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.increaseBtn.addEventListener('click', () => this.adjustTime(5));
        this.decreaseBtn.addEventListener('click', () => this.adjustTime(-5));
        this.volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
                e.preventDefault();
                this.toggleTimer();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning) {
                this.showNotification('Timer Running', 'Your Islamic Focus Timer is still active');
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (this.isRunning) {
                e.preventDefault();
                e.returnValue = 'Your focus session is still active. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    toggleTimer() {
        if (this.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.totalSessionSeconds = this.remainingSeconds;
        this.startBtn.textContent = '⏹ Stop Session';
        this.increaseBtn.disabled = true;
        this.decreaseBtn.disabled = true;
        this.statusText.textContent = this.isBreak ? 'Rest & Reflect - استرح وتأمل' : 'In Focus - في تركيز بإذن الله';
        this.statusText.classList.add('pulse');
        this.timerSection.classList.add('active-session', 'glow');
        
        this.playSound('start');
        this.showNotification(
            this.isBreak ? 'Break Started' : 'Focus Session Started', 
            `${Math.floor(this.remainingSeconds / 60)} minutes of ${this.isBreak ? 'rest' : 'focused work'} ahead`
        );
        
        this.timer = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();
            
            if (this.remainingSeconds === 300) {
                this.showNotification('5 Minutes Remaining', 'Keep your focus strong!');
                this.playSound('warning');
            } else if (this.remainingSeconds === 60) {
                this.showNotification('1 Minute Remaining', 'Almost there!');
                this.playSound('warning');
            } else if (this.remainingSeconds === 10) {
                this.playSound('tick');
            }
            
            if (this.remainingSeconds <= 0) {
                this.handleTimerComplete();
            }
        }, 1000);
    }

    stopTimer() {
        this.isRunning = false;
        this.isBreak = false;
        this.startBtn.textContent = '🕌 Begin Focus Session';
        this.increaseBtn.disabled = false;
        this.decreaseBtn.disabled = false;
        this.statusText.textContent = 'Prepare for focused worship';
        this.statusText.classList.remove('pulse');
        this.timerSection.classList.remove('active-session', 'glow');
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.remainingSeconds = this.sessionMinutes * 60;
        this.updateDisplay();
        this.showNotification('Session Stopped', 'May Allah reward your efforts');
    }

    handleTimerComplete() {
        this.playSound('complete');
        
        if (this.isBreak) {
            this.isBreak = false;
            this.remainingSeconds = this.sessionMinutes * 60;
            this.statusText.textContent = 'In Focus - في تركيز بإذن الله';
            this.rotateQuote();
            this.showNotification('Break Complete', 'Ready for another focus session');
        } else {
            this.todayMinutes += this.sessionMinutes;
            this.saveProgress();
            this.updateProgress();
            
            const congratsMessages = [
                'Excellent focus! May Allah bless your efforts',
                'Well done! Knowledge is a light from Allah',
                'Great dedication! Continue seeking beneficial knowledge',
                'Masha\'Allah! Your persistence is admirable'
            ];
            
            const randomCongrats = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
            
            if (this.skipBreaks.checked) {
                this.remainingSeconds = this.sessionMinutes * 60;
                this.rotateQuote();
                this.showNotification('Session Complete!', randomCongrats + '. Starting next session...');
            } else {
                this.isBreak = true;
                this.remainingSeconds = this.breakMinutes * 60;
                this.statusText.textContent = 'Rest & Reflect - استرح وتأمل';
                this.showNotification('Focus Complete!', randomCongrats + '. Time for a short break.');
            }
        }
        
        this.updateDisplay();
    }

    adjustTime(minutes) {
        if (!this.isRunning) {
            this.sessionMinutes = Math.max(5, Math.min(120, this.sessionMinutes + minutes));
            this.remainingSeconds = this.sessionMinutes * 60;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        this.timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    playSound(type) {
        if (this.volume === 0) return;
        
        const sounds = {
            start: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
            warning: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
            complete: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
            tick: 'https://assets.mixkit.co/sfx/preview/mixkit-clock-countdown-bleeps-916.mp3'
        };
        
        const audio = new Audio(sounds[type]);
        audio.volume = this.volume;
        audio.play().catch(e => console.log("Audio playback prevented:", e));
    }

    updateVolume(value) {
        this.volume = value / 100;
        this.volumeValue.textContent = `${value}%`;
    }

    showNotification(title, message) {
        this.notificationTitle.textContent = title;
        this.notificationMessage.textContent = message;
        this.notification.classList.add('show');
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 5000);
    }

    rotateQuote() {
        const quote = this.islamicQuotes[Math.floor(Math.random() * this.islamicQuotes.length)];
        this.duaText.innerHTML = `"${quote.arabic}"<br><em>"${quote.english}"</em>`;
    }

    updateProgress() {
        const circumference = 2 * Math.PI * 75;
        const progressPercent = Math.min(100, (this.todayMinutes / (this.dailyGoalHours * 60)) * 100);
        this.progressCircle.style.strokeDasharray = circumference;
        this.progressCircle.style.strokeDashoffset = circumference - (progressPercent / 100) * circumference;
        
        this.completedMinutes.textContent = this.todayMinutes;
        this.streakDays.textContent = this.streak;
        this.yesterdayDisplay.textContent = this.yesterdayMins;
    }

    saveProgress() {
        this.setStorageItem('islamicTodayMinutes', this.todayMinutes);
        this.setStorageItem('islamicStreak', this.streak);
        this.setStorageItem('islamicYesterdayMinutes', this.yesterdayMins);
    }

    checkDailyReset() {
        const lastDate = this.getStorageItem('islamicLastDate');
        const today = new Date().toDateString();
        
        if (lastDate !== today) {
            this.yesterdayMins = this.todayMinutes || 0;
            this.todayMinutes = 0;
            this.setStorageItem('islamicLastDate', today);
            this.saveProgress();
            this.updateProgress();
        }
    }
}

// Initialize the timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IslamicFocusTimer();
});
