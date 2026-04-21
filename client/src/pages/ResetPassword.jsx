import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyResetOtp, resetPassword } from '../api/auth'
import { isValidPassword } from '../utils/validators'
import OtpInput from '../components/OtpInput'

// Step 1: Enter OTP  →  Step 2: Enter new password
const ResetPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const email = location.state?.email
    const [step, setStep] = useState(1)
    const [otp, setOtp] = useState('      ')
    const [resetToken, setResetToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!email) navigate('/forgot-password')
    }, [email, navigate])

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        const trimmed = otp.trim()
        if (trimmed.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return }
        setError(''); setLoading(true)
        try {
            const res = await verifyResetOtp({ email, otp: trimmed })
            setResetToken(res.data.resetToken)
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')
        if (!isValidPassword(newPassword)) { setError('Password must be at least 6 characters.'); return }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }

        setLoading(true)
        try {
            await resetPassword({ email, resetToken, newPassword })
            setSuccess('Password reset successful! Redirecting to login…')
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-layout">
            <div className="auth-card">
                <div className="brand">
                    <div className="brand-icon">⚡</div>
                    <span className="brand-name">MERNAuth</span>
                </div>

                {step === 1 ? (
                    <>
                        <h1 className="auth-title">Enter reset OTP</h1>
                        <p className="auth-subtitle">
                            We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                        </p>

                        {error && <div className="alert alert-error">⚠ {error}</div>}

                        <form onSubmit={handleVerifyOtp}>
                            <OtpInput value={otp} onChange={setOtp} />
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading && <span className="spinner" />}
                                {loading ? 'Verifying…' : 'Verify OTP →'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h1 className="auth-title">Set new password</h1>
                        <p className="auth-subtitle">Choose a strong password for your account.</p>

                        {error && <div className="alert alert-error">⚠ {error}</div>}
                        {success && <div className="alert alert-success">✓ {success}</div>}

                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>New password</label>
                                <input
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm password</label>
                                <input
                                    type="password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading && <span className="spinner" />}
                                {loading ? 'Resetting…' : 'Reset password →'}
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-link-row" style={{ marginTop: 12 }}>
                    <Link to="/login">← Back to login</Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
