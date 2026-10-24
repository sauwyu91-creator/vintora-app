import { Link } from 'react-router-dom'
import { getPending, getReports } from '../services/listings.js'
import { getAllUsers } from '../services/auth.js'
import './AdminHomePage.css'

const AdminHomePage = () => {
    const pending = getPending().length
    const openReports = getReports().filter(r => r.status === 'Open').length
    const users = getAllUsers().length

    return (
        <div className="admin-home">
            <div className="admin-home-inner">
                <header className="admin-home-head">
                    <h2 className="admin-home-title">Welcome, Admin</h2>
                    <p className="admin-home-sub">Manage users, review listings, and handle reports.</p>
                </header>

                <div className="admin-grid">
                    <Link
                        to="/admin/pending-listings"
                        className={`admin-card${pending > 0 ? ' admin-card--alert' : ''}`}
                    >
                        {pending > 0 && <span className="admin-card-badge">Needs review</span>}
                        <h3 className="admin-card-num">{pending}</h3>
                        <p className="admin-card-label">Pending Listings</p>
                    </Link>

                    <Link
                        to="/admin/reported-listings"
                        className={`admin-card${openReports > 0 ? ' admin-card--alert' : ''}`}
                    >
                        {openReports > 0 && <span className="admin-card-badge">Needs review</span>}
                        <h3 className="admin-card-num">{openReports}</h3>
                        <p className="admin-card-label">Open Reports</p>
                    </Link>

                    <Link to="/admin/users" className="admin-card">
                        <h3 className="admin-card-num">{users}</h3>
                        <p className="admin-card-label">Users</p>
                    </Link>

                    <Link to="/admin/audit-log" className="admin-card">
                        <h3 className="admin-card-num">Log</h3>
                        <p className="admin-card-label">Audit Log</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AdminHomePage