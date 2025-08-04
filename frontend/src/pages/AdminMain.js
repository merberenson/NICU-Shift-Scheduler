import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const AdminMain = () => {
    const { user, getAccessToken } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        nurseCount: 0,
        pendingPTO: 0,
        recentSchedules: [],
        systemStatus: 'loading'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load nurse count
            const nursesResponse = await fetch('/nurses');
            if (nursesResponse.ok) {
                const nursesData = await nursesResponse.json();
                setDashboardData(prev => ({
                    ...prev,
                    nurseCount: nursesData.nurses?.length || 0
                }));
            }

            // Load PTO statistics
            try {
                const ptoResponse = await fetch('/api/pto', {
                    headers: {
                        'Authorization': `Bearer ${getAccessToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (ptoResponse.ok) {
                    const ptoData = await ptoResponse.json();
                    const pendingCount = ptoData.filter(pto => pto.status === 'pending').length;
                    setDashboardData(prev => ({
                        ...prev,
                        pendingPTO: pendingCount
                    }));
                }
            } catch (ptoError) {
                console.log('PTO data not available:', ptoError);
            }

            setDashboardData(prev => ({
                ...prev,
                systemStatus: 'operational'
            }));

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setDashboardData(prev => ({
                ...prev,
                systemStatus: 'error'
            }));
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: "Quick Schedule Generate",
            description: "Generate schedule for current month",
            icon: "⚡",
            action: () => navigate('/admin/generate-schedule'),
            color: "#007bff"
        },
        {
            title: "Emergency Coverage",
            description: "Handle urgent staffing needs",
            icon: "🚨",
            action: () => navigate('/admin/emergency'),
            color: "#dc3545"
        },
        {
            title: "Approve PTO",
            description: "Review pending time-off requests",
            icon: "✅",
            action: () => navigate('/admin/pto-management'),
            color: "#28a745",
            badge: dashboardData.pendingPTO
        }
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p>Loading dashboard...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={styles.container}>
                {/* Welcome Section */}
                <div style={styles.welcomeSection}>
                    <h1 style={styles.welcomeTitle}>
                        Welcome back, {user?.username || 'Administrator'}!
                    </h1>
                    <p style={styles.welcomeSubtitle}>
                        Manage your nursing staff schedules and operations from this dashboard.
                    </p>
                </div>

                {/* Stats Overview */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>👥</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{dashboardData.nurseCount}</h3>
                            <p style={styles.statLabel}>Active Nurses</p>
                        </div>
                    </div>
                    
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, color: '#ffc107'}}>🏖️</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{dashboardData.pendingPTO}</h3>
                            <p style={styles.statLabel}>Pending PTO Requests</p>
                        </div>
                    </div>
                    
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, color: dashboardData.systemStatus === 'operational' ? '#28a745' : '#dc3545'}}>
                            {dashboardData.systemStatus === 'operational' ? '✅' : '❌'}
                        </div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>
                                {dashboardData.systemStatus === 'operational' ? 'Good' : 'Error'}
                            </h3>
                            <p style={styles.statLabel}>System Status</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Quick Actions</h2>
                    <div style={styles.quickActionsGrid}>
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.quickActionCard,
                                    borderLeft: `4px solid ${action.color}`
                                }}
                                onClick={action.action}
                            >
                                <div style={styles.quickActionHeader}>
                                    <span style={styles.quickActionIcon}>{action.icon}</span>
                                    <div style={styles.quickActionTitleContainer}>
                                        <h3 style={styles.quickActionTitle}>{action.title}</h3>
                                        {action.badge && action.badge > 0 && (
                                            <span style={{...styles.badge, backgroundColor: action.color}}>
                                                {action.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p style={styles.quickActionDescription}>{action.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Information */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>System Information</h2>
                    <div style={styles.infoCard}>
                        <h3>NICU Schedule Management System</h3>
                        <div style={styles.featureGrid}>
                            <div style={styles.featureItem}>
                                ✅ Automated schedule generation with constraint enforcement
                            </div>
                            <div style={styles.featureItem}>
                                ✅ PTO request management and approval workflow
                            </div>
                            <div style={styles.featureItem}>
                                ✅ Emergency staffing and on-call pool management
                            </div>
                            <div style={styles.featureItem}>
                                ✅ Weekend rotation based on nurse seniority
                            </div>
                            <div style={styles.featureItem}>
                                ✅ Holiday assignment rotation (Christmas/New Year)
                            </div>
                            <div style={styles.featureItem}>
                                ✅ Blackout date management for training periods
                            </div>
                        </div>
                        <div style={styles.systemStats}>
                            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong>Version:</strong> 1.0.0</p>
                            <p><strong>Status:</strong> 
                                <span style={{
                                    color: dashboardData.systemStatus === 'operational' ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold',
                                    marginLeft: '5px'
                                }}>
                                    {dashboardData.systemStatus === 'operational' ? 'Operational' : 'Error'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const styles = {
    container: {
        padding: '30px',
        maxWidth: '100%'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: '#666'
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
    },
    welcomeSection: {
        marginBottom: '30px',
        textAlign: 'center',
        padding: '40px',
        background: 'linear-gradient(135deg, #007bff, #0056b3)',
        borderRadius: '12px',
        color: '#fff'
    },
    welcomeTitle: {
        fontSize: '2.5rem',
        fontWeight: '600',
        margin: '0 0 10px 0'
    },
    welcomeSubtitle: {
        fontSize: '1.1rem',
        opacity: 0.9,
        margin: 0
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '25px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
    },
    statIcon: {
        fontSize: '2.5rem',
        marginRight: '15px',
        color: '#007bff'
    },
    statContent: {
        flex: 1
    },
    statNumber: {
        fontSize: '2rem',
        fontWeight: '700',
        margin: '0 0 5px 0',
        color: '#333'
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#666',
        margin: 0
    },
    section: {
        marginBottom: '40px'
    },
    sectionTitle: {
        fontSize: '1.8rem',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#333'
    },
    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
    },
    quickActionCard: {
        padding: '25px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    quickActionHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
    },
    quickActionIcon: {
        fontSize: '1.8rem',
        marginRight: '12px'
    },
    quickActionTitleContainer: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        gap: '10px'
    },
    quickActionTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: 0,
        color: '#333'
    },
    badge: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600'
    },
    quickActionDescription: {
        fontSize: '0.9rem',
        color: '#666',
        margin: 0,
        lineHeight: 1.4
    },
    infoCard: {
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
    },
    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '10px',
        margin: '20px 0'
    },
    featureItem: {
        padding: '8px 0',
        fontSize: '0.95rem',
        lineHeight: 1.4
    },
    systemStats: {
        marginTop: '25px',
        paddingTop: '20px',
        borderTop: '1px solid #dee2e6',
        color: '#666',
        fontSize: '0.9rem',
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap'
    }
};

export default AdminMain;