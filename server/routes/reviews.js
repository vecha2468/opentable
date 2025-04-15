// server/routes/reviews.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { check } = require('express-validator');

// Placeholder route handlers to be implemented later
router.get('/restaurant/:id', (req, res) => {
  res.json({ message: 'Get reviews for restaurant - To be implemented' });
});

router.post(
  '/',
  auth,
  [
    check('restaurant_id', 'Restaurant ID is required').notEmpty(),
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').optional()
  ],
  (req, res) => {
    res.json({ message: 'Create review - To be implemented' });
  }
);

router.put(
  '/:id',
  auth,
  [
    check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').optional()
  ],
  (req, res) => {
    res.json({ message: 'Update review - To be implemented' });
  }
);

router.delete('/:id', auth, (req, res) => {
  res.json({ message: 'Delete review - To be implemented' });
});

module.exports = router;