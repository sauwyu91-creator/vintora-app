import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import heroImg from '../assets/hero.png'

/* ==========================================
   CSS isi file me (alag file ki zarurat nahi).
   Sab kuch .vt-hero ke andar scoped hai.
========================================== */
const css = `
.vt-hero {
    --vt-ink: #04201f;
    --vt-teal: #0f3a3a;
    --vt-teal-soft: #1e5a57;
    --vt-gold: #c9a24b;
    --vt-cream: #f3efe4;

    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 4rem;
    align-items: center;
    min-height: min(88vh, 780px);
    padding: 4.5rem 2rem 5rem;
    overflow: hidden;
    color: var(--vt-cream);
    font-family: Calibri, 'Segoe UI', system-ui, sans-serif;
    background:
        radial-gradient(circle at 78% 45%, rgba(30, 90, 87, 0.55), transparent 55%),
        var(--vt-ink);
}

/* content ko max-width me rakhne ke liye */
.vt-hero > * {
    position: relative;
    width: 100%;
    max-width: 540px;
}

.vt-hero > .vt-copy {
    justify-self: end;
    max-width: 560px;
}

.vt-hero > .vt-frame {
    justify-self: start;
}

/* ---------- copy ---------- */
.vt-hero .vt-eyebrow {
    margin: 0 0 1.1rem;
    color: var(--vt-gold);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.vt-hero .vt-heading {
    margin: 0;
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: clamp(2.6rem, 6vw, 4.5rem);
    line-height: 1.05;
    font-weight: 700;
    color: var(--vt-cream);
}

.vt-hero .vt-heading em {
    color: var(--vt-gold);
    font-style: italic;
}

.vt-hero .vt-lead {
    margin: 1.5rem 0 0;
    color: #d6dfda;
    font-size: 1.15rem;
    line-height: 1.7;
}

.vt-hero .vt-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
    margin-top: 2rem;
}

/* ---------- buttons ---------- */
.vt-hero .vt-btn {
    position: relative;
    display: inline-block;
    padding: 0.85rem 1.6rem;
    overflow: hidden;
    border: 1.5px solid transparent;
    border-radius: 999px;
    font-size: 1.02rem;
    font-weight: 700;
    text-decoration: none;
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.vt-hero .vt-btn:hover {
    transform: translateY(-2px);
}

.vt-hero .vt-btn:focus-visible {
    outline: 3px solid rgba(243, 239, 228, 0.7);
    outline-offset: 3px;
}

.vt-hero .vt-btn-primary {
    background: var(--vt-gold);
    color: var(--vt-ink);
}

.vt-hero .vt-btn-primary:hover {
    background: #d8b560;
}

/* primary button par chamak ki patti */
.vt-hero .vt-btn-primary::after {
    content: '';
    position: absolute;
    top: 0;
    left: -70%;
    width: 40%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    transform: skewX(-20deg);
    pointer-events: none;
}

.vt-hero .vt-btn-primary:hover::after {
    animation: vtShine 0.75s ease;
}

.vt-hero .vt-btn-ghost {
    background: transparent;
    border-color: rgba(243, 239, 228, 0.55);
    color: var(--vt-cream);
}

.vt-hero .vt-btn-ghost:hover {
    background: var(--vt-cream);
    border-color: var(--vt-cream);
    color: var(--vt-ink);
}

/* ---------- photo frame ---------- */
.vt-hero .vt-frame {
    margin: 0;
}

.vt-hero .vt-photo {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(201, 162, 75, 0.7);
    border-radius: 16px;
    box-shadow: 0 22px 50px rgba(0, 0, 0, 0.45);
    aspect-ratio: 4 / 5;
    background: var(--vt-teal);
}

/* peeche thoda hata hua gold outline, frame jaisa ehsaas */
.vt-hero .vt-photo-wrap {
    position: relative;
}

.vt-hero .vt-photo-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    transform: translate(14px, 14px);
    border: 1.5px solid rgba(201, 162, 75, 0.55);
    border-radius: 16px;
    pointer-events: none;
}

.vt-hero .vt-photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: vtZoom 20s ease-in-out infinite alternate;
}

.vt-hero .vt-caption {
    margin-top: 1.6rem;
    color: #b9c6c0;
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: 0.98rem;
    font-style: italic;
}

/* ---------- motion: page khulte hi ek ke baad ek ---------- */
.vt-hero .vt-in {
    animation: vtRise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
    animation-delay: calc(var(--d, 0) * 1ms);
}

.vt-hero .vt-in-photo {
    animation: vtPhotoIn 1s 0.25s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}

@keyframes vtRise {
    from {
        opacity: 0;
        transform: translateY(22px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes vtPhotoIn {
    from {
        opacity: 0;
        transform: translateY(26px) scale(0.97);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes vtZoom {
    from {
        transform: scale(1);
    }
    to {
        transform: scale(1.07);
    }
}

@keyframes vtShine {
    from {
        left: -70%;
    }
    to {
        left: 140%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .vt-hero .vt-in,
    .vt-hero .vt-in-photo,
    .vt-hero .vt-photo img,
    .vt-hero .vt-btn-primary:hover::after {
        animation: none;
    }

    .vt-hero .vt-btn {
        transition: none;
    }

    .vt-hero .vt-btn:hover {
        transform: none;
    }
}

/* ---------- small screens ---------- */
@media (max-width: 860px) {
    .vt-hero {
        grid-template-columns: 1fr;
        gap: 3rem;
        min-height: 0;
        padding: 3rem 1.25rem 3.5rem;
    }

    .vt-hero > .vt-copy,
    .vt-hero > .vt-frame {
        justify-self: stretch;
        max-width: none;
    }

    .vt-hero .vt-photo {
        aspect-ratio: 16 / 11;
    }

    .vt-hero .vt-photo-wrap::before {
        transform: translate(8px, 8px);
    }
}
`

function Hero() {
    const { user } = useAuth()

    return (
        <section className="vt-hero" aria-labelledby="hero-heading">
            <style>{css}</style>

            <div className="vt-copy">
                <p className="vt-eyebrow vt-in" style={{ '--d': 50 }}>Vintage marketplace · India</p>
                <h1 id="hero-heading" className="vt-heading vt-in" style={{ '--d': 150 }}>
                    Find the <em>story</em> behind every find.
                </h1>
                <p className="vt-lead vt-in" style={{ '--d': 300 }}>
                    Retro tech that still works, coins with a past, furniture with
                    character. Vintora is a quiet catalogue of objects with a story —
                    listed by sellers and collectors across India.
                </p>
                <div className="vt-actions vt-in" style={{ '--d': 450 }}>
                    <a className="vt-btn vt-btn-primary" href="#browse">
                        Browse the collection
                    </a>
                    {!user && (
                        <Link className="vt-btn vt-btn-ghost" to="/signup">
                            Become a seller
                        </Link>
                    )}
                    {user?.role === 'seller' && (
                        <Link className="vt-btn vt-btn-ghost" to="/seller/add">
                            Add a listing
                        </Link>
                    )}
                </div>
            </div>

            <figure className="vt-frame vt-in-photo">
                <div className="vt-photo-wrap">
                    <div className="vt-photo">
                        <img
                            src={heroImg}
                            alt="Vintage objects, the kind of finds Vintora is built around"
                        />
                    </div>
                </div>
                <figcaption className="vt-caption">Est. 2026 · Vintage finds from across India</figcaption>
            </figure>
        </section>
    )
}

export default Hero