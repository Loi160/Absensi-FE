import React, { createContext, useContext, useState } from 'react';

// 1. Bikin wadah datanya
const AuthContext = createContext(null);

// 2. Bikin Provider (Penyedia data untuk seluruh aplikasi)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Awalnya null (belum login)

  const login = (userData) => {
    setUser(userData); // Simpan data user
    // Nanti bisa tambah simpan ke localStorage disini
  };

  const logout = () => {
    setUser(null); // Hapus data user
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Bikin hook biar gampang dipanggil di file lain
export const useAuth = () => useContext(AuthContext);