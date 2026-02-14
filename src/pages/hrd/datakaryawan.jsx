import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./datakaryawan.css";

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";
import iconEdit from "../../assets/edit.svg";

const DataKaryawan = () => {
  const navigate = useNavigate();

  /* ================= DATA ================= */
  const [karyawanList] = useState([
    {
      id: 1,
      nama: "Syahrul",
      jabatan: "CEO",
      nik: "123456789",
      password: "***************",
      tempatLahir: "Semarang",
      tanggalLahir: "01 Januari 2026",
      alamat: "Semarang",
    },
    {
      id: 2,
      nama: "Budi",
      jabatan: "Staff",
      nik: "987654321",
      password: "***************",
      tempatLahir: "Jakarta",
      tanggalLahir: "12 Februari 1999",
      alamat: "Jakarta Selatan",
    },
    {
      id: 3,
      nama: "Siti",
      jabatan: "HRD",
      nik: "1122334455",
      password: "***************",
      tempatLahir: "Bandung",
      tanggalLahir: "10 Maret 2000",
      alamat: "Bandung Kota",
    },
  ]);

  /* ================= FILTER STATE ================= */
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Filter");

  /* ================= MODAL STATES ================= */
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailEmployee, setSelectedDetailEmployee] =
    useState(null);

  const [previewFile, setPreviewFile] = useState(null);

  /* ================= HANDLERS ================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleSelectCabang = (cabang) => {
    setSelectedCabang(cabang);
    setShowFilter(false);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleNameClick = (employee) => {
    setSelectedDetailEmployee(employee);
    setShowDetailModal(true);
  };

  const handleFileClick = (title) => {
    setPreviewFile({ title });
  };

  /* ================= JSX ================= */
  return (
    <div className="hrd-container">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          <div
            className="menu-item"
            onClick={() => navigate("/hrd/dashboard")}
          >
            <div className="menu-left">
              <img src={iconDashboard} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Dashboard</span>
            </div>
          </div>

          <div
            className="menu-item"
            onClick={() => navigate("/hrd/kelolacabang")}
          >
            <div className="menu-left">
              <img src={iconKelola} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Kelola Cabang</span>
            </div>
          </div>

          <div className="menu-item active">
            <div className="menu-left">
              <img src={iconKaryawan} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          <div
            className="menu-item has-arrow"
            onClick={() => navigate("/hrd/absenmanual")}
          >
            <div className="menu-left">
              <img src={iconKehadiran} alt="" className="menu-icon-main" />
              <span className="menu-text-main">Kehadiran</span>
            </div>
            <img src={iconBawah} alt="" className="arrow-icon-main" />
          </div>

          <div
            className="menu-item"
            onClick={() => navigate("/hrd/laporan")}
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

      {/* ================= MAIN ================= */}
      <main className="main-content">
        <div className="page-header">
          <h1>Data Karyawan</h1>
          <p>Informasi karyawan anda saat ini</p>
        </div>

        {/* ACTION BAR */}
        <div className="action-bar">
          <div className="filter-wrapper">
            <button className="btn-filter" onClick={toggleFilter}>
              {selectedCabang}
              <img
                src={iconBawah}
                alt=""
                className={`filter-arrow ${
                  showFilter ? "rotate" : ""
                }`}
              />
            </button>

            {showFilter && (
              <div className="filter-dropdown">
                {["Cabang 1", "Cabang 2", "Cabang 3", "Cabang 4", "Semua Cabang"].map(
                  (cabang, index) => (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={() =>
                        handleSelectCabang(
                          cabang === "Semua Cabang"
                            ? "Filter"
                            : cabang
                        )
                      }
                    >
                      {cabang}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <button className="btn-tambah" onClick={() => setShowAddModal(true)}>
            <img src={iconTambah} alt="" /> Tambah Karyawan
          </button>
        </div>

        {/* TABLE */}
        <div className="approval-section">
          <div className="approval-header">
            Permintaan Menunggu Approval
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Nik</th>
                <th>Password</th>
                <th>Tempat Lahir</th>
                <th>Tanggal Lahir</th>
                <th>Alamat</th>
                <th className="text-center">Edit</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {karyawanList.map((item) => (
                <tr key={item.id}>
                  <td
                    onClick={() => handleNameClick(item)}
                    style={{ cursor: "pointer", fontWeight: 600 }}
                  >
                    {item.nama}
                  </td>
                  <td>{item.jabatan}</td>
                  <td>{item.nik}</td>
                  <td>{item.password}</td>
                  <td>{item.tempatLahir}</td>
                  <td>{item.tanggalLahir}</td>
                  <td>{item.alamat}</td>

                  <td className="text-center">
                    <button
                      className="btn-edit-clean"
                      onClick={() => handleEditClick(item)}
                    >
                      <img
                        src={iconEdit}
                        alt=""
                        className="img-edit-gray"
                      />
                    </button>
                  </td>

                  <td className="text-center">
                    <div className="status-dots-spaced">
                      <span className="dot dot-green"></span>
                      <span className="dot dot-red"></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DataKaryawan;
