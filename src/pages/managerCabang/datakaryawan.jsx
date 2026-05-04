import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
import "../hrd/datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

// ============================================================================
// KONSTANTA: MENU SIDEBAR
// ============================================================================

const MENU_ITEMS = [
  {
    path: "/managerCabang/dashboard",
    icon: iconDashboard,
    text: "Dashboard",
  },
  {
    path: "/managerCabang/datakaryawan",
    icon: iconKaryawan,
    text: "Data Karyawan",
    active: true,
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
// KONSTANTA: FILTER DAN TABEL
// ============================================================================

const ALL_BRANCH_FILTER = "Semua Cabang Saya";

const TABLE_EMPTY_STATE_STYLE = {
  textAlign: "center",
  padding: "30px",
  color: "#666",
};

const FILTER_ARROW_STYLE = {
  width: "10px",
  filter: "brightness(0) invert(1)",
  transition: "0.2s",
};

// ============================================================================
// HELPER: FORMAT DATA
// ============================================================================

// Mengubah nilai role dari API menjadi label yang mudah dibaca pengguna.
const getRoleLabel = (role) => {
  const roleLabels = {
    hrd: "HRD",
    managerCabang: "Manager Cabang",
  };

  return roleLabels[role] || "Karyawan";
};

// ============================================================================
// KOMPONEN: ICON
// ============================================================================

const EyeOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line
      x1="1"
      y1="1"
      x2="23"
      y2="23"
    ></line>
  </svg>
);

// ============================================================================
// KOMPONEN: DATA KARYAWAN MANAGER CABANG
// ============================================================================

const DataKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [karyawanList, setKaryawanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState(ALL_BRANCH_FILTER);

  const titleCabang = user?.cabangUtama || "Cabang Saya";

  // Menyaring data karyawan berdasarkan cabang yang dipilih pengguna.
  const filteredKaryawanList = useMemo(() => {
    if (selectedCabang === ALL_BRANCH_FILTER) {
      return karyawanList;
    }

    return karyawanList.filter(
      (karyawan) => karyawan.cabang?.nama === selectedCabang,
    );
  }, [karyawanList, selectedCabang]);

  // Mengambil data cabang dan karyawan yang dapat diakses oleh manager cabang.
  const fetchManagerData = async () => {
    try {
      setIsLoading(true);

      const cabangResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cabang`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (cabangResponse.status === 401 || cabangResponse.status === 403) {
        logout();
        navigate("/auth/login");
        return;
      }

      const cabangData = await cabangResponse.json();

      if (!cabangResponse.ok) {
        throw new Error(cabangData.message || "Gagal mengambil data cabang");
      }

      const karyawanResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/karyawan`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (
        karyawanResponse.status === 401 ||
        karyawanResponse.status === 403
      ) {
        logout();
        navigate("/auth/login");
        return;
      }

      const karyawanData = await karyawanResponse.json();

      if (!karyawanResponse.ok) {
        throw new Error(
          karyawanData.message || "Gagal mengambil data karyawan",
        );
      }

      setCabangList(Array.isArray(cabangData) ? cabangData : []);
      setKaryawanList(Array.isArray(karyawanData) ? karyawanData : []);
    } catch (error) {
      console.error("Error fetching manager data:", error);
      alert(error.message || "Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

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
    closeSidebar();
    navigate(path);
  };

  // Mengarahkan pengguna ke halaman detail karyawan dengan membawa data baris terpilih.
  const handleRowClick = (karyawan) => {
    navigate("/managerCabang/detailkaryawan", {
      state: {
        employee: karyawan,
      },
    });
  };

  // Mengubah filter cabang lalu menutup dropdown filter.
  const handleCabangSelection = (cabangName) => {
    setSelectedCabang(cabangName);
    setIsFilterVisible(false);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible((currentValue) => !currentValue);
  };

  const renderEmptyTableRow = (message) => (
    <tr>
      <td
        colSpan="10"
        style={TABLE_EMPTY_STATE_STYLE}
      >
        {message}
      </td>
    </tr>
  );

  const renderKaryawanRows = () =>
    filteredKaryawanList.map((karyawan) => {
      const isActive = karyawan.status === "Aktif" || !karyawan.status;

      return (
        <tr
          key={karyawan.id}
          onClick={() => handleRowClick(karyawan)}
        >
          <td className="dk-td-name">
            {karyawan.nama}
          </td>

          <td>
            {karyawan.jabatan || "-"}
          </td>

          <td>
            {karyawan.roleLabel || getRoleLabel(karyawan.role)}
          </td>

          <td>
            {karyawan.nik}
          </td>

          <td>
            <div className="dk-pwd-mask">
              <span>
                ........
              </span>

              <EyeOffIcon />
            </div>
          </td>

          <td>
            {karyawan.cabang?.nama || "-"}
          </td>

          <td>
            {karyawan.tempat_lahir || "-"}
          </td>

          <td>
            {karyawan.tanggal_lahir || "-"}
          </td>

          <td>
            {karyawan.alamat || "-"}
          </td>

          <td className="text-center">
            <span
              className={`status-dot ${
                isActive ? "active" : "inactive"
              }`}
            ></span>
          </td>
        </tr>
      );
    });

  const renderTableContent = () => {
    if (isLoading) {
      return renderEmptyTableRow("Memuat data...");
    }

    if (filteredKaryawanList.length === 0) {
      return renderEmptyTableRow("Tidak ada karyawan.");
    }

    return renderKaryawanRows();
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
        <header className="dk-header-area">
          <h1 className="dk-title">
            Data Karyawan - {titleCabang}
          </h1>

          <p className="dk-subtitle">
            Daftar informasi karyawan cabang utama dan sub-cabang Anda
          </p>
        </header>

        <div className="dk-action-row">
          <div className="dk-action-group">
            <div className="filter-wrapper">
              <button
                type="button"
                className="btn-dk-filter"
                onClick={toggleFilterVisibility}
              >
                {selectedCabang}

                <img
                  src={iconBawah}
                  alt="v"
                  style={{
                    ...FILTER_ARROW_STYLE,
                    transform: isFilterVisible ? "rotate(180deg)" : "none",
                  }}
                />
              </button>

              {isFilterVisible && (
                <div className="filter-dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => handleCabangSelection(ALL_BRANCH_FILTER)}
                  >
                    Semua Cabang Saya
                  </div>

                  {cabangList.map((cabang) => (
                    <div
                      key={cabang.id}
                      className="dropdown-item"
                      onClick={() => handleCabangSelection(cabang.nama)}
                    >
                      {cabang.nama}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dk-table-container">
          <div className="dk-table-header-title">
            Daftar Karyawan
          </div>

          <div className="dk-table-wrapper">
            <table className="dk-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Hak Akses</th>
                  <th>NIK (Username)</th>
                  <th>Password</th>
                  <th>Cabang</th>
                  <th>Tempat Lahir</th>
                  <th>Tanggal Lahir</th>
                  <th>Alamat</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {renderTableContent()}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataKaryawanManagerCabang;