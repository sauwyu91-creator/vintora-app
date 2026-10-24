import { read, write, uid } from './storage.js'

const KEY = 'vintora_enquiries'

const all = () => read(KEY, [])

// Send a new enquiry to the listing seller
export const sendEnquiry = ({ listing, buyer, message }) => {
    if (!listing?.id || !buyer?.id || !message?.trim()) {
        return {
            data: null,
            error: { message: 'Listing, buyer aur message zaroori hain.' }
        }
    }

    const list = all()

    const enquiry = {
        id: uid(),
        listingId: listing.id,
        listingTitle: listing.title || 'Untitled Listing',
        buyerId: buyer.id,
        buyerName: buyer.display_name || buyer.name || 'Buyer',
        sellerId: listing.sellerId,
        message: message.trim(),
        reply: '',
        date: Date.now(),
        status: 'New'
    }

    list.push(enquiry)

    const saved = write(KEY, list)

    if (!saved) {
        return {
            data: null,
            error: { message: 'Enquiry save nahi ho paayi. Storage check karo.' }
        }
    }

    return { data: enquiry, error: null }
}

// Get all enquiries sent by a buyer
export const getByBuyer = (id) => {
    return all()
        .filter((enquiry) => enquiry.buyerId === id)
        .sort((a, b) => (b.date || 0) - (a.date || 0))
}

// Get all enquiries received by a seller
export const getBySeller = (id) => {
    return all()
        .filter((enquiry) => enquiry.sellerId === id)
        .sort((a, b) => (b.date || 0) - (a.date || 0))
}

// Update an existing enquiry
const patch = (id, changes) => {
    const list = all()
    const index = list.findIndex((enquiry) => enquiry.id === id)

    if (index === -1) {
        return {
            data: null,
            error: { message: 'Enquiry nahi mili.' }
        }
    }

    list[index] = {
        ...list[index],
        ...changes,
        updatedAt: Date.now()
    }

    const saved = write(KEY, list)

    if (!saved) {
        return {
            data: null,
            error: { message: 'Enquiry update nahi ho paayi.' }
        }
    }

    return { data: list[index], error: null }
}

// Seller replies to a buyer's enquiry
export const replyTo = (id, reply) => {
    if (!reply?.trim()) {
        return {
            data: null,
            error: { message: 'Reply message khaali nahi ho sakta.' }
        }
    }

    return patch(id, {
        reply: reply.trim(),
        status: 'Replied'
    })
}

// Close an enquiry
export const closeEnquiry = (id) => {
    return patch(id, {
        status: 'Closed'
    })
}

// Reopen a closed enquiry
export const reopenEnquiry = (id) => {
    return patch(id, {
        status: 'New'
    })
}

// Get enquiry by ID
export const getEnquiry = (id) => {
    return all().find((enquiry) => enquiry.id === id) || null
}

// Get enquiry counts for a seller
export const getSellerEnquiryCounts = (sellerId) => {
    const enquiries = getBySeller(sellerId)

    return {
        total: enquiries.length,
        new: enquiries.filter((e) => e.status === 'New').length,
        replied: enquiries.filter((e) => e.status === 'Replied').length,
        closed: enquiries.filter((e) => e.status === 'Closed').length
    }
}

// Get enquiry counts for a buyer
export const getBuyerEnquiryCounts = (buyerId) => {
    const enquiries = getByBuyer(buyerId)

    return {
        total: enquiries.length,
        new: enquiries.filter((e) => e.status === 'New').length,
        replied: enquiries.filter((e) => e.status === 'Replied').length,
        closed: enquiries.filter((e) => e.status === 'Closed').length
    }
}

// Delete an enquiry
export const deleteEnquiry = (id) => {
    const list = all()
    const updatedList = list.filter((enquiry) => enquiry.id !== id)

    if (updatedList.length === list.length) {
        return {
            data: null,
            error: { message: 'Enquiry nahi mili.' }
        }
    }

    const saved = write(KEY, updatedList)

    if (!saved) {
        return {
            data: null,
            error: { message: 'Enquiry delete nahi ho paayi.' }
        }
    }

    return { data: true, error: null }
}