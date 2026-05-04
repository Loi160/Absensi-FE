import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
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
  Legend,
);

// ============================================================================
// KONSTANTA: MENU SIDEBAR
// ============================================================================

const MENU_ITEMS = [
  {
    path: "/managerCabang/dashboard",
    icon: iconDashboard,
    text: "Dashboard",
    active: true,
  },
  {
    path: "/managerCabang/datakaryawan",
    icon: iconKaryawan,
    text: "Data Karyawan",
  },
  {
    path: "/managerCabang/perizinan",
    icon: iconPerizinan,
    text: "Perizinan",
  },
  {
    path: "/managerCabang/laporan",
    icon: iconLaporan,
    text: "Laporan",
  },
];

// ============================================================================
// KONSTANTA: DATA DEFAULT
// ============================================================================

const DEFAULT_USER_DATA = {
  nama: "Manager",
  cabangUtama: "Memuat...",
  subCabang: [],
};

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

const CHART_LABELS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

// ============================================================================
// KONSTANTA: STYLE STATISTIK
// ============================================================================

const STAT_CARD_STYLES = {
  hadir: {
    label: "Hadir",
    gradient: "linear-gradient(135deg, #2fb800 0%, #1f8f3d 100%)",
    shadow: "rgba(47, 184, 0, 0.3)",
  },
  sakit: {
    label: "Sakit",
    gradient: "linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%)",
    shadow: "rgba(241, 196, 15, 0.3)",
  },
  izin: {
    label: "Izin",
    gradient: "linear-gradient(135deg, #2980b9 0%, #094b75 100%)",
    shadow: "rgba(41, 128, 185, 0.3)",
  },
  terlambat: {
    label: "Terlambat",
    gradient: "linear-gradient(135deg, #9b59b6 0%, #71368a 100%)",
    shadow: "rgba(155, 89, 182, 0.3)",
  },
  alpha: {
    label: "Alpha",
    gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
    shadow: "rgba(231, 76, 60, 0.3)",
  },
  cuti: {
    label: "Cuti",
    gradient: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)",
    shadow: "rgba(26, 188, 156, 0.3)",
  },
};

const STAT_CARD_ORDER = [
  "hadir",
  "sakit",
  "izin",
  "terlambat",
  "alpha",
  "cuti",
];

// ============================================================================
// KONSTANTA: KONFIGURASI GRAFIK
// ============================================================================

const chartOptions = {
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

const CHART_DATASET_CONFIGS = [
  {
    key: "hadir",
    label: "Hadir",
    color: "#2fb800",
  },
  {
    key: "sakit",
    label: "Sakit",
    color: "#f1c40f",
  },
  {
    key: "izin",
    label: "Izin",
    color: "#2980b9",
  },
  {
    key: "cuti",
    label: "Cuti",
    color: "#1abc9c",
  },
  {
    key: "terlambat",
    label: "Terlambat",
    color: "#9b59b6",
  },
  {
    key: "alpha",
    label: "Alpha",
    color: "#e74c3c",
  },
];

// ============================================================================
// KOMPONEN: DASHBOARD MANAGER CABANG
// ============================================================================

const DashboardManagerCabang = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua Cabang Saya");

  const [userData, setUserData] = useState(DEFAULT_USER_DATA);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);

  const hasSubCabang = userData.subCabang.length > 0;

  // Mengisi data user dari AuthContext ketika data login sudah tersedia.
  useEffect(() => {
    if (!user) {
      return;
    }

    setUserData({
      nama: user.nama,
      cabangUtama: user.cabangUtama,
      subCabang: user.subCabang || [],
    });
  }, [user]);

  // Mengambil statistik dashboard berdasarkan filter cabang yang dipilih.
  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/stats?sub_cabang=${selectedFilter}`,
          {
            headers: getAuthHeaders(),
          },
        );

        const data = await response.json();

        if (data.totals) {
          setStats(data.totals);
        }

        if (data.chart) {
          setChartData(data.chart);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboardStats();
  }, [user, selectedFilter]);

  // Membentuk data kartu statistik agar struktur rendering tetap ringkas.
  const statCards = useMemo(
    () =>
      STAT_CARD_ORDER.map((key) => ({
        key,
        label: STAT_CARD_STYLES[key].label,
        value: stats[key],
        gradient: STAT_CARD_STYLES[key].gradient,
        shadow: STAT_CARD_STYLES[key].shadow,
      })),
    [stats],
  );

  // Membentuk dataset grafik dari konfigurasi agar tidak terjadi pengulangan struktur.
  const graphData = useMemo(
    () => ({
      labels: CHART_LABELS,
      datasets: CHART_DATASET_CONFIGS.map((item) => ({
        label: item.label,
        data: chartData[item.key],
        borderColor: item.color,
        backgroundColor: item.color,
        tension: 0.3,
        pointRadius: 4,
      })),
    }),
    [chartData],
  );

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Menghapus sesi login dan mengarahkan pengguna ke halaman login.
  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  // Menutup sidebar mobile sebelum berpindah ke halaman yang dipilih.
  const handleNavigation = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  // Mengubah filter cabang lalu menutup dropdown filter.
  const handleFilterSelection = (filterValue) => {
    setSelectedFilter(filterValue);
    setIsFilterVisible(false);
  };

  const toggleFilterVisibility = () => {
    if (!hasSubCabang) {
      return;
    }

    setIsFilterVisible((currentValue) => !currentValue);
  };

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img
          src={logoPersegi}
          alt="AMAGACORP"
          className="mobile-topbar-logo"
        />

        <button
          type="button"
          className="btn-hamburger"
          onClick={openSidebar}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <button
          type="button"
          className="btn-sidebar-close"
          onClick={closeSidebar}
        >
          ✕
        </button>

        <div className="logo-area">
          <img
            src={logoPersegi}
            alt="AMAGACORP"
            className="logo-img"
          />
        </div>

        <nav className="menu-nav">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.path}
              className={`menu-item ${item.active ? "active" : ""}`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="menu-left">
                <img
                  src={item.icon}
                  alt=""
                  className="menu-icon-main"
                />

                <span className="menu-text-main">
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-header-area">
          <h1 className="dashboard-title">
            Dashboard Operasional - {userData.cabangUtama}
          </h1>

          <p className="dashboard-subtitle">
            Manajemen data kehadiran cabang {userData.cabangUtama}
          </p>
        </header>

        <div className="dashboard-filter-row">
          <div className="filter-wrapper">
            <button
              type="button"
              className="btn-filter-green"
              onClick={toggleFilterVisibility}
              style={{
                cursor: hasSubCabang ? "pointer" : "default",
                opacity: hasSubCabang ? 1 : 0.8,
              }}
            >
              {!hasSubCabang ? userData.cabangUtama : selectedFilter}

              {hasSubCabang && (
                <img
                  src={iconBawah}
                  alt="v"
                  className={
                    isFilterVisible
                      ? "filter-arrow rotate"
                      : "filter-arrow"
                  }
                />
              )}
            </button>

            {isFilterVisible && hasSubCabang && (
              <div className="filter-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => handleFilterSelection("Semua Sub-Cabang")}
                >
                  Semua Cabang Saya
                </div>

                <div
                  className="dropdown-item"
                  onClick={() => handleFilterSelection(userData.cabangUtama)}
                >
                  {userData.cabangUtama}
                </div>

                {userData.subCabang.map((subCabang) => (
                  <div
                    key={subCabang}
                    className="dropdown-item"
                    onClick={() => handleFilterSelection(subCabang)}
                  >
                    {subCabang}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-chart-box">
          <div className="chart-container-inner">
            <Line
              data={graphData}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((item) => (
            <div
              key={item.key}
              className="stat-card"
              style={{
                background: item.gradient,
                boxShadow: `0 8px 20px ${item.shadow}`,
              }}
            >
              <h1 className="stat-value">
                {item.value}
              </h1>

              <p className="stat-label">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardManagerCabang;