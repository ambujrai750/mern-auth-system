const crypto = require('crypto');
const User = require('../models/User.model');
const generateOtp = require('../utils/generateOtp');
const sendOtpEmail = require('../utils/sendOtpEmail');

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        // Always return same response to prevent email enumeration
        const genericResponse = { message: 'If this email is registered, you will receive an OTP shortly.' };

        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(200).json(genericResponse);
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        user.otpLastSentAt = new Date();
        user.otpAttempts = 0;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        await sendOtpEmail(email, otp, 'Password Reset OTP — MERN Auth');
        res.status(200).json(genericResponse);
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ─── VERIFY RESET OTP ─────────────────────────────────────────────────────────
const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

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

        // OTP valid — issue a short-lived reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();

        res.status(200).json({
            message: 'OTP verified. Use the reset token to set a new password.',
            resetToken,
        });
    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;
        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ message: 'Email, reset token, and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (!user.resetToken || user.resetToken !== resetToken) {
            return res.status(400).json({ message: 'Invalid reset token.' });
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ message: 'Reset token has expired. Please start over.' });
        }

        // Set new password — pre-save hook will hash it
        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { forgotPassword, verifyResetOtp, resetPassword };