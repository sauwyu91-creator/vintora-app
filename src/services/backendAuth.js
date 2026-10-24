import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // apne project ke hisaab se path check karo

export default function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("buyer");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // positional order: email, password, phone, role
        const res = await signup(email, password, phone, role);

        setLoading(false);

        if (res.error) {
            setError(res.error.message);
            return;
        }

        const r = res.data.user.role;
        navigate(
            r === "admin"
                ? "/admin"
                : r === "seller"
                    ? "/seller/listings"
                    : "/buyer/home"
        );
    };

    // NOTE: className wahi rakho jo tumhare purane inputs mein tha
    return (
        <div>
            <h1>Sign up</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                />

                <input
                    type="tel"
                    placeholder="Phone number (10 digit)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={13}
                    autoComplete="tel"
                    required
                />

                <input
                    type="password"
                    placeholder="Password (8+ akshar)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                />

                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="buyer">Main Buyer hoon</option>
                    <option value="seller">Main Seller hoon</option>
                </select>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Ruko..." : "Account banao"}
                </button>
            </form>

            <p>
                Account hai? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}