import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaCalendarAlt, FaUserEdit, FaHome, FaSpinner } from "react-icons/fa";
import { MdOutlineEventAvailable, MdRefresh } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";

const NurseSchedule = () => {
  const { getUserId, logout, getAccessToken } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchSchedule = async (showRefreshSpinner = false) => {
    const userId = getUserId();
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    if (showRefreshSpinner) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    const formattedMonth = String(selectedDate.month).padStart(2, '0');
    const apiUrl = `/api/schedule/${selectedDate.year}-${formattedMonth}/${userId}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load schedule: ${response.status}`);
      }
      
      const responseData = await response.json();

      if (responseData.success && Array.isArray(responseData.data)) {
        setScheduleData(responseData.data);
      } else {
        setScheduleData([]);
        if (responseData.message) {
          setError(responseData.message);
        }
      }
    } catch (e) {
      console.error("Schedule fetch error:", e);
      setError("Failed to load schedule. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const handleRefresh = () => {
    fetchSchedule(true);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDate(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const sidebarButtonStyle = (active = false) => ({
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

  const renderScheduleContent = () => {
    if (loading) {
      return (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "300px",
          flexDirection: "column",
          gap: "16px"
        }}>
          <FaSpinner style={{ fontSize: "2rem", animation: "spin 1s linear infinite", color: "#dc2626" }} />
          <p style={{ color: "#666", fontSize: "1.1rem" }}>Loading your schedule...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          textAlign: "center", 
          padding: "40px",
          backgroundColor: "#fef2f2",
          borderRadius: "12px",
          border: "1px solid #fecaca"
        }}>
          <p style={{ color: "#dc2626", fontSize: "1.1rem", marginBottom: "16px" }}>{error}</p>
          <button 
            onClick={handleRefresh}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "0 auto"
            }}
          >
            <MdRefresh /> Try Again
          </button>
        </div>
      );
    }

    if (!scheduleData || scheduleData.length === 0) {
      return (
        <div style={{ 
          textAlign: "center", 
          padding: "40px",
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            No shifts scheduled for {selectedDate.month}/{selectedDate.year}
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: "12px" }}>
        {scheduleData.map((shift, index) => (
          <div key={index} style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.1rem" }}>
                  {new Date(shift.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                  {shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)} Shift
                </p>
              </div>
              <div style={{
                padding: "6px 12px",
                borderRadius: "20px",
                backgroundColor: shift.shiftType === 'day' ? '#dbeafe' : '#f3e8ff',
                color: shift.shiftType === 'day' ? '#1e40af' : '#7c3aed',
                fontSize: "0.8rem",
                fontWeight: "600"
              }}>
                {shift.shiftType === 'day' ? '7:00 AM - 7:00 PM' : '7:00 PM - 7:00 AM'}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
            <img src={logo} alt="NICU Logo" style={{ height: "200px", objectFit: "contain" }} />
          </div>

          <button onClick={() => navigate("/")} style={sidebarButtonStyle()}>
            <FaHome style={{ marginRight: "8px" }} /> Main
          </button>
          <button style={sidebarButtonStyle(true)} disabled>
            <FaCalendarAlt style={{ marginRight: "8px" }} /> Weekly Schedule
          </button>
          <button onClick={() => navigate("/availability")} style={sidebarButtonStyle()}>
            <FaUserEdit style={{ marginRight: "8px" }} /> Update Availability
          </button>
          <button onClick={() => navigate("/pto")} style={sidebarButtonStyle()}>
            <MdOutlineEventAvailable style={{ marginRight: "8px" }} /> PTO Request
          </button>
        </div>

        <button onClick={handleLogout} style={logoutButtonStyle}>
          <FaSignOutAlt style={{ marginRight: "6px" }} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "24px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            <h1 style={{ margin: 0, color: "#dc2626", fontSize: "1.8rem" }}>My Schedule</h1>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: "8px 16px",
                backgroundColor: refreshing ? "#e5e7eb" : "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: refreshing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.9rem"
              }}
            >
              <MdRefresh style={{ 
                animation: refreshing ? "spin 1s linear infinite" : "none" 
              }} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Date Selector */}
          <div style={{ 
            marginBottom: "24px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>Select Month</h3>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", color: "#6b7280" }}>
                  Year:
                </label>
                <select
                  name="year"
                  value={selectedDate.year}
                  onChange={handleDateChange}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    minWidth: "80px"
                  }}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 1 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", color: "#6b7280" }}>
                  Month:
                </label>
                <select
                  name="month"
                  value={selectedDate.month}
                  onChange={handleDateChange}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    minWidth: "120px"
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Content */}
          <div style={{ 
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            {renderScheduleContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default NurseSchedule;