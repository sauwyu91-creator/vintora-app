import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { CATEGORIES, CONDITIONS } from '../services/listings.js'
import {
    fetchMine,
    createListing,
    editListing,
} from '../services/listingsApi.js'
import { uploadPhoto } from '../services/cloudinary.js'
import './AddListing.css'

const MAX_PHOTOS = 6

const emptyForm = {
    title: '',
    category: '',
    subcategory: '',
    city: '',
    state: '',
    condition: '',
    approx_age: '',
    brand: '',
    description: '',
    provenance: '',
    availability: 'Available',
    contact_preference: 'In-app enquiry',
    price: '',
}

const AddListing = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const fileRef = useRef(null)

    const [existing, setExisting] = useState(null)
    const [loadingExisting, setLoadingExisting] = useState(Boolean(id))
    const [form, setForm] = useState({ ...emptyForm })
    const [photos, setPhotos] = useState([])
    const [cover, setCover] = useState(0)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    // Edit mode: apni listing backend se laao
    useEffect(() => {
        if (!id) return undefined

        let active = true

        fetchMine()
            .then((list) => {
                if (!active) return

                const found =
                    list.find((l) => String(l.id) === String(id)) || null

                setExisting(found)

                if (found) {
                    const { photos: p, cover: c, ...rest } = found

                    setForm({
                        ...emptyForm,
                        ...rest,
                        price:
                            rest.price === '' || rest.price == null
                                ? ''
                                : String(rest.price),
                    })
                    setPhotos(p || [])
                    setCover(c || 0)
                }
            })
            .catch(() => {})
            .finally(() => {
                if (active) setLoadingExisting(false)
            })

        return () => {
            active = false
        }
    }, [id])

    const notMine = Boolean(
        id &&
        !loadingExisting &&
        (!existing || !user || existing.sellerId !== user.id)
    )

    const change = (e) => {
        const { name, value } = e.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const addPhotos = async (e) => {
        const files = Array.from(e.target.files || [])
        e.target.value = ''

        if (!files.length) return

        const remaining = MAX_PHOTOS - photos.length

        if (remaining <= 0) {
            setError(`Maximum ${MAX_PHOTOS} photos hi add kar sakte ho.`)
            return
        }

        const valid = files.filter((file) =>
            file.type.startsWith('image/')
        )

        const selected = valid.slice(0, remaining)

        if (valid.length !== files.length) {
            setError(
                'Kuch files images nahi hain. Sirf image files upload karo.'
            )
        } else if (valid.length > remaining) {
            setError(`Maximum ${MAX_PHOTOS} photos allowed hain.`)
        } else {
            setError('')
        }

        if (!selected.length) return

        setBusy(true)

        try {
            const urls = await Promise.all(
                selected.map((file) => uploadPhoto(file))
            )

            setPhotos((current) =>
                [...current, ...urls].slice(0, MAX_PHOTOS)
            )
        } catch (err) {
            setError(
                err?.message ||
                'Photos upload nahi ho sakin. Dobara try karo.'
            )
        } finally {
            setBusy(false)
        }
    }

    const removePhoto = (index) => {
        setPhotos((current) =>
            current.filter((_, i) => i !== index)
        )

        setCover((currentCover) => {
            if (index === currentCover) return 0
            if (index < currentCover) return currentCover - 1
            return currentCover
        })
    }

    const save = async () => {
        setError('')

        if (!user) {
            setError('Listing save karne ke liye login karo.')
            return
        }

        if (notMine) {
            setError('Is listing ko edit karne ki permission nahi hai.')
            return
        }

        if (busy) {
            setError('Photos upload hone ka wait karo.')
            return
        }

        const required = [
            'title',
            'category',
            'city',
            'state',
            'condition',
            'description',
        ]

        const missing = required.filter(
            (key) => !String(form[key] || '').trim()
        )

        if (missing.length) {
            setError(
                `Ye fields bharna zaroori hai: ${missing.join(', ')}`
            )
            return
        }

        if (
            form.price === '' ||
            !Number.isFinite(Number(form.price)) ||
            Number(form.price) < 0
        ) {
            setError('Please ek valid price enter karo.')
            return
        }

        if (!photos.length) {
            setError('Kam se kam 1 photo upload karo.')
            return
        }

        const listingData = {
            ...form,
            price: Number(form.price),
            photos,
            cover: Math.min(cover, photos.length - 1),
        }

        setBusy(true)

        try {
            if (id) {
                await editListing(id, listingData)
            } else {
                await createListing(listingData)
            }

            navigate('/seller/listings')
        } catch (err) {
            setError(err?.message || 'Listing save nahi ho saki.')
        } finally {
            setBusy(false)
        }
    }

    if (loadingExisting) {
        return (
            <main className="add-listing-page">
                <p style={{ padding: 40 }}>Listing load ho rahi hai...</p>
            </main>
        )
    }

    if (notMine) {
        return (
            <main className="add-listing-page">
                <section className="listing-access-error">
                    <div className="listing-error-icon" aria-hidden="true">
                        !
                    </div>

                    <h2>Listing access nahi hai</h2>

                    <p>
                        Ye listing nahi mili ya ye aapke account ki
                        listing nahi hai.
                    </p>

                    <button
                        type="button"
                        className="listing-btn listing-btn--primary"
                        onClick={() => navigate('/seller/listings')}
                    >
                        My Listings par jao
                    </button>
                </section>
            </main>
        )
    }

    return (
        <main className="add-listing-page">
            <div className="add-listing-container">
                <header className="add-listing-header">
                    <div>
                        <p className="listing-eyebrow">
                            VINTORA SELLER STUDIO
                        </p>

                        <h1>
                            {id ? 'Edit your listing' : 'Create a listing'}
                        </h1>

                        <p className="listing-header-description">
                            Apni special item ki details add karo aur use
                            naye owner tak pahunchane ki shuruaat karo.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="listing-btn listing-btn--outline"
                        onClick={() => navigate('/seller/listings')}
                    >
                        <span aria-hidden="true">←</span> Back to listings
                    </button>
                </header>

                <form
                    className="listing-form"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <section className="listing-section">
                        <div className="listing-section-heading">
                            <span className="listing-section-number">01</span>

                            <div>
                                <h2>Item details</h2>
                                <p>
                                    Buyers ko apni item ke baare mein batao.
                                </p>
                            </div>
                        </div>

                        <div className="listing-fields">
                            <div className="listing-field listing-field--full">
                                <label htmlFor="listing-title">
                                    Listing title *
                                </label>

                                <input
                                    id="listing-title"
                                    name="title"
                                    value={form.title}
                                    onChange={change}
                                    placeholder="e.g. Vintage teakwood writing desk"
                                    required
                                    maxLength={120}
                                />
                            </div>

                            <div className="listing-field">
                                <label htmlFor="listing-price">
                                    Price (₹) *
                                </label>

                                <input
                                    id="listing-price"
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={change}
                                    placeholder="e.g. 5000"
                                    min="0"
                                    step="1"
                                    required
                                />

                                <small>
                                    Item ki price Indian Rupees mein enter karein.
                                </small>
                            </div>

                            <div className="listing-field">
                                <label htmlFor="listing-category">
                                    Category *
                                </label>

                                <select
                                    id="listing-category"
                                    name="category"
                                    value={form.category}
                                    onChange={change}
                                    required
                                >
                                    <option value="">Select category</option>

                                    {CATEGORIES.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="listing-field">
                                <label htmlFor="listing-subcategory">
                                    Subcategory <span>(optional)</span>
                                </label>

                                <input
                                    id="listing-subcategory"
                                    name="subcategory"
                                    value={form.subcategory}
                                    onChange={change}
                                    placeholder="e.g. Writing desk"
                                />
                            </div>

                            <div className="listing-field">
                                <label htmlFor="listing-condition">
                                    Condition *
                                </label>

                                <select
                                    id="listing-condition"
                                    name="condition"
                                    value={form.condition}
                                    onChange={change}
                                    required
                                >
                                    <option value="">Select condition</option>

                                    {CONDITIONS.map((condition) => (
                                        <option
                                            key={condition}
                                            value={condition}
                                        >
                                            {condition}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="listing-field">
                                <label htmlFor="listing-age">
                                    Approx. age / year <span>(optional)</span>
                                </label>

                                <input
                                    id="listing-age"
                                    name="approx_age"
                                    value={form.approx_age}
                                    onChange={change}
                                    placeholder="e.g. 1975"
                                />
                            </div>

                            <div className="listing-field listing-field--full">
                                <label htmlFor="listing-brand">
                                    Brand / maker <span>(optional)</span>
                                </label>

                                <input
                                    id="listing-brand"
                                    name="brand"
                                    value={form.brand}
                                    onChange={change}
                                    placeholder="Brand, artist or maker's name"
                                />
                            </div>

                            <div className="listing-field listing-field--full">
                                <label htmlFor="listing-description">
                                    Description *
                                </label>

                                <textarea
                                    id="listing-description"
                                    name="description"
                                    value={form.description}
                                    onChange={change}
                                    rows={5}
                                    placeholder="Describe the item's details, materials, features and condition..."
                                    required
                                />
                            </div>

                            <div className="listing-field listing-field--full">
                                <label htmlFor="listing-provenance">
                                    Item history / provenance{' '}
                                    <span>(optional)</span>
                                </label>

                                <textarea
                                    id="listing-provenance"
                                    name="provenance"
                                    value={form.provenance}
                                    onChange={change}
                                    rows={3}
                                    placeholder="Share any known history, origin or background..."
                                />
                            </div>
                        </div>
                    </section>

                    <section className="listing-section">
                        <div className="listing-section-heading">
                            <span className="listing-section-number">02</span>

                            <div>
                                <h2>Location</h2>
                                <p>Item kahan available hai?</p>
                            </div>
                        </div>

                        <div className="listing-fields">
                            <div className="listing-field">
                                <label htmlFor="listing-city">City *</label>

                                <input
                                    id="listing-city"
                                    name="city"
                                    value={form.city}
                                    onChange={change}
                                    placeholder="Enter city"
                                    required
                                />
                            </div>

                            <div className="listing-field">
                                <label htmlFor="listing-state">State *</label>

                                <input
                                    id="listing-state"
                                    name="state"
                                    value={form.state}
                                    onChange={change}
                                    placeholder="Enter state"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <section className="listing-section">
                        <div className="listing-section-heading">
                            <span className="listing-section-number">03</span>

                            <div>
                                <h2>Item photos</h2>
                                <p>
                                    Clear photos buyers ko item samajhne mein
                                    help karti hain.
                                </p>
                            </div>
                        </div>

                        <div className="listing-upload-box">
                            <div
                                className="listing-upload-icon"
                                aria-hidden="true"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="30"
                                    height="30"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                >
                                    <rect
                                        x="3"
                                        y="4"
                                        width="18"
                                        height="16"
                                        rx="2"
                                    />
                                    <circle cx="8.5" cy="9" r="1.5" />
                                    <path d="m21 15-5-5L5 20" />
                                </svg>
                            </div>

                            <h3>Add your item photos</h3>

                            <p>
                                JPG, PNG, WebP ya doosri supported image files.
                                Maximum {MAX_PHOTOS} photos.
                            </p>

                            <input
                                ref={fileRef}
                                className="listing-file-input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={addPhotos}
                                aria-label="Choose listing photos"
                            />

                            <button
                                type="button"
                                className="listing-btn listing-btn--outline"
                                onClick={() => fileRef.current?.click()}
                                disabled={busy || photos.length >= MAX_PHOTOS}
                            >
                                {busy ? 'Uploading...' : 'Browse photos'}
                            </button>

                            <span className="listing-photo-count">
                                {photos.length} / {MAX_PHOTOS} photos added
                            </span>
                        </div>

                        {photos.length > 0 && (
                            <div className="listing-photo-area">
                                <div className="listing-photo-heading">
                                    <div>
                                        <h3>Photo preview</h3>
                                        <p>
                                            Photo select karke cover image set
                                            karo.
                                        </p>
                                    </div>

                                    <span className="listing-photo-hint">
                                        Cover photo
                                    </span>
                                </div>

                                <div className="listing-photo-grid">
                                    {photos.map((photo, index) => (
                                        <div
                                            key={`${photo}-${index}`}
                                            className={`listing-photo-card ${
                                                index === cover ? 'is-cover' : ''
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                className="listing-photo-select"
                                                onClick={() => setCover(index)}
                                                aria-label={`Set photo ${index + 1} as cover`}
                                                aria-pressed={index === cover}
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`Listing preview ${index + 1}`}
                                                />

                                                {index === cover && (
                                                    <span className="listing-cover-badge">
                                                        <span aria-hidden="true">
                                                            ✓
                                                        </span>{' '}
                                                        Cover photo
                                                    </span>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="listing-photo-remove"
                                                onClick={() => removePhoto(index)}
                                                aria-label={`Remove photo ${index + 1}`}
                                                title="Remove photo"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="listing-section">
                        <div className="listing-section-heading">
                            <span className="listing-section-number">04</span>

                            <div>
                                <h2>Availability & contact</h2>
                                <p>
                                    Buyer ko batao ki item available hai ya
                                    nahi.
                                </p>
                            </div>
                        </div>

                        <div className="listing-fields">
                            <div className="listing-field">
                                <label htmlFor="listing-availability">
                                    Availability
                                </label>

                                <select
                                    id="listing-availability"
                                    name="availability"
                                    value={form.availability}
                                    onChange={change}
                                >
                                    <option value="Available">Available</option>
                                    <option value="Unavailable">
                                        Unavailable
                                    </option>
                                </select>
                            </div>

                            <div className="listing-field">
                                <label htmlFor="listing-contact">
                                    Contact preference
                                </label>

                                <select
                                    id="listing-contact"
                                    name="contact_preference"
                                    value={form.contact_preference}
                                    onChange={change}
                                >
                                    <option value="In-app enquiry">
                                        In-app enquiry
                                    </option>
                                    <option value="Email">Email</option>
                                    <option value="Phone">Phone</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div
                            className="listing-error-message"
                            role="alert"
                        >
                            <span aria-hidden="true">!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <footer className="listing-form-footer">
                        <div className="listing-footer-note">
                            <span aria-hidden="true">✦</span>
                            <p>
                                Review se pehle apni details ek baar check kar
                                lo.
                            </p>
                        </div>

                        <div className="listing-form-actions">
                            <button
                                type="button"
                                className="listing-btn listing-btn--primary"
                                onClick={save}
                                disabled={busy}
                            >
                                {busy ? 'Please wait...' : 'Submit for review'}{' '}
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </main>
    )
}

export default AddListing