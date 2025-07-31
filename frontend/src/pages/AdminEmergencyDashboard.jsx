import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";

const AdminEmergencyDashboard = () => {
    const { getAccessToken } = useAuth();
    const [emergencyData, setEmergencyData] = useState({
        recentAbsences: [],
        onCallPools: [],
        emergencyAlerts: [],
        staffingLevels: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadEmergencyData();
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

    const loadEmergencyData = async () => {
        try {
            setLoading(true);
            
            // Mock emergency data for demonstration
            const mockData = {
                recentAbsences: [
                    {
                        _id: '1',
                        nurseId: { name: 'Sarah Johnson', username: 'sjohnson' },
                        date: '2025-08-01',
                        shiftType: 'day',
                        reason: 'Sick leave',
                        status: 'approved',
                        replacementStatus: 'covered',
                        reportedAt: '2025-07-31T22:30:00Z'
                    },
                    {
                        _id: '2',
                        nurseId: { name: 'Mike Chen', username: 'mchen' },
                        date: '2025-08-02',
                        shiftType: 'night',
                        reason: 'Family emergency',
                        status: 'pending',
                        replacementStatus: 'searching',
                        reportedAt: '2025-08-01T14:15:00Z'
                    },
                    {
                        _id: '3',
                        nurseId: { name: 'Lisa Rodriguez', username: 'lrodriguez' },
                        date: '2025-08-01',
                        shiftType: 'day',
                        reason: 'Car trouble',
                        status: 'approved',
                        replacementStatus: 'on_call_assigned',
                        reportedAt: '2025-08-01T06:45:00Z'
                    }
                ],
                onCallPools: [
                    {
                        _id: 'pool1',
                        date: '2025-08-01',
                        shiftType: 'day',
                        targetStaffing: 3,
                        currentStaffing: 2,
                        minimumStaffing: 2,
                        emergencyActivated: false,
                        onCallNurses: [
                            { nurseId: { name: 'Tom Wilson' }, priority: 1, isAvailable: true },
                            { nurseId: { name: 'Anna Davis' }, priority: 2, isAvailable: true },
                            { nurseId: { name: 'John Smith' }, priority: 3, isAvailable: false }
                        ]
                    },
                    {
                        _id: 'pool2',
                        date: '2025-08-01',
                        shiftType: 'night',
                        targetStaffing: 2,
                        currentStaffing: 1,
                        minimumStaffing: 2,
                        emergencyActivated: true,
                        onCallNurses: [
                            { nurseId: { name: 'Maria Garcia' }, priority: 1, isAvailable: true },
                            { nurseId: { name: 'David Lee' }, priority: 2, isAvailable: true }
                        ]
                    }
                ],
                emergencyAlerts: [
                    {
                        _id: 'alert1',
                        type: 'understaffed',
                        severity: 'high',
                        message: 'Night shift is below minimum staffing requirements',
                        shiftType: 'night',
                        date: '2025-08-01',
                        createdAt: '2025-08-01T18:00:00Z'
                    },
                    {
                        _id: 'alert2',
                        type: 'on_call_exhausted',
                        severity: 'medium',
                        message: 'Day shift on-call pool running low',
                        shiftType: 'day',
                        date: '2025-08-02',
                        createdAt: '2025-08-01T12:00:00Z'
                    }
                ],
                staffingLevels: {
                    day: { current: 4, target: 5, minimum: 3 },
                    night: { current: 2, target: 3, minimum: 2 }
                }
            };
            
            setEmergencyData(mockData);
            
        } catch (err) {
            console.error('Error loading emergency data:', err);
            setError('Failed to load emergency data');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAbsence = async (absenceId) => {
        try {
            // Mock approval
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setEmergencyData(prev => ({
                ...prev,
                recentAbsences: prev.recentAbsences.map(absence =>
                    absence._id === absenceId 
                        ? { ...absence, status: 'approved', replacementStatus: 'searching' }
                        : absence
                )
            }));
            
            setSuccess('Absence approved and replacement search initiated');
        } catch (err) {
            setError('Failed to approve absence');
        }
    };

    const handleActivateEmergency = async (poolId) => {
        try {
            // Mock emergency activation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setEmergencyData(prev => ({
                ...prev,
                onCallPools: prev.onCallPools.map(pool =>
                    pool._id === poolId 
                        ? { ...pool, emergencyActivated: true }
                        : pool
                )
            }));
            
            setSuccess('Emergency staffing activated');
        } catch (err) {
            setError('Failed to activate emergency staffing');
        }
    };

    const getStaffingStatus = (current, target, minimum) => {
        if (current < minimum) return { status: 'critical', color: '#dc3545' };
        if (current < target) return { status: 'warning', color: '#ffc107' };
        return { status: 'good', color: '#28a745' };
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getReplacementStatusColor = (status) => {
        switch (status) {
            case 'covered': return '#28a745';
            case 'on_call_assigned': return '#007bff';
            case 'searching': return '#ffc107';
            case 'not_covered': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p>Loading emergency dashboard...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Emergency Management Dashboard</h2>
                    <button
                        onClick={loadEmergencyData}
                        style={styles.refreshButton}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div style={styles.successMessage}>
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)} style={styles.closeButton}>×</button>
                    </div>
                )}

                {error && (
                    <div style={styles.errorMessage}>
                        <span>{error}</span>
                        <button onClick={() => setError(null)} style={styles.closeButton}>×</button>
                    </div>
                )}

                {/* Emergency Alerts */}
                {emergencyData.emergencyAlerts.length > 0 && (
                    <div style={styles.alertsSection}>
                        <h3 style={styles.sectionTitle}>🚨 Active Alerts</h3>
                        <div style={styles.alertsGrid}>
                            {emergencyData.emergencyAlerts.map(alert => (
                                <div key={alert._id} style={{
                                    ...styles.alertCard,
                                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                                }}>
                                    <div style={styles.alertHeader}>
                                        <span style={{
                                            ...styles.severityBadge,
                                            backgroundColor: getSeverityColor(alert.severity)
                                        }}>
                                            {alert.severity.toUpperCase()}
                                        </span>
                                        <span style={styles.alertTime}>
                                            {new Date(alert.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p style={styles.alertMessage}>{alert.message}</p>
                                    <div style={styles.alertDetails}>
                                        <span>Shift: {alert.shiftType}</span>
                                        <span>Date: {new Date(alert.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Current Staffing Levels */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>📊 Current Staffing Levels</h3>
                    <div style={styles.staffingGrid}>
                        {Object.entries(emergencyData.staffingLevels).map(([shift, levels]) => {
                            const status = getStaffingStatus(levels.current, levels.target, levels.minimum);
                            return (
                                <div key={shift} style={{
                                    ...styles.staffingCard,
                                    borderLeft: `4px solid ${status.color}`
                                }}>
                                    <h4 style={styles.shiftTitle}>
                                        {shift === 'day' ? '☀️' : '🌙'} {shift.charAt(0).toUpperCase() + shift.slice(1)} Shift
                                    </h4>
                                    <div style={styles.staffingNumbers}>
                                        <span style={styles.currentStaffing}>
                                            {levels.current} / {levels.target}
                                        </span>
                                        <span style={styles.staffingLabel}>Current / Target</span>
                                    </div>
                                    <div style={styles.staffingStatus}>
                                        <span style={{color: status.color, fontWeight: 'bold'}}>
                                            {status.status.toUpperCase()}
                                        </span>
                                        <span style={styles.minimumNote}>
                                            (Min: {levels.minimum})
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* On-Call Pools */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>👥 On-Call Pools</h3>
                    <div style={styles.poolsGrid}>
                        {emergencyData.onCallPools.map(pool => (
                            <div key={pool._id} style={styles.poolCard}>
                                <div style={styles.poolHeader}>
                                    <h4 style={styles.poolTitle}>
                                        {pool.shiftType === 'day' ? '☀️' : '🌙'} {pool.shiftType} Shift - {new Date(pool.date).toLocaleDateString()}
                                    </h4>
                                    {pool.emergencyActivated && (
                                        <span style={styles.emergencyBadge}>🚨 EMERGENCY ACTIVE</span>
                                    )}
                                </div>
                                
                                <div style={styles.poolStats}>
                                    <span>Current: {pool.currentStaffing}/{pool.targetStaffing}</span>
                                    <span>Minimum: {pool.minimumStaffing}</span>
                                </div>
                                
                                <div style={styles.onCallList}>
                                    <h5>On-Call Nurses:</h5>
                                    {pool.onCallNurses.map((nurse, index) => (
                                        <div key={index} style={styles.onCallNurse}>
                                            <span>{nurse.nurseId.name}</span>
                                            <span style={styles.priority}>Priority {nurse.priority}</span>
                                            <span style={{
                                                ...styles.availabilityBadge,
                                                backgroundColor: nurse.isAvailable ? '#28a745' : '#dc3545'
                                            }}>
                                                {nurse.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                {!pool.emergencyActivated && pool.currentStaffing < pool.minimumStaffing && (
                                    <button
                                        onClick={() => handleActivateEmergency(pool._id)}
                                        style={styles.emergencyButton}
                                    >
                                        🚨 Activate Emergency Staffing
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Absences */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>📋 Recent Absences</h3>
                    <div style={styles.absencesList}>
                        {emergencyData.recentAbsences.length === 0 ? (
                            <div style={styles.noData}>No recent absences</div>
                        ) : (
                            emergencyData.recentAbsences.map(absence => (
                                <div key={absence._id} style={styles.absenceCard}>
                                    <div style={styles.absenceHeader}>
                                        <div>
                                            <h4 style={styles.nurseName}>{absence.nurseId.name}</h4>
                                            <span style={styles.absenceDetails}>
                                                {new Date(absence.date).toLocaleDateString()} - {absence.shiftType} shift
                                            </span>
                                        </div>
                                        <div style={styles.absenceStatus}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: absence.status === 'approved' ? '#28a745' : '#ffc107'
                                            }}>
                                                {absence.status.toUpperCase()}
                                            </span>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getReplacementStatusColor(absence.replacementStatus)
                                            }}>
                                                {absence.replacementStatus.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={styles.absenceReason}>
                                        <strong>Reason:</strong> {absence.reason}
                                    </p>
                                    <p style={styles.reportedTime}>
                                        Reported: {new Date(absence.reportedAt).toLocaleString()}
                                    </p>
                                    {absence.status === 'pending' && (
                                        <button
                                            onClick={() => handleApproveAbsence(absence._id)}
                                            style={styles.approveButton}
                                        >
                                            ✅ Approve & Find Replacement
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const styles = {
    container: {
        padding: '30px',
        maxWidth: '1400px',
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
    section: {
        marginBottom: '40px'
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px'
    },
    alertsSection: {
        marginBottom: '30px'
    },
    alertsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '15px'
    },
    alertCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    alertHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    severityBadge: {
        padding: '4px 8px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: '600'
    },
    alertTime: {
        fontSize: '0.8rem',
        color: '#666'
    },
    alertMessage: {
        margin: '10px 0',
        fontSize: '1rem',
        color: '#333'
    },
    alertDetails: {
        display: 'flex',
        gap: '15px',
        fontSize: '0.9rem',
        color: '#666'
    },
    staffingGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    staffingCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    shiftTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 15px 0'
    },
    staffingNumbers: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '10px'
    },
    currentStaffing: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#333'
    },
    staffingLabel: {
        fontSize: '0.9rem',
        color: '#666'
    },
    staffingStatus: {
        textAlign: 'center'
    },
    minimumNote: {
        fontSize: '0.8rem',
        color: '#666',
        marginLeft: '5px'
    },
    poolsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
    },
    poolCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    poolHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
    },
    poolTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333',
        margin: 0
    },
    emergencyBadge: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600'
    },
    poolStats: {
        display: 'flex',
        gap: '15px',
        marginBottom: '15px',
        fontSize: '0.9rem',
        color: '#666'
    },
    onCallList: {
        marginBottom: '15px'
    },
    onCallNurse: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #eee'
    },
    priority: {
        fontSize: '0.8rem',
        color: '#666'
    },
    availabilityBadge: {
        padding: '2px 6px',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.7rem',
        fontWeight: '500'
    },
    emergencyButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 15px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        width: '100%'
    },
    absencesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    noData: {
        textAlign: 'center',
        padding: '30px',
        color: '#666',
        fontSize: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
    },
    absenceCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    absenceHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
    },
    nurseName: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 5px 0'
    },
    absenceDetails: {
        fontSize: '0.9rem',
        color: '#666'
    },
    absenceStatus: {
        display: 'flex',
        gap: '8px'
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: '500'
    },
    absenceReason: {
        margin: '10px 0',
        fontSize: '0.95rem'
    },
    reportedTime: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '5px 0 15px 0'
    },
    approveButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 15px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer'
    }
};

export default AdminEmergencyDashboard;