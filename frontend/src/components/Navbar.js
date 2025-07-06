import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Placeholder logout logic
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">NICU Scheduler</div>
      <ul className="navbar-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/admin">Admin Panel</Link></li>
        <li><Link to="/schedule">Schedule</Link></li>
        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;

