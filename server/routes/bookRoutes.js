/**
 * Book Routes
 * -------------
 * Defines RESTful API endpoints for book operations.
 * Admin-only routes are protected by the requireAdmin middleware.
 */

const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
} = require('../controllers/bookController');
const { requireAdmin } = require('../middleware/auth');
const { uploadBookFiles } = require('../middleware/upload');

// Public routes
router.get('/search', searchBooks);
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Admin-only routes (protected)
router.post(
  '/',
  requireAdmin,
  uploadBookFiles.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  createBook
);

router.put(
  '/:id',
  requireAdmin,
  uploadBookFiles.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  updateBook
);

router.delete('/:id', requireAdmin, deleteBook);

module.exports = router;
