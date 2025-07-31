// AdminNurseManagement.js - Complete nurse management interface
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";

const AdminNurseManagement = () => {
    const { getAccessToken } = useAuth();
    
    // Form state for adding new nurse
    const [newNurse, setNewNurse] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        phone: '',
        maxWeeklyHours: 48,
        shiftPreference: 'day',
        hireDate: new Date().toISOString().split('T')[0], // Today's date
        availability: [
            { dayOfWeek: 'Monday', timeOfDay: 'day' },
            { dayOfWeek: 'Tuesday', timeOfDay: 'day' },
            { dayOfWeek: 'Wednesday', timeOfDay: 'day' },
            { dayOfWeek: 'Thursday', timeOfDay: 'day' },
            { dayOfWeek: 'Friday', timeOfDay: 'day' },
            { dayOfWeek: 'Saturday', timeOfDay: 'unavailable' },
            { dayOfWeek: 'Sunday', timeOfDay: 'unavailable' }
        ]
    });
    
    // State management
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingNurse, setEditingNurse] = useState(null);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeOptions = [
        { value: 'day', label: 'Day Shift' },
        { value: 'night', label: 'Night Shift' },
        { value: 'unavailable', label: 'Unavailable' }
    ];

    useEffect(() => {
        loadNurses();
    }, []);

    const loadNurses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/nurses');
            
            if (response.ok) {
                const data = await response.json();
                setNurses(data.nurses || []);
            } else {
                setError('Failed to load nurses');
            }
        } catch (err) {
            console.error('Failed to load nurses:', err);
            setError('Network error while loading nurses');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNurse(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvailabilityChange = (day, timeOfDay) => {
        setNewNurse(prev => ({
            ...prev,
            availability: prev.availability.map(avail =>
                avail.dayOfWeek === day ? { ...avail, timeOfDay } : avail
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/nurses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newNurse)
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(`Nurse ${newNurse.name} added successfully!`);
                setNewNurse({
                    name: '',
                    username: '',
                    password: '',
                    email: '',
                    phone: '',
                    maxWeeklyHours: 48,
                    shiftPreference: 'day',
                    hireDate: new Date().toISOString().split('T')[0],
                    availability: [
                        { dayOfWeek: 'Monday', timeOfDay: 'day' },
                        { dayOfWeek: 'Tuesday', timeOfDay: 'day' },
                        { dayOfWeek: 'Wednesday', timeOfDay: 'day' },
                        { dayOfWeek: 'Thursday', timeOfDay: 'day' },
                        { dayOfWeek: 'Friday', timeOfDay: 'day' },
                        { dayOfWeek: 'Saturday', timeOfDay: 'unavailable' },
                        { dayOfWeek: 'Sunday', timeOfDay: 'unavailable' }
                    ]
                });
                setShowAddForm(false);
                await loadNurses(); // Refresh the list
            } else {
                setError(result.message || 'Failed to add nurse');
            }
        } catch (err) {
            console.error('Failed to add nurse:', err);
            setError('Network error while adding nurse');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNurse = async (nurseId, nurseName) => {
        if (!window.confirm(`Are you sure you want to delete nurse ${nurseName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/nurses/${nurseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSuccess(`Nurse ${nurseName} deleted successfully`);
                await loadNurses();
            } else {
                setError(`Failed to delete nurse ${nurseName}`);
            }
        } catch (err) {
            console.error('Failed to delete nurse:', err);
            setError('Network error while deleting nurse');
        }
    };

    const calculateSeniority = (hireDate) => {
        const years = (Date.now() - new Date(hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return Math.floor(years);
    };

    const getWeekendRotation = (seniority) => {
        if (seniority < 1) return 'Every Other Weekend';
        if (seniority < 25) return 'Every Third Weekend';
        return 'Weekend Exempt';
    };

    if (loading) {
        return (
            <AdminLayout>
                <div style={styles.loading}>Loading nurses...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Nurse Management</h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{...styles.button, ...styles.primaryButton}}
                    >
                        {showAddForm ? 'Cancel' : 'Add New Nurse'}
                    </button>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div style={styles.successMessage}>
                        ✅ {success}
                        <button onClick={() => setSuccess(null)} style={styles.closeButton}>×</button>
                    </div>
                )}
                
                {error && (
                    <div style={styles.errorMessage}>
                        ❌ {error}
                        <button onClick={() => setError(null)} style={styles.closeButton}>×</button>
                    </div>
                )}

                {/* Add New Nurse Form */}
                {showAddForm && (
                    <div style={styles.formSection}>
                        <h3 style={styles.formTitle}>Add New Nurse</h3>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGrid}>
                                {/* Basic Information */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newNurse.name}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Username *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={newNurse.username}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={newNurse.password}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                        placeholder="Enter password"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newNurse.email}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newNurse.phone}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Hire Date *</label>
                                    <input
                                        type="date"
                                        name="hireDate"
                                        value={newNurse.hireDate}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Max Weekly Hours</label>
                                    <input
                                        type="number"
                                        name="maxWeeklyHours"
                                        value={newNurse.maxWeeklyHours}
                                        onChange={handleInputChange}
                                        min="20"
                                        max="60"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Shift Preference</label>
                                    <select
                                        name="shiftPreference"
                                        value={newNurse.shiftPreference}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                    >
                                        <option value="day">Day Shift</option>
                                        <option value="night">Night Shift</option>
                                    </select>
                                </div>
                            </div>

                            {/* Weekly Availability */}
                            <div style={styles.availabilitySection}>
                                <h4 style={styles.availabilityTitle}>Weekly Availability</h4>
                                <div style={styles.availabilityGrid}>
                                    {daysOfWeek.map(day => (
                                        <div key={day} style={styles.availabilityRow}>
                                            <label style={styles.dayLabel}>{day}</label>
                                            <select
                                                value={newNurse.availability.find(a => a.dayOfWeek === day)?.timeOfDay || 'unavailable'}
                                                onChange={(e) => handleAvailabilityChange(day, e.target.value)}
                                                style={styles.availabilitySelect}
                                            >
                                                {timeOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form Actions */}
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
                                    style={{...styles.button, ...styles.primaryButton}}
                                >
                                    {submitting ? 'Adding Nurse...' : 'Add Nurse'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Nurses List */}
                <div style={styles.nursesList}>
                    <h3 style={styles.listTitle}>Current Nurses ({nurses.length})</h3>
                    
                    {nurses.length === 0 ? (
                        <div style={styles.noNurses}>
                            No nurses found. Add your first nurse using the form above.
                        </div>
                    ) : (
                        <div style={styles.nursesGrid}>
                            {nurses.map(nurse => {
                                const seniority = calculateSeniority(nurse.hireDate);
                                const weekendRotation = getWeekendRotation(seniority);
                                
                                return (
                                    <div key={nurse._id} style={styles.nurseCard}>
                                        <div style={styles.nurseHeader}>
                                            <div>
                                                <h4 style={styles.nurseName}>{nurse.name}</h4>
                                                <p style={styles.nurseUsername}>@{nurse.username}</p>
                                            </div>
                                            <div style={styles.nurseActions}>
                                                <button
                                                    onClick={() => handleDeleteNurse(nurse._id, nurse.name)}
                                                    style={{...styles.button, ...styles.dangerButton}}
                                                    title="Delete Nurse"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.nurseDetails}>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailLabel}>Email:</span>
                                                <span>{nurse.email}</span>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailLabel}>Phone:</span>
                                                <span>{nurse.phone}</span>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailLabel}>Shift Preference:</span>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: nurse.shiftPreference === 'day' ? '#007bff' : '#6c757d'
                                                }}>
                                                    {nurse.shiftPreference} shift
                                                </span>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailLabel}>Seniority:</span>
                                                <span>{seniority} years</span>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailLabel}>Weekend Rotation:</span>
                                                <span>{weekendRotation}</span>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailLabel}>Max Hours/Week:</span>
                                                <span>{nurse.maxWeeklyHours || 48} hours</span>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailLabel}>Hire Date:</span>
                                                <span>{new Date(nurse.hireDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Availability Preview */}
                                        <div style={styles.availabilityPreview}>
                                            <span style={styles.detailLabel}>Availability:</span>
                                            <div style={styles.availabilityDots}>
                                                {daysOfWeek.map(day => {
                                                    const avail = nurse.availability?.find(a => a.dayOfWeek === day);
                                                    const status = avail?.timeOfDay || 'unavailable';
                                                    return (
                                                        <div
                                                            key={day}
                                                            style={{
                                                                ...styles.availabilityDot,
                                                                backgroundColor: 
                                                                    status === 'day' ? '#28a745' :
                                                                    status === 'night' ? '#6c757d' : '#dc3545'
                                                            }}
                                                            title={`${day}: ${status}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
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
    loading: {
        textAlign: 'center',
        fontSize: '1.2rem',
        padding: '50px',
        color: '#666'
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
        color: 'inherit'
    },
    formSection: {
        backgroundColor: '#f8f9fa',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
    },
    formTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        fontWeight: '500',
        marginBottom: '5px',
        color: '#333'
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1rem'
    },
    select: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        backgroundColor: '#fff'
    },
    availabilitySection: {
        marginTop: '20px'
    },
    availabilityTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '15px'
    },
    availabilityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px'
    },
    availabilityRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    dayLabel: {
        minWidth: '80px',
        fontWeight: '500',
        color: '#333'
    },
    availabilitySelect: {
        flex: 1,
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '0.9rem'
    },
    formActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
        marginTop: '20px'
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
    dangerButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '5px 10px',
        fontSize: '0.9rem'
    },
    nursesList: {
        marginTop: '30px'
    },
    listTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px'
    },
    noNurses: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    nursesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
    },
    nurseCard: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    nurseHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    nurseName: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 5px 0'
    },
    nurseUsername: {
        color: '#666',
        fontSize: '0.9rem',
        margin: 0
    },
    nurseActions: {
        display: 'flex',
        gap: '5px'
    },
    nurseDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '15px'
    },
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.9rem'
    },
    detailLabel: {
        fontWeight: '500',
        minWidth: '100px',
        color: '#555'
    },
    badge: {
        padding: '4px 8px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: '500'
    },
    availabilityPreview: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '1px solid #eee'
    },
    availabilityDots: {
        display: 'flex',
        gap: '4px'
    },
    availabilityDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        cursor: 'help'
    }
};

export default AdminNurseManagement;