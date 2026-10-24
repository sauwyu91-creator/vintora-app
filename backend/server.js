require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ---------- CORS ----------
// .env mein FRONTEND_ORIGIN comma se alag karke multiple origins de sakte ho.
// Development mein localhost / 127.0.0.1 ka koi bhi port allowed hai
// (Vite 5173 busy ho to 5174, 5175... pe chala jata hai).
const extraOrigins = (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const localOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
    cors({
        origin: (origin, callback) => {
            // Postman / curl / PowerShell mein origin nahi hota
            if (!origin) return callback(null, true);

            if (extraOrigins.includes(origin) || localOrigin.test(origin)) {
                return callback(null, true);
            }

            console.warn("CORS blocked origin:", origin);
            return callback(null, false);
        },
    })
);
app.use(express.json({ limit: "10mb" }));

const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "vintora",
    waitForConnections: true,
    connectionLimit: 10,
});

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET .env mein kam se kam 32 characters ka rakho.");
}

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

// ---------- Database setup ----------

// Automatically create required tables.
// Isliye empty database mein manually tables banane ki zaroorat nahi.
async function initializeDatabase() {
    const connection = await pool.getConnection();

    try {
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        display_name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        phone VARCHAR(15) NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
        status ENUM('active','blocked') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Purani users table mein phone column nahi hota, to automatically add karo.
        const [phoneCol] = await connection.query(
            "SHOW COLUMNS FROM users LIKE 'phone'"
        );

        if (!phoneCol.length) {
            await connection.query(
                "ALTER TABLE users ADD COLUMN phone VARCHAR(15) NULL UNIQUE AFTER email"
            );
            console.log("users table mein phone column add ho gaya.");
        }

        await connection.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        seller_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        condition_name VARCHAR(80) DEFAULT '',
        approx_age VARCHAR(80) DEFAULT '',
        brand VARCHAR(120) DEFAULT '',
        description TEXT,
        provenance TEXT,
        availability VARCHAR(100) DEFAULT '',
        contact_preference VARCHAR(100) DEFAULT '',
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        image_data LONGTEXT,
        status ENUM('pending','published','rejected','removed')
          NOT NULL DEFAULT 'pending',
        views INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        user_id BIGINT UNSIGNED NOT NULL,
        listing_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, listing_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        listing_id BIGINT UNSIGNED NOT NULL,
        buyer_id BIGINT UNSIGNED NOT NULL,
        seller_id BIGINT UNSIGNED NOT NULL,
        message TEXT NOT NULL,
        reply TEXT,
        status ENUM('New','Replied','Closed') NOT NULL DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    } finally {
        connection.release();
    }
}

// ---------- Auth helpers ----------

function createToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

async function auth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ")
            ? header.slice(7)
            : "";

        if (!token) {
            return res.status(401).json({ error: "Login required hai." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await pool.query(
            "SELECT id, display_name, email, phone, role, status FROM users WHERE id = ?",
            [decoded.id]
        );

        if (!users.length || users[0].status !== "active") {
            return res.status(401).json({ error: "Account unavailable hai." });
        }

        req.user = users[0];
        next();
    } catch {
        return res.status(401).json({ error: "Invalid ya expired token." });
    }
}

function allowRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Permission nahi hai." });
        }
        next();
    };
}

function handleError(res, error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
        const msg = String(error.sqlMessage || "");
        const field = msg.includes("phone") ? "phone number" : "email";
        return res
            .status(409)
            .json({ error: `Ye ${field} pehle se registered hai.` });
    }

    return res.status(500).json({ error: "Server error. Console check karo." });
}

// ---------- Health ----------

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ success: true, message: "Vintora API aur MySQL connected hain." });
    } catch (error) {
        handleError(res, error);
    }
});

// ---------- Auth routes ----------

