import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";

const MENU_ITEMS = [
  { path: "/hrd/dashboard", icon: iconDashboard, text: "Dashboard" },
  { path: "/hrd/kelolacabang", icon: iconKelola, text: "Kelola Cabang" },
  { path: "/hrd/datakaryawan", icon: iconKaryawan, text: "Data Karyawan", active: true },
  { path: "/hrd/kehadiran", icon: iconKehadiran, text: "Kehadiran", hasArrow: true },
  { path: "/hrd/laporan", icon: iconLaporan, text: "Laporan" },
];

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

const DataKaryawanHRD = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const [karyawanList, setKaryawanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang");
  const [showFilter, setShowFilter] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    password: "",
    role: "karyawan",
    cabang_id: "",
    jabatan: "",
    divisi: "",
    no_telp: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const resCabang = await fetch(import.meta.env.VITE_API_URL + "/api/cabang");
      setCabangList(await resCabang.json());

      const resKaryawan = await fetch(import.meta.env.VITE_API_URL + "/api/karyawan");
      setKaryawanList(await resKaryawan.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleRowClick = (karyawan) => {
    navigate("/hrd/detailkaryawan", { state: { employee: karyawan } });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cabang_id) return alert("Pilih cabang terlebih dahulu!");
    
    if (!/^\d{8}$/.test(formData.nik)) {
        return alert("NIK harus berupa angka tepat 8 digit!");
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/karyawan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Karyawan berhasil ditambahkan!");
        setShowModal(false);
        fetchData();
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      alert("Kesalahan jaringan.");
    }
  };

  const filteredData = karyawanList.filter((k) => {
    return selectedCabang === "Semua Cabang" || k.cabang?.nama === selectedCabang;
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
              className={`menu-item ${item.active ? "active" : ""} ${item.hasArrow ? "has-arrow" : ""}`}
              onClick={() => handleNav(item.path)}
            >
              <div className="menu-left">
                <img src={item.icon} alt="" className="menu-icon-main" />
                <span className="menu-text-main">{item.text}</span>
              </div>
              {item.hasArrow && <img src={iconBawah} alt="down" className="arrow-icon-main" />}
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
          <h1 className="dk-title">Data Karyawan</h1>
          <p className="dk-subtitle">
            Daftar pusat informasi dan detail administrasi karyawan
          </p>
        </header>

        <div className="dk-action-row">
          <div className="dk-action-group">
            <div className="filter-wrapper">
              <button
                className="btn-dk-filter"
                onClick={() => setShowFilter(!showFilter)}
              >
                {selectedCabang}{" "}
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
                      setSelectedCabang("Semua Cabang");
                      setShowFilter(false);
                    }}
                  >
                    Semua Cabang
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
            <button
              className="btn-dk-tambah"
              onClick={() => setShowModal(true)}
            >
              <img src={iconTambah} alt="+" /> Tambah Karyawan
            </button>
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
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
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
                          <span className={`status-dot ${isActive ? "active" : "inactive"}`}></span>
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

      {showModal && (
        <div className="modal-overlay-clean" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Tambah Karyawan Baru</h2>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    className="input-edit"
                    required
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>NIK (Username)</label>
                  <input
                    type="text"
                    className="input-edit"
                    placeholder="Wajib 8 Digit Angka"
                    required
                    pattern="\d{8}"
                    maxLength="8"
                    minLength="8"
                    title="NIK harus berisi 8 digit angka."
                    onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, nik: e.target.value });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Password Login</label>
                  <input
                    type="text"
                    className="input-edit"
                    required
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role Akses</label>
                  <select
                    className="input-edit"
                    required
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="karyawan">Karyawan Biasa</option>
                    <option value="managerCabang">Manager Cabang</option>
                    <option value="hrd">HRD (Super Admin)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Penempatan Cabang</label>
                  <select
                    className="input-edit"
                    required
                    onChange={(e) => setFormData({ ...formData, cabang_id: e.target.value })}
                  >
                    <option value="">Pilih Cabang...</option>
                    {cabangList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>No. Telepon / WA</label>
                  <input
                    type="text"
                    className="input-edit"
                    onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Jabatan</label>
                  <input
                    type="text"
                    className="input-edit"
                    placeholder="Misal: Staff IT"
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Divisi</label>
                  <input
                    type="text"
                    className="input-edit"
                    placeholder="Misal: Technology"
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                  />
                </div>
              </div>

              <div className="detail-footer" style={{ marginTop: "20px", paddingBottom: "0" }}>
                <button
                  type="button"
                  className="btn-batal"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-simpan">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKaryawanHRD;