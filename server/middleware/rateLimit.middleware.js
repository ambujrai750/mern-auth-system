const rateLimit = require('express-rate-limit');

// Limit OTP verification attempts — 5 per 15 minutes per IP
const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many OTP attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limit resend OTP — 3 per 10 minutes per IP
const resendOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    message: { message: 'Too many resend requests. Please wait before requesting again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General auth limiter — prevent brute force on login
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many requests from this IP. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { otpRateLimiter, resendOtpLimiter, authLimiter };