const transporter = require('../config/mailer');

const sendOtpEmail = async (toEmail, otp, subject = 'Your OTP Code') => {
    const mailOptions = {
        from: `"MERN Auth" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Your One-Time Password</h2>
        <p style="color: #555;">Use the OTP below to proceed. It is valid for <strong>10 minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;