import React from 'react';
import Navbar from '../components/Navbar';
import ScheduleView from './ScheduleView';

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.header}>Welcome to the NICU Shift Scheduler</h1>
        <div style={styles.section}>
          <ScheduleView />
        </div>
      </main>
    </div>
  );
};

const styles = {
  main: {
    padding: '1.5rem',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '1.75rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  section: {
    marginTop: '1.5rem',
  },
};

export default Dashboard;

