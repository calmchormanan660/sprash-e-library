/**
 * Admin Controller
 * ------------------
 * Handles admin authentication using session-based login.
 * No JWT – relies on express-session for state management.
 */

const Admin = require('../models/Admin');

/**
 * POST /api/admin/login
 * Authenticate admin with username and password.
 * Creates a session on success.
 */
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Compare passwords
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Set session
    req.session.isAdmin = true;
    req.session.adminId = admin._id;
    req.session.adminUsername = admin.username;

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: { username: admin.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * POST /api/admin/logout
 * Destroy the admin session.
 */
const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed.'
      });
    }

    res.clearCookie('connect.sid');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
};

/**
 * GET /api/admin/check
 * Check if the current session is authenticated.
 */
const checkAuth = (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      data: { username: req.session.adminUsername }
    });
  }

  res.status(200).json({
    success: true,
    isAuthenticated: false
  });
};

module.exports = { adminLogin, adminLogout, checkAuth };
