import { resizeImage } from './storage.js'

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD
const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET

// Photo Cloudinary pe upload karke uska https link deta hai.
// Agar Cloudinary ke variables set nahi hain, to chhoti photo
// (data URL) wapas deta hai, jo database me hi save hogi.
export async function uploadPhoto(file) {
    if (!CLOUD || !PRESET) {
        return resizeImage(file, 800)
    }

    const dataUrl = await resizeImage(file, 1400)

    const body = new FormData()
    body.append('file', dataUrl)
    body.append('upload_preset', PRESET)

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
        { method: 'POST', body }
    )

    const result = await response.json().catch(() => ({}))

    if (!response.ok || !result.secure_url) {
        throw new Error(
            result?.error?.message || 'Photo upload nahi ho paayi.'
        )
    }

    return result.secure_url
}

