import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { addAudit } from '../services/listings.js'
import { fetchPending, setListingStatus } from '../services/listingsApi.js'
import './PendingListingsPage.css'

const PendingListingsPage = () => {
    const { user } = useAuth()
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [reasons, setReasons] = useState({})
    const [error, setError] = useState('')

    const refresh = async () => {
        try {
            setListings(await fetchPending())
        } catch (err) {
            setError(err?.message || 'Listings load nahi ho sakin.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let active = true

        fetchPending()
            .then((rows) => {
                if (active) setListings(rows)
            })
            .catch((err) => {
                if (active) setError(err?.message || 'Listings load nahi ho sakin.')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const approve = async (listing) => {
        try {
            await setListingStatus(listing.id, 'Published')
            addAudit({ admin: user.email, action: 'Listing approved', target: listing.title })
            setError('')
            await refresh()
        } catch (err) {
            setError(err?.message || 'Approve nahi ho saki.')
        }
    }

    const reject = async (listing) => {
        const reason = (reasons[listing.id] || '').trim()

        if (!reason) {
            setError('Reject karne ke liye reason likhna zaroori hai.')
            return
        }

        try {
            await setListingStatus(listing.id, 'Rejected', reason)
            addAudit({ admin: user.email, action: 'Listing rejected', target: listing.title, reason })
            setError('')
            await refresh()
        } catch (err) {
            setError(err?.message || 'Reject nahi ho saki.')
        }
    }

    return (
        <div className="pending-page">
            <div className="pending-inner">
                <header className="pending-head">
                    <div>
                        <h2 className="pending-title">Pending Listings Moderation</h2>
                        <p className="pending-sub">Listing approve karo, ya reason likh ke reject karo.</p>
                    </div>
                    {listings.length > 0 && (
                        <span className="pending-count">{listings.length} pending</span>
                    )}
                </header>

                {error && <p className="pending-error" role="alert">{error}</p>}

                {loading ? (
                    <div className="pending-empty">
                        <p className="pending-empty-title">Listings load ho rahi hain...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="pending-empty">
                        <p className="pending-empty-title">No listings pending review.</p>
                        <p className="pending-empty-hint">Naye listings submit hote hi yahan review ke liye aayenge.</p>
                    </div>
                ) : (
                    <ul className="pending-list">
                        {listings.map((listing) => {
                            const photo = listing.photos?.[listing.cover || 0]
                            return (
                                <li key={listing.id} className="pending-item">
                                    {photo && (
                                        <img src={photo} alt={listing.title} className="pending-photo" />
                                    )}
                                    <div className="pending-body">
                                        <h4 className="pending-item-title">{listing.title}</h4>
                                        <p className="pending-meta">
                                            {listing.category} • {listing.city} • {listing.condition} • seller: {listing.sellerName}
                                        </p>
                                        <p className="pending-desc">{listing.description}</p>
                                        <input
                                            className="pending-reason"
                                            aria-label={`Reject reason for ${listing.title}`}
                                            placeholder="Reject karne ka reason"
                                            value={reasons[listing.id] || ''}
                                            onChange={(e) => setReasons((r) => ({ ...r, [listing.id]: e.target.value }))}
                                        />
                                    </div>
                                    <div className="pending-actions">
                                        <button onClick={() => approve(listing)} className="pending-btn pending-btn--approve">Approve</button>
                                        <button onClick={() => reject(listing)} className="pending-btn pending-btn--reject">Reject</button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default PendingListingsPage