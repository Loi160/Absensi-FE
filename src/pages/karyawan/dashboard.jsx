import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase";
import "./dashboard.css";

import logoPersegi from "../../assets/logopersegi.svg";
import perizinanIcon from "../../assets/perizinan.svg";
import riwayatIcon from "../../assets/riwayat.svg";
import kalenderIcon from "../../assets/kalender.svg";
import jamIcon from "../../assets/jam.svg";
import cameraIcon from "../../assets/camera.svg";
import profileImg from "../../assets/profile.svg";
import logoutIcon from "../../assets/kembalidashbord.svg";

// Fungsi bantuan untuk mengubah format tanggal bawaan sistem jadi format lokal Indonesia 
const formatDateIndo = (date) => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Fungsi bantuan untuk mengatur format jam digital agar selalu rapi 2 digit (HH : MM : SS)
const formatTimeIndo = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours} : ${minutes} : ${seconds}`;
};

// Konfigurasi daftar tombol menu utama yang bakal ditampilin di halaman dashboard karyawan
const MENU_ITEMS = [
  {
    path: "/karyawan/absensi",
    icon: cameraIcon,
    title: "Absensi",
    subtitle: "Absensi Masuk Dan Keluar",
  },
  {
    path: "/karyawan/perizinan",
    icon: perizinanIcon,
    title: "Perizinan",
    subtitle: "Perizinan Cuti, Sakit, DLL",
  },
  {
    path: "/karyawan/riwayat",
    icon: riwayatIcon,
    title: "Riwayat",
    subtitle: "Riwayat Absensi Anda",
    iconClass: "icon-riwayat-besar",
  },
];

// Komponen utama untuk kerangka halaman Dashboard
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State khusus untuk menyimpan waktu saat ini agar jam digital bisa berjalan
  const [dateTime, setDateTime] = useState(new Date());

  // Efek samping (interval) untuk memperbarui detak jam setiap 1 detik sekali
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk menghapus sesi login dan melempar user kembali ke halaman login
  const handleLogout = () => {
  logout();
  navigate("/auth/login");
};

  // Menyiapkan sapaan nama pengguna, kalau data kosong maka dipanggil "Karyawan"
  const namaPanggilan = user?.nama || "Karyawan";

  // Mengambil URL foto profil dari database Supabase, kalau belum unggah pakai avatar bawaan
  const getProfilePic = () => {
    if (!user || !user.foto_karyawan) {
      return profileImg;
    }
    const { data } = supabase.storage.from('karyawan-docs').getPublicUrl(user.foto_karyawan);
    return data.publicUrl;
  };

  return (
    <div className="main-wrapper">
      <div className="card-container">
        <div className="header-section">
          <div className="header-top-mobile mobile-only">
            <div className="header-user-info">
              <img 
                src={getProfilePic()} 
                alt="Profile" 
                className="mobile-profile-img" 
                style={{ objectFit: 'cover' }}
              />
              <div className="mobile-greeting">
                <h2>{namaPanggilan}</h2>
              </div>
            </div>
            <button className="mobile-header-logout" onClick={handleLogout}>
              <img src={logoutIcon} alt="Logout" />
            </button>
          </div>

          <div className="sidebar-logo-desktop desktop-only">
            <img src={logoPersegi} alt="Amaga Corp" />
          </div>

          <div className="logo-center-area desktop-only">
            <img
              src={getProfilePic()}
              alt="Profile User"
              className="img-circle-content"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <h2 className="title-form desktop-only">Dashboard</h2>
          <p className="subtitle-form desktop-only">{namaPanggilan}</p>

          <button className="btn-logout-desktop desktop-only" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        <div className="dashboard-content">
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

          <div className="menu-card">
            {MENU_ITEMS.map((item, index) => (
              <button
                key={index}
                className="menu-btn-item"
                onClick={() => navigate(item.path)}
              >
                <div className="icon-box">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className={`white-icon ${item.iconClass || ""}`}
                  />
                </div>
                <div className="text-content">
                  <span className="btn-title">{item.title}</span>
                  <span className="btn-subtitle">{item.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;