import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { isWishlisted, toggleWishlist } from '../services/listings.js'

/* ==========================================
   CSS isi file me (alag file ki zarurat nahi).
   Page par 20 cards ho to bhi CSS sirf EK baar <head> me jata hai.
   Saari classes .vt-pc ke andar scoped hain.
========================================== */
const css = `
.vt-pc {
    --vt-ink: #04201f;
    --vt-teal: #0f3a3a;
    --vt-gold: #c9a24b;
    --vt-copper: #9a5b16;
    --vt-cream: #f3efe4;
    --vt-paper: #fbf9f3;
    --vt-line: #e2dac5;
    --vt-muted: #4f6a66;

    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--vt-paper);
    border: 1px solid var(--vt-line);
    border-radius: 14px;
    box-shadow: 0 2px 10px rgba(4, 32, 31, 0.08);
    color: var(--vt-ink);
    font-family: Calibri, 'Segoe UI', system-ui, sans-serif;
    text-decoration: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.vt-pc:hover {
    border-color: var(--vt-gold);
}

.vt-pc:focus-visible {
    outline: 3px solid var(--vt-copper);
    outline-offset: 3px;
}

/* ---------- photo ---------- */
.vt-pc-media {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--vt-teal);
}

.vt-pc-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.vt-pc:hover .vt-pc-media img {
    transform: scale(1.06);
}

.vt-pc-noimg {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #e8d9b5;
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: 1rem;
    font-style: italic;
}

/* ---------- wishlist heart ---------- */
.vt-pc-heart {
    position: absolute;
    top: 10px;
    right: 10px;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    padding: 0;
    background: rgba(251, 249, 243, 0.94);
    border: none;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(4, 32, 31, 0.25);
    color: var(--vt-teal);
    font-size: 1.15rem;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
}

.vt-pc-heart:hover {
    transform: scale(1.12);
    background: #fff;
}

.vt-pc-heart:focus-visible {
    outline: 3px solid var(--vt-copper);
    outline-offset: 2px;
}

.vt-pc-heart.is-saved {
    color: #b3261e;
    animation: vtHeartPop 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.5);
}

@keyframes vtHeartPop {
    0% {
        transform: scale(0.7);
    }
    55% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}

/* ---------- body ---------- */
.vt-pc-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 1rem 1.1rem 1.05rem;
}

.vt-pc-title {
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: 1.12rem;
    line-height: 1.3;
    font-weight: 700;
    color: var(--vt-ink);
    transition: color 0.2s ease;
}

.vt-pc:hover .vt-pc-title {
    color: var(--vt-copper);
}

.vt-pc-meta {
    margin: 0.4rem 0 0;
    color: var(--vt-muted);
    font-size: 0.92rem;
}

.vt-pc-cond {
    align-self: flex-start;
    margin: 0.55rem 0 0;
    padding: 0.1rem 0.65rem;
    background: rgba(201, 162, 75, 0.2);
    border: 1px solid rgba(201, 162, 75, 0.55);
    border-radius: 999px;
    color: #6b3f0e;
    font-size: 0.8rem;
    font-weight: 700;
}

.vt-pc-seller {
    margin: auto 0 0;
    padding-top: 0.75rem;
    color: var(--vt-muted);
    font-size: 0.85rem;
}

@media (prefers-reduced-motion: reduce) {
    .vt-pc,
    .vt-pc-media img,
    .vt-pc-title,
    .vt-pc-heart {
        transition: none;
    }

    .vt-pc:hover .vt-pc-media img,
    .vt-pc-heart:hover {
        transform: none;
    }

    .vt-pc-heart.is-saved {
        animation: none;
    }
}
`

/* CSS ko ek hi baar <head> me daalo (module load par, render se pehle) */
const STYLE_ID = 'vt-product-card-css'
if (typeof document !== 'undefined') {
    let el = document.getElementById(STYLE_ID)
    if (!el) {
        el = document.createElement('style')
        el.id = STYLE_ID
        document.head.appendChild(el)
    }
    el.textContent = css
}

const ProductCard = ({ listing, onWishlistChange }) => {
    const { user } = useAuth()
    const [saved, setSaved] = useState(() => (user ? isWishlisted(user.id, listing.id) : false))
    const photo = listing.photos?.[listing.cover || 0] || listing.photos?.[0]

    const handleWishlist = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setSaved(toggleWishlist(user.id, listing.id))
        onWishlistChange?.()
    }

    return (
        <Link to={`/item/${listing.id}`} className="vt-pc">
            <div className="vt-pc-media">
                {photo ? (
                    <img src={photo} alt={listing.title} loading="lazy" />
                ) : (
                    <div className="vt-pc-noimg">No Image</div>
                )}
                {user?.role === 'buyer' && (
                    <button
                        type="button"
                        onClick={handleWishlist}
                        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                        aria-pressed={saved}
                        className={`vt-pc-heart${saved ? ' is-saved' : ''}`}
                    >
                        {saved ? '♥' : '♡'}
                    </button>
                )}
            </div>
            <div className="vt-pc-body">
                <h4 className="vt-pc-title">{listing.title}</h4>
                <p className="vt-pc-meta">{listing.category} • {listing.city}</p>
                {listing.condition && <p className="vt-pc-cond">{listing.condition}</p>}
                <p className="vt-pc-seller">by {listing.sellerName}</p>
            </div>
        </Link>
    )
}

export default ProductCard