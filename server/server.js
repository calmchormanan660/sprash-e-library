/**
 * SPRASH e-Library – Server Entry Point
 * ========================================
 * Express.js server for Sparsh Balgram e-Library.
 * Serves the client files and provides RESTful APIs
 * for book management and admin authentication.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------------
// Middleware
// ------------------------------------

// CORS – allow frontend to communicate with the API
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for admin authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'sprash-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Serve uploaded files (PDFs and cover images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------------------------
// API Routes
// ------------------------------------

app.use('/api/books', bookRoutes);
app.use('/api/admin', adminRoutes);

// Search route (also accessible via /api/books/search, but aliased here)
app.get('/api/search', require('./controllers/bookController').searchBooks);

// ------------------------------------
// Error Handling
// ------------------------------------

// Handle multer errors
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File is too large. Maximum size allowed is 200 MB.'
    });
  }

  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
});

// Catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// ------------------------------------
// Start Server
// ------------------------------------

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 SPRASH e-Library Server running on http://localhost:${PORT}`);
    console.log(`📚 Client served from: ${path.join(__dirname, '..', 'client')}`);
    console.log(`📂 Uploads directory: ${path.join(__dirname, 'uploads')}\n`);
  });
};

startServer();
