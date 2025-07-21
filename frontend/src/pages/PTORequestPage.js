import React, { useState } from 'react';

const PTORequestPage = () => {
  const [nurseId, setNurseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/pto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nurseId, startDate, endDate, reason }),
    });

    if (res.ok) {
      setMessage('✅ PTO request submitted!');
      setStartDate('');
      setEndDate('');
      setReason('');
    } else {
      setMessage('❌ Failed to submit PTO request');
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '40px auto',
        padding: 28,
        background: '#f9fafe',
        borderRadius: 10,
        boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
        fontFamily: 'Segoe UI, Arial, sans-serif'
      }}
    >
      <h2 style={{
        textAlign: 'center',
        marginBottom: 26,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: '#2550ad'
      }}>
        PTO Request
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>
            Nurse ID:
          </label>
          <input
            type="text"
            value={nurseId}
            onChange={e => setNurseId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #b5b5b5',
              borderRadius: 5,
              outline: 'none',
              fontSize: 15,
              background: '#fff'
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #b5b5b5',
              borderRadius: 5,
              outline: 'none',
              fontSize: 15,
              background: '#fff'
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>
            End Date:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #b5b5b5',
              borderRadius: 5,
              outline: 'none',
              fontSize: 15,
              background: '#fff'
            }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>
            Reason:
          </label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #b5b5b5',
              borderRadius: 5,
              outline: 'none',
              fontSize: 15,
              background: '#fff'
            }}
            placeholder="(optional)"
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 12,
            background: '#3080e3',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            fontSize: 16,
            letterSpacing: 1,
            boxShadow: '0 1px 5px rgba(48,128,227,0.08)',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.target.style.background = '#2550ad'}
          onMouseOut={e => e.target.style.background = '#3080e3'}
        >
          Submit PTO
        </button>
      </form>
      {message && (
        <div style={{
          marginTop: 18,
          textAlign: 'center',
          color: message.startsWith('✅') ? '#186b3a' : '#c42a3d',
          fontWeight: 'bold',
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PTORequestPage;
