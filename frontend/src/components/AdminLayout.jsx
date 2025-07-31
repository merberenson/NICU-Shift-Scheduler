import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleEdit = () => {
        navigate('/admin/profile');
    };

    const handleLogout = () => {
        logout();
        navigate('/logout');
    };

    // Navigation items with route matching
    const navigationItems = [
        {
            title: "Dashboard",
            icon: "🏠",
            route: "/admin",
            action: () => navigate('/admin'),
            description: "Main dashboard overview"
        },
        {
            title: "Generate Schedule",
            icon: "⚙️",
            route: "/admin/generate-schedule",
            action: () => navigate('/admin/generate-schedule'),
            description: "Create monthly nurse schedules",
            color: "#007bff"
        },
        {
            title: "View Schedule",
            icon: "📅",
            route: "/teamschedule",
            action: () => navigate('/teamschedule'),
            description: "Review current schedule assignments",
            color: "#28a745"
        },
        {
            title: "Manage Nurses",
            icon: "👥",
            route: "/admin/nurses",
            action: () => navigate('/admin/nurses'),
            description: "Add, edit, or remove nurse profiles",
            color: "#6c757d"
        },
        {
            title: "PTO Requests",
            icon: "🏖️",
            route: "/admin/pto-management",
            action: () => navigate('/admin/pto-management'),
            description: "Review and approve time-off requests",
            color: "#ffc107"
        },
        {
            title: "Emergency",
            icon: "🚨",
            route: "/admin/emergency",
            action: () => navigate('/admin/emergency'),
            description: "Handle absences and on-call assignments",
            color: "#dc3545"
        },
        {
            title: "Blackout Dates",
            icon: "🚫",
            route: "/admin/blackouts",
            action: () => navigate('/admin/blackouts'),
            description: "Manage training and unavailable periods",
            color: "#6f42c1"
        }
    ];

    // Determine which navigation item is currently active
    const getActiveNavItem = () => {
        return navigationItems.find(item => {
            if (item.route === '/admin') {
                return location.pathname === '/admin';
            }
            return location.pathname.startsWith(item.route);
        });
    };

    const activeNavItem = getActiveNavItem();

    return (
        <div style={{
            minHeight: "100vh",
            background: "#232323",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                background: "#fff",
                width: "96vw",
                height: "92vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 0 24px #1d1d1d22",
                borderRadius: "8px",
                overflow: "hidden"
            }}>
                {/* Header */}
                <div style={{
                    padding: "36px 60px 20px 48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                    background: "#fff",
                    zIndex: 10
                }}>
                    <span style={{
                        fontWeight: 400,
                        fontSize: "2.55rem",
                        color: "#222",
                        letterSpacing: "0.4px"
                    }}>
                        NICU Schedule Admin Portal
                    </span>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{ color: "#666", fontSize: "0.9rem" }}>
                            Welcome, {user?.username || 'Admin'}
                        </span>
                        <button
                            onClick={handleEdit}
                            style={{
                                background: "#3BC16C",
                                color: "#fff",
                                border: "none",
                                borderRadius: "7px",
                                padding: "9px 34px",
                                fontWeight: 500,
                                fontSize: "1.09rem",
                                cursor: "pointer",
                                boxShadow: "0 1px 7px #1dbd6b33",
                                transition: "background 0.16s"
                            }}
                            onMouseOver={e => e.currentTarget.style.background = "#249b48"}
                            onMouseOut={e => e.currentTarget.style.background = "#3BC16C"}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Main Content with Sidebar */}
                <div style={styles.contentContainer}>
                    {/* Navigation Sidebar */}
                    <div style={styles.sidebar}>
                        <div style={styles.sidebarHeader}>
                            <h3 style={styles.sidebarTitle}>Navigation</h3>
                            {activeNavItem && (
                                <div style={styles.currentPage}>
                                    <span style={styles.currentPageIcon}>{activeNavItem.icon}</span>
                                    <span style={styles.currentPageTitle}>{activeNavItem.title}</span>
                                </div>
                            )}
                        </div>
                        
                        <div style={styles.navigationList}>
                            {navigationItems.map((item, index) => {
                                const isActive = activeNavItem?.route === item.route;
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            ...styles.navItem,
                                            ...(isActive ? styles.activeNavItem : {}),
                                            borderLeft: item.color ? `4px solid ${item.color}` : '4px solid transparent'
                                        }}
                                        onClick={item.action}
                                    >
                                        <div style={styles.navItemIcon}>{item.icon}</div>
                                        <div style={styles.navItemContent}>
                                            <div style={styles.navItemTitle}>
                                                {item.title}
                                            </div>
                                            <div style={styles.navItemDescription}>{item.description}</div>
                                        </div>
                                        {isActive && (
                                            <div style={styles.activeIndicator}>●</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Logout Button */}
                        <div style={styles.sidebarFooter}>
                            <button
                                onClick={handleLogout}
                                style={styles.logoutButton}
                            >
                                <span style={styles.logoutIcon}>🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Page Content */}
                    <div style={styles.pageContent}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    contentContainer: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
    },
    
    // Sidebar styles
    sidebar: {
        width: '280px',
        background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRight: '1px solid #dee2e6',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    sidebarHeader: {
        padding: '20px',
        borderBottom: '1px solid #dee2e6',
        background: '#fff'
    },
    sidebarTitle: {
        margin: '0 0 10px 0',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333'
    },
    currentPage: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#007bff',
        borderRadius: '6px',
        color: '#fff'
    },
    currentPageIcon: {
        fontSize: '1rem'
    },
    currentPageTitle: {
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    navigationList: {
        flex: 1,
        padding: '10px 0',
        overflow: 'auto'
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'relative'
    },
    activeNavItem: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontWeight: '600'
    },
    navItemIcon: {
        fontSize: '1.3rem',
        marginRight: '12px',
        minWidth: '25px'
    },
    navItemContent: {
        flex: 1
    },
    navItemTitle: {
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#333',
        marginBottom: '2px'
    },
    navItemDescription: {
        fontSize: '0.75rem',
        color: '#666',
        lineHeight: 1.2
    },
    activeIndicator: {
        color: '#007bff',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    sidebarFooter: {
        padding: '20px',
        borderTop: '1px solid #dee2e6'
    },
    logoutButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    logoutIcon: {
        fontSize: '1.1rem'
    },

    // Page content styles
    pageContent: {
        flex: 1,
        overflow: 'auto',
        background: '#fff',
        padding: '0'
    }
};

export default AdminLayout;