import React, { useState, useEffect } from 'react';

const NurseAbsenceReport = () => {
    const [upcomingShifts, setUpcomingShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState('');
    const [absenceType, setAbsenceType] = useState('sick');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUpcomingShifts();
    }, []);

    const loadUpcomingShifts = async () => {
        try {
            // Mock data for demonstration - replace with actual API calls
            const mockShifts = [
                { date: '2025-08-01', shiftType: 'day', workId: 'work1' },
                { date: '2025-08-03', shiftType: 'night', workId: 'work2' },
                { date: '2025-08-05', shiftType: 'day', workId: 'work3' }
            ];
            
            setUpcomingShifts(mockShifts);
            setLoading(false);
            
        } catch (error) {
            console.error('Error loading shifts:', error);
            setMessage('❌ Failed to load your upcoming shifts');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            // Mock submission - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            setMessage('✅ Absence reported successfully! Admin has been notified.');
            
            // Reset form
            setSelectedShift('');
            setAbsenceType('sick');
            setReason('');
            
        } catch (error) {
            console.error('Error reporting absence:', error);
            setMessage('❌ Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        // Mock logout
        alert('Logout functionality would redirect to login page');
    };

    const getShiftDateTime = (date, shiftType) => {
        const shiftDate = new Date(date);
        const hour = shiftType === 'day' ? 7 : 19;
        shiftDate.setHours(hour, 0, 0, 0);
        return shiftDate;
    };

    const isShiftSoon = (date, shiftType) => {
        const shiftDateTime = getShiftDateTime(date, shiftType);
        const now = new Date();
        const hoursUntilShift = (shiftDateTime - now) / (1000 * 60 * 60);
        return hoursUntilShift < 2 && hoursUntilShift > -12; // Within 2 hours before or during shift
    };

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Sidebar */}
            <div style={{
                width: "180px",
                backgroundColor: "#c6c0e6ff",
                padding: "20px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <div style={{ width: "100%" }}>
                    <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
                        <div style={{ height: "200px", width: "160px", backgroundColor: "#ddd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
                            NICU Logo
                        </div>
                    </div>

                    <button onClick={() => window.location.href = '/'} style={sidebarButtonStyle()}>
                        🏠 Main
                    </button>
                    <button onClick={() => window.location.href = '/schedule'} style={sidebarButtonStyle()}>
                        📅 Weekly Schedule
                    </button>
                    <button onClick={() => window.location.href = '/availability'} style={sidebarButtonStyle()}>
                        ✏️ Update Availability
                    </button>
                    <button onClick={() => window.location.href = '/pto'} style={sidebarButtonStyle()}>
                        📋 PTO Request
                    </button>
                    <button disabled style={sidebarButtonStyle(true)}>
                        ⚠️ Report Absence
                    </button>
                </div>

                <button onClick={handleLogout} style={logoutButtonStyle}>
                    🔓 Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "120px 60px 20px", display: "flex", justifyContent: "center" }}>
                <div style={{
                    width: "100%",
                    maxWidth: 600,
                    background: "#fff",
                    borderRadius: 20,
                    padding: "30px 36px",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
                }}>
                    <h2 style={{ 
                        textAlign: "center", 
                        marginBottom: 26, 
                        fontWeight: "bold", 
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px"
                    }}>
                        ⚠️ Report Absence
                    </h2>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                            Loading your upcoming shifts...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                                    Select Shift to Report Absence:
                                </label>
                                <select
                                    value={selectedShift}
                                    onChange={(e) => setSelectedShift(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: 8,
                                        border: "1px solid #ccc",
                                        fontSize: "1rem",
                                        background: "#fff",
                                    }}
                                >
                                    <option value="">Select a shift...</option>
                                    {upcomingShifts.map((shift, index) => {
                                        const shiftDateTime = getShiftDateTime(shift.date, shift.shiftType);
                                        const isUrgent = isShiftSoon(shift.date, shift.shiftType);
                                        
                                        return (
                                            <option key={index} value={shift.workId || `${shift.date}-${shift.shiftType}`}>
                                                {shift.date} - {shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)} Shift
                                                {isUrgent ? ' ⚠️ URGENT' : ''}
                                                ({shiftDateTime.toLocaleDateString()} at {shiftDateTime.toLocaleTimeString()})
                                            </option>
                                        );
                                    })}
                                </select>
                                {upcomingShifts.length === 0 && (
                                    <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>
                                        No upcoming shifts found. Please contact admin if this is incorrect.
                                    </p>
                                )}
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                                    Absence Type:
                                </label>
                                <select
                                    value={absenceType}
                                    onChange={(e) => setAbsenceType(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: 8,
                                        border: "1px solid #ccc",
                                        fontSize: "1rem",
                                        background: "#fff",
                                    }}
                                >
                                    <option value="sick">Sick Leave</option>
                                    <option value="emergency">Personal Emergency</option>
                                    <option value="family_emergency">Family Emergency</option>
                                    <option value="personal">Personal Reasons</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                                    Reason (Optional):
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Provide additional details if needed..."
                                    rows={3}
                                    maxLength={500}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: 8,
                                        border: "1px solid #ccc",
                                        fontSize: "1rem",
                                        fontFamily: "inherit",
                                        resize: "vertical"
                                    }}
                                />
                                <div style={{ fontSize: "0.8rem", color: "#666", textAlign: "right" }}>
                                    {reason.length}/500 characters
                                </div>
                            </div>

                            {selectedShift && (
                                <div style={{
                                    backgroundColor: "#fff3cd",
                                    border: "1px solid #ffeaa7",
                                    borderRadius: 6,
                                    padding: "12px",
                                    marginBottom: 16
                                }}>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#856404" }}>
                                        ⚠️ Important Information
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#856404", fontSize: "0.9rem" }}>
                                        <li>Your absence will be reported immediately to administration</li>
                                        <li>The system will attempt to find a replacement from the on-call pool</li>
                                        <li>If reporting less than 2 hours before your shift, this will be marked as critical</li>
                                        <li>You may be contacted for additional information</li>
                                    </ul>
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
                                <button
                                    type="button"
                                    onClick={() => window.location.href = '/'}
                                    style={{
                                        width: "50%",
                                        padding: "12px",
                                        backgroundColor: "#808080",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "20px",
                                        fontWeight: "bold",
                                        fontSize: "1rem",
                                        cursor: "pointer",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "#808080")}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedShift}
                                    style={{
                                        width: "50%",
                                        padding: "12px",
                                        backgroundColor: isSubmitting || !selectedShift ? "#ccc" : "#dc2626",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "20px",
                                        fontWeight: "bold",
                                        fontSize: "1rem",
                                        cursor: isSubmitting || !selectedShift ? "not-allowed" : "pointer",
                                        transition: "background 0.2s"
                                    }}
                                >
                                    {isSubmitting ? 'Reporting...' : 'Report Absence'}
                                </button>
                            </div>

                            {message && (
                                <div style={{ 
                                    marginTop: 18, 
                                    textAlign: "center", 
                                    fontWeight: "bold", 
                                    color: message.startsWith("✅") ? "#186b3a" : "#c42a3d",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    backgroundColor: message.startsWith("✅") ? "#d4edda" : "#f8d7da"
                                }}>
                                    {message}
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const sidebarButtonStyle = (active = false) => ({
    width: "100%",
    marginBottom: "12px",
    padding: "12px 14px",
    backgroundColor: active ? "#dc2626" : "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: active ? "default" : "pointer",
    boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
    textAlign: "center",
    opacity: active ? 0.8 : 1
});

const logoutButtonStyle = {
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "18px",
    padding: "10px 20px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

export default NurseAbsenceReport;