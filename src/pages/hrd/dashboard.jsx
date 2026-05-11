import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
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

// ============================================================================
// CHART: REGISTRATION
// ============================================================================

// Mendaftarkan elemen Chart.js yang dibutuhkan untuk menampilkan grafik garis.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ============================================================================
// CONSTANTS: API & NAVIGATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MENU_ITEMS = [
  {
    path: "/hrd/dashboard",
    icon: iconDashboard,
    text: "Dashboard",
    active: true,
  },
  {
    path: "/hrd/kelolacabang",
    icon: iconKelola,
    text: "Kelola Cabang",
  },
  {
    path: "/hrd/datakaryawan",
    icon: iconKaryawan,
    text: "Data Karyawan",
  },
  {
    path: "/hrd/kehadiran",
    icon: iconKehadiran,
    text: "Kehadiran",
    hasArrow: true,
  },
  {
    path: "/hrd/laporan",
    icon: iconLaporan,
    text: "Laporan",
  },
];

const WEEKDAY_LABELS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const DEFAULT_STATS = {
  hadir: 0,
  sakit: 0,
  izin: 0,
  cuti: 0,
  terlambat: 0,
  alpha: 0,
};

const DEFAULT_CHART_DATA = {
  hadir: [],
  sakit: [],
  izin: [],
  cuti: [],
  terlambat: [],
  alpha: [],
};

// ============================================================================
// CONSTANTS: CHART CONFIGURATION
// ============================================================================

const optionsGrafik = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        color: "#555",
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 10,
      ticks: {
        stepSize: 5,
        color: "#999",
        font: {
          size: 11,
        },
      },
      grid: {
        color: "#f0f0f0",
      },
    },
    x: {
      ticks: {
        color: "#999",
        font: {
          size: 11,
        },
      },
      grid: {
        display: false,
      },
    },
  },
};

// ============================================================================
// HELPERS: DATA BUILDER
// ============================================================================

// Menyusun konfigurasi kartu statistik berdasarkan data ringkasan dari backend.
const buildStatsCards = (stats) => {
  return [
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
};

// Menyusun dataset grafik kehadiran berdasarkan data chart dari backend.
const buildChartConfig = (chartData) => {
  return {
    labels: WEEKDAY_LABELS,
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
};

// ============================================================================
// COMPONENT: DASHBOARD HRD
// ============================================================================

const DashboardHRD = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua Cabang");
  const [cabangList, setCabangList] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);

  const statsCards = useMemo(() => {
    return buildStatsCards(stats);
  }, [stats]);

  const dataGrafik = useMemo(() => {
    return buildChartConfig(chartData);
  }, [chartData]);

  // ============================================================================
  // HANDLERS: AUTH & NAVIGATION
  // ============================================================================

  // Menghapus sesi pengguna dan mengarahkan kembali ke halaman login.
  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mengarahkan pengguna ke halaman yang dipilih dan menutup sidebar mobile.
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  // ============================================================================
  // HANDLERS: FILTER
  // ============================================================================

  const toggleFilter = () => {
    setShowFilter((previousValue) => !previousValue);
  };

  // Mengubah filter cabang dan menutup dropdown setelah cabang dipilih.
  const handleSelectFilter = (value) => {
    setSelectedFilter(value);
    setShowFilter(false);
  };

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Mengambil daftar nama cabang dari backend untuk pilihan filter dashboard.
  const fetchCabang = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cabang`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setCabangList(data.map((cabang) => cabang.nama));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Mengambil data statistik dan grafik berdasarkan filter cabang yang dipilih.
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/stats?sub_cabang=${selectedFilter}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data && data.totals) {
        setStats(data.totals);
      }

      if (data && data.chart) {
        setChartData(data.chart);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCabang();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, selectedFilter]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMenuItems = () => {
    return MENU_ITEMS.map((item) => (
      <div
        key={item.path}
        className={`menu-item ${item.active ? "active" : ""} ${
          item.hasArrow ? "has-arrow" : ""
        }`}
        onClick={() => handleNav(item.path)}
      >
        <div className="menu-left">
          <img src={item.icon} alt="" className="menu-icon-main" />
          <span className="menu-text-main">{item.text}</span>
        </div>

        {item.hasArrow && (
          <img src={iconBawah} alt="" className="arrow-icon-main" />
        )}
      </div>
    ));
  };

  const renderFilterDropdown = () => {
    if (!showFilter) {
      return null;
    }

    return (
      <div className="filter-dropdown">
        <div
          className="dropdown-item"
          onClick={() => handleSelectFilter("Semua Cabang")}
        >
          Semua Cabang
        </div>

        {cabangList.map((cabang) => (
          <div
            key={cabang}
            className="dropdown-item"
            onClick={() => handleSelectFilter(cabang)}
          >
            {cabang}
          </div>
        ))}
      </div>
    );
  };

  const renderStatsCards = () => {
    return statsCards.map((item) => (
      <div
        className="stat-card"
        key={item.label}
        style={{
          background: item.gradient,
          boxShadow: `0 8px 20px ${item.shadow}`,
        }}
      >
        <h1 className="stat-value">{item.value}</h1>
        <p className="stat-label">{item.label}</p>
      </div>
    ));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img
          src={logoPersegi}
          alt="AMAGACORP"
          className="mobile-topbar-logo"
        />

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

        <nav className="menu-nav">{renderMenuItems()}</nav>

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
            <button className="btn-filter-green" onClick={toggleFilter}>
              {selectedFilter}{" "}
              <img
                src={iconBawah}
                alt="v"
                className={showFilter ? "filter-arrow rotate" : "filter-arrow"}
              />
            </button>

            {renderFilterDropdown()}
          </div>
        </div>

        <div className="dashboard-chart-box">
          <div className="chart-container-inner">
            <Line data={dataGrafik} options={optionsGrafik} />
          </div>
        </div>

        <div className="stats-grid">{renderStatsCards()}</div>
      </main>
    </div>
  );
};

export default DashboardHRD;