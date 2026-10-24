import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import { getWishlistIds, getListing } from '../services/listings.js'
import './Wishlist.css'

const Wishlist = () => {
    const { user } = useAuth()
    const [, setTick] = useState(0)
    const items = getWishlistIds(user.id).map(getListing).filter((l) => l && l.status === 'Published')

    return (
        <div className="wish-page">
            <div className="wish-inner">
                <header className="wish-head">
                    <div>
                        <h2 className="wish-title">Saved Items</h2>
                        <p className="wish-sub">Jo items aapko pasand aaye, ek hi jagah.</p>
                    </div>
                    {items.length > 0 && (
                        <span className="wish-count">
                            {items.length} {items.length === 1 ? 'item' : 'items'} saved
                        </span>
                    )}
                </header>

                {items.length === 0 ? (
                    <div className="wish-empty">
                        <p className="wish-empty-title">Abhi koi item save nahi hai.</p>
                        <p className="wish-empty-hint">Kisi bhi listing par Save to Wishlist dabao, wo yahan aa jayegi.</p>
                        <Link to="/" className="wish-empty-link">Marketplace dekho</Link>
                    </div>
                ) : (
                    <div className="wish-grid">
                        {items.map((l) => (
                            <div key={l.id} className="wish-cell">
                                <ProductCard listing={l} onWishlistChange={() => setTick((t) => t + 1)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Wishlist