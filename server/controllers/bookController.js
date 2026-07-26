/**
 * Book Controller
 * -----------------
 * Handles all CRUD operations for books in the e-library.
 * Each function corresponds to an API endpoint.
 */

const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/books
 * Retrieve all books, with optional filtering by class and subject.
 */
const getAllBooks = async (req, res) => {
  try {
    const filter = {};

    // Apply optional filters from query parameters
    if (req.query.class) {
      const c = req.query.class.toString().trim();
      const num = parseInt(c, 10);
      if (!isNaN(num) && String(num) === c) {
        filter.$or = [{ class: num }, { class: c }, { class: `Class ${c}` }, { class: new RegExp(c, 'i') }];
      } else {
        filter.class = new RegExp(c, 'i');
      }
    }
    if (req.query.subject) {
      filter.subject = new RegExp(req.query.subject, 'i');
    }

    const books = await Book.find(filter).sort({ class: 1, subject: 1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books. Please try again.'
    });
  }
};

/**
 * GET /api/books/:id
 * Retrieve a single book by its MongoDB _id.
 */
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book details.'
    });
  }
};

/**
 * POST /api/books
 * Create a new book entry. Expects multipart form data
 * with optional PDF and cover image files.
 */
const createBook = async (req, res) => {
  try {
    const { title, class: bookClass, subject, language, description } = req.body;

    // Validate required fields
    if (!title || !bookClass || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title, class, and subject are required.'
      });
    }

    const parsedClass = isNaN(parseInt(bookClass, 10)) || String(parseInt(bookClass, 10)) !== String(bookClass).trim()
      ? String(bookClass).trim()
      : parseInt(bookClass, 10);

    // Build the book object
    const bookData = {
      title: title.trim(),
      class: parsedClass,
      subject: subject.trim(),
      language: (language || 'English').trim(),
      description: (description || '').trim()
    };

    // Handle uploaded files
    if (req.files) {
      if (req.files.pdf && req.files.pdf[0]) {
        bookData.pdfPath = `/uploads/pdfs/${req.files.pdf[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        bookData.coverImage = `/uploads/covers/${req.files.coverImage[0].filename}`;
      }
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: 'Book added successfully!',
      data: book
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add book.'
    });
  }
};

/**
 * PUT /api/books/:id
 * Update an existing book. Supports partial updates and file replacement.
 */
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    // Update text fields
    const { title, class: bookClass, subject, language, description } = req.body;
    if (title) book.title = title.trim();
    if (bookClass) {
      book.class = isNaN(parseInt(bookClass, 10)) || String(parseInt(bookClass, 10)) !== String(bookClass).trim()
        ? String(bookClass).trim()
        : parseInt(bookClass, 10);
    }
    if (subject) book.subject = subject.trim();
    if (language) book.language = language.trim();
    if (description !== undefined) book.description = description.trim();

    // Handle file updates – remove old files if replaced
    if (req.files) {
      if (req.files.pdf && req.files.pdf[0]) {
        // Delete old PDF if it exists and is not a placeholder
        if (book.pdfPath && !book.pdfPath.includes('placeholder')) {
          const oldPdfPath = path.join(__dirname, '..', book.pdfPath);
          if (fs.existsSync(oldPdfPath)) fs.unlinkSync(oldPdfPath);
        }
        book.pdfPath = `/uploads/pdfs/${req.files.pdf[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        // Delete old cover if it exists and is not a default
        if (book.coverImage && !book.coverImage.includes('default') && !book.coverImage.includes('placeholder')) {
          const oldCoverPath = path.join(__dirname, '..', book.coverImage);
          if (fs.existsSync(oldCoverPath)) fs.unlinkSync(oldCoverPath);
        }
        book.coverImage = `/uploads/covers/${req.files.coverImage[0].filename}`;
      }
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully!',
      data: book
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update book.'
    });
  }
};

/**
 * DELETE /api/books/:id
 * Remove a book and its associated files from the server.
 */
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    // Clean up uploaded files
    if (book.pdfPath && !book.pdfPath.includes('placeholder')) {
      const pdfFullPath = path.join(__dirname, '..', book.pdfPath);
      if (fs.existsSync(pdfFullPath)) fs.unlinkSync(pdfFullPath);
    }
    if (book.coverImage && !book.coverImage.includes('default') && !book.coverImage.includes('placeholder')) {
      const coverFullPath = path.join(__dirname, '..', book.coverImage);
      if (fs.existsSync(coverFullPath)) fs.unlinkSync(coverFullPath);
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book.'
    });
  }
};

/**
 * GET /api/search?q=&class=&subject=
 * Search books by keyword, with optional class and subject filters.
 * Uses MongoDB text search on title, subject, and description.
 */
const searchBooks = async (req, res) => {
  try {
    const { q, class: bookClass, subject } = req.query;
    const filter = {};

    // Text search if query is provided
    if (q && q.trim()) {
      filter.$or = [
        { title: new RegExp(q.trim(), 'i') },
        { subject: new RegExp(q.trim(), 'i') },
        { description: new RegExp(q.trim(), 'i') }
      ];
    }

    // Apply class filter
    if (bookClass) {
      const c = bookClass.toString().trim();
      const num = parseInt(c, 10);
      if (!isNaN(num) && String(num) === c) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [{ class: num }, { class: c }, { class: `Class ${c}` }, { class: new RegExp(c, 'i') }]
        });
      } else {
        filter.class = new RegExp(c, 'i');
      }
    }

    // Apply subject filter
    if (subject) {
      filter.subject = new RegExp(`^${subject.trim()}$`, 'i');
    }

    const books = await Book.find(filter).sort({ class: 1, subject: 1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed. Please try again.'
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
};
