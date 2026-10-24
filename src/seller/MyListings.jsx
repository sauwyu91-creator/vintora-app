
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getListingsBySeller, deleteListing } from '../services/listings.js'

const MyListings = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    useEffect(() => {
        let active = true

        const loadListings = () => {
            setLoading(true)
            setError('')

            try {
                if (!user) {
                    setListings([])
                    return
                }

                const result = getListingsBySeller(user.id)

                if (!active) return

                if (result?.error) {
                    throw result.error
                }

                setListings(Array.isArray(result) ? result : result?.data || [])
            } catch (err) {
                if (active) {
                    setError(err?.message || 'Listings load nahi ho sakin.')
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        loadListings()

        return () => {
            active = false
        }
    }, [user])

    const filteredListings = useMemo(() => {
        const query = search.trim().toLowerCase()

        return listings.filter((listing) => {
            const matchesSearch = [
                listing.title,
                listing.category,
                listing.city,
                listing.state,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                )

            const matchesStatus =
                statusFilter === 'All' ||
                listing.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [listings, search, statusFilter])

    const handleDelete = (listing) => {
        const confirmed = window.confirm(
            `"${listing.title}" listing delete karni hai? Ye action undo nahi hoga.`
        )

        if (!confirmed) return

        try {
            const result = deleteListing(listing.id)

            if (result?.error) {
                setError(result.error.message || 'Listing delete nahi hui.')
                return
            }

            setListings((current) =>
                current.filter((item) => item.id !== listing.id)
            )
            setError('')
        } catch (err) {
            setError(err?.message || 'Listing delete nahi ho saki.')
        }
    }

    const styles = `
        .my-listings-page {
            min-height: 100vh;
            padding: 42px 20px 64px;
            background: #f8f5ed;
            color: #183d36;
        }

        .my-listings-page * {
            box-sizing: border-box;
        }

        .my-listings-container {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
        }

        .my-listings-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 24px;
            border-bottom: 1px solid #ded8c9;
        }

        .my-listings-eyebrow {
            margin: 0 0 8px;
            color: #a17a32;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2px;
        }

        .my-listings-header h1 {
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(30px, 5vw, 42px);
            font-weight: 500;
            line-height: 1.2;
        }

        .my-listings-subtitle {
            margin: 10px 0 0;
            color: #72766b;
            font-size: 14px;
            line-height: 1.7;
        }

        .my-listings-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 42px;
            padding: 11px 17px;
            border: 1px solid transparent;
            border-radius: 8px;
            font: inherit;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            transition: background 180ms ease, border-color 180ms ease;
        }

        .my-listings-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

        .my-listings-btn--primary {
            background: #183d36;
            color: #fffaf0;
        }

        .my-listings-btn--primary:hover {
            background: #28584d;
        }

        .my-listings-btn--outline {
            border-color: #d8d2c3;
            background: #fffefa;
            color: #183d36;
        }

        .my-listings-btn--outline:hover {
            border-color: #b99a54;
            background: #f8f1e2;
        }

        .my-listings-btn--delete {
            border-color: #e7c8c1;
            background: #fff7f5;
            color: #9a3f32;
        }

        .my-listings-btn--delete:hover {
            border-color: #c9796b;
            background: #fce9e5;
        }

        .my-listings-toolbar {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
        }

        .my-listings-search,
        .my-listings-filter {
            min-height: 45px;
            padding: 11px 14px;
            border: 1px solid #d8d2c3;
            border-radius: 9px;
            background: #fffefa;
            color: #183d36;
            font: inherit;
            font-size: 14px;
        }

        .my-listings-search {
            flex: 1;
            min-width: 0;
        }

        .my-listings-filter {
            min-width: 175px;
        }

        .my-listings-search:focus,
        .my-listings-filter:focus {
            outline: 2px solid #c9ad68;
            outline-offset: 2px;
        }

        .my-listings-count {
            margin: 0 0 15px;
            color: #72766b;
            font-size: 13px;
        }

        .my-listings-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
        }

        .my-listing-card {
            overflow: hidden;
            border: 1px solid #e4dfd2;
            border-radius: 15px;
            background: #fffefa;
            box-shadow: 0 5px 20px rgba(24, 61, 54, 0.045);
            transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .my-listing-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(24, 61, 54, 0.08);
        }

        .my-listing-image-wrap {
            position: relative;
            height: 220px;
            background: #eee8da;
        }

        .my-listing-image {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .my-listing-image-placeholder {
            display: grid;
            width: 100%;
            height: 100%;
            place-items: center;
            color: #9c927c;
            font-size: 42px;
        }

        .my-listing-status {
            position: absolute;
            top: 13px;
            left: 13px;
            padding: 7px 11px;
            border: 1px solid rgba(255,255,255,0.7);
            border-radius: 30px;
            background: #fffefa;
            color: #183d36;
            font-size: 11px;
            font-weight: 800;
        }

        .my-listing-status--published {
            background: #e3efe4;
            color: #286443;
        }

        .my-listing-status--pending-review {
            background: #fff0cf;
            color: #805b17;
        }

        .my-listing-status--rejected {
            background: #fbe5e0;
            color: #983e32;
        }

        .my-listing-status--draft {
            background: #eee9df;
            color: #665c49;
        }

        .my-listing-content {
            padding: 20px;
        }

        .my-listing-category {
            margin: 0 0 7px;
            color: #a17a32;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.4px;
            text-transform: uppercase;
        }

        .my-listing-title {
            margin: 0;
            color: #183d36;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 21px;
            font-weight: 600;
            overflow-wrap: anywhere;
        }

        .my-listing-location {
            margin: 9px 0 0;
            color: #77796f;
            font-size: 13px;
        }

        .my-listing-price {
            margin: 15px 0 0;
            color: #183d36;
            font-size: 22px;
            font-weight: 800;
        }

        .my-listing-reason {
            margin-top: 14px;
            padding: 11px 12px;
            border-radius: 8px;
            background: #fff1ed;
            color: #8f4035;
            font-size: 12px;
            line-height: 1.6;
        }

        .my-listing-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 9px;
            margin-top: 19px;
            padding-top: 17px;
            border-top: 1px solid #eee8dc;
        }

        .my-listing-actions .my-listings-btn {
            flex: 1;
        }

        .my-listings-message {
            padding: 14px 16px;
            margin-bottom: 20px;
            border: 1px solid #e4c9c2;
            border-radius: 9px;
            background: #fff4f1;
            color: #963d32;
            font-size: 14px;
            line-height: 1.6;
        }

        .my-listings-empty {
            padding: 55px 24px;
            border: 1px dashed #d6cdb9;
            border-radius: 15px;
            background: #fffefa;
            text-align: center;
        }

        .my-listings-empty-icon {
            display: grid;
            width: 62px;
            height: 62px;
            place-items: center;
            margin: 0 auto 18px;
            border-radius: 50%;
            background: #e8eee7;
            color: #28584d;
            font-size: 28px;
        }

        .my-listings-empty h2 {
            margin: 0 0 10px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 25px;
            font-weight: 500;
        }

        .my-listings-empty p {
            max-width: 420px;
            margin: 0 auto 20px;
            color: #72766b;
            font-size: 14px;
            line-height: 1.8;
        }

        .my-listings-loading {
            padding: 36px 16px;
            color: #72766b;
            text-align: center;
        }

        @media (max-width: 720px) {
            .my-listings-grid {
                grid-template-columns: 1fr;
            }

            .my-listing-image-wrap {
                height: 240px;
            }
        }

        @media (max-width: 520px) {
            .my-listings-page {
                padding: 28px 14px 45px;
            }

            .my-listings-header {
                align-items: flex-start;
                flex-direction: column;
            }

            .my-listings-toolbar {
                flex-direction: column;
            }

            .my-listings-filter {
                width: 100%;
            }

            .my-listing-content {
                padding: 17px;
            }
        }
    `

    const getStatusClass = (status = '') =>
        status.toLowerCase().replace(/\s+/g, '-')

    return (
        <main className="my-listings-page">
            <style>{styles}</style>

            <div className="my-listings-container">
                <header className="my-listings-header">
                    <div>
                        <p className="my-listings-eyebrow">
                            VINTORA SELLER STUDIO
                        </p>

                        <h1>My Listings</h1>

                        <p className="my-listings-subtitle">
                            Apni items, prices aur listing status ek jagah manage karo.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="my-listings-btn my-listings-btn--primary"
                        onClick={() => navigate('/seller/listings/new')}
                    >
                        <span aria-hidden="true">＋</span> Add listing
                    </button>
                </header>

                {error && (
                    <div className="my-listings-message" role="alert">
                        {error}
                    </div>
                )}

                <div className="my-listings-toolbar">
                    <input
                        className="my-listings-search"
                        type="search"
                        placeholder="Search by title, category or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search listings"
                    />

                    <select
                        className="my-listings-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter listings by status"
                    >
                        <option value="All">All statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Published">Published</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {!loading && (
                    <p className="my-listings-count">
                        Showing {filteredListings.length} of {listings.length} listings
                    </p>
                )}

                {loading ? (
                    <div className="my-listings-loading">
                        Tumhari listings load ho rahi hain...
                    </div>
                ) : filteredListings.length > 0 ? (
                    <div className="my-listings-grid">
                        {filteredListings.map((listing) => {
                            const coverIndex = Number(listing.cover || 0)
                            const image =
                                listing.photos?.[coverIndex] ||
                                listing.photos?.[0] ||
                                listing.image ||
                                ''

                            return (
                                <article
                                    className="my-listing-card"
                                    key={listing.id}
                                >
                                    <div className="my-listing-image-wrap">
                                        {image ? (
                                            <img
                                                className="my-listing-image"
                                                src={image}
                                                alt={listing.title || 'Listing'}
                                            />
                                        ) : (
                                            <div
                                                className="my-listing-image-placeholder"
                                                aria-label="No listing photo"
                                            >
                                                ✧
                                            </div>
                                        )}

                                        <span
                                            className={`my-listing-status my-listing-status--${getStatusClass(
                                                listing.status || 'Draft'
                                            )}`}
                                        >
                                            {listing.status || 'Draft'}
                                        </span>
                                    </div>

                                    <div className="my-listing-content">
                                        <p className="my-listing-category">
                                            {listing.category || 'Uncategorized'}
                                        </p>

                                        <h2 className="my-listing-title">
                                            {listing.title || 'Untitled listing'}
                                        </h2>

                                        <p className="my-listing-location">
                                            {[listing.city, listing.state]
                                                .filter(Boolean)
                                                .join(', ') || 'Location not added'}
                                        </p>

                                        <p className="my-listing-price">
                                            {listing.price !== '' &&
                                            listing.price != null &&
                                            Number.isFinite(Number(listing.price))
                                                ? Number(listing.price).toLocaleString(
                                                    'en-IN',
                                                    {
                                                        style: 'currency',
                                                        currency: 'INR',
                                                        maximumFractionDigits: 0,
                                                    }
                                                )
                                                : 'Price not set'}
                                        </p>

                                        {listing.rejectReason && (
                                            <div className="my-listing-reason">
                                                <strong>Review note:</strong>{' '}
                                                {listing.rejectReason}
                                            </div>
                                        )}

                                        <div className="my-listing-actions">
                                            <button
                                                type="button"
                                                className="my-listings-btn my-listings-btn--outline"
                                                onClick={() =>
                                                    navigate(
                                                        `/seller/listings/${listing.id}/edit`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="my-listings-btn my-listings-btn--delete"
                                                onClick={() =>
                                                    handleDelete(listing)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                ) : (
                    <section className="my-listings-empty">
                        <div
                            className="my-listings-empty-icon"
                            aria-hidden="true"
                        >
                            ✧
                        </div>

                        <h2>
                            {listings.length === 0
                                ? 'Abhi koi listing nahi hai'
                                : 'Koi matching listing nahi mili'}
                        </h2>

                        <p>
                            {listings.length === 0
                                ? 'Apni pehli item list karo. Photos, details aur price add karke buyers tak pahunchao.'
                                : 'Search ya status filter badal kar dobara try karo.'}
                        </p>

                        {listings.length === 0 && (
                            <button
                                type="button"
                                className="my-listings-btn my-listings-btn--primary"
                                onClick={() => navigate('/seller/listings/new')}
                            >
                                Create your first listing
                            </button>
                        )}
                    </section>
                )}
            </div>
        </main>
    )
}

export default MyListings
