import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icons } from "../components/Icons";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("");
    const { login, user, error, setError, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Clear auth error when mounting
        setError(null);
        // Redirect if already logged in
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate, setError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!email || !password) {
            setFormError("Please fill in all fields.");
            return;
        }

        const res = await login(email, password);
        if (res.success) {
            navigate("/dashboard");
        }
    };

    return (
        <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div className="orb-glow orb-primary"></div>
            <div className="orb-glow orb-secondary"></div>

            <div className="glass-container animate-fade-in" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem" }}>
                
                {/* Back to Home Link */}
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                    &larr; Back to Home
                </Link>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                        padding: "0.75rem",
                        borderRadius: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
                        marginBottom: "1rem"
                    }}>
                        <Icons.User size={28} style={{ color: "#fff" }} />
                    </div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Welcome Back</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Sign in to your departmental portal</p>
                </div>

                {/* Errors */}
                {(formError || error) && (
                    <div style={{
                        background: "rgba(244, 63, 94, 0.1)",
                        border: "1px solid var(--rose)",
                        color: "#fda4af",
                        padding: "0.75rem 1rem",
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        marginBottom: "1.25rem",
                        textAlign: "left"
                    }}>
                        {formError || error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="username@college.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1.75rem" }}>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center", padding: "0.85rem" }}
                        disabled={loading}
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                {/* Registration Link */}
                <p style={{ marginTop: "1.75rem", fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "center" }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
