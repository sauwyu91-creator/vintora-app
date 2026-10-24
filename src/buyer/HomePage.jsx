
import { Link } from 'react-router-dom'
import browseHero from '../assets/browse-hero.jpg'
import { useAuth } from '../context/AuthContext.jsx'
import { getWishlistIds, getPublished } from '../services/listings.js'
import { getByBuyer } from '../services/enquiries.js'
import './BuyerHomePage.css'

const Icon = ({ children }) => (
    <svg
        className="buyer-icon"
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
)

const BuyerHomePage = () => {
    const { user } = useAuth()

    const saved = getWishlistIds(user.id).length
    const enquiries = getByBuyer(user.id)
    const replied = enquiries.filter(
        (e) => e.status === 'Replied'
    ).length

    return (
        <div className="buyer-home">
            <div className="buyer-inner">
                <header
                    className="buyer-hero"
                    style={{
                        '--buyer-hero-image': `url("${browseHero}")`,
                    }}
                >
                    <h2 className="buyer-title">
                        Welcome, {user.display_name}
                    </h2>

                    <p className="buyer-sub">
                        Browse listings, send enquiries to sellers,
                        and manage your wishlist.
                    </p>
                </header>

                <div className="buyer-grid">
                    <Link to="/" className="buyer-card">
                        <span className="buyer-circle">
                            <Icon>
                                <circle cx="12" cy="12" r="9" />
                                <polygon points="15.5,8.5 13.5,13.5 8.5,15.5 10.5,10.5" />
                            </Icon>
                        </span>

                        <h3 className="buyer-num">
                            {getPublished().length}
                        </h3>

                        <p className="buyer-label">
                            Items to Browse
                        </p>
                    </Link>

                    <Link to="/wishlist" className="buyer-card">
                        <span className="buyer-circle">
                            <Icon>
                                <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
                            </Icon>
                        </span>

                        <h3 className="buyer-num">
                            {saved}
                        </h3>

                        <p className="buyer-label">
                            Saved Items
                        </p>
                    </Link>

                    <Link
                        to="/my-enquiries"
                        className={`buyer-card${replied > 0 ? ' buyer-card--alert' : ''}`}
                    >
                        {replied > 0 && (
                            <span className="buyer-badge">
                                New replies
                            </span>
                        )}

                        <span className="buyer-circle">
                            <Icon>
                                <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                />
                                <polyline points="3,7 12,13 21,7" />
                            </Icon>
                        </span>

                        <h3 className="buyer-num">
                            {enquiries.length}
                        </h3>

                        <p className="buyer-label">
                            My Enquiries ({replied} replied)
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BuyerHomePage
