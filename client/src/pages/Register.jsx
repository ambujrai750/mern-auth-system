import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { isValidEmail, isValidPassword, isValidMobile, isValidPincode } from '../utils/validators'

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
]

const Register = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', email: '', password: '', mobile: '',
        gender: '', state: '', pincode: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const validate = () => {
        if (!form.name.trim()) return 'Name is required.'
        if (!isValidEmail(form.email)) return 'Enter a valid email address.'
        if (!isValidPassword(form.password)) return 'Password must be at least 6 characters.'
        if (!isValidMobile(form.mobile)) return 'Enter a valid 10-digit Indian mobile number.'
        if (!form.gender) return 'Please select your gender.'
        if (!form.state) return 'Please select your state.'
        if (!isValidPincode(form.pincode)) return 'Enter a valid 6-digit pincode.'
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const validationError = validate()
        if (validationError) { setError(validationError); return }

        setLoading(true)
        try {
            await registerUser(form)
            navigate('/verify-otp', { state: { email: form.email } })
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
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

                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Fill in your details to get started</p>

                {error && <div className="alert alert-error">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full name</label>
                        <input name="name" placeholder="John Doe" value={form.name} onChange={handle} />
                    </div>

                    <div className="form-group">
                        <label>Email address</label>
                        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handle} />
                    </div>

                    <div className="form-group">
                        <label>Mobile number</label>
                        <input name="mobile" placeholder="10-digit mobile" maxLength={10} value={form.mobile} onChange={handle} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={form.gender} onChange={handle}>
                                <option value="">Select</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Pincode</label>
                            <input name="pincode" placeholder="6-digit" maxLength={6} value={form.pincode} onChange={handle} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>State</label>
                        <select name="state" value={form.state} onChange={handle}>
                            <option value="">Select state</option>
                            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Creating account…' : 'Create account →'}
                    </button>
                </form>

                <div className="auth-link-row">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
