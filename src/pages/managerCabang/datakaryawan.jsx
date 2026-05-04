import React, { useState, useEffect } from "react";
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

const MENU_ITEMS = [
  { path: "/managerCabang/dashboard", icon: iconDashboard, text: "Dashboard" },
  {
    path: "/managerCabang/datakaryawan",
    icon: iconKaryawan,
    text: "Data Karyawan",
    active: true,
  },
  { path: "/managerCabang/perizinan", icon: iconPerizinan, text: "Perizinan" },
  { path: "/managerCabang/laporan", icon: iconLaporan, text: "Laporan" },
];

const getRoleLabel = (role) => {
  if (role === "hrd") return "HRD";
  if (role === "managerCabang") return "Manager Cabang";
  return "Karyawan";
};

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

const DataKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [karyawanList, setKaryawanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang Saya");
  const [showFilter, setShowFilter] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleRowClick = (karyawan) => {
    navigate("/managerCabang/detailkaryawan", {
      state: { employee: karyawan },
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const resCabang = await fetch(
        import.meta.env.VITE_API_URL + "/api/cabang",
        {
          headers: getAuthHeaders(),
        }
      );

      if (resCabang.status === 401 || resCabang.status === 403) {
        logout();
        navigate("/auth/login");
        return;
      }

      const dataCabang = await resCabang.json();

      if (!resCabang.ok) {
        throw new Error(dataCabang.message || "Gagal mengambil data cabang");
      }

      const resKaryawan = await fetch(
        import.meta.env.VITE_API_URL + "/api/karyawan",
        {
          headers: getAuthHeaders(),
        }
      );

      if (resKaryawan.status === 401 || resKaryawan.status === 403) {
        logout();
        navigate("/auth/login");
        return;
      }

      const dataKaryawan = await resKaryawan.json();

      if (!resKaryawan.ok) {
        throw new Error(
          dataKaryawan.message || "Gagal mengambil data karyawan"
        );
      }

      setCabangList(Array.isArray(dataCabang) ? dataCabang : []);
      setKaryawanList(Array.isArray(dataKaryawan) ? dataKaryawan : []);
    } catch (err) {
      console.error("Error fetching manager data:", err);
      alert(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = karyawanList.filter((k) => {
    if (selectedCabang === "Semua Cabang Saya") return true;
    return k.cabang?.nama === selectedCabang;
  });

  const titleCabang = user?.cabangUtama || "Cabang Saya";

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
          <h1 className="dk-title">Data Karyawan - {titleCabang}</h1>
          <p className="dk-subtitle">
            Daftar informasi karyawan cabang utama dan sub-cabang Anda
          </p>
        </header>

        <div className="dk-action-row">
          <div className="dk-action-group">
            <div className="filter-wrapper">
              <button
                className="btn-dk-filter"
                onClick={() => setShowFilter(!showFilter)}
              >
                {selectedCabang}
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
              </button>

              {showFilter && (
                <div className="filter-dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCabang("Semua Cabang Saya");
                      setShowFilter(false);
                    }}
                  >
                    Semua Cabang Saya
                  </div>

                  {cabangList.map((c) => (
                    <div
                      key={c.id}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedCabang(c.nama);
                        setShowFilter(false);
                      }}
                    >
                      {c.nama}
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
                {loading ? (
                  <tr>
                    <td
                      colSpan="10"
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
                      colSpan="10"
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
                        <td>{k.roleLabel || getRoleLabel(k.role)}</td>
                        <td>{k.nik}</td>
                        <td>
                          <div className="dk-pwd-mask">
                            <span>........</span> <EyeOffIcon />
                          </div>
                        </td>
                        <td>{k.cabang?.nama || "-"}</td>
                        <td>{k.tempat_lahir || "-"}</td>
                        <td>{k.tanggal_lahir || "-"}</td>
                        <td>{k.alamat || "-"}</td>
                        <td className="text-center">
                          <span
                            className={`status-dot ${
                              isActive ? "active" : "inactive"
                            }`}
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