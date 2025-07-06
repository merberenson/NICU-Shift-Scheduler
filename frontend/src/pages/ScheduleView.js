import React from 'react';
import ShiftCard from '../components/ShiftCard';
import './ScheduleView.css';

const mockShifts = [
  {
    id: 1,
    nurseName: 'Jane Smith',
    time: '7:00 AM - 3:00 PM',
    unit: 'NICU A',
    role: 'Charge Nurse',
  },
  {
    id: 2,
    nurseName: 'Michael Johnson',
    time: '3:00 PM - 11:00 PM',
    unit: 'NICU B',
    role: 'Floor Nurse',
  },
  {
    id: 3,
    nurseName: 'Emily Chen',
    time: '11:00 PM - 7:00 AM',
    unit: 'NICU C',
    role: 'Night Nurse',
  },
];

const ScheduleView = () => {
  return (
    <div className="schedule-container">
      <h2>Upcoming Shifts</h2>
      <div className="shift-list">
        {mockShifts.map((shift) => (
          <ShiftCard key={shift.id} shift={shift} />
        ))}
      </div>
    </div>
  );
};

export default ScheduleView;

