import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateIndo = (date) => {
    // UI/UX Update: Menggunakan 'short' untuk bulan agar menjadi singkatan (Feb)
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTimeIndo = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours} : ${minutes} : ${seconds}`;
  };

  return (
    <div className="main-wrapper">
      <div className="card-container">

        {/* ================= HEADER LAYER ================= */}
        <div className="header-section">

          {/* HEADER MOBILE: Profil Kiri, Sapaan Tengah, Logout Kanan */}
          <div className="header-top-mobile mobile-only">
             <div className="header-user-info">
               <img src={profileImg} alt="Profile" className="mobile-profile-img" />
               <div className="mobile-greeting">
                 <h2>Halo, Syahrul</h2>
                 <p>Selamat bekerja!</p>
               </div>
             </div>
             <button className="mobile-header-logout" onClick={() => navigate("/")}>
               <img src={logoutIcon} alt="Logout" />
             </button>
          </div>

          {/* SIDEBAR DESKTOP CONTENT */}
          <div className="desktop-sidebar-content desktop-only">
            {/* Logo Persegi Desktop (Pojok Atas) */}
            <div className="sidebar-logo-desktop">
               <img src={logoPersegi} alt="Amaga Corp" />
            </div>

            <div className="logo-center-area">
              <img src={profileImg} alt="Profile User" className="img-circle-content" />
            </div>

            <h2 className="title-form">Dashboard</h2>
            <p className="subtitle-form">Halo, Syahrul. Selamat Bekerja!</p>

            {/* Tombol Logout Desktop (Pojok Bawah) */}
            <button className="btn-logout-desktop" onClick={() => navigate("/")}>
               Log Out
            </button>
          </div>
        </div>

        {/* ================= CONTENT AREA ================= */}
        <div className="dashboard-content">

          {/* --- 1. CARD ATAS (INFO TANGGAL & WAKTU) --- */}
          <div className="info-card">
            {/* Logo Amaga Persegi (Mobile Only) */}
            <img src={logoPersegi} alt="AMAGACORP" className="company-logo mobile-only" />

            <div className="datetime-row">
              {/* BAGIAN TANGGAL */}
              <div className="date-box">
                <div className="dt-label">
                  <img src={kalenderIcon} alt="Kalender" className="mini-icon black-icon" />
                  Tanggal
                </div>
                <div className="dt-value">
                  {formatDateIndo(dateTime)}
                </div>
              </div>

              {/* GARIS PEMBATAS */}
              <div className="divider-vertical"></div>

              {/* BAGIAN WAKTU */}
              <div className="time-box">
                <div className="dt-label">
                  <img src={jamIcon} alt="Jam" className="mini-icon black-icon" />
                  Waktu
                </div>
                <div className="time-big">
                  {formatTimeIndo(dateTime)}
                </div>
              </div>
            </div>
          </div>

          {/* --- 2. CARD BAWAH (MENU NAVIGASI) --- */}
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