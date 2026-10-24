/* ==========================================
   CSS isi file me (alag file ki zarurat nahi).
   Sab kuch .vt-footer ke andar scoped hai.
========================================== */
const css = `
.vt-footer {
    --vt-ink: #04201f;
    --vt-gold: #c9a24b;
    --vt-cream: #f3efe4;

    padding: 3.5rem 2rem 1.75rem;
    background: var(--vt-ink);
    border-top: 3px solid var(--vt-gold);
    color: var(--vt-cream);
    font-family: Calibri, 'Segoe UI', system-ui, sans-serif;
}

.vt-footer-inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 2.5rem 4rem;
    align-items: start;
    max-width: 1100px;
    margin: 0 auto;
}

.vt-footer .vt-logo {
    margin: 0;
    color: var(--vt-gold);
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: 2.1rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    line-height: 1.1;
}

.vt-footer .vt-tagline {
    margin: 0.6rem 0 0;
    color: var(--vt-cream);
    font-size: 1.05rem;
}

.vt-footer .vt-note {
    margin: 0;
    max-width: 34rem;
    color: #cfd8d3;
    font-size: 1rem;
    line-height: 1.7;
}

.vt-footer .vt-copy {
    max-width: 1100px;
    margin: 2.5rem auto 0;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(201, 162, 75, 0.35);
    color: #b9c6c0;
    font-size: 0.9rem;
}

@media (max-width: 760px) {
    .vt-footer {
        padding: 2.5rem 1.25rem 1.5rem;
    }

    .vt-footer-inner {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .vt-footer .vt-logo {
        font-size: 1.8rem;
    }

    .vt-footer .vt-copy {
        margin-top: 2rem;
    }
}
`

function Footer() {
    return (
        <footer className="vt-footer">
            <style>{css}</style>

            <div className="vt-footer-inner">
                <div>
                    <p className="vt-logo">Vintora</p>
                    <p className="vt-tagline">Vintage & collectibles · Made for India</p>
                </div>

                <p className="vt-note">
                    Buyers aur sellers enquiry ke zariye seedha baat karte hain. Vintora par abhi koi payment ya checkout nahi hai.
                </p>
            </div>

            <p className="vt-copy">© {new Date().getFullYear()} Vintora</p>
        </footer>
    )
}

export default Footer