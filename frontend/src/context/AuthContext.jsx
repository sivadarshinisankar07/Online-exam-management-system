import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ep_user');
    const token  = localStorage.getItem('ep_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('ep_token', data.token);
    localStorage.setItem('ep_user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('ep_token');
    localStorage.removeItem('ep_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
