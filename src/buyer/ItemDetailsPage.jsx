import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getListing, addView, isWishlisted, toggleWishlist, addReport } from '../services/listings.js'
import { sendEnquiry } from '../services/enquiries.js'
import './ItemDetailsPage.css'

const Field = ({ label, value }) => (
    <div className="item-field">
        <dt className="item-dt">{label}</dt>
        <dd className="item-dd">{value || '-'}</dd>
    </div>
)

const ItemDetailsPage = () => {
    const { id } = useParams()
    const { user } = useAuth()

    const listing = getListing(id)
    const [photoIdx, setPhotoIdx] = useState(0)
    const [inWishlist, setInWishlist] = useState(() => (user ? isWishlisted(user.id, id) : false))
    const [message, setMessage] = useState('')
    const [info, setInfo] = useState('')
    const [error, setError] = useState('')

    useEffect(() => { addView(id) }, [id])

    const canSee = listing && (
        listing.status === 'Published' || user?.role === 'admin' || user?.id === listing.sellerId
    )
    if (!canSee) {
        return (
            <div className="item-page">
                <div className="item-inner">
                    <div className="item-missing">
                        <p className="item-missing-title">Ye item available nahi hai.</p>
                        <Link to="/" className="item-missing-link">Marketplace par wapas jao</Link>
                    </div>
                </div>
            </div>
        )
    }

    const isBuyer = user?.role === 'buyer'

    const send = () => {
        setInfo(''); setError('')
        if (!message.trim()) return setError('Pehle apna sawal likho.')
        if (!sendEnquiry({ listing, buyer: user, message: message.trim() })) {
            return setError('Enquiry save nahi hui. Dobara try karo.')
        }
        setMessage('')
        setInfo('Enquiry bhej di gayi. My Enquiries mein status dekho.')
    }

    const report = () => {
        const reason = window.prompt('Is listing mein kya galat hai?')
        if (reason && reason.trim()) {
            addReport({ listingId: listing.id, listingTitle: listing.title, reporterId: user.id, reason: reason.trim() })
            setInfo('Report bhej di gayi. Admin check karega.')
        }
    }

    const photos = listing.photos || []

    return (
        <div className="item-page">
            <div className="item-inner">
                <Link to="/" className="item-back">Back to Marketplace</Link>

                <header className="item-head">
                    <h2 className="item-title">{listing.title}</h2>
                    <p className="item-byline">
                        by {listing.sellerName || 'Seller'}
                        {listing.status !== 'Published' && (
                            <span className="item-status">{listing.status}</span>
                        )}
                    </p>
                </header>

                <div className="item-layout">
                    {/* Photos */}
                    <div className="item-gallery">
                        <div className="item-stage">
                            {photos.length
                                ? <img src={photos[photoIdx]} alt={listing.title} className="item-stage-img" />
                                : <span className="item-noimg">No Image</span>}
                        </div>
                        {photos.length > 1 && (
                            <div className="item-thumbs">
                                {photos.map((p, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`item-thumb${i === photoIdx ? ' is-active' : ''}`}
                                        aria-label={`Show photo ${i + 1}`}
                                        aria-pressed={i === photoIdx}
                                        onClick={() => setPhotoIdx(i)}
                                    >
                                        <img src={p} alt={`Photo ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="item-details">
                        <dl className="item-specs">
                            <div className="item-row">
                                <Field label="Category" value={listing.category} />
                                <Field label="Condition" value={listing.condition} />
                            </div>
                            <div className="item-row">
                                <Field label="Location" value={[listing.city, listing.state].filter(Boolean).join(', ')} />
                                <Field label="Age" value={listing.approx_age} />
                            </div>
                            <div className="item-row">
                                <Field label="Brand / maker" value={listing.brand} />
                                <Field label="Subcategory" value={listing.subcategory} />
                            </div>
                        </dl>

                        <p className="item-desc">
                            {listing.description || 'No description available'}
                        </p>

                        {listing.provenance && (
                            <section className="item-prov">
                                <h4 className="item-prov-title">History / Provenance</h4>
                                <p className="item-prov-text">{listing.provenance}</p>
                            </section>
                        )}

                        {/* Buyer actions */}
                        {isBuyer && (
                            <div className="item-actions">
                                <button
                                    type="button"
                                    className={`item-wish${inWishlist ? ' is-saved' : ''}`}
                                    aria-pressed={inWishlist}
                                    onClick={() => setInWishlist(toggleWishlist(user.id, id))}
                                >
                                    {inWishlist ? '♥ Saved' : 'Save to Wishlist'}
                                </button>

                                <h4 className="item-enq-title">Seller ko enquiry bhejo</h4>
                                <textarea
                                    className="item-textarea"
                                    rows={3}
                                    aria-label="Apna sawal"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Apna sawal likho..."
                                />
                                <button type="button" onClick={send} className="item-send">
                                    Enquiry bhejo
                                </button>
                                <button type="button" onClick={report} className="item-report">
                                    Report listing
                                </button>
                            </div>
                        )}

                        {!user && (
                            <p className="item-login">
                                <Link to="/login">Login</Link> karke seller ko enquiry bhejo.
                            </p>
                        )}

                        {error && <p className="item-msg item-msg--error" role="alert">{error}</p>}
                        {info && <p className="item-msg item-msg--info" role="status">{info}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemDetailsPage