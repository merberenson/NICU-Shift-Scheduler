import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple hardcoded validation logic (replace with API later)
    if (email === 'nurse@example.com' && password === 'password123') {
      login(); // Sets isAuthenticated = true in AuthContext
      navigate('/');
    } else {
      setError('Invalid credentials. Try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>NICU Staff Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '5rem',
    textAlign: 'center',
  },
  header: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  form: {
    display: 'inline-block',
    textAlign: 'left',
  },
  input: {
    display: 'block',
    width: '250px',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    marginTop: '1rem',
    color: 'red',
  },
};

export default LoginPage;