// Signup
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { display_name, name, email, phone, password, role } = req.body;

        const normalizedEmail = String(email || "").trim().toLowerCase();
        const normalizedPhone = normalizePhone(phone);
        const displayName =
            String(display_name || name || "").trim() ||
            normalizedEmail.split("@")[0];

        if (!normalizedEmail || !normalizedPhone || !password) {
            return res.status(400).json({
                error: "Email, phone aur password required hain.",
            });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ error: "Sahi email address daalo." });
        }

        if (!isValidPhone(normalizedPhone)) {
            return res.status(400).json({
                error: "Sahi 10 digit ka phone number daalo.",
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                error: "Password kam se kam 8 characters ka hona chahiye.",
            });
        }

        // Public signup se admin account create nahi ho sakta.
        const safeRole = role === "seller" ? "seller" : "buyer";
        const passwordHash = await bcrypt.hash(String(password), 12);

        const [result] = await pool.query(
            `INSERT INTO users (display_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
            [displayName, normalizedEmail, normalizedPhone, passwordHash, safeRole]
        );

        const user = {
            id: result.insertId,
            display_name: displayName,
            email: normalizedEmail,
            phone: normalizedPhone,
            role: safeRole,
        };

        res.status(201).json({
            user,
            token: createToken(user),
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Login (email ya phone, dono chalega)
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, phone, identifier, password } = req.body;

        // "identifier" bhi accept karte hain: @ ho to email, warna phone
        const rawEmail =
            email || (String(identifier || "").includes("@") ? identifier : "");
        const rawPhone =
            phone || (!String(identifier || "").includes("@") ? identifier : "");

        let rows = [];

        if (rawEmail) {
            const normalizedEmail = String(rawEmail).trim().toLowerCase();
            [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
                normalizedEmail,
            ]);
        } else if (rawPhone) {
            const normalizedPhone = normalizePhone(rawPhone);
            [rows] = await pool.query("SELECT * FROM users WHERE phone = ?", [
                normalizedPhone,
            ]);
        } else {
            return res.status(400).json({
                error: "Email ya phone number daalo.",
            });
        }

        if (
            !rows.length ||
            !(await bcrypt.compare(String(password || ""), rows[0].password_hash))
        ) {
            return res
                .status(401)
                .json({ error: "Email/phone ya password galat hai." });
        }

        const dbUser = rows[0];

        if (dbUser.status !== "active") {
            return res.status(403).json({ error: "Account blocked hai." });
        }

        const user = {
            id: dbUser.id,
            display_name: dbUser.display_name,
            email: dbUser.email,
            phone: dbUser.phone,
            role: dbUser.role,
        };

        res.json({ user, token: createToken(user) });
    } catch (error) {
        handleError(res, error);
    }
});

// Current user
app.get("/api/auth/me", auth, (req, res) => {
    res.json({ user: req.user });
});

// ---------- Listings ----------

// Public published listings
app.get("/api/listings", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT l.*, u.display_name AS seller_name
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'published' AND u.status = 'active'
      ORDER BY l.created_at DESC
    `);

        res.json({ listings: rows });
    } catch (error) {
        handleError(res, error);
    }
});

// Seller's own listings
// IMPORTANT: ye route "/api/listings/:id" se PEHLE hona chahiye,
// warna Express "mine" ko :id samajh leta hai.
app.get("/api/listings/mine", auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM listings WHERE seller_id = ? ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json({ listings: rows });
    } catch (error) {
        handleError(res, error);
    }
});

// Single published listing
app.get("/api/listings/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT l.*, u.display_name AS seller_name
       FROM listings l
       JOIN users u ON u.id = l.seller_id
       WHERE l.id = ? AND l.status = 'published'
         AND u.status = 'active'`,
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Listing nahi mili." });
        }

        await pool.query(
            "UPDATE listings SET views = views + 1 WHERE id = ?",
            [req.params.id]
        );

        res.json({ listing: rows[0] });
    } catch (error) {
        handleError(res, error);
    }
});

// Seller creates listing
app.post(
    "/api/listings",
    auth,
    allowRoles("seller", "admin"),
    async (req, res) => {
        try {
            const b = req.body;

            if (!b.title || !b.category) {
                return res.status(400).json({
                    error: "Listing title aur category required hain.",
                });
            }

            const price = Number(b.price || 0);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({ error: "Price valid honi chahiye." });
            }

            const [result] = await pool.query(
                `INSERT INTO listings
        (seller_id, title, category, subcategory, city, state,
         condition_name, approx_age, brand, description, provenance,
         availability, contact_preference, price, image_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user.id,
                    b.title,
                    b.category,
                    b.subcategory || "",
                    b.city || "",
                    b.state || "",
                    b.condition_name || b.condition || "",
                    b.approx_age || "",
                    b.brand || "",
                    b.description || "",
                    b.provenance || "",
                    b.availability || "",
                    b.contact_preference || "",
                    price,
                    b.image_data || b.image || null,
                ]
            );

            res.status(201).json({
                message: "Listing submit ho gayi. Approval pending hai.",
                id: result.insertId,
                status: "pending",
            });
        } catch (error) {
            handleError(res, error);
        }
    }
);

