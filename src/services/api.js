const BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");
const API_URL = BASE.endsWith("/api") ? BASE : `${BASE}/api`;

export async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("vintora_token");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const response = await fetch(`${API_URL}${cleanPath}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(result.error || "Request fail ho gayi.");
        error.status = response.status;
        throw error;
    }

    return result;
}