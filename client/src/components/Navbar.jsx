import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../api/auth'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try { await logoutUser() } catch { }
        logout()
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <div className="nav-brand">
                MERN<span>Auth</span>
            </div>
            <div className="nav-right">
                {user && <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>}
                <button className="btn-logout" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </nav>
    )
}

export default Navbar
