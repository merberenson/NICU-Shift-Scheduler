import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaCalendarAlt, FaUserEdit, FaHome, FaSpinner, FaClock, FaClipboardList, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { MdOutlineEventAvailable, MdSchedule, MdNotifications } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";

const NurseMain = () => {
  const { getUserId, getUsername, logout, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    nurseInfo: null,
    upcomingShifts: [],
    recentPTO: [],
    weeklyHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      // Load nurse profile information
      const profileResponse = await fetch(`/api/nurses/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setDashboardData(prev => ({
          ...prev,
          nurseInfo: profileData.data
        }));
      }

      // Load upcoming shifts (current month)
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const shiftsResponse = await fetch(`/api/schedule/${currentMonth}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (shiftsResponse.ok) {
        const shiftsData = await shiftsResponse.json();
        // Filter for next 7 days
        const today = new Date();
        const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingShifts = (shiftsData.data || []).filter(shift => {
          const shiftDate = new Date(shift.date);
          return shiftDate >= today && shiftDate <= next7Days;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        setDashboardData(prev => ({
          ...prev,
          upcomingShifts: upcomingShifts.slice(0, 5) // Show max 5 upcoming shifts
        }));
      }

      // Load recent PTO requests
      const ptoResponse = await fetch(`/api/pto/nurse/${userId}`);
      if (ptoResponse.ok) {
        const ptoData = await ptoResponse.json();
        setDashboardData(prev => ({
          ...prev,
          recentPTO: (ptoData || []).slice(0, 3) // Show last 3 PTO requests
        }));
      }

    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard information");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const getShiftTime = (shiftType) => {
    return shiftType === 'day' ? '7:00 AM - 7:00 PM' : '7:00 PM - 7:00 AM';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'denied': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const isShiftToday = (shiftDate) => {
    const today = new Date();
    const shift = new Date(shiftDate);
    return today.toDateString() === shift.toDateString();
  };

  const isShiftTomorrow = (shiftDate) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const shift = new Date(shiftDate);
    return tomorrow.toDateString() === shift.toDateString();
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "180px",
          backgroundColor: "#c6c0e6ff",
          padding: "20px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ width: "100%", alignItems: "center" }}>
          {/* Logo in Sidebar */}
          <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
            <img
              src={logo}
              alt="NICU Logo"
              style={{ height: "200px", objectFit: "contain" }}
            />
          </div>

          {/* Sidebar Buttons */}
          {[
            { icon: <FaHome />, text: "Main", path: "/" },
            { icon: <FaCalendarAlt />, text: "Weekly Schedule", path: "/schedule" },
            { icon: <FaUserEdit />, text: "Update Availability", path: "/availability" },
            { icon: <MdOutlineEventAvailable />, text: "PTO Request", path: "/pto" },
            { icon: <FaExclamationTriangle />, text: "Emergency Call-Out", path: "/call-out" }
          ].map((btn, index) => (
            <button
              key={index}
              onClick={() => navigate(btn.path)}
              onMouseEnter={() => setHoveredBtn(index)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={sidebarButtonStyle(index === 0, hoveredBtn === index)}
            >
              {btn.icon}
              <span style={{ marginLeft: "8px" }}>{btn.text}</span>
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

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "20px" }}>
        {/* Top Bar with Date/Time */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "15px 25px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaClock style={{ color: "#dc2626", fontSize: "1.2rem" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#dc2626" }}>
              NICU Dashboard
            </span>
          </div>
          <div style={{ fontSize: "0.9rem", textAlign: "right", color: "#666" }}>
            <div><strong>Date:</strong> {formatDate(currentTime)}</div>
            <div><strong>Time:</strong> {formatTime(currentTime)}</div>
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Welcome Header */}
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "600",
            marginBottom: "30px",
            color: "#1f2937"
          }}>
            Welcome, {getUsername() || 'Nurse'}!
          </h1>

          {loading ? (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "300px",
              flexDirection: "column",
              gap: "16px"
            }}>
              <FaSpinner style={{ fontSize: "2rem", animation: "spin 1s linear infinite", color: "#dc2626" }} />
              <p style={{ color: "#666", fontSize: "1.1rem" }}>Loading your dashboard...</p>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px",
              backgroundColor: "#fef2f2",
              borderRadius: "12px",
              border: "1px solid #fecaca"
            }}>
              <p style={{ color: "#dc2626", fontSize: "1.1rem" }}>{error}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "24px" }}>
              
              {/* Quick Info Cards Row */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "20px" 
              }}>
                
                {/* Personal Info Card */}
                <div style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                    <FaUserEdit style={{ color: "#dc2626", marginRight: "10px", fontSize: "1.2rem" }} />
                    <h3 style={{ margin: 0, color: "#374151" }}>Personal Information</h3>
                  </div>
                  {dashboardData.nurseInfo ? (
                    <div style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#6b7280" }}>
                      <div><strong>Name:</strong> {dashboardData.nurseInfo.name}</div>
                      <div><strong>Email:</strong> {dashboardData.nurseInfo.email}</div>
                      <div><strong>Phone:</strong> {dashboardData.nurseInfo.phone}</div>
                      <div><strong>Max Weekly Hours:</strong> {dashboardData.nurseInfo.maxWeeklyHours || 48}</div>
                    </div>
                  ) : (
                    <p style={{ color: "#9ca3af", fontStyle: "italic" }}>Loading profile information...</p>
                  )}
                </div>

                {/* Quick Actions Card */}
                <div style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                    <FaClipboardList style={{ color: "#dc2626", marginRight: "10px", fontSize: "1.2rem" }} />
                    <h3 style={{ margin: 0, color: "#374151" }}>Quick Actions</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      onClick={() => navigate("/schedule")}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color: "#374151",
                        textAlign: "left"
                      }}
                    >
                      📅 View My Schedule
                    </button>
                    <button
                      onClick={() => navigate("/availability")}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color: "#374151",
                        textAlign: "left"
                      }}
                    >
                      ✏️ Update Availability
                    </button>
                    <button
                      onClick={() => navigate("/pto")}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color: "#374151",
                        textAlign: "left"
                      }}
                    >
                      📋 Request PTO
                    </button>
                    <button
                      onClick={() => navigate("/call-out")}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#dc2626",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color: "white",
                        textAlign: "left",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      🚨 Emergency Call-Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Row */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "2fr 1fr", 
                gap: "24px" 
              }}>
                
                {/* Upcoming Shifts */}
                <div style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <MdSchedule style={{ color: "#dc2626", marginRight: "10px", fontSize: "1.4rem" }} />
                    <h3 style={{ margin: 0, color: "#374151", fontSize: "1.3rem" }}>Upcoming Shifts</h3>
                  </div>
                  
                  {dashboardData.upcomingShifts.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {dashboardData.upcomingShifts.map((shift, index) => (
                        <div key={index} style={{
                          backgroundColor: isShiftToday(shift.date) ? "#fef3c7" : 
                                         isShiftTomorrow(shift.date) ? "#dbeafe" : "#f9fafb",
                          padding: "16px",
                          borderRadius: "8px",
                          border: `1px solid ${isShiftToday(shift.date) ? "#f59e0b" : 
                                                isShiftTomorrow(shift.date) ? "#3b82f6" : "#e5e7eb"}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                              {new Date(shift.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                              {isShiftToday(shift.date) && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>• TODAY</span>}
                              {isShiftTomorrow(shift.date) && <span style={{ color: "#3b82f6", marginLeft: "8px" }}>• TOMORROW</span>}
                            </div>
                            <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                              {shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)} Shift
                            </div>
                          </div>
                          <div style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            backgroundColor: shift.shiftType === 'day' ? '#dbeafe' : '#f3e8ff',
                            color: shift.shiftType === 'day' ? '#1e40af' : '#7c3aed',
                            fontSize: "0.8rem",
                            fontWeight: "600"
                          }}>
                            {getShiftTime(shift.shiftType)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "40px",
                      color: "#9ca3af"
                    }}>
                      <MdSchedule style={{ fontSize: "3rem", marginBottom: "10px", opacity: 0.3 }} />
                      <p>No upcoming shifts in the next 7 days</p>
                      <button
                        onClick={() => navigate("/schedule")}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          marginTop: "10px"
                        }}
                      >
                        View Full Schedule
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent PTO Requests */}
                <div style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <MdNotifications style={{ color: "#dc2626", marginRight: "10px", fontSize: "1.4rem" }} />
                    <h3 style={{ margin: 0, color: "#374151", fontSize: "1.1rem" }}>Recent PTO</h3>
                  </div>
                  
                  {dashboardData.recentPTO.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {dashboardData.recentPTO.map((pto, index) => (
                        <div key={index} style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          backgroundColor: "#f9fafb"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#374151" }}>
                              {new Date(pto.startDate).toLocaleDateString()}
                            </span>
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: "10px",
                              backgroundColor: getStatusColor(pto.status),
                              color: "white",
                              fontSize: "0.7rem",
                              fontWeight: "600"
                            }}>
                              {pto.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                            {pto.reason || "Personal time off"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "20px",
                      color: "#9ca3af"
                    }}>
                      <p style={{ fontSize: "0.9rem" }}>No recent PTO requests</p>
                      <button
                        onClick={() => navigate("/pto")}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          marginTop: "8px"
                        }}
                      >
                        Request PTO
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar Button Styling with Hover Support
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
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  opacity: active ? 0.8 : 1
});

// Logout Button Styling with Hover
const logoutButtonStyle = (hover = false) => ({
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
  justifyContent: "center",
  transform: hover ? "scale(1.05)" : "scale(1)"
});

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default NurseMain;