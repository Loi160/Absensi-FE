import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./dashboard.css"; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg"; 
import logoPersegi from "../../assets/logopersegi.svg"; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardHRD = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const statsCards = [
    { label: "Hadir", value: 270, gradient: "linear-gradient(135deg, #2fb800 0%, #1f8f3d 100%)", shadow: "rgba(47, 184, 0, 0.3)" },
    { label: "Sakit", value: 270, gradient: "linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%)", shadow: "rgba(241, 196, 15, 0.3)" }, 
    { label: "Izin", value: 270, gradient: "linear-gradient(135deg, #2980b9 0%, #094b75 100%)", shadow: "rgba(41, 128, 185, 0.3)" },
    { label: "Terlambat", value: 270, gradient: "linear-gradient(135deg, #9b59b6 0%, #71368a 100%)", shadow: "rgba(155, 89, 182, 0.3)" },
    { label: "Alpha", value: 270, gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)", shadow: "rgba(231, 76, 60, 0.3)" },
    { label: "Cuti", value: 270, gradient: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)", shadow: "rgba(26, 188, 156, 0.3)" },
  ];

  const dataGrafik = {
     labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
     datasets: [
        { label: "H", data: [100, 20, 35, 10, 30, 60], borderColor: "#2fb800", backgroundColor: "#2fb800", tension: 0.3, pointRadius: 4 },
        { label: "S", data: [25, 30, 15, 40, 50, 60], borderColor: "#f1c40f", backgroundColor: "#f1c40f", tension: 0.3, pointRadius: 4 },
        { label: "I", data: [15, 18, 22, 25, 23, 20], borderColor: "#2980b9", backgroundColor: "#2980b9", tension: 0.3, pointRadius: 4 },
        { label: "T", data: [30, 35, 40, 35, 35, 30], borderColor: "#9b59b6", backgroundColor: "#9b59b6", tension: 0.3, pointRadius: 4 },
        { label: "A", data: [10, 15, 30, 55, 38, 70], borderColor: "#e74c3c", backgroundColor: "#e74c3c", tension: 0.3, pointRadius: 4 },
     ]
  };

  const optionsGrafik = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: "bottom", 
        labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { family: "'Inter', sans-serif", size: 12 }, color: '#333' }
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f0f0f0" }, ticks: { stepSize: 20, font: { family: "'Inter', sans-serif", size: 11 }, color: '#666' } },
      x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#666' } }
    },
  };

  return (
    <div className="hrd-container">
      <aside className="sidebar">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          <div className="menu-item active" onClick={() => navigate('/hrd/dashboard')}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon-main"/> 
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/hrd/kelolacabang')}> 
            <div className="menu-left">
                <img src={iconKelola} alt="kelola" className="menu-icon-main"/> 
                <span className="menu-text-main">Kelola Cabang</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/hrd/datakaryawan')}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon-main"/> 
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          {/* SAYA TAMBAHKAN ONCLICK KE SINI JUGA BIAR AMAN */}
          <div className="menu-item has-arrow" onClick={() => navigate('/hrd/absenmanual')}>
            <div className="menu-left">
                <img src={iconKehadiran} alt="hadir" className="menu-icon-main"/> 
                <span className="menu-text-main">Kehadiran</span>
            </div>
            <img src={iconBawah} alt="down" className="arrow-icon-main" /> 
          </div>

          {/* SAYA TAMBAHKAN ONCLICK DI SINI BANG */}
          <div className="menu-item" onClick={() => navigate('/hrd/laporan')}>
            <div className="menu-left">
                <img src={iconLaporan} alt="lapor" className="menu-icon-main"/> 
                <span className="menu-text-main">Laporan</span>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
            <button className="btn-logout" onClick={handleLogout}>
                Log Out
            </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>Sistem Absensi</h1>
          <p>Sistem Absensi</p>
        </header>

        <div className="chart-section shadow-box">
          <div className="chart-container-inner">
             <Line data={dataGrafik} options={optionsGrafik} />
          </div>
        </div>

        <div className="stats-grid">
          {statsCards.map((item, index) => (
            <div 
                className="stat-card" 
                key={index}
                style={{ 
                    background: item.gradient,
                    boxShadow: `0 8px 20px ${item.shadow}`
                }}
            >
              <h1 className="stat-value">{item.value}</h1>
              <p className="stat-label">{item.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardHRD;