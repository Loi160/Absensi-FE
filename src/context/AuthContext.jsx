import React, { createContext, useContext, useState } from 'react';

// ============================================================================
// CONTEXT: AUTHENTICATION
// ============================================================================

const AuthContext = createContext(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const AuthProvider = ({ children }) => {
  // Menginisialisasi state dengan mengambil dan memvalidasi data dari localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Gagal mengurai data pengguna dari localStorage:", error);
      return null;
    }
  });

  // Menyimpan session dan data pengguna ke state serta localStorage
  const login = (data) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('session_token', data.session_token);
  };

  // Membersihkan state dan localStorage saat pengguna keluar
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

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

// Memudahkan komponen lain untuk mengakses nilai context secara langsung
export const useAuth = () => useContext(AuthContext);