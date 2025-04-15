// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token, authorization denied' 
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: admin privileges required' 
    });
  }
  next();
};

// Middleware to check if user is a restaurant manager
const isRestaurantManager = (req, res, next) => {
  if (req.user.role !== 'restaurant_manager' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: restaurant manager privileges required' 
    });
  }
  next();
};

// Middleware to check if user is the owner of a specific restaurant
const isRestaurantOwner = async (req, res, next) => {
  // This will be implemented when we have restaurant routes
  // It will check if the logged-in manager owns the restaurant they're trying to modify
  next();
};

module.exports = {
  auth,
  isAdmin,
  isRestaurantManager,
  isRestaurantOwner
};