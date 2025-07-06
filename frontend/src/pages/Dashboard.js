// src/pages/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Optional if you want to style separately

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1>Welcome to the Admin Dashboard</h1>

      <div className="dashboard-buttons">
        <button onClick={() => navigate('/schedule')}>View Schedule</button>
        <button onClick={() => navigate('/users')}>Manage Users</button>
        <button onClick={() => navigate('/requests')}>View Requests</button>
      </div>
    </div>
  );
};

export default Dashboard;

