import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../hrd/datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
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
// KONSTANTA: DOKUMEN KARYAWAN
// ============================================================================

const DOCUMENT_ITEMS = [
  {
    label: "Foto Profil Karyawan",
    dbKey: "foto_karyawan",
  },
  {
    label: "Kartu Tanda Penduduk (KTP)",
    dbKey: "ktp",
  },
  {
    label: "Kartu Keluarga (KK)",
    dbKey: "kk",
  },
  {
    label: "SKCK",
    dbKey: "skck",
  },
  {
    label: "Surat Izin Mengemudi (SIM)",
    dbKey: "sim",
  },
  {
    label: "Sertifikat Pendukung",
    dbKey: "sertifikat",
  },
  {
    label: "Dokumen Tambahan",
    dbKey: "dokumen_tambahan",
  },
];

// ============================================================================
// KONSTANTA: STYLE INLINE
// ============================================================================

const EMPTY_EMPLOYEE_PAGE_STYLE = {
  padding: 40,
  textAlign: "center",
  fontFamily: "Inter",
};

const BACK_BUTTON_STYLE = {
  marginTop: "20px",
};

const FULL_WIDTH_FIELD_STYLE = {
  gridColumn: "1 / -1",
};

const DOCUMENT_CARD_STYLE = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #ddd",
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

// Menentukan warna status karyawan pada field status.
const getStatusTextColor = (status) => {
  return status === "Nonaktif" ? "#e74c3c" : "#2fb800";
};

// Menentukan warna hak akses berdasarkan role karyawan.
const getRoleTextColor = (role) => {
  if (role === "hrd") {
    return "#c92a2a";
  }

  if (role === "managerCabang") {
    return "#1565c0";
  }

  return "#2fb800";
};

// ============================================================================
// KOMPONEN: ICON
// ============================================================================

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
    <line
      x1="1"
      y1="1"
      x2="23"
      y2="23"
    ></line>
  </svg>
);

// ============================================================================
// KOMPONEN: DETAIL KARYAWAN MANAGER CABANG
// ============================================================================

const DetailKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const employee = location.state?.employee;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPassword] = useState(false);

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

  const handleBackToEmployeeList = () => {
    navigate("/managerCabang/datakaryawan");
  };

  const handleBackToPreviousPage = () => {
    navigate(-1);
  };

  const renderReadOnlyInput = ({
    label,
    value,
    type = "text",
    style,
  }) => (
    <div className="form-group">
      <label>
        {label}
      </label>

      <input
        type={type}
        className="input-read"
        readOnly
        value={value}
        style={style}
      />
    </div>
  );

  // Menampilkan pesan fallback jika halaman detail dibuka tanpa data karyawan.
  if (!employee) {
    return (
      <div style={EMPTY_EMPLOYEE_PAGE_STYLE}>
        <h2>
          Data Karyawan Tidak Ditemukan
        </h2>

        <p>
          Silakan kembali ke halaman Data Karyawan.
        </p>

        <button
          type="button"
          onClick={handleBackToEmployeeList}
          className="btn-batal"
          style={BACK_BUTTON_STYLE}
        >
          Kembali
        </button>
      </div>
    );
  }

  const statusInputStyle = {
    color: getStatusTextColor(employee.status),
    fontWeight: "700",
  };

  const roleInputStyle = {
    fontWeight: "700",
    color: getRoleTextColor(employee.role),
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
          <div className="dk-title-group">
            <h1 className="dk-title">
              Detail Karyawan
            </h1>

            <p className="dk-subtitle">
              Informasi profil {employee.nama || "karyawan"} - View Only
            </p>
          </div>
        </header>

        <form>
          <div className="detail-form-grid">
            {renderReadOnlyInput({
              label: "Nama Lengkap",
              value: employee.nama || "",
            })}

            {renderReadOnlyInput({
              label: "NIK (Username)",
              value: employee.nik || "",
            })}

            {renderReadOnlyInput({
              label: "Cabang Penempatan",
              value: employee.cabang?.nama || "-",
            })}

            {renderReadOnlyInput({
              label: "Jabatan",
              value: employee.jabatan || "",
            })}

            {renderReadOnlyInput({
              label: "Tanggal Masuk",
              value: employee.tanggal_masuk || "",
            })}

            {renderReadOnlyInput({
              label: "Divisi",
              value: employee.divisi || "",
            })}

            <div className="form-group">
              <label>
                Password
              </label>

              <div className="pwd-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-read"
                  readOnly
                  value="********"
                />

                <button
                  type="button"
                  className="btn-eye"
                >
                  <EyeOffIcon />
                </button>
              </div>
            </div>

            {renderReadOnlyInput({
              label: "Tempat Lahir",
              value: employee.tempat_lahir || "",
            })}

            {renderReadOnlyInput({
              label: "Tanggal Lahir",
              value: employee.tanggal_lahir || "",
            })}

            {renderReadOnlyInput({
              label: "Jenis Kelamin",
              value: employee.jenis_kelamin || "-",
            })}

            {renderReadOnlyInput({
              label: "Status Karyawan",
              value: employee.status || "Aktif",
              style: statusInputStyle,
            })}

            {renderReadOnlyInput({
              label: "Hak Akses",
              value: employee.roleLabel || getRoleLabel(employee.role),
              style: roleInputStyle,
            })}

            <div
              className="form-group"
              style={FULL_WIDTH_FIELD_STYLE}
            >
              <label>
                Alamat
              </label>

              <input
                type="text"
                className="input-read"
                readOnly
                value={employee.alamat || ""}
              />
            </div>
          </div>

          <div className="docs-section">
            <h4 className="docs-title">
              Dokumen Pendukung
            </h4>

            <div className="docs-grid">
              {DOCUMENT_ITEMS.map((documentItem) => (
                <div
                  key={documentItem.dbKey}
                  className="doc-box"
                >
                  <span className="doc-label">
                    {documentItem.label}
                  </span>

                  <div
                    className="doc-card"
                    style={DOCUMENT_CARD_STYLE}
                  >
                    {employee[documentItem.dbKey] ? (
                      <a
                        href={employee[documentItem.dbKey]}
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
              onClick={handleBackToPreviousPage}
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