import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getAllUsers, setUserStatus } from '../services/auth.js'
import { addAudit } from '../services/listings.js'
import './UsersPage.css'

const UsersPage = () => {
    const { user: admin } = useAuth()
    const [users, setUsers] = useState(() => getAllUsers())
    const [reasons, setReasons] = useState({})
    const [error, setError] = useState('')

    const toggle = (u) => {
        const reason = (reasons[u.id] || '').trim()
        if (!reason) return setError('Reason likhna zaroori hai.')

        const next = u.status === 'suspended' ? 'active' : 'suspended'
        if (!setUserStatus(u.id, next)) return setError('Status badal nahi paya.')

        addAudit({
            admin: admin.email,
            action: next === 'suspended' ? 'User suspended' : 'User reactivated',
            target: u.email,
            reason,
        })
        setReasons(r => ({ ...r, [u.id]: '' }))
        setError('')
        setUsers(getAllUsers())
    }

    return (
        <div className="users-page">
            <div className="users-inner">
                <header className="users-head">
                    <div>
                        <h2 className="users-title">User Management</h2>
                        <p className="users-sub">Users ko suspend ya reactivate karo; reason likhna zaroori hai.</p>
                    </div>
                    {users.length > 0 && (
                        <span className="users-count">
                            {users.length} {users.length === 1 ? 'user' : 'users'}
                        </span>
                    )}
                </header>

                {error && <p className="users-error" role="alert">{error}</p>}

                {users.length > 0 ? (
                    <ul className="users-list">
                        {users.map((u) => (
                            <li key={u.id} className="users-item">
                                <div className="users-info">
                                    <h4 className="users-name">
                                        {u.display_name} <span className="users-email">({u.email})</span>
                                    </h4>
                                    <p className="users-meta">
                                        {u.role} •{' '}
                                        <span className={`users-status${u.status === 'suspended' ? ' users-status--suspended' : ' users-status--active'}`}>
                                            {u.status}
                                        </span>
                                    </p>
                                </div>

                                {u.role !== 'admin' && (
                                    <div className="users-action">
                                        <input
                                            className="users-input"
                                            aria-label={`Reason for ${u.email}`}
                                            placeholder="Reason (zaroori)"
                                            value={reasons[u.id] || ''}
                                            onChange={(e) => setReasons(r => ({ ...r, [u.id]: e.target.value }))}
                                        />
                                        <button
                                            onClick={() => toggle(u)}
                                            className={`users-btn ${u.status === 'suspended' ? 'users-btn--reactivate' : 'users-btn--suspend'}`}
                                        >
                                            {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="users-empty">
                        <p className="users-empty-title">No users found.</p>
                        <p className="users-empty-hint">Jab users register honge, wo yahan dikhenge.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UsersPage