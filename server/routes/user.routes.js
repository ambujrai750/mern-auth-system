const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// GET /api/user/profile — protected
router.get('/profile', protect, (req, res) => {
    // req.user is already populated by the protect middleware
    res.status(200).json({ user: req.user });
});

module.exports = router;