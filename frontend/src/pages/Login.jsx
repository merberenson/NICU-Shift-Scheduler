import React, { useState, useReducer, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FullLogo_Transparent.png';
import { FaHospital, FaUserNurse } from 'react-icons/fa';

const Login = () => {

// creates blank input
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        const form = { username, password };

        try {
            const res = await axios.post('/login', form);
            const userData = res.data;

            //update auth state.
            login(userData);
        
            if (userData.roles.includes('admin')) {
                navigate('/admin');
            } else if (userData.roles.includes('user')) {
                navigate('/');
            } else {
                navigate('/unauthorized');
            }
        } catch (err) {
            console.error('loggin failed: ', err.reponse?.data || err.message);
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
            <input
              type="text"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
              required
            />

            {error && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '-8px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              onClick={handleSubmit}
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
          <Link to="/register" style={{ color: '#6b21a8', fontWeight: '500'}}>
            Register
          </Link>
        </div>
      </div>
    );
};

export default Login;