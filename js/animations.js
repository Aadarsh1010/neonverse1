/* ═══════════════════════════════════════════════════
   NEONVERSE — Animations Module
   Scroll reveals, count-up, parallax, particles
   ═══════════════════════════════════════════════════ */

const Animations = (() => {
  /* ── Scroll Reveal (Intersection Observer) ── */
  function initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // If it's a staggered element, add delay based on index
          if (entry.target.dataset.stagger !== undefined) {
            const delay = parseInt(entry.target.dataset.stagger) * 100;
            entry.target.style.transitionDelay = `${delay}ms`;
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-left, .reveal-right, .reveal-bottom, .reveal-scale').forEach(el => {
      observer.observe(el);
    });
  }

  /* ── Stagger Cards ── */
  function staggerCards(containerSelector, cardSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cards = container.querySelectorAll(cardSelector);
    cards.forEach((card, i) => {
      card.classList.add('reveal-stagger');
      card.dataset.stagger = i;
    });

    initScrollReveal();
  }

  /* ═══════════════════════════════════════════════════
     COUNT-UP ANIMATION — Clean formatted numbers
     94000 → "94K+"   12400 → "12.4K+"
     8200 → "8.2K+"   2100000 → "2.1M+"
     ═══════════════════════════════════════════════════ */

  /**
   * Animates a number from 0 to target with clean formatting
   * @param {HTMLElement} element - DOM element to update
   * @param {number} target - The final number to count to
   * @param {number} duration - Animation duration in ms
   */
  function countUp(element, target, duration = 2000) {
    if (!element || !target) return;

    let current = 0;
    // Each frame is ~16ms (60fps)
    const totalFrames = duration / 16;
    const step = target / totalFrames;
    const isMillions = target >= 1000000;
    const isThousands = target >= 1000;

    const timer = setInterval(() => {
      current += step;

      // Clamp to target
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      // Format display string
      let display;
      if (isMillions) {
        // e.g. 2100000 → "2.1M+"
        display = (current / 1000000).toFixed(1) + 'M+';
      } else if (isThousands) {
        // e.g. 94000 → "94K+", 12400 → "12.4K+"
        const val = current / 1000;
        if (val >= 100) {
          // 100K+ — no decimal
          display = Math.floor(val) + 'K+';
        } else if (val >= 10) {
          // 10K-99K — show decimal if needed
          display = (Math.floor(val * 10) / 10) + 'K+';
        } else {
          // Under 10K — always show one decimal
          display = (Math.floor(val * 10) / 10) + 'K+';
        }
      } else {
        // Under 1000 — show raw number
        display = Math.floor(current) + '+';
      }

      element.textContent = display;
    }, 16);

    return timer;
  }

  /**
   * Initialize count-up on all elements with [data-count]
   * Uses IntersectionObserver to trigger ONCE when visible
   * Adds 'counted' data attribute to prevent re-triggering
   */
  function initCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;

          // Only count once per page load
          if (el.dataset.counted === 'true') return;
          el.dataset.counted = 'true';

          const target = parseInt(el.dataset.count, 10);
          const duration = parseInt(el.dataset.duration, 10) || 2000;

          if (isNaN(target) || target <= 0) return;

          countUp(el, target, duration);

          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -30px 0px'
    });

    counters.forEach(counter => {
      // Reset text to "0" before animating
      counter.textContent = '0';
      observer.observe(counter);
    });
  }

  /* ── Parallax on Mouse Move ── */
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const bg = hero.querySelector('.hero-bg');
    if (!bg) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const maxShift = 20;
      requestAnimationFrame(() => {
        bg.style.transform = `translate(${x * maxShift}px, ${y * maxShift}px)`;
      });
    });
  }

  /* ── Particle Canvas ── */
  function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;
    let animFrame;

    function resize() {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = Math.random() * 0.8 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.6 + 0.2;
        // Random neon color
        const colors = ['176, 38, 255', '0, 212, 255', '255, 45, 120', '0, 255, 157'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.opacity -= 0.001;

        if (this.y < -10 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity * 0.15})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animFrame = requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener('resize', () => {
      resize();
    });
  }

  /* ── Typewriter Effect ── */
  function initTypewriter(element, text, speed = 60) {
    if (!element) return;

    let i = 0;
    element.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    function type() {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  /* ── Page Transitions ── */
  function initPageTransitions() {
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);

    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');

      // Only for internal HTML links
      if (!href || !href.endsWith('.html') || href.startsWith('http')) return;

      e.preventDefault();
      overlay.classList.add('active');

      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });

    // Fade in on load
    window.addEventListener('pageshow', () => {
      overlay.classList.remove('active');
    });
  }

  return {
    initScrollReveal,
    staggerCards,
    initCountUp,
    countUp,
    initParallax,
    initParticles,
    initTypewriter,
    initPageTransitions
  };
})();
