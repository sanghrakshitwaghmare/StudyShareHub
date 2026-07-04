import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API_URL, BASE_URL } from "../context/AuthContext";
import { Icons } from "../components/Icons";

const NoticeBoard = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state for posting notice
    const [showPostModal, setShowPostModal] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [postCategory, setPostCategory] = useState("Academic");
    const [postFile, setPostFile] = useState(null);
    const [postError, setPostError] = useState("");
    const [postSuccess, setPostSuccess] = useState("");
    const [posting, setPosting] = useState(false);

    // Fetch notices
    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/notices`);
            if (res.data.success) {
                setNotices(res.data.notices);
            }
        } catch (error) {
            console.error("Error fetching notices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
        // eslint-disable-next-line
    }, []);

    // Post notice form submit
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        setPostError("");
        setPostSuccess("");
        setPosting(true);

        if (!postTitle || !postContent || !postCategory) {
            setPostError("Please fill in all required fields.");
            setPosting(false);
            return;
        }

        const formData = new FormData();
        formData.append("title", postTitle);
        formData.append("content", postContent);
        formData.append("category", postCategory);
        if (postFile) {
            formData.append("attachment", postFile);
        }

        try {
            const res = await axios.post(`${API_URL}/notices`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setPostSuccess(res.data.message);
                // Clear inputs
                setPostTitle("");
                setPostContent("");
                setPostFile(null);
                
                // Refresh notices
                fetchNotices();
                
                setTimeout(() => {
                    setShowPostModal(false);
                    setPostSuccess("");
                }, 2000);
            }
        } catch (error) {
            setPostError(error.response?.data?.message || "Error publishing notice.");
        } finally {
            setPosting(false);
        }
    };

    // Delete notice
    const handleDelete = async (noticeId) => {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            const res = await axios.delete(`${API_URL}/notices/${noticeId}`);
            if (res.data.success) {
                setNotices(prevNotices => prevNotices.filter(notice => notice._id !== noticeId));
            }
        } catch (error) {
            console.error("Error deleting notice:", error);
            alert("Failed to delete notice.");
        }
    };

    // Category Badge Helper
    const getCategoryBadge = (category) => {
        switch (category) {
            case "Academic":
                return <span className="badge badge-primary">Academic</span>;
            case "Exam":
                return <span className="badge badge-danger">Exam Board</span>;
            case "Event":
                return <span className="badge badge-teal">Event</span>;
            case "Placement":
                return <span className="badge badge-success">Placements</span>;
            default:
                return <span className="badge badge-secondary">{category}</span>;
        }
    };

    const isAuthorizedPublisher = user.role === "admin" || user.role === "faculty";

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Notice Board</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Official administrative updates and student broadcasts</p>
                </div>
                
                {isAuthorizedPublisher && (
                    <button onClick={() => setShowPostModal(true)} className="btn-primary">
                        <Icons.Plus size={18} />
                        Publish Notice
                    </button>
                )}
            </div>

            {/* Notice Timeline */}
            {loading ? (
                <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", minHeight: "250px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid rgba(99, 102, 241, 0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : notices.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed var(--border-glass)", borderRadius: "var(--radius-lg)" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Notice board is currently empty.</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Check back later for academic announcements.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
                    {notices.map((notice) => (
                        <div key={notice._id} className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
                            
                            {/* Card Header */}
                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    {getCategoryBadge(notice.category)}
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        {new Date(notice.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>

                                {isAuthorizedPublisher && (
                                    <button
                                        onClick={() => handleDelete(notice._id)}
                                        style={{ background: "transparent", border: "none", color: "var(--rose)", cursor: "pointer", padding: "0.25rem", borderRadius: "4px" }}
                                    >
                                        <Icons.Trash size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Card Body */}
                            <div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{notice.title}</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                    {notice.content}
                                </p>
                            </div>

                            {/* Card Footer / Attachment */}
                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderTop: "1px solid var(--border-glass)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                <span>Posted by Faculty: {notice.postedBy?.name || "Deleted User"}</span>
                                
                                {notice.filePath && (
                                    <a
                                        href={`${BASE_URL}/${notice.filePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary"
                                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", borderRadius: "6px" }}
                                    >
                                        <Icons.Download size={12} /> View Attachment
                                    </a>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Notice Publish Modal */}
            {showPostModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    backdropFilter: "blur(5px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 100,
                    padding: "1rem"
                }}>
                    <div className="glass-container animate-fade-in" style={{ width: "100%", maxWidth: "500px", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
                        
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Publish Official Notice</h3>
                            <button onClick={() => setShowPostModal(false)} style={{ border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
                                <Icons.Close size={24} />
                            </button>
                        </div>

                        {/* Status Messages */}
                        {postError && (
                            <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid var(--rose)", color: "#fda4af", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                {postError}
                            </div>
                        )}
                        {postSuccess && (
                            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid var(--success)", color: "#a7f3d0", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                {postSuccess}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handlePostSubmit} style={{ textAlign: "left" }}>
                            
                            <div className="form-group">
                                <label className="form-label">Notice Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Mid-Term Examination Schedule"
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="input-field"
                                    value={postCategory}
                                    onChange={(e) => setPostCategory(e.target.value)}
                                    required
                                    style={{ height: "45px" }}
                                >
                                    <option value="Academic">Academic</option>
                                    <option value="Exam">Exam Board</option>
                                    <option value="Event">Event</option>
                                    <option value="Placement">Placements</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Content Body</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Type notice body content here..."
                                    rows="5"
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    required
                                    style={{ resize: "none" }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                                <label className="form-label">Optional Attachment File (e.g. Schedule PDF)</label>
                                <input
                                    type="file"
                                    className="input-field"
                                    onChange={(e) => setPostFile(e.target.files[0])}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPostModal(false)}
                                    className="btn-secondary"
                                    style={{ flex: 1, justifyContent: "center" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: "center" }}
                                    disabled={posting}
                                >
                                    {posting ? "Publishing..." : "Broadcast Notice"}
                                </button>
                            </div>

                        </form>
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

export default NoticeBoard;
