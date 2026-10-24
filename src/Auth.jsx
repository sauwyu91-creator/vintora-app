import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const Auth = ({ mode }) => {
    const { login, signup } = useAuth()
    const navigate = useNavigate()
    const isSignup = mode === 'signup'
    const [identifier, setIdentifier] = useState('') // signup mein email, login mein email ya phone
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('buyer')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // login <-> signup badalne par form reset
    useEffect(() => {
        setIdentifier('')
        setPhone('')
        setPassword('')
        setRole('buyer')
        setError('')
    }, [mode])

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const res = isSignup
            ? await signup(identifier, password, phone, role)
            : await login(identifier, password)

        setLoading(false)

        if (res.error) return setError(res.error.message)

        const r = res.data.user.role
        navigate(r === 'admin' ? '/admin' : r === 'seller' ? '/seller/listings' : '/buyer/home')
    }

    return (
        <div className="page narrow">
            <h2>{isSignup ? 'Sign up' : 'Login'}</h2>
            <form onSubmit={submit} className="form">
                <input
                    type={isSignup ? 'email' : 'text'}
                    placeholder={isSignup ? 'Email' : 'Email ya phone number'}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    autoComplete={isSignup ? 'email' : 'username'}
                    required
                />

                {isSignup && (
                    <input
                        type="tel"
                        placeholder="Phone number (10 digit)"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        maxLength={13}
                        autoComplete="tel"
                        required
                    />
                )}

                <input
                    type="password"
                    placeholder={isSignup ? 'Password (8+ akshar)' : 'Password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                />

                {isSignup && (
                    <select value={role} onChange={e => setRole(e.target.value)}>
                        <option value="buyer">Main Buyer hoon</option>
                        <option value="seller">Main Seller hoon</option>
                    </select>
                )}

                {error && <p className="error">{error}</p>}
                <button className="btn" type="submit" disabled={loading}>
                    {loading ? 'Ruko...' : isSignup ? 'Account banao' : 'Login'}
                </button>
            </form>
            <p className="muted">
                {isSignup ? <>Account hai? <Link to="/login">Login</Link></> : <>Naya ho? <Link to="/signup">Sign up</Link></>}
            </p>
        </div>
    )
}

export default Auth