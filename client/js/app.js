/**
 * SPRASH e-Library – App Core
 * =============================
 * Shared utilities, navigation, footer, animated counters,
 * toast notifications, and common helpers used across all pages.
 */

// ─── Configuration ────────────────────────────
const APP_CONFIG = {
  apiBase: '/api',
  siteName: 'SPRASH e-Library',
  orgName: 'Sparsh Balgram'
};

// ─── Theme System ─────────────────────────────
/**
 * Initialize the theme from localStorage.
 * Called before rendering to prevent flash of wrong theme.
 */
function initTheme() {
  const saved = localStorage.getItem('sprash-theme') || 'light';
  applyTheme(saved);
}

/**
 * Apply a theme and persist to localStorage.
 * @param {string} theme - 'light' | 'dark' | 'dark-blue'
 */
function setTheme(theme) {
  applyTheme(theme);
  localStorage.setItem('sprash-theme', theme);
  showToast(`Theme switched to ${theme === 'dark-blue' ? 'Dark Blue' : theme.charAt(0).toUpperCase() + theme.slice(1)}`, 'info', 2000);
}

/**
 * Apply theme to the DOM and update switcher button states.
 * @param {string} theme - 'light' | 'dark' | 'dark-blue'
 */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Update active state on switcher buttons
  document.querySelectorAll('.theme-switcher__btn').forEach(btn => {
    btn.classList.toggle('theme-switcher__btn--active', btn.getAttribute('data-theme') === theme);
  });
}

// ─── API Helper ───────────────────────────────
/**
 * Generic fetch wrapper for API calls.
 * @param {string} endpoint - API endpoint (e.g., '/books')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} Parsed JSON response
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const url = `${APP_CONFIG.apiBase}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options
    };

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ─── Toast Notifications ──────────────────────
/**
 * Show a toast notification.
 * @param {string} message - The message to display
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {number} duration - Auto-dismiss time in ms (default: 4000)
 */
function showToast(message, type = 'success', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : type === 'info' ? 'toast--info' : ''}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <span class="toast__message">${message}</span>
    <span class="toast__close" onclick="this.parentElement.remove()" aria-label="Dismiss">&times;</span>
  `;

  container.appendChild(toast);

  // Auto dismiss
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Loading Spinner ──────────────────────────
/**
 * Show or hide a loading spinner inside a container.
 * @param {HTMLElement} container - The element to show/hide spinner in
 * @param {boolean} show - Whether to show or hide
 */
function toggleSpinner(container, show) {
  let spinner = container.querySelector('.spinner');

  if (show) {
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'spinner spinner--active';
      spinner.innerHTML = '<div class="spinner__circle" aria-label="Loading"></div>';
      container.appendChild(spinner);
    } else {
      spinner.classList.add('spinner--active');
    }
  } else if (spinner) {
    spinner.classList.remove('spinner--active');
  }
}

// ─── Animated Counter ─────────────────────────
/**
 * Animate a number counter from 0 to the target value.
 * @param {HTMLElement} element - The element to update
 * @param {number} target - The target number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix (e.g., '+')
 */
function animateCounter(element, target, duration = 2000, suffix = '') {
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    element.textContent = current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Initialize all counters within a section.
 * Uses IntersectionObserver to trigger when visible.
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-counter'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, 2000, suffix);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach(counter => observer.observe(counter));
}

// ─── Scroll Effects ───────────────────────────

/**
 * Handle navbar background change on scroll.
 */
function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  const scrollTopBtn = document.querySelector('.scroll-top');

  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar shadow on scroll
    if (scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }

    // Scroll-to-top button visibility
    if (scrollTopBtn) {
      if (scrollY > 400) {
        scrollTopBtn.classList.add('scroll-top--visible');
      } else {
        scrollTopBtn.classList.remove('scroll-top--visible');
      }
    }
  });

  // Scroll-to-top click handler
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ─── Mobile Menu Toggle ───────────────────────
function initMobileMenu() {
  const toggle = document.querySelector('.navbar__toggle');
  const links = document.querySelector('.navbar__links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('navbar__links--open');
  });

  // Close menu when a link is clicked
  links.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('navbar__links--open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      toggle.classList.remove('active');
      links.classList.remove('navbar__links--open');
    }
  });
}

// ─── Render Navbar ────────────────────────────
/**
 * Dynamically renders the navbar on every page.
 * @param {string} activePage - The current page identifier
 */
function renderNavbar(activePage = '') {
  const navbarEl = document.getElementById('navbar');
  if (!navbarEl) return;

  const currentTheme = localStorage.getItem('sprash-theme') || 'light';

  const links = [
    { href: '/', label: 'Home', id: 'home' },
    { href: '/books.html', label: 'Library', id: 'library' },
    { href: '/about.html', label: 'About', id: 'about' },
    { href: '/contact.html', label: 'Contact', id: 'contact' }
  ];

  const linksHTML = links.map(link => {
    const isActive = activePage === link.id;
    return `<a href="${link.href}" class="navbar__link ${isActive ? 'navbar__link--active' : ''}">${link.label}</a>`;
  }).join('');

  const themeSwitcherHTML = `
    <div class="theme-switcher" role="radiogroup" aria-label="Theme selector">
      <button class="theme-switcher__btn ${currentTheme === 'light' ? 'theme-switcher__btn--active' : ''}" 
              data-theme="light" onclick="setTheme('light')" 
              role="radio" aria-checked="${currentTheme === 'light'}" 
              aria-label="Light theme" title="Light Theme">
        <span class="theme-switcher__icon">☀️</span> Light
      </button>
      <button class="theme-switcher__btn ${currentTheme === 'dark' ? 'theme-switcher__btn--active' : ''}" 
              data-theme="dark" onclick="setTheme('dark')" 
              role="radio" aria-checked="${currentTheme === 'dark'}" 
              aria-label="Dark theme" title="Dark Theme">
        <span class="theme-switcher__icon">🌙</span> Dark
      </button>
      <button class="theme-switcher__btn ${currentTheme === 'dark-blue' ? 'theme-switcher__btn--active' : ''}" 
              data-theme="dark-blue" onclick="setTheme('dark-blue')" 
              role="radio" aria-checked="${currentTheme === 'dark-blue'}" 
              aria-label="Dark Blue theme" title="Dark Blue Theme">
        <span class="theme-switcher__icon">🌊</span> Ocean
      </button>
    </div>
  `;

  navbarEl.innerHTML = `
    <div class="navbar__inner">
      <a href="/" class="navbar__brand" aria-label="SPRASH e-Library Home">
        <img src="/images/logo.png" alt="SPRASH e-Library Logo" class="navbar__logo-img" />
        <span class="navbar__name">SPRA<span>SH</span></span>
      </a>
      <div class="navbar__toggle" aria-label="Toggle menu" role="button" tabindex="0">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav class="navbar__links" aria-label="Main navigation">
        ${linksHTML}
        ${themeSwitcherHTML}
        <a href="/admin.html" class="navbar__link navbar__link--cta ${activePage === 'admin' ? 'navbar__link--active' : ''}">🔒 Admin</a>
      </nav>
    </div>
  `;

  initMobileMenu();
}

// ─── Render Footer ────────────────────────────
/**
 * Dynamically renders the footer on every page.
 */
function renderFooter() {
  const footerEl = document.getElementById('footer');
  if (!footerEl) return;

  const currentYear = new Date().getFullYear();

  footerEl.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="footer__brand">
            <img src="/images/logo.png" alt="SPRASH e-Library Logo" class="footer__logo-img" />
            <span class="footer__brand-name">SPRA<span>SH</span> e-Library</span>
          </div>
          <p class="footer__desc">
            A free digital education platform by Sparsh Balgram, 
            providing NCERT books to every child who wants to learn.
          </p>
        </div>
        <div>
          <h4 class="footer__heading">Quick Links</h4>
          <a href="/" class="footer__link">Home</a>
          <a href="/books.html" class="footer__link">Library</a>
          <a href="/about.html" class="footer__link">About Us</a>
          <a href="/contact.html" class="footer__link">Contact</a>
        </div>
        <div>
          <h4 class="footer__heading">Resources</h4>
          <a href="/books.html" class="footer__link">Browse All Books</a>
          <a href="/about.html" class="footer__link">About Sparsh Balgram</a>
          <a href="/admin.html" class="footer__link">Admin Portal</a>
        </div>
        <div>
          <h4 class="footer__heading">Contact</h4>
          <a href="mailto:sparsh.balgram@gmail.com" class="footer__link">📧 sparsh.balgram@gmail.com</a>
          <a href="tel:07620040230" class="footer__link">📞 076200 40230</a>
          <a href="https://maps.google.com/?q=Sparsh+House,+Shrushti+Chowk,+Lane+No.+2,+nr.+Mamta+Sweet,+Prabhat+Nagar,+Pimple+Gurav,+Pimpri-Chinchwad,+Maharashtra+411061" target="_blank" rel="noopener noreferrer" class="footer__link">📍 Sparsh House, Pimple Gurav</a>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; ${currentYear} Sparsh Balgram. All rights reserved.</p>
        <p>Made with <span class="footer__heart">♥</span> for education</p>
      </div>
    </div>
  `;
}

