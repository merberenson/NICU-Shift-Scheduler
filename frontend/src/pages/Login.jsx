import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FullLogo_Transparent.png';
import { FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const res = await axios.post('/login', { username, password });
      const userData = res.data;

      login(userData);

      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'nurse') {
        navigate('/');
      } else {
        navigate('/unauthorized');
      }
    } catch (err) {
      console.error('Login failed: ', err.response?.data || err.message);
      setError(() => {
        const msg = err.response?.data?.message;
        return msg ? msg.charAt(0).toUpperCase() + msg.slice(1).replace(/\.?$/, '.') : "Login failed.";
      });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
      }}
    >
      <img
        src={logo}
        alt="NICU Logo"
        style={{
          width: '600px',
          height: '600px',
          objectFit: 'contain',
          marginBottom: '10px',
        }}
      />
      <div
        style={{
          marginTop: '-175px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#dc2626',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
            marginTop: '20px',
            marginBottom: '12px',
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          LOGIN
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              minWidth: '250px',
              fontSize: '16px',
            }}
            required
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
                paddingRight: '40px',
              }}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#555',
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {capsLockOn && (
            <div style={{ color: 'orange', fontSize: '14px', marginTop: '-8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaExclamationTriangle /> Caps Lock is ON
            </div>
          )}

          {error && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '-8px' }}>
              {error}
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
              gap: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease-in-out',
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
            Login
          </button>
        </form>

        <Link to="/register" style={{ color: '#6b21a8', fontWeight: '500', padding: "10px 20px" }}>
          Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
