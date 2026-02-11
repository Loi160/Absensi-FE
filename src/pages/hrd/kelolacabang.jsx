import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./kelolacabang.css"; 

// --- IMPORT ICONS ---
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
  const [modalType, setModalType] = useState("add"); 
  const [selectedCabang, setSelectedCabang] = useState(null);

  // STATE EXPAND
  const [expandedRows, setExpandedRows] = useState({});

  // DATA NESTED
  const [dataCabang] = useState([
    { id: 1, nama: "Cabang 1", alamat: "Jl. Merdeka No. 1", username: "cabang1" },
    { id: 2, nama: "Cabang 2", alamat: "Jl. Sudirman No. 45", username: "cabang2" },
    { id: 3, nama: "Cabang 3", alamat: "Jl. Diponegoro No. 10", username: "cabang3" },
    { 
      id: 4, 
      nama: "Cabang 4", 
      alamat: "Jl. Gatot Subroto", 
      username: "cabang4",
      subCabang: [
        { id: 41, nama: "Cabang Lagi 1", alamat: "Jl. Test 1", username: "cabang4-1" },
        { id: 42, nama: "Cabang Lagi 2", alamat: "Jl. Test 2", username: "cabang4-2" },
        { id: 43, nama: "Cabang Lagi 3", alamat: "Jl. Test 3", username: "cabang4-3" },
      ]
    },
  ]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAdd = () => {
    setModalType("add");
    setSelectedCabang(null);
    setShowModal(true);
  };
  const handleEdit = (item) => {
    setModalType("edit");
    setSelectedCabang(item);
    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="hrd-container">
      {/* SIDEBAR SAMA SEPERTI SEBELUMNYA */}
      <aside className="sidebar">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon"/> 
                <span>Dashboard</span>
            </div>
          </div>
          <div className="menu-item active" onClick={() => navigate('/hrd/kelolacabang')}>
            <div className="menu-left">
                <img src={iconKelola} alt="kelola" className="menu-icon"/> 
                <span>Kelola Cabang</span>
            </div>
          </div>
          <div className="menu-item">
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon"/> 
                <span>Data Karyawan</span>
            </div>
          </div>
          <div className="menu-item has-arrow">
            <div className="menu-left">
                <img src={iconKehadiran} alt="hadir" className="menu-icon"/> 
                <span>Kehadiran</span>
            </div>
            <img src={iconBawah} alt="down" className="arrow-icon-large" /> 
          </div>
          <div className="menu-item">
            <div className="menu-left">
                <img src={iconLaporan} alt="lapor" className="menu-icon"/> 
                <span>Laporan</span>
            </div>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-header-action">
            <div className="header-text">
                <h1>Data Cabang</h1>
                <p>Informasi cabang anda saat ini</p>
            </div>
            <button className="btn-tambah" onClick={handleAdd}>
                <img src={iconTambah} alt="add" />
                Tambah Cabang Baru
            </button>
        </div>

        <div className="table-container">
            <div className="table-header">
                <span>Nama Cabang</span>
            </div>
            <div className="table-body">
                {dataCabang.map((item) => (
                    <React.Fragment key={item.id}>
                        {/* PARENT ROW */}
                        <div className="table-row">
                            <div 
                                className="row-name-wrapper" 
                                onClick={() => item.subCabang && toggleRow(item.id)}
                                style={{ cursor: item.subCabang ? 'pointer' : 'default' }}
                            >
                                <span className="row-name">{item.nama}</span>
                            </div>
                            <span className="row-action" onClick={() => handleEdit(item)}>
                                Edit Cabang
                            </span>
                        </div>

                        {/* CHILD ROWS (SUB CABANG) */}
                        {item.subCabang && expandedRows[item.id] && (
                            <div className="sub-rows-container">
                                {item.subCabang.map((subItem) => (
                                    <div className="table-row sub-row" key={subItem.id}>
                                        <div className="row-name-wrapper">
                                            {/* REVISI: HAPUS ELEMENT <span className="tree-connector">└──</span> DISINI */}
                                            {/* Cukup teks nama saja */}
                                            <span className="row-name">{subItem.nama}</span>
                                        </div>
                                        <span className="row-action" onClick={() => handleEdit(subItem)}>
                                            Edit Cabang
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </main>

      {/* MODAL (TETAP SAMA) */}
       {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{modalType === 'add' ? 'Tambah Cabang' : 'Edit Cabang'}</h2>
                <form className="modal-form-grid">
                    <div className="form-group">
                        <label>Nama</label>
                        <input type="text" defaultValue={selectedCabang?.nama} />
                    </div>
                    <div className="form-group">
                        <label>Alamat</label>
                        <input type="text" defaultValue={selectedCabang?.alamat} />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" defaultValue={selectedCabang?.username} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="*****" />
                    </div>
                    <div className="form-group">
                        <label>Titik Koordinat</label>
                        <input type="text" placeholder="-6.200000, 106.816666" />
                    </div>
                    <div className="form-group">
                        <label>Jam Masuk</label>
                        <input type="text" defaultValue={selectedCabang?.jamMasuk} />
                    </div>
                    <div className="form-group">
                        <label>Jam Keluar</label>
                        <input type="text" defaultValue={selectedCabang?.jamKeluar} />
                    </div>
                    <div className="form-group">
                        <label>Keterlambatan</label>
                        <input type="text" placeholder="Menit" />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Batal</button>
                        <button type="submit" className="btn-save">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default KelolaCabang;