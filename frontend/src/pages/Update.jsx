import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUserEdit, FaSignOutAlt, FaSpinner, FaCheck, FaCheckCircle } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeOptions = [
  { value: "day", label: "DAY" },
  { value: "night", label: "NIGHT" },
  { value: "unavailable", label: "UNAVAILABLE" }
];

export const UpdateAvailability = () => {
  const { getUserId, logout, getAccessToken } = useAuth();
  const navigate = useNavigate();

  const [availability, setAvailability] = useState(
    daysOfWeek.map(day => ({ dayOfWeek: day, timeOfDay: "unavailable" }))
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const userId = getUserId();
        console.log('[DEBUG] Frontend getUserId():', userId);
        console.log('[DEBUG] Frontend getAccessToken():', getAccessToken());
        
        if (!userId) {
          setError("User not authenticated");
          return;
        }
        
        setLoading(true);
        const res = await axios.get(`/api/nurses/${userId}/availability`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('[DEBUG] Frontend availability response:', res.data);
        
        if (res.data?.success && res.data?.data?.availability) {
          setAvailability(res.data.data.availability);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to load availability", err);
        console.error("Error response:", err.response?.data);
        setError("Failed to load current availability. Using default values.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [getUserId, getAccessToken]);

  const handleUpdateAvailability = async (event) => {
    event.preventDefault();
    
    try {
      const userId = getUserId();
      if (!userId) {
        setError("No user ID available");
        return;
      }
      
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      
      const response = await axios.patch(`/api/nurses/${userId}/availability`, 
        { availability },
        {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Updated availability: ", response.data);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error("Update failed: ", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update availability. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTime = (day, value) => {
    setAvailability(prev =>
      prev.map(item =>
        item.dayOfWeek === day ? { ...item, timeOfDay: value } : item
      )
    );
  };

  const sidebarButtonStyle = (disabled = false) => ({
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
    cursor: disabled ? "default" : "pointer",
    boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
    textAlign: "center",
    opacity: disabled ? 0.8 : 1
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

  const getSelectStyle = (value) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
    fontSize: "1rem",
    backgroundColor: value === 'unavailable' ? '#fef2f2' : 
                     value === 'day' ? '#eff6ff' : '#f3e8ff',
    borderColor: value === 'unavailable' ? '#fca5a5' : 
                 value === 'day' ? '#93c5fd' : '#c4b5fd',
    transition: "all 0.2s",
    cursor: "pointer"
  });

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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
          
          {/* Header */}
          <div style={{ 
            marginBottom: "24px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            <h1 style={{ margin: 0, color: "#dc2626", fontSize: "1.8rem", textAlign: "center" }}>
              Update Your Weekly Availability
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#6b7280", textAlign: "center" }}>
              Set your preferred shift times for each day of the week
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#dc2626"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#0369a1",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <FaCheck />
              Availability updated successfully!
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdateAvailability} style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            padding: "24px"
          }}>
            
            {loading ? (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "200px",
                flexDirection: "column",
                gap: "16px"
              }}>
                <FaSpinner style={{ fontSize: "2rem", animation: "spin 1s linear infinite", color: "#dc2626" }} />
                <p style={{ color: "#666" }}>Loading current availability...</p>
              </div>
            ) : (
              <>
                {/* Current Availability Summary */}
                <div style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px"
                }}>
                  <h4 style={{ margin: "0 0 12px 0", color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaCheckCircle style={{ color: "#10b981" }} />
                    Current Weekly Schedule
                  </h4>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
                    gap: "8px" 
                  }}>
                    {daysOfWeek.map(day => {
                      const dayAvailability = availability.find(item => item.dayOfWeek === day);
                      const timeOfDay = dayAvailability?.timeOfDay || "unavailable";
                      return (
                        <div key={day} style={{
                          padding: "8px",
                          borderRadius: "6px",
                          textAlign: "center",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          backgroundColor: timeOfDay === 'unavailable' ? '#fef2f2' : 
                                         timeOfDay === 'day' ? '#eff6ff' : '#f3e8ff',
                          color: timeOfDay === 'unavailable' ? '#dc2626' : 
                                timeOfDay === 'day' ? '#1e40af' : '#7c3aed',
                          border: `1px solid ${timeOfDay === 'unavailable' ? '#fca5a5' : 
                                               timeOfDay === 'day' ? '#93c5fd' : '#c4b5fd'}`
                        }}>
                          <div style={{ fontSize: "0.7rem", marginBottom: "2px" }}>{day.slice(0, 3)}</div>
                          <div>{timeOfDay === 'unavailable' ? 'OFF' : timeOfDay.toUpperCase()}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Weekly Summary */}
                  <div style={{ 
                    marginTop: "12px", 
                    padding: "8px", 
                    backgroundColor: "#fff", 
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    color: "#6b7280"
                  }}>
                    <strong>Weekly Summary:</strong> {' '}
                    {availability.filter(a => a.timeOfDay === 'day').length} day shifts, {' '}
                    {availability.filter(a => a.timeOfDay === 'night').length} night shifts, {' '}
                    {availability.filter(a => a.timeOfDay === 'unavailable').length} days off
                  </div>
                </div>

                {/* Edit Form */}
                <div style={{
                  border: "2px dashed #e2e8f0",
                  borderRadius: "8px",
                  padding: "20px"
                }}>
                  <h4 style={{ margin: "0 0 16px 0", color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaUserEdit style={{ color: "#dc2626" }} />
                    Update Your Availability
                  </h4>
                  
                  {daysOfWeek.map(day => (
                    <div key={day} style={{ marginBottom: "20px" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        color: "#374151",
                        fontSize: "1.1rem"
                      }}>
                        {day}:
                      </label>
                      <select
                        value={availability.find(item => item.dayOfWeek === day)?.timeOfDay || "unavailable"}
                        onChange={e => handleUpdateTime(day, e.target.value)}
                        style={getSelectStyle(availability.find(item => item.dayOfWeek === day)?.timeOfDay || "unavailable")}
                      >
                        {timeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "14px",
                      backgroundColor: submitting ? "#9ca3af" : "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: submitting ? "not-allowed" : "pointer",
                      transition: "background-color 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                        Updating...
                      </>
                    ) : (
                      "Update Availability"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Legend */}
          <div style={{
            marginTop: "20px",
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>Legend:</h4>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "16px", height: "16px", backgroundColor: "#eff6ff", border: "2px solid #93c5fd", borderRadius: "4px" }}></div>
                <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>Day Shift (7 AM - 7 PM)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "16px", height: "16px", backgroundColor: "#f3e8ff", border: "2px solid #c4b5fd", borderRadius: "4px" }}></div>
                <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>Night Shift (7 PM - 7 AM)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "16px", height: "16px", backgroundColor: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "4px" }}></div>
                <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>Unavailable</span>
              </div>
            </div>
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
