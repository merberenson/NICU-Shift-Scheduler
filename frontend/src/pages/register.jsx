import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/FullLogo_Transparent.png';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const timeOptions = [
  { value: 'day', label: 'Day shift (7AM-7PM)' },
  { value: 'night', label: 'Night shift (7PM-7AM)' },
  { value: 'unavailable', label: 'Not available' }
];

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [availability, setAvailability] = useState(
    daysOfWeek.map(day => ({ dayOfWeek: day, timeOfDay: "unavailable" }))
  );
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpdateTime = (day, value) => {
    setAvailability(prev =>
      prev.map(item =>
        item.dayOfWeek === day ? { ...item, timeOfDay: value } : item
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = { name, username, password, email, phone, availability };

    try {
      await axios.post('/nurses', form);
      navigate('/login'); // Redirect to login after successful registration
    } catch (err) {
      console.error('Registration failed: ', err.response?.data || err.message);
      setError(() => {
        const msg = err.response?.data?.message;
        return msg ? msg.charAt(0).toUpperCase() + msg.slice(1) : "Registration failed.";
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <img
        src={logo}
        alt="NICU Logo"
        style={{
          width: '600px',
          height: '600px',
          objectFit: 'contain',
          marginBottom: '10px',
        }}
      />
      <div style={{ marginTop: '-175px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#dc2626',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
          marginTop: '20px',
          marginBottom: '12px',
        }}>
          REGISTER
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />

          <div style={availabilityContainer}>
            {daysOfWeek.map(day => (
              <div key={day} style={dayBlock}>
                <span>{day}: </span>
                <select
                  value={availability.find(item => item.dayOfWeek === day)?.timeOfDay || 'unavailable'}
                  onChange={e => handleUpdateTime(day, e.target.value)}
                  style={{ padding: '10px 15px', fontSize: '16px' }}
                >
                  {timeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {error && <div style={{ color: 'red', fontSize: '14px', marginTop: '-8px' }}>{error}</div>}

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
            }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  minWidth: '250px',
  fontSize: '16px',
};

const availabilityContainer = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

const dayBlock = {
  fontWeight: '600',
  color: '#333',
  margin: '10px 0',
};

const buttonStyle = {
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '16px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.2s ease-in-out',
};

export default Register;