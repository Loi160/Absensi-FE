import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext"; // <--- TAMBAHAN: Import Context
import "./login.css";

import logoAmaga from "../../assets/logoamaga.svg";
import profileIcon from "../../assets/profile.svg";
import passwordIcon from "../../assets/password.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- TAMBAHAN: Ambil fungsi login dari Context

  const handleLogin = (e) => {
    e.preventDefault();
    
    // --- LOGIKA LOGIN DIMULAI ---
    
    // 1. Cek jika user adalah HRD
    if (username === 'hrd' && password === '123') {
      // Simpan data user ke 'Otak' aplikasi
      login({ username: 'hrd', role: 'hrd' }); 
      // Arahkan ke Dashboard HRD
      navigate('/hrd/dashboard'); 
      
    // 2. Cek jika user adalah Karyawan
    } else if (username === 'karyawan' && password === '123') {
      // Simpan data user
      login({ username: 'karyawan', role: 'karyawan' });
      // Arahkan ke Dashboard Karyawan (atau Absensi)
      navigate('/karyawan/dashboard'); 
      
    // 3. Jika salah
    } else {
      alert("Username atau Password salah! (Coba: hrd / 123)");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        {/* Header Hijau Petak */}
        <div className="login-header-section">
          <div className="logo-only-wrapper">
            <img src={logoAmaga} alt="Logo Amaga" className="logo-main-pure" />
          </div>
          <h1 className="login-title">Sistem Absensi</h1>
          <p className="login-subtitle">Masuk ke akun anda</p>
        </div>

        {/* Card Putih - Dibuat Lebih Naik */}
        <div className="login-card-floating">
          <form onSubmit={handleLogin}>
            <div className="login-field-group">
              <label>Username</label>
              <div className="login-input-wrapper">
                <img src={profileIcon} alt="user" className="login-field-icon" />
                <input 
                  type="text" 
                  placeholder="Masukkan Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="login-field-group">
              <label>Password</label>
              <div className="login-input-wrapper">
                <img src={passwordIcon} alt="pass" className="login-field-icon" />
                <input 
                  type="password" 
                  placeholder="Masukkan Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="login-btn-green">
              Masuk Absensi
            </button>
          </form>

          <p className="login-help-text">
            Jika terjadi masalah hubungi 0123456789
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;