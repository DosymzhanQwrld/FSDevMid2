"use client";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function Login({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const data = await login({ username, password });
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="section-card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>Login to PEX</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 16 }}>
        Don&apos;t have an account?{' '}
        <button 
          type="button" 
          onClick={onSwitch} 
          style={{ background: 'transparent', color: '#2f80ed', padding: 0 }}
        >
          Register
        </button>
      </p>
    </div>
  );
}