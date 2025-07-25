import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Dummy action handlers for demo
function handleEdit() {
  alert("Edit Admin Info - Not Implemented Yet!");
}


const ShiftDetailsPanel = ({ shifts, onClose }) => {
    if (!shifts || shifts.length === 0) {
        return null;
    }

    const sortedShifts = [...shifts].sort((a, b) => {
        if (a.shiftType === 'night' && b.shiftType === 'day') {
            return 1;
        }
        if (a.shiftType === 'day' && b.shiftType === 'night') {
            return -1;
        }
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
                    <h3 style={{ margin: 0, color: '#fff' }}>Shift Details for {date}</h3>
                    <button onClick={onClose} style={styles.closeButton}>×</button>
                </div>
                <div style={styles.detailsBody}>
                    {sortedShifts.map((shift, index) => (
                        <div key={index} style={styles.shiftDetailBlock}>
                            <h4 style={styles.shiftTypeHeader}>{shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)} Shift</h4>
                            <p style={styles.shiftInfo}>Required Employees: {shift.requiredEmployees}</p>
                            <p style={styles.shiftInfo}>Assigned: {shift.assigned.length}</p>
                            <ul style={styles.employeeList}>
                                {shift.assigned.map(emp => (
                                    <li key={emp.empID} style={styles.employeeListItem}>
                                        <strong>{emp.name}</strong> ({emp.phone})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const AdminSchedule = ({ nurse }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    });

    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedShiftDetails, setSelectedShiftDetails] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/logout');
    };

    const handleMain = () => {
        navigate('/admin');
    };

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError(null);
            
            const formattedMonth = String(selectedDate.month).padStart(2, '0');
            console.log(user)
            const apiUrl = `http://localhost:5000/api/schedule/${selectedDate.year}-${formattedMonth}`;

            console.log(`Fetching data from: ${apiUrl}`);

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json();
                
                if (responseData.success && Array.isArray(responseData.data)) {
                    const processedData = responseData.data.map(shift => {
                        if (!Array.isArray(shift.assigned)) {
                            return shift;
                        }

                        const uniqueEmployeesMap = new Map();
                        shift.assigned.forEach(employee => {
                            uniqueEmployeesMap.set(employee.empID, employee);
                        });

                        return {
                            ...shift,
                            assigned: Array.from(uniqueEmployeesMap.values())
                        };
                    });

                    setScheduleData(processedData);
                } else {
                    setScheduleData([]); 
                    throw new Error(responseData.message || "API response did not contain valid data.");
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
        const headerRow = <div key="header" style={styles.calendarRow}>{weekDays.map(day => <div key={day} style={styles.calendarHeaderCell}>{day}</div>)}</div>;
        grid.push(headerRow);

        console.log(scheduleData);
         const scheduleMap = Array.isArray(scheduleData) ? scheduleData.reduce((acc, shift) => {
            const dayOfMonth = parseInt(shift.date.split('-')[2], 10);
            if (!acc[dayOfMonth]) {
                acc[dayOfMonth] = [];
            }
            acc[dayOfMonth].push(shift);
            return acc;
        }, {}) : {};


        let dayCells = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            dayCells.push(<div key={`empty-${i}`} style={styles.calendarCell}></div>);
        }

        console.log(scheduleMap);
        for (let day = 1; day <= daysInMonth; day++) {
            const shiftsForDay = scheduleMap[day];
            console.log(shiftsForDay)
            dayCells.push(
                <div key={day} style={styles.calendarCell}>
                    <span style={styles.dayNumber}>{day}</span>
                        <button onClick={() => handleViewDetails(shiftsForDay)} style={styles.viewButton} disabled={!shiftsForDay}>
                            Schedule
                        </button>
                </div>
            );
        }
        
        const totalCellsInGrid = dayCells.length;
        const remainingCells = totalCellsInGrid % 7;
        if (remainingCells !== 0) {
            const emptyCellsToAdd = 7 - remainingCells;
            for (let i = 0; i < emptyCellsToAdd; i++) {
                dayCells.push(<div key={`empty-end-${i}`} style={styles.calendarCell}></div>);
            }
        }

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
        borderRadius: "0"
        }}>
        {/* Header */}
        <div style={{
            padding: "36px 60px 0 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
        }}>
            <span style={{
            fontWeight: 400,
            fontSize: "2.55rem",
            color: "#222",
            letterSpacing: "0.4px"
            }}>
            NICU Schedule Admin Portal
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
            Edit
            </button>
        </div>
        <div style={{
            display: "flex",
            flex: 1,
            height: "100%",
            alignItems: "flex-start"
        }}>
            <div style={{
            width: "305px",
            background: "#929292",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            borderRadius: "0 0 0 34px",
            boxShadow: "6px 0 24px #ececec18"
            }}>
            <button
                onClick={handleMain}
                style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                color: "#fff",
                border: "none",
                fontWeight: 400,
                fontSize: "1.08rem",
                borderRadius: "33px",
                margin: "8px 0 0 32px",
                padding: "17px 42px",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s"
                }}
                onMouseOver={e => {
                e.currentTarget.style.background = "#e3e4e7";
                e.currentTarget.style.color = "#232323";
                }}
                onMouseOut={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#fff";
                }}
            >
                <span style={{ fontSize: "1.38rem", marginRight: 13 }}>📁</span>
                Main
            </button>
            <button
                style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                color: "#232323",
                border: "none",
                fontWeight: 600,
                fontSize: "1.15rem",
                borderRadius: "36px",
                margin: "42px 0 18px 22px",
                padding: "19px 50px",
                boxShadow: "0 5px 16px #e4e4ed",
                cursor: "pointer"
                }}
                disabled
            >
                <span style={{ fontSize: "1.55rem", marginRight: 15 }}>🗓️</span>
                Schedule
            </button>
            <div style={{ flex: 1 }} />
            <button
                onClick={handleLogout}
                style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                color: "#eea05b",
                border: "none",
                fontWeight: 400,
                fontSize: "1.12rem",
                borderRadius: "29px",
                margin: "0 0 42px 32px",
                padding: "15px 39px",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s"
                }}
                onMouseOver={e => {
                e.currentTarget.style.background = "#fae4c2";
                e.currentTarget.style.color = "#f96c27";
                }}
                onMouseOut={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#eea05b";
                }}
            >
                <span style={{ fontSize: "1.28rem", marginRight: 13 }}>🟫</span>
                Logout
            </button>
        </div>
        
            <div style={{
                fontWeight: 400,
                fontSize: "2rem",
                marginBottom: 10,
                color: "#232323",
                textAlign: "left"
            }}>
                Monthly SChedule
                <div style={styles.selectors}>
                    <select name="year" value={selectedDate.year} onChange={handleDateChange} style={styles.dropdown}>
                        {[...Array(10).keys()].map(i => {
                            const year = new Date().getFullYear() - 5 + i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                    <select name="month" value={selectedDate.month} onChange={handleDateChange} style={styles.dropdown}>
                        {[...Array(12).keys()].map(i => (
                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
            </div>
        
        {selectedShiftDetails && <ShiftDetailsPanel shifts={selectedShiftDetails} onClose={handleCloseDetails} />}

        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            padding: "70px 0 0 60px",
            position: "relative"
        }}>
            {/* -- This is the new section -- */}
            <div style={styles.calendarContainer}>
                <h2 style={styles.calendarTitle}></h2>
                <div style={styles.calendarGrid}>
                    {loading ? (
                        <div style={styles.statusMessage}>Loading schedule...</div>
                    ) : error ? (
                        <div style={{...styles.statusMessage, color: 'red'}}>{error}</div>
                    ) : (
                        generateCalendarGrid()
                    )}
                </div>
            </div>

        </div>
        </div>
    </div>
    </div>
)};

const styles = {
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
        zIndex: 1000, 
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
        flexDirection: 'column',
    },
    detailsHeader: {
        padding: '15px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
    },
    closeButton: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.8rem',
        lineHeight: 1,
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    detailsBody: {
        padding: '20px',
        overflowY: 'auto',
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
    shiftInfo: {
        margin: '5px 0',
        fontSize: '0.95rem'
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
    viewButton: {
        padding: '5px 10px',
        fontSize: '0.8rem',
        cursor: 'pointer',
        marginTop: 'auto',
        alignSelf: 'flex-start',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f0f0f0'
    },

    calendarContainer: { width: '80%', height: '100%', display: 'flex', flexDirection: 'column' },
    calendarTitle: { fontWeight: 400, fontSize: "2rem", color: "#232323", textAlign: "left", marginBottom: 20 },
    selectors: { display: 'left', gap: '15px', marginBottom: '20px' },
    dropdown: { padding: '10px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' },
    calendarGrid: { display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #e0e0e0', borderRadius: '8px' },
    statusMessage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.2rem', color: '#555' },
    calendarRow: { display: 'flex', flex: 1 },
    calendarHeaderCell: { flex: 1, padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' },
    calendarCell: { flex: 1, borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', padding: '8px', position: 'relative', minHeight: '100px', display: 'flex', flexDirection: 'column', gap: '4px' },
    dayNumber: { fontWeight: 'bold', fontSize: '0.9rem' },
};

export default AdminSchedule;