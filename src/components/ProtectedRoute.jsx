import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ role, children }) => {
    const { user } = useAuth()
    const location = useLocation()

    // User login nahi hai to login page par bhejo
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        )
    }

    // Role match nahi karta to unauthorized destination par bhejo
    if (role && user.role !== role) {
        return <Navigate to="/" replace />
    }

    // User authenticated hai aur role allowed hai
    return children
}

export default ProtectedRoute