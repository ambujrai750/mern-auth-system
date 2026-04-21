export const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isValidPassword = (password) =>
    password.length >= 6

export const isValidMobile = (mobile) =>
    /^[6-9]\d{9}$/.test(mobile)

export const isValidPincode = (pincode) =>
    /^\d{6}$/.test(pincode)

export const isValidOtp = (otp) =>
    /^\d{6}$/.test(otp)