// ─── Book Card Renderer ───────────────────────
/**
 * Create a book card HTML string.
 * @param {Object} book - Book data object from API
 * @returns {string} HTML string for the book card
 */
function renderBookCard(book) {
  const truncatedDesc = book.description
    ? (book.description.length > 120 ? book.description.substring(0, 120) + '…' : book.description)
    : 'NCERT textbook for students.';

  return `
    <article class="book-card" data-book-id="${book._id}">
      <div class="book-card__cover">
        <img 
          src="${book.coverImage || '/images/default-cover.png'}" 
          alt="Cover of ${book.title}"
          loading="lazy"
          onerror="this.src='/images/default-cover.png'"
        />
        <span class="book-card__badge">${!isNaN(parseInt(book.class, 10)) ? 'Class ' + book.class : book.class}</span>
      </div>
      <div class="book-card__body">
        <span class="book-card__subject">${book.subject}</span>
        <h3 class="book-card__title">${book.title}</h3>
        <p class="book-card__description">${truncatedDesc}</p>
        <div class="book-card__actions">
          <a href="/book.html?id=${book._id}" class="btn btn--primary btn--sm">📖 Read Online</a>
          <a href="/book.html?id=${book._id}" class="btn btn--secondary btn--sm">View Details</a>
        </div>
      </div>
    </article>
  `;
}

// ─── Scroll-to-Top Button ─────────────────────
function renderScrollTopButton() {
  if (document.querySelector('.scroll-top')) return;

  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);
}

// ─── Lazy Loading ─────────────────────────────
/**
 * Initialize lazy loading for images using IntersectionObserver.
 */
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// ─── Page Initialization ──────────────────────
/**
 * Common initialization run on every page.
 * @param {string} activePage - Current page identifier for navbar
 */
function initApp(activePage = '') {
  // Apply theme FIRST to prevent flash of wrong theme
  initTheme();

  renderNavbar(activePage);
  renderFooter();
  renderScrollTopButton();
  initScrollEffects();
  initCounters();

  // Smooth page entrance
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
}

// ─── Debounce Utility ─────────────────────────
/**
 * Debounce a function call.
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ─── Format Date ──────────────────────────────
/**
 * Format a date string to a readable format.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
