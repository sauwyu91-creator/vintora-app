import { apiRequest } from './api.js'

const STATUS_FROM_API = {
    pending: 'Pending Review',
    published: 'Published',
    rejected: 'Rejected',
    removed: 'Removed',
}

const STATUS_TO_API = {
    'Pending Review': 'pending',
    Published: 'published',
    Rejected: 'rejected',
}

// image_data me JSON {"photos":[...], "cover":0} save hota hai.
// Purani single link / data URL bhi chal jati hai.
const parseImages = (raw) => {
    if (!raw) return { photos: [], cover: 0 }

    try {
        const data = JSON.parse(raw)

        if (Array.isArray(data)) {
            return { photos: data, cover: 0 }
        }

        if (data && Array.isArray(data.photos)) {
            return { photos: data.photos, cover: Number(data.cover) || 0 }
        }
    } catch {
        // JSON nahi hai, to single image link hai
    }

    return { photos: [raw], cover: 0 }
}

// Backend row -> frontend ka listing shape
export const fromApi = (row) => {
    const { photos, cover } = parseImages(row.image_data)

    return {
        id: row.id,
        title: row.title,
        category: row.category,
        subcategory: row.subcategory || '',
        city: row.city || '',
        state: row.state || '',
        condition: row.condition_name || '',
        approx_age: row.approx_age || '',
        brand: row.brand || '',
        description: row.description || '',
        provenance: row.provenance || '',
        availability: row.availability || '',
        contact_preference: row.contact_preference || '',
        price: row.price == null ? '' : Number(row.price),
        photos,
        cover,
        status: STATUS_FROM_API[row.status] || row.status,
        rejectReason: row.reject_reason || '',
        sellerId: row.seller_id,
        sellerName: row.seller_name || '',
        views: row.views || 0,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    }
}

// Frontend listing -> backend body
const toApi = (data) => ({
    title: data.title,
    category: data.category,
    subcategory: data.subcategory,
    city: data.city,
    state: data.state,
    condition_name: data.condition,
    approx_age: data.approx_age,
    brand: data.brand,
    description: data.description,
    provenance: data.provenance,
    availability: data.availability,
    contact_preference: data.contact_preference,
    price: data.price === '' ? 0 : Number(data.price),
    image_data: JSON.stringify({
        photos: data.photos || [],
        cover: data.cover || 0,
    }),
})

// Sabko dikhne wali (approved) listings
export const fetchPublished = async () => {
    const result = await apiRequest('/listings')
    return result.listings.map(fromApi)
}

// Seller ki apni listings (sab status)
export const fetchMine = async () => {
    const result = await apiRequest('/listings/mine')
    return result.listings.map(fromApi)
}

// Admin: review ke liye pending listings
export const fetchPending = async () => {
    const result = await apiRequest('/admin/listings/pending')
    return result.listings.map(fromApi)
}

// Ek published listing
export const fetchListing = async (id) => {
    const result = await apiRequest(`/listings/${id}`)
    return fromApi(result.listing)
}

export const createListing = (data) =>
    apiRequest('/listings', {
        method: 'POST',
        body: JSON.stringify(toApi(data)),
    })

export const editListing = (id, data) =>
    apiRequest(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(toApi(data)),
    })

export const removeListing = (id) =>
    apiRequest(`/listings/${id}`, { method: 'DELETE' })

// Admin: approve / reject
export const setListingStatus = (id, status, reason = '') =>
    apiRequest(`/admin/listings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: STATUS_TO_API[status] || status,
            reason,
        }),
    })