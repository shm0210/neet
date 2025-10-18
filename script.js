// DOM Elements
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('new-quote');
const themeToggle = document.getElementById('theme-toggle');
const subjectsContainer = document.getElementById('subjects-container');
const studySchedule = document.getElementById('study-schedule');
const subjectProgress = document.getElementById('subject-progress');
const completedChaptersElement = document.getElementById('completed-chapters');
const totalChaptersElement = document.getElementById('total-chapters');
const studyHoursElement = document.getElementById('study-hours');

// Exam Date (May 3, 2026)
const examDate = new Date('May 3, 2026 00:00:00').getTime();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    loadQuote();
    loadSubjects();
    loadStudySchedule();
    initializeProgressTracking();
    initializeTheme();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', loadQuote);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Update countdown every second
    setInterval(initializeCountdown, 1000);
});

// Countdown Timer
function initializeCountdown() {
    const now = new Date().getTime();
    const timeLeft = examDate - now;
    
    if (timeLeft < 0) {
        daysElement.textContent = '00';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    daysElement.textContent = days < 10 ? '0' + days : days;
    hoursElement.textContent = hours < 10 ? '0' + hours : hours;
    minutesElement.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsElement.textContent = seconds < 10 ? '0' + seconds : seconds;
}

// Load and Display Quotes
function loadQuote() {
    fetch('./data/quotes.json')
        .then(response => response.json())
        .then(quotes => {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const quote = quotes[randomIndex];
            quoteText.textContent = `"${quote.text}"`;
            quoteAuthor.textContent = `- ${quote.author}`;
        })
        .catch(error => {
            console.error('Error loading quotes:', error);
            quoteText.textContent = '"The secret of getting ahead is getting started."';
            quoteAuthor.textContent = '- Mark Twain';
        });
}

// Load and Display Subjects
function loadSubjects() {
    fetch('./data/subjects.json')
        .then(response => response.json())
        .then(subjects => {
            subjectsContainer.innerHTML = '';
            let totalChapters = 0;
            let completedChapters = 0;
            
            subjects.forEach(subject => {
                const subjectCard = createSubjectCard(subject);
                subjectsContainer.appendChild(subjectCard);
                
                totalChapters += subject.chapters.length;
                completedChapters += subject.chapters.filter(chapter => chapter.completed).length;
            });
            
            // Update stats
            totalChaptersElement.textContent = totalChapters;
            completedChaptersElement.textContent = completedChapters;
            studyHoursElement.textContent = Math.floor(completedChapters * 2.5); // Assuming 2.5 hours per chapter
        })
        .catch(error => {
            console.error('Error loading subjects:', error);
            subjectsContainer.innerHTML = '<p>Error loading subjects. Please try again later.</p>';
        });
}

// Create Subject Card
function createSubjectCard(subject) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    
    const header = document.createElement('div');
    header.className = 'subject-header';
    header.innerHTML = `
        <i class="fas ${subject.icon}"></i>
        <h3>${subject.name}</h3>
    `;
    
    const chaptersList = document.createElement('div');
    chaptersList.className = 'chapters-list';
    
    subject.chapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        
        const statusIcon = chapter.completed ? 'fa-check-circle' : 'fa-circle';
        const statusColor = chapter.completed ? 'var(--accent-color)' : 'var(--text-light)';
        
        chapterItem.innerHTML = `
            <div class="chapter-name">
                <i class="fas ${statusIcon}" style="color: ${statusColor}; margin-right: 8px;"></i>
                ${chapter.name}
            </div>
            <div class="chapter-actions">
                <button class="chapter-btn" data-chapter="${chapter.name}" data-subject="${subject.name}" title="Lecture">
                    <i class="fas fa-video"></i>
                </button>
                <button class="chapter-btn" data-chapter="${chapter.name}" data-subject="${subject.name}" title="Notes">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="chapter-btn" data-chapter="${chapter.name}" data-subject="${subject.name}" title="Quiz">
                    <i class="fas fa-question-circle"></i>
                </button>
            </div>
        `;
        
        chaptersList.appendChild(chapterItem);
    });
    
    card.appendChild(header);
    card.appendChild(chaptersList);
    
    // Add event listeners to chapter buttons
    card.addEventListener('click', function(e) {
        if (e.target.closest('.chapter-btn')) {
            const button = e.target.closest('.chapter-btn');
            const chapter = button.getAttribute('data-chapter');
            const subject = button.getAttribute('data-subject');
            const action = button.querySelector('i').className;
            
            if (action.includes('fa-video')) {
                openResource(subject, chapter, 'lecture');
            } else if (action.includes('fa-file-pdf')) {
                openResource(subject, chapter, 'notes');
            } else if (action.includes('fa-question-circle')) {
                openResource(subject, chapter, 'quiz');
            }
        }
    });
    
    return card;
}

// Open Resource
function openResource(subject, chapter, type) {
    let message = '';
    
    switch(type) {
        case 'lecture':
            message = `Opening lecture for ${chapter} (${subject})`;
            break;
        case 'notes':
            message = `Opening notes for ${chapter} (${subject})`;
            break;
        case 'quiz':
            message = `Starting quiz for ${chapter} (${subject})`;
            break;
    }
    
    alert(message); // In a real application, this would open the actual resource
}

// Load Study Schedule
function loadStudySchedule() {
    fetch('./data/schedule.json')
        .then(response => response.json())
        .then(schedule => {
            displayStudySchedule(schedule.weeks[0]); // Display first week by default
        })
        .catch(error => {
            console.error('Error loading schedule:', error);
            studySchedule.innerHTML = '<p>Error loading study schedule. Please try again later.</p>';
        });
}

// Display Study Schedule
function displayStudySchedule(week) {
    studySchedule.innerHTML = '';
    
    week.days.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        let tasksHTML = '';
        day.tasks.forEach(task => {
            tasksHTML += `<li><i class="fas fa-book"></i> ${task}</li>`;
        });
        
        dayCard.innerHTML = `
            <h4>${day.name}</h4>
            <ul>${tasksHTML}</ul>
        `;
        
        studySchedule.appendChild(dayCard);
    });
    
    document.getElementById('current-week').textContent = `Week ${week.weekNumber}`;
}

// Initialize Progress Tracking
function initializeProgressTracking() {
    fetch('./data/subjects.json')
        .then(response => response.json())
        .then(subjects => {
            subjectProgress.innerHTML = '';
            
            subjects.forEach(subject => {
                const totalChapters = subject.chapters.length;
                const completedChapters = subject.chapters.filter(chapter => chapter.completed).length;
                const progressPercentage = Math.round((completedChapters / totalChapters) * 100);
                
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar-container';
                progressBar.innerHTML = `
                    <div class="progress-info">
                        <span>${subject.name}</span>
                        <span>${progressPercentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                `;
                
                subjectProgress.appendChild(progressBar);
            });
            
            // Initialize performance chart
            initializePerformanceChart(subjects);
        })
        .catch(error => {
            console.error('Error loading progress data:', error);
        });
}

// Initialize Performance Chart
function initializePerformanceChart(subjects) {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    
    const subjectNames = subjects.map(subject => subject.name);
    const completionRates = subjects.map(subject => {
        const totalChapters = subject.chapters.length;
        const completedChapters = subject.chapters.filter(chapter => chapter.completed).length;
        return Math.round((completedChapters / totalChapters) * 100);
    });

    // Updated color arrays
    const colors = [
        'rgba(74, 111, 165, 0.7)',
        'rgba(107, 140, 188, 0.7)',
        'rgba(86, 166, 99, 0.7)',    // Green for Botany
        'rgba(255, 107, 107, 0.7)'   // Red for Zoology
    ];

    const borderColors = [
        'rgba(74, 111, 165, 1)',
        'rgba(107, 140, 188, 1)',
        'rgba(86, 166, 99, 1)',      // Green for Botany
        'rgba(255, 107, 107, 1)'     // Red for Zoology
    ];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjectNames,
            datasets: [{
                label: 'Completion Rate (%)',
                data: completionRates,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Theme Toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}
