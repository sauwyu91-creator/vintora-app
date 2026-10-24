import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/* ==========================================
   CSS isi file me (alag file ki zarurat nahi).
   Sab kuch .vt-nav ke andar scoped hai.
========================================== */
const css = `
.vt-nav {
    --vt-ink: #04201f;
    --vt-teal: #0f3a3a;
    --vt-gold: #c9a24b;
    --vt-cream: #f3efe4;

    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(4, 32, 31, 0.94);
    border-bottom: 1px solid rgba(201, 162, 75, 0.45);
    color: var(--vt-cream);
    font-family: Calibri, 'Segoe UI', system-ui, sans-serif;
    animation: vtNavIn 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}

@supports (backdrop-filter: blur(8px)) {
    .vt-nav {
        background: rgba(4, 32, 31, 0.86);
        backdrop-filter: blur(10px);
    }
}

.vt-nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.85rem 2rem;
}

/* ---------- brand ---------- */
.vt-nav .vt-brand {
    color: var(--vt-gold);
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: 1.45rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
}

/* ---------- links ---------- */
.vt-nav .vt-links {
    display: flex;
    align-items: center;
    gap: 1.6rem;
}

.vt-nav .vt-link {
    position: relative;
    padding: 0.3rem 0;
    color: var(--vt-cream);
    font-size: 1.02rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
}

/* gold underline: hover par aati hai, active page par ruki rehti hai */
.vt-nav .vt-link::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 2px;
    background: var(--vt-gold);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.vt-nav .vt-link:hover::after,
.vt-nav .vt-link.is-active::after {
    transform: scaleX(1);
}

.vt-nav .vt-link.is-active {
    color: var(--vt-gold);
}

/* ---------- buttons ---------- */
.vt-nav .vt-cta,
.vt-nav .vt-logout {
    display: inline-block;
    padding: 0.5rem 1.15rem;
    border: 1.5px solid var(--vt-gold);
    border-radius: 999px;
    font: inherit;
    font-size: 0.98rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.vt-nav .vt-cta {
    background: var(--vt-gold);
    color: var(--vt-ink);
}

.vt-nav .vt-cta:hover {
    background: #d8b560;
    transform: translateY(-1px);
}

.vt-nav .vt-logout {
    max-width: 17rem;
    overflow: hidden;
    text-overflow: ellipsis;
    background: transparent;
    color: var(--vt-cream);
}

.vt-nav .vt-logout:hover {
    background: var(--vt-cream);
    border-color: var(--vt-cream);
    color: var(--vt-ink);
    transform: translateY(-1px);
}

.vt-nav .vt-brand:focus-visible,
.vt-nav .vt-link:focus-visible,
.vt-nav .vt-cta:focus-visible,
.vt-nav .vt-logout:focus-visible,
.vt-nav .vt-burger:focus-visible {
    outline: 2px solid var(--vt-cream);
    outline-offset: 4px;
    border-radius: 4px;
}

/* ---------- hamburger (sirf mobile) ---------- */
.vt-nav .vt-burger {
    display: none;
    position: relative;
    width: 42px;
    height: 42px;
    padding: 0;
    background: transparent;
    border: 1.5px solid rgba(201, 162, 75, 0.6);
    border-radius: 10px;
    cursor: pointer;
}

.vt-nav .vt-burger span {
    position: absolute;
    left: 10px;
    right: 10px;
    height: 2px;
    background: var(--vt-cream);
    border-radius: 2px;
    transition: transform 0.28s ease, opacity 0.2s ease, top 0.28s ease;
}

.vt-nav .vt-burger span:nth-child(1) { top: 13px; }
.vt-nav .vt-burger span:nth-child(2) { top: 19px; }
.vt-nav .vt-burger span:nth-child(3) { top: 25px; }

.vt-nav .vt-burger.is-open span:nth-child(1) { top: 19px; transform: rotate(45deg); }
.vt-nav .vt-burger.is-open span:nth-child(2) { opacity: 0; }
.vt-nav .vt-burger.is-open span:nth-child(3) { top: 19px; transform: rotate(-45deg); }

@keyframes vtNavIn {
    from {
        opacity: 0;
        transform: translateY(-100%);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes vtDrop {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .vt-nav,
    .vt-nav .vt-links.is-open {
        animation: none;
    }

    .vt-nav .vt-link::after,
    .vt-nav .vt-cta,
    .vt-nav .vt-logout,
    .vt-nav .vt-burger span {
        transition: none;
    }
}

/* ---------- mobile ---------- */
@media (max-width: 860px) {
    .vt-nav-inner {
        flex-wrap: wrap;
        padding: 0.7rem 1.25rem;
    }

    .vt-nav .vt-burger {
        display: block;
    }

    .vt-nav .vt-links {
        display: none;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        width: 100%;
        padding: 0.5rem 0 0.9rem;
    }

    .vt-nav .vt-links.is-open {
        display: flex;
        animation: vtDrop 0.25s ease;
    }

    .vt-nav .vt-link {
        padding: 0.85rem 0;
        border-bottom: 1px solid rgba(201, 162, 75, 0.2);
    }

    .vt-nav .vt-link::after {
        display: none;
    }

    .vt-nav .vt-cta,
    .vt-nav .vt-logout {
        margin-top: 0.9rem;
        text-align: center;
        max-width: none;
    }
}
`

const linkClass = ({ isActive }) => `vt-link${isActive ? ' is-active' : ''}`

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const close = () => setOpen(false)

    const handleLogout = async () => {
        await logout()
        close()
        navigate('/')
    }

    return (
        <nav className="vt-nav" aria-label="Main">
            <style>{css}</style>

            <div className="vt-nav-inner">
                <Link to="/" className="vt-brand" onClick={close}>Vintora</Link>

                <button
                    type="button"
                    className={`vt-burger${open ? ' is-open' : ''}`}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    aria-controls="vt-links"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div id="vt-links" className={`vt-links${open ? ' is-open' : ''}`}>
                    {user?.role === 'buyer' && <NavLink to="/buyer/home" className={linkClass} onClick={close}>Home</NavLink>}
                    <NavLink to="/" end className={linkClass} onClick={close}>Browse</NavLink>
                    {user?.role === 'buyer' && (
                        <>
                            <NavLink to="/wishlist" className={linkClass} onClick={close}>Wishlist</NavLink>
                            <NavLink to="/my-enquiries" className={linkClass} onClick={close}>My Enquiries</NavLink>
                        </>
                    )}
                    {user?.role === 'seller' && (
                        <>
                            <NavLink to="/seller/add" className={linkClass} onClick={close}>Add Listing</NavLink>
                            <NavLink to="/seller/listings" className={linkClass} onClick={close}>My Listings</NavLink>
                            <NavLink to="/seller/enquiries" className={linkClass} onClick={close}>Enquiries</NavLink>
                        </>
                    )}
                    {user?.role === 'admin' && <NavLink to="/admin" className={linkClass} onClick={close}>Admin</NavLink>}
                    {user ? (
                        <button className="vt-logout" onClick={handleLogout}>
                            Logout ({user.display_name})
                        </button>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkClass} onClick={close}>Login</NavLink>
                            <Link to="/signup" className="vt-cta" onClick={close}>Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar