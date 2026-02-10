// Theme Toggle Functionality
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem("theme") || "light";
if (currentTheme === "dark") {
    body.classList.add("dark-mode");
}

themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    
    // Save theme preference
    const theme = body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", theme);
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow on scroll
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.addEventListener('DOMContentLoaded', () => {
    // Animate sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Animate project cards
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Animate skill bars on scroll
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.style.width || '0%';
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
});

// Add typing effect to hero subtitle (optional enhancement)
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
    const text = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            heroSubtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    
    // Start typing after page loads
    setTimeout(typeWriter, 1000);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }
});

// Custom cursor removed for better usability

// ===== Mini Game Logic =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const startBtn = document.getElementById('startGame');
const gameOverlay = document.querySelector('.game-overlay');
const scoreDisplay = document.getElementById('gameScore');

if (canvas && ctx) {
    let gameRunning = false;
    let score = 0;
    let gameSpeed = 2;
    let animationId;

    // Player object
    const player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 40,
        width: 30,
        height: 30,
        speed: 5,
        dx: 0
    };

    // Obstacles array
    let obstacles = [];

    // Controls
    const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        a: false,
        d: false
    };

    // Event listeners for keyboard
    document.addEventListener('keydown', (e) => {
        if (gameRunning && (e.key in keys)) {
            e.preventDefault();
            keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) {
            keys[e.key] = false;
        }
    });

    // Touch controls - simple left/right tap zones
    canvas.addEventListener('touchstart', (e) => {
        if (!gameRunning) return;
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const renderedWidth = rect.width; // Use actual rendered width, not canvas.width
        
        // Reset keys
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
        
        // Left half = move left, right half = move right
        if (touchX < renderedWidth / 2) {
            keys.ArrowLeft = true;
        } else {
            keys.ArrowRight = true;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!gameRunning) return;
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const renderedWidth = rect.width; // Use actual rendered width, not canvas.width
        
        // Reset keys
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
        
        // Update direction based on current touch position
        if (touchX < renderedWidth / 2) {
            keys.ArrowLeft = true;
        } else {
            keys.ArrowRight = true;
        }
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
    });

    canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
    });

    // Draw player
    function drawPlayer() {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Add a simple face
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(player.x + 8, player.y + 8, 5, 5);
        ctx.fillRect(player.x + 17, player.y + 8, 5, 5);
        ctx.fillRect(player.x + 10, player.y + 20, 10, 3);
    }

    // Create obstacle
    function createObstacle() {
        const width = 20 + Math.random() * 40;
        obstacles.push({
            x: Math.random() * (canvas.width - width),
            y: -30,
            width: width,
            height: 30,
            speed: gameSpeed
        });
    }

    // Draw obstacles
    function drawObstacles() {
        ctx.fillStyle = '#ef4444';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // Add danger stripes
            ctx.fillStyle = '#fca5a5';
            for (let i = 0; i < obs.width; i += 10) {
                ctx.fillRect(obs.x + i, obs.y, 5, obs.height);
            }
            ctx.fillStyle = '#ef4444';
        });
    }

    // Update player position
    function updatePlayer() {
        // Reset dx first
        player.dx = 0;
        
        // Check keyboard controls
        if (keys.ArrowLeft || keys.a) {
            player.dx = -player.speed;
        }
        if (keys.ArrowRight || keys.d) {
            player.dx = player.speed;
        }

        player.x += player.dx;

        // Boundaries
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }
    }

    // Update obstacles
    function updateObstacles() {
        obstacles.forEach((obs, index) => {
            obs.y += obs.speed;

            // Remove obstacles that are off screen
            if (obs.y > canvas.height) {
                obstacles.splice(index, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                
                // Increase difficulty
                if (score % 100 === 0) {
                    gameSpeed += 0.5;
                }
            }

            // Collision detection
            if (
                player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                player.y < obs.y + obs.height &&
                player.y + player.height > obs.y
            ) {
                gameOver();
            }
        });
    }

    // Clear canvas
    function clear() {
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
    }

    // Game loop
    function gameLoop() {
        if (!gameRunning) return;

        clear();
        drawPlayer();
        drawObstacles();
        updatePlayer();
        updateObstacles();

        // Randomly create obstacles
        if (Math.random() < 0.02) {
            createObstacle();
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    // Start game
    function startGame() {
        gameRunning = true;
        score = 0;
        gameSpeed = 2;
        obstacles = [];
        player.x = canvas.width / 2 - 15;
        scoreDisplay.textContent = 'Score: 0';
        gameOverlay.classList.add('hidden');
        gameLoop();
    }

    // Game over
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        
        // Show game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '18px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        
        ctx.font = '14px Arial';
        ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 40);
        
        // Reset overlay
        setTimeout(() => {
            gameOverlay.classList.remove('hidden');
            startBtn.textContent = 'Play Again! 🎮';
        }, 2000);
    }

    // Event listener for start button
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }

    // Draw initial state
    clear();
    drawPlayer();
}

// ===== Puppy Playground Logic =====
const puppyCanvas = document.getElementById('puppyCanvas');
const puppyCtx = puppyCanvas ? puppyCanvas.getContext('2d') : null;
const feedBtn = document.getElementById('feedPuppy');
const playBtn = document.getElementById('playPuppy');
const petBtn = document.getElementById('petPuppy');
const moodDisplay = document.getElementById('puppyMood');

if (puppyCanvas && puppyCtx) {
    let puppyAnimationId;
    
    // Puppy object
    const puppy = {
        x: puppyCanvas.width / 2,
        y: puppyCanvas.height / 2,
        targetX: puppyCanvas.width / 2,
        targetY: puppyCanvas.height / 2,
        size: 30,
        speed: 1.5,
        direction: 1, // 1 for right, -1 for left
        mood: 'happy',
        isJumping: false,
        jumpHeight: 0,
        activity: 'idle'
    };

    // Particles for effects
    let particles = [];

    // Mood states
    const moods = {
        happy: { emoji: '😊', text: 'Happy' },
        excited: { emoji: '🤩', text: 'Excited!' },
        playful: { emoji: '😄', text: 'Playful!' },
        loved: { emoji: '🥰', text: 'Loved!' }
    };

    // Create particle effect
    function createParticles(x, y, type) {
        const colors = {
            heart: ['#ff69b4', '#ff1493', '#ffc0cb'],
            star: ['#ffd700', '#ffff00', '#ffa500'],
            bone: ['#f5deb3', '#deb887', '#d2b48c']
        };
        
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 4 - 2,
                life: 1,
                color: colors[type][Math.floor(Math.random() * colors[type].length)],
                symbol: type === 'heart' ? '💕' : type === 'star' ? '⭐' : '🦴'
            });
        }
    }

    // Draw puppy
    function drawPuppy() {
        const x = puppy.x;
        const y = puppy.y - puppy.jumpHeight;
        const size = puppy.size;
        
        puppyCtx.save();
        
        // Flip puppy based on direction
        if (puppy.direction === -1) {
            puppyCtx.translate(x + size / 2, y + size / 2);
            puppyCtx.scale(-1, 1);
            puppyCtx.translate(-(x + size / 2), -(y + size / 2));
        }
        
        // Body
        puppyCtx.fillStyle = '#d4a373';
        puppyCtx.beginPath();
        puppyCtx.ellipse(x, y, size * 0.6, size * 0.5, 0, 0, Math.PI * 2);
        puppyCtx.fill();
        
        // Head
        puppyCtx.fillStyle = '#d4a373';
        puppyCtx.beginPath();
        puppyCtx.arc(x + size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
        puppyCtx.fill();
        
        // Ears
        puppyCtx.fillStyle = '#b8894d';
        puppyCtx.beginPath();
        puppyCtx.ellipse(x + size * 0.1, y - size * 0.5, size * 0.2, size * 0.3, -0.3, 0, Math.PI * 2);
        puppyCtx.fill();
        puppyCtx.beginPath();
        puppyCtx.ellipse(x + size * 0.5, y - size * 0.5, size * 0.2, size * 0.3, 0.3, 0, Math.PI * 2);
        puppyCtx.fill();
        
        // Eyes
        puppyCtx.fillStyle = '#000';
        puppyCtx.beginPath();
        puppyCtx.arc(x + size * 0.2, y - size * 0.35, size * 0.08, 0, Math.PI * 2);
        puppyCtx.fill();
        puppyCtx.beginPath();
        puppyCtx.arc(x + size * 0.4, y - size * 0.35, size * 0.08, 0, Math.PI * 2);
        puppyCtx.fill();
        
        // Eye shine
        puppyCtx.fillStyle = '#fff';
        puppyCtx.beginPath();
        puppyCtx.arc(x + size * 0.22, y - size * 0.37, size * 0.03, 0, Math.PI * 2);
        puppyCtx.fill();
        puppyCtx.beginPath();
        puppyCtx.arc(x + size * 0.42, y - size * 0.37, size * 0.03, 0, Math.PI * 2);
        puppyCtx.fill();
        
        // Nose
        puppyCtx.fillStyle = '#000';
        puppyCtx.beginPath();
        puppyCtx.arc(x + size * 0.3, y - size * 0.2, size * 0.06, 0, Math.PI * 2);
        puppyCtx.fill();
        
        // Mouth (varies by mood)
        puppyCtx.strokeStyle = '#000';
        puppyCtx.lineWidth = 2;
        puppyCtx.beginPath();
        if (puppy.mood === 'excited' || puppy.mood === 'playful') {
            puppyCtx.arc(x + size * 0.3, y - size * 0.15, size * 0.15, 0.2, Math.PI - 0.2);
        } else {
            puppyCtx.arc(x + size * 0.3, y - size * 0.15, size * 0.12, 0.3, Math.PI - 0.3);
        }
        puppyCtx.stroke();
        
        // Tail (wagging based on mood)
        const tailWag = puppy.mood !== 'happy' ? Math.sin(Date.now() * 0.02) * 0.3 : 0;
        puppyCtx.strokeStyle = '#d4a373';
        puppyCtx.lineWidth = 4;
        puppyCtx.beginPath();
        puppyCtx.arc(x - size * 0.5, y + size * 0.1, size * 0.3, -Math.PI / 4 + tailWag, Math.PI / 4 + tailWag);
        puppyCtx.stroke();
        
        puppyCtx.restore();
    }

    // Draw background elements
    function drawBackground() {
        // Sky gradient
        const gradient = puppyCtx.createLinearGradient(0, 0, 0, puppyCanvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#90ee90');
        puppyCtx.fillStyle = gradient;
        puppyCtx.fillRect(0, 0, puppyCanvas.width, puppyCanvas.height);
        
        // Clouds
        puppyCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        puppyCtx.beginPath();
        puppyCtx.arc(50, 30, 15, 0, Math.PI * 2);
        puppyCtx.arc(70, 30, 20, 0, Math.PI * 2);
        puppyCtx.arc(90, 30, 15, 0, Math.PI * 2);
        puppyCtx.fill();
        
        puppyCtx.beginPath();
        puppyCtx.arc(220, 50, 15, 0, Math.PI * 2);
        puppyCtx.arc(240, 50, 20, 0, Math.PI * 2);
        puppyCtx.arc(260, 50, 15, 0, Math.PI * 2);
        puppyCtx.fill();
        
        // Grass blades
        puppyCtx.strokeStyle = '#228b22';
        puppyCtx.lineWidth = 2;
        for (let i = 0; i < puppyCanvas.width; i += 20) {
            puppyCtx.beginPath();
            puppyCtx.moveTo(i, puppyCanvas.height);
            puppyCtx.lineTo(i + 3, puppyCanvas.height - 10);
            puppyCtx.stroke();
        }
    }

    // Update puppy position
    function updatePuppy() {
        const dx = puppy.targetX - puppy.x;
        const dy = puppy.targetY - puppy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            puppy.x += (dx / distance) * puppy.speed;
            puppy.y += (dy / distance) * puppy.speed;
            
            // Update direction based on movement
            if (dx > 0) puppy.direction = 1;
            else if (dx < 0) puppy.direction = -1;
        }
        
        // Handle jumping
        if (puppy.isJumping) {
            puppy.jumpHeight += 5;
            if (puppy.jumpHeight >= 20) {
                puppy.isJumping = false;
            }
        } else if (puppy.jumpHeight > 0) {
            puppy.jumpHeight -= 5;
        }
    }

    // Update particles
    function updateParticles() {
        particles = particles.filter(p => p.life > 0);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life -= 0.02;
        });
    }

    // Draw particles
    function drawParticles() {
        particles.forEach(p => {
            puppyCtx.save();
            puppyCtx.globalAlpha = p.life;
            puppyCtx.font = '16px Arial';
            puppyCtx.fillText(p.symbol, p.x, p.y);
            puppyCtx.restore();
        });
    }

    // Animation loop
    function puppyLoop() {
        drawBackground();
        updatePuppy();
        updateParticles();
        drawPuppy();
        drawParticles();
        
        puppyAnimationId = requestAnimationFrame(puppyLoop);
    }

    // Canvas click handler
    puppyCanvas.addEventListener('click', (e) => {
        const rect = puppyCanvas.getBoundingClientRect();
        puppy.targetX = e.clientX - rect.left;
        puppy.targetY = e.clientY - rect.top;
    });

    // Feed button
    feedBtn.addEventListener('click', () => {
        puppy.mood = 'happy';
        puppy.isJumping = true;
        createParticles(puppy.x, puppy.y, 'bone');
        moodDisplay.innerHTML = `Mood: ${moods.happy.emoji} ${moods.happy.text}`;
    });

    // Play button
    playBtn.addEventListener('click', () => {
        puppy.mood = 'playful';
        puppy.speed = 3;
        createParticles(puppy.x, puppy.y, 'star');
        moodDisplay.innerHTML = `Mood: ${moods.playful.emoji} ${moods.playful.text}`;
        
        // Random movement
        puppy.targetX = Math.random() * (puppyCanvas.width - 60) + 30;
        puppy.targetY = Math.random() * (puppyCanvas.height - 60) + 30;
        
        setTimeout(() => {
            puppy.speed = 1.5;
            puppy.mood = 'happy';
            moodDisplay.innerHTML = `Mood: ${moods.happy.emoji} ${moods.happy.text}`;
        }, 3000);
    });

    // Pet button
    petBtn.addEventListener('click', () => {
        puppy.mood = 'loved';
        createParticles(puppy.x, puppy.y, 'heart');
        moodDisplay.innerHTML = `Mood: ${moods.loved.emoji} ${moods.loved.text}`;
        
        // Wiggle animation
        const originalX = puppy.x;
        let wiggleCount = 0;
        const wiggleInterval = setInterval(() => {
            puppy.x = originalX + Math.sin(wiggleCount * 0.5) * 5;
            wiggleCount++;
            
            if (wiggleCount > 20) {
                clearInterval(wiggleInterval);
                puppy.x = originalX;
                puppy.mood = 'happy';
                moodDisplay.innerHTML = `Mood: ${moods.happy.emoji} ${moods.happy.text}`;
            }
        }, 50);
    });

    // Start animation
    puppyLoop();
}

console.log('Portfolio loaded successfully! 🚀');
