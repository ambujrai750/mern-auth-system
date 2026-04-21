import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../api/auth'
import Navbar from '../components/Navbar'

const Dashboard = () => {
    const { user, setUser, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !user) {
            getProfile()
                .then(res => setUser(res.data.user))
                .catch(() => navigate('/login'))
        }
    }, [loading, user, setUser, navigate])

    if (loading || !user) {
        return (
            <div className="auth-layout">
                <span className="spinner" />
            </div>
        )
    }

    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const fields = [
        { label: 'Mobile', value: user.mobile },
        { label: 'Gender', value: user.gender },
        { label: 'State', value: user.state },
        { label: 'Pincode', value: user.pincode },
        { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
        { label: 'Account status', value: user.isVerified ? '✓ Verified' : 'Unverified' },
    ]

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-content">
                <h1 className="dashboard-greeting">
                    Hey, <span>{user.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="dashboard-subtext">Here's your profile overview.</p>

                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="profile-avatar">{initials}</div>
                        <div>
                            <div className="profile-name">
                                {user.name}
                                <span className="verified-badge">✓ Verified</span>
                            </div>
                            <div className="profile-email">{user.email}</div>
                        </div>
                    </div>

                    <div className="profile-fields">
                        {fields.map(f => (
                            <div className="profile-field" key={f.label}>
                                <div className="field-label">{f.label}</div>
                                <div className="field-value">{f.value || '—'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
