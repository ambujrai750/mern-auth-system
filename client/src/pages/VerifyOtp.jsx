import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyOtp, resendOtp } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import OtpInput from '../components/OtpInput'

const COOLDOWN = 60

const VerifyOtp = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const email = location.state?.email
    const [otp, setOtp] = useState('      ')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(COOLDOWN)
    const [canResend, setCanResend] = useState(false)

    // Redirect if arrived without email
    useEffect(() => {
        if (!email) navigate('/register')
    }, [email, navigate])

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) { setCanResend(true); return }
        const id = setTimeout(() => setTimer(t => t - 1), 1000)
        return () => clearTimeout(id)
    }, [timer])

    const handleVerify = async (e) => {
        e.preventDefault()
        const trimmed = otp.trim()
        if (trimmed.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return }
        setError(''); setLoading(true)
        try {
            const res = await verifyOtp({ email, otp: trimmed })
            login(res.data.token, null)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!canResend) return
        setError(''); setSuccess('')
        try {
            await resendOtp({ email })
            setSuccess('A new OTP has been sent to your email.')
            setTimer(COOLDOWN)
            setCanResend(false)
            setOtp('      ')
        } catch (err) {
            setError(err.response?.data?.message || 'Could not resend OTP.')
        }
    }

    return (
        <div className="auth-layout">
            <div className="auth-card">
                <div className="brand">
                    <div className="brand-icon">⚡</div>
                    <span className="brand-name">MERNAuth</span>
                </div>

                <h1 className="auth-title">Verify your email</h1>
                <p className="auth-subtitle">
                    We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>

                {error && <div className="alert alert-error">⚠ {error}</div>}
                {success && <div className="alert alert-success">✓ {success}</div>}

                <form onSubmit={handleVerify}>
                    <OtpInput value={otp} onChange={setOtp} />

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Verifying…' : 'Verify email →'}
                    </button>
                </form>

                <div className="resend-timer">
                    {canResend
                        ? <>Didn't get it? <span onClick={handleResend}>Resend OTP</span></>
                        : <>Resend available in <strong style={{ color: 'var(--text-primary)' }}>{timer}s</strong></>
                    }
                </div>

                <div className="auth-link-row" style={{ marginTop: 12 }}>
                    <Link to="/register">← Back to register</Link>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp
