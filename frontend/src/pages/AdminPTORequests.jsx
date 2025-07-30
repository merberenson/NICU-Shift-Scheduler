import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from '../assets/FullLogo_Transparent.png';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserPlus, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function AdminPTORequests() {
  const [ptoRequests, setPtoRequests] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:5000/api/pto')
      .then((response) => setPtoRequests(response.data))
      .catch((error) => console.error('Error fetching PTO requests:', error));
  }, [refresh]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/pto/${id}`, { status: newStatus });
      setRefresh(!refresh);
    } catch (error) {
      console.error('Error updating PTO status:', error);
    }
  };

  const pendingRequests = ptoRequests.filter(req => req.status === 'Pending');
  const resolvedRequests = ptoRequests.filter(req => req.status !== 'Pending');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { color: 'green', fontWeight: 'bold' };
      case 'Denied': return { color: '#dc2626', fontWeight: 'bold' };
      default: return { color: '#f59e0b', fontWeight: 'bold' };
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>
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

          <button
            onClick={() => navigate("/admin")}
            onMouseEnter={() => setHoveredBtn("main")}
            onMouseLeave={() => setHoveredBtn(null)}
            style={sidebarButtonStyle(false, hoveredBtn === "main")}
          >
            <FaHome style={{ marginRight: "8px" }} /> Main
          </button>

          <button
            onClick={() => navigate("/teamschedule")}
            onMouseEnter={() => setHoveredBtn("schedule")}
            onMouseLeave={() => setHoveredBtn(null)}
            style={sidebarButtonStyle(false, hoveredBtn === "schedule")}
          >
            <FaCalendarAlt style={{ marginRight: "8px" }} /> Team Schedule
          </button>

          <button
            onClick={() => navigate("/register")}
            onMouseEnter={() => setHoveredBtn("register")}
            onMouseLeave={() => setHoveredBtn(null)}
            style={sidebarButtonStyle(false, hoveredBtn === "register")}
          >
            <FaUserPlus style={{ marginRight: "8px" }} /> Register Nurse
          </button>

          <button
            disabled
            onMouseEnter={() => setHoveredBtn("pto")}
            onMouseLeave={() => setHoveredBtn(null)}
            style={sidebarButtonStyle(true, hoveredBtn === "pto")}
          >
            <FaClipboardList style={{ marginRight: "8px" }} /> PTO Requests
          </button>
        </div>

        <button
          onClick={() => { logout(); navigate("/login"); }}
          onMouseEnter={() => setHoveredBtn("logout")}
          onMouseLeave={() => setHoveredBtn(null)}
          style={logoutButtonStyle(hoveredBtn === "logout")}
        >
          <FaSignOutAlt style={{ marginRight: "6px" }} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={pageStyle}>
        <h1 style={titleStyle}>Review PTO Requests</h1>

        {/* Pending */}
        <h2 style={sectionTitleStyle}>Pending Requests</h2>
        {pendingRequests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={headerStyle}>Nurse</th>
                <th style={headerStyle}>Start Date</th>
                <th style={headerStyle}>End Date</th>
                <th style={headerStyle}>Reason</th>
                <th style={headerStyle}>Submitted</th>
                <th style={headerStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req, index) => (
                <tr key={req._id} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                  <td style={cellStyle}>{req.nurseId?.name || req.nurseId}</td>
                  <td style={cellStyle}>{new Date(req.startDate).toLocaleDateString()}</td>
                  <td style={cellStyle}>{new Date(req.endDate).toLocaleDateString()}</td>
                  <td style={cellStyle}>{req.reason || 'N/A'}</td>
                  <td style={cellStyle}>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td style={cellStyle}>
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      style={{ padding: "6px", borderRadius: 6 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Denied">Denied</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* History */}
        <h2 style={{ ...sectionTitleStyle, marginTop: 40 }}>History</h2>
        {resolvedRequests.length === 0 ? (
          <p>No approved or denied requests yet.</p>
        ) : (
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={headerStyle}>Nurse</th>
                <th style={headerStyle}>Start Date</th>
                <th style={headerStyle}>End Date</th>
                <th style={headerStyle}>Reason</th>
                <th style={headerStyle}>Submitted</th>
                <th style={headerStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {resolvedRequests.map((req, index) => (
                <tr key={req._id} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                  <td style={cellStyle}>{req.nurseId?.name || req.nurseId}</td>
                  <td style={cellStyle}>{new Date(req.startDate).toLocaleDateString()}</td>
                  <td style={cellStyle}>{new Date(req.endDate).toLocaleDateString()}</td>
                  <td style={cellStyle}>{req.reason || 'N/A'}</td>
                  <td style={cellStyle}>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td style={{ ...cellStyle, ...getStatusStyle(req.status) }}>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

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
  transform: hover || active ? "scale(1.05)" : "scale(1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
});

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

const pageStyle = {
  flex: 1,
  padding: "60px",
  overflowY: "auto",
  backgroundColor: "#f9f9f9"
};

const titleStyle = {
  fontSize: "2rem",
  color: "#dc2626",
  marginBottom: "20px"
};

const sectionTitleStyle = {
  marginBottom: "14px",
  fontSize: "1.3rem",
  color: "#222"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  overflow: "hidden"
};

const theadStyle = {
  backgroundColor: "#dc2626",
  color: "#fff"
};

const headerStyle = {
  padding: "12px 20px",
  textAlign: "left",
  fontWeight: "bold"
};

const cellStyle = {
  padding: "12px 20px",
  borderBottom: "1px solid #e0e0e0"
};

const evenRowStyle = {
  backgroundColor: "#fff"
};

const oddRowStyle = {
  backgroundColor: "#f7f7f7"
};

export default AdminPTORequests;
