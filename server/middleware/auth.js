/**
 * Authentication Middleware
 * --------------------------
 * Simple session-based authentication for admin routes.
 * Checks if the user has an active admin session.
 * No JWT – uses express-session instead.
 */

/**
 * Middleware to protect admin-only routes.
 * Returns 401 if no valid admin session exists.
 */
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized. Please log in as admin.'
  });
};

module.exports = { requireAdmin };
