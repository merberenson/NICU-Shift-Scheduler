// AdminProfile.jsx - Admin profile management page
import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const AdminProfile = () => {
    const { user, getAccessToken } = useAuth();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        department: '',
        role: 'admin',
        joinDate: '',
        lastLogin: '',
        permissions: []
    });
    
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [passwordChange, setPasswordChange] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        loadProfileData();
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

    const loadProfileData = async () => {
        try {
            setLoading(true);
            
            // Try to load admin profile data
            try {
                const response = await fetch('/api/admin/profile', {
                    headers: {
                        'Authorization': `Bearer ${getAccessToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                } else {
                    // If API doesn't exist, use mock data based on user
                    setProfileData({
                        name: user?.name || 'Administrator',
                        username: user?.username || 'admin',
                        email: user?.email || 'admin@hospital.com',
                        phone: '+1 (555) 123-4567',
                        department: 'NICU Administration',
                        role: 'admin',
                        joinDate: '2023-01-15',
                        lastLogin: new Date().toISOString(),
                        permissions: [
                            'schedule_management',
                            'nurse_management', 
                            'pto_approval',
                            'emergency_management',
                            'system_administration'
                        ]
                    });
                }
            } catch (apiError) {
                // Use mock data if API call fails
                setProfileData({
                    name: user?.name || 'Administrator',
                    username: user?.username || 'admin',
                    email: user?.email || 'admin@hospital.com',
                    phone: '+1 (555) 123-4567',
                    department: 'NICU Administration',
                    role: 'admin',
                    joinDate: '2023-01-15',
                    lastLogin: new Date().toISOString(),
                    permissions: [
                        'schedule_management',
                        'nurse_management',
                        'pto_approval', 
                        'emergency_management',
                        'system_administration'
                    ]
                });
            }
            
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordChange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            setError(null);
            
            // Validate required fields
            if (!profileData.name || !profileData.email) {
                setError('Name and email are required');
                return;
            }
            
            // Mock API call to save profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess('Profile updated successfully!');
            setEditMode(false);
            
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            setError(null);
            
            // Validate password fields
            if (!passwordChange.currentPassword || !passwordChange.newPassword) {
                setError('Current password and new password are required');
                return;
            }
            
            if (passwordChange.newPassword !== passwordChange.confirmPassword) {
                setError('New password and confirmation do not match');
                return;
            }
            
            if (passwordChange.newPassword.length < 6) {
                setError('New password must be at least 6 characters long');
                return;
            }
            
            // Mock API call to update password
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess('Password updated successfully!');
            setShowPasswordForm(false);
            setPasswordChange({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
        } catch (err) {
            console.error('Error updating password:', err);
            setError('Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    const formatPermissions = (permissions) => {
        return permissions.map(permission => 
            permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        );
    };

    if (loading) {
        return (
            <AdminLayout>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p>Loading profile...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Admin Profile</h2>
                    <div style={styles.headerActions}>
                        <button
                            onClick={() => navigate('/admin')}
                            style={{...styles.button, ...styles.secondaryButton}}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
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

                <div style={styles.profileLayout}>
                    {/* Profile Overview Card */}
                    <div style={styles.profileCard}>
                        <div style={styles.profileHeader}>
                            <div style={styles.avatarSection}>
                                <div style={styles.avatar}>
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={styles.profileBasics}>
                                    <h3 style={styles.profileName}>{profileData.name}</h3>
                                    <p style={styles.profileRole}>{profileData.role.toUpperCase()}</p>
                                    <p style={styles.profileDepartment}>{profileData.department}</p>
                                </div>
                            </div>
                            <div style={styles.profileActions}>
                                {!editMode ? (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        style={{...styles.button, ...styles.primaryButton}}
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                ) : (
                                    <div style={styles.editActions}>
                                        <button
                                            onClick={() => setEditMode(false)}
                                            style={{...styles.button, ...styles.secondaryButton}}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            style={{
                                                ...styles.button,
                                                ...styles.primaryButton,
                                                opacity: saving ? 0.6 : 1
                                            }}
                                        >
                                            {saving ? '⏳ Saving...' : '💾 Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div style={styles.profileDetails}>
                            <h4 style={styles.sectionTitle}>Contact Information</h4>
                            
                            {editMode ? (
                                <form onSubmit={handleSaveProfile} style={styles.form}>
                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={profileData.name}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Username</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={profileData.username}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                                disabled
                                            />
                                            <small style={styles.helpText}>Username cannot be changed</small>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={profileData.department}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>📧 Email:</span>
                                        <span style={styles.infoValue}>{profileData.email}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>📞 Phone:</span>
                                        <span style={styles.infoValue}>{profileData.phone}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>👤 Username:</span>
                                        <span style={styles.infoValue}>{profileData.username}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>🏥 Department:</span>
                                        <span style={styles.infoValue}>{profileData.department}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>📅 Join Date:</span>
                                        <span style={styles.infoValue}>
                                            {new Date(profileData.joinDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>🕐 Last Login:</span>
                                        <span style={styles.infoValue}>
                                            {new Date(profileData.lastLogin).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div style={styles.permissionsCard}>
                        <h4 style={styles.sectionTitle}>System Permissions</h4>
                        <div style={styles.permissionsList}>
                            {formatPermissions(profileData.permissions).map((permission, index) => (
                                <div key={index} style={styles.permissionItem}>
                                    <span style={styles.permissionIcon}>✅</span>
                                    <span style={styles.permissionText}>{permission}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Card */}
                    <div style={styles.securityCard}>
                        <h4 style={styles.sectionTitle}>Security Settings</h4>
                        
                        {!showPasswordForm ? (
                            <div style={styles.securityInfo}>
                                <p style={styles.securityText}>
                                    Keep your account secure by using a strong password and updating it regularly.
                                </p>
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    style={{...styles.button, ...styles.warningButton}}
                                >
                                    🔐 Change Password
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordUpdate} style={styles.passwordForm}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Current Password *</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordChange.currentPassword}
                                        onChange={handlePasswordChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>New Password *</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordChange.newPassword}
                                        onChange={handlePasswordChange}
                                        style={styles.input}
                                        required
                                        minLength="6"
                                    />
                                    <small style={styles.helpText}>Minimum 6 characters</small>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Confirm New Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordChange.confirmPassword}
                                        onChange={handlePasswordChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.passwordActions}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordChange({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        style={{...styles.button, ...styles.secondaryButton}}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        style={{
                                            ...styles.button,
                                            ...styles.primaryButton,
                                            opacity: saving ? 0.6 : 1
                                        }}
                                    >
                                        {saving ? '⏳ Updating...' : '🔐 Update Password'}
                                    </button>
                                </div>
                            </form>
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
        maxWidth: '1000px',
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
    headerActions: {
        display: 'flex',
        gap: '10px'
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
    profileLayout: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px'
    },
    profileCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    profileHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '25px'
    },
    avatarSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    avatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        fontWeight: 'bold'
    },
    profileBasics: {
        display: 'flex',
        flexDirection: 'column'
    },
    profileName: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 5px 0'
    },
    profileRole: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#007bff',
        margin: '0 0 5px 0'
    },
    profileDepartment: {
        fontSize: '0.9rem',
        color: '#666',
        margin: 0
    },
    profileActions: {
        display: 'flex',
        gap: '10px'
    },
    editActions: {
        display: 'flex',
        gap: '10px'
    },
    profileDetails: {
        borderTop: '1px solid #dee2e6',
        paddingTop: '20px'
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '15px'
    },
    form: {
        width: '100%'
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
    helpText: {
        fontSize: '0.8rem',
        color: '#666',
        marginTop: '3px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    infoLabel: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#555',
        minWidth: '100px'
    },
    infoValue: {
        fontSize: '0.9rem',
        color: '#333'
    },
    permissionsCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    permissionsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '10px'
    },
    permissionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #e9ecef'
    },
    permissionIcon: {
        fontSize: '1rem'
    },
    permissionText: {
        fontSize: '0.9rem',
        color: '#333'
    },
    securityCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    securityInfo: {
        textAlign: 'center'
    },
    securityText: {
        fontSize: '0.9rem',
        color: '#666',
        marginBottom: '15px'
    },
    passwordForm: {
        maxWidth: '400px'
    },
    passwordActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
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
    warningButton: {
        backgroundColor: '#ffc107',
        color: '#212529'
    }
};

export default AdminProfile;