const User = require('../models/User.model');
const generateOtp = require('../utils/generateOtp');
const generateToken = require('../utils/generateToken');
const sendOtpEmail = require('../utils/sendOtpEmail');

const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password, mobile, gender, state, pincode } = req.body;

        if (!name || !email || !password || !mobile || !gender || !state || !pincode) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        if (existingUser && !existingUser.isVerified) {
            // Update existing unverified user instead of creating duplicate
            existingUser.name = name;
            existingUser.password = password;
            existingUser.mobile = mobile;
            existingUser.gender = gender;
            existingUser.state = state;
            existingUser.pincode = pincode;
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            existingUser.otpLastSentAt = new Date();
            existingUser.otpAttempts = 0;
            await existingUser.save();
        } else {
            await User.create({
                name, email, password, mobile, gender, state, pincode,
                otp, otpExpiry, otpLastSentAt: new Date(), otpAttempts: 0,
            });
        }

        await sendOtpEmail(email, otp, 'Verify your email — MERN Auth');

        res.status(201).json({ message: 'Registration successful. OTP sent to your email.' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// ─── VERIFY OTP (account activation) ─────────────────────────────────────────
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified.' });

        if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({ message: 'Too many failed attempts. Request a new OTP.' });
        }

        if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp !== otp.toString()) {
            user.otpAttempts += 1;
            await user.save();
            const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts;
            return res.status(400).json({ message: `Incorrect OTP. ${remaining} attempt(s) remaining.` });
        }

        // OTP is valid
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();

        const token = generateToken(user._id);
        res.status(200).json({ message: 'Email verified successfully.', token });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified.' });

        // 60-second cooldown check
        if (user.otpLastSentAt) {
            const secondsSinceLastSend = (Date.now() - user.otpLastSentAt.getTime()) / 1000;
            if (secondsSinceLastSend < OTP_COOLDOWN_SECONDS) {
                const wait = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastSend);
                return res.status(429).json({ message: `Please wait ${wait} seconds before requesting a new OTP.` });
            }
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        user.otpLastSentAt = new Date();
        user.otpAttempts = 0;
        await user.save();

        await sendOtpEmail(email, otp, 'Your new OTP — MERN Auth');
        res.status(200).json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error while resending OTP.' });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

        const token = generateToken(user._id);
        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
// JWT is stateless — logout is handled client-side by deleting the token.
// This endpoint exists so the frontend has a consistent API call to make.
const logout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = { register, verifyOtp, resendOtp, login, logout };