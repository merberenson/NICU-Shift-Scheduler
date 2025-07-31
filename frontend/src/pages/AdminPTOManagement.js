import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";

const AdminPTOManagement = () => {
    const { getAccessToken } = useAuth();
    const [ptoRequests, setPtoRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [processing, setProcessing] = useState(new Set());
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadPTORequests();
    }, []);

    // Auto-clear messages after 5 seconds
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const loadPTORequests = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/pto', {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Sort by request date (newest first) and then by status priority
                const sortedData = data.sort((a, b) => {
                    const statusPriority = { 'pending': 0, 'approved': 1, 'denied': 2 };
                    if (a.status !== b.status) {
                        return statusPriority[a.status] - statusPriority[b.status];
                    }
                    return new Date(b.createdAt || b.requestedAt) - new Date(a.createdAt || a.requestedAt);
                });
                setPtoRequests(sortedData);
            } else {
                setError('Failed to load PTO requests');
            }
        } catch (err) {
            console.error('Failed to load PTO requests:', err);
            setError('Network error while loading PTO requests');
        } finally {
            setLoading(false);
        }
    };

    const handlePTOAction = async (ptoId, action, notes = '') => {
        if (processing.has(ptoId)) return; // Prevent double-processing
        
        try {
            setProcessing(prev => new Set(prev).add(ptoId));
            setError(null);
            
            const response = await fetch(`/api/pto/${ptoId}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reviewNotes: notes })
            });
            
            if (response.ok) {
                await loadPTORequests(); // Refresh the list
                setSuccess(`PTO request ${action}d successfully!`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || `Failed to ${action} PTO request`);
            }
        } catch (err) {
            console.error(`Failed to ${action} PTO request:`, err);
            setError(`Network error while ${action}ing PTO request`);
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(ptoId);
                return newSet;
            });
        }
    };

    const promptForDenialReason = (ptoId) => {
        const reason = prompt("Please provide a reason for denying this PTO request:");
        if (reason && reason.trim()) {
            handlePTOAction(ptoId, 'deny', reason.trim());
        }
    };

    const filteredRequests = ptoRequests.filter(request => {
        if (filter === 'all') return true;
        return request.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'approved': return '#28a745';
            case 'denied': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusStats = () => {
        const stats = {
            all: ptoRequests.length,
            pending: ptoRequests.filter(r => r.status === 'pending').length,
            approved: ptoRequests.filter(r => r.status === 'approved').length,
            denied: ptoRequests.filter(r => r.status === 'denied').length
        };
        return stats;
    };

    const stats = getStatusStats();

    if (loading) {
        return (
            <AdminLayout>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p>Loading PTO requests...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>PTO Request Management</h2>
                    <button
                        onClick={loadPTORequests}
                        style={styles.refreshButton}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div style={styles.successMessage}>
                        <span>{success}</span>
                        <button 
                            onClick={() => setSuccess(null)}
                            style={styles.closeButton}
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div style={styles.errorMessage}>
                        <span>{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            style={styles.closeButton}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Statistics Cards */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{stats.all}</div>
                        <div style={styles.statLabel}>Total Requests</div>
                    </div>
                    <div style={{...styles.statCard, borderLeft: '4px solid #ffc107'}}>
                        <div style={styles.statNumber}>{stats.pending}</div>
                        <div style={styles.statLabel}>Pending Review</div>
                    </div>
                    <div style={{...styles.statCard, borderLeft: '4px solid #28a745'}}>
                        <div style={styles.statNumber}>{stats.approved}</div>
                        <div style={styles.statLabel}>Approved</div>
                    </div>
                    <div style={{...styles.statCard, borderLeft: '4px solid #dc3545'}}>
                        <div style={styles.statNumber}>{stats.denied}</div>
                        <div style={styles.statLabel}>Denied</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={styles.filterTabs}>
                    {[
                        { key: 'all', label: 'All Requests', count: stats.all },
                        { key: 'pending', label: 'Pending', count: stats.pending },
                        { key: 'approved', label: 'Approved', count: stats.approved },
                        { key: 'denied', label: 'Denied', count: stats.denied }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            style={{
                                ...styles.filterTab,
                                ...(filter === tab.key ? styles.activeFilterTab : {})
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* PTO Requests List */}
                <div style={styles.requestsList}>
                    {filteredRequests.length === 0 ? (
                        <div style={styles.noRequests}>
                            {filter === 'all' 
                                ? "No PTO requests found." 
                                : `No ${filter} PTO requests found.`
                            }
                        </div>
                    ) : (
                        filteredRequests.map(request => (
                            <div key={request._id} style={styles.requestCard}>
                                <div style={styles.requestHeader}>
                                    <div style={styles.nurseInfo}>
                                        <h4 style={styles.nurseName}>
                                            {request.nurseId?.name || 'Unknown Nurse'}
                                        </h4>
                                        <span style={styles.nurseUsername}>
                                            ({request.nurseId?.username || 'N/A'})
                                        </span>
                                    </div>
                                    <div style={{
                                        ...styles.statusBadge, 
                                        backgroundColor: getStatusColor(request.status)
                                    }}>
                                        {request.status.toUpperCase()}
                                    </div>
                                </div>
                                
                                <div style={styles.requestDetails}>
                                    <div style={styles.dateRange}>
                                        <strong>📅 Dates:</strong> {' '}
                                        {new Date(request.startDate).toLocaleDateString()} - {' '}
                                        {new Date(request.endDate).toLocaleDateString()}
                                        <span style={styles.duration}>
                                            ({Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} days)
                                        </span>
                                    </div>
                                    
                                    {request.reason && (
                                        <div style={styles.reason}>
                                            <strong>📝 Reason:</strong> {request.reason}
                                        </div>
                                    )}

                                    <div style={styles.requestMeta}>
                                        <span>
                                            <strong>📥 Requested:</strong> {' '}
                                            {new Date(request.createdAt || request.requestedAt || request.startDate).toLocaleDateString()}
                                        </span>
                                        {request.reviewedAt && (
                                            <span>
                                                <strong>👨‍💼 Reviewed:</strong> {' '}
                                                {new Date(request.reviewedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {request.reviewNotes && (
                                        <div style={styles.reviewNotes}>
                                            <strong>💬 Review Notes:</strong> {request.reviewNotes}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {request.status === 'pending' && (
                                    <div style={styles.actionButtons}>
                                        <button
                                            onClick={() => handlePTOAction(request._id, 'approve')}
                                            disabled={processing.has(request._id)}
                                            style={{
                                                ...styles.actionButton,
                                                ...styles.approveButton,
                                                opacity: processing.has(request._id) ? 0.6 : 1
                                            }}
                                        >
                                            {processing.has(request._id) ? '⏳' : '✅'} Approve
                                        </button>
                                        <button
                                            onClick={() => promptForDenialReason(request._id)}
                                            disabled={processing.has(request._id)}
                                            style={{
                                                ...styles.actionButton,
                                                ...styles.denyButton,
                                                opacity: processing.has(request._id) ? 0.6 : 1
                                            }}
                                        >
                                            {processing.has(request._id) ? '⏳' : '❌'} Deny
                                        </button>
                                    </div>
                                )}

                                {request.status !== 'pending' && (
                                    <div style={styles.completedStatus}>
                                        <span style={styles.completedText}>
                                            {request.status === 'approved' ? '✅ Approved' : '❌ Denied'}
                                            {request.reviewedAt && (
                                                ` on ${new Date(request.reviewedAt).toLocaleDateString()}`
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Bulk Actions (if there are pending requests) */}
                {stats.pending > 0 && (
                    <div style={styles.bulkActions}>
                        <h3>Bulk Actions</h3>
                        <p style={styles.bulkDescription}>
                            Quickly approve all pending requests that don't conflict with scheduling constraints.
                        </p>
                        <button
                            onClick={() => {
                                if (window.confirm(`Are you sure you want to approve all ${stats.pending} pending PTO requests?`)) {
                                    const pendingRequests = ptoRequests.filter(r => r.status === 'pending');
                                    pendingRequests.forEach(request => {
                                        handlePTOAction(request._id, 'approve');
                                    });
                                }
                            }}
                            style={styles.bulkApproveButton}
                        >
                            ✅ Bulk Approve All Pending ({stats.pending})
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto'
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
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '600',
        color: '#333',
        margin: 0
    },
    refreshButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 16px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #c3e6cb'
    },
    errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #f5c6cb'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: 'inherit',
        padding: '0 5px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statNumber: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#333',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    filterTabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '1px solid #dee2e6',
        paddingBottom: '10px'
    },
    filterTab: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px 6px 0 0',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        color: '#666'
    },
    activeFilterTab: {
        backgroundColor: '#007bff',
        color: '#fff'
    },
    requestsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    noRequests: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
    },
    requestCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s'
    },
    requestHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    nurseInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    nurseName: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333',
        margin: 0
    },
    nurseUsername: {
        color: '#666',
        fontSize: '0.9rem'
    },
    statusBadge: {
        padding: '6px 12px',
        borderRadius: '15px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '0.8rem'
    },
    requestDetails: {
        marginBottom: '15px'
    },
    dateRange: {
        marginBottom: '10px',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    duration: {
        color: '#666',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },
    reason: {
        marginBottom: '10px',
        fontSize: '1rem'
    },
    requestMeta: {
        display: 'flex',
        gap: '20px',
        fontSize: '0.9rem',
        color: '#666',
        marginBottom: '10px',
        flexWrap: 'wrap'
    },
    reviewNotes: {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '0.9rem',
        border: '1px solid #dee2e6'
    },
    actionButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
    },
    actionButton: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    approveButton: {
        backgroundColor: '#28a745',
        color: '#fff'
    },
    denyButton: {
        backgroundColor: '#dc3545',
        color: '#fff'
    },
    completedStatus: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
    },
    completedText: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#666'
    },
    bulkActions: {
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
    },
    bulkDescription: {
        color: '#666',
        margin: '10px 0 15px 0'
    },
    bulkApproveButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '12px 20px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    }
};

export default AdminPTOManagement;
