"use client";
import { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../components/Login';
import Register from '../components/Register';
import Dashboard from '../components/Dashboard';

function AppContent() {
  const { token, logout } = useAuth();
  const [view, setView] = useState('login');

  if (token) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1>Personal Exchange</h1>
          <button className="logout-button" onClick={logout}>Logout</button>
        </header>
        <Dashboard />
      </div>
    );
  }

  return (
    <div className="auth-container">
      {view === 'login' ? (
        <Login onSwitch={() => setView('register')} />
      ) : (
        <Register onSwitch={() => setView('login')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}