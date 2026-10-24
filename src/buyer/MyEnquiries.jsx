import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getByBuyer } from '../services/enquiries.js'
import './MyEnquiries.css'

const statusClass = { New: 'new', Replied: 'replied', Closed: 'closed' }

const MyEnquiries = () => {
    const { user } = useAuth()
    const enquiries = getByBuyer(user.id)
    const repliedCount = enquiries.filter((e) => e.status === 'Replied').length

    return (
        <div className="enq-page">
            <div className="enq-inner">
                <header className="enq-head">
                    <div>
                        <h2 className="enq-title">My Enquiries</h2>
                        <p className="enq-sub">Sellers ko bheje gaye sawal aur unke replies.</p>
                    </div>
                    {enquiries.length > 0 && (
                        <span className="enq-count">
                            {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'}
                            {repliedCount > 0 && ` · ${repliedCount} replied`}
                        </span>
                    )}
                </header>

                {enquiries.length > 0 ? (
                    <ul className="enq-list">
                        {enquiries.map((e) => (
                            <li key={e.id} className="enq-item">
                                <div className="enq-item-head">
                                    <h4 className="enq-item-title">
                                        <Link to={`/item/${e.listingId}`} className="enq-link">{e.listingTitle}</Link>
                                    </h4>
                                    <span className={`enq-status enq-status--${statusClass[e.status] || 'closed'}`}>
                                        {e.status}
                                    </span>
                                </div>

                                <p className="enq-date">{new Date(e.date).toLocaleString()}</p>

                                <p className="enq-bubble enq-bubble--you">Aapne: {e.message}</p>

                                {e.reply ? (
                                    <p className="enq-bubble enq-bubble--seller">Seller ka reply: {e.reply}</p>
                                ) : (
                                    <p className="enq-waiting">Seller ke reply ka intezaar hai.</p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="enq-empty">
                        <p className="enq-empty-title">Abhi koi enquiry nahi bheji.</p>
                        <Link to="/" className="enq-empty-link">Marketplace dekho</Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyEnquiries