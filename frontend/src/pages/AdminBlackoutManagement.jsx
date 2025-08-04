import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";

const AdminBlackoutManagement = () => {
    const { getAccessToken } = useAuth();
    const [blackouts, setBlackouts] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        blackoutType: 'mandatory_training',
        affectedRoles: [],
        affectedNurses: [],
        blockScheduling: true,
        allowEmergencyOverride: false,
        minimumStaffingRequired: 0,
        allDay: true,
        startTime: '',
        endTime: '',
        isRecurring: false,
        recurrencePattern: '',
        recurrenceEnd: '',
        notifyInAdvance: 7
    });

    const blackoutTypes = [
        { value: 'mandatory_training', label: 'Mandatory Training', icon: '📚' },
        { value: 'compliance_meeting', label: 'Compliance Meeting', icon: '📋' },
        { value: 'system_maintenance', label: 'System Maintenance', icon: '⚙️' },
        { value: 'department_meeting', label: 'Department Meeting', icon: '👥' },
        { value: 'emergency_drill', label: 'Emergency Drill', icon: '🚨' },
        { value: 'continuing_education', label: 'Continuing Education', icon: '🎓' },
        { value: 'certification_renewal', label: 'Certification Renewal', icon: '📜' },
        { value: 'other', label: 'Other', icon: '📝' }
    ];

    const roleOptions = [
        { value: 'all_nurses', label: 'All Nurses' },
        { value: 'day_shift', label: 'Day Shift Only' },
        { value: 'night_shift', label: 'Night Shift Only' },
        { value: 'senior_nurses', label: 'Senior Nurses (25+ years)' },
        { value: 'new_hires', label: 'New Hires (<1 year)' },
        { value: 'specific_nurses', label: 'Specific Nurses' }
    ];

    const recurrenceOptions = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' }
    ];

    useEffect(() => {
        loadData();
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

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Load nurses
            const nursesResponse = await fetch('/nurses');
            if (nursesResponse.ok) {
                const nursesData = await nursesResponse.json();
                setNurses(nursesData.nurses || []);
            }
            
            // Mock blackout data for demonstration
            const mockBlackouts = [
                {
                    _id: '1',
                    title: 'Monthly Safety Training',
                    description: 'Mandatory safety training for all nursing staff',
                    startDate: '2025-08-15',
                    endDate: '2025-08-15',
                    blackoutType: 'mandatory_training',
                    status: 'approved',
                    affectedRoles: ['all_nurses'],
                    affectedNurses: [],
                    allDay: true,
                    blockScheduling: true,
                    allowEmergencyOverride: false,
                    minimumStaffingRequired: 2,
                    createdAt: '2025-07-15T10:00:00Z'
                },
                {
                    _id: '2',
                    title: 'EMR System Maintenance',
                    description: 'Electronic Medical Records system will be offline for updates',
                    startDate: '2025-08-22',
                    endDate: '2025-08-22',
                    blackoutType: 'system_maintenance',
                    status: 'draft',
                    affectedRoles: ['day_shift'],
                    affectedNurses: [],
                    allDay: false,
                    startTime: '02:00',
                    endTime: '06:00',
                    blockScheduling: false,
                    allowEmergencyOverride: true,
                    minimumStaffingRequired: 1,
                    createdAt: '2025-07-20T14:30:00Z'
                },
                {
                    _id: '3',
                    title: 'Fire Safety Drill',
                    description: 'Quarterly fire safety drill for entire department',
                    startDate: '2025-09-01',
                    endDate: '2025-09-01',
                    blackoutType: 'emergency_drill',
                    status: 'approved',
                    affectedRoles: ['all_nurses'],
                    affectedNurses: [],
                    allDay: false,
                    startTime: '10:00',
                    endTime: '11:00',
                    blockScheduling: true,
                    allowEmergencyOverride: false,
                    minimumStaffingRequired: 3,
                    isRecurring: true,
                    recurrencePattern: 'quarterly',
                    createdAt: '2025-07-10T09:00:00Z'
                }
            ];
            
            setBlackouts(mockBlackouts);
            
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load blackout dates');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({
            ...prev,
            affectedRoles: prev.affectedRoles.includes(role)
                ? prev.affectedRoles.filter(r => r !== role)
                : [...prev.affectedRoles, role]
        }));
    };

    const handleNurseChange = (nurseId) => {
        setFormData(prev => ({
            ...prev,
            affectedNurses: prev.affectedNurses.includes(nurseId)
                ? prev.affectedNurses.filter(id => id !== nurseId)
                : [...prev.affectedNurses, nurseId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            setError(null);
            
            // Validate form
            if (!formData.title || !formData.startDate || !formData.endDate) {
                setError('Please fill in all required fields');
                return;
            }
            
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                setError('End date must be after start date');
                return;
            }
            
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create new blackout object
            const newBlackout = {
                _id: Date.now().toString(),
                ...formData,
                status: 'draft',
                createdAt: new Date().toISOString()
            };
            
            setBlackouts(prev => [newBlackout, ...prev]);
            setSuccess('Blackout date created successfully!');
            setShowAddForm(false);
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                blackoutType: 'mandatory_training',
                affectedRoles: [],
                affectedNurses: [],
                blockScheduling: true,
                allowEmergencyOverride: false,
                minimumStaffingRequired: 0,
                allDay: true,
                startTime: '',
                endTime: '',
                isRecurring: false,
                recurrencePattern: '',
                recurrenceEnd: '',
                notifyInAdvance: 7
            });
            
        } catch (err) {
            console.error('Error creating blackout:', err);
            setError('Failed to create blackout date');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (blackoutId) => {
        try {
            // Mock approval
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setBlackouts(prev => prev.map(b => 
                b._id === blackoutId ? { ...b, status: 'approved' } : b
            ));
            
            setSuccess('Blackout date approved successfully!');
        } catch (err) {
            setError('Failed to approve blackout date');
        }
    };

    const handleDelete = async (blackoutId) => {
        if (!window.confirm('Are you sure you want to delete this blackout date?')) {
            return;
        }
        
        try {
            // Mock deletion
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setBlackouts(prev => prev.filter(b => b._id !== blackoutId));
            setSuccess('Blackout date deleted successfully!');
        } catch (err) {
            setError('Failed to delete blackout date');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return '#ffa500';
            case 'approved': return '#28a745';
            case 'active': return '#007bff';
            case 'completed': return '#6c757d';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getTypeIcon = (type) => {
        const typeObj = blackoutTypes.find(t => t.value === type);
        return typeObj ? typeObj.icon : '📝';
    };

    const formatRoles = (roles) => {
        return roles.map(role => 
            roleOptions.find(r => r.value === role)?.label || role
        ).join(', ');
    };

    if (loading) {
        return (
            <AdminLayout>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p>Loading blackout dates...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Blackout Date Management</h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{...styles.button, ...styles.primaryButton}}
                    >
                        {showAddForm ? '❌ Cancel' : '➕ Add Blackout Date'}
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

                {/* Add Form */}
                {showAddForm && (
                    <div style={styles.formSection}>
                        <h3>Create New Blackout Date</h3>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGrid}>
                                {/* Basic Information */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        placeholder="e.g., Monthly Safety Training"
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Type</label>
                                    <select
                                        name="blackoutType"
                                        value={formData.blackoutType}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                    >
                                        {blackoutTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.icon} {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                                    <label style={styles.label}>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        style={styles.textarea}
                                        placeholder="Detailed description of the blackout period..."
                                        rows="3"
                                    />
                                </div>

                                {/* Date and Time */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Start Date *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>End Date *</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="allDay"
                                            checked={formData.allDay}
                                            onChange={handleInputChange}
                                            style={styles.checkbox}
                                        />
                                        All Day Event
                                    </label>
                                </div>

                                {!formData.allDay && (
                                    <>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Start Time</label>
                                            <input
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>End Time</label>
                                            <input
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Affected Staff */}
                                <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                                    <label style={styles.label}>Affected Staff</label>
                                    <div style={styles.checkboxGrid}>
                                        {roleOptions.map(role => (
                                            <label key={role.value} style={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.affectedRoles.includes(role.value)}
                                                    onChange={() => handleRoleChange(role.value)}
                                                    style={styles.checkbox}
                                                />
                                                {role.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {formData.affectedRoles.includes('specific_nurses') && (
                                    <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                                        <label style={styles.label}>Select Specific Nurses</label>
                                        <div style={styles.nursesList}>
                                            {nurses.map(nurse => (
                                                <label key={nurse._id} style={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.affectedNurses.includes(nurse._id)}
                                                        onChange={() => handleNurseChange(nurse._id)}
                                                        style={styles.checkbox}
                                                    />
                                                    {nurse.name} ({nurse.username})
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Scheduling Options */}
                                <div style={styles.formGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="blockScheduling"
                                            checked={formData.blockScheduling}
                                            onChange={handleInputChange}
                                            style={styles.checkbox}
                                        />
                                        Block Scheduling
                                    </label>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="allowEmergencyOverride"
                                            checked={formData.allowEmergencyOverride}
                                            onChange={handleInputChange}
                                            style={styles.checkbox}
                                        />
                                        Allow Emergency Override
                                    </label>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Minimum Staffing Required</label>
                                    <input
                                        type="number"
                                        name="minimumStaffingRequired"
                                        value={formData.minimumStaffingRequired}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        min="0"
                                        max="10"
                                    />
                                </div>

                                {/* Recurrence */}
                                <div style={styles.formGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="isRecurring"
                                            checked={formData.isRecurring}
                                            onChange={handleInputChange}
                                            style={styles.checkbox}
                                        />
                                        Recurring Event
                                    </label>
                                </div>

                                {formData.isRecurring && (
                                    <>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Recurrence Pattern</label>
                                            <select
                                                name="recurrencePattern"
                                                value={formData.recurrencePattern}
                                                onChange={handleInputChange}
                                                style={styles.select}
                                            >
                                                <option value="">Select Pattern</option>
                                                {recurrenceOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Recurrence End Date</label>
                                            <input
                                                type="date"
                                                name="recurrenceEnd"
                                                value={formData.recurrenceEnd}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    style={{...styles.button, ...styles.secondaryButton}}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        ...styles.button,
                                        ...styles.primaryButton,
                                        opacity: submitting ? 0.6 : 1
                                    }}
                                >
                                    {submitting ? '⏳ Creating...' : '✅ Create Blackout Date'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Blackout Dates List */}
                <div style={styles.blackoutsList}>
                    <h3>Existing Blackout Dates</h3>
                    {blackouts.length === 0 ? (
                        <div style={styles.noBlackouts}>
                            No blackout dates found. Create your first blackout date above.
                        </div>
                    ) : (
                        blackouts.map(blackout => (
                            <div key={blackout._id} style={styles.blackoutCard}>
                                <div style={styles.blackoutHeader}>
                                    <div style={styles.blackoutTitleArea}>
                                        <span style={styles.blackoutIcon}>
                                            {getTypeIcon(blackout.blackoutType)}
                                        </span>
                                        <div>
                                            <h4 style={styles.blackoutTitle}>{blackout.title}</h4>
                                            <span style={styles.blackoutType}>
                                                {blackoutTypes.find(t => t.value === blackout.blackoutType)?.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.blackoutActions}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(blackout.status)
                                        }}>
                                            {blackout.status.toUpperCase()}
                                        </span>
                                        {blackout.status === 'draft' && (
                                            <button
                                                onClick={() => handleApprove(blackout._id)}
                                                style={{...styles.button, ...styles.approveButton}}
                                            >
                                                ✅ Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(blackout._id)}
                                            style={{...styles.button, ...styles.dangerButton}}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={styles.blackoutDetails}>
                                    {blackout.description && (
                                        <p style={styles.blackoutDescription}>{blackout.description}</p>
                                    )}
                                    
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>📅 Date Range:</span>
                                        <span>
                                            {new Date(blackout.startDate).toLocaleDateString()} - {' '}
                                            {new Date(blackout.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    {!blackout.allDay && blackout.startTime && blackout.endTime && (
                                        <div style={styles.detailRow}>
                                            <span style={styles.detailLabel}>⏰ Time:</span>
                                            <span>{blackout.startTime} - {blackout.endTime}</span>
                                        </div>
                                    )}
                                    
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>👥 Affected:</span>
                                        <span>{formatRoles(blackout.affectedRoles)}</span>
                                    </div>
                                    
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>🚫 Block Scheduling:</span>
                                        <span>{blackout.blockScheduling ? 'Yes' : 'No'}</span>
                                    </div>
                                    
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>🔢 Min Staffing:</span>
                                        <span>{blackout.minimumStaffingRequired} nurses</span>
                                    </div>
                                    
                                    {blackout.isRecurring && (
                                        <div style={styles.detailRow}>
                                            <span style={styles.detailLabel}>🔄 Recurring:</span>
                                            <span>{blackout.recurrencePattern}</span>
                                        </div>
                                    )}
                                    
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>📅 Created:</span>
                                        <span>{new Date(blackout.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

const styles = {
    container: {
        padding: '30px',
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
    formSection: {
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
    },
    form: {
        marginTop: '20px'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '5px'
    },
    input: {
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    select: {
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1rem',
        backgroundColor: '#fff'
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1rem',
        resize: 'vertical'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer'
    },
    checkbox: {
        margin: 0
    },
    checkboxGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginTop: '5px'
    },
    nursesList: {
        maxHeight: '200px',
        overflow: 'auto',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        padding: '10px',
        backgroundColor: '#fff'
    },
    formActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
        marginTop: '30px'
    },
    button: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    primaryButton: {
        backgroundColor: '#007bff',
        color: '#fff'
    },
    secondaryButton: {
        backgroundColor: '#6c757d',
        color: '#fff'
    },
    approveButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '6px 12px',
        fontSize: '0.9rem'
    },
    dangerButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '6px 12px',
        fontSize: '0.9rem'
    },
    blackoutsList: {
        marginTop: '20px'
    },
    noBlackouts: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
    },
    blackoutCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    blackoutHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
    },
    blackoutTitleArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1
    },
    blackoutIcon: {
        fontSize: '1.5rem'
    },
    blackoutTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 5px 0'
    },
    blackoutType: {
        fontSize: '0.9rem',
        color: '#666',
        fontStyle: 'italic'
    },
    blackoutActions: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    statusBadge: {
        padding: '6px 12px',
        borderRadius: '15px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '0.8rem'
    },
    blackoutDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    blackoutDescription: {
        fontSize: '1rem',
        color: '#555',
        margin: '0 0 10px 0',
        fontStyle: 'italic'
    },
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.95rem'
    },
    detailLabel: {
        fontWeight: '600',
        minWidth: '140px',
        color: '#333'
    }
};

export default AdminBlackoutManagement;