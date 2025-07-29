import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FullLogo_Transparent.png';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = { name, username, password, email, phone };

    try {
      const res = await axios.post('/nurses', form);
      console.log('Registered:', res.data);
      // navigate('/login'); // optionally redirect
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <img src={logo} alt="Logo" style={{ width: '200px', marginBottom: '20px' }} />
      <h2 style={{ color: '#dc2626', fontWeight: 'bold' }}>REGISTER</h2>

      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', padding: '20px', borderRadius: '12px' }}>
        {[['Name', name, setName], ['Username', username, setUsername], ['Password', password, setPassword], ['Email', email, setEmail], ['Phone', phone, setPhone]].map(([placeholder, value, setter], i) => (
          <input
            key={i}
            type={placeholder === 'Password' ? 'password' : 'text'}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setter(e.target.value)}
            required
            style={{ display: 'block', margin: '10px auto', padding: '10px', borderRadius: '8px', width: '250px', border: '1px solid #ccc' }}
          />
        ))}

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

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
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
