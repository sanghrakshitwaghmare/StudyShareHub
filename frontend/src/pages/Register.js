import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icons } from "../components/Icons";

const Register = () => {
    // Basic Form Fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student"); // default to student

    // Student Fields
    const [rollNo, setRollNo] = useState("");
    const [collegeIdNumber, setCollegeIdNumber] = useState("");
    const [semester, setSemester] = useState("1");
    const [idCardFile, setIdCardFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // UX States
    const [formError, setFormError] = useState("");
    const [regSuccessMessage, setRegSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const { register, user, setError } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        setError(null);
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate, setError]);

    // Handle Drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle Drop event
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.match("image.*")) {
                setIdCardFile(file);
                setFormError("");
            } else {
                setFormError("Only image files (JPEG, JPG, PNG) are allowed for College ID Card!");
            }
        }
    };

    // Handle File select click
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.match("image.*")) {
                setIdCardFile(file);
                setFormError("");
            } else {
                setFormError("Only image files (JPEG, JPG, PNG) are allowed for College ID Card!");
            }
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setLoading(true);

        if (!name || !email || !password || !role) {
            setFormError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role);

        if (role === "student") {
            if (!rollNo || !collegeIdNumber || !semester) {
                setFormError("Please fill in all student information fields.");
                setLoading(false);
                return;
            }
            if (!idCardFile) {
                setFormError("Please upload a scan/photo of your College ID card.");
                setLoading(false);
                return;
            }
            formData.append("rollNo", rollNo);
            formData.append("collegeIdNumber", collegeIdNumber);
            formData.append("semester", semester);
            formData.append("idCard", idCardFile);
        }

        const res = await register(formData);
        setLoading(false);

        if (res.success) {
            if (role === "student") {
                setRegSuccessMessage(
                    "Registration successful! Your College ID verification is now pending. An administrator will review your ID card and approve your access shortly."
                );
            } else {
                setRegSuccessMessage("Registration successful! You can now log in.");
            }
        } else {
            setFormError(res.message);
        }
    };

    // If registration succeeded, show confirmation screen
    if (regSuccessMessage) {
        return (
            <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <div className="orb-glow orb-teal"></div>
                <div className="glass-container animate-fade-in" style={{ width: "100%", maxWidth: "550px", padding: "3rem", textAlign: "center" }}>
                    <div style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "2px solid var(--success)",
                        padding: "1rem",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--success)",
                        marginBottom: "1.5rem",
                        boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
                    }}>
                        <Icons.Check size={40} />
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>Verification Pending</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                        {regSuccessMessage}
                    </p>
                    <Link to="/login" className="btn-primary" style={{ padding: "0.85rem 2.5rem", fontSize: "1rem" }}>
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
            <div className="orb-glow orb-primary"></div>
            <div className="orb-glow orb-secondary"></div>

            <div className="glass-container animate-fade-in" style={{ width: "100%", maxWidth: "550px", padding: "2.5rem" }}>
                
                {/* Back Link */}
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                    &larr; Back to Home
                </Link>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Create Account</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>IT Department Student & Faculty Portal</p>
                </div>

                {/* Form Errors */}
                {formError && (
                    <div style={{
                        background: "rgba(244, 63, 94, 0.1)",
                        border: "1px solid var(--rose)",
                        color: "#fda4af",
                        padding: "0.75rem 1rem",
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        marginBottom: "1.25rem"
                    }}>
                        {formError}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                    
                    {/* Role Selection Tabs */}
                    <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255, 255, 255, 0.03)", padding: "0.35rem", borderRadius: "12px", border: "1px solid var(--border-glass)", marginBottom: "1.5rem" }}>
                        <button
                            type="button"
                            onClick={() => { setRole("student"); setFormError(""); }}
                            style={{
                                flex: 1,
                                padding: "0.6rem",
                                borderRadius: "8px",
                                border: "none",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "var(--transition-smooth)",
                                background: role === "student" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
                                color: role === "student" ? "white" : "var(--text-secondary)"
                            }}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole("faculty"); setFormError(""); }}
                            style={{
                                flex: 1,
                                padding: "0.6rem",
                                borderRadius: "8px",
                                border: "none",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "var(--transition-smooth)",
                                background: role === "faculty" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
                                color: role === "faculty" ? "white" : "var(--text-secondary)"
                            }}
                        >
                            Faculty
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole("admin"); setFormError(""); }}
                            style={{
                                flex: 1,
                                padding: "0.6rem",
                                borderRadius: "8px",
                                border: "none",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "var(--transition-smooth)",
                                background: role === "admin" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
                                color: role === "admin" ? "white" : "var(--text-secondary)"
                            }}
                        >
                            Admin
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="student.it@college.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Student Fields */}
                    {role === "student" && (
                        <div className="animate-fade-in" style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className="form-group">
                                    <label className="form-label">Roll Number</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="IT-2026-042"
                                        value={rollNo}
                                        onChange={(e) => setRollNo(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Semester</label>
                                    <select
                                        className="input-field"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        required
                                        style={{ height: "48px" }}
                                    >
                                        <option value="1">Semester 1</option>
                                        <option value="2">Semester 2</option>
                                        <option value="3">Semester 3</option>
                                        <option value="4">Semester 4</option>
                                        <option value="5">Semester 5</option>
                                        <option value="6">Semester 6</option>
                                        <option value="7">Semester 7</option>
                                        <option value="8">Semester 8</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">College ID Number</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="COLL-897654"
                                    value={collegeIdNumber}
                                    onChange={(e) => setCollegeIdNumber(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Drag and Drop Upload */}
                            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                                <label className="form-label">College ID Card (Image Only)</label>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={triggerFileSelect}
                                    style={{
                                        border: "2px dashed " + (dragActive ? "var(--primary)" : "var(--border-glass)"),
                                        background: dragActive ? "rgba(99, 102, 241, 0.08)" : "rgba(255, 255, 255, 0.02)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "1.5rem",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        transition: "var(--transition-smooth)",
                                        position: "relative"
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        style={{ display: "none" }}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>
                                        <Icons.Upload size={28} />
                                    </div>
                                    {idCardFile ? (
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)" }}>{idCardFile.name}</p>
                                            <p style={{ color: "var(--teal)", fontSize: "0.8rem", marginTop: "0.25rem" }}>File selected successfully ✓</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Drag & Drop ID Card Image here</p>
                                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>or click to browse from files (JPEG, PNG)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center", padding: "0.85rem", marginTop: "1rem" }}
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>

                <p style={{ marginTop: "1.75rem", fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "center" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
