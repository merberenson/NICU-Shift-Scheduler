import React from 'react';
import './ShiftCard.css';

const ShiftCard = ({ nurseName, role, date, time, status }) => {
  return (
    <div className="shift-card">
      <h3>{nurseName}</h3>
      <p><strong>Role:</strong> {role}</p>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Time:</strong> {time}</p>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
};

export default ShiftCard;

