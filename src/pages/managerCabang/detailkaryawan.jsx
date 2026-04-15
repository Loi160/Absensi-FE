import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../hrd/datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const DetailKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;

  const [formData] = useState(employee || {});

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  if (!employee) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Inter" }}>
        <h2>Data Karyawan Tidak Ditemukan</h2>
        <p>Silakan kembali ke halaman Data Karyawan.</p>
        <button
          onClick={() => navigate(`/managerCabang/datakaryawan`)}
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
        <button
          className="btn-hamburger"
          onClick={openSidebar}
          aria-label="Buka menu"
        >
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
        <button
          className="btn-sidebar-close"
          onClick={closeSidebar}
          aria-label="Tutup menu"
        >
          ✕
        </button>
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div
            className="menu-item"
            onClick={() => handleNav("/managerCabang/dashboard")}
          >
            <div className="menu-left">
              <img src={iconDashboard} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          <div
            className="menu-item active"
            onClick={() => handleNav("/managerCabang/datakaryawan")}
          >
            <div className="menu-left">
              <img src={iconKaryawan} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNav("/managerCabang/perizinan")}
          >
            <div className="menu-left">
              <img src={iconPerizinan} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Perizinan</span>
            </div>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNav("/managerCabang/laporan")}
          >
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
        <header className="dk-header-area">
          <div className="dk-title-group">
            <h1 className="dk-title">Detail Karyawan</h1>
            <p className="dk-subtitle">Informasi profil {formData.nama}</p>
          </div>
        </header>

        <form>
          <div className="detail-form-grid" style={{ marginTop: "20px" }}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                name="nama"
                type="text"
                className="input-read"
                readOnly
                value={formData.nama}
              />
            </div>
            
            {/* NIK HANYA DITAMPILKAN KARENA INI READ-ONLY */}
            <div className="form-group">
              <label>NIK (Username)</label>
              <input
                name="nik"
                type="text"
                className="input-read"
                readOnly
                value={formData.nik}
              />
            </div>
            
            <div className="form-group">
              <label>Cabang Penempatan</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={formData.cabang?.nama || "-"}
              />
            </div>
            <div className="form-group">
              <label>Jabatan</label>
              <input
                name="jabatan"
                type="text"
                className="input-read"
                readOnly
                value={formData.jabatan || ""}
              />
            </div>
            <div className="form-group">
              <label>Tanggal Masuk</label>
              <input
                name="tanggal_masuk"
                type="text"
                className="input-read"
                readOnly
                value={formData.tanggal_masuk || ""}
              />
            </div>
            <div className="form-group">
              <label>Divisi</label>
              <input
                name="divisi"
                type="text"
                className="input-read"
                readOnly
                value={formData.divisi || ""}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="pwd-wrapper">
                <input
                  type="text"
                  className="input-read"
                  readOnly
                  value="(Disembunyikan, Hubungi HRD)"
                  style={{ color: "#888", fontStyle: "italic" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tempat Lahir</label>
              <input
                name="tempat_lahir"
                type="text"
                className="input-read"
                readOnly
                value={formData.tempat_lahir || ""}
              />
            </div>
            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input
                name="tanggal_lahir"
                type="text"
                className="input-read"
                readOnly
                value={formData.tanggal_lahir || ""}
              />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={formData.jenis_kelamin || "-"}
              />
            </div>

            <div className="form-group">
              <label>Status Karyawan</label>
              <input
                type="text"
                className="input-read"
                readOnly
                value={formData.status || "Aktif"}
                style={{
                  color:
                    formData.status === "Nonaktif" ||
                    formData.status === "Resign"
                      ? "#e74c3c"
                      : "#2fb800",
                  fontWeight: "700",
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Alamat</label>
              <input
                name="alamat"
                type="text"
                className="input-read"
                readOnly
                value={formData.alamat || ""}
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
                      padding: "12px",
                    }}
                  >
                    {formData[doc.dbKey] ? (
                      <a
                        href={formData[doc.dbKey]}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#2980b9",
                          fontWeight: "bold",
                          textDecoration: "none",
                        }}
                      >
                        Lihat Dokumen
                      </a>
                    ) : (
                      <span style={{ color: "#aaa", fontStyle: "italic" }}>
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