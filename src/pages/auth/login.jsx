import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

// Import Asset
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg"; 
import profileIcon from "../../assets/profile.svg";
import passwordIcon from "../../assets/password.svg";
import loginWatermark from "../../assets/login.svg"; // <--- IMPORT ASET BARU ABANG

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'hrd' && password === '123') {
      login({ username: 'hrd', role: 'hrd' });
      navigate('/hrd/dashboard');
    } else if (username === 'karyawan' && password === '123') {
      login({ username: 'karyawan', role: 'karyawan' });
      navigate('/karyawan/dashboard');
    } else if (username === 'managercabang' && password === '123') {
      login({ username: 'managercabang', role: 'managerCabang' });
      navigate('/managerCabang/dashboard');
    } else {
      alert("Username atau Password salah! (Coba: hrd / karyawan / managercabang dengan password 123)");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-split-container">

        {/* === BAGIAN 1: BRANDING (Sekarang di Kanan untuk Desktop) === */}
        <div className="login-brand-section">
            
            {/* === WATERMARK RAKSASA (Hanya Desktop) === */}
            <img src={loginWatermark} alt="Watermark" className="login-watermark-bg desktop-only" />

            {/* Konten Utama Branding */}
            <div className="brand-content-centered">
                {/* Logo Persegi Besar untuk Desktop */}
                <img src={logoPersegi} alt="Amaga Corp" className="login-logo-desktop desktop-only" />
                
                {/* Logo Bulat Kecil untuk Mobile */}
                <div className="logo-mobile-wrapper mobile-only">
                   <img src={logoAmaga} alt="Logo Amaga" className="login-logo-mobile" />
                </div>

                <h1 className="login-brand-title mobile-only">Sistem Absensi</h1>
                <p className="login-brand-subtitle mobile-only">Masuk ke akun anda</p>
            </div>
        </div>

        {/* === BAGIAN 2: FORM (Sekarang di Kiri untuk Desktop) === */}
        <div className="login-form-section">
          <div className="login-form-box">

             <div className="desktop-form-header desktop-only">
                <h2>Sistem Absensi</h2>
                <p>Masuk ke akun anda</p>
             </div>

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
    </div>
  );
};

export default Login;
