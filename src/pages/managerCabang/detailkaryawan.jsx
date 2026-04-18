import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../hrd/datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

/* Menyimpan daftar menu yang ditampilkan pada sidebar */
const MENU_ITEMS = [
  { path: "/managerCabang/dashboard", icon: iconDashboard, text: "Dashboard" },
  { path: "/managerCabang/datakaryawan", icon: iconKaryawan, text: "Data Karyawan", active: true },
  { path: "/managerCabang/perizinan", icon: iconPerizinan, text: "Perizinan" },
  { path: "/managerCabang/laporan", icon: iconLaporan, text: "Laporan" },
];

/* Menampilkan icon mata tertutup */
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
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

/* Komponen utama halaman data karyawan manager cabang */
const DataKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Membuka sidebar */
  const openSidebar = () => setSidebarOpen(true);

  /* Menutup sidebar */
  const closeSidebar = () => setSidebarOpen(false);

  const [userData, setUserData] = useState({
    nama: "Manager",
    cabangUtama: "Memuat...",
    subCabang: [],
  });
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Sub-Cabang");

  /* Mengambil data user dan data karyawan sesuai cabang manager */
  useEffect(() => {
    if (user) {
      setUserData({
        nama: user.nama,
        cabangUtama: user.cabangUtama,
        subCabang: user.subCabang || [],
      });

      const fetchAllData = async () => {
        try {
          setLoading(true);
          const res = await fetch(import.meta.env.VITE_API_URL + "/api/karyawan");
          const data = await res.json();
          
          const allMyBranches = [user.cabangUtama, ...(user.subCabang || [])];
          const filteredByBranch = data.filter((k) =>
            allMyBranches.includes(k.cabang?.nama),
          );
          setKaryawanList(filteredByBranch);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    }
  }, [user]);

  /* Mengecek apakah manager memiliki sub cabang */
  const hasSubCabang = userData.subCabang.length > 0;

  /* Menghapus data login dan mengarahkan user ke halaman login */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  /* Mengarahkan user ke halaman sesuai menu yang dipilih */
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  /* Mengarahkan user ke halaman detail karyawan yang dipilih */
  const handleRowClick = (karyawan) => {
    navigate("/managerCabang/detailkaryawan", {
      state: { employee: karyawan },
    });
  };

  /* Menyaring data karyawan berdasarkan sub cabang yang dipilih */
  const filteredData = karyawanList.filter((k) => {
    if (!hasSubCabang) return true;
    if (selectedCabang === "Semua Sub-Cabang") return true;
    return k.cabang?.nama === selectedCabang;
  });

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
          {MENU_ITEMS.map((item, index) => (
            <div
              key={index}
              className={`menu-item ${item.active ? "active" : ""}`}
              onClick={() => handleNav(item.path)}
            >
              <div className="menu-left">
                <img src={item.icon} alt="" className="menu-icon-main" />
                <span className="menu-text-main">{item.text}</span>
              </div>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="dk-header-area">
          <h1 className="dk-title">Data Karyawan - {userData.cabangUtama}</h1>
          <p className="dk-subtitle">
            Daftar pusat informasi dan detail administrasi karyawan (Read-Only)
          </p>
        </header>

        <div className="dk-action-row">
          <div className="dk-action-group">
            <div className="filter-wrapper">
              <button
                className="btn-dk-filter"
                onClick={() => {
                  if (hasSubCabang) setShowFilter(!showFilter);
                }}
                style={{
                  cursor: hasSubCabang ? "pointer" : "default",
                  opacity: hasSubCabang ? 1 : 0.8,
                }}
              >
                {!hasSubCabang ? userData.cabangUtama : selectedCabang}
                {hasSubCabang && (
                  <img
                    src={iconBawah}
                    alt="v"
                    style={{
                      width: "10px",
                      filter: "brightness(0) invert(1)",
                      transform: showFilter ? "rotate(180deg)" : "none",
                      transition: "0.2s",
                    }}
                  />
                )}
              </button>
              {showFilter && hasSubCabang && (
                <div className="filter-dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCabang("Semua Sub-Cabang");
                      setShowFilter(false);
                    }}
                  >
                    Semua Sub-Cabang
                  </div>
                  {userData.subCabang.map((c, idx) => (
                    <div
                      key={idx}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedCabang(c);
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
        </div>

        <div className="dk-table-container">
          <div className="dk-table-header-title">Daftar Karyawan</div>
          <div className="dk-table-wrapper">
            <table className="dk-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>NIK (Username)</th>
                  <th>Password</th>
                  <th>Tempat Lahir</th>
                  <th>Tanggal Lahir</th>
                  <th>Alamat</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#666",
                      }}
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#666",
                      }}
                    >
                      Tidak ada karyawan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((k) => {
                    const isActive = k.status === "Aktif" || !k.status;
                    return (
                      <tr key={k.id} onClick={() => handleRowClick(k)}>
                        <td className="dk-td-name">{k.nama}</td>
                        <td>{k.jabatan || "-"}</td>
                        <td>{k.nik}</td>
                        <td>
                          <div className="dk-pwd-mask">
                            <span>........</span> <EyeOffIcon />
                          </div>
                        </td>
                        <td>{k.tempat_lahir || "-"}</td>
                        <td>{k.tanggal_lahir || "-"}</td>
                        <td>{k.alamat || "-"}</td>
                        <td className="text-center">
                          <span
                            className={`status-dot ${isActive ? "active" : "inactive"}`}
                          ></span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataKaryawanManagerCabang;