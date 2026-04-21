import { createContext, useContext, useState, useEffect } from 'react'
import { getProfile } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    // On mount, fetch profile if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) { setLoading(false); return }
            try {
                const res = await getProfile()
                setUser(res.data.user)
            } catch {
                // Token invalid or expired — clear it
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [token])

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
