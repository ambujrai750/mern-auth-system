import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, getProfile } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/validators'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!isValidEmail(form.email)) { setError('Enter a valid email address.'); return }
        if (!form.password) { setError('Password is required.'); return }

        setLoading(true)
        try {
            const res = await loginUser(form)
            const { token } = res.data

            // Store token first, then fetch full profile
            localStorage.setItem('token', token)
            const profileRes = await getProfile()
            login(token, profileRes.data.user)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
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

                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                {error && <div className="alert alert-error">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email address</label>
                        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handle} />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: 4 }}>
                        <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Signing in…' : 'Sign in →'}
                    </button>
                </form>

                <div className="auth-link-row">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
