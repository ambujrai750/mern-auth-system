const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password -otp -otpExpiry -resetToken -resetTokenExpiry');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is invalid or expired.' });
    }
};

module.exports = { protect };