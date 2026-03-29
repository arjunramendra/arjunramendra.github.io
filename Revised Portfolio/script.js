/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO INTERACTIONS & MOTION
   - Cursor glow tracking
   - Scroll-triggered reveal animations
   - Skill bar animations
   - Counter animations
   - Terminal typewriter effect
   - Navbar scroll behavior
   - Mobile menu
   - Smooth form interaction
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ──────────── THEME (DARK / LIGHT) ─────────────
const themeToggle = document.getElementById('themeToggle');
const iconMoon    = themeToggle ? themeToggle.querySelector('.icon-moon') : null;
const iconSun     = themeToggle ? themeToggle.querySelector('.icon-sun')  : null;

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  if (iconMoon && iconSun) {
    iconMoon.style.display = theme === 'light' ? 'none'  : '';
    iconSun.style.display  = theme === 'light' ? ''      : 'none';
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
};

// Init: saved preference → system preference → dark
const savedTheme = localStorage.getItem('portfolio-theme');
applyTheme(savedTheme || getSystemTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

// ──────────── RESPECT REDUCED MOTION ─────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ──────────── CURSOR GLOW ─────────────
const cursorGlow = document.getElementById('cursorGlow');

if (!prefersReducedMotion && cursorGlow && window.innerWidth > 768) {
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let mouseMoved = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseMoved = true;
  });

  const animateCursor = () => {
    if (mouseMoved) {
      // Smooth lerp for glow follow
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top  = glowY + 'px';

      // Stop updating DOM once settled (within 0.5px)
      if (Math.abs(mouseX - glowX) < 0.5 && Math.abs(mouseY - glowY) < 0.5) {
        mouseMoved = false;
      }
    }
    requestAnimationFrame(animateCursor);
  };

  animateCursor();
}

// ──────────── NAVBAR SCROLL + SCROLL SPY (single listener) ─────────────
const navbar = document.getElementById('navbar');

// ──────────── MOBILE MENU ─────────────
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen.toString());
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close mobile menu on resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}, { passive: true });

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }
});

// ──────────── REVEAL ON SCROLL ─────────────
const revealElements = document.querySelectorAll('.reveal');

// Fallback for browsers without IntersectionObserver support
if (!window.IntersectionObserver) {
  revealElements.forEach(el => el.classList.add('visible'));
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || '0', 10);

      if (prefersReducedMotion) {
        entry.target.classList.add('visible');
      } else {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
      }

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// ──────────── COUNTER ANIMATION ─────────────
const statNums = document.querySelectorAll('.stat-num');

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const animateCounter = (el, target, duration = 1800) => {
  if (prefersReducedMotion) {
    el.textContent = target;
    return;
  }

  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(easeOutQuart(progress) * target);
    el.textContent = value;

    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(num => counterObserver.observe(num));

// ──────────── TERMINAL TYPEWRITER ─────────────
const terminalEl = document.getElementById('terminalText');

const terminalLines = [
  'mvn spring-boot:run',
  'docker build -t api:latest .',
  'kubectl apply -f deployment.yaml',
  'az aks get-credentials --name prod',
  'git push origin main',
];

let lineIdx   = 0;
let charIdx   = 0;
let isDeleting = false;

const typeSpeed    = 65;
const deleteSpeed  = 35;
const pauseAfter   = 1800;
const pauseDeleted = 300;  // pause after full deletion before next line
const pauseBefore  = 200;  // pause before typing starts

const typeTerminal = () => {
  if (!terminalEl || prefersReducedMotion) {
    if (terminalEl) terminalEl.textContent = terminalLines[0];
    return;
  }

  const currentLine = terminalLines[lineIdx];

  if (!isDeleting) {
    terminalEl.textContent = currentLine.substring(0, charIdx + 1);
    charIdx++;

    if (charIdx === currentLine.length) {
      isDeleting = true;
      setTimeout(typeTerminal, pauseAfter);
      return;
    }
  } else {
    terminalEl.textContent = currentLine.substring(0, charIdx - 1);
    charIdx--;

    if (charIdx === 0) {
      isDeleting = false;
      lineIdx = (lineIdx + 1) % terminalLines.length;
      setTimeout(typeTerminal, pauseDeleted + pauseBefore);
      return;
    }
  }

  setTimeout(typeTerminal, isDeleting ? deleteSpeed : typeSpeed);
};

// Start terminal after a short delay
setTimeout(typeTerminal, 1200);

// ──────────── ACTIVE NAV LINK (Scroll Spy) ─────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

let scrollRafPending = false;
const scrollProgressEl = document.getElementById('scrollProgress');

const onScroll = () => {
  if (scrollRafPending) return;
  scrollRafPending = true;

  requestAnimationFrame(() => {
    scrollRafPending = false;

    // Navbar scrolled state
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Scroll progress bar
    if (scrollProgressEl) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressEl.style.width = (max > 0 ? (window.scrollY / max) * 100 : 100) + '%';
    }

    // Active nav spy — default to first section when at top
    let currentSection = sections.length ? sections[0].getAttribute('id') : '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top && window.scrollY < top + sec.offsetHeight) {
        currentSection = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentSection);
    });

    // Back-to-top visibility
    const backToTop = document.getElementById('backToTop');
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY >= 500);
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run on init

