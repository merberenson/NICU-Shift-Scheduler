// Updated AdminSchedule.js with sidebar identical to AdminMain.js

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CallInPage from './CallInPage';
import { FaSignOutAlt, FaCalendarAlt, FaUserEdit, FaHome, FaPhone } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";

const CallInModalTrigger = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div>
            <button 
                onClick={() => setShowModal(true)}
                className="open-modal-button"
            >
            Find Available Nurses
            </button>

        {showModal && <CallInPage onClose={() => setShowModal(false)} />}
        </div>
    );
};

const AdminSchedule = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      const formattedMonth = String(selectedDate.month).padStart(2, '0');
      const apiUrl = `http://localhost:5000/api/schedule/${selectedDate.year}-${formattedMonth}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.data)) {
          const processedData = responseData.data.map(shift => {
            if (!Array.isArray(shift.assigned)) return shift;
            const uniqueEmployeesMap = new Map();
            shift.assigned.forEach(employee => {
              uniqueEmployeesMap.set(employee.empID, employee);
            });
            return { ...shift, assigned: Array.from(uniqueEmployeesMap.values()) };
          });
          setScheduleData(processedData);
        } else {
          setScheduleData([]);
          throw new Error(responseData.message || "Invalid schedule data.");
        }
      } catch (e) {
        setError("Failed to load schedule data. Please try again.");
        setScheduleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDate]);

  const generateCalendarGrid = () => {
    const { year, month } = selectedDate;
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const grid = [<div key="header" style={styles.calendarRow}>{weekDays.map(day => <div key={day} style={styles.calendarHeaderCell}>{day}</div>)}</div>];

    const scheduleMap = (scheduleData || []).reduce((acc, shift) => {
      const dayOfMonth = parseInt(shift.date.split('-')[2], 10);
      if (!acc[dayOfMonth]) acc[dayOfMonth] = [];
      acc[dayOfMonth].push(shift.shiftType);
      return acc;
    }, {});

    let dayCells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayCells.push(<div key={`empty-${i}`} style={styles.calendarCell}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const shifts = scheduleMap[day] || [];
      dayCells.push(
        <div key={day} style={styles.calendarCell}>
          <span style={styles.dayNumber}>{day}</span>
          {shifts.map((shift, index) => <div key={index}>{shift}</div>)}
        </div>
      );
    }

    while (dayCells.length % 7 !== 0) {
      dayCells.push(<div key={`empty-end-${dayCells.length}`} style={styles.calendarCell}></div>);
    }

    for (let i = 0; i < dayCells.length; i += 7) {
      grid.push(<div key={`week-${i / 7}`} style={styles.calendarRow}>{dayCells.slice(i, i + 7)}</div>);
    }

    return grid;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDate(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navButtons = [
    { icon: <FaHome />, text: "Main", path: "/admin" },
    { icon: <FaCalendarAlt />, text: "Team Schedule", path: "/teamschedule" },
    { icon: <FaUserEdit />, text: "Register Nurse", path: "/register" },
    { icon: <MdOutlineEventAvailable />, text: "PTO Requests", path: "/ptorequests" },
    { icon: <FaPhone />, text: "Call-In Pool", path: "/callinpage" },
    { icon: <FaUserEdit />, text: "Delete Nurse", path: "/deletenurse" }
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
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
            <img src={logo} alt="NICU Logo" style={{ height: "200px", objectFit: "contain" }} />
          </div>

          {navButtons.map((btn, i) => (
            <button
              key={i}
              onClick={() => navigate(btn.path)}
              onMouseEnter={() => setHoveredBtn(i)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={sidebarButtonStyle(false, hoveredBtn === i)}
            >
              {btn.icon} <span style={{ marginLeft: "8px" }}>{btn.text}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          onMouseEnter={() => setHoveredBtn("logout")}
          onMouseLeave={() => setHoveredBtn(null)}
          style={logoutButtonStyle(hoveredBtn === "logout")}
        >
          <FaSignOutAlt style={{ marginRight: "6px" }} /> Logout
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "120px 60px 20px", position: "relative" }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "50px",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "1.2rem"
        }}>
          Admin Schedule Viewer
        </div>

        <div style={{ fontSize: "1.6rem", fontWeight: "600", marginBottom: "20px", color: "#f50000ff" }}>
          Monthly Schedule
        </div>

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

        <div style={styles.calendarGrid}>
          {loading ? <div style={styles.statusMessage}>Loading schedule...</div> : error ? <div style={{ ...styles.statusMessage, color: 'red' }}>{error}</div> : generateCalendarGrid()}
        </div>
      </div>
    </div>
  );
};

const sidebarButtonStyle = (active = false, hover = false) => ({
  width: "100%",
  marginBottom: "12px",
  padding: "12px 14px",
  backgroundColor: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "20px",
  fontWeight: "bold",
  fontSize: "0.85rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
  transform: hover ? "scale(1.05)" : "scale(1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
});

const logoutButtonStyle = (hover = false) => ({
  backgroundColor: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "18px",
  padding: "10px 20px",
  marginTop: "20px",
  fontSize: "0.8rem",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
  transition: "transform 0.2s, box-shadow 0.2s",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transform: hover ? "scale(1.05)" : "scale(1)"
});

const styles = {
  selectors: { display: 'flex', gap: '15px', marginBottom: '20px' },
  dropdown: { padding: '10px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' },
  calendarGrid: { display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #e0e0e0', borderRadius: '8px' },
  statusMessage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.2rem', color: '#555' },
  calendarRow: { display: 'flex', flex: 1 },
  calendarHeaderCell: { flex: 1, padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' },
  calendarCell: { flex: 1, borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', padding: '8px', position: 'relative', minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '4px' },
  dayNumber: { fontWeight: 'bold', fontSize: '0.9rem' }
};

export default AdminSchedule;