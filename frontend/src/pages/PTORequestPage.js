import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/FullLogo_Transparent.png";

const PTORequestPage = () => {
  const [nurseId, setNurseId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRedirecting(true);
    const res = await fetch("http://localhost:5000/api/pto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nurseId, startDate, endDate, reason }),
    });

    if (res.ok) {
      setMessage("✅ Request submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReason("");
      setTimeout(() => navigate("/"), 3000);
    } else {
      setMessage("❌ Failed to submit PTO request");
      setRedirecting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "100%" }}>
          <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
            <img src={logo} alt="NICU Logo" style={{ height: "200px", objectFit: "contain" }} />
          </div>

          <button onClick={() => navigate("/")} style={sidebarButtonStyle()}>
            <FaHome style={{ marginRight: "8px" }} /> Main
          </button>
          <button onClick={() => navigate("/schedule")} style={sidebarButtonStyle()}>
            <FaCalendarAlt style={{ marginRight: "8px" }} /> Weekly Schedule
          </button>
          <button onClick={() => navigate("/availability")} style={sidebarButtonStyle()}>
            <FaUserEdit style={{ marginRight: "8px" }} /> Update Availability
          </button>
          <button disabled style={sidebarButtonStyle(true)}>
            <MdOutlineEventAvailable style={{ marginRight: "8px" }} /> PTO Request
          </button>
        </div>

        <button onClick={handleLogout} style={logoutButtonStyle}>
          <FaSignOutAlt style={{ marginRight: "6px" }} /> Logout
        </button>
      </div>

      {/* Main Form Content */}
      <div style={{ flex: 1, padding: "120px 60px 20px", display: "flex", justifyContent: "center" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#fff",
            borderRadius: 20,
            padding: "30px 36px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
            position: "relative",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 26, fontWeight: "bold", color: "#dc2626" }}>
            PTO Request
          </h2>

          {[
            { label: "Nurse ID", value: nurseId, setValue: setNurseId, type: "text" },
            { label: "Start Date", value: startDate, setValue: setStartDate, type: "date" },
            { label: "End Date", value: endDate, setValue: setEndDate, type: "date" },
            { label: "Reason", value: reason, setValue: setReason, type: "text", optional: true },
          ].map(({ label, value, setValue, type, optional }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>{label}:</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required={!optional}
                placeholder={optional ? "(optional)" : ""}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                  background: "#fff",
                }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={grayButtonStyle}
              onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#808080")}
            >
              Go Back
            </button>

            <button
              type="submit"
              style={redButtonStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 6px 14px rgba(255, 255, 255, 0.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(255, 255, 255, 0.3)";
              }}
            >
              Submit PTO
            </button>
          </div>

          {message && (
            <div style={{
              position: "absolute",
              top: "-40px",
              left: 0,
              right: 0,
              margin: "auto",
              textAlign: "center",
              fontWeight: "bold",
              color: message.startsWith("✅") ? "#186b3a" : "#c42a3d",
            }}>
              {message}
            </div>
          )}
        </form>
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
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
  transition: "transform 0.2s, box-shadow 0.2s",
  textAlign: "center",
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
  justifyContent: "center",
};

const redButtonStyle = {
  width: "50%",
  padding: "12px",
  backgroundColor: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "20px",
  fontWeight: "bold",
  fontSize: "1rem",
  boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
};

const grayButtonStyle = {
  width: "50%",
  padding: "12px",
  backgroundColor: "#808080",
  color: "#fff",
  border: "none",
  borderRadius: "20px",
  fontWeight: "bold",
  fontSize: "1rem",
  boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
  cursor: "pointer",
  transition: "background 0.2s",
};

export default PTORequestPage;
