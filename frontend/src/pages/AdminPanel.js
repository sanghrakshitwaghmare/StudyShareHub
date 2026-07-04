import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API_URL, BASE_URL } from "../context/AuthContext";
import { Icons } from "../components/Icons";

const AdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("verification"); // verification, notes, users, stats
    
    // Core data states
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingNotes, setPendingNotes] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal state for full-screen ID card preview
    const [previewUser, setPreviewUser] = useState(null);

    // Fetch tab data
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "verification") {
                const res = await axios.get(`${API_URL}/admin/users/pending`);
                if (res.data.success) setPendingUsers(res.data.users);
            } else if (activeTab === "notes") {
                const res = await axios.get(`${API_URL}/notes/pending`);
                if (res.data.success) setPendingNotes(res.data.notes);
            } else if (activeTab === "users") {
                const res = await axios.get(`${API_URL}/admin/users`);
                if (res.data.success) setAllUsers(res.data.users);
            } else if (activeTab === "stats") {
                const res = await axios.get(`${API_URL}/admin/stats`);
                if (res.data.success) setStats(res.data.stats);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [activeTab]);

    // Verify student ID (approve/reject)
    const handleVerifyUser = async (userId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this student registration?`)) return;
        try {
            const res = await axios.put(`${API_URL}/admin/users/${userId}/verify`, { status });
            if (res.data.success) {
                setPendingUsers(prev => prev.filter(u => u._id !== userId));
                setPreviewUser(null);
            }
        } catch (error) {
            console.error("Verify student error:", error);
            alert("Action failed. Try again.");
        }
    };

    // Approve student notes
    const handleApproveNote = async (noteId) => {
        try {
            const res = await axios.put(`${API_URL}/notes/${noteId}/approve`);
            if (res.data.success) {
                setPendingNotes(prev => prev.filter(n => n._id !== noteId));
            }
        } catch (error) {
            console.error("Approve note error:", error);
            alert("Note approval failed.");
        }
    };

    // Reject/Delete notes in queue
    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Are you sure you want to reject and delete this note upload?")) return;
        try {
            const res = await axios.delete(`${API_URL}/notes/${noteId}`);
            if (res.data.success) {
                setPendingNotes(prev => prev.filter(n => n._id !== noteId));
            }
        } catch (error) {
            console.error("Delete note error:", error);
            alert("Delete failed.");
        }
    };

    // Promote user role
    const handleChangeRole = async (userId, newRole) => {
        try {
            const res = await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole });
            if (res.data.success) {
                setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
                alert("Role changed successfully!");
            }
        } catch (error) {
            console.error("Change role error:", error);
            alert("Failed to change user role.");
        }
    };

    const isSystemAdmin = user.role === "admin";

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Admin Desk</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Verify college ID cards, approve submitted notes, and view statistics</p>
            </div>

            {/* Admin Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem", marginBottom: "2rem" }}>
                <button
                    onClick={() => setActiveTab("verification")}
                    style={{
                        padding: "0.5rem 1.25rem",
                        background: activeTab === "verification" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                        border: "1px solid " + (activeTab === "verification" ? "rgba(99, 102, 241, 0.3)" : "transparent"),
                        borderRadius: "10px",
                        color: activeTab === "verification" ? "white" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "var(--transition-smooth)"
                    }}
                >
                    ID Verification Queue
                </button>
                <button
                    onClick={() => setActiveTab("notes")}
                    style={{
                        padding: "0.5rem 1.25rem",
                        background: activeTab === "notes" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                        border: "1px solid " + (activeTab === "notes" ? "rgba(99, 102, 241, 0.3)" : "transparent"),
                        borderRadius: "10px",
                        color: activeTab === "notes" ? "white" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "var(--transition-smooth)"
                    }}
                >
                    Notes Review Board
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    style={{
                        padding: "0.5rem 1.25rem",
                        background: activeTab === "users" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                        border: "1px solid " + (activeTab === "users" ? "rgba(99, 102, 241, 0.3)" : "transparent"),
                        borderRadius: "10px",
                        color: activeTab === "users" ? "white" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "var(--transition-smooth)"
                    }}
                >
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab("stats")}
                    style={{
                        padding: "0.5rem 1.25rem",
                        background: activeTab === "stats" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                        border: "1px solid " + (activeTab === "stats" ? "rgba(99, 102, 241, 0.3)" : "transparent"),
                        borderRadius: "10px",
                        color: activeTab === "stats" ? "white" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "var(--transition-smooth)"
                    }}
                >
                    Portal Metrics
                </button>
            </div>

            {/* Tab Panels */}
            {loading ? (
                <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", minHeight: "250px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid rgba(99, 102, 241, 0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : (
                <div className="animate-fade-in" style={{ flex: 1 }}>
                    
                    {/* Tab 1: Verification Queue */}
                    {activeTab === "verification" && (
                        <div>
                            {pendingUsers.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed var(--border-glass)", borderRadius: "var(--radius-lg)" }}>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>All student registrations are verified!</p>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>The verification queue is currently empty.</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {pendingUsers.map((student) => (
                                        <div key={student._id} className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                                <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{student.name}</h3>
                                                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Email: {student.email}</p>
                                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                                                    <span className="badge badge-teal">Sem {student.semester}</span>
                                                    <span className="badge badge-primary">Roll: {student.rollNo}</span>
                                                    <span className="badge badge-warning">ID: {student.collegeIdNumber}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
                                                <button
                                                    onClick={() => setPreviewUser(student)}
                                                    className="btn-secondary"
                                                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px" }}
                                                >
                                                    <Icons.Eye size={14} /> Preview ID Card
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyUser(student._id, "approved")}
                                                    className="btn-primary"
                                                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px", background: "var(--success)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)" }}
                                                >
                                                    <Icons.Check size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyUser(student._id, "rejected")}
                                                    className="btn-secondary"
                                                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px", color: "var(--rose)", borderColor: "rgba(244,63,94,0.2)" }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Notes Review Board */}
                    {activeTab === "notes" && (
                        <div>
                            {pendingNotes.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed var(--border-glass)", borderRadius: "var(--radius-lg)" }}>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No notes require moderation.</p>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>All student-uploaded study notes are approved.</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {pendingNotes.map((note) => (
                                        <div key={note._id} className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                                <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{note.title}</h3>
                                                <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>Subject: {note.subject} | {note.unit}</p>
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                    Uploaded by Student: {note.uploadedBy?.name} (Roll: {note.uploadedBy?.rollNo}, Sem {note.uploadedBy?.semester})
                                                </p>
                                            </div>

                                            <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
                                                <a
                                                    href={`${BASE_URL}/${note.filePath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary"
                                                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px" }}
                                                >
                                                    <Icons.Eye size={14} /> Open PDF
                                                </a>
                                                <button
                                                    onClick={() => handleApproveNote(note._id)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px", background: "var(--success)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)" }}
                                                >
                                                    <Icons.Check size={14} /> Approve Note
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note._id)}
                                                    className="btn-secondary"
                                                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px", color: "var(--rose)", borderColor: "rgba(244,63,94,0.2)" }}
                                                >
                                                    Reject & Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: User List Management */}
                    {activeTab === "users" && (
                        <div className="glass-container" style={{ padding: "1.5rem", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-secondary)", fontWeight: 700 }}>
                                        <th style={{ padding: "1rem" }}>User Name</th>
                                        <th style={{ padding: "1rem" }}>Email</th>
                                        <th style={{ padding: "1rem" }}>Account Status</th>
                                        <th style={{ padding: "1rem" }}>Current Role</th>
                                        {isSystemAdmin && <th style={{ padding: "1rem" }}>Role Administration</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map((u) => (
                                        <tr key={u._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                            <td style={{ padding: "1rem", fontWeight: 650 }}>{u.name}</td>
                                            <td style={{ padding: "1rem" }}>{u.email}</td>
                                            <td style={{ padding: "1rem" }}>
                                                <span className={`badge ${u.status === 'approved' ? 'badge-success' : u.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'faculty' ? 'badge-primary' : 'badge-teal'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            {isSystemAdmin && (
                                                <td style={{ padding: "1rem" }}>
                                                    {u._id !== user.id ? (
                                                        <select
                                                            className="input-field"
                                                            value={u.role}
                                                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", height: "auto" }}
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="faculty">Faculty</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>Active Account</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 4: Portal Metrics Dashboard */}
                    {activeTab === "stats" && stats && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            
                            {/* KPI Metrics */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                                <div className="glass-card" style={{ textAlign: "center" }}>
                                    <div style={{ color: "var(--primary)", fontSize: "2.25rem", fontWeight: 800 }}>
                                        {stats.users.totalStudents}
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem", fontWeight: 600 }}>Total Students</p>
                                </div>
                                <div className="glass-card" style={{ textAlign: "center" }}>
                                    <div style={{ color: "var(--warning)", fontSize: "2.25rem", fontWeight: 800 }}>
                                        {stats.users.pendingStudents}
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem", fontWeight: 600 }}>Pending ID Verification</p>
                                </div>
                                <div className="glass-card" style={{ textAlign: "center" }}>
                                    <div style={{ color: "var(--success)", fontSize: "2.25rem", fontWeight: 800 }}>
                                        {stats.content.approvedNotes}
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem", fontWeight: 600 }}>Approved Study Notes</p>
                                </div>
                                <div className="glass-card" style={{ textAlign: "center" }}>
                                    <div style={{ color: "var(--teal)", fontSize: "2.25rem", fontWeight: 800 }}>
                                        {stats.activity.totalDownloads}
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem", fontWeight: 600 }}>Total Note Downloads</p>
                                </div>
                            </div>

                            {/* Breakdown grids */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                                <div className="glass-card">
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>User Registry Metrics</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Approved Students</span>
                                            <span style={{ fontWeight: 700 }}>{stats.users.approvedStudents}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Pending Verifications</span>
                                            <span style={{ fontWeight: 700 }}>{stats.users.pendingStudents}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Faculty Accounts</span>
                                            <span style={{ fontWeight: 700 }}>{stats.users.totalFaculty}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card">
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>Department Content Summary</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Approved Notes</span>
                                            <span style={{ fontWeight: 700 }}>{stats.content.approvedNotes}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Pending Note Submissions</span>
                                            <span style={{ fontWeight: 700 }}>{stats.content.pendingNotes}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Notices Broadcasted</span>
                                            <span style={{ fontWeight: 700 }}>{stats.content.totalNotices}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Magazines Published</span>
                                            <span style={{ fontWeight: 700 }}>{stats.content.totalMagazines}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                </div>
            )}

            {/* College ID Preview Modal */}
            {previewUser && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 100,
                    padding: "1rem"
                }}>
                    <div className="glass-container animate-fade-in" style={{ width: "100%", maxWidth: "550px", padding: "2rem" }}>
                        
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>College ID Verification</h3>
                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Confirm details match student card</p>
                            </div>
                            <button onClick={() => setPreviewUser(null)} style={{ border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
                                <Icons.Close size={24} />
                            </button>
                        </div>

                        {/* ID details */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem", marginBottom: "1.25rem", textAlign: "left" }}>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>Name:</span> <strong style={{ color: "white" }}>{previewUser.name}</strong>
                            </div>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>Roll No:</span> <strong style={{ color: "white" }}>{previewUser.rollNo}</strong>
                            </div>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>Semester:</span> <strong style={{ color: "white" }}>{previewUser.semester}</strong>
                            </div>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>ID Number:</span> <strong style={{ color: "white" }}>{previewUser.collegeIdNumber}</strong>
                            </div>
                        </div>

                        {/* Image Frame */}
                        <div style={{
                            width: "100%",
                            height: "280px",
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: "1px solid var(--border-glass)",
                            background: "rgba(0,0,0,0.4)",
                            marginBottom: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <img
                                src={`${BASE_URL}/${previewUser.idCardPath}`}
                                alt="Student College ID Card"
                                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                            />
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={() => handleVerifyUser(previewUser._id, "rejected")}
                                className="btn-secondary"
                                style={{ flex: 1, justifyContent: "center", color: "var(--rose)", borderColor: "rgba(244,63,94,0.2)" }}
                            >
                                Reject Registration
                            </button>
                            <button
                                onClick={() => handleVerifyUser(previewUser._id, "approved")}
                                className="btn-primary"
                                style={{ flex: 1, justifyContent: "center", background: "var(--success)" }}
                            >
                                <Icons.Check size={16} /> Verify & Approve
                            </button>
                        </div>

                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminPanel;
