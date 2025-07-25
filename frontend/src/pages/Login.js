import React from 'react';
import logo from '../assets/FullLogo_Transparent.png';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaUserNurse } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/admin-login');
  };

  const handleUserLogin = () => {
    const regularUser = { username: 'Regular User', roles: ['user'], uid: '687072f4fc13ae2258f82ec8' };
    login(regularUser);
    navigate('/');
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleAdminLogin}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
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
            <FaHospital size={16} />
            Admin
          </button>

          <span style={{ fontWeight: '500', color: '#6b21a8' /* deep purple */ }}>
            OR
          </span>

          <button
            onClick={handleNurseLogin}
            style={{
              backgroundColor: '#dc2626', // Red like Admin
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
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
            <FaUserNurse size={16} />
            Nurse
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
