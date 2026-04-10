import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

// Assets
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileIcon from "../../assets/profile.svg";
import passwordIcon from "../../assets/password.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // MEMANGGIL BACKEND NODE.JS (PORT 3000)
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Simpan data user ke Global State (AuthContext)
        login(data.user);

        // ARAHKAN DASHBOARD BERDASARKAN ROLE DARI DATABASE
        if (data.user.role === "hrd") {
          navigate("/hrd/dashboard");
        } else if (data.user.role === "karyawan") {
          navigate("/karyawan/dashboard");
        } else if (data.user.role === "managerCabang") {
          navigate("/managerCabang/dashboard");
        }
      } else {
        // Tampilkan error dari backend (misal: "Username tidak ditemukan")
        alert(data.message || "Login Gagal");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert(
        "Gagal terhubung ke server backend! Pastikan Backend (npm run dev) sudah jalan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-split-container">
        {/* BRAND PANEL */}
        <div className="login-brand-section">
          <div className="brand-dot-grid" />
          <div className="brand-content-centered">
            <img
              src={logoPersegi}
              alt="Amaga Corp"
              className="login-logo-desktop desktop-only"
            />
            <span className="brand-logo-divider desktop-only" />
            <div className="brand-text-desktop desktop-only">
              <p>Platform absensi modern untuk Anda</p>
            </div>
            <div className="logo-mobile-wrapper mobile-only">
              <img
                src={logoAmaga}
                alt="Logo Amaga"
                className="login-logo-mobile"
              />
            </div>
            <h1 className="login-brand-title mobile-only">Sistem Absensi</h1>
            <p className="login-brand-subtitle mobile-only">
              Masuk ke akun anda
            </p>
          </div>
        </div>

        {/* FORM PANEL */}
        <div className="login-form-section">
          <div className="login-form-box">
            <div className="desktop-form-header desktop-only">
              <span className="desktop-brand-name">Amaga Corporation</span>
              <h2>Sistem Absensi</h2>
              <span className="form-divider" />
            </div>

            <form onSubmit={handleLogin}>
              <div className="login-field-group">
                <label>Username (NIK)</label>
                <div className="login-input-wrapper">
                  <img src={profileIcon} alt="" className="login-field-icon" />
                  <input
                    type="text"
                    placeholder="Masukkan NIK"
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

              <button
                type="submit"
                className="login-btn-green"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk Absensi"}
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
