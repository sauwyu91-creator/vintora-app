// Read data from localStorage
export const read = (key, fallback) => {
    try {
        const value = localStorage.getItem(key)

        if (value === null) {
            return fallback
        }

        return JSON.parse(value) ?? fallback
    } catch (error) {
        console.error(`Storage read error (${key}):`, error)
        return fallback
    }
}

// Write data to localStorage
export const write = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
    } catch (error) {
        console.error(`Storage write error (${key}):`, error)
        return false
    }
}

// Generate a unique ID
export const uid = () => {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// Resize an image and return a JPEG data URL
export const resizeImage = (file, max = 800) =>
    new Promise((resolve, reject) => {
        if (!(file instanceof Blob)) {
            reject(new Error('Valid image file select karo.'))
            return
        }

        if (!file.type.startsWith('image/')) {
            reject(new Error('Sirf image files upload kar sakte ho.'))
            return
        }

        const url = URL.createObjectURL(file)
        const img = new Image()

        img.onload = () => {
            try {
                if (!img.width || !img.height) {
                    throw new Error('Image dimensions invalid hain.')
                }

                const limit = Math.max(1, Number(max) || 800)
                const scale = Math.min(
                    1,
                    limit / Math.max(img.width, img.height)
                )

                const canvas = document.createElement('canvas')
                canvas.width = Math.max(1, Math.round(img.width * scale))
                canvas.height = Math.max(1, Math.round(img.height * scale))

                const context = canvas.getContext('2d')

                if (!context) {
                    throw new Error('Image resize nahi ho paayi.')
                }

                context.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )

                const resizedImage = canvas.toDataURL('image/jpeg', 0.7)

                resolve(resizedImage)
            } catch (error) {
                reject(error)
            } finally {
                URL.revokeObjectURL(url)
            }
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Image padh nahi paayi. Dusri image try karo.'))
        }

        img.src = url
    })