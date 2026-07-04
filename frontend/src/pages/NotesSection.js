import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API_URL, BASE_URL } from "../context/AuthContext";
import { Icons } from "../components/Icons";

const NotesSection = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Search
    const [selectedSemester, setSelectedSemester] = useState(""); // "" means All
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modal state for uploading
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadSubject, setUploadSubject] = useState("");
    const [uploadSemester, setUploadSemester] = useState("1");
    const [uploadUnit, setUploadUnit] = useState("Unit 1");
    const [uploadDesc, setUploadDesc] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");
    const [uploading, setUploading] = useState(false);

    // Fetch notes
    const fetchNotes = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/notes`;
            const params = {};
            if (selectedSemester) params.semester = selectedSemester;
            if (searchQuery) params.search = searchQuery;

            const res = await axios.get(url, { params });
            if (res.data.success) {
                setNotes(res.data.notes);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
        // eslint-disable-next-line
    }, [selectedSemester, searchQuery]);

    // Handle note download
    const handleDownload = async (noteId, filePath) => {
        try {
            // Track download in DB
            await axios.post(`${API_URL}/notes/${noteId}/download`);
            // Refresh note metrics in local list
            setNotes(prevNotes => prevNotes.map(note => 
                note._id === noteId ? { ...note, downloadsCount: note.downloadsCount + 1 } : note
            ));
            // Open PDF
            window.open(`${BASE_URL}/${filePath}`, "_blank");
        } catch (error) {
            console.error("Error logging download:", error);
            // Open file anyway
            window.open(`${BASE_URL}/${filePath}`, "_blank");
        }
    };

    // Handle note deletion
    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure you want to delete this study note?")) return;
        try {
            const res = await axios.delete(`${API_URL}/notes/${noteId}`);
            if (res.data.success) {
                setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
            }
        } catch (error) {
            console.error("Error deleting note:", error);
            alert("Failed to delete note. Ensure you have permissions.");
        }
    };

    // Upload note form submit
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setUploadError("");
        setUploadSuccess("");
        setUploading(true);

        if (!uploadTitle || !uploadSubject || !uploadSemester || !uploadUnit || !uploadFile) {
            setUploadError("Please fill in all fields and attach the note PDF file.");
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append("title", uploadTitle);
        formData.append("subject", uploadSubject);
        formData.append("semester", uploadSemester);
        formData.append("unit", uploadUnit);
        formData.append("description", uploadDesc);
        formData.append("noteFile", uploadFile);

        try {
            const res = await axios.post(`${API_URL}/notes`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setUploadSuccess(res.data.message);
                // Clear inputs
                setUploadTitle("");
                setUploadSubject("");
                setUploadDesc("");
                setUploadFile(null);
                
                // Refresh notes list
                fetchNotes();
                
                setTimeout(() => {
                    setShowUploadModal(false);
                    setUploadSuccess("");
                }, 2000);
            }
        } catch (error) {
            setUploadError(error.response?.data?.message || "Error uploading note. Verify you uploaded a PDF.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            
            {/* Header actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Notes Hub</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Search & download study notes for your IT semesters</p>
                </div>
                <button onClick={() => setShowUploadModal(true)} className="btn-primary">
                    <Icons.Plus size={18} />
                    Upload Study Note
                </button>
            </div>

            {/* Filters Row */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
                
                {/* Semester filter list */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", background: "rgba(255, 255, 255, 0.02)", padding: "0.3rem", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                    <button
                        onClick={() => setSelectedSemester("")}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "var(--transition-smooth)",
                            background: selectedSemester === "" ? "var(--primary)" : "transparent",
                            color: selectedSemester === "" ? "white" : "var(--text-secondary)"
                        }}
                    >
                        All Sems
                    </button>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <button
                            key={sem}
                            onClick={() => setSelectedSemester(sem.toString())}
                            style={{
                                padding: "0.5rem 1rem",
                                borderRadius: "8px",
                                border: "none",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "var(--transition-smooth)",
                                background: selectedSemester === sem.toString() ? "var(--primary)" : "transparent",
                                color: selectedSemester === sem.toString() ? "white" : "var(--text-secondary)"
                            }}
                        >
                            Sem {sem}
                        </button>
                    ))}
                </div>

                {/* Search box */}
                <div style={{ display: "flex", alignItems: "center", position: "relative", width: "100%", maxWidth: "300px" }}>
                    <span style={{ position: "absolute", left: "1rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                        <Icons.Search size={18} />
                    </span>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search subject, unit, or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: "2.75rem", width: "100%" }}
                    />
                </div>
            </div>

            {/* Notes List Grid */}
            {loading ? (
                <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", minHeight: "250px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid rgba(99, 102, 241, 0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : notes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed var(--border-glass)", borderRadius: "var(--radius-lg)" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No approved notes found matching your filters.</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Be the first to upload lecture slides or PDFs!</p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {notes.map((note) => {
                        const canDelete = user.role === "admin" || user.role === "faculty" || note.uploadedBy?._id === user.id;

                        return (
                            <div key={note._id} className="glass-card" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                                
                                {/* Note Card Top */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                                        <span className="badge badge-teal">Sem {note.semester}</span>
                                        <span className="badge badge-primary">{note.unit}</span>
                                    </div>
                                    
                                    <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem", fontWeight: 700, lineHeight: 1.3 }}>
                                        {note.title}
                                    </h3>
                                    <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, marginBottom: "0.5rem" }}>
                                        Subject: {note.subject}
                                    </p>
                                    {note.description && (
                                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "1rem" }}>
                                            {note.description}
                                        </p>
                                    )}
                                </div>

                                {/* Note Card Bottom */}
                                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "0.75rem", marginTop: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "0.75rem" }}>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                            By: {note.uploadedBy?.name || "Deleted User"} ({note.uploadedBy?.role})
                                        </span>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <Icons.Download size={12} /> {note.downloadsCount} dls
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            onClick={() => handleDownload(note._id, note.filePath)}
                                            className="btn-primary"
                                            style={{ flex: 1, padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px", justifyContent: "center" }}
                                        >
                                            <Icons.Download size={14} /> Download PDF
                                        </button>

                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(note._id)}
                                                className="btn-secondary"
                                                style={{ padding: "0.5rem", borderRadius: "8px", color: "var(--rose)", borderColor: "rgba(244,63,94,0.2)" }}
                                            >
                                                <Icons.Trash size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Note Upload Modal */}
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
                        
                        {/* Modal Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Upload Syllabus Note</h3>
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
                                <label className="form-label">Note Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Database Indexing Slides"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Subject / Course</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. DBMS, Operating Systems"
                                    value={uploadSubject}
                                    onChange={(e) => setUploadSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className="form-group">
                                    <label className="form-label">Semester</label>
                                    <select
                                        className="input-field"
                                        value={uploadSemester}
                                        onChange={(e) => setUploadSemester(e.target.value)}
                                        required
                                        style={{ height: "45px" }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <option key={s} value={s.toString()}>Semester {s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit Scope</label>
                                    <select
                                        className="input-field"
                                        value={uploadUnit}
                                        onChange={(e) => setUploadUnit(e.target.value)}
                                        required
                                        style={{ height: "45px" }}
                                    >
                                        <option value="Unit 1">Unit 1</option>
                                        <option value="Unit 2">Unit 2</option>
                                        <option value="Unit 3">Unit 3</option>
                                        <option value="Unit 4">Unit 4</option>
                                        <option value="Unit 5">Unit 5</option>
                                        <option value="Whole Syllabus">Whole Syllabus</option>
                                        <option value="Lab Manual">Lab Manual</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Brief Description (Optional)</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Topics covered in this note..."
                                    rows="3"
                                    value={uploadDesc}
                                    onChange={(e) => setUploadDesc(e.target.value)}
                                    style={{ resize: "none" }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                                <label className="form-label">Attachment (PDF Only)</label>
                                <input
                                    type="file"
                                    className="input-field"
                                    accept=".pdf"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    required
                                />
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
                                    {uploading ? "Uploading..." : "Publish Note"}
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

export default NotesSection;
