import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

// Assets
import logoAmaga      from "../../assets/logoamaga.svg";
import logoPersegi    from "../../assets/logopersegi.svg";
import profileIcon    from "../../assets/profile.svg";
import passwordIcon   from "../../assets/password.svg";
import loginWatermark from "../../assets/login.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate  = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "hrd" && password === "123") {
      login({ username: "hrd", role: "hrd" });
      navigate("/hrd/dashboard");
    } else if (username === "karyawan" && password === "123") {
      login({ username: "karyawan", role: "karyawan" });
      navigate("/karyawan/dashboard");
    } else if (username === "managercabang" && password === "123") {
      login({ username: "managercabang", role: "managerCabang" });
      navigate("/managerCabang/dashboard");
    } else {
      alert("Username atau Password salah!");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-split-container">

        {/* ══════════ BRAND PANEL (Hijau) ══════════ */}
        <div className="login-brand-section">
          {/* Dot-grid texture */}
          <div className="brand-dot-grid" />

          <div className="brand-content-centered">
            {/* ── Desktop: logo panjang putih ── */}
            <img
              src={logoPersegi}
              alt="Amaga Corp"
              className="login-logo-desktop desktop-only"
            />
            {/* Thin divider line under desktop logo */}
            <span className="brand-logo-divider desktop-only" />

            {/* Desktop: brand text + pills */}
            <div className="brand-text-desktop desktop-only">
              <p>Platform absensi modern untuk Anda</p>
            </div>

            <div className="brand-pills desktop-only">
              {/* PILL 1: Real-time (Ikon Ceklis) */}
              <span className="brand-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Real-time
              </span>
              
              {/* PILL 2: Data Terpusat (Ikon Database) */}
              <span className="brand-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                  <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
                </svg>
                Data Terpusat
              </span>
              
              {/* PILL 3: Akses 24/7 (Ikon Jam) */}
              <span className="brand-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Akses 24/7
              </span>
            </div>

            {/* ── Mobile: Logo lingkaran + teks ── */}
            <div className="logo-mobile-wrapper mobile-only">
              <img src={logoAmaga} alt="Logo Amaga" className="login-logo-mobile" />
            </div>
            <h1 className="login-brand-title mobile-only">Sistem Absensi</h1>
            <p className="login-brand-subtitle mobile-only">Masuk ke akun anda</p>
          </div>
        </div>

        {/* ══════════ FORM PANEL (Putih) ══════════ */}
        <div className="login-form-section">
          <div className="login-form-box">

            {/* ── Desktop header ── */}
            <div className="desktop-form-header desktop-only">
              <span className="desktop-brand-name">Amaga Corporation</span>
              <h2>Sistem Absensi</h2>
              <span className="form-divider" />
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleLogin}>
              <div className="login-field-group">
                <label>Username</label>
                <div className="login-input-wrapper">
                  <img src={profileIcon} alt="" className="login-field-icon" />
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
                  <img src={passwordIcon} alt="" className="login-field-icon" />
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