import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import NotesSection from "./NotesSection";
import NoticeBoard from "./NoticeBoard";
import MagazineHub from "./MagazineHub";
import AdminPanel from "./AdminPanel";

const Dashboard = () => {
    const { user, loading } = useAuth();

    // 1. Loading State
    if (loading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-dark)"
            }}>
                <div style={{
                    width: "50px",
                    height: "50px",
                    border: "3px solid rgba(99, 102, 241, 0.1)",
                    borderTopColor: "var(--primary)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "1rem"
                }}></div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Loading dashboard session...</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // 2. Auth Guard: Not Logged In
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Status Guard: User Registered but Unapproved (Pending/Rejected)
    if (user.status !== "approved") {
        return (
            <div style={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                textAlign: "center"
            }}>
                <div className="orb-glow orb-secondary"></div>
                <div className="glass-container animate-fade-in" style={{ width: "100%", maxWidth: "600px", padding: "3rem" }}>
                    <div style={{
                        background: user.status === "rejected" ? "rgba(244, 63, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        border: "2px solid " + (user.status === "rejected" ? "var(--rose)" : "var(--warning)"),
                        padding: "1rem",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: user.status === "rejected" ? "var(--rose)" : "var(--warning)",
                        marginBottom: "1.5rem",
                        boxShadow: "0 0 20px " + (user.status === "rejected" ? "rgba(244,63,94,0.3)" : "rgba(245,158,11,0.3)")
                    }}>
                        {user.status === "rejected" ? (
                            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        ) : (
                            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        )}
                    </div>
                    
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
                        {user.status === "rejected" ? "Registration Rejected" : "Verification in Progress"}
                    </h2>

                    <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                        {user.status === "rejected" 
                            ? `Hello ${user.name}, unfortunately your registration verification request has been rejected by the IT department administrators. Please reach out to your faculty advisor or update your registration details.`
                            : `Hello ${user.name}, your account is successfully registered under roll number ${user.rollNo}. However, your student access is currently pending College ID verification.`}
                    </p>

                    <div className="glass-card" style={{ textAlign: "left", fontSize: "0.9rem", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "between", marginBottom: "0.5rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Registered Email:</span>
                            <span style={{ fontWeight: 600 }}>{user.email}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "between", marginBottom: "0.5rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>College ID Ref:</span>
                            <span style={{ fontWeight: 600 }}>{user.collegeIdNumber}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "between" }}>
                            <span style={{ color: "var(--text-muted)" }}>Status Check:</span>
                            <span className={`badge ${user.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                {user.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
                        className="btn-secondary"
                        style={{ padding: "0.85rem 2.5rem", fontSize: "1rem" }}
                    >
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    // 4. Approved Layout (Sidebar + Nested Content Routing)
    const isAdminOrFaculty = user.role === "admin" || user.role === "faculty";

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-dark)" }}>
            {/* Sidebar component */}
            <Sidebar />

            {/* Dashboard Content Container */}
            <div style={{
                marginLeft: "260px",
                flex: 1,
                padding: "2.5rem 3rem",
                maxWidth: "calc(100% - 260px)",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column"
            }}>
                <Routes>
                    <Route path="notes" element={<NotesSection />} />
                    <Route path="notices" element={<NoticeBoard />} />
                    <Route path="magazines" element={<MagazineHub />} />
                    
                    {/* Admin Panel check */}
                    {isAdminOrFaculty ? (
                        <Route path="admin" element={<AdminPanel />} />
                    ) : (
                        <Route path="admin" element={<Navigate to="/dashboard/notes" replace />} />
                    )}

                    {/* Fallback inside dashboard */}
                    <Route path="*" element={<Navigate to="notes" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
