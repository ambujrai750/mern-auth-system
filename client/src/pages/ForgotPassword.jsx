import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import { isValidEmail } from '../utils/validators'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')
        if (!isValidEmail(email)) { setError('Enter a valid email address.'); return }

        setLoading(true)
        try {
            await forgotPassword({ email })
            setSuccess('If this email is registered, you will receive an OTP shortly.')
            // Wait 2s then go to reset OTP page
            setTimeout(() => navigate('/reset-password', { state: { email } }), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.')
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

                <h1 className="auth-title">Forgot password?</h1>
                <p className="auth-subtitle">Enter your email and we'll send you a reset OTP.</p>

                {error && <div className="alert alert-error">⚠ {error}</div>}
                {success && <div className="alert alert-success">✓ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Sending OTP…' : 'Send reset OTP →'}
                    </button>
                </form>

                <div className="auth-link-row">
                    <Link to="/login">← Back to login</Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
