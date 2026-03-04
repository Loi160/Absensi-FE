import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

// FIX 1: Path CSS diarahkan ke folder HRD agar tidak error
import "../hrd/dashboard.css"; 

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
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg"; 
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

const DashboardManagerCabang = () => {
  const navigate = useNavigate();

  // STATE FILTER
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang");

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => setShowFilter(!showFilter);
  
  const handleSelectFilter = (val) => {
    setSelectedCabang(val);
    setShowFilter(false);
  };

  // --- SIMULASI DATA DINAMIS BERDASARKAN FILTER ---
  const getSimulatedData = (baseValue) => {
    if (selectedCabang === "Semua Cabang") return baseValue;
    if (selectedCabang === "Cabang 1") return Math.floor(baseValue * 0.4);
    if (selectedCabang === "Cabang 2") return Math.floor(baseValue * 0.3);
    if (selectedCabang === "Cabang 3") return Math.floor(baseValue * 0.2);
    if (selectedCabang === "Cabang 4") return Math.floor(baseValue * 0.1);
    return baseValue;
  };

  const statsCards = [
    { label: "Hadir", value: getSimulatedData(270), gradient: "linear-gradient(135deg, #2fb800 0%, #1f8f3d 100%)", shadow: "rgba(47, 184, 0, 0.3)" },
    { label: "Sakit", value: getSimulatedData(270), gradient: "linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%)", shadow: "rgba(241, 196, 15, 0.3)" }, 
    { label: "Izin", value: getSimulatedData(270), gradient: "linear-gradient(135deg, #2980b9 0%, #094b75 100%)", shadow: "rgba(41, 128, 185, 0.3)" },
    { label: "Terlambat", value: getSimulatedData(270), gradient: "linear-gradient(135deg, #9b59b6 0%, #71368a 100%)", shadow: "rgba(155, 89, 182, 0.3)" },
    { label: "Alpha", value: getSimulatedData(270), gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)", shadow: "rgba(231, 76, 60, 0.3)" },
    { label: "Cuti", value: getSimulatedData(270), gradient: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)", shadow: "rgba(26, 188, 156, 0.3)" },
  ];

  const dataGrafik = {
     labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
     datasets: [
        { label: "Hadir", data: [100, 20, 35, 10, 30, 60].map(getSimulatedData), borderColor: "#2fb800", backgroundColor: "#2fb800", tension: 0.3, pointRadius: 4 },
        { label: "Sakit", data: [25, 30, 15, 40, 50, 60].map(getSimulatedData), borderColor: "#f1c40f", backgroundColor: "#f1c40f", tension: 0.3, pointRadius: 4 },
        { label: "Izin", data: [15, 18, 22, 25, 23, 20].map(getSimulatedData), borderColor: "#2980b9", backgroundColor: "#2980b9", tension: 0.3, pointRadius: 4 },
        { label: "Terlambat", data: [30, 35, 40, 35, 35, 30].map(getSimulatedData), borderColor: "#9b59b6", backgroundColor: "#9b59b6", tension: 0.3, pointRadius: 4 },
        { label: "Alpha", data: [10, 15, 30, 55, 38, 70].map(getSimulatedData), borderColor: "#e74c3c", backgroundColor: "#e74c3c", tension: 0.3, pointRadius: 4 },
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
        
        {/* FIX 2: H2 Dihapus agar logo tidak numpuk/dobel */}
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          <div className="menu-item active" onClick={() => navigate('/managerCabang/dashboard')}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon-main"/> 
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/managerCabang/datakaryawan')}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon-main"/> 
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/managerCabang/perizinan')}>
            <div className="menu-left">
                <img src={iconPerizinan} alt="perizinan" className="menu-icon-main"/> 
                <span className="menu-text-main">Perizinan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/managerCabang/laporan')}>
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
          <div className="header-text">
             <h1>Dashboard Operasional</h1>
             <p>Manajemen data kehadiran dan statistik karyawan</p>
          </div>
          
          <div className="filter-wrapper">
             <button className="btn-filter-green" onClick={toggleFilter}>
                 {selectedCabang === "Semua Cabang" ? "Filter Cabang" : selectedCabang} 
                 <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? 'rotate' : ''}`} />
             </button>
             {showFilter && (
                 <div className="filter-dropdown">
                     {["Semua Cabang", "Cabang 1", "Cabang 2", "Cabang 3", "Cabang 4"].map((c) => (
                         <div key={c} className="dropdown-item" onClick={() => handleSelectFilter(c)}>
                             {c}
                         </div>
                     ))}
                 </div>
             )}
          </div>
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

export default DashboardManagerCabang;