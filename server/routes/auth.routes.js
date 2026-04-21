const express = require('express');
const router = express.Router();

const { register, verifyOtp, resendOtp, login, logout } = require('../controllers/auth.controller');
const { forgotPassword, verifyResetOtp, resetPassword } = require('../controllers/password.controller');
const { protect } = require('../middleware/auth.middleware');
const { otpRateLimiter, resendOtpLimiter, authLimiter } = require('../middleware/rateLimit.middleware');

// Auth routes
router.post('/register', authLimiter, register);
router.post('/verify-otp', otpRateLimiter, verifyOtp);
router.post('/resend-otp', resendOtpLimiter, resendOtp);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);

// Password reset routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-reset-otp', otpRateLimiter, verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;