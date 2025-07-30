import { useState, useEffect } from "react";
import axios from "axios";
import "./CallInPage.css";

const shiftOptions = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" }
];

const CallInListViewer = ({ onClose }) => {
  const [date, setSelectedDate] = useState("");
  const [shiftType, setSelectedShift] = useState("");
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNurses = async () => {
    if (!date || !shiftType) return;

    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get('/callins/available', {
        params: { date, shiftType }
      });
      setNurses(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch nurses');
      setNurses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCallIn = async (nurseId) => {
    try {
      await axios.put('/callins/status', {
        date,
        shiftType,
        empID: nurseId,
        status: 'called'
      });
      fetchNurses(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Call-in failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Call-In Nurse Finder</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Date:
              <input
                type="date"
                value={date}
                onChange={e => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </label>
          </div>

          <div className="form-group">
            <label>Shift:
              <select
                value={shiftType}
                onChange={e => setSelectedShift(e.target.value)}
                className="shift-select"
              >
                <option value="">-- Select Shift --</option>
                {shiftOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={fetchNurses}
            disabled={!date || !shiftType || loading}
            className="fetch-button"
          >
            {loading ? "Loading..." : "Get Call-In List"}
          </button>

          {error && <p className="error-message">{error}</p>}

          <div className="nurses-list-container">
            {nurses.length > 0 ? (
              <>
                <h4>Available Nurses:</h4>
                <div className="nurses-list">
                  {nurses.map(({ nurse, callInStatus }) => (
                    <div key={nurse._id} className="nurse-card">
                      <div className="nurse-info">
                        <h5>{nurse.name}</h5>
                        <p>Phone: {nurse.phone}</p>
                        <p>Email: {nurse.email}</p>
                        <p>Hours: {nurse.currentWeeklyHours}/{nurse.maxWeeklyHours || '∞'}</p>
                        <p>Status:
                          <span className={`status-${callInStatus}`}>
                            {callInStatus}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleCallIn(nurse._id)}
                        disabled={callInStatus !== 'available'}
                        className={`call-button ${callInStatus}`}
                      >
                        Call In
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              !loading && <p className="no-nurses">No available nurses found for this shift.</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Wrapper to enable routing and fix export error
const CallInPage = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {isOpen && <CallInListViewer onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default CallInPage;