// Seller edits own listing; edited listing goes back to pending.
app.put(
    "/api/listings/:id",
    auth,
    allowRoles("seller", "admin"),
    async (req, res) => {
        try {
            const b = req.body;

            if (!b.title || !b.category) {
                return res.status(400).json({
                    error: "Listing title aur category required hain.",
                });
            }

            const price = Number(b.price || 0);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({ error: "Price valid honi chahiye." });
            }

            const [result] = await pool.query(
                `UPDATE listings SET
       title = ?, category = ?, subcategory = ?, city = ?, state = ?,
       condition_name = ?, approx_age = ?, brand = ?, description = ?,
       provenance = ?, availability = ?, contact_preference = ?,
       price = ?, image_data = ?, status = 'pending'
       WHERE id = ? AND seller_id = ?`,
                [
                    b.title,
                    b.category,
                    b.subcategory || "",
                    b.city || "",
                    b.state || "",
                    b.condition_name || b.condition || "",
                    b.approx_age || "",
                    b.brand || "",
                    b.description || "",
                    b.provenance || "",
                    b.availability || "",
                    b.contact_preference || "",
                    price,
                    b.image_data || b.image || null,
                    req.params.id,
                    req.user.id,
                ]
            );

            if (!result.affectedRows) {
                return res.status(404).json({ error: "Apni listing nahi mili." });
            }

            res.json({ message: "Listing update hui; approval pending hai." });
        } catch (error) {
            handleError(res, error);
        }
    }
);

// Seller deletes own listing
app.delete("/api/listings/:id", auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM listings WHERE id = ? AND seller_id = ?",
            [req.params.id, req.user.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: "Apni listing nahi mili." });
        }

        res.json({ message: "Listing delete ho gayi." });
    } catch (error) {
        handleError(res, error);
    }
});

// ---------- Admin ----------

// Admin: view all users
app.get("/api/admin/users", auth, allowRoles("admin"), async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, display_name, email, phone, role, status, created_at
       FROM users ORDER BY created_at DESC`
        );
        res.json({ users });
    } catch (error) {
        handleError(res, error);
    }
});

// Admin: block or unblock user
app.patch(
    "/api/admin/users/:id/status",
    auth,
    allowRoles("admin"),
    async (req, res) => {
        try {
            const { status } = req.body;

            if (!["active", "blocked"].includes(status)) {
                return res.status(400).json({ error: "Invalid status." });
            }

            if (Number(req.params.id) === Number(req.user.id) && status === "blocked") {
                return res.status(400).json({ error: "Apna account block nahi kar sakte." });
            }

            const [result] = await pool.query(
                "UPDATE users SET status = ? WHERE id = ?",
                [status, req.params.id]
            );

            if (!result.affectedRows) {
                return res.status(404).json({ error: "User nahi mila." });
            }

            res.json({ message: `User status: ${status}` });
        } catch (error) {
            handleError(res, error);
        }
    }
);

// Admin: pending listings
app.get(
    "/api/admin/listings/pending",
    auth,
    allowRoles("admin"),
    async (req, res) => {
        try {
            const [listings] = await pool.query(
                "SELECT * FROM listings WHERE status = 'pending' ORDER BY created_at"
            );
            res.json({ listings });
        } catch (error) {
            handleError(res, error);
        }
    }
);

// Admin: approve or reject listing
app.patch(
    "/api/admin/listings/:id/status",
    auth,
    allowRoles("admin"),
    async (req, res) => {
        try {
            const { status } = req.body;

            if (!["published", "rejected", "removed", "pending"].includes(status)) {
                return res.status(400).json({ error: "Invalid listing status." });
            }

            const [result] = await pool.query(
                "UPDATE listings SET status = ? WHERE id = ?",
                [status, req.params.id]
            );

            if (!result.affectedRows) {
                return res.status(404).json({ error: "Listing nahi mili." });
            }

            res.json({ message: `Listing status: ${status}` });
        } catch (error) {
            handleError(res, error);
        }
    }
);

// ---------- Wishlist ----------

// Get wishlist
app.get("/api/wishlist", auth, async (req, res) => {
    try {
        const [listings] = await pool.query(
            `SELECT l.* FROM wishlist w
       JOIN listings l ON l.id = w.listing_id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        res.json({ listings });
    } catch (error) {
        handleError(res, error);
    }
});

