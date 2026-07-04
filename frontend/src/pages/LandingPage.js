import React from "react";
import { Link } from "react-router-dom";
import { Icons } from "../components/Icons";

const LandingPage = () => {
    return (
        <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Ambient Background Glows */}
            <div className="orb-glow orb-primary"></div>
            <div className="orb-glow orb-secondary"></div>
            <div className="orb-glow orb-teal"></div>

            {/* Navbar Header */}
            <header style={{
                display: "flex", 
                justifyContent: "between", 
                alignItems: "center", 
                padding: "1.5rem 5%", 
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid var(--border-glass)",
                position: "sticky",
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                        padding: "0.5rem",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
                    }}>
                        <Icons.BookOpen size={24} style={{ color: "#fff" }} />
                    </div>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                        StudyShare<span className="gradient-text">Hub</span>
                    </span>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "1rem" }}>
                    <Link to="/login" className="btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                        Sign In
                    </Link>
                    <Link to="/register" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                        Register
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
                
                {/* Badge Intro */}
                <div className="badge badge-primary animate-fade-in" style={{ marginBottom: "1.5rem", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
                    IT Department Student Portal
                </div>

                {/* Hero Title */}
                <h1 className="animate-fade-in" style={{
                    fontSize: "3.5rem",
                    lineHeight: 1.1,
                    marginBottom: "1.5rem",
                    maxWidth: "800px",
                    fontWeight: 800
                }}>
                    The Unified Hub for <span className="gradient-text">IT Notes</span>, Notices & Magazines
                </h1>

                {/* Subtitle */}
                <p className="animate-fade-in" style={{
                    color: "var(--text-secondary)",
                    fontSize: "1.25rem",
                    maxWidth: "650px",
                    marginBottom: "2.5rem",
                    lineHeight: 1.6
                }}>
                    Access high-quality lecture materials, stay updated with exam timetables, and read departmental student publications in one unified, role-based platform.
                </p>

                {/* Call To Actions */}
                <div className="animate-fade-in" style={{ display: "flex", gap: "1.25rem", justifyContent: "center", marginBottom: "5rem" }}>
                    <Link to="/register" className="btn-primary" style={{ padding: "0.9rem 2.2rem", fontSize: "1.05rem" }}>
                        Join Student Portal
                    </Link>
                    <Link to="/login" className="btn-secondary" style={{ padding: "0.9rem 2.2rem", fontSize: "1.05rem" }}>
                        Browse Resources
                    </Link>
                </div>

                {/* Stats Section */}
                <div className="glass-container animate-fade-in" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    width: "100%",
                    maxWidth: "900px",
                    padding: "2rem",
                    gap: "2rem",
                    marginBottom: "5rem"
                }}>
                    <div>
                        <div className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: 800 }}>8 Semesters</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Curriculum Covered</div>
                    </div>
                    <div style={{ borderLeft: "1px solid var(--border-glass)", borderRight: "1px solid var(--border-glass)" }}>
                        <div className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: 800 }}>100% Secure</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>ID Verification Checks</div>
                    </div>
                    <div>
                        <div className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: 800 }}>Departmental</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Notices & Magazines</div>
                    </div>
                </div>

                {/* Features Section */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "2rem",
                    width: "100%",
                    textAlign: "left"
                }}>
                    <div className="glass-card">
                        <div style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                            <Icons.Notes size={32} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Structured Study Notes</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                            Upload and download syllabus notes organized by Semester, Subject, and Unit. Admin review ensures zero spam or irrelevant uploads.
                        </p>
                    </div>

                    <div className="glass-card">
                        <div style={{ color: "var(--secondary)", marginBottom: "1rem" }}>
                            <Icons.Notice size={32} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Instant Notice Board</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                            Receive official updates regarding academic timetables, placement drives, guest lectures, and events directly from IT department faculty.
                        </p>
                    </div>

                    <div className="glass-card">
                        <div style={{ color: "var(--teal)", marginBottom: "1rem" }}>
                            <Icons.Magazine size={32} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Creative Magazine Hub</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                            Publish and explore digital departmental newsletters, student tech logs, annual college magazines, and student-run publications.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                textAlign: "center",
                padding: "2rem",
                borderTop: "1px solid var(--border-glass)",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginTop: "auto"
            }}>
                &copy; {new Date().getFullYear()} IT Department Portal - StudyShareHub. Created for Resume Showcase.
            </footer>
        </div>
    );
};

export default LandingPage;
