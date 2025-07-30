import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/FullLogo_Transparent.png";
import { FaHome, FaCalendarAlt, FaClipboardList, FaUserEdit, FaSignOutAlt, FaPhone } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navButtons = [
    { icon: <FaHome />, text: "Main", path: "/admin" },
    { icon: <FaCalendarAlt />, text: "Team Schedule", path: "/teamschedule" },
    { icon: <FaUserEdit />, text: "Register Nurse", path: "/register" },
    { icon: <MdOutlineEventAvailable />, text: "PTO Requests", path: "/ptorequests" },
    { icon: <FaPhone />, text: "Call-In Pool", path: "/callinpage" },
    { icon: <FaUserEdit />, text: "Delete Nurse", path: "/deletenurse" }
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/nurses', { name, username, password, email, phone });
      setSuccess("Registration successful!");
      setError(null);
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
    } catch (err) {
      setSuccess(null);
      setError("Registration failed. Please try again.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "180px",
          backgroundColor: "#c6c0e6ff",
          padding: "20px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
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
              style={sidebarButtonStyle(btn.path === "/register", hoveredBtn === index)}
            >
              {btn.icon}
              <span style={{ marginLeft: "8px" }}>{btn.text}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
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
          Register a New Nurse
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          {[
            ['Name', name, setName],
            ['Username', username, setUsername],
            ['Password', password, setPassword],
            ['Email', email, setEmail],
            ['Phone', phone, setPhone]
          ].map(([label, val, setter], i) => (
            <input
              key={i}
              type={label === 'Password' ? 'password' : 'text'}
              placeholder={label}
              value={val}
              onChange={(e) => setter(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
            />
          ))}

          {(error || success) && (
            <div style={{ color: error ? 'red' : '#186b3a', fontSize: '14px', fontWeight: 'bold' }}>
              {error || success}
            </div>
          )}

          <button
            type="submit"
            style={{
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
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
            }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
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
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
  transform: hover ? "scale(1.05)" : "scale(1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  opacity: active ? 1 : 1
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

export default Register;
