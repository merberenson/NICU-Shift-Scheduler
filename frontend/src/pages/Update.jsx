import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeOptions = [
  { value: "day", label: "DAY" },
  { value: "night", label: "NIGHT" },
  { value: "unavailable", label: "UNAVAILABLE" }
];

const UpdateAvailability = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [availability, setAvailability] = useState(
    daysOfWeek.map(day => ({ dayOfWeek: day, timeOfDay: "unavailable" }))
  );

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`/nurses/${user._id}/availability`);
        if (res.data?.availability) {
          setAvailability(res.data.availability);
        }
      } catch (err) {
        console.error("Failed to load availability", err);
      }
    };

    if (user?._id) fetchAvailability();
  }, [user]);

  const handleUpdateTime = (day, value) => {
    setAvailability(prev =>
      prev.map(item =>
        item.dayOfWeek === day ? { ...item, timeOfDay: value } : item
      )
    );
  };

  const handleUpdateAvailability = async (event) => {
    event.preventDefault();
    try {
      const nurseId = user.userData._id;
      const response = await axios.patch(`/nurses/${nurseId}/availability`, { availability });
      console.log("Updated availability: ", response.data);
    } catch (err) {
      console.error("Update failed: ", err.response?.data || err.message);
    }
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
          <button onClick={() => navigate("/schedule")} style={sidebarButtonStyle()}>
            <FaCalendarAlt style={{ marginRight: "8px" }} /> Weekly Schedule
          </button>
          <button disabled style={sidebarButtonStyle(true)}>
            <FaUserEdit style={{ marginRight: "8px" }} /> Update Availability
          </button>
          <button onClick={() => navigate("/pto")} style={sidebarButtonStyle()}>
            <MdOutlineEventAvailable style={{ marginRight: "8px" }} /> PTO Request
          </button>
        </div>

        <button onClick={() => { logout(); navigate("/login"); }} style={logoutButtonStyle}>
          <FaSignOutAlt style={{ marginRight: "6px" }} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "120px 60px 20px", position: "relative" }}>
        <form onSubmit={handleUpdateAvailability} style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
          padding: "30px"
        }}>
          <h2 style={{ textAlign: "center", color: "#dc2626", marginBottom: "20px" }}>Update Your Weekly Availability</h2>
          {daysOfWeek.map(day => (
            <div key={day} style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333" }}>{day}:</label>
              <select
                value={availability.find(item => item.dayOfWeek === day)?.timeOfDay || "unavailable"}
                onChange={e => handleUpdateTime(day, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "1rem"
                }}
              >
                {timeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button type="submit" style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
            onMouseOver={e => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(255, 255, 255, 0.5)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(255, 255, 255, 0.3)";
            }}
          >
            Submit
          </button>
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
  textAlign: "center"
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

export { UpdateAvailability };
