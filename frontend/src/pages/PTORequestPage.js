import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const PTORequestPage = () => {
  const [nurseId, setNurseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false); // New state for redirection status


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRedirecting(true);
    const res = await fetch('http://localhost:5000/api/pto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nurseId: nurseId, startDate: startDate, endDate: endDate, reason: reason }),
    });

    if (res.ok) {
      setMessage('✅ PTO request submitted!');
      setStartDate('');
      setEndDate('');
      setReason('');

      const timer = setTimeout(() => {
          navigate('/');
        }, 3000);
    } else {
      setMessage('❌ Failed to submit PTO request');
      setRedirecting(false);
    }
  };

  const handleGoMain = () => {
      navigate('/');
  };

  useEffect(() => {
    return () => {
    };
  }, [message, redirecting]);
  
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '20px',
            marginTop: '20px',
            width: '100%'
          }}
        >
          <button
            type="button"
            onClick={handleGoMain}
            style={{
              width: '40%',
              padding: 12,
              background: '#808080',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              fontSize: 16,
              letterSpacing: 1,
              boxShadow: '0 1px 5px rgba(48,128,227,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onMouseOver={e => e.target.style.background = '#555555'}
            onMouseOut={e => e.target.style.background = '#808080'}
          >
            Go Back
          </button>
          <button
            type="submit"
            style={{
              width: '40%',
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
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onMouseOver={e => e.target.style.background = '#2550ad'}
            onMouseOut={e => e.target.style.background = '#3080e3'}
          >
            Submit PTO
          </button>
        </div>
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
