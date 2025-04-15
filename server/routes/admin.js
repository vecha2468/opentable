// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');

// All routes in this file require admin privileges
router.use(auth, isAdmin);

// Placeholder route handlers to be implemented later
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard data - To be implemented' });
});

router.get('/restaurants/pending', (req, res) => {
  res.json({ message: 'Get pending restaurant approvals - To be implemented' });
});

router.put('/restaurants/:id/approve', (req, res) => {
  res.json({ message: 'Approve restaurant - To be implemented' });
});

router.put('/restaurants/:id/reject', (req, res) => {
  res.json({ message: 'Reject restaurant - To be implemented' });
});

router.get('/reservations/stats', (req, res) => {
  res.json({ message: 'Get reservation statistics - To be implemented' });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Get all users - To be implemented' });
});

// More admin routes will be added in the future

module.exports = router;