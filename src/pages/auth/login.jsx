import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import "./login.css";

// ============================================================================
// IMPORT: ASSETS
// ============================================================================

import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileIcon from "../../assets/profile.svg";
import passwordIcon from "../../assets/password.svg";

// ============================================================================
// KONSTANTA: API & ROUTE
// ============================================================================

const LOGIN_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/login`;

const DASHBOARD_ROUTES_BY_ROLE = {
  hrd: "/hrd/dashboard",
  karyawan: "/karyawan/dashboard",
  managerCabang: "/managerCabang/dashboard",
};

// ============================================================================
// COMPONENT: LOGIN
// ============================================================================

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Mengarahkan pengguna ke dashboard sesuai role yang diterima dari backend.
  const navigateToDashboard = (role) => {
    const dashboardRoute = DASHBOARD_ROUTES_BY_ROLE[role];

    if (dashboardRoute) {
      navigate(dashboardRoute);
    }
  };

  // Memproses autentikasi pengguna melalui API backend.
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        LOGIN_ENDPOINT,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login Gagal");
        return;
      }

      login(data);
      navigateToDashboard(data.user.role);
    } catch (error) {
      console.error("Connection Error:", error);

      alert(
        "Gagal terhubung ke server backend! Pastikan Backend (npm run dev) sudah jalan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-split-container">
        {/* ====================================================================
        // PANEL: BRAND
        // ==================================================================== */}

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

            <h1 className="login-brand-title mobile-only">
              Sistem Absensi
            </h1>

            <p className="login-brand-subtitle mobile-only">
              Masuk ke akun anda
            </p>
          </div>
        </div>

        {/* ====================================================================
        // PANEL: FORM LOGIN
        // ==================================================================== */}

        <div className="login-form-section">
          <div className="login-form-box">
            <div className="desktop-form-header desktop-only">
              <span className="desktop-brand-name">
                Amaga Corporation
              </span>

              <h2>
                Sistem Absensi
              </h2>

              <span className="form-divider" />
            </div>

            <form onSubmit={handleLogin}>
              <div className="login-field-group">
                <label>
                  Username (NIK)
                </label>

                <div className="login-input-wrapper">
                  <img
                    src={profileIcon}
                    alt=""
                    className="login-field-icon"
                  />

                  <input
                    type="text"
                    placeholder="Masukkan NIK"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field-group">
                <label>
                  Password
                </label>

                <div className="login-input-wrapper">
                  <img
                    src={passwordIcon}
                    alt=""
                    className="login-field-icon"
                  />

                  <input
                    type="password"
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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