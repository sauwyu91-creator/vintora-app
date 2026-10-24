import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from '../components/ProductCard'

import {
    getPublished,
    CATEGORIES,
    CONDITIONS,
} from '../services/listings.js'
import './BrowsePage.css'
import './BrowsePage.motion.css'

const empty = {
    search: '',
    category: '',
    city: '',
    condition: '',
}

/* Card screen par aate hi animate hota hai (scroll reveal) */
const RevealCell = ({ index, children }) => {
    const ref = useRef(null)
    const [seen, setSeen] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === 'undefined') {
            setSeen(true)
            return undefined
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSeen(true)
                    io.disconnect()
                }
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    return (
        <div
            ref={ref}
            className={`browse-cell${seen ? ' is-in' : ''}`}
            style={{ '--card-index': index % 4 }}
        >
            {children}
        </div>
    )
}

const BrowsePage = () => {
    const [filters, setFilters] = useState(empty)

    const set = (key) => (e) => {
        const value = e.target.value

        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const published = getPublished()

    const listings = useMemo(() => {
        const text = filters.search.trim().toLowerCase()
        const city = filters.city.trim().toLowerCase()

        return published.filter((l) => {
            const matchText =
                !text ||
                [
                    l.title,
                    l.category,
                    l.city,
                    l.brand,
                    l.subcategory,
                ].some((v) =>
                    (v || '').toLowerCase().includes(text)
                )

            const matchCity =
                !city ||
                (l.city || '').toLowerCase().includes(city)

            const matchCategory =
                !filters.category ||
                l.category === filters.category

            const matchCondition =
                !filters.condition ||
                l.condition === filters.condition

            return (
                matchText &&
                matchCity &&
                matchCategory &&
                matchCondition
            )
        })
    }, [published, filters])

    const hasFilter = Object.values(filters).some((v) => v)

    const chips = [
        ['search', filters.search.trim()],
        ['city', filters.city.trim()],
        ['condition', filters.condition],
    ].filter(([, label]) => label)

    const removeFilter = (key) => {
        setFilters((prev) => ({
            ...prev,
            [key]: '',
        }))
    }

    const resetFilters = () => setFilters({ ...empty })

    return (
        <main className="browse-page">
            <div className="browse-inner">

                {/* Hero and search */}
                <form
                    className="browse-form"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <header className="browse-hero">
                        <span className="browse-live hero-reveal delay-1">
                            <span
                                className="browse-live-dot"
                                aria-hidden="true"
                            />
                            {published.length}{' '}
                            {published.length === 1 ? 'item' : 'items'} live
                        </span>

                        <h1 className="browse-title hero-reveal delay-2">
                            Discover Something
                            <span className="browse-title-accent">
                                {' '}Special.
                            </span>
                        </h1>

                        <p className="browse-tagline hero-reveal delay-3">
                            Find the story behind every find.
                            Your next favourite item is waiting.
                        </p>

                        <div className="browse-searchbox hero-reveal delay-4">
                            <svg
                                className="browse-searchicon"
                                viewBox="0 0 24 24"
                                width="21"
                                height="21"
                                fill="none"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="10.5"
                                    cy="10.5"
                                    r="6.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <line
                                    x1="15.5"
                                    y1="15.5"
                                    x2="21"
                                    y2="21"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <input
                                className="browse-search"
                                type="search"
                                aria-label="Search items"
                                value={filters.search}
                                onChange={set('search')}
                                placeholder="Search products, brands..."
                            />

                            {filters.search && (
                                <button
                                    type="button"
                                    className="browse-clear-search"
                                    onClick={() => removeFilter('search')}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Filters */}
                    <section
                        className="browse-panel"
                        aria-label="Product filters"
                    >
                        <div className="browse-panel-heading">
                            <div>
                                <h2>Explore the collection</h2>
                                <p>Find exactly what you're looking for.</p>
                            </div>

                            <span className="browse-filter-icon" aria-hidden="true">
                                ☷
                            </span>
                        </div>

                        <div
                            className="browse-pills"
                            role="group"
                            aria-label="Category"
                        >
                            <button
                                type="button"
                                className={`browse-pill ${
                                    !filters.category ? 'is-active' : ''
                                }`}
                                aria-pressed={!filters.category}
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        category: '',
                                    }))
                                }
                            >
                                All Categories
                            </button>

                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    className={`browse-pill ${
                                        filters.category === category
                                            ? 'is-active'
                                            : ''
                                    }`}
                                    aria-pressed={
                                        filters.category === category
                                    }
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            category,
                                        }))
                                    }
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="browse-fields">
                            <label className="browse-control">
                                <span>Location</span>
                                <input
                                    className="browse-field"
                                    type="text"
                                    aria-label="City"
                                    value={filters.city}
                                    onChange={set('city')}
                                    placeholder="Enter city"
                                />
                            </label>

                            <label className="browse-control">
                                <span>Condition</span>
                                <select
                                    className="browse-field"
                                    aria-label="Condition"
                                    value={filters.condition}
                                    onChange={set('condition')}
                                >
                                    <option value="">
                                        All Conditions
                                    </option>

                                    {CONDITIONS.map((condition) => (
                                        <option
                                            key={condition}
                                            value={condition}
                                        >
                                            {condition}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button
                                type="button"
                                className="browse-reset"
                                onClick={resetFilters}
                                disabled={!hasFilter}
                            >
                                <span aria-hidden="true">↺</span>
                                Reset Filters
                            </button>
                        </div>
                    </section>
                </form>

                {/* Results */}
                <section className="browse-results" aria-label="Search results">
                    <div className="browse-resultbar">
                        <div className="browse-result-heading">
                            <h2>Find your next favourite</h2>

                            <p className="browse-count" aria-live="polite">
                                Showing{' '}
                                {/* key badalne se number har baar chhota "pop" karta hai */}
                                <strong key={listings.length}>{listings.length}</strong>{' '}
                                of {published.length}{' '}
                                {published.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>

                        {chips.length > 0 && (
                            <ul className="browse-chips">
                                {chips.map(([key, label]) => (
                                    <li key={key}>
                                        <button
                                            type="button"
                                            className="browse-chip"
                                            onClick={() => removeFilter(key)}
                                            aria-label={`Remove ${label} filter`}
                                        >
                                            {label}
                                            <span aria-hidden="true"> ×</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Product grid */}
                    {listings.length > 0 ? (
                        <div className="browse-grid">
                            {listings.map((listing, index) => (
                                <RevealCell key={listing.id} index={index}>
                                    <ProductCard listing={listing} />
                                </RevealCell>
                            ))}
                        </div>
                    ) : (
                        <div className="browse-empty" role="status">
                            <div
                                className="browse-empty-icon"
                                aria-hidden="true"
                            >
                                {hasFilter ? '⌕' : '◇'}
                            </div>

                            <h3 className="browse-empty-title">
                                {hasFilter
                                    ? 'No matching items found'
                                    : 'Nothing here just yet'}
                            </h3>

                            <p className="browse-empty-description">
                                {hasFilter
                                    ? 'Try a different keyword or remove some filters to discover more products.'
                                    : 'New products will appear here when sellers publish their listings.'}
                            </p>

                            {hasFilter && (
                                <button
                                    type="button"
                                    className="browse-empty-btn"
                                    onClick={resetFilters}
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default BrowsePage