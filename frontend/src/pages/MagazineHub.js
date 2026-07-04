import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API_URL, BASE_URL } from "../context/AuthContext";
import { Icons } from "../components/Icons";

const MagazineHub = () => {
    const { user } = useAuth();
    const [magazines, setMagazines] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state for uploading magazine
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [magTitle, setMagTitle] = useState("");
    const [magEdition, setMagEdition] = useState("");
    const [magDesc, setMagDesc] = useState("");
    const [magPdf, setMagPdf] = useState(null);
    const [magCover, setMagCover] = useState(null);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");
    const [uploading, setUploading] = useState(false);

    // Fetch magazines
    const fetchMagazines = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/magazines`);
            if (res.data.success) {
                setMagazines(res.data.magazines);
            }
        } catch (error) {
            console.error("Error fetching magazines:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMagazines();
        // eslint-disable-next-line
    }, []);

    // Form submission
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setUploadError("");
        setUploadSuccess("");
        setUploading(true);

        if (!magTitle || !magEdition || !magPdf) {
            setUploadError("Please fill in all required fields and upload the PDF file.");
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append("title", magTitle);
        formData.append("edition", magEdition);
        formData.append("description", magDesc);
        formData.append("pdfFile", magPdf);
        if (magCover) {
            formData.append("coverImage", magCover);
        }

        try {
            const res = await axios.post(`${API_URL}/magazines`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setUploadSuccess(res.data.message);
                // Clear inputs
                setMagTitle("");
                setMagEdition("");
                setMagDesc("");
                setMagPdf(null);
                setMagCover(null);

                // Refresh magazines list
                fetchMagazines();

                setTimeout(() => {
                    setShowUploadModal(false);
                    setUploadSuccess("");
                }, 2000);
            }
        } catch (error) {
            setUploadError(error.response?.data?.message || "Error uploading magazine. Ensure files are within limits.");
        } finally {
            setUploading(false);
        }
    };

    // Delete magazine
    const handleDelete = async (magId) => {
        if (!window.confirm("Are you sure you want to delete this magazine publication?")) return;
        try {
            const res = await axios.delete(`${API_URL}/magazines/${magId}`);
            if (res.data.success) {
                setMagazines(prevMags => prevMags.filter(m => m._id !== magId));
            }
        } catch (error) {
            console.error("Error deleting magazine:", error);
            alert("Failed to delete magazine.");
        }
    };

    const isAuthorizedUploader = user.role === "admin" || user.role === "faculty";

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Magazines Shelf</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>IT Department publications, annual magazines, and student tech blogs</p>
                </div>

                {isAuthorizedUploader && (
                    <button onClick={() => setShowUploadModal(true)} className="btn-primary">
                        <Icons.Plus size={18} />
                        Publish Magazine
                    </button>
                )}
            </div>

            {/* Bookshelf Grid */}
            {loading ? (
                <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", minHeight: "250px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid rgba(99, 102, 241, 0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : magazines.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed var(--border-glass)", borderRadius: "var(--radius-lg)" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No magazines have been published yet.</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Faculty advisors and admins can upload the first edition!</p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "2rem"
                }}>
                    {magazines.map((mag) => (
                        <div key={mag._id} className="glass-card animate-fade-in" style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "1rem",
                            borderRadius: "var(--radius-md)",
                            position: "relative",
                            justifyContent: "space-between",
                            height: "380px",
                            overflow: "hidden"
                        }}>
                            
                            {/* Cover Container */}
                            <div style={{
                                width: "100%",
                                height: "220px",
                                borderRadius: "10px",
                                overflow: "hidden",
                                position: "relative",
                                marginBottom: "1rem",
                                background: mag.coverImagePath ? "transparent" : "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "1px solid var(--border-glass)"
                            }}>
                                {mag.coverImagePath ? (
                                    <img
                                        src={`${BASE_URL}/${mag.coverImagePath}`}
                                        alt={mag.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{ padding: "1.5rem", textAlign: "center" }}>
                                        <Icons.BookOpen size={38} style={{ color: "#fff", opacity: 0.8, marginBottom: "0.5rem" }} />
                                        <div style={{ fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff" }}>
                                            {mag.title}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)", marginTop: "0.25rem", fontWeight: 600 }}>
                                            {mag.edition}
                                        </div>
                                    </div>
                                )}

                                {/* Admin delete button overlaid on cover */}
                                {isAuthorizedUploader && (
                                    <button
                                        onClick={() => handleDelete(mag._id)}
                                        style={{
                                            position: "absolute",
                                            top: "0.5rem",
                                            right: "0.5rem",
                                            background: "rgba(0, 0, 0, 0.5)",
                                            border: "1px solid var(--border-glass)",
                                            color: "var(--rose)",
                                            padding: "0.35rem",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            backdropFilter: "blur(5px)"
                                        }}
                                    >
                                        <Icons.Trash size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Details */}
                            <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {mag.title}
                                    </h3>
                                    <div className="badge badge-primary" style={{ fontSize: "0.65rem", padding: "0.1rem 0.5rem", marginTop: "0.25rem" }}>
                                        Edition: {mag.edition}
                                    </div>
                                    {mag.description && (
                                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.3, marginTop: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                            {mag.description}
                                        </p>
                                    )}
                                </div>

                                <a
                                    href={`${BASE_URL}/${mag.filePath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                    style={{ padding: "0.5rem", fontSize: "0.8rem", borderRadius: "8px", justifyContent: "center", marginTop: "0.75rem" }}
                                >
                                    <Icons.Eye size={14} /> Read Magazine (PDF)
                                </a>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Magazine Upload Modal */}
            {showUploadModal && (
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
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Upload IT Magazine</h3>
                            <button onClick={() => setShowUploadModal(false)} style={{ border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
                                <Icons.Close size={24} />
                            </button>
                        </div>

                        {/* Status Messages */}
                        {uploadError && (
                            <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid var(--rose)", color: "#fda4af", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                {uploadError}
                            </div>
                        )}
                        {uploadSuccess && (
                            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid var(--success)", color: "#a7f3d0", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                {uploadSuccess}
                            </div>
                        )}

                        {/* Upload Form */}
                        <form onSubmit={handleUploadSubmit} style={{ textAlign: "left" }}>
                            
                            <div className="form-group">
                                <label className="form-label">Magazine Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. IT Chronicle"
                                    value={magTitle}
                                    onChange={(e) => setMagTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Edition / Issue Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Spring 2026, Vol. 12"
                                    value={magEdition}
                                    onChange={(e) => setMagEdition(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Magazine Overview / Description</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Brief summary of articles or blogs..."
                                    rows="3"
                                    value={magDesc}
                                    onChange={(e) => setMagDesc(e.target.value)}
                                    style={{ resize: "none" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                                <div className="form-group">
                                    <label className="form-label">Magazine File (PDF Only)*</label>
                                    <input
                                        type="file"
                                        className="input-field"
                                        accept=".pdf"
                                        onChange={(e) => setMagPdf(e.target.files[0])}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Optional Cover Image (JPEG/PNG)</label>
                                    <input
                                        type="file"
                                        className="input-field"
                                        accept="image/*"
                                        onChange={(e) => setMagCover(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="btn-secondary"
                                    style={{ flex: 1, justifyContent: "center" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: "center" }}
                                    disabled={uploading}
                                >
                                    {uploading ? "Publishing..." : "Publish Edition"}
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

export default MagazineHub;
