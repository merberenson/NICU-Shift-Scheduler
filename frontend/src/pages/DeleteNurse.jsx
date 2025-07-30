import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FullLogo_Transparent.png';
import { FaHome, FaCalendarAlt, FaClipboardList, FaUserEdit, FaSignOutAlt, FaPhone } from 'react-icons/fa';
import { MdOutlineEventAvailable } from 'react-icons/md';

const DeleteNurse = () => {
  const [nurseId, setNurseId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.delete(`http://localhost:5000/api/delete-nurse`, {
        data: { nurseId, adminPassword }
      });
      setMessage(response.data.message || 'Nurse deleted successfully.');
      setConfirming(false);
      setNurseId('');
      setAdminPassword('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to delete nurse.');
    }
  };

  const navButtons = [
    { icon: <FaHome />, text: "Main", path: "/admin" },
    { icon: <FaCalendarAlt />, text: "Team Schedule", path: "/teamschedule" },
    { icon: <FaUserEdit />, text: "Register Nurse", path: "/register" },
    { icon: <MdOutlineEventAvailable />, text: "PTO Requests", path: "/ptorequests" },
    { icon: <FaPhone />, text: "Call-In Pool", path: "/callinpage" },
    { icon: <FaUserEdit />, text: "Delete Nurse", path: "/deletenurse" }
  ];

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

          {navButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => navigate(btn.path)}
              onMouseEnter={() => setHoveredBtn(index)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={sidebarButtonStyle(btn.path === "/deletenurse", hoveredBtn === index)}
            >
              {btn.icon}
              <span style={{ marginLeft: "8px" }}>{btn.text}</span>
            </button>
          ))}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 60px 20px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#dc2626',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
          marginTop: '120px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Delete a Nurse Account
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            placeholder="Enter Nurse ID"
            value={nurseId}
            onChange={(e) => setNurseId(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {confirming ? (
            <>
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                Are you sure? This will permanently delete the nurse account.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={confirmButtonStyle}>Yes, Delete</button>
                <button type="button" onClick={() => setConfirming(false)} style={cancelButtonStyle}>Go Back</button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              style={mainButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
              }}
            >
              Delete Nurse
            </button>
          )}

          {message && (
            <div style={{
              color: message.includes('success') ? '#186b3a' : 'red',
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '12px'
            }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  minWidth: '250px',
  fontSize: '16px',
};

const mainButtonStyle = {
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '16px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.2s ease-in-out',
  marginTop: '12px'
};

const confirmButtonStyle = {
  ...mainButtonStyle,
  backgroundColor: '#dc2626'
};

const cancelButtonStyle = {
  ...mainButtonStyle,
  backgroundColor: '#999'
};

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
  cursor: active ? "default" : "pointer",
  boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
  transform: hover ? "scale(1.05)" : "scale(1)",
  transition: "transform 0.2s, box-shadow 0.2s",
  textAlign: "center"
});

const logoutButtonStyle = (hover = false) => ({
  backgroundColor: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "18px",
  padding: "10px 20px",
  marginTop: "20px",
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

export default DeleteNurse;
