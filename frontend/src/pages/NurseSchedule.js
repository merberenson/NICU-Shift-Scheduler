import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './NurseSchedule.css';
import AdminLayout from '../components/AdminLayout';
import CallInList from '../components/callInList';

const NurseSchedule = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    // Format as YYYY-MM-DD
    const currentDate = new Date()
    const formattedDate = currentDate.toISOString().split('T')[0]

    const goToPreviousWeek = () => {
      const newWeek = new Date(currentWeek);
      newWeek.setDate(newWeek.getDate() - 7);
      setCurrentWeek(newWeek);
    };

    const goToNextWeek = () => {
      const newWeek = new Date(currentWeek);
      newWeek.setDate(newWeek.getDate() + 7);
      setCurrentWeek(newWeek);
    };


    useEffect(() => {
      const fetchSchedule = async () => {
        try {   
          console.log(user, user.userData._id, formattedDate) 
          const response = await axios.get(`/api/schedule/${user.userData._id}/${formattedDate}`);
          setSchedule(response.data.data);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to load schedule');
        } finally {
          setLoading(false);
        }
      };
        
      fetchSchedule();
    }, [user._id]);

    if (loading) return <div className="loading">Loading schedule...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
      <AdminLayout>
      <div className="schedule-container">
        <h2>Your Weekly Schedule</h2>
        <div className="schedule-scroll">
          {schedule.length > 0 ? (
            schedule.map((shift, index) => (
              <div key={index} className="shift-card">
                <h3>{shift.dayOfWeek}</h3>
                <p>{new Date(shift.date).toLocaleDateString()}</p>
                <div className="shift-details">
                  <p><strong>Shift:</strong> {shift.shiftType}</p>
                  <p><strong>Time:</strong> {shift.startTime} - {shift.endTime}</p>
                  <p><strong>Duration:</strong> {shift.duration}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No shifts scheduled for this week</p>
          )}
        </div>
      </div>
      </AdminLayout>
    );
};

export default NurseSchedule;