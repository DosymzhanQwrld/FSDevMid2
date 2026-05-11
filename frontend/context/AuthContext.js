"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('pex_token');
    if (storedToken) setToken(storedToken);
  }, []);

  const saveToken = (value) => {
    localStorage.setItem('pex_token', value);
    setToken(value);
  };

  const logout = () => {
    localStorage.removeItem('pex_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken: saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}