const jwt = require('jsonwebtoken');

const generateToken = (userId, expiresIn = '7d') => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;