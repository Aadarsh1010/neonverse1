/* ═══════════════════════════════════════════════════
   NEONVERSE — Main Application
   Loading screen, navbar, modals, easter egg
   ═══════════════════════════════════════════════════ */

/* ── Loading Screen ── */
const LoadingScreen = (() => {
  let screen, progressBar;

  function init() {
    screen = document.querySelector('.loading-screen');
    if (!screen) return;
    progressBar = screen.querySelector('.loading-progress-bar');
    simulateLoad();
  }

  function simulateLoad() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(hide, 400);
      }
      if (progressBar) progressBar.style.width = progress + '%';
    }, 150);
  }

  function hide() {
    if (screen) {
      screen.classList.add('hidden');
      setTimeout(() => {
        screen.style.display = 'none';
      }, 800);
    }
  }

  return { init };
})();

/* ── Navbar ── */
const Navbar = (() => {
  function init() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.navbar-hamburger');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');

    if (!navbar) return;

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });

    // Mobile hamburger
    if (hamburger && mobileOverlay) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
      });

      // Close mobile nav on link click
      mobileOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileOverlay.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    // Set active link
    setActiveLink();
  }

  function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-links a, .mobile-nav-overlay a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════
   MODAL SYSTEM — Cinematic Banner + Poster Layout
   ═══════════════════════════════════════════════════ */
