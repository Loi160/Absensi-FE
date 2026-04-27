import React, { createContext, useContext, useState, } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Mengambil data dari localStorage saat aplikasi pertama kali dimuat
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (data) => {
  setUser(data.user);

  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('session_token', data.session_token);
  };

  const logout = () => {
    setUser(null); 
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);