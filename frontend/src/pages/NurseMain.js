import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaCalendarAlt, FaUserEdit, FaHome } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png"; // Adjust path as needed

const NurseMain = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleWeeklySchedule = () => {
    console.log(user.userData, user.userData._id)
    if (user && user.userData._id) {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      navigate(`/weeklyschedule/${user.userData._id}/${startDate}`);
    } else {
      console.error("user ID not available");
      // Handle error or show message to user
    }
  };

  const sidebarButtons = [
    { icon: <FaHome />, text: "Main", action: () => navigate("/") },
    { icon: <FaCalendarAlt />, text: "Weekly Schedule", action: handleWeeklySchedule },
    { icon: <FaUserEdit />, text: "Update Availability", action: () => navigate("/availability") },
    { icon: <MdOutlineEventAvailable />, text: "PTO Request", action: () => navigate("/pto") }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
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

          {sidebarButtons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.action}
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
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: "120px 0 0 60px",
          position: "relative"
        }}
      >
        {/* Top Bar */}
        <div
          style={{
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
          }}
        >
          Schedule Viewer
        </div>

        {/* Date and Time */}
        <div style={{ position: "absolute", top: 10, right: 20, fontSize: "0.75rem", textAlign: "right" }}>
          <div><strong>Date:</strong> {formatDate(currentTime)}</div>
          <div><strong>Time:</strong> {formatTime(currentTime)}</div>
        </div>

        {/* Welcome Header */}
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#f50000ff"
          }}
        >
          Welcome, Nurse
        </h2>

        {/* Info Bubble */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
            padding: "20px 30px",
            minWidth: "320px",
            fontSize: "15px",
            fontWeight: "500",
            lineHeight: "1.7",
            color: "#333"
          }}
        >
          <div>Email: --</div>
          <div>Phone: --</div>
          <div>Worked Hours this Week: --</div>
        </div>
      </div>
    </div>
  );
}

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
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
});

// Logout Button Styling with Hover
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

export default NurseMain;
