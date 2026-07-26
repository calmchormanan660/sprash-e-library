/**
 * Book Model
 * -----------
 * Defines the schema for NCERT books stored in the e-library.
 * Each book has metadata (title, class, subject) and file paths
 * for the cover image and PDF content.
 */

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  class: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Class is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    trim: true,
    default: 'English'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  coverImage: {
    type: String,
    default: '/images/default-cover.png'
  },
  pdfPath: {
    type: String,
    default: ''
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient searching and filtering
bookSchema.index(
  { title: 'text', subject: 'text', description: 'text' },
  { language_override: 'textSearchLanguage' }
);
bookSchema.index({ class: 1, subject: 1 });

module.exports = mongoose.model('Book', bookSchema);
