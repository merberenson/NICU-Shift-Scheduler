import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const NurseSchedule = ({ nurse }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for handling year and month selection
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1, // Month is 1-12
    });

    // State for storing schedule data, loading status, and errors
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/logout');
    };

    const handleMain = () => {
        navigate('/');
    };

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError(null);
            
            const formattedMonth = String(selectedDate.month).padStart(2, '0');
            console.log(user)
            const apiUrl = `http://localhost:5000/api/schedule/${selectedDate.year}-${formattedMonth}/${user.userData.uid}`;

            console.log(`Fetching data from: ${apiUrl}`);

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json();
                

                // ** FIX 1: Ensure you set the nested .data array, not the whole object **
                if (responseData.success && Array.isArray(responseData.data)) {
                    setScheduleData(responseData.data); // Correctly set the array
                } else {
                    // Handle cases where success is false or data is not an array
                    setScheduleData([]); // Set an empty array to prevent errors
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


    // --- Calendar Logic ---
    const generateCalendarGrid = () => {
        const { year, month } = selectedDate;
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun, 1=Mon,...
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const grid = [];
        // grid.push(weekDays.map(day => <div key={day} style={styles.calendarCell}>{day}</div>));
        
        const headerRow = <div key="header" style={styles.calendarRow}>{weekDays.map(day => <div key={day} style={styles.calendarHeaderCell}>{day}</div>)}</div>;
        grid.push(headerRow);

        const scheduleMap = (scheduleData || []).reduce((acc, shift) => {
            // Extract the day number (e.g., '2025-07-01' -> 1)
            const dayOfMonth = parseInt(shift.date.split('-')[2], 10);

            // If this day isn't in our map yet, create an empty array for it
            if (!acc[dayOfMonth]) {
                acc[dayOfMonth] = "";
            }

            // Add the current shift's type to the array for that day
            acc[dayOfMonth] = shift.shiftType;
            
            return acc;
        }, {}); // The result will be like: { 1: ['night', 'night', ...], 6: ['day', ...], ... }


        let dayCells = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            dayCells.push(<div key={`empty-${i}`} style={styles.calendarCell}></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
          if (!scheduleMap[day]) {
            dayCells.push(
                <div key={day} style={styles.calendarCell}>
                    <span style={styles.dayNumber}>{day}</span>
                    {/* Future: Render schedule data here */}
                </div>
            );
          } else if (scheduleMap[day] === 'day') {
            dayCells.push(
                <div key={day} style={styles.calendarCell}>
                    <span style={styles.dayNumber}>{day}</span>
                    day
                </div>
            );
          } else if (scheduleMap[day] === 'night') {
            dayCells.push(
                <div key={day} style={styles.calendarCell}>
                    <span style={styles.dayNumber}>{day}</span>
                    night
                </div>
            );
          } else {
            console.error("wrong data");
          }
        }
        
        const totalCellsInGrid = dayCells.length;
        const remainingCells = totalCellsInGrid % 7;
        if (remainingCells !== 0) {
            const emptyCellsToAdd = 7 - remainingCells;
            for (let i = 0; i < emptyCellsToAdd; i++) {
                dayCells.push(<div key={`empty-end-${i}`} style={styles.calendarCell}></div>);
            }
        }

        // Group all day cells into weeks (rows of 7)
        for (let i = 0; i < dayCells.length; i += 7) {
            grid.push(
                 <div key={`week-${i/7}`} style={styles.calendarRow}>
                    {dayCells.slice(i, i + 7)}
                </div>
            );
        }

        return grid;
    };


    // --- Dropdown Handlers ---
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
          fontSize: "2.2rem",
          color: "#222",
          letterSpacing: "0.4px"
        }}>
          NICU Schedule
        </span>
        <div style={{ textAlign: "right", color: "#65686e", fontSize: "1.05rem", marginRight: 10 }}>
          Date: {new Date().toLocaleDateString()}<br />
          Time: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      {/* Body Layout */}
      <div style={{
        display: "flex",
        flex: 1,
        height: "100%",
        alignItems: "flex-start"
      }}>
        {/* Sidebar */}
        <div style={{
          width: "305px",
          background: "#002178",
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
              color: "#d8e4ff",
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
              e.currentTarget.style.background = "#e6eefd";
              e.currentTarget.style.color = "#002178";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#d8e4ff";
            }}
          >
            <span style={{ fontSize: "1.38rem", marginRight: 13 }}>🏠</span>
            Main
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              color: "#002178",
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
            Weekly Schedule
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              color: "#f5974b",
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
              e.currentTarget.style.background = "#fde3d4";
              e.currentTarget.style.color = "#d94b2a";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#f5974b";
            }}
          >
            <span style={{ fontSize: "1.28rem", marginRight: 13 }}>🔌</span>
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
    calendarContainer: { width: '80%', height: '100%', display: 'flex', flexDirection: 'column' },
    calendarTitle: { fontWeight: 400, fontSize: "2rem", color: "#232323", textAlign: "left", marginBottom: 20 },
    selectors: { display: 'flex', gap: '15px', marginBottom: '20px' },
    dropdown: { padding: '10px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' },
    calendarGrid: { display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #e0e0e0', borderRadius: '8px' },
    statusMessage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.2rem', color: '#555' },
    calendarRow: { display: 'flex', flex: 1 },
    calendarHeaderCell: { flex: 1, padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' },
    calendarCell: { flex: 1, borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', padding: '8px', position: 'relative', minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '4px' },
    dayNumber: { fontWeight: 'bold', fontSize: '0.9rem' },
    

};
export default NurseSchedule;