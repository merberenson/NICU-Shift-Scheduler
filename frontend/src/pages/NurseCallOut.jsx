import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUserEdit, FaSignOutAlt, FaSpinner, FaExclamationTriangle, FaPhoneAlt, FaCheck, FaInfoCircle } from "react-icons/fa";
import { MdOutlineEventAvailable, MdEmergencyRecording } from "react-icons/md";
import logo from "../assets/FullLogo_Transparent.png";

const NurseCallOut = () => {
  const { getUserId, logout, getAccessToken } = useAuth();
  const navigate = useNavigate();
  
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [callOutData, setCallOutData] = useState({
    absenceType: '',
    reason: '',
    estimatedDuration: '',
    contactNumber: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const absenceTypes = [
    { value: 'sick', label: 'Personal Illness', icon: '🤒', priority: 'high' },
    { value: 'family_emergency', label: 'Family Emergency', icon: '🚨', priority: 'critical' },
    { value: 'emergency', label: 'Personal Emergency', icon: '⚡', priority: 'critical' },
    { value: 'injury', label: 'Injury/Accident', icon: '🩹', priority: 'high' },
    { value: 'transportation', label: 'Transportation Issue', icon: '🚗', priority: 'medium' },
    { value: 'childcare', label: 'Childcare Emergency', icon: '👶', priority: 'high' },
    { value: 'other', label: 'Other Emergency', icon: '📞', priority: 'medium' }
  ];

  useEffect(() => {
    loadUpcomingShifts();
  }, []);

  const loadUpcomingShifts = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      // Get current and next month's shifts
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const nextMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 2).padStart(2, '0')}`;
      
      const [currentResponse, nextResponse] = await Promise.all([
        fetch(`/api/schedule/${currentMonth}/${userId}`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/schedule/${nextMonth}/${userId}`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const currentData = currentResponse.ok ? await currentResponse.json() : { data: [] };
      const nextData = nextResponse.ok ? await nextResponse.json() : { data: [] };
      
      const allShifts = [...(currentData.data || []), ...(nextData.data || [])];
      
      // Filter for upcoming shifts (next 30 days)
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const upcoming = allShifts.filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= now && shiftDate <= thirtyDaysFromNow;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));

      setUpcomingShifts(upcoming);
    } catch (err) {
      console.error("Failed to load upcoming shifts:", err);
      setError("Failed to load your upcoming shifts");
    } finally {
      setLoading(false);
    }
  };

  const handleCallOutSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedShift) {
      setError("Please select a shift to report absence for");
      return;
    }

    if (!callOutData.absenceType) {
      setError("Please select the type of absence");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmCallOut = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setShowConfirmation(false);

      const response = await fetch('/api/callout/report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shiftDate: selectedShift.date,
          absenceType: callOutData.absenceType,
          reason: callOutData.reason || `${absenceTypes.find(t => t.value === callOutData.absenceType)?.label}`,
          estimatedDuration: callOutData.estimatedDuration,
          contactNumber: callOutData.contactNumber,
          emergencyContact: callOutData.emergencyContact
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setSelectedShift(null);
        setCallOutData({
          absenceType: '',
          reason: '',
          estimatedDuration: '',
          contactNumber: '',
          emergencyContact: ''
        });
        
        // Reload shifts to reflect the change
        loadUpcomingShifts();
      } else {
        throw new Error(data.message || 'Failed to submit call-out');
      }
    } catch (err) {
      console.error("Call-out submission failed:", err);
      setError(err.message || "Failed to submit call-out. Please try again or contact administration directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getShiftUrgency = (shiftDate) => {
    const now = new Date();
    const shift = new Date(shiftDate);
    const hoursUntil = (shift - now) / (1000 * 60 * 60);
    
    if (hoursUntil < 2) return { level: 'critical', text: 'CRITICAL - Less than 2 hours', color: '#dc2626' };
    if (hoursUntil < 8) return { level: 'urgent', text: 'URGENT - Less than 8 hours', color: '#ea580c' };
    if (hoursUntil < 24) return { level: 'high', text: 'HIGH PRIORITY - Less than 24 hours', color: '#d97706' };
    return { level: 'normal', text: 'Normal notice period', color: '#059669' };
  };

  const isShiftSoon = (shiftDate) => {
    const now = new Date();
    const shift = new Date(shiftDate);
    const hoursUntil = (shift - now) / (1000 * 60 * 60);
    return hoursUntil < 24;
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
          <button onClick={() => navigate("/pto")} style={sidebarButtonStyle()}>
            <MdOutlineEventAvailable style={{ marginRight: "8px" }} /> PTO Request
          </button>
          <button disabled style={sidebarButtonStyle(true)}>
            <MdEmergencyRecording style={{ marginRight: "8px" }} /> Emergency Call-Out
          </button>
        </div>

        <button onClick={handleLogout} style={logoutButtonStyle}>
          <FaSignOutAlt style={{ marginRight: "6px" }} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          
          {/* Header */}
          <div style={{ 
            marginBottom: "24px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: "2px solid #dc2626"
          }}>
            <h1 style={{ margin: 0, color: "#dc2626", fontSize: "1.8rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <FaExclamationTriangle />
              Emergency Call-Out System
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#6b7280", textAlign: "center" }}>
              Report illness or emergency absence for your scheduled shifts
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
              <FaExclamationTriangle style={{ marginRight: "8px" }} />
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
              Call-out submitted successfully! Your supervisor and the on-call coordinator have been notified.
            </div>
          )}

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
              <p style={{ color: "#666", fontSize: "1.1rem" }}>Loading your upcoming shifts...</p>
            </div>
          ) : (
            <>
              {/* Emergency Info */}
              <div style={{
                backgroundColor: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px"
              }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaInfoCircle />
                  Important Notice
                </h3>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#92400e", fontSize: "0.9rem" }}>
                  <li>Call-outs are immediately reported to administration and the on-call coordinator</li>
                  <li>The system will attempt to find a replacement from the on-call pool</li>
                  <li>Call-outs less than 2 hours before shift start are marked as CRITICAL</li>
                  <li>For life-threatening emergencies, call 911 first, then use this system</li>
                  <li>You may be contacted for additional information or documentation</li>
                </ul>
              </div>

              {/* Shift Selection */}
              <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                padding: "24px",
                marginBottom: "24px"
              }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>Select Shift to Report Absence</h3>
                
                {upcomingShifts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {upcomingShifts.map((shift, index) => {
                      const urgency = getShiftUrgency(shift.date);
                      const isSelected = selectedShift?.workID === shift.workID;
                      
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedShift(shift)}
                          style={{
                            padding: "16px",
                            borderRadius: "8px",
                            border: `2px solid ${isSelected ? '#dc2626' : '#e5e7eb'}`,
                            backgroundColor: isSelected ? '#fef2f2' : '#f9fafb',
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                                {new Date(shift.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  month: 'long', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                                {shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)} Shift
                                {' • '}
                                {shift.shiftType === 'day' ? '7:00 AM - 7:00 PM' : '7:00 PM - 7:00 AM'}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{
                                padding: "4px 8px",
                                borderRadius: "12px",
                                backgroundColor: urgency.color,
                                color: "white",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                marginBottom: "4px"
                              }}>
                                {urgency.text}
                              </div>
                              {isShiftSoon(shift.date) && (
                                <div style={{ fontSize: "0.8rem", color: "#dc2626", fontWeight: "600" }}>
                                  <FaExclamationTriangle style={{ marginRight: "4px" }} />
                                  Soon
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "40px",
                    color: "#9ca3af"
                  }}>
                    <p>No upcoming shifts found in the next 30 days</p>
                  </div>
                )}
              </div>

              {/* Call-Out Form */}
              {selectedShift && (
                <form onSubmit={handleCallOutSubmit} style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  padding: "24px"
                }}>
                  <h3 style={{ margin: "0 0 20px 0", color: "#374151" }}>Call-Out Details</h3>
                  
                  {/* Absence Type */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#374151" 
                    }}>
                      Type of Absence: *
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                      {absenceTypes.map(type => (
                        <label key={type.value} style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "12px",
                          border: `2px solid ${callOutData.absenceType === type.value ? '#dc2626' : '#e5e7eb'}`,
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: callOutData.absenceType === type.value ? '#fef2f2' : '#fff',
                          transition: "all 0.2s"
                        }}>
                          <input
                            type="radio"
                            name="absenceType"
                            value={type.value}
                            checked={callOutData.absenceType === type.value}
                            onChange={(e) => setCallOutData({...callOutData, absenceType: e.target.value})}
                            style={{ display: "none" }}
                          />
                          <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>{type.icon}</span>
                          <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Duration */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#374151" 
                    }}>
                      Estimated Duration:
                    </label>
                    <select
                      value={callOutData.estimatedDuration}
                      onChange={(e) => setCallOutData({...callOutData, estimatedDuration: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #e5e7eb",
                        fontSize: "1rem"
                      }}
                    >
                      <option value="">Select duration...</option>
                      <option value="single-shift">This shift only</option>
                      <option value="1-2-days">1-2 days</option>
                      <option value="3-5-days">3-5 days</option>
                      <option value="1-week">About 1 week</option>
                      <option value="unknown">Unknown at this time</option>
                    </select>
                  </div>

                  {/* Contact Number */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#374151" 
                    }}>
                      Contact Number: *
                    </label>
                    <input
                      type="tel"
                      value={callOutData.contactNumber}
                      onChange={(e) => setCallOutData({...callOutData, contactNumber: e.target.value})}
                      placeholder="Phone number where you can be reached"
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #e5e7eb",
                        fontSize: "1rem"
                      }}
                    />
                  </div>

                  {/* Additional Details */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#374151" 
                    }}>
                      Additional Details (Optional):
                    </label>
                    <textarea
                      value={callOutData.reason}
                      onChange={(e) => setCallOutData({...callOutData, reason: e.target.value})}
                      placeholder="Any additional information that might be helpful..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #e5e7eb",
                        fontSize: "1rem",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !callOutData.absenceType || !callOutData.contactNumber}
                    style={{
                      width: "100%",
                      padding: "14px",
                      backgroundColor: (!callOutData.absenceType || !callOutData.contactNumber) ? "#9ca3af" : "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: (!callOutData.absenceType || !callOutData.contactNumber) ? "not-allowed" : "pointer",
                      transition: "background-color 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <FaPhoneAlt />
                    Submit Emergency Call-Out
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "500px",
            margin: "20px"
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaExclamationTriangle />
              Confirm Call-Out Submission
            </h3>
            
            <p style={{ margin: "0 0 16px 0", color: "#374151" }}>
              You are about to submit a call-out for:
            </p>
            
            <div style={{ backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <div><strong>Date:</strong> {new Date(selectedShift.date).toLocaleDateString()}</div>
              <div><strong>Shift:</strong> {selectedShift.shiftType} shift</div>
              <div><strong>Type:</strong> {absenceTypes.find(t => t.value === callOutData.absenceType)?.label}</div>
              <div><strong>Contact:</strong> {callOutData.contactNumber}</div>
            </div>
            
            {getShiftUrgency(selectedShift.date).level === 'critical' && (
              <div style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
                color: "#dc2626"
              }}>
                <FaExclamationTriangle style={{ marginRight: "8px" }} />
                This is a CRITICAL call-out (less than 2 hours notice). Emergency protocols will be activated.
              </div>
            )}
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmCallOut}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: submitting ? "#9ca3af" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: submitting ? "not-allowed" : "pointer",
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
                  "Confirm Call-Out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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

export default NurseCallOut;