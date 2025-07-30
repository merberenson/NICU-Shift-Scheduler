import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPTORequests() {
  const [ptoRequests, setPtoRequests] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/pto')
      .then((response) => {
        setPtoRequests(response.data);
      })
      .catch((error) => {
        console.error('Error fetching PTO requests:', error);
      });
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
      case 'Approved':
        return { color: 'green', fontWeight: 'bold' };
      case 'Denied':
        return { color: '#dc2626', fontWeight: 'bold' };
      case 'Pending':
      default:
        return { color: '#f59e0b', fontWeight: 'bold' };
    }
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Review PTO Requests</h1>

      {/* Pending Requests */}
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

      {/* Resolved Requests */}
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
  );
}

const pageStyle = {
  padding: "40px 60px",
  fontFamily: "Arial, sans-serif",
  minHeight: "100vh",
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
