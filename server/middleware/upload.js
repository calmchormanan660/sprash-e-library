/**
 * File Upload Middleware (Multer)
 * --------------------------------
 * Configures multer for handling file uploads.
 * - PDF files are saved to server/uploads/pdfs/
 * - Cover images are saved to server/uploads/covers/
 * 
 * Includes file type validation to ensure only
 * allowed formats are accepted.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
const coverDir = path.join(__dirname, '..', 'uploads', 'covers');

if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

/**
 * Storage configuration for PDF files.
 * Generates unique filenames using timestamp + original name.
 */
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  }
});

/**
 * Storage configuration for cover images.
 */
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coverDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  }
});

/**
 * File filter: Only accept PDF files.
 */
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for book content.'), false);
  }
};

/**
 * File filter: Only accept image files (JPEG, PNG, WebP, GIF).
 */
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
  }
};

// Export configured multer instances
const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 200 * 1024 * 1024 } // 200 MB limit for PDFs
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit for images
});

/**
 * Combined upload middleware for book creation/editing.
 * Handles both PDF and cover image in a single request.
 */
const uploadBookFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'pdf') {
        cb(null, pdfDir);
      } else if (file.fieldname === 'coverImage') {
        cb(null, coverDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf') {
      pdfFilter(req, file, cb);
    } else if (file.fieldname === 'coverImage') {
      imageFilter(req, file, cb);
    } else {
      cb(new Error('Unexpected field name.'), false);
    }
  },
  limits: { fileSize: 200 * 1024 * 1024 }
});

module.exports = { uploadPDF, uploadCover, uploadBookFiles };
