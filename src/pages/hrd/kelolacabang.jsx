import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./kelolacabang.css"; 

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg"; 
import logoPersegi from "../../assets/logopersegi.svg"; 
import iconTambah from "../../assets/tambah.svg"; 

const KelolaCabang = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState(""); 
  const [editData, setEditData] = useState(null); 
  const [expandedRows, setExpandedRows] = useState({});

  const dataCabang = [
    { id: 1, nama: "Cabang 1" },
    { id: 2, nama: "Cabang 2" },
    { id: 3, nama: "Cabang 3" },
    { 
      id: 4, 
      nama: "Cabang 4", 
      subCabang: [
        { id: 41, nama: "Cabang Lagi 1" },
        { id: 42, nama: "Cabang Lagi 2" },
        { id: 43, nama: "Cabang Lagi 3" }
      ]
    },
  ];

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenEdit = (item) => {
    setModalTitle("Edit Cabang");
    setEditData(item);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  return (
    <div className="hrd-container">
      {/* ================= SIDEBAR TERBARU ================= */}
      <aside className="sidebar">
        <div className="logo-area">
          {/* Tulisan Sistem Absensi sudah dihapus dari sini */}
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon-main"/> 
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          {/* Menu ini yang ACTIVE di halaman Kelola Cabang */}
          <div className="menu-item active" onClick={() => navigate('/hrd/kelolacabang')}> 
            <div className="menu-left">
                <img src={iconKelola} alt="kelola" className="menu-icon-main"/> 
                <span className="menu-text-main">Kelola Cabang</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/hrd/datakaryawan')}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon-main"/> 
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          <div className="menu-item has-arrow" onClick={() => navigate('/hrd/absenmanual')}>
            <div className="menu-left">
                <img src={iconKehadiran} alt="hadir" className="menu-icon-main"/> 
                <span className="menu-text-main">Kehadiran</span>
            </div>
            <img src={iconBawah} alt="down" className="arrow-icon-main" /> 
          </div>

          <div className="menu-item" onClick={() => navigate('/hrd/laporan')}>
            <div className="menu-left">
                <img src={iconLaporan} alt="lapor" className="menu-icon-main"/> 
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
      {/* ================= END SIDEBAR ================= */}

      <main className="main-content">
        <div className="header-cabang-content">
            <h1>Kelola Cabang</h1>
            <p>Manajemen lokasi dan unit operasional</p>
            <div className="action-row-cabang">
                <button className="btn-tambah-cabang-baru" onClick={() => {setModalTitle("Tambah Cabang"); setShowModal(true);}}>
                    <img src={iconTambah} alt="add" /> Tambah Cabang Baru
                </button>
            </div>
        </div>

        <div className="table-cabang-container">
            <div className="table-cabang-header">Nama Cabang</div>
            <div className="table-cabang-body">
                {dataCabang.map((item) => (
                    <React.Fragment key={item.id}>
                        <div className="table-cabang-row" onClick={() => item.subCabang && toggleRow(item.id)}>
                            <span className="cabang-name">{item.nama} {item.subCabang && (expandedRows[item.id] ? '▲' : '▼')}</span>
                            {!item.subCabang && <button className="btn-edit-cabang" onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}>Edit Cabang</button>}
                        </div>
                        {item.subCabang && expandedRows[item.id] && (
                            <div className="sub-rows-wrapper">
                                {item.subCabang.map((sub) => (
                                    <div className="table-cabang-row sub-row" key={sub.id}>
                                        <span className="cabang-name">{sub.nama}</span>
                                        <button className="btn-edit-cabang" onClick={() => handleOpenEdit(sub)}>Edit Cabang</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </main>

      {/* --- MODAL FIX (TOMBOL DINAMIS & NO BLUR) --- */}
      {showModal && (
        <div className="modal-overlay-clean">
            <div className="modal-card-edit large-card">
                <h2 className="modal-title">{modalTitle}</h2>
                <div className="modal-grid">
                    <div className="input-block"><label>Nama</label><input type="text" defaultValue={editData?.nama} className="modal-input" /></div>
                    <div className="input-block"><label>Alamat</label><input type="text" className="modal-input" /></div>
                    <div className="input-block"><label>Username</label><input type="text" className="modal-input" /></div>
                    <div className="input-block"><label>Password</label><input type="password" className="modal-input" /></div>
                    <div className="input-block"><label>Titik Koordinat</label><input type="text" className="modal-input" /></div>
                    <div className="input-block"><label>Jam Masuk</label><input type="text" className="modal-input" /></div>
                    <div className="input-block"><label>Jam Keluar</label><input type="text" className="modal-input" /></div>
                    <div className="input-block"><label>Keterlambatan</label><input type="text" placeholder="Menit" className="modal-input" /></div>
                </div>
                <div className="modal-footer-actions">
                    <button className="btn-cancel-mini" onClick={() => setShowModal(false)}>Batal</button>
                    <button className="btn-save-dynamic">Simpan</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default KelolaCabang;