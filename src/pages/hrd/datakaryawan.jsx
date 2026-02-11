import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./datakaryawan.css"; 

// --- IMPORT ICONS ---
import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";
import iconEdit from "../../assets/edit.svg"; // <--- KITA PANGGIL LAGI

const DataKaryawan = () => {
  const navigate = useNavigate();

  // Data Dummy
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

  return (
    <div className="hrd-container">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}>
            <div className="menu-left">
              <img src={iconDashboard} alt="dash" className="menu-icon" />
              <span>Dashboard</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/hrd/kelolacabang')}>
            <div className="menu-left">
              <img src={iconKelola} alt="kelola" className="menu-icon" />
              <span>Kelola Cabang</span>
            </div>
          </div>

          {/* MENU AKTIF */}
          <div className="menu-item active" onClick={() => navigate('/hrd/datakaryawan')}>
            <div className="menu-left">
              <img src={iconKaryawan} alt="karyawan" className="menu-icon" />
              <span>Data Karyawan</span>
            </div>
          </div>

          <div className="menu-item has-arrow">
            <div className="menu-left">
              <img src={iconKehadiran} alt="hadir" className="menu-icon" />
              <span>Kehadiran</span>
            </div>
            <img src={iconBawah} alt="down" className="arrow-icon-large" />
          </div>

          <div className="menu-item">
            <div className="menu-left">
              <img src={iconLaporan} alt="lapor" className="menu-icon" />
              <span>Laporan</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        
        {/* Header Halaman */}
        <div className="page-header">
          <h1>Data Karyawan</h1>
          <p>Informasi karyawan anda saat ini</p>
        </div>

        {/* Action Buttons */}
        <div className="action-bar">
            {/* Tombol Filter */}
            <button className="btn-filter">
                Filter 
                <img src={iconBawah} alt="v" className="filter-arrow"/>
            </button>

            {/* Tombol Tambah */}
            <button className="btn-tambah">
                <img src={iconTambah} alt="+" />
                Tambah Karyawan
            </button>
        </div>

        {/* Section Tabel Approval */}
        <div className="approval-section">
            <div className="approval-header">
                Permintaan Menunggu Approval
            </div>

            <div className="table-responsive">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Jabatan</th>
                            <th>Nik (User)</th>
                            <th>Password</th>
                            <th>Tempat Lahir</th>
                            <th>Tanggal Lahir</th>
                            <th>Alamat</th>
                            <th>Edit</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {karyawanList.map((item) => (
                            <tr key={item.id}>
                                <td>{item.nama}</td>
                                <td>{item.jabatan}</td>
                                <td>{item.nik}</td>
                                <td>{item.password}</td>
                                <td>{item.tempatLahir}</td>
                                <td>{item.tanggalLahir}</td>
                                <td>{item.alamat}</td>
                                <td className="text-center">
                                    <button className="btn-icon-edit">
                                        {/* GUNAKAN VARIABLE ICON IMPORT */}
                                        <img src={iconEdit} alt="edit" />
                                    </button>
                                </td>
                                <td>
                                    <div className="status-dots">
                                        <span className="dot dot-green" title="Approve"></span>
                                        <span className="dot dot-red" title="Reject"></span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        <tr><td colSpan="9" style={{height: '30px'}}></td></tr>
                        <tr><td colSpan="9" style={{height: '30px'}}></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default DataKaryawan;