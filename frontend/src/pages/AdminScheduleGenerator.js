// AdminScheduleGenerator.js - New page for schedule generation
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const AdminScheduleGenerator = () => {
    const { getAccessToken, getUserId } = useAuth();
    const navigate = useNavigate();
    
    const [selectedMonth, setSelectedMonth] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    
    const [schedulePreview, setSchedulePreview] = useState(null);
    const [scheduleTemplate, setScheduleTemplate] = useState(null);
    const [generationStatus, setGenerationStatus] = useState('idle'); // idle, loading, success, error
    const [generationResult, setGenerationResult] = useState(null);
    const [error, setError] = useState(null);

    const yearMonth = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`;

    useEffect(() => {
        loadSchedulePreview();
        loadScheduleTemplate();
    }, [selectedMonth]);

    const loadSchedulePreview = async () => {
        try {
            const response = await fetch(`/api/schedule/preview/${yearMonth}`, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSchedulePreview(data.data);
            }
        } catch (err) {
            console.error('Failed to load schedule preview:', err);
        }
    };

    const loadScheduleTemplate = async () => {
        try {
            const response = await fetch(`/api/schedule/template/${yearMonth}`, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setScheduleTemplate(data.data);
            } else {
                setScheduleTemplate(null);
            }
        } catch (err) {
            console.error('Failed to load schedule template:', err);
            setScheduleTemplate(null);
        }
    };

    const handleGenerateSchedule = async (forceRegenerate = false) => {
        setGenerationStatus('loading');
        setError(null);
        
        try {
            const response = await fetch(`/api/schedule/generate/${yearMonth}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ forceRegenerate })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setGenerationStatus('success');
                setGenerationResult(result);
                await loadScheduleTemplate(); // Refresh template data
            } else {
                setGenerationStatus('error');
                setError(result.message || 'Schedule generation failed');
            }
        } catch (err) {
            setGenerationStatus('error');
            setError('Network error during schedule generation');
            console.error('Schedule generation error:', err);
        }
    };

    const handlePublishSchedule = async () => {
        try {
            const response = await fetch(`/api/schedule/publish/${yearMonth}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                await loadScheduleTemplate();
                alert('Schedule published successfully!');
            } else {
                const error = await response.json();
                alert(`Failed to publish schedule: ${error.message}`);
            }
        } catch (err) {
            alert('Network error while publishing schedule');
            console.error('Publish error:', err);
        }
    };

    const handleDeleteSchedule = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete the schedule for ${yearMonth}? This cannot be undone.`);
        if (!confirmed) {
            return;
        }
        
        try {
            const response = await fetch(`/api/schedule/${yearMonth}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                setScheduleTemplate(null);
                setGenerationResult(null);
                alert('Schedule deleted successfully!');
            } else {
                const error = await response.json();
                alert(`Failed to delete schedule: ${error.message}`);
            }
        } catch (err) {
            alert('Network error while deleting schedule');
            console.error('Delete error:', err);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setSelectedMonth(prev => ({
            ...prev,
            [name]: parseInt(value, 10)
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return '#ffa500';
            case 'generated': return '#007bff';
            case 'published': return '#28a745';
            case 'archived': return '#6c757d';
            default: return '#6c757d';
        }
    };

    return (
        <AdminLayout>
            <div style={styles.container}>
                <h2 style={styles.title}>Schedule Generation</h2>
                
                {/* Month Selection */}
                <div style={styles.section}>
                    <h3>Select Month</h3>
                    <div style={styles.dateSelectors}>
                        <select name="year" value={selectedMonth.year} onChange={handleDateChange} style={styles.select}>
                            {[...Array(3).keys()].map(i => {
                                const year = new Date().getFullYear() + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                        <select name="month" value={selectedMonth.month} onChange={handleDateChange} style={styles.select}>
                            {[...Array(12).keys()].map(i => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Current Schedule Status */}
                {scheduleTemplate && (
                    <div style={styles.section}>
                        <h3>Current Schedule Status</h3>
                        <div style={styles.statusCard}>
                            <div style={{...styles.statusBadge, backgroundColor: getStatusColor(scheduleTemplate.status)}}>
                                {scheduleTemplate.status.toUpperCase()}
                            </div>
                            <div style={styles.statusDetails}>
                                {scheduleTemplate.generatedAt && (
                                    <p>Generated: {new Date(scheduleTemplate.generatedAt).toLocaleString()}</p>
                                )}
                                {scheduleTemplate.generatedBy && (
                                    <p>Generated by: {scheduleTemplate.generatedBy.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Preview */}
                {schedulePreview && (
                    <div style={styles.section}>
                        <h3>Schedule Preview</h3>
                        <div style={styles.previewGrid}>
                            <div style={styles.previewCard}>
                                <h4>Nurse Coverage</h4>
                                <p>Total Active Nurses: {schedulePreview.stats.totalActiveNurses}</p>
                                <p>Day Shift Nurses: {schedulePreview.stats.dayShiftNurses}</p>
                                <p>Night Shift Nurses: {schedulePreview.stats.nightShiftNurses}</p>
                                <p>Weekend Eligible: {schedulePreview.stats.weekendEligibleNurses}</p>
                            </div>
                            <div style={styles.previewCard}>
                                <h4>PTO Requests</h4>
                                <p>Pending: {schedulePreview.stats.pendingPTORequests}</p>
                                <p>Approved: {schedulePreview.stats.approvedPTORequests}</p>
                            </div>
                        </div>
                        
                        {schedulePreview.stats.pendingPTORequests > 0 && (
                            <div style={styles.warning}>
                                ⚠️ Warning: There are {schedulePreview.stats.pendingPTORequests} pending PTO requests. 
                                Consider reviewing them before generating the schedule.
                            </div>
                        )}
                    </div>
                )}

                {/* Generation Controls */}
                <div style={styles.section}>
                    <h3>Schedule Generation</h3>
                    <div style={styles.buttonGroup}>
                        <button
                            onClick={() => handleGenerateSchedule(false)}
                            disabled={generationStatus === 'loading'}
                            style={{...styles.button, ...styles.primaryButton}}
                        >
                            {generationStatus === 'loading' ? 'Generating...' : 'Generate Schedule'}
                        </button>
                        
                        {scheduleTemplate && (
                            <button
                                onClick={() => handleGenerateSchedule(true)}
                                disabled={generationStatus === 'loading'}
                                style={{...styles.button, ...styles.warningButton}}
                            >
                                Force Regenerate
                            </button>
                        )}
                        
                        {scheduleTemplate?.status === 'generated' && (
                            <button
                                onClick={handlePublishSchedule}
                                style={{...styles.button, ...styles.successButton}}
                            >
                                Publish Schedule
                            </button>
                        )}
                        
                        {scheduleTemplate && (
                            <button
                                onClick={handleDeleteSchedule}
                                style={{...styles.button, ...styles.dangerButton}}
                            >
                                Delete Schedule
                            </button>
                        )}
                    </div>
                </div>

                {/* Generation Result */}
                {generationStatus === 'success' && generationResult && (
                    <div style={styles.section}>
                        <h3>Generation Result</h3>
                        <div style={styles.successCard}>
                            <p>✅ {generationResult.message}</p>
                            {generationResult.data && (
                                <div>
                                    <p>Total Shifts: {generationResult.data.totalShifts}</p>
                                    <p>Nurses Scheduled: {generationResult.data.nursesScheduled}</p>
                                    <p>Weekend Shifts: {generationResult.data.weekendShifts}</p>
                                </div>
                            )}
                            {generationResult.warnings && generationResult.warnings.length > 0 && (
                                <div style={styles.warnings}>
                                    <h4>Warnings:</h4>
                                    {generationResult.warnings.map((warning, index) => (
                                        <p key={index} style={styles.warningText}>⚠️ {warning}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {generationStatus === 'error' && error && (
                    <div style={styles.section}>
                        <div style={styles.errorCard}>
                            <p>❌ {error}</p>
                        </div>
                    </div>
                )}

                {/* Quick Navigation */}
                <div style={styles.section}>
                    <h3>Quick Actions</h3>
                    <div style={styles.buttonGroup}>
                        <button
                            onClick={() => navigate('/teamschedule')}
                            style={{...styles.button, ...styles.secondaryButton}}
                        >
                            View Generated Schedule
                        </button>
                        <button
                            onClick={() => navigate('/admin')}
                            style={{...styles.button, ...styles.secondaryButton}}
                        >
                            Back to Admin Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '600',
        marginBottom: '30px',
        color: '#333'
    },
    section: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
    },
    dateSelectors: {
        display: 'flex',
        gap: '15px',
        marginTop: '10px'
    },
    select: {
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: '#fff'
    },
    statusCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginTop: '10px'
    },
    statusBadge: {
        padding: '8px 16px',
        borderRadius: '20px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    statusDetails: {
        flex: 1
    },
    previewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '15px'
    },
    previewCard: {
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        border: '1px solid #ddd'
    },
    warning: {
        marginTop: '15px',
        padding: '12px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        color: '#856404'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginTop: '15px'
    },
    button: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    primaryButton: {
        backgroundColor: '#007bff',
        color: '#fff'
    },
    secondaryButton: {
        backgroundColor: '#6c757d',
        color: '#fff'
    },
    successButton: {
        backgroundColor: '#28a745',
        color: '#fff'
    },
    warningButton: {
        backgroundColor: '#ffc107',
        color: '#212529'
    },
    dangerButton: {
        backgroundColor: '#dc3545',
        color: '#fff'
    },
    successCard: {
        padding: '15px',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        color: '#155724'
    },
    errorCard: {
        padding: '15px',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        color: '#721c24'
    },
    warnings: {
        marginTop: '10px'
    },
    warningText: {
        margin: '5px 0',
        fontSize: '0.9rem'
    }
};

export default AdminScheduleGenerator;