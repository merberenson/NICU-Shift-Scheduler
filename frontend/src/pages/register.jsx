import { use, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FullLogo_Transparent.png';
import AdminLayout from '../components/AdminLayout';

const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const timeOptions = [
    { value: 'day', label: 'Day shift (7AM-7PM)' },
    { value: 'night', label: 'Night shift (7PM-7AM)', },
    { value: 'unavailable', label: 'Not available' }
]

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [availability, setAvailability] = useState(
            daysOfWeek.map(day => ({ dayOfWeek: day, timeOfDay: "unavailable" }))
        )
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleUpdateTime = (day, value) => {
        setAvailability(prev =>
            prev.map(item =>
                item.dayOfWeek === day ? { ...item, timeOfDay: value} : item
            )
        )
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = { name, username, password, email, phone, availability };

        try {
        const res = await axios.post('/nurses', form)
        
        console.log('registered: ', res.data)
        } catch (err) {
            console.error('Registration failed: ', err.response?.data || err.message);
        }
    };

    return (
      <AdminLayout>
      <div
        style={{
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#dc2626',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
              marginTop: '20px',
              marginBottom: '12px',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            REGISTER
          </h2>
        
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
              required
            />
            <input
              type="text"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
              required
            />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
              required
            />
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  marginBottom: '15px',
                  padding: '20px',
                }}
              >
                {daysOfWeek.map(day => (
                  <div 
                    key={day}
                    style={{
                        flex: '0 0 100px',
                        fontWeight: '600',
                        color: '#333',
                        margin: '10px',
                    }}
                  >
                    <span>{day}: </span>
                  <select
                    value= {availability.find(item => item.dayOfWeek === day)?.timeOfDay || 'unavailable' }
                    onChange={e => handleUpdateTime(day, e.target.value)}
                    style={{
                      padding: '10px 15px',
                      fontSize: '16px'
                    }}
                  >
                    {timeOptions.map(opt => (
                      <option key ={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  </div>
                ))}
              </div>
            </div>
            

            {error && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '-8px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                fontWeight: 'bold',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease-in-out',
              }}
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
      </AdminLayout>
    );
}

export default Register;