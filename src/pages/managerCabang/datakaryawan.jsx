import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Gunakan CSS milik HRD atau buat file datakaryawan.css di folder managerCabang
import "./datakaryawan.css"; 

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const DataKaryawanManager = () => {
  const navigate = useNavigate();

  /* ================= DATA DUMMY ================= */
  const [karyawanList] = useState([
    {
      id: 1,
      nama: "Syahrul",
      jabatan: "CEO",
      nik: "123456789",
      password: "123",
      tempatLahir: "Semarang",
      tanggalLahir: "01 Januari 2026",
      alamat: "Semarang",
      divisi: "Operasional",
      tanggalMasuk: "01/01/2023",
      jenisKelamin: "Laki-laki",
      cabang: "1"
    },
    {
      id: 2,
      nama: "Budi",
      jabatan: "Staff",
      nik: "987654321",
      password: "123",
      tempatLahir: "Jakarta",
      tanggalLahir: "12 Februari 1999",
      alamat: "Jakarta Selatan",
      divisi: "Marketing",
      tanggalMasuk: "15/03/2023",
      jenisKelamin: "Laki-laki",
      cabang: "2"
    },
    {
      id: 3,
      nama: "Siti",
      jabatan: "HRD",
      nik: "1122334455",
      password: "123",
      tempatLahir: "Bandung",
      tanggalLahir: "10 Maret 2000",
      alamat: "Bandung Kota",
      divisi: "HR",
      tanggalMasuk: "20/05/2023",
      jenisKelamin: "Perempuan",
      cabang: "3"
    },
  ]);

  /* ================= HANDLERS ================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleNameClick = (employee) => {
    navigate("/managerCabang/detail-karyawan", { state: { employee: employee } });
  };

  /* ================= COMPONENTS ================= */
  const renderTable = () => (
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
          <th className="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {karyawanList.map((item) => (
          <tr key={item.id}>
            <td 
              style={{ fontWeight: 600, cursor: "pointer", color: "#222" }} 
              onClick={() => handleNameClick(item)}
              className="hover-underline"
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
              <div className="status-dots-spaced">
                <span className="dot dot-green"></span>
                <span className="dot dot-red"></span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="hrd-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate("/managerCabang/dashboard")}>
            <div className="menu-left">
              <img src={iconDashboard} alt="dash" className="menu-icon-main" />
              <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          <div className="menu-item active">
            <div className="menu-left">
              <img src={iconKaryawan} alt="karyawan" className="menu-icon-main" />
              <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate("/managerCabang/perizinan")}>
            <div className="menu-left">
              <img src={iconPerizinan} alt="izin" className="menu-icon-main" />
              <span className="menu-text-main">Perizinan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate("/managerCabang/laporan")}>
            <div className="menu-left">
              <img src={iconLaporan} alt="lapor" className="menu-icon-main" />
              <span className="menu-text-main">Laporan</span>
            </div>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="page-header">
          <h1>Data Karyawan</h1>
          <p>Informasi karyawan anda saat ini</p>
        </div>

        <div className="approval-section" style={{ marginTop: "20px" }}>
          <div className="approval-header">Daftar Karyawan</div>
          {renderTable()}
        </div>
      </main>
    </div>
  );
};

export default DataKaryawanManager;