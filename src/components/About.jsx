import { useEffect, useRef, useState } from 'react'
import { getPublished } from '../services/listings.js'

/* ==========================================
   CSS isi file me (alag file ki zarurat nahi).
   Sab kuch .vt-about ke andar scoped hai, to baaki page se takrayega nahi.
========================================== */
const css = `
.vt-about {
    --vt-ink: #04201f;
    --vt-teal: #0f3a3a;
    --vt-teal-soft: #1e5a57;
    --vt-gold: #c9a24b;
    --vt-copper: #9a5b16;
    --vt-cream: #f3efe4;

    padding: 5rem 2rem;
    scroll-margin-top: 4rem;
    background: var(--vt-cream);
    color: var(--vt-ink);
    font-family: Calibri, 'Segoe UI', system-ui, sans-serif;
}

.vt-about-inner {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 4rem;
    align-items: center;
    max-width: 1100px;
    margin: 0 auto;
}

/* ---------- text column ---------- */
.vt-about .vt-eyebrow {
    margin: 0 0 0.9rem;
    color: var(--vt-copper);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.vt-about .vt-title {
    margin: 0 0 1.5rem;
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: clamp(2rem, 4.2vw, 3.1rem);
    line-height: 1.12;
    font-weight: 700;
    color: var(--vt-ink);
}

.vt-about .vt-lede {
    margin: 0 0 1.1rem;
    max-width: 36rem;
    color: #1d3a38;
    font-size: 1.1rem;
    line-height: 1.7;
}

/* ---------- stats panel ---------- */
.vt-about .vt-stats {
    list-style: none;
    margin: 0;
    padding: 0.5rem 2rem;
    background: var(--vt-teal);
    border-radius: 18px;
    box-shadow: 0 14px 34px rgba(4, 32, 31, 0.22);
}

.vt-about .vt-stats li {
    display: grid;
    grid-template-columns: minmax(4.5rem, auto) 1fr;
    column-gap: 1.5rem;
    align-items: center;
    padding: 1.4rem 0;
    border-bottom: 1px solid rgba(201, 162, 75, 0.35);
}

.vt-about .vt-stats li:last-child {
    border-bottom: none;
}

.vt-about .vt-stats strong {
    color: var(--vt-gold);
    font-family: Cambria, Georgia, 'Times New Roman', serif;
    font-size: 3.4rem;
    line-height: 1;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.vt-about .vt-stat-label {
    display: block;
    color: var(--vt-cream);
    font-size: 1.2rem;
    font-weight: 700;
}

.vt-about .vt-stat-note {
    margin: 0.2rem 0 0;
    color: #cfd8d3;
    font-size: 0.97rem;
    line-height: 1.5;
}

/* screen-reader only */
.vt-about .vt-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* ---------- motion: screen par aate hi upar uthke aata hai ---------- */
.vt-about [data-r] {
    opacity: 0;
}

.vt-about.is-in [data-r] {
    opacity: 1;
    animation: vtRise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
    animation-delay: calc(var(--d, 0) * 1ms);
}

@keyframes vtRise {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .vt-about [data-r] {
        opacity: 1;
    }

    .vt-about.is-in [data-r] {
        animation: none;
    }
}

/* ---------- small screens ---------- */
@media (max-width: 860px) {
    .vt-about {
        padding: 3.5rem 1.25rem;
    }

    .vt-about-inner {
        grid-template-columns: 1fr;
        gap: 2.5rem;
    }

    .vt-about .vt-stats {
        padding: 0.25rem 1.25rem;
    }

    .vt-about .vt-stats strong {
        font-size: 2.8rem;
    }
}
`

/* Element screen par aaye to true ho jata hai */
const useInView = (threshold = 0.2) => {
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
        { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return [ref, seen]
}

/* Number 0 se value tak ginti karta hai (jab screen par dikhe) */
const CountUp = ({ value }) => {
  const ref = useRef(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!el || reduce || value === 0 || typeof IntersectionObserver === 'undefined') {
      setN(value)
      return undefined
    }

    let raf
    let io

    const run = () => {
      const start = performance.now()
      const duration = 1000
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1)
        setN(Math.round(value * (1 - Math.pow(1 - t, 3))))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            io.disconnect()
            run()
          }
        },
        { threshold: 0.4 }
    )
    io.observe(el)

    return () => {
      if (io) io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
      <>
        <span ref={ref} aria-hidden="true">{n}</span>
        <span className="vt-sr">{value}</span>
      </>
  )
}

function About() {
  const published = getPublished()
  const cities = new Set(published.map((l) => l.city).filter(Boolean)).size
  const categories = new Set(published.map((l) => l.category).filter(Boolean)).size

  const [sectionRef, seen] = useInView(0.2)

  return (
      <section id="about" ref={sectionRef} className={`vt-about${seen ? ' is-in' : ''}`}>
        <style>{css}</style>

        <div className="vt-about-inner">
          <div>
            <p className="vt-eyebrow" data-r style={{ '--d': 0 }}>About</p>
            <h2 className="vt-title" data-r style={{ '--d': 100 }}>
              Objects with provenance, not just patina.
            </h2>
            <p className="vt-lede" data-r style={{ '--d': 200 }}>
              Vintora began as a notebook of finds from Sunday markets in Delhi
              and family cupboards in Kochi. We now believe a second life for
              well-made things is more interesting than another new thing.
            </p>
            <p className="vt-lede" data-r style={{ '--d': 300 }}>
              Every listing on Vintora is a piece worth a second life:
              repairable, documented, and honest about its age. Sellers add the
              story first — city, year, and how the object arrived in their
              care. Buyers connect with sellers through enquiries.
            </p>
          </div>

          <ul className="vt-stats">
            <li data-r style={{ '--d': 250 }}>
              <strong><CountUp value={published.length} /></strong>
              <div>
                <span className="vt-stat-label">Live finds</span>
                <p className="vt-stat-note">Reviewed before they go live</p>
              </div>
            </li>
            <li data-r style={{ '--d': 400 }}>
              <strong><CountUp value={categories} /></strong>
              <div>
                <span className="vt-stat-label">Categories</span>
                <p className="vt-stat-note">From coins to classic wheels</p>
              </div>
            </li>
            <li data-r style={{ '--d': 550 }}>
              <strong><CountUp value={cities} /></strong>
              <div>
                <span className="vt-stat-label">Cities</span>
                <p className="vt-stat-note">Sellers across India</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
  )
}

export default About