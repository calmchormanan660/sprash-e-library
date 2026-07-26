/**
 * SPRASH e-Library – Books Page Logic
 * =====================================
 * Handles fetching, filtering, and rendering
 * book cards on the library browsing page.
 */

// ─── State ────────────────────────────────────
let allBooks = [];
let filteredBooks = [];
let currentFilters = {
  class: '',
  subject: '',
  query: ''
};

// ─── Initialize Library Page ──────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApp('library');
  parseURLFilters();
  loadBooks();
  initFilterListeners();
});

/**
 * Check URL parameters for pre-set filters.
 * Allows linking like /books.html?class=9
 */
function parseURLFilters() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('class')) {
    currentFilters.class = params.get('class');
    const classSelect = document.getElementById('filter-class');
    if (classSelect) classSelect.value = currentFilters.class;
  }

  if (params.has('subject')) {
    currentFilters.subject = params.get('subject');
    const subjectSelect = document.getElementById('filter-subject');
    if (subjectSelect) subjectSelect.value = currentFilters.subject;
  }

  if (params.has('q')) {
    currentFilters.query = params.get('q');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = currentFilters.query;
  }
}

/**
 * Fetch all books from the API and render them.
 */
async function loadBooks() {
  const grid = document.getElementById('books-grid');

  if (!grid) return;

  toggleSpinner(grid.parentElement, true);

  try {
    const data = await fetchAPI('/books');
    allBooks = data.data || [];
    updateFilterOptions();
    applyFilters();
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <h3 class="empty-state__title">Failed to Load Books</h3>
        <p class="empty-state__text">Please check your connection and try again.</p>
        <button class="btn btn--primary" style="margin-top: 1rem;" onclick="loadBooks()">Retry</button>
      </div>
    `;
    showToast('Failed to load books. Please try again.', 'error');
  } finally {
    toggleSpinner(grid.parentElement, false);
  }
}

/**
 * Dynamically populate filter dropdowns based on available books.
 */
function updateFilterOptions() {
  const classSelect = document.getElementById('filter-class');
  if (classSelect) {
    const saved = currentFilters.class || classSelect.value;
    const classes = Array.from(new Set(allBooks.map(b => b.class).filter(Boolean))).sort((a, b) => {
      const numA = parseInt(a, 10), numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a).localeCompare(String(b));
    });

    classSelect.innerHTML = `<option value="">All Classes</option>` + 
      classes.map(c => {
        const label = typeof c === 'number' || !isNaN(parseInt(c, 10)) ? `Class ${c}` : (String(c).toLowerCase().startsWith('class') ? c : `Class ${c}`);
        return `<option value="${c}">${label}</option>`;
      }).join('');

    if (saved) classSelect.value = saved;
  }

  const subjectSelect = document.getElementById('filter-subject');
  if (subjectSelect) {
    const saved = currentFilters.subject || subjectSelect.value;
    const subjects = Array.from(new Set(allBooks.map(b => b.subject).filter(Boolean))).sort();

    subjectSelect.innerHTML = `<option value="">All Subjects</option>` +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');

    if (saved) subjectSelect.value = saved;
  }
}

/**
 * Apply current filters and re-render the grid.
 */
function applyFilters() {
  filteredBooks = allBooks.filter(book => {
    // Class filter
    if (currentFilters.class) {
      const filterVal = String(currentFilters.class).toLowerCase();
      const bookVal = String(book.class).toLowerCase();
      if (bookVal !== filterVal && bookVal !== `class ${filterVal}` && `class ${bookVal}` !== filterVal) {
        return false;
      }
    }

    // Subject filter
    if (currentFilters.subject && book.subject.toLowerCase() !== currentFilters.subject.toLowerCase()) {
      return false;
    }

    // Search query filter
    if (currentFilters.query) {
      const q = currentFilters.query.toLowerCase();
      const matchesTitle = book.title.toLowerCase().includes(q);
      const matchesSubject = book.subject.toLowerCase().includes(q);
      const matchesDesc = (book.description || '').toLowerCase().includes(q);
      if (!matchesTitle && !matchesSubject && !matchesDesc) {
        return false;
      }
    }

    return true;
  });

  renderBooks(filteredBooks);
}

/**
 * Render book cards into the grid.
 * @param {Array} books - Array of book objects
 */
function renderBooks(books) {
  const grid = document.getElementById('books-grid');
  const countEl = document.getElementById('books-count');

  if (!grid) return;

  // Update count
  if (countEl) {
    countEl.innerHTML = `Showing <strong>${books.length}</strong> of <strong>${allBooks.length}</strong> books`;
  }

  if (books.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">📚</div>
        <h3 class="empty-state__title">No Books Found</h3>
        <p class="empty-state__text">Try adjusting your search or filters.</p>
        <button class="btn btn--secondary" style="margin-top: 1rem;" onclick="clearFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = books.map(book => renderBookCard(book)).join('');

  // Initialize lazy loading for newly added images
  initLazyLoading();
}

/**
 * Set up event listeners for search and filter controls.
 */
function initFilterListeners() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const classFilter = document.getElementById('filter-class');
  const subjectFilter = document.getElementById('filter-subject');
  const clearBtn = document.getElementById('clear-filters');

  // Debounced search
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentFilters.query = e.target.value;
      applyFilters();
    }, 300));
  }

  // Search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      currentFilters.query = searchInput ? searchInput.value : '';
      applyFilters();
    });
  }

  // Enter key in search
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        currentFilters.query = searchInput.value;
        applyFilters();
      }
    });
  }

  // Class filter
  if (classFilter) {
    classFilter.addEventListener('change', (e) => {
      currentFilters.class = e.target.value;
      applyFilters();
    });
  }

  // Subject filter
  if (subjectFilter) {
    subjectFilter.addEventListener('change', (e) => {
      currentFilters.subject = e.target.value;
      applyFilters();
    });
  }

  // Clear filters
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilters);
  }
}

/**
 * Reset all filters to their default state.
 */
function clearFilters() {
  currentFilters = { class: '', subject: '', query: '' };

  const searchInput = document.getElementById('search-input');
  const classFilter = document.getElementById('filter-class');
  const subjectFilter = document.getElementById('filter-subject');

  if (searchInput) searchInput.value = '';
  if (classFilter) classFilter.value = '';
  if (subjectFilter) subjectFilter.value = '';

  // Update URL
  window.history.replaceState({}, '', '/books.html');

  applyFilters();
}


