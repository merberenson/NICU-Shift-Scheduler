import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FullLogo_Transparent.png';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = { name, username, password, email, phone };

    try {
      const res = await axios.post('/nurses', form);
      console.log('Registered:', res.data);
      setError(null);
      setSuccess('Registration successful!');
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      setSuccess(null);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
      }}
    >
      <img
        src={logo}
        alt="NICU Logo"
        style={{
          width: '600px',
          height: '600px',
          objectFit: 'contain',
          marginBottom: '-40px',
        }}
      />

      <div
        style={{
          marginTop: '-125px',
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
          }}
        >
          REGISTER
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          {[['Name', name, setName],
            ['Username', username, setUsername],
            ['Password', password, setPassword],
            ['Email', email, setEmail],
            ['Phone', phone, setPhone]
          ].map(([label, val, setter], i) => (
            <input
              key={i}
              type={label === 'Password' ? 'password' : 'text'}
              placeholder={label}
              value={val}
              onChange={(e) => setter(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minWidth: '250px',
                fontSize: '16px',
              }}
            />
          ))}

          {(error || success) && (
            <div style={{
              color: error ? 'red' : '#186b3a',
              fontSize: '14px',
              marginTop: '-8px',
              fontWeight: 'bold'
            }}>
              {error || success}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '16px',
              marginTop: '12px',
              marginLeft: '6px',
            }}
          >
            <button
              type="submit"
              style={{
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

            <Link
              to="/login"
              style={{
                color: '#dc2626',
                fontWeight: 'bold',
                fontSize: '15px',
                textDecoration: 'none',
              }}
            >
              or Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
