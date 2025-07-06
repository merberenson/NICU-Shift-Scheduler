import React from 'react';
import Navbar from '../components/Navbar';
import ScheduleView from './ScheduleView'; // Can also be moved to components if preferred
// import ShiftCard from '../components/ShiftCard'; // Optional: for shift previews or summaries

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.header}>Welcome to the NICU Shift Scheduler</h1>

        {/* Main Schedule/Shift Section */}
        <div style={styles.section}>
          <ScheduleView />
        </div>

        {/* Optional: Area for quick shift previews or announcements */}
        {/* <div style={styles.section}>
          <ShiftCard />
        </div> */}
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

