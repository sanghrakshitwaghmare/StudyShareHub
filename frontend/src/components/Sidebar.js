import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icons } from "./Icons";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const navItems = [
        { path: "/dashboard/notes", name: "Notes Hub", icon: <Icons.Notes size={20} /> },
        { path: "/dashboard/notices", name: "Notice Board", icon: <Icons.Notice size={20} /> },
        { path: "/dashboard/magazines", name: "Magazines Shelf", icon: <Icons.Magazine size={20} /> }
    ];

    // Add Admin Panel link if Admin or Faculty
    const canAccessAdmin = user?.role === "admin" || user?.role === "faculty";
    if (canAccessAdmin) {
        navItems.push({
            path: "/dashboard/admin",
            name: "Admin Desk",
            icon: <Icons.Admin size={20} />
        });
    }

    return (
        <aside style={{
            width: "260px",
            background: "rgba(10, 15, 30, 0.6)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid var(--border-glass)",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 40,
            padding: "1.5rem"
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
                <div style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    padding: "0.4rem",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Icons.BookOpen size={20} style={{ color: "#fff" }} />
                </div>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                    StudyShare<span className="gradient-text">Hub</span>
                </span>
            </div>

            {/* Nav Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.8rem 1rem",
                            borderRadius: "10px",
                            color: isActive(item.path) ? "white" : "var(--text-secondary)",
                            background: isActive(item.path) ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)" : "transparent",
                            border: isActive(item.path) ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            transition: "var(--transition-smooth)"
                        }}
                        className="sidebar-link"
                    >
                        <span style={{ color: isActive(item.path) ? "var(--primary)" : "inherit" }}>
                            {item.icon}
                        </span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Profile Section */}
            {user && (
                <div style={{
                    borderTop: "1px solid var(--border-glass)",
                    paddingTop: "1.25rem",
                    marginTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-glass)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary)"
                        }}>
                            <Icons.User size={20} />
                        </div>
                        <div style={{ overflow: "hidden" }}>
                            <div style={{ fontWeight: 650, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user.name}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.15rem" }}>
                                <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'faculty' ? 'badge-primary' : 'badge-teal'}`} style={{ padding: "0.1rem 0.4rem", fontSize: "0.65rem" }}>
                                    {user.role}
                                </span>
                                <span className={`badge ${user.status === 'approved' ? 'badge-success' : 'badge-warning'}`} style={{ padding: "0.1rem 0.4rem", fontSize: "0.65rem" }}>
                                    {user.status === 'approved' ? 'verified' : user.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-secondary"
                        style={{
                            width: "100%",
                            padding: "0.6rem",
                            borderRadius: "10px",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            color: "#fda4af"
                        }}
                    >
                        <Icons.Logout size={16} />
                        Log Out
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
