import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import context
import "./dashboard.css";

// --- IMPORT ASSETS ---
import logoPersegi from "../../assets/logopersegi.svg";
import perizinanIcon from "../../assets/perizinan.svg";
import riwayatIcon from "../../assets/riwayat.svg";
import kalenderIcon from "../../assets/kalender.svg";
import jamIcon from "../../assets/jam.svg";
import cameraIcon from "../../assets/camera.svg";
import profileImg from "../../assets/profile.svg";
import logoutIcon from "../../assets/kembalidashbord.svg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Ambil data user yang login
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateIndo = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTimeIndo = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours} : ${minutes} : ${seconds}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // Ambil nama user atau gunakan "Karyawan" jika belum load
  const namaPanggilan = user?.nama || "Karyawan";

  return (
    <div className="main-wrapper">
      <div className="card-container">

        {/* ================= HEADER / SIDEBAR ================= */}
        <div className="header-section">

          {/* HEADER MOBILE */}
          <div className="header-top-mobile mobile-only">
             <div className="header-user-info">
               <img src={profileImg} alt="Profile" className="mobile-profile-img" />
               <div className="mobile-greeting">
                 <h2>Halo, {namaPanggilan}</h2>
                 <p>Selamat bekerja!</p>
               </div>
             </div>
             <button className="mobile-header-logout" onClick={handleLogout}>
               <img src={logoutIcon} alt="Logout" />
             </button>
          </div>

          {/* HEADER DESKTOP */}
          <div className="sidebar-logo-desktop desktop-only">
             <img src={logoPersegi} alt="Amaga Corp" />
          </div>

          <div className="logo-center-area desktop-only">
            <img src={profileImg} alt="Profile User" className="img-circle-content" />
          </div>

          <h2 className="title-form desktop-only">Dashboard</h2>
          <p className="subtitle-form desktop-only">Halo, {namaPanggilan}. Selamat Bekerja!</p>

          <button className="btn-logout-desktop desktop-only" onClick={handleLogout}>
             Log Out
          </button>
        </div>

        {/* ================= CONTENT AREA ================= */}
        <div className="dashboard-content">

          {/* --- CARD INFO TANGGAL & WAKTU --- */}
          <div className="info-card">
            <img src={logoPersegi} alt="AMAGACORP" className="company-logo mobile-only" />
            <div className="datetime-row">
              <div className="date-box">
                <div className="dt-label">
                  <img src={kalenderIcon} alt="Kalender" className="mini-icon black-icon" />
                  Tanggal
                </div>
                <div className="dt-value">{formatDateIndo(dateTime)}</div>
              </div>
              <div className="divider-vertical"></div>
              <div className="time-box">
                <div className="dt-label">
                  <img src={jamIcon} alt="Jam" className="mini-icon black-icon" />
                  Waktu
                </div>
                <div className="time-big">{formatTimeIndo(dateTime)}</div>
              </div>
            </div>
          </div>

          {/* --- CARD MENU NAVIGASI --- */}
          <div className="menu-card">
            <button className="menu-btn-item" onClick={() => navigate("/karyawan/absensi")}>
              <div className="icon-box">
                <img src={cameraIcon} alt="Absensi" className="white-icon" />
              </div>
              <div className="text-content">
                <span className="btn-title">Absensi</span>
                <span className="btn-subtitle">Absensi Masuk Dan Keluar</span>
              </div>
            </button>

            <button className="menu-btn-item" onClick={() => navigate("/karyawan/perizinan")}>
              <div className="icon-box">
                <img src={perizinanIcon} alt="Perizinan" className="white-icon" />
              </div>
              <div className="text-content">
                <span className="btn-title">Perizinan</span>
                <span className="btn-subtitle">Perizinan Cuti, Sakit, DLL</span>
              </div>
            </button>

            <button className="menu-btn-item" onClick={() => navigate("/karyawan/riwayat")}>
              <div className="icon-box">
                <img src={riwayatIcon} alt="Riwayat" className="white-icon icon-riwayat-besar" />
              </div>
              <div className="text-content">
                <span className="btn-title">Riwayat</span>
                <span className="btn-subtitle">Riwayat Absensi Anda</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;