import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Placeholder for real auth
    if (email && password) {
      login({ email }); // Save user in context
      navigate('/');    // Redirect to dashboard
    } else {
      alert('Please enter both email and password.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '5rem',
    textAlign: 'center',
  },
  form: {
    display: 'inline-block',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    display: 'block',
    width: '300px',
    padding: '10px',
    margin: '10px auto',
    fontSize: '16px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#2c3e50',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};

export default LoginPage;

