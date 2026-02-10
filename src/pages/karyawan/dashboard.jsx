import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css"; 

// --- IMPORT ASSETS ---
import logoPersegi from "../../assets/logopersegi.svg";
import perizinanIcon from "../../assets/perizinan.svg";
import riwayatIcon from "../../assets/riwayat.svg";

// Sesuaikan nama file:
import kembaliIcon from "../../assets/kembalidashbord.svg"; 

import kalenderIcon from "../../assets/kalender.svg";
import jamIcon from "../../assets/jam.svg";
import cameraIcon from "../../assets/camera.svg";

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
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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
        
        {/* --- 1. HEADER HIJAU --- */}
        <div className="dashboard-header">
          <div className="user-profile-row">
            <div className="user-info">
              <div className="avatar-circle"></div>
              <div className="greeting-text">
                <h2>Halo, Syahrul</h2>
                <p>Selamat bekerja!</p>
              </div>
            </div>
            
            {/* REVISI: Mengarah ke "/" (Halaman Login di App.jsx) */}
            <button className="btn-logout" onClick={() => navigate("/")}>
               <img src={kembaliIcon} alt="Logout" />
            </button>
          </div>
        </div>

        {/* --- 2. CARD ATAS (INFO) --- */}
        <div className="info-card">
          <img src={logoPersegi} alt="AMAGACORP" className="company-logo" />
          
          <div className="datetime-row">
            {/* Kiri: Tanggal */}
            <div className="date-box">
              <div className="dt-label">
                <img src={kalenderIcon} alt="" className="mini-icon black-icon" /> 
                Tanggal
              </div>
              <div className="dt-value">
                {formatDateIndo(dateTime)}
              </div>
            </div>

            {/* Garis Tengah */}
            <div className="divider-vertical"></div>

            {/* Kanan: Waktu */}
            <div className="time-box">
              <div className="dt-label">
                <img src={jamIcon} alt="" className="mini-icon black-icon" /> 
                Waktu
              </div>
              <div className="time-big">
                {formatTimeIndo(dateTime)}
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. CARD BAWAH (MENU) --- */}
        <div className="menu-card">
          
          {/* REVISI: Mengarah ke "/karyawan/absensi" */}
          <button className="menu-btn-item" onClick={() => navigate("/karyawan/absensi")}>
            <div className="icon-box">
              <img src={cameraIcon} alt="Absensi" className="white-icon" />
            </div>
            <div className="text-content">
              <span className="btn-title">Absensi</span>
              <span className="btn-subtitle">Absensi Masuk Dan Keluar</span>
            </div>
          </button>

          {/* REVISI: Mengarah ke "/karyawan/perizinan" */}
          <button className="menu-btn-item" onClick={() => navigate("/karyawan/perizinan")}>
            <div className="icon-box">
              <img src={perizinanIcon} alt="Perizinan" className="white-icon" />
            </div>
            <div className="text-content">
              <span className="btn-title">Perizinan</span>
              <span className="btn-subtitle">Perizinan Cuti, Sakit, DLL</span>
            </div>
          </button>

          <button className="menu-btn-item" onClick={() => navigate("/riwayat")}>
            <div className="icon-box">
              {/* Tambahkan class khusus 'icon-riwayat-besar' di sini */}
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
  );
};

export default Dashboard;