// ──────────── CONTACT FORM ─────────────
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('form-submit');

if (contactForm) {
  // Show/hide "other topic" input when subject === 'other'
  const subjectSelectEl    = document.getElementById('form-subject');
  const otherTopicGroup    = document.getElementById('other-topic-group');
  if (subjectSelectEl && otherTopicGroup) {
    subjectSelectEl.addEventListener('change', () => {
      const show = subjectSelectEl.value === 'other';
      otherTopicGroup.style.display = show ? 'block' : 'none';
    });
  }

  // Warn visually if Formspree is not configured
  if (contactForm.dataset.formId === 'YOUR_FORM_ID') {
    const note = contactForm.querySelector('.form-note');
    if (note) {
      note.textContent = 'Form not yet configured — email ramendraarjun@gmail.com directly.';
      note.style.color = 'var(--orange)';
    }
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Block submission if Formspree is unconfigured
    if (contactForm.dataset.formId === 'YOUR_FORM_ID') {
      window.location.href = 'mailto:ramendraarjun@gmail.com';
      return;
    }

    // Honeypot check — bots fill hidden fields
    if (contactForm.querySelector('[name="_gotcha"]')?.value) return;

    // Clear previous errors
    clearFormErrors();

    const nameEl    = document.getElementById('form-name');
    const emailEl   = document.getElementById('form-email');
    const subjectEl = document.getElementById('form-subject');
    const messageEl = document.getElementById('form-message');

    const name    = nameEl.value.trim();
    const email   = emailEl.value.trim();
    const subject = subjectEl.value;
    const message = messageEl.value.trim();

    let hasError = false;

    if (!name)    { setFieldError(nameEl,    'err-name',    'Name is required.');    hasError = true; }
    if (!email)   { setFieldError(emailEl,   'err-email',   'Email is required.');   hasError = true; }
    else if (!isValidEmail(email)) { setFieldError(emailEl, 'err-email', 'Please enter a valid email address.'); hasError = true; }
    if (!subject) { setFieldError(subjectEl, 'err-subject', 'Please select a topic.'); hasError = true; }
    if (!message) { setFieldError(messageEl, 'err-message', 'Message is required.'); hasError = true; }

    if (hasError) { shakeForm(); return; }

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.innerHTML = `
      <span>Sending...</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="40 20" class="spin-circle">
        </circle>
      </svg>
    `;

    const formData = new FormData(contactForm);
    const action = contactForm.getAttribute('action');
    let success = false;

    // Only attempt real submission if Formspree ID has been configured
    if (action && !action.includes('YOUR_FORM_ID')) {
      try {
        const res = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });
        success = res.ok;
      } catch (_) {
        success = false;
      }
    } else {
      // Dev/demo mode — simulate success
      await new Promise(r => setTimeout(r, 1000));
      success = true;
    }

    submitBtn.removeAttribute('aria-busy');

    if (success) {
      submitBtn.innerHTML = `
        <span>Message Sent!</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `;
      submitBtn.style.background = 'linear-gradient(135deg, var(--green), #22c55e)';
      contactForm.reset();
      // Explicitly reset select to placeholder (browser inconsistency fix)
      const sel = document.getElementById('form-subject');
      if (sel) sel.value = '';
      // Hide the "other topic" field if it was open
      if (otherTopicGroup) otherTopicGroup.style.display = 'none';
    } else {
      submitBtn.innerHTML = `<span>Failed — try again</span>`;
      submitBtn.style.background = 'linear-gradient(135deg, var(--red), #ef4444)';
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.style.background = '';
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }, 3000);
  });

  // Clear error state on input focus
  contactForm.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.style.borderColor = '';
      const errId = input.getAttribute('aria-describedby');
      if (errId) {
        const errEl = document.getElementById(errId);
        if (errEl) errEl.textContent = '';
      }
    });
  });
}

function setFieldError(inputEl, errId, message) {
  inputEl.style.borderColor = 'var(--red)';
  const errEl = document.getElementById(errId);
  if (errEl) errEl.textContent = message;
}

function clearFormErrors() {
  if (!contactForm) return;
  contactForm.querySelectorAll('.form-input').forEach(el => {
    el.style.borderColor = '';
  });
  contactForm.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeForm() {
  if (!contactForm || prefersReducedMotion) return;
  contactForm.style.animation = 'shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
  setTimeout(() => { contactForm.style.animation = ''; }, 400);
}

// ──────────── PROJECT CARD TILT (subtle 3D hover) ─────────────
if (!prefersReducedMotion) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;
      const rotateY = ((x - cx) / cx) * 4;

      card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ──────────── SMOOTH SCROLL (event delegation) ─────────────
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;

  const targetId = anchor.getAttribute('href');
  if (targetId === '#') return;

  const targetEl = document.querySelector(targetId);
  if (!targetEl) return;

  e.preventDefault();

  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
  const top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
});

// spin + shake keyframes are defined in styles.css

// ──────────── CUSTOM CURSOR (dot + ring) ─────────────
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  let mX = -200, mY = -200, rX = -200, rY = -200;
  let ringDirty = true;

  document.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    dot.style.left = mX + 'px';
    dot.style.top  = mY + 'px';
    ringDirty = true;
  });

  // Smooth-follow ring (with dirty check)
  const RING_SETTLE = 0.5; // px threshold
  (function rafRing() {
    if (ringDirty) {
      rX += (mX - rX) * 0.11;
      rY += (mY - rY) * 0.11;
      ring.style.left = rX + 'px';
      ring.style.top  = rY + 'px';
      if (Math.abs(mX - rX) < RING_SETTLE && Math.abs(mY - rY) < RING_SETTLE) ringDirty = false;
    }
    requestAnimationFrame(rafRing);
  })();

  const interactives = 'a, button, .tech-pill, .project-card, .nav-logo, .nav-cta';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => { ring.classList.add('hovering'); dot.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { ring.classList.remove('hovering'); dot.classList.remove('hovering'); });
  });
})();

// ──────────── CHIP / TECH-BADGE SCRAMBLE ─────────────
(function initScramble() {
  if (prefersReducedMotion) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  document.querySelectorAll('.tech-pill').forEach(chip => {
    const original = chip.textContent;
    let timer = null;

    chip.addEventListener('mouseenter', () => {
      clearInterval(timer);
      let progress = 0;
      timer = setInterval(() => {
        chip.textContent = original.split('').map((ch, idx) => {
          if (idx < progress) return original[idx];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        progress += 0.5;
        if (progress >= original.length) {
          clearInterval(timer);
          chip.textContent = original;
        }
      }, 28);
    });

    chip.addEventListener('mouseleave', () => {
      clearInterval(timer);
      chip.textContent = original;
    });
  });
})();


// ──────────── BACK TO TOP ─────────────
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// ──────────── INIT — reveal hero immediately ─────────────
window.addEventListener('load', () => {
  // Trigger hero elements with 0 delay immediately
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    if (prefersReducedMotion) {
      el.classList.add('visible');
    } else {
      setTimeout(() => el.classList.add('visible'), delay + 100);
    }
  });
});
