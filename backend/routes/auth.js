const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);   // Google OAuth endpoint
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
