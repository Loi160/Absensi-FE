import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../hrd/datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
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
    width="20"
    height="20"
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

const DetailKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const employee = location.state?.employee;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword] = useState(false);

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

  if (!employee) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Inter" }}>
        <h2>Data Karyawan Tidak Ditemukan</h2>
        <p>Silakan kembali ke halaman Data Karyawan.</p>
        <button
          onClick={() => navigate("/managerCabang/datakaryawan")}
          className="btn-batal"
          style={{ marginTop: "20px" }}
        >
          Kembali
        </button>
      </div>
    );
  }

  const dokumenList = [
    { label: "Foto Profil Karyawan", dbKey: "foto_karyawan" },
    { label: "Kartu Tanda Penduduk (KTP)", dbKey: "ktp" },
    { label: "Kartu Keluarga (KK)", dbKey: "kk" },
    { label: "SKCK", dbKey: "skck" },
    { label: "Surat Izin Mengemudi (SIM)", dbKey: "sim" },
    { label: "Sertifikat Pendukung", dbKey: "sertifikat" },
    { label: "Dokumen Tambahan", dbKey: "dokumen_tambahan" },
  ];

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
          <div className="dk-title-group">
            <h1 className="dk-title">Detail Karyawan</h1>
            <p className="dk-subtitle">
              Informasi profil {employee.nama || "karyawan"} - View Only
            </p>
          </div>
        </header>

        <form>
          <div className="detail-form-grid">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.nama || ""}
              />
            </div>

            <div className="form-group">
              <label>NIK (Username)</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.nik || ""}
              />
            </div>

            <div className="form-group">
              <label>Cabang Penempatan</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.cabang?.nama || "-"}
              />
            </div>

            <div className="form-group">
              <label>Jabatan</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.jabatan || ""}
              />
            </div>

            <div className="form-group">
              <label>Tanggal Masuk</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.tanggal_masuk || ""}
              />
            </div>

            <div className="form-group">
              <label>Divisi</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.divisi || ""}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="pwd-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-read"
                  readOnly
                  value="********"
                />
                <button type="button" className="btn-eye">
                  <EyeOffIcon />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Tempat Lahir</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.tempat_lahir || ""}
              />
            </div>

            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.tanggal_lahir || ""}
              />
            </div>

            <div className="form-group">
              <label>Jenis Kelamin</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.jenis_kelamin || "-"}
              />
            </div>

            <div className="form-group">
              <label>Status Karyawan</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.status || "Aktif"}
                style={{
                  color:
                    employee.status === "Nonaktif" ? "#e74c3c" : "#2fb800",
                  fontWeight: "700",
                }}
              />
            </div>

            <div className="form-group">
              <label>Hak Akses</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.roleLabel || getRoleLabel(employee.role)}
                style={{
                  fontWeight: "700",
                  color:
                    employee.role === "hrd"
                      ? "#c92a2a"
                      : employee.role === "managerCabang"
                        ? "#1565c0"
                        : "#2fb800",
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Alamat</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.alamat || ""}
              />
            </div>
          </div>

          <div className="docs-section">
            <h4 className="docs-title">Dokumen Pendukung</h4>

            <div className="docs-grid">
              {dokumenList.map((doc, idx) => (
                <div key={idx} className="doc-box">
                  <span className="doc-label">{doc.label}</span>

                  <div
                    className="doc-card"
                    style={{
                      backgroundColor: "#f9f9f9",
                      border: "1px solid #ddd",
                    }}
                  >
                    {employee[doc.dbKey] ? (
                      <a
                        href={employee[doc.dbKey]}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        Lihat Dokumen
                      </a>
                    ) : (
                      <span className="doc-empty-text">
                        Belum ada dokumen
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-footer">
            <button
              type="button"
              className="btn-batal"
              onClick={() => navigate(-1)}
            >
              Kembali
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DetailKaryawanManagerCabang;