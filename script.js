// ===== Theme =====
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Use saved preference, then OS preference, then light
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    body.classList.add("dark-mode");
}

themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
});

// ===== Resume button: normal click views PDF, Shift+Click downloads =====
const resumeAction = document.getElementById("resumeAction");
if (resumeAction) {
    resumeAction.addEventListener("click", (e) => {
        if (!e.shiftKey) return;
        e.preventDefault();
        const tempLink = document.createElement("a");
        tempLink.href = resumeAction.getAttribute("href");
        tempLink.download = "Arjun_Ramendra_Resume.pdf";
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
    });
}

// ===== Profile popup copy actions =====
document.querySelectorAll(".copyable-field").forEach((field) => {
    field.addEventListener("click", async () => {
        const text = field.dataset.copy;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Clipboard API unavailable — silent fail
        }
        field.classList.add("copied");
        setTimeout(() => field.classList.remove("copied"), 700);
    });
});

// ===== Logo popup positioning and open/close =====
const logoWrap = document.querySelector(".logo-wrap");
const logoPopup = document.querySelector(".logo-popup");

function adjustLogoPopupPosition() {
    if (!logoWrap || !logoPopup) return;
    logoWrap.style.setProperty("--popup-shift-x", "0px");
    const rect = logoPopup.getBoundingClientRect();
    const viewportPadding = 8;
    let shift = 0;
    if (rect.right > window.innerWidth - viewportPadding) {
        shift -= rect.right - (window.innerWidth - viewportPadding);
    }
    if (rect.left + shift < viewportPadding) {
        shift += viewportPadding - (rect.left + shift);
    }
    logoWrap.style.setProperty("--popup-shift-x", `${Math.round(shift)}px`);
}

if (logoWrap) {
    logoWrap.addEventListener("mouseleave", () => {
        const active = document.activeElement;
        if (active && logoWrap.contains(active) && typeof active.blur === "function") {
            active.blur();
        }
    });
    logoWrap.addEventListener("mouseenter", adjustLogoPopupPosition);
    logoWrap.addEventListener("focusin", adjustLogoPopupPosition);
}

// Mobile/touch: tap to open/close, tap outside to close
const touchMediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
if (logoWrap) {
    const isLogoPopupOpen = () => logoWrap.classList.contains("is-open");

    const setLogoPopupOpen = (isOpen) => {
        logoWrap.classList.toggle("is-open", isOpen);
        logoWrap.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (isOpen) {
            adjustLogoPopupPosition();
        } else {
            const active = document.activeElement;
            if (active && logoWrap.contains(active) && typeof active.blur === "function") {
                active.blur();
            }
        }
    };

    logoWrap.addEventListener("click", (e) => {
        if (!touchMediaQuery.matches) return;
        if (e.target.closest(".copyable-field")) return;
        e.preventDefault();
        e.stopPropagation();
        setLogoPopupOpen(!isLogoPopupOpen());
    });

    document.addEventListener("click", (e) => {
        if (!touchMediaQuery.matches) return;
        if (logoWrap.contains(e.target)) return;
        setLogoPopupOpen(false);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setLogoPopupOpen(false);
    });

    // Debounced resize handler
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!touchMediaQuery.matches) {
                setLogoPopupOpen(false);
                adjustLogoPopupPosition();
            }
        }, 100);
    });

    window.addEventListener("scroll", () => {
        if (touchMediaQuery.matches && isLogoPopupOpen()) setLogoPopupOpen(false);
    }, { passive: true });
}

// ===== Mobile nav hamburger =====
const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (navToggle && mobileMenu) {
    const setMobileMenuOpen = (isOpen) => {
        navToggle.classList.toggle("is-open", isOpen);
        mobileMenu.classList.toggle("is-open", isOpen);
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    };

    navToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        setMobileMenuOpen(!navToggle.classList.contains("is-open"));
    });

    mobileMenu.querySelectorAll(".mobile-nav-link").forEach((link) => {
        link.addEventListener("click", () => setMobileMenuOpen(false));
    });

    document.addEventListener("click", (e) => {
        if (!navToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
            setMobileMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
    });
}

// ===== Scroll-driven effects =====
const navbar = document.querySelector('.navbar');
const heroContent = document.querySelector('.hero-content');
const sectionAnchors = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
let scrollTicking = false;
const mobilePerfQuery = window.matchMedia("(max-width: 768px)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateOnScroll() {
    const currentScroll = window.scrollY;
    const mobileMode = mobilePerfQuery.matches;

    if (navbar) {
        navbar.classList.toggle('is-scrolled', currentScroll > 24);
    }

    if (heroContent) {
        if (mobileMode || prefersReducedMotion) {
            heroContent.style.transform = 'none';
            heroContent.style.opacity = '1';
        } else {
            heroContent.style.transform = `translateY(${currentScroll * 0.5}px)`;
            heroContent.style.opacity = String(Math.max(0, 1 - (currentScroll / 600)));
        }
    }

    if (!mobileMode) {
        let activeId = '';
        const navOffset = 120;
        sectionAnchors.forEach((section) => {
            const top = section.offsetTop - navOffset;
            const bottom = top + section.offsetHeight;
            if (currentScroll >= top && currentScroll < bottom) {
                activeId = section.id;
            }
        });
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
        mobileNavLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
    }

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(updateOnScroll);
        scrollTicking = true;
    }
}, { passive: true });
updateOnScroll();

// ===== Intersection Observer for entry animations =====
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

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    const mobileMode = mobilePerfQuery.matches;

    if (prefersReducedMotion) {
        // Skip entry animations entirely for users who prefer reduced motion
        document.querySelectorAll('section, .project-card').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    } else {
        // Animate sections on scroll-into-view
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = mobileMode ? 'translateY(12px)' : 'translateY(30px)';
            section.style.transition = mobileMode
                ? 'opacity 0.35s ease-out, transform 0.35s ease-out'
                : 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)';
            observer.observe(section);
        });

        // Stagger project card animations
        document.querySelectorAll('.project-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = mobileMode ? 'translateY(10px)' : 'translateY(30px)';
            const delay = mobileMode ? 0 : index * 0.1;
            card.style.transition = mobileMode
                ? `opacity 0.35s ease-out ${delay}s, transform 0.35s ease-out ${delay}s`
                : `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`;
            observer.observe(card);
        });
    }

    // Animate skill bars when they scroll into view
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.width || '0%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.skill-progress').forEach(bar => {
        bar.style.width = '0%';
        skillObserver.observe(bar);
    });
});

// ===== Typing effect for hero subtitle =====
// Skipped if user prefers reduced motion or has already seen it this session
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle && !prefersReducedMotion && !sessionStorage.getItem('typingDone')) {
    const text = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            heroSubtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            sessionStorage.setItem('typingDone', '1');
        }
    }

    setTimeout(typeWriter, 1000);
}

// ===== Mini Game =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const startBtn = document.getElementById('startGame');
const gameOverlay = document.querySelector('.game-overlay');
const scoreDisplay = document.getElementById('gameScore');

if (canvas && ctx) {
    let gameRunning = false;
    let gameVisible = true;
    let score = 0;
    let gameSpeed = 2;
    let animationId;

    const player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 40,
        width: 30,
        height: 30,
        speed: 5,
        dx: 0
    };

    let obstacles = [];

    const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };

    document.addEventListener('keydown', (e) => {
        if (gameRunning && (e.key in keys)) {
            e.preventDefault();
            keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) keys[e.key] = false;
    });

    // Unified touch direction handler (deduplicates touchstart/touchmove)
    function handleTouchDirection(e) {
        if (!gameRunning) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        keys.ArrowLeft = touchX < rect.width / 2;
        keys.ArrowRight = !keys.ArrowLeft;
    }

    canvas.addEventListener('touchstart', handleTouchDirection, { passive: false });
    canvas.addEventListener('touchmove', handleTouchDirection, { passive: false });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
    });
    canvas.addEventListener('touchcancel', () => {
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
    });

    // Pre-render the static grid background once instead of every frame
    const offscreenGrid = (() => {
        const oc = document.createElement('canvas');
        oc.width = canvas.width;
        oc.height = canvas.height;
        const octx = oc.getContext('2d');
        octx.fillStyle = '#2d3748';
        octx.fillRect(0, 0, oc.width, oc.height);
        octx.strokeStyle = '#4a5568';
        octx.lineWidth = 0.5;
        for (let i = 0; i < oc.width; i += 20) {
            octx.beginPath();
            octx.moveTo(i, 0);
            octx.lineTo(i, oc.height);
            octx.stroke();
        }
        return oc;
    })();

    function drawPlayer() {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(player.x + 8, player.y + 8, 5, 5);
        ctx.fillRect(player.x + 17, player.y + 8, 5, 5);
        ctx.fillRect(player.x + 10, player.y + 20, 10, 3);
    }

    function createObstacle() {
        const width = 20 + Math.random() * 40;
        obstacles.push({
            x: Math.random() * (canvas.width - width),
            y: -30,
            width,
            height: 30,
            speed: gameSpeed
        });
    }

    function drawObstacles() {
        obstacles.forEach(obs => {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.fillStyle = '#fca5a5';
            for (let i = 0; i < obs.width; i += 10) {
                ctx.fillRect(obs.x + i, obs.y, 5, obs.height);
            }
        });
    }

    function updatePlayer() {
        player.dx = 0;
        if (keys.ArrowLeft || keys.a) player.dx = -player.speed;
        if (keys.ArrowRight || keys.d) player.dx = player.speed;
        player.x = Math.max(0, Math.min(player.x + player.dx, canvas.width - player.width));
    }

    function updateObstacles() {
        for (let index = obstacles.length - 1; index >= 0; index--) {
            const obs = obstacles[index];
            obs.y += obs.speed;

            if (obs.y > canvas.height) {
                obstacles.splice(index, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                if (score % 100 === 0) gameSpeed += 0.5;
                continue;
            }

            if (
                player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                player.y < obs.y + obs.height &&
                player.y + player.height > obs.y
            ) {
                gameOver();
                return true;
            }
        }
        return false;
    }

    function clear() {
        ctx.drawImage(offscreenGrid, 0, 0);
    }

    function gameLoop() {
        if (!gameRunning) return;
        if (!gameVisible) return; // paused — IntersectionObserver will resume

        clear();
        drawPlayer();
        drawObstacles();
        updatePlayer();
        if (updateObstacles()) return;

        if (Math.random() < 0.02) createObstacle();

        animationId = requestAnimationFrame(gameLoop);
    }

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

    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);

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

        setTimeout(() => {
            gameOverlay.classList.remove('hidden');
            startBtn.textContent = 'Play Again! 🎮';
        }, 2000);
    }

    if (startBtn) startBtn.addEventListener('click', startGame);

    // Pause game loop when canvas is scrolled off-screen
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const wasVisible = gameVisible;
            gameVisible = entry.isIntersecting;
            if (gameVisible && !wasVisible && gameRunning) {
                animationId = requestAnimationFrame(gameLoop);
            }
        });
    }, { threshold: 0.05 }).observe(canvas);

    clear();
    drawPlayer();
}

// ===== Puppy Playground =====
const puppyCanvas = document.getElementById('puppyCanvas');
const puppyCtx = puppyCanvas ? puppyCanvas.getContext('2d') : null;
const feedBtn = document.getElementById('feedPuppy');
const playBtn = document.getElementById('playPuppy');
const petBtn = document.getElementById('petPuppy');
const moodDisplay = document.getElementById('puppyMood');

if (puppyCanvas && puppyCtx) {
    let puppyAnimationId;
    let puppyRunning = false;
    let puppyVisible = true;

    const puppy = {
        x: puppyCanvas.width / 2,
        y: puppyCanvas.height / 2,
        targetX: puppyCanvas.width / 2,
        targetY: puppyCanvas.height / 2,
        size: 30,
        speed: 1.5,
        direction: 1,
        mood: 'happy',
        isJumping: false,
        jumpHeight: 0,
        wiggleOffset: 0, // visual-only offset, doesn't affect position tracking
        activity: 'idle'
    };

    let particles = [];

    const moods = {
        happy:   { emoji: '😊', text: 'Happy' },
        excited: { emoji: '🤩', text: 'Excited!' },
        playful: { emoji: '😄', text: 'Playful!' },
        loved:   { emoji: '🥰', text: 'Loved!' }
    };

    function createParticles(x, y, type) {
        const colors = {
            heart: ['#ff69b4', '#ff1493', '#ffc0cb'],
            star:  ['#ffd700', '#ffff00', '#ffa500'],
            bone:  ['#f5deb3', '#deb887', '#d2b48c']
        };
        const symbols = { heart: '💕', star: '⭐', bone: '🦴' };
        for (let i = 0; i < 10; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 4 - 2,
                life: 1,
                color: colors[type][Math.floor(Math.random() * colors[type].length)],
                symbol: symbols[type]
            });
        }
    }

    // Pre-compute background gradient once instead of every frame
    const bgGradient = (() => {
        const g = puppyCtx.createLinearGradient(0, 0, 0, puppyCanvas.height);
        g.addColorStop(0, '#87ceeb');
        g.addColorStop(1, '#90ee90');
        return g;
    })();

    function drawBackground() {
        puppyCtx.fillStyle = bgGradient;
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

        // Grass
        puppyCtx.strokeStyle = '#228b22';
        puppyCtx.lineWidth = 2;
        for (let i = 0; i < puppyCanvas.width; i += 20) {
            puppyCtx.beginPath();
            puppyCtx.moveTo(i, puppyCanvas.height);
            puppyCtx.lineTo(i + 3, puppyCanvas.height - 10);
            puppyCtx.stroke();
        }
    }

    function drawPuppy() {
        // wiggleOffset is visual-only — applied here, not in position tracking
        const x = puppy.x + puppy.wiggleOffset;
        const y = puppy.y - puppy.jumpHeight;
        const size = puppy.size;

        puppyCtx.save();

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

        // Mouth (wider when excited/playful)
        puppyCtx.strokeStyle = '#000';
        puppyCtx.lineWidth = 2;
        puppyCtx.beginPath();
        if (puppy.mood === 'excited' || puppy.mood === 'playful') {
            puppyCtx.arc(x + size * 0.3, y - size * 0.15, size * 0.15, 0.2, Math.PI - 0.2);
        } else {
            puppyCtx.arc(x + size * 0.3, y - size * 0.15, size * 0.12, 0.3, Math.PI - 0.3);
        }
        puppyCtx.stroke();

        // Tail (wags when excited/playful/loved)
        const tailWag = puppy.mood !== 'happy' ? Math.sin(Date.now() * 0.02) * 0.3 : 0;
        puppyCtx.strokeStyle = '#d4a373';
        puppyCtx.lineWidth = 4;
        puppyCtx.beginPath();
        puppyCtx.arc(x - size * 0.5, y + size * 0.1, size * 0.3, -Math.PI / 4 + tailWag, Math.PI / 4 + tailWag);
        puppyCtx.stroke();

        puppyCtx.restore();
    }

    function updatePuppy() {
        const dx = puppy.targetX - puppy.x;
        const dy = puppy.targetY - puppy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            puppy.x += (dx / distance) * puppy.speed;
            puppy.y += (dy / distance) * puppy.speed;
            if (dx > 0) puppy.direction = 1;
            else if (dx < 0) puppy.direction = -1;
        }

        if (puppy.isJumping) {
            puppy.jumpHeight += 5;
            if (puppy.jumpHeight >= 20) puppy.isJumping = false;
        } else if (puppy.jumpHeight > 0) {
            puppy.jumpHeight -= 5;
        }
    }

    function updateParticles() {
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life -= 0.02;
        });
    }

    function drawParticles() {
        puppyCtx.font = '16px Arial';
        particles.forEach(p => {
            puppyCtx.save();
            puppyCtx.globalAlpha = p.life;
            puppyCtx.fillText(p.symbol, p.x, p.y);
            puppyCtx.restore();
        });
    }

    function puppyLoop() {
        if (!puppyRunning) return;
        drawBackground();
        updatePuppy();
        updateParticles();
        drawPuppy();
        drawParticles();
        puppyAnimationId = requestAnimationFrame(puppyLoop);
    }

    function setPuppyRunning(shouldRun) {
        if (shouldRun && !puppyRunning) {
            puppyRunning = true;
            puppyAnimationId = requestAnimationFrame(puppyLoop);
        } else if (!shouldRun && puppyRunning) {
            puppyRunning = false;
            cancelAnimationFrame(puppyAnimationId);
        }
    }

    // Canvas click: move puppy to clicked position (scaled to canvas resolution)
    puppyCanvas.addEventListener('click', (e) => {
        const rect = puppyCanvas.getBoundingClientRect();
        const scaleX = puppyCanvas.width / rect.width;
        const scaleY = puppyCanvas.height / rect.height;
        puppy.targetX = (e.clientX - rect.left) * scaleX;
        puppy.targetY = (e.clientY - rect.top) * scaleY;
    });

    feedBtn.addEventListener('click', () => {
        puppy.mood = 'happy';
        puppy.isJumping = true;
        createParticles(puppy.x, puppy.y, 'bone');
        moodDisplay.innerHTML = `Mood: ${moods.happy.emoji} ${moods.happy.text}`;
    });

    playBtn.addEventListener('click', () => {
        puppy.mood = 'playful';
        puppy.speed = 3;
        createParticles(puppy.x, puppy.y, 'star');
        moodDisplay.innerHTML = `Mood: ${moods.playful.emoji} ${moods.playful.text}`;
        puppy.targetX = Math.random() * (puppyCanvas.width - 60) + 30;
        puppy.targetY = Math.random() * (puppyCanvas.height - 60) + 30;
        setTimeout(() => {
            puppy.speed = 1.5;
            puppy.mood = 'happy';
            moodDisplay.innerHTML = `Mood: ${moods.happy.emoji} ${moods.happy.text}`;
        }, 3000);
    });

    petBtn.addEventListener('click', () => {
        puppy.mood = 'loved';
        createParticles(puppy.x, puppy.y, 'heart');
        moodDisplay.innerHTML = `Mood: ${moods.loved.emoji} ${moods.loved.text}`;

        // Wiggle is a visual-only offset applied in drawPuppy — doesn't fight updatePuppy
        let wiggleCount = 0;
        const wiggleInterval = setInterval(() => {
            puppy.wiggleOffset = Math.sin(wiggleCount * 0.5) * 5;
            wiggleCount++;
            if (wiggleCount > 20) {
                clearInterval(wiggleInterval);
                puppy.wiggleOffset = 0;
                puppy.mood = 'happy';
                moodDisplay.innerHTML = `Mood: ${moods.happy.emoji} ${moods.happy.text}`;
            }
        }, 50);
    });

    // Pause animation when canvas is off-screen or tab is hidden
    const puppyVisibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            puppyVisible = entry.isIntersecting;
            setPuppyRunning(puppyVisible && !document.hidden);
        });
    }, { threshold: 0.05 });

    puppyVisibilityObserver.observe(puppyCanvas);
    document.addEventListener('visibilitychange', () => {
        setPuppyRunning(puppyVisible && !document.hidden);
    });

    setPuppyRunning(!document.hidden);
}

// ===== Scroll to top =====
const scrollToTopBtn = document.getElementById('scrollToTop');
if (scrollToTopBtn) {
    const heroSection = document.getElementById('home');

    const scrollToTopObserver = new IntersectionObserver((entries) => {
        const heroVisible = entries[0].isIntersecting;
        scrollToTopBtn.hidden = false;
        scrollToTopBtn.classList.toggle('is-visible', !heroVisible);
    }, { threshold: 0.2 });

    if (heroSection) scrollToTopObserver.observe(heroSection);

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
}


// ===== Uniform timeline card heights =====
function equalizeTimelineCards() {
    const cards = Array.from(document.querySelectorAll('.timeline-content'));
    cards.forEach(c => c.style.height = '');
    if (window.innerWidth <= 768) return;
    const maxH = Math.max(...cards.map(c => c.offsetHeight));
    cards.forEach(c => c.style.height = maxH + 'px');
}

window.addEventListener('load', equalizeTimelineCards);
let _eqTimer;
window.addEventListener('resize', () => {
    clearTimeout(_eqTimer);
    _eqTimer = setTimeout(equalizeTimelineCards, 100);
});

console.log('Portfolio loaded successfully! 🚀');
