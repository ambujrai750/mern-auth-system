const crypto = require('crypto');

// Generates a cryptographically secure 6-digit OTP
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

module.exports = generateOtp;