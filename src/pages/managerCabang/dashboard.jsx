import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  const [userData, setUserData] = useState({
    nama: "Loading...",
    cabangUtama: "Memuat Data...",
    subCabang: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          nama: parsedUser.nama || "Manager",
          cabangUtama: parsedUser.cabangUtama || "Cabang Tidak Diketahui",
          subCabang: Array.isArray(parsedUser.subCabang) ? parsedUser.subCabang : [],
        });
      } catch (error) {
        console.error("Gagal memparsing data user dari localStorage", error);
      }
    }
  }, [navigate]);

  // STATE FILTER
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Sub-Cabang");

  // STATE MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasSubCabang = userData.subCabang.length > 0;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => {
    if (hasSubCabang) {
      setShowFilter(!showFilter);
    }
  };

  const handleSelectFilter = (val) => {
    setSelectedCabang(val);
    setShowFilter(false);
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Navigasi dari sidebar mobile: tutup sidebar dulu, baru navigate
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const getSimulatedData = (baseValue) => {
    if (!hasSubCabang) return baseValue;
    if (selectedCabang === "Semua Sub-Cabang") return baseValue;
    return Math.floor(baseValue * 0.4);
  };

  const statsCards = [
    { label: "Hadir", value: getSimulatedData(270), gradient: "linear-gradient(135deg, #2fb800 0%, #1f8f3d 100%)", shadow: "rgba(47, 184, 0, 0.3)" },
    { label: "Sakit", value: getSimulatedData(15), gradient: "linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%)", shadow: "rgba(241, 196, 15, 0.3)" },
    { label: "Izin", value: getSimulatedData(10), gradient: "linear-gradient(135deg, #2980b9 0%, #094b75 100%)", shadow: "rgba(41, 128, 185, 0.3)" },
    { label: "Terlambat", value: getSimulatedData(25), gradient: "linear-gradient(135deg, #9b59b6 0%, #71368a 100%)", shadow: "rgba(155, 89, 182, 0.3)" },
    { label: "Alpha", value: getSimulatedData(5), gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)", shadow: "rgba(231, 76, 60, 0.3)" },
    { label: "Cuti", value: getSimulatedData(12), gradient: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)", shadow: "rgba(26, 188, 156, 0.3)" },
  ];

  const dataGrafik = {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
    datasets: [
      { label: "Hadir", data: [100, 120, 135, 110, 130, 160].map(getSimulatedData), borderColor: "#2fb800", backgroundColor: "#2fb800", tension: 0.3, pointRadius: 4 },
      { label: "Sakit", data: [5, 10, 8, 15, 7, 12].map(getSimulatedData), borderColor: "#f1c40f", backgroundColor: "#f1c40f", tension: 0.3, pointRadius: 4 },
      { label: "Izin", data: [3, 5, 2, 8, 4, 6].map(getSimulatedData), borderColor: "#2980b9", backgroundColor: "#2980b9", tension: 0.3, pointRadius: 4 },
      { label: "Terlambat", data: [10, 15, 12, 18, 10, 8].map(getSimulatedData), borderColor: "#9b59b6", backgroundColor: "#9b59b6", tension: 0.3, pointRadius: 4 },
      { label: "Alpha", data: [2, 4, 1, 5, 3, 2].map(getSimulatedData), borderColor: "#e74c3c", backgroundColor: "#e74c3c", tension: 0.3, pointRadius: 4 },
    ],
  };

  const optionsGrafik = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { family: "'Inter', sans-serif", size: 12 }, color: "#333" },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f0f0f0" }, ticks: { stepSize: 20, font: { family: "'Inter', sans-serif", size: 11 }, color: "#666" } },
      x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: "#666" } },
    },
  };

  return (
    <div className="hrd-container">

      {/* ===== MOBILE TOPBAR ===== */}
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar} aria-label="Buka menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* ===== OVERLAY ===== */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <button className="btn-sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">
          ✕
        </button>

        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          <div className="menu-item active" onClick={() => handleNav("/managerCabang/dashboard")}>
            <div className="menu-left">
              <img src={iconDashboard} alt="dash" className="menu-icon-main" />
              <span className="menu-text-main">Dashboard</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => handleNav("/managerCabang/datakaryawan")}>
            <div className="menu-left">
              <img src={iconKaryawan} alt="karyawan" className="menu-icon-main" />
              <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => handleNav("/managerCabang/perizinan")}>
            <div className="menu-left">
              <img src={iconPerizinan} alt="perizinan" className="menu-icon-main" />
              <span className="menu-text-main">Perizinan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => handleNav("/managerCabang/laporan")}>
            <div className="menu-left">
              <img src={iconLaporan} alt="lapor" className="menu-icon-main" />
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

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-text">
            <h1>Dashboard Operasional - {userData.cabangUtama}</h1>
            <p>Manajemen data kehadiran dan statistik karyawan</p>
          </div>

          <div className="filter-wrapper">
            <button
              className="btn-filter-green"
              onClick={toggleFilter}
              style={{ cursor: hasSubCabang ? "pointer" : "default" }}
            >
              {!hasSubCabang ? userData.cabangUtama : selectedCabang}
              {hasSubCabang && (
                <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? "rotate" : ""}`} />
              )}
            </button>

            {showFilter && hasSubCabang && (
              <div className="filter-dropdown">
                {["Semua Sub-Cabang", ...userData.subCabang].map((c) => (
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
                boxShadow: `0 8px 20px ${item.shadow}`,
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