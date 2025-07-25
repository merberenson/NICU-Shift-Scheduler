// src/pages/LogoutPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    logout(); // Clear auth

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate('/login');
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [logout, navigate]);

  return (
    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h2>You have been logged out successfully.</h2>
      <p>
        <Link to="/login" style={{ color: '#3b82f6', fontWeight: 'bold' }}>
          Back to login page
        </Link>
      </p>
      <p>Redirecting in {countdown} seconds...</p>
    </div>
  );
};

export default LogoutPage;
