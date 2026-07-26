/**
 * SPRASH e-Library – Search Module
 * ==================================
 * Handles the search functionality used on the
 * library page and homepage search.
 * Works with the books.js filter system.
 */

// ─── Search State ─────────────────────────────
let searchTimeout = null;

/**
 * Perform a search via the API.
 * Falls back to client-side filtering if books are already loaded.
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters (class, subject)
 * @returns {Promise<Array>} Array of matching books
 */
async function performSearch(query, filters = {}) {
  // Build query parameters
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (filters.class) params.set('class', filters.class);
  if (filters.subject) params.set('subject', filters.subject);

  try {
    const data = await fetchAPI(`/search?${params.toString()}`);
    return data.data || [];
  } catch (error) {
    console.error('Search failed:', error);
    showToast('Search failed. Please try again.', 'error');
    return [];
  }
}

/**
 * Initialize search suggestions (autocomplete).
 * Listens to a search input and shows suggestions below it.
 * @param {string} inputId - ID of the search input element
 */
function initSearchSuggestions(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  // Create suggestions container
  let suggestionsEl = input.parentElement.querySelector('.search-suggestions');
  if (!suggestionsEl) {
    suggestionsEl = document.createElement('div');
    suggestionsEl.className = 'search-suggestions';
    suggestionsEl.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--color-white);
      border: 2px solid var(--color-gray-200);
      border-top: none;
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      max-height: 240px;
      overflow-y: auto;
      display: none;
      z-index: 100;
      box-shadow: var(--shadow-lg);
    `;
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(suggestionsEl);
  }

  input.addEventListener('input', debounce(async (e) => {
    const query = e.target.value.trim();

    if (query.length < 2) {
      suggestionsEl.style.display = 'none';
      return;
    }

    try {
      const results = await performSearch(query);
      if (results.length === 0) {
        suggestionsEl.style.display = 'none';
        return;
      }

      // Show top 5 suggestions
      const suggestions = results.slice(0, 5);
      suggestionsEl.innerHTML = suggestions.map(book => `
        <a href="/book.html?id=${book._id}" 
           class="search-suggestion-item" 
           style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit;">
          <span style="font-size: 1.2rem;">📖</span>
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #1E293B;">${book.title}</div>
            <div style="font-size: 0.75rem; color: #94A3B8;">Class ${book.class} · ${book.subject}</div>
          </div>
        </a>
      `).join('');

      // Add hover effects
      suggestionsEl.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('mouseenter', () => item.style.background = '#F1F5F9');
        item.addEventListener('mouseleave', () => item.style.background = 'transparent');
      });

      suggestionsEl.style.display = 'block';
    } catch (err) {
      suggestionsEl.style.display = 'none';
    }
  }, 250));

  // Hide suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionsEl.contains(e.target)) {
      suggestionsEl.style.display = 'none';
    }
  });

  // Handle escape key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      suggestionsEl.style.display = 'none';
    }
  });
}

/**
 * Navigate to library page with search query.
 * Used by homepage search forms.
 * @param {string} query - Search term
 */
function searchAndNavigate(query) {
  if (query && query.trim()) {
    window.location.href = `/books.html?q=${encodeURIComponent(query.trim())}`;
  }
}
