import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export const registerUser = (data) => API.post('/auth/register', data)
export const verifyOtp = (data) => API.post('/auth/verify-otp', data)
export const resendOtp = (data) => API.post('/auth/resend-otp', data)
export const loginUser = (data) => API.post('/auth/login', data)
export const logoutUser = () => API.post('/auth/logout')
export const forgotPassword = (data) => API.post('/auth/forgot-password', data)
export const verifyResetOtp = (data) => API.post('/auth/verify-reset-otp', data)
export const resetPassword = (data) => API.post('/auth/reset-password', data)
export const getProfile = () => API.get('/user/profile')