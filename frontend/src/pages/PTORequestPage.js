import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUserEdit, FaSignOutAlt, FaSpinner, FaCheck } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";

const PTORequestPage = () => {
  const { getUserId, logout, getAccessToken } = useAuth();
  const navigate = useNavigate();
  
  const [nurseId, setNurseId] = useState(getUserId() || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError("End date must be after start date");
      return;
    }
    
    if (new Date(startDate) < new Date()) {
      setError("Start date cannot be in the past");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/pto', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nurseId: getUserId(),
          startDate,
          endDate,
          reason: reason.trim() || "Personal time off"
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setStartDate("");
        setEndDate("");
        setReason("");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.error || data.message || 'Failed to submit PTO request');
      }
    } catch (err) {
      console.error("PTO request failed:", err);
      setError(err.message || "Failed to submit PTO request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
    fontSize: "1rem",
    transition: "border-color 0.2s",
    outline: "none"
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

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", width: "100%" }}>
          
          {/* Header */}
          <div style={{ 
            marginBottom: "24px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            <h1 style={{ margin: 0, color: "#dc2626", fontSize: "1.8rem", textAlign: "center" }}>
              PTO Request
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#6b7280", textAlign: "center" }}>
              Submit a request for paid time off
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
              PTO request submitted successfully! You will be notified once it's reviewed.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            padding: "24px"
          }}>
            
            {/* Nurse ID - Read Only */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                Nurse ID:
              </label>
              <input
                type="text"
                value={nurseId}
                readOnly
                style={{
                  ...inputStyle,
                  backgroundColor: "#f9fafb",
                  color: "#6b7280"
                }}
              />
            </div>

            {/* Start Date */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                Start Date: *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                style={{
                  ...inputStyle,
                  ":focus": { borderColor: "#dc2626" }
                }}
              />
            </div>

            {/* End Date */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                End Date: *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate || new Date().toISOString().split('T')[0]}
                style={inputStyle}
              />
            </div>

            {/* Reason */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                Reason (Optional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for your PTO request..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "80px"
                }}
              />
            </div>

            {/* Submit Button */}
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
                  Submitting...
                </>
              ) : (
                "Submit PTO Request"
              )}
            </button>
          </form>

          {/* Info Box */}
          <div style={{
            marginTop: "20px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fed7aa",
            borderRadius: "8px",
            padding: "16px"
          }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#92400e" }}>Important Notes:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#92400e", fontSize: "0.9rem" }}>
              <li>PTO requests must be submitted at least 48 hours in advance</li>
              <li>All requests are subject to approval based on staffing needs</li>
              <li>You will receive an email notification once your request is reviewed</li>
              <li>For emergency time off, please contact your supervisor directly</li>
            </ul>
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

export default PTORequestPage;