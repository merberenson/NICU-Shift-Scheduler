import { useState } from "react";
import axios from "axios";
import "./CallInPage.css"; // reusing same CSS styles

const shiftOptions = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" }
];

const CallOutPage = ({ onClose }) => {
  const [date, setDate] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch assigned nurses (who can be unscheduled)
  const fetchAssignedNurses = async () => {
    if (!date || !shiftType) return;

    try {
      setLoading(true);
      setError("");
      // This should be an endpoint that returns nurses assigned to that date/shift
      const { data } = await axios.get("/api/schedule", {
        params: { date, shiftType }
      });
      setNurses(data.assignedNurses || []); // adjust based on API response
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch nurses");
      setNurses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnschedule = async (nurseId) => {
    try {
      await axios.post("/callout/unschedule", {
        empID: nurseId,
        date,
        shiftType
      });
      alert("Nurse unscheduled successfully!");
      fetchAssignedNurses(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || "Failed to unschedule nurse");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Call-Out (Unschedule) Nurses</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Date:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="date-input"
              />
            </label>
          </div>

          <div className="form-group">
            <label>Shift:
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                className="shift-select"
              >
                <option value="">-- Select Shift --</option>
                {shiftOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={fetchAssignedNurses}
            disabled={!date || !shiftType || loading}
            className="fetch-button"
          >
            {loading ? "Loading..." : "Get Assigned Nurses"}
          </button>

          {error && <p className="error-message">{error}</p>}

          <div className="nurses-list-container">
            {nurses.length > 0 ? (
              <>
                <h4>Assigned Nurses:</h4>
                <div className="nurses-list">
                  {nurses.map((nurse) => (
                    <div key={nurse._id} className="nurse-card">
                      <div className="nurse-info">
                        <h5>{nurse.name}</h5>
                        <p>Phone: {nurse.phone}</p>
                        <p>Email: {nurse.email}</p>
                        <p>Hours: {nurse.currentWeeklyHours}/{nurse.maxWeeklyHours || '∞'}</p>
                      </div>
                      <button
                        onClick={() => handleUnschedule(nurse._id)}
                        className="call-button available"
                      >
                        Call Out
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              !loading && <p className="no-nurses">No assigned nurses for this shift.</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-modal-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CallOutPage;
