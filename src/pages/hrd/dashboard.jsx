import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  Legend,
);

const DashboardHRD = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua Cabang");
  const [cabangList, setCabangList] = useState([]);

  const [stats, setStats] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    cuti: 0,
    terlambat: 0,
    alpha: 0,
  });
  const [chartData, setChartData] = useState({
    hadir: [],
    sakit: [],
    izin: [],
    cuti: [],
    terlambat: [],
    alpha: [],
  });

  useEffect(() => {
    if (user) {
      const fetchCabang = async () => {
        try {
          const res = await fetch(import.meta.env.VITE_API_URL + "/api/cabang");
          const data = await res.json();
          setCabangList(data.map((c) => c.nama));
        } catch (err) {
          console.error(err);
        }
      };
      fetchCabang();
    }
  }, [user]);

  // UPDATE: Panggil ulang fetchStats JIKA filter cabang berubah
  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/dashboard/stats?role=hrd&sub_cabang=${selectedFilter}`,
          );
          const data = await res.json();
          if (data.totals) setStats(data.totals);
          if (data.chart) setChartData(data.chart);
        } catch (err) {
          console.error("Gagal menarik statistik", err);
        }
      };
      fetchStats();
    }
  }, [user, selectedFilter]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleNav = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const statsCards = [
    {
      label: "Hadir",
      value: stats.hadir,
      gradient: "linear-gradient(135deg, #2fb800 0%, #1f8f3d 100%)",
      shadow: "rgba(47, 184, 0, 0.3)",
    },
    {
      label: "Sakit",
      value: stats.sakit,
      gradient: "linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%)",
      shadow: "rgba(241, 196, 15, 0.3)",
    },
    {
      label: "Izin",
      value: stats.izin,
      gradient: "linear-gradient(135deg, #2980b9 0%, #094b75 100%)",
      shadow: "rgba(41, 128, 185, 0.3)",
    },
    {
      label: "Terlambat",
      value: stats.terlambat,
      gradient: "linear-gradient(135deg, #9b59b6 0%, #71368a 100%)",
      shadow: "rgba(155, 89, 182, 0.3)",
    },
    {
      label: "Alpha",
      value: stats.alpha,
      gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
      shadow: "rgba(231, 76, 60, 0.3)",
    },
    {
      label: "Cuti",
      value: stats.cuti,
      gradient: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)",
      shadow: "rgba(26, 188, 156, 0.3)",
    },
  ];

  const dataGrafik = {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    datasets: [
      {
        label: "Hadir",
        data: chartData.hadir,
        borderColor: "#2fb800",
        backgroundColor: "#2fb800",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Sakit",
        data: chartData.sakit,
        borderColor: "#f1c40f",
        backgroundColor: "#f1c40f",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Izin",
        data: chartData.izin,
        borderColor: "#2980b9",
        backgroundColor: "#2980b9",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Cuti",
        data: chartData.cuti,
        borderColor: "#1abc9c",
        backgroundColor: "#1abc9c",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Terlambat",
        data: chartData.terlambat,
        borderColor: "#9b59b6",
        backgroundColor: "#9b59b6",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Alpha",
        data: chartData.alpha,
        borderColor: "#e74c3c",
        backgroundColor: "#e74c3c",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const optionsGrafik = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 12, family: "'Inter', sans-serif" },
          color: "#555",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 10,
        ticks: { stepSize: 5, color: "#999", font: { size: 11 } },
        grid: { color: "#f0f0f0" },
      },
      x: {
        ticks: { color: "#999", font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar}>
          ✕
        </button>
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div
            className="menu-item active"
            onClick={() => handleNav("/hrd/dashboard")}
          >
            <div className="menu-left">
              <img src={iconDashboard} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNav("/hrd/kelolacabang")}
          >
            <div className="menu-left">
              <img src={iconKelola} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Kelola Cabang</span>
            </div>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNav("/hrd/datakaryawan")}
          >
            <div className="menu-left">
              <img src={iconKaryawan} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>
          <div
            className="menu-item has-arrow"
            onClick={() => handleNav("/hrd/kehadiran")}
          >
            <div className="menu-left">
              <img src={iconKehadiran} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Kehadiran</span>
            </div>
            <img src={iconBawah} alt="" className="arrow-icon-main" />
          </div>
          <div className="menu-item" onClick={() => handleNav("/hrd/laporan")}>
            <div className="menu-left">
              <img src={iconLaporan} alt="" className="menu-icon-main" />
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
        <header className="dashboard-header-area">
          <h1 className="dashboard-title">Dashboard Operasional</h1>
          <p className="dashboard-subtitle">
            Manajemen data kehadiran dan statistik karyawan
          </p>
        </header>

        <div className="dashboard-filter-row">
          <div className="filter-wrapper">
            <button
              className="btn-filter-green"
              onClick={() => setShowFilter(!showFilter)}
            >
              {selectedFilter}{" "}
              <img
                src={iconBawah}
                alt="v"
                className={showFilter ? "filter-arrow rotate" : "filter-arrow"}
              />
            </button>
            {showFilter && (
              <div className="filter-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedFilter("Semua Cabang");
                    setShowFilter(false);
                  }}
                >
                  Semua Cabang
                </div>
                {cabangList.map((c) => (
                  <div
                    key={c}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedFilter(c);
                      setShowFilter(false);
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-chart-box">
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

export default DashboardHRD;