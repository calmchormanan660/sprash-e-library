/**
 * Admin Routes
 * --------------
 * Handles admin authentication endpoints.
 */

const express = require('express');
const router = express.Router();
const { adminLogin, adminLogout, checkAuth } = require('../controllers/adminController');

// Auth endpoints
router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/check', checkAuth);

module.exports = router;
