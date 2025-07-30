// src/pages/AdminPTORequests.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPTORequests() {
  const [ptoRequests, setPtoRequests] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/pto') // Update this if your backend route is different
      .then((response) => {
        setPtoRequests(response.data);
      })
      .catch((error) => {
        console.error('Error fetching PTO requests:', error);
      });
  }, []);

  return (
    <div style={{
      padding: "40px 60px",
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#f9f9f9"
    }}>
      <h1 style={{
        fontSize: "2rem",
        color: "#dc2626",
        marginBottom: "20px"
      }}>View PTO Requests</h1>

      {ptoRequests.length === 0 ? (
        <p style={{ fontSize: "1.1rem", color: "#333" }}>
          No PTO requests submitted yet.
        </p>
      ) : (
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <thead style={{ backgroundColor: "#dc2626", color: "#fff" }}>
            <tr>
              <th style={headerStyle}>Nurse Name</th>
              <th style={headerStyle}>Date</th>
              <th style={headerStyle}>Status</th>
              <th style={headerStyle}>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {ptoRequests.map((request, index) => (
              <tr key={index} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                <td style={cellStyle}>{request.nurseName}</td>
                <td style={cellStyle}>{request.date}</td>
                <td style={cellStyle}>{request.status}</td>
                <td style={cellStyle}>
                  {new Date(request.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

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