// Add wishlist item
app.post("/api/wishlist/:listingId", auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id FROM listings WHERE id = ? AND status = 'published'",
            [req.params.listingId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Published listing nahi mili." });
        }

        await pool.query(
            "INSERT IGNORE INTO wishlist (user_id, listing_id) VALUES (?, ?)",
            [req.user.id, req.params.listingId]
        );

        res.json({ message: "Wishlist update ho gayi." });
    } catch (error) {
        handleError(res, error);
    }
});

// Remove wishlist item
app.delete("/api/wishlist/:listingId", auth, async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM wishlist WHERE user_id = ? AND listing_id = ?",
            [req.user.id, req.params.listingId]
        );

        res.json({ message: "Wishlist se remove ho gaya." });
    } catch (error) {
        handleError(res, error);
    }
});

// ---------- Enquiries ----------

// Buyer sends enquiry
app.post("/api/enquiries", auth, async (req, res) => {
    try {
        const { listing_id, message } = req.body;

        if (!message || !String(message).trim()) {
            return res.status(400).json({ error: "Message required hai." });
        }

        const [rows] = await pool.query(
            "SELECT seller_id FROM listings WHERE id = ? AND status = 'published'",
            [listing_id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Published listing nahi mili." });
        }

        const [result] = await pool.query(
            `INSERT INTO enquiries (listing_id, buyer_id, seller_id, message)
       VALUES (?, ?, ?, ?)`,
            [listing_id, req.user.id, rows[0].seller_id, String(message).trim()]
        );

        res.status(201).json({ id: result.insertId, message: "Enquiry send ho gayi." });
    } catch (error) {
        handleError(res, error);
    }
});

// Buyer: own enquiries
app.get("/api/enquiries/mine", auth, async (req, res) => {
    try {
        const [enquiries] = await pool.query(
            `SELECT e.*, l.title AS listing_title
       FROM enquiries e JOIN listings l ON l.id = e.listing_id
       WHERE e.buyer_id = ? ORDER BY e.created_at DESC`,
            [req.user.id]
        );

        res.json({ enquiries });
    } catch (error) {
        handleError(res, error);
    }
});

// Seller: received enquiries
app.get(
    "/api/enquiries/inbox",
    auth,
    allowRoles("seller", "admin"),
    async (req, res) => {
        try {
            const [enquiries] = await pool.query(
                `SELECT e.*, l.title AS listing_title, u.display_name AS buyer_name
         FROM enquiries e
         JOIN listings l ON l.id = e.listing_id
         JOIN users u ON u.id = e.buyer_id
         WHERE e.seller_id = ? ORDER BY e.created_at DESC`,
                [req.user.id]
            );

            res.json({ enquiries });
        } catch (error) {
            handleError(res, error);
        }
    }
);

// Seller replies to enquiry
app.patch(
    "/api/enquiries/:id/reply",
    auth,
    allowRoles("seller", "admin"),
    async (req, res) => {
        try {
            const { reply } = req.body;

            if (!reply || !String(reply).trim()) {
                return res.status(400).json({ error: "Reply required hai." });
            }

            const [result] = await pool.query(
                `UPDATE enquiries SET reply = ?, status = 'Replied'
         WHERE id = ? AND seller_id = ? AND status <> 'Closed'`,
                [String(reply).trim(), req.params.id, req.user.id]
            );

            if (!result.affectedRows) {
                return res.status(404).json({ error: "Open enquiry nahi mili." });
            }

            res.json({ message: "Reply send ho gaya." });
        } catch (error) {
            handleError(res, error);
        }
    }
);

// Close enquiry
app.patch("/api/enquiries/:id/close", auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            `UPDATE enquiries SET status = 'Closed'
       WHERE id = ? AND (buyer_id = ? OR seller_id = ?)`,
            [req.params.id, req.user.id, req.user.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: "Enquiry nahi mili." });
        }

        res.json({ message: "Enquiry close ho gayi." });
    } catch (error) {
        handleError(res, error);
    }
});

// ---------- Fallback + start ----------

// Unknown endpoint
app.use((req, res) => {
    res.status(404).json({ error: "API route nahi mila." });
});

async function startServer() {
    await initializeDatabase();
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
        console.log(`Vintora API running: http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
        console.log("MySQL connected; tables checked/created.");
    });
}

startServer().catch((error) => {
    console.error("Server start nahi hua:", error.message);
    process.exit(1);
});