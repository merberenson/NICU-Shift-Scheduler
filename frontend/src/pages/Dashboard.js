import React from 'react';
import Navbar from '../components/Navbar';
import './Dashboard.css'; // optional for layout styling

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="dashboard-main">
        <h1>Welcome to the NICU Scheduler Dashboard</h1>
        <p>Select a section from the navigation bar to get started.</p>

        {/* Placeholder: This is where shift cards or other content will go */}
        <div className="dashboard-content">
          {/* Future: <ShiftCard /> or <ScheduleView /> */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