const Modal = (() => {
  let overlay, content;

  function init() {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">✕</button>
        <div class="modal-body-slot"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    content = overlay.querySelector('.modal-body-slot');

    // Close events
    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });
  }

  function open(html) {
    content.innerHTML = html;
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Scroll modal to top
    const modalBox = overlay.querySelector('.modal-content');
    if (modalBox) modalBox.scrollTop = 0;
  }

  function close() {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  /* ── Anime Detail Modal ── */
  function showAnime(anime) {
    // Images — use largest available
    const bannerImg = anime.images?.jpg?.large_image_url
      || anime.images?.jpg?.image_url
      || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200';
    const posterImg = anime.images?.jpg?.large_image_url
      || anime.images?.jpg?.image_url
      || '';

    // Genre tags
    const genreTags = (anime.genres || []).map(g =>
      `<span class="modal-genre-tag">${g.name}</span>`
    ).join('');

    // Synopsis — escape HTML
    const synopsis = (anime.synopsis || 'No synopsis available.')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // YouTube trailer search URL
    const trailerQuery = encodeURIComponent(`${anime.title} anime trailer`);
    const trailerUrl = anime.url
      ? `https://www.youtube.com/results?search_query=${trailerQuery}`
      : `https://www.youtube.com/results?search_query=${trailerQuery}`;

    // Mal URL for more info
    const malUrl = anime.url || '#';

    open(`
      <!-- Cinematic Banner -->
      <img
        class="modal-banner"
        src="${bannerImg}"
        alt="${anime.title} banner"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'"
      />

      <!-- Two-Column Layout -->
      <div class="modal-inner">
        <!-- Left: Poster -->
        <div class="modal-poster-col">
          ${posterImg ? `<img class="modal-poster" src="${posterImg}" alt="${anime.title}" loading="lazy" onerror="this.style.display='none'" />` : ''}
        </div>

        <!-- Right: Info -->
        <div class="modal-info-col">
          <!-- Title -->
          <h2 class="modal-title">${anime.title || 'Unknown Title'}</h2>
          ${anime.title_japanese ? `<div class="modal-title-jp">${anime.title_japanese}</div>` : ''}

          <!-- Badge Row -->
          <div class="modal-badges">
            ${anime.score ? `<span class="modal-badge score">⭐ ${anime.score}</span>` : ''}
            ${anime.episodes ? `<span class="modal-badge episodes">📺 ${anime.episodes} EP</span>` : ''}
            ${anime.status ? `<span class="modal-badge status">📡 ${anime.status}</span>` : ''}
            ${anime.year ? `<span class="modal-badge year">📅 ${anime.year}</span>` : ''}
            ${anime.rating ? `<span class="modal-badge rating">🏷️ ${anime.rating}</span>` : ''}
          </div>

          <!-- Genre Tags -->
          ${genreTags ? `<div class="modal-genres">${genreTags}</div>` : ''}

          <!-- Synopsis -->
          <div class="modal-synopsis">${synopsis}</div>

          <!-- Action Buttons -->
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <a href="${trailerUrl}" target="_blank" rel="noopener" class="modal-trailer-btn">
              <span class="play-icon">▶</span> Watch Trailer
            </a>
            <a href="${malUrl}" target="_blank" rel="noopener" class="modal-trailer-btn" style="background: rgba(176,38,255,0.15); box-shadow: none; border: 1px solid rgba(176,38,255,0.3);">
              More Info
            </a>
          </div>
        </div>
      </div>
    `);
  }

  /* ── Game Detail Modal ── */
  function showGame(game) {
    // Images
    const bannerImg = game.background_image
      || game.background_image_additional
      || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200';

    // Platform icons
    const platformIcons = (game.platforms || []).map(p => {
      const name = p.platform?.name || '';
      let icon = '🎮';
      if (name.includes('PC')) icon = '🖥️';
      else if (name.includes('PlayStation')) icon = '🎮';
      else if (name.includes('Xbox')) icon = '🟢';
      else if (name.includes('Nintendo') || name.includes('Switch')) icon = '🔴';
      return `<div class="modal-platform-icon" title="${name}">${icon}</div>`;
    }).join('');

    // Genre tags
    const genreTags = (game.genres || []).map(g =>
      `<span class="modal-genre-tag">${g.name}</span>`
    ).join('');

    // Description
    const synopsis = (game.description_raw || game.description || 'No description available.')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Metacritic badge class
    const mcClass = game.metacritic >= 80 ? 'metacritic-high'
      : game.metacritic >= 60 ? 'metacritic-mid'
      : 'metacritic-low';

    // YouTube search
    const trailerQuery = encodeURIComponent(`${game.name} game trailer`);
    const trailerUrl = `https://www.youtube.com/results?search_query=${trailerQuery}`;
    const storeUrl = game.website || game.url || '#';

    open(`
      <!-- Cinematic Banner -->
      <img
        class="modal-banner"
        src="${bannerImg}"
        alt="${game.name} banner"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200'"
      />

      <!-- Two-Column Layout -->
      <div class="modal-inner">
        <!-- Left: No poster for games, show metacritic hero -->
        <div class="modal-poster-col">
          ${game.metacritic ? `
            <div style="
              width: 180px;
              height: 260px;
              border-radius: 12px;
              background: linear-gradient(135deg, rgba(176,38,255,0.15), rgba(0,212,255,0.1));
              border: 2px solid rgba(176,38,255,0.3);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(176,38,255,0.2);
            ">
              <div style="font-family:Orbitron,sans-serif; font-size:3.5rem; font-weight:900; color:${game.metacritic >= 80 ? 'var(--neon-green)' : game.metacritic >= 60 ? '#ffd700' : 'var(--neon-pink)'}; text-shadow: 0 0 20px currentColor;">${game.metacritic}</div>
              <div style="font-family:Rajdhani,sans-serif; font-weight:700; font-size:0.8rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.15em; margin-top:0.5rem;">Metacritic</div>
            </div>
          ` : `
            <img class="modal-poster" src="${bannerImg}" alt="${game.name}" loading="lazy" />
          `}
        </div>

        <!-- Right: Info -->
        <div class="modal-info-col">
          <!-- Title -->
          <h2 class="modal-title">${game.name || 'Unknown Game'}</h2>

          <!-- Badge Row -->
          <div class="modal-badges">
            ${game.metacritic ? `<span class="modal-badge ${mcClass}">📊 Metacritic: ${game.metacritic}</span>` : ''}
            ${game.rating ? `<span class="modal-badge score">⭐ ${game.rating}/5</span>` : ''}
            ${game.released ? `<span class="modal-badge year">📅 ${game.released}</span>` : ''}
            ${game.playtime ? `<span class="modal-badge episodes">⏱️ ${game.playtime}h avg</span>` : ''}
          </div>

          <!-- Platforms -->
          ${platformIcons ? `<div class="modal-platforms">${platformIcons}</div>` : ''}

          <!-- Genre Tags -->
          ${genreTags ? `<div class="modal-genres">${genreTags}</div>` : ''}

          <!-- Synopsis -->
          <div class="modal-synopsis">${synopsis}</div>

          <!-- Action Buttons -->
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <a href="${trailerUrl}" target="_blank" rel="noopener" class="modal-trailer-btn">
              <span class="play-icon">▶</span> Watch Trailer
            </a>
            <a href="${storeUrl}" target="_blank" rel="noopener" class="modal-trailer-btn" style="background: rgba(176,38,255,0.15); box-shadow: none; border: 1px solid rgba(176,38,255,0.3);">
              More Info
            </a>
          </div>
        </div>
      </div>
    `);
  }

  return { init, open, close, showAnime, showGame };
})();

/* ── Button Ripple Effect ── */
function initRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-primary, .btn-outline, .btn-ghost');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

/* ── Easter Egg ── */
const EasterEgg = (() => {
  let sequence = '';
  const target = 'neonverse';
  let overlay;

  function init() {
    overlay = document.createElement('div');
    overlay.className = 'easter-egg-overlay';
    overlay.innerHTML = '<div class="easter-egg-text">YOU FOUND THE SECRET.<br>WELCOME TO THE VOID.</div>';
    document.body.appendChild(overlay);

    document.addEventListener('keypress', (e) => {
      sequence += e.key.toLowerCase();
      if (sequence.length > target.length) {
        sequence = sequence.slice(-target.length);
      }
      if (sequence === target) {
        trigger();
        sequence = '';
      }
    });
  }

  function trigger() {
    overlay.classList.add('active');
    createExplosion();
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 3000);
  }

  function createExplosion() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const colors = ['#b026ff', '#00d4ff', '#ff2d78', '#00ff9d'];

    for (let i = 0; i < 80; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 2;
      const angle = (Math.PI * 2 * i) / 80;
      const velocity = Math.random() * 300 + 100;
      const color = colors[Math.floor(Math.random() * colors.length)];

      Object.assign(particle.style, {
        position: 'fixed',
        left: cx + 'px',
        top: cy + 'px',
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 10px ${color}`,
        pointerEvents: 'none',
        zIndex: '99998',
        transition: 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: '1'
      });

      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.left = (cx + Math.cos(angle) * velocity) + 'px';
        particle.style.top = (cy + Math.sin(angle) * velocity) + 'px';
        particle.style.opacity = '0';
        particle.style.transform = `scale(0)`;
      });

      setTimeout(() => particle.remove(), 1600);
    }
  }

  return { init };
})();

/* ── Skeleton Card Helpers ── */
function createSkeletonCard(className = '') {
  return `
    <div class="card ${className}">
      <div class="skeleton skeleton-card"></div>
      <div style="padding: 1rem;">
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    </div>
  `;
}

function createSkeletonRow(count = 6, className = '') {
  return Array.from({ length: count }, () => createSkeletonCard(className)).join('');
}

function createErrorCard(message = 'Failed to load', retryFn = '') {
  return `
    <div class="error-card">
      <div class="error-icon">⚡</div>
      <h3>${message}</h3>
      <p>Something went wrong. Please try again.</p>
      ${retryFn ? `<button class="btn btn-ghost" onclick="${retryFn}">Retry</button>` : ''}
    </div>
  `;
}

/* ── Initialize App ── */
document.addEventListener('DOMContentLoaded', () => {
  LoadingScreen.init();
  Navbar.init();
  Modal.init();
  Cursor.init();
  Search.init();
  EasterEgg.init();
  initRipples();

  // Animations
  Animations.initScrollReveal();
  Animations.initParallax();
  Animations.initCountUp();
  Animations.initPageTransitions();

  // Particles (if canvas exists)
  Animations.initParticles('hero-particles');

  // Typewriter (if element exists)
  const typewriterEl = document.querySelector('[data-typewriter]');
  if (typewriterEl) {
    Animations.initTypewriter(typewriterEl, typewriterEl.dataset.typewriter, 50);
  }
});
