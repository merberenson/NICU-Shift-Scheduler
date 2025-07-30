import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaCalendarAlt, FaUserEdit, FaHome } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";
import { FaPhone } from "react-icons/fa";


// ...imports remain unchanged
const AdminMain = ({ adminInfo }) => {
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

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const navButtons = [
    { icon: <FaHome />, text: "Main", path: "/adminmain" },
    { icon: <FaCalendarAlt />, text: "Team Schedule", path: "/teamschedule" },
    { icon: <FaUserEdit />, text: "Register Nurse", path: "/register" },
    { icon: <MdOutlineEventAvailable />, text: "PTO Requests", path: "/ptorequests" },
    { icon: <FaPhone />, text: "Call-In Pool", path: "/callinpage" },
    { icon: <FaUserEdit />, text: "Delete Nurse", path: "/deletenurse" }
  ];

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
          <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
            <img src={logo} alt="NICU Logo" style={{ height: "200px", objectFit: "contain" }} />
          </div>

          {navButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => navigate(btn.path)}
              onMouseEnter={() => setHoveredBtn(index)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={sidebarButtonStyle(false, hoveredBtn === index)}
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
          Admin Dashboard
        </div>

        <div style={{ position: "absolute", top: 10, right: 20, fontSize: "0.75rem", textAlign: "right" }}>
          <div><strong>Date:</strong> {formatDate(currentTime)}</div>
          <div><strong>Time:</strong> {formatTime(currentTime)}</div>
        </div>

        <h2 style={{ fontSize: "1.6rem", fontWeight: "600", marginBottom: "20px", color: "#f50000ff" }}>
          Welcome, Admin
        </h2>

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
          <div>Total Registered Nurses: <strong>{adminInfo?.nurseCount ?? "--"}</strong></div>
        </div>
      </div>
    </div>
  );
};

// Button Styles (unchanged)
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

export default AdminMain;
