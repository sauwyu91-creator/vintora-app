
import { read, write, uid } from './storage.js'

const K = {
    listings: 'vintora_listings',
    wish: 'vintora_wishlist',
    reports: 'vintora_reports',
    audit: 'vintora_audit',
}

/* ---------- Categories & Conditions ---------- */

export const CATEGORIES = [
    'Cars & Bikes',
    'Coins & Currency',
    'Retro Technology',
    'Fashion & Jewellery',
    'Furniture & Decor',
    'Art & Books',
    'Toys & Collectibles',
    'Antiques & Heritage',
    'Other',
]

export const CONDITIONS = [
    'Mint',
    'Excellent',
    'Good',
    'Fair',
    'Needs Restoration',
]

/* ---------- Listings ---------- */

export const getAllListings = () =>
    read(K.listings, [])

export const getListing = (id) =>
    getAllListings().find((listing) => listing.id === id) || null

export const getPublished = () =>
    getAllListings()
        .filter((listing) => listing.status === 'Published')
        .sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        )

export const getPending = () =>
    getAllListings().filter(
        (listing) => listing.status === 'Pending Review'
    )

export const getBySeller = (sellerId) =>
    getAllListings()
        .filter((listing) => listing.sellerId === sellerId)
        .sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        )

// MyListings.jsx ke liye
export const getListingsBySeller = (sellerId) =>
    getBySeller(sellerId)

// Listing save ya update
export const saveListing = (data) => {
    const all = getAllListings()

    const index = data.id
        ? all.findIndex((listing) => listing.id === data.id)
        : -1

    let item

    if (index === -1) {
        item = {
            views: 0,
            createdAt: Date.now(),
            ...data,
            id: uid(),
        }

        all.push(item)
    } else {
        item = {
            ...all[index],
            ...data,
            id: all[index].id,
        }

        all[index] = item
    }

    const success = write(K.listings, all)

    if (!success) {
        return {
            data: null,
            error: {
                message:
                    'Browser storage bhar gaya. Photos kam ya chhoti karo.',
            },
        }
    }

    return {
        data: item,
        error: null,
    }
}

// Existing listing update
export const updateListing = (id, patch) => {
    const existing = getListing(id)

    if (!existing) {
        return {
            data: null,
            error: {
                message: 'Listing nahi mili.',
            },
        }
    }

    return saveListing({
        ...patch,
        id,
    })
}

// Listing delete
export const deleteListing = (id) => {
    const all = getAllListings()

    const updated = all.filter(
        (listing) => listing.id !== id
    )

    if (updated.length === all.length) {
        return {
            data: null,
            error: {
                message: 'Listing nahi mili.',
            },
        }
    }

    const success = write(K.listings, updated)

    if (!success) {
        return {
            data: null,
            error: {
                message: 'Listing delete nahi ho saki.',
            },
        }
    }

    return {
        data: true,
        error: null,
    }
}

// Listing views count
export const addView = (id) => {
    const all = getAllListings()

    const listing = all.find(
        (item) => item.id === id
    )

    if (!listing) return

    listing.views = (listing.views || 0) + 1

    write(K.listings, all)
}

/* ---------- Wishlist ---------- */

const wishAll = () =>
    read(K.wish, {})

export const getWishlistIds = (userId) =>
    wishAll()[userId] || []

export const isWishlisted = (userId, listingId) =>
    getWishlistIds(userId).includes(listingId)

export const toggleWishlist = (userId, listingId) => {
    const all = wishAll()
    const list = all[userId] || []

    const has = list.includes(listingId)

    all[userId] = has
        ? list.filter((id) => id !== listingId)
        : [...list, listingId]

    write(K.wish, all)

    // true = wishlist mein add hua
    // false = wishlist se remove hua
    return !has
}

/* ---------- Reports ---------- */

export const getReports = () =>
    read(K.reports, []).sort(
        (a, b) => (b.date || 0) - (a.date || 0)
    )

export const addReport = ({
                              listingId,
                              listingTitle,
                              reporterId,
                              reason,
                          }) => {
    const all = read(K.reports, [])

    all.push({
        id: uid(),
        listingId,
        listingTitle,
        reporterId,
        reason,
        date: Date.now(),
        status: 'Open',
    })

    return write(K.reports, all)
}

export const closeReport = (id) => {
    const all = read(K.reports, [])

    const report = all.find(
        (item) => item.id === id
    )

    if (!report) return false

    report.status = 'Closed'

    return write(K.reports, all)
}

/* ---------- Audit Log ---------- */

export const getAudit = () =>
    read(K.audit, []).sort(
        (a, b) => (b.date || 0) - (a.date || 0)
    )

export const addAudit = ({
                             admin,
                             action,
                             target,
                             reason,
                         }) => {
    const all = read(K.audit, [])

    all.push({
        id: uid(),
        admin,
        action,
        target,
        reason: reason || '-',
        date: Date.now(),
    })

    return write(K.audit, all)
}
