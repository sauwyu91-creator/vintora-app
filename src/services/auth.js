import { apiRequest } from "./api.js";

const TOKEN_KEY = "vintora_token";
const USER_KEY = "vintora_user";

const notify = () => {
    window.dispatchEvent(new Event("vintora-auth"));
};

const saveSession = (user, token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    notify();
};

const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notify();
};

const getError = (error, fallback) => ({
    message: error?.message || fallback,
});

// ---------- Validation helpers ----------

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// +91, spaces, dashes hata kar sirf 10 digit rakhta hai
const normalizePhone = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits;
};

// Indian mobile number: 10 digit, 6-9 se shuru
const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

// SIGNUP  (order: email, password, phone, role)
export const signup = async (email, password, phone, role = "buyer") => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedEmail || !password || !normalizedPhone) {
        return {
            data: null,
            error: { message: "Email, password aur phone number teeno daalo." },
        };
    }

    if (!isValidEmail(normalizedEmail)) {
        return {
            data: null,
            error: { message: "Sahi email address daalo." },
        };
    }

    if (!isValidPhone(normalizedPhone)) {
        return {
            data: null,
            error: { message: "Sahi 10 digit ka phone number daalo." },
        };
    }

    if (String(password).length < 8) {
        return {
            data: null,
            error: {
                message: "Password kam se kam 8 characters ka hona chahiye.",
            },
        };
    }

    try {
        const result = await apiRequest("/auth/signup", {
            method: "POST",
            body: JSON.stringify({
                display_name: normalizedEmail.split("@")[0],
                email: normalizedEmail,
                phone: normalizedPhone,
                password,
                role: role === "seller" ? "seller" : "buyer",
            }),
        });

        saveSession(result.user, result.token);

        return {
            data: { user: result.user },
            error: null,
        };
    } catch (error) {
        return {
            data: null,
            error: getError(error, "Signup fail ho gaya."),
        };
    }
};

// LOGIN  (identifier = email ya 10 digit phone, dono chalega)
export const login = async (identifier, password) => {
    const value = String(identifier || "").trim();
    const isEmail = value.includes("@");
    const loginId = isEmail ? value.toLowerCase() : normalizePhone(value);

    if (!loginId || !password) {
        return {
            data: null,
            error: { message: "Email/phone aur password dono daalo." },
        };
    }

    if (isEmail && !isValidEmail(loginId)) {
        return {
            data: null,
            error: { message: "Sahi email address daalo." },
        };
    }

    if (!isEmail && !isValidPhone(loginId)) {
        return {
            data: null,
            error: { message: "Sahi 10 digit ka phone number daalo." },
        };
    }

    try {
        const result = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(
                isEmail
                    ? { email: loginId, password }
                    : { phone: loginId, password }
            ),
        });

        saveSession(result.user, result.token);

        return {
            data: { user: result.user },
            error: null,
        };
    } catch (error) {
        return {
            data: null,
            error: getError(error, "Login fail ho gaya."),
        };
    }
};

// LOGOUT
export const logout = async () => {
    clearSession();
    return { error: null };
};

// GET CACHED USER
export const getUser = () => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const rawUser = localStorage.getItem(USER_KEY);

        if (!token || !rawUser) {
            return null;
        }

        return JSON.parse(rawUser);
    } catch {
        return null;
    }
};

// VERIFY USER WITH BACKEND
export const getCurrentUser = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
        return null;
    }

    try {
        const result = await apiRequest("/auth/me");

        if (result.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        }

        return result.user || null;
    } catch (error) {
        clearSession();
        return null;
    }
};

// RESET PASSWORD
export const resetPassword = async () => ({
    error: {
        message:
            "Password reset feature abhi backend mein available nahi hai.",
    },
});

// ADMIN: GET USERS
export const getAllUsers = async () => {
    try {
        const result = await apiRequest("/admin/users");
        return Array.isArray(result.users) ? result.users : [];
    } catch (error) {
        console.error("Users load nahi hue:", error.message);
        return [];
    }
};

// ADMIN: CHANGE USER STATUS
export const setUserStatus = async (id, status) => {
    if (!["active", "blocked"].includes(status)) {
        return false;
    }

    try {
        await apiRequest(
            `/admin/users/${encodeURIComponent(id)}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }
        );

        notify();
        return true;
    } catch (error) {
        console.error("User status update nahi hua:", error.message);
        return false;
    }
};

// AUTH STATE LISTENER
export const onAuthStateChange = (callback) => {
    const handler = () => callback(getUser());

    window.addEventListener("vintora-auth", handler);
    window.addEventListener("storage", handler);

    callback(getUser());

    return () => {
        window.removeEventListener("vintora-auth", handler);
        window.removeEventListener("storage", handler);
    };
};