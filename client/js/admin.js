/**
 * SPRASH e-Library – Admin Dashboard
 * =====================================
 * Handles admin login/logout, book CRUD operations,
 * file uploads, and dashboard rendering.
 */

// ─── State ────────────────────────────────────
let adminBooks = [];
let editingBookId = null;
let isAuthenticated = false;

// ─── Initialize Admin Page ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApp('admin');
  checkAdminAuth();
  initAdminEventListeners();
});

// ─── Authentication ───────────────────────────

/**
 * Check if admin is already logged in via session.
 */
async function checkAdminAuth() {
  try {
    const data = await fetchAPI('/admin/check');
    if (data.isAuthenticated) {
      isAuthenticated = true;
      showDashboard(data.data.username);
    } else {
      showLoginForm();
    }
  } catch (error) {
    showLoginForm();
  }
}

/**
 * Handle admin login form submission.
 */
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const errorEl = document.getElementById('login-error');

  if (!username || !password) {
    showLoginError('Please enter both username and password.');
    return;
  }

  try {
    const data = await fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    isAuthenticated = true;
    showToast('Login successful! Welcome back.', 'success');
    showDashboard(data.data.username);
  } catch (error) {
    showLoginError(error.message || 'Invalid credentials. Please try again.');
  }
}

/**
 * Handle admin logout.
 */
async function handleLogout() {
  try {
    await fetchAPI('/admin/logout', { method: 'POST' });
    isAuthenticated = false;
    showToast('Logged out successfully.', 'info');
    showLoginForm();
  } catch (error) {
    showToast('Logout failed. Please try again.', 'error');
  }
}

/**
 * Show login error message.
 * @param {string} message - Error message
 */
function showLoginError(message) {
  const errorEl = document.getElementById('login-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('admin-login__error--visible');
    setTimeout(() => errorEl.classList.remove('admin-login__error--visible'), 5000);
  }
}

/**
 * Show the login form and hide the dashboard.
 */
function showLoginForm() {
  const loginSection = document.getElementById('admin-login');
  const dashboardSection = document.getElementById('admin-dashboard');

  if (loginSection) loginSection.style.display = 'flex';
  if (dashboardSection) dashboardSection.classList.remove('admin-dashboard--active');
}

/**
 * Show the dashboard and hide the login form.
 * @param {string} username - Logged-in admin's username
 */
function showDashboard(username) {
  const loginSection = document.getElementById('admin-login');
  const dashboardSection = document.getElementById('admin-dashboard');
  const userDisplay = document.getElementById('admin-user-name');

  if (loginSection) loginSection.style.display = 'none';
  if (dashboardSection) dashboardSection.classList.add('admin-dashboard--active');
  if (userDisplay) userDisplay.textContent = username;

  loadAdminBooks();
}

// ─── Book CRUD Operations ─────────────────────

/**
 * Load all books for the admin table.
 */
async function loadAdminBooks() {
  try {
    const data = await fetchAPI('/books');
    adminBooks = data.data || [];
    renderAdminTable(adminBooks);
    updateAdminStats();
  } catch (error) {
    showToast('Failed to load books.', 'error');
  }
}

/**
 * Render the admin books table.
 * @param {Array} books - Array of book objects
 */
function renderAdminTable(books) {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  if (books.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 3rem;">
          <div class="empty-state">
            <div class="empty-state__icon">📚</div>
            <h3 class="empty-state__title">No Books Yet</h3>
            <p class="empty-state__text">Click "Add Book" to get started.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = books.map(book => `
    <tr data-book-id="${book._id}">
      <td>
        <div class="admin-table__title-cell">
          <img 
            class="admin-table__cover" 
            src="${getAssetUrl(book.coverImage)}" 
            alt="${book.title}"
            onerror="this.src='/images/default-cover.png'"
          />
          <span class="admin-table__book-title">${book.title}</span>
        </div>
      </td>
      <td><span class="admin-table__badge">Class ${book.class}</span></td>
      <td><span class="admin-table__badge admin-table__badge--subject">${book.subject}</span></td>
      <td>${book.language || 'English'}</td>
      <td>${formatDate(book.uploadDate || book.createdAt)}</td>
      <td>
        <div class="admin-table__actions">
          <button class="btn btn--icon btn--edit" onclick="openEditModal('${book._id}')" title="Edit" aria-label="Edit ${book.title}">✏️</button>
          <button class="btn btn--icon btn--delete" onclick="confirmDelete('${book._id}')" title="Delete" aria-label="Delete ${book.title}">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Update dashboard stat cards.
 */
function updateAdminStats() {
  const totalBooksEl = document.getElementById('stat-total-books');
  const classesEl = document.getElementById('stat-classes');
  const subjectsEl = document.getElementById('stat-subjects');

  if (totalBooksEl) totalBooksEl.textContent = adminBooks.length;
  if (classesEl) {
    const uniqueClasses = new Set(adminBooks.map(b => String(b.class).trim()));
    classesEl.textContent = uniqueClasses.size;
  }
  if (subjectsEl) {
    const uniqueSubjects = new Set(adminBooks.map(b => String(b.subject).trim()));
    subjectsEl.textContent = uniqueSubjects.size;
  }
}

// ─── Add / Edit Book Modal ────────────────────

/**
 * Open the book form modal for adding a new book.
 */
function openAddModal() {
  editingBookId = null;
  resetBookForm();

  document.getElementById('modal-title').textContent = 'Add New Book';
  document.getElementById('modal-submit-btn').textContent = '📚 Add Book';
  document.getElementById('book-modal').classList.add('modal-overlay--active');
}

/**
 * Open the book form modal for editing an existing book.
 * @param {string} bookId - The book's MongoDB _id
 */
function openEditModal(bookId) {
  const book = adminBooks.find(b => b._id === bookId);
  if (!book) return;

  editingBookId = bookId;

  // Populate form fields
  document.getElementById('book-title').value = book.title;
  document.getElementById('book-class').value = book.class;
  document.getElementById('book-subject').value = book.subject;
  document.getElementById('book-language').value = book.language || 'English';
  document.getElementById('book-description').value = book.description || '';

  // Show current file names
  const pdfPreview = document.getElementById('pdf-preview');
  const coverPreview = document.getElementById('cover-preview');
  if (pdfPreview) pdfPreview.textContent = book.pdfPath ? '📄 Current PDF uploaded' : '';
  if (coverPreview) coverPreview.textContent = book.coverImage ? '🖼️ Current cover uploaded' : '';

  document.getElementById('modal-title').textContent = 'Edit Book';
  document.getElementById('modal-submit-btn').textContent = '💾 Save Changes';
  document.getElementById('book-modal').classList.add('modal-overlay--active');
}

/**
 * Close the book form modal.
 */
function closeModal() {
  document.getElementById('book-modal').classList.remove('modal-overlay--active');
  resetBookForm();
  editingBookId = null;
}

/**
 * Close the confirm delete modal.
 */
function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.remove('modal-overlay--active');
}

/**
 * Reset all form fields in the book modal.
 */
function resetBookForm() {
  const form = document.getElementById('book-form');
  if (form) form.reset();

  const pdfPreview = document.getElementById('pdf-preview');
  const coverPreview = document.getElementById('cover-preview');
  if (pdfPreview) pdfPreview.textContent = '';
  if (coverPreview) coverPreview.textContent = '';
}

/**
 * Handle the book form submission (add or edit).
 */
async function handleBookSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('book-title').value.trim();
  const bookClass = document.getElementById('book-class').value;
  const subject = document.getElementById('book-subject').value.trim();
  const language = document.getElementById('book-language').value.trim();
  const description = document.getElementById('book-description').value.trim();
  const pdfFile = document.getElementById('book-pdf').files[0];
  const coverFile = document.getElementById('book-cover').files[0];

  // Validate required fields
  if (!title || !bookClass || !subject) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  if (!editingBookId && !pdfFile) {
    showToast('Please select a PDF file for the new book.', 'error');
    return;
  }

  // Build FormData for file upload
  const formData = new FormData();
  formData.append('title', title);
  formData.append('class', bookClass);
  formData.append('subject', subject);
  formData.append('language', language || 'English');
  formData.append('description', description);
  if (pdfFile) formData.append('pdf', pdfFile);
  if (coverFile) formData.append('coverImage', coverFile);

  try {
    const submitBtn = document.getElementById('modal-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    if (editingBookId) {
      // Update existing book
      await fetchAPI(`/books/${editingBookId}`, {
        method: 'PUT',
        body: formData
      });
      showToast('Book updated successfully!', 'success');
    } else {
      // Create new book
      await fetchAPI('/books', {
        method: 'POST',
        body: formData
      });
      showToast('Book added successfully!', 'success');
    }

    closeModal();
    loadAdminBooks();
  } catch (error) {
    showToast(error.message || 'Failed to save book.', 'error');
  } finally {
    const submitBtn = document.getElementById('modal-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = editingBookId ? '💾 Save Changes' : '📚 Add Book';
    }
  }
}

// ─── Delete Book ──────────────────────────────

let deleteBookId = null;

/**
 * Show the delete confirmation modal.
 * @param {string} bookId - Book ID
 */
function confirmDelete(bookId) {
  deleteBookId = bookId;
  const book = adminBooks.find(b => b._id === bookId);
  const bookTitle = book ? book.title : 'this book';
  const textEl = document.getElementById('confirm-delete-text');
  if (textEl) {
    textEl.textContent = `Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`;
  }
  document.getElementById('confirm-modal').classList.add('modal-overlay--active');
}

/**
 * Execute the book deletion.
 */
async function executeDelete() {
  if (!deleteBookId) return;

  try {
    await fetchAPI(`/books/${deleteBookId}`, { method: 'DELETE' });
    showToast('Book deleted successfully.', 'success');
    closeConfirmModal();
    loadAdminBooks();
  } catch (error) {
    showToast(error.message || 'Failed to delete book.', 'error');
  } finally {
    deleteBookId = null;
  }
}

// ─── Event Listeners ──────────────────────────

function initAdminEventListeners() {
  // Login form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Add book button
  const addBookBtn = document.getElementById('add-book-btn');
  if (addBookBtn) {
    addBookBtn.addEventListener('click', openAddModal);
  }

  // Book form submit
  const bookForm = document.getElementById('book-form');
  if (bookForm) {
    bookForm.addEventListener('submit', handleBookSubmit);
  }

  // Modal close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal();
      closeConfirmModal();
    });
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
        closeConfirmModal();
      }
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeConfirmModal();
    }
  });

  // File input previews
  const pdfInput = document.getElementById('book-pdf');
  if (pdfInput) {
    pdfInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById('pdf-preview');
      if (preview) {
        preview.textContent = file ? `📄 ${file.name}` : '';
      }
    });
  }

  const coverInput = document.getElementById('book-cover');
  if (coverInput) {
    coverInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById('cover-preview');
      if (preview) {
        preview.textContent = file ? `🖼️ ${file.name}` : '';
      }
    });
  }

  // Admin table search
  const tableSearch = document.getElementById('admin-table-search');
  if (tableSearch) {
    tableSearch.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderAdminTable(adminBooks);
        return;
      }

      const filtered = adminBooks.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.subject.toLowerCase().includes(query) ||
        String(book.class).includes(query)
      );
      renderAdminTable(filtered);
    }, 250));
  }
}
