import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './WeeklySchedule.css'

const NurseScheduleViewer = () => {
  const { nurseId, startDate } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekStart, setWeekStart] = useState(new Date());
  
  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get day name (e.g., "Monday")
  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Format date as "MMM d" (e.g., "Jul 15")
  const formatShortDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Add days to a date
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Generate array of dates for a week
  const getWeekDates = (startDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    return dates;
  };

  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      console.log(nurseId, startDate);
      try {
        setLoading(true);
        setError(null);
        
        const startDate = formatDate(weekStart);
        const response = await axios.get(`/api/schedule/${nurseId}/${startDate}`);
        
        if (response.data.success) {
          // Parse date strings into Date objects
          const scheduleWithDates = response.data.data.map(shift => ({
            ...shift,
            dateObj: new Date(shift.date)
          }));
          setSchedule(scheduleWithDates);
        } else {
          setError(response.data.error || 'Failed to load schedule');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [nurseId, weekStart]);

  // Navigate between weeks
  const changeWeek = (direction) => {
    setWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction * 7));
      return newDate;
    });
  };

  // Find assigned shift for a specific date
  const getShiftForDate = (date) => {
    return schedule.find(shift => isSameDay(shift.dateObj, date));
  };

  // Generate week dates
  const weekDays = getWeekDates(weekStart);

  // Format week range display
  const formatWeekRange = () => {
    const start = formatShortDate(weekStart);
    const end = formatShortDate(addDays(weekStart, 6));
    return `Week of ${start} to ${end}`;
  };

  if (loading) {
    return <div className="loading">Loading schedule...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="schedule-container">
      <div className="week-navigation">
        <button onClick={() => changeWeek(-1)}>Previous Week</button>
        <h2>{formatWeekRange()}</h2>
        <button onClick={() => changeWeek(1)}>Next Week</button>
      </div>

      <div className="schedule-grid">
        {weekDays.map((day, index) => {
          const shift = getShiftForDate(day);
          const dayName = getDayName(day);
          const dateStr = formatShortDate(day);

          return (
            <div key={index} className={`day-card ${shift ? 'scheduled' : 'unscheduled'}`}>
              <div className="day-header">
                <h3>{dayName}</h3>
                <p>{dateStr}</p>
              </div>
              
              {shift ? (
                <div className="shift-details">
                  <p><strong>Shift:</strong> {shift.shiftType}</p>
                  <p><strong>Time:</strong> {shift.startTime} - {shift.endTime}</p>
                  <p><strong>Duration:</strong> {shift.duration}</p>
                </div>
              ) : (
                <div className="no-shift">
                  <p>No shift scheduled</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NurseScheduleViewer;