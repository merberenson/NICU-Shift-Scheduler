import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FullLogo_Transparent.png';
import { FaHome, FaCalendarAlt, FaClipboardList, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = { name, username, password, email, phone };

    try {
      const res = await axios.post('/nurses', form);
      console.log('Registered:', res.data);
      setError(null);
      setSuccess('Registration successful!');
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      setSuccess(null);
      setError('Registration failed. Please try again.');
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

          <button onClick={() => navigate("/admin")} style={sidebarButtonStyle()}>
            <FaHome style={{ marginRight: "8px" }} /> Main
          </button>
          <button onClick={() => navigate("/teamschedule")} style={sidebarButtonStyle()}>
            <FaCalendarAlt style={{ marginRight: "8px" }} /> Team Schedule
          </button>
          <button style={sidebarButtonStyle(true)} disabled>
            <FaUserPlus style={{ marginRight: "8px" }} /> Register Nurse
          </button>
          <button onClick={() => navigate("/ptorequests")} style={sidebarButtonStyle()}>
            <FaClipboardList style={{ marginRight: "8px" }} /> PTO Requests
          </button>
        </div>

        <button onClick={() => { logout(); navigate("/login"); }} style={logoutButtonStyle}>
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

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
          }}
        >
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
            <div style={{
              color: error ? 'red' : '#186b3a',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
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

const sidebarButtonStyle = (active = false) => ({
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
  transition: "transform 0.2s, box-shadow 0.2s",
  textAlign: "center"
});

const logoutButtonStyle = {
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
  justifyContent: "center"
};

export default Register;
