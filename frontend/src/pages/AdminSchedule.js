import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const ShiftDetailsPanel = ({ shifts, onClose }) => {
    if (!shifts || shifts.length === 0) {
        return null;
    }

    const sortedShifts = [...shifts].sort((a, b) => {
        if (a.shiftType === 'day' && b.shiftType === 'night') return -1;
        if (a.shiftType === 'night' && b.shiftType === 'day') return 1;
        return 0;
    });

    const date = shifts[0].date;

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={handleContentClick}>
                <div style={styles.detailsHeader}>
                    <h3 style={{ margin: 0, color: '#fff' }}>
                        Shift Details for {new Date(date).toLocaleDateString()}
                    </h3>
                    <button onClick={onClose} style={styles.closeButton}>×</button>
                </div>
                <div style={styles.detailsBody}>
                    {sortedShifts.map((shift, index) => (
                        <div key={index} style={styles.shiftDetailBlock}>
                            <h4 style={styles.shiftTypeHeader}>
                                {shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)} Shift
                            </h4>
                            <p style={styles.shiftInfo}>Required: {shift.requiredEmployees || shift.requiredNurses || 'N/A'}</p>
                            <p style={styles.shiftInfo}>Assigned: {shift.assigned?.length || 0}</p>
                            {shift.assigned && shift.assigned.length > 0 ? (
                                <ul style={styles.employeeList}>
                                    {shift.assigned.map((emp, empIndex) => (
                                        <li key={emp.empID || empIndex} style={styles.employeeListItem}>
                                            <strong>{emp.name}</strong> 
                                            {emp.phone && <span> ({emp.phone})</span>}
                                            {emp.username && <span> - {emp.username}</span>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={styles.noAssignments}>No assignments yet</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdminSchedule = () => {
    const { getAccessToken } = useAuth();
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedShiftDetails, setSelectedShiftDetails] = useState(null);

    const yearMonth = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`;

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError(null);
            
            try {
                console.log(`[DEBUG] Fetching schedule for ${yearMonth}`);
                
                // Try multiple API endpoints to find schedule data
                let response;
                let data = null;
                
                // First try the new API endpoint
                try {
                    response = await fetch(`/api/schedule/${yearMonth}`, {
                        headers: {
                            'Authorization': `Bearer ${getAccessToken()}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        data = await response.json();
                        console.log('[DEBUG] Schedule data from new API:', data);
                    }
                } catch (newApiError) {
                    console.log('[DEBUG] New API failed, trying legacy endpoint');
                }
                
                // If new API fails, try legacy endpoint
                if (!data) {
                    try {
                        response = await fetch(`/api/scheduling/${yearMonth}`, {
                            headers: {
                                'Authorization': `Bearer ${getAccessToken()}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            data = await response.json();
                            console.log('[DEBUG] Schedule data from legacy API:', data);
                        }
                    } catch (legacyApiError) {
                        console.log('[DEBUG] Legacy API also failed');
                    }
                }
                
                // If still no data, try without authentication
                if (!data) {
                    try {
                        response = await fetch(`/schedule/${yearMonth}`);
                        if (response.ok) {
                            data = await response.json();
                            console.log('[DEBUG] Schedule data from basic endpoint:', data);
                        }
                    } catch (basicError) {
                        console.log('[DEBUG] Basic endpoint failed');
                    }
                }
                
                if (data) {
                    // Handle different response formats
                    let scheduleArray = [];
                    if (Array.isArray(data)) {
                        scheduleArray = data;
                    } else if (data.shifts && Array.isArray(data.shifts)) {
                        scheduleArray = data.shifts;
                    } else if (data.data && Array.isArray(data.data)) {
                        scheduleArray = data.data;
                    } else if (data.schedule && Array.isArray(data.schedule)) {
                        scheduleArray = data.schedule;
                    }
                    
                    setScheduleData(scheduleArray);
                    console.log('[DEBUG] Final processed schedule data:', scheduleArray);
                } else {
                    setScheduleData(null);
                    setError("No schedule found for this month. Generate a schedule first.");
                }

            } catch (e) {
                console.error("Failed to fetch schedule:", e);
                setError("Failed to load schedule data. Please try again.");
                setScheduleData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [selectedDate]);

    const handleViewDetails = (shifts) => {
        setSelectedShiftDetails(shifts);
    };

    const handleCloseDetails = () => {
        setSelectedShiftDetails(null);
    };

    const generateCalendarGrid = () => {
        const { year, month } = selectedDate;
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const grid = [];
        const headerRow = (
            <div key="header" style={styles.calendarRow}>
                {weekDays.map(day => (
                    <div key={day} style={styles.calendarHeaderCell}>{day}</div>
                ))}
            </div>
        );
        grid.push(headerRow);

        console.log('[DEBUG] Schedule data for calendar:', scheduleData);
        
        // Create schedule map grouped by day of month
        const scheduleMap = Array.isArray(scheduleData) ?
            scheduleData.reduce((acc, shift) => {
                const dayOfMonth = parseInt(shift.date.split('-')[2], 10);
                if (!acc[dayOfMonth]) {
                    acc[dayOfMonth] = [];
                }
                acc[dayOfMonth].push(shift);
                return acc;
            }, {}) : {};

        let dayCells = [];
        
        // Empty cells for days before first day of month
        for (let i = 0; i < firstDayOfMonth; i++) {
            dayCells.push(<div key={`empty-${i}`} style={styles.calendarCell}></div>);
        }

        console.log('[DEBUG] Schedule map:', scheduleMap);
        
        // Generate cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const shiftsForDay = scheduleMap[day];
            console.log(`[DEBUG] Day ${day} shifts:`, shiftsForDay);
            
            dayCells.push(
                <div key={day} style={styles.calendarCell}>
                    <span style={styles.dayNumber}>{day}</span>
                    
                    {/* Display shift details directly in calendar cell */}
                    <div style={styles.shiftContent}>
                        {shiftsForDay && shiftsForDay.length > 0 ? (
                            shiftsForDay.map((shift, index) => (
                                <div key={index} style={styles.shiftInfo}>
                                    <div style={styles.shiftHeader}>
                                        <strong>{shift.shiftType === 'day' ? '☀️ Day' : '🌙 Night'}</strong>
                                        <span style={styles.shiftCount}>
                                            ({shift.assigned?.length || 0}/{shift.requiredEmployees || shift.requiredNurses || 'N/A'})
                                        </span>
                                    </div>
                                    
                                    {/* Show assigned nurses */}
                                    <div style={styles.nursesAssigned}>
                                        {shift.assigned && shift.assigned.length > 0 ? (
                                            shift.assigned.slice(0, 2).map((emp, empIndex) => (
                                                <div key={empIndex} style={styles.nurseName}>
                                                    {emp.name || `Nurse ${empIndex + 1}`}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={styles.noNurses}>No assignments</div>
                                        )}
                                        
                                        {shift.assigned && shift.assigned.length > 2 && (
                                            <div style={styles.moreNurses}>
                                                +{shift.assigned.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.noShifts}>No shifts</div>
                        )}
                    </div>
                    
                    {/* Schedule button for detailed view */}
                    {shiftsForDay && shiftsForDay.length > 0 && (
                        <button 
                            onClick={() => handleViewDetails(shiftsForDay)} 
                            style={styles.viewButton}
                        >
                            Schedule
                        </button>
                    )}
                </div>
            );
        }
        
        // Fill remaining cells to complete the grid
        const totalCellsInGrid = dayCells.length;
        const remainingCells = totalCellsInGrid % 7;
        if (remainingCells !== 0) {
            const emptyCellsToAdd = 7 - remainingCells;
            for (let i = 0; i < emptyCellsToAdd; i++) {
                dayCells.push(<div key={`empty-end-${i}`} style={styles.calendarCell}></div>);
            }
        }

        // Group cells into weeks
        for (let i = 0; i < dayCells.length; i += 7) {
            grid.push(
                <div key={`week-${i/7}`} style={styles.calendarRow}>
                    {dayCells.slice(i, i + 7)}
                </div>
            );
        }

        return grid;
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setSelectedDate(prev => ({
            ...prev,
            [name]: parseInt(value, 10)
        }));
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <AdminLayout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        Team Schedule - {monthNames[selectedDate.month - 1]} {selectedDate.year}
                    </h2>
                    <button
                        onClick={() => navigate('/admin/generate-schedule')}
                        style={styles.generateButton}
                    >
                        Generate New Schedule
                    </button>
                </div>

                {/* Month/Year Selectors */}
                <div style={styles.selectors}>
                    <select 
                        name="year" 
                        value={selectedDate.year} 
                        onChange={handleDateChange} 
                        style={styles.dropdown}
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select 
                        name="month" 
                        value={selectedDate.month} 
                        onChange={handleDateChange} 
                        style={styles.dropdown}
                    >
                        {monthNames.map((month, index) => (
                            <option key={index + 1} value={index + 1}>{month}</option>
                        ))}
                    </select>
                </div>

                {/* Calendar Container */}
                <div style={styles.calendarContainer}>
                    {loading ? (
                        <div style={styles.statusMessage}>Loading schedule...</div>
                    ) : error ? (
                        <div style={{...styles.statusMessage, color: 'red'}}>{error}</div>
                    ) : (
                        <div style={styles.calendarGrid}>
                            {generateCalendarGrid()}
                        </div>
                    )}
                </div>

                {/* Shift Details Modal */}
                {selectedShiftDetails && (
                    <ShiftDetailsPanel
                        shifts={selectedShiftDetails}
                        onClose={handleCloseDetails}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

const styles = {
    container: {
        padding: '30px',
        maxWidth: '100%',
        height: '100%'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '600',
        color: '#333',
        margin: 0
    },
    generateButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer'
    },
    selectors: {
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px'
    },
    dropdown: {
        padding: '10px', 
        fontSize: '1rem', 
        borderRadius: '8px', 
        border: '1px solid #ccc'
    },
    calendarContainer: {
        width: '100%', 
        height: '600px', 
        display: 'flex', 
        flexDirection: 'column'
    },
    calendarGrid: {
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1, 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px'
    },
    statusMessage: {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        fontSize: '1.2rem', 
        color: '#555'
    },
    calendarRow: {
        display: 'flex', 
        flex: 1
    },
    calendarHeaderCell: {
        flex: 1, 
        padding: '10px', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        background: '#f5f5f5', 
        borderBottom: '1px solid #e0e0e0', 
        borderRight: '1px solid #e0e0e0'
    },
    calendarCell: {
        flex: 1, 
        borderRight: '1px solid #e0e0e0', 
        borderBottom: '1px solid #e0e0e0', 
        padding: '8px', 
        position: 'relative', 
        minHeight: '120px', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    dayNumber: {
        fontWeight: 'bold', 
        fontSize: '0.9rem',
        marginBottom: '5px'
    },
    shiftContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    shiftInfo: {
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '4px',
        backgroundColor: '#f8f9fa',
        fontSize: '0.75rem'
    },
    shiftHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3px'
    },
    shiftCount: {
        fontSize: '0.7rem',
        color: '#666'
    },
    nursesAssigned: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1px'
    },
    nurseName: {
        fontSize: '0.7rem',
        color: '#333',
        backgroundColor: '#e9ecef',
        padding: '1px 3px',
        borderRadius: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    moreNurses: {
        fontSize: '0.65rem',
        color: '#666',
        fontStyle: 'italic'
    },
    noNurses: {
        fontSize: '0.7rem',
        color: '#dc3545',
        fontStyle: 'italic'
    },
    noShifts: {
        fontSize: '0.75rem',
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: '10px'
    },
    viewButton: {
        padding: '4px 8px',
        fontSize: '0.75rem',
        cursor: 'pointer',
        marginTop: 'auto',
        alignSelf: 'center',
        border: '1px solid #007bff',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: '#fff'
    },

    // Modal styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        width: '500px',
        maxWidth: '90%',
        background: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        zIndex: 1001,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
    },
    detailsHeader: {
        padding: '15px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px'
    },
    closeButton: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.8rem',
        lineHeight: 1,
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    detailsBody: {
        padding: '20px',
        overflowY: 'auto'
    },
    shiftDetailBlock: {
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '15px'
    },
    shiftTypeHeader: {
        color: '#007bff',
        margin: '0 0 10px 0'
    },
    employeeList: {
        listStyle: 'none',
        paddingLeft: '0',
        margin: '10px 0 0 0'
    },
    employeeListItem: {
        background: '#fff',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '5px'
    },
    noAssignments: {
        color: '#999',
        fontStyle: 'italic'
    }
};

export default AdminSchedule;