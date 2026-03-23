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
  
  // State Modal Form Edit/Tambah
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState(""); 
  const [editData, setEditData] = useState(null); 
  const [expandedRows, setExpandedRows] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // State Modal Konfirmasi Status
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // STATE MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // DATA DUMMY
  const [dataCabang, setDataCabang] = useState([
    { 
      id: 1, nama: "Cabang 1", isActive: true, alamat: "Jl. Sudirman No. 1, Jakarta", username: "admin_cab1", password: "passwordRahasia1", 
      titikKoordinat: "-6.200000, 106.816666", jamMasuk: "08:00", jamKeluar: "17:00", keterlambatan: "15" 
    },
    { 
      id: 2, nama: "Cabang 2", isActive: false, alamat: "Jl. Thamrin No. 22, Jakarta", username: "admin_cab2", password: "passwordRahasia2", 
      titikKoordinat: "-6.210000, 106.826666", jamMasuk: "08:30", jamKeluar: "17:30", keterlambatan: "15" 
    },
    { 
      id: 3, nama: "Cabang 3", isActive: true, alamat: "Jl. Gatot Subroto, Jakarta", username: "admin_cab3", password: "passwordRahasia3", 
      titikKoordinat: "-6.220000, 106.836666", jamMasuk: "09:00", jamKeluar: "18:00", keterlambatan: "10" 
    },
    { 
      id: 4, 
      nama: "Cabang 4", 
      isActive: true,
      alamat: "Kawasan Industri MM2100",
      username: "cabang4_pusat",
      password: "passwordPusat4",
      titikKoordinat: "-6.300000, 107.086666",
      jamMasuk: "07:00",
      jamKeluar: "16:00",
      keterlambatan: "10",
      subCabang: [
        { 
          id: 41, nama: "Cabang Lagi 1", isActive: true, alamat: "Blok A1 MM2100", username: "subcab_41", password: "subPassword1", 
          titikKoordinat: "-6.301000, 107.087000", jamMasuk: "07:30", jamKeluar: "16:30", keterlambatan: "15" 
        },
        { 
          id: 42, nama: "Cabang Lagi 2", isActive: true, alamat: "Blok B2 MM2100", username: "subcab_42", password: "subPassword2", 
          titikKoordinat: "-6.302000, 107.088000", jamMasuk: "08:00", jamKeluar: "17:00", keterlambatan: "10" 
        },
        { 
          id: 43, nama: "Cabang Lagi 3", isActive: false, alamat: "Blok C3 MM2100", username: "subcab_43", password: "subPassword3", 
          titikKoordinat: "-6.303000, 107.089000", jamMasuk: "08:30", jamKeluar: "17:30", keterlambatan: "20" 
        }
      ]
    },
  ]);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenEdit = (item) => {
    setModalTitle("Edit Cabang");
    setEditData(item);
    setShowPassword(false); 
    setShowModal(true);
  };

  const handleOpenTambahSub = (parentItem) => {
    setModalTitle(`Tambah Sub-Cabang untuk ${parentItem.nama}`);
    setEditData(null); 
    setShowPassword(false); 
    setShowModal(true);
  };

  const handleOpenTambah = () => {
    setModalTitle("Tambah Cabang Baru");
    setEditData(null); 
    setShowPassword(false); 
    setShowModal(true);
  };

  const handleToggleStatusClick = (e, targetId, isSub, parentId = null) => {
    e.stopPropagation(); 
    setConfirmData({ targetId, isSub, parentId });
    setShowConfirmModal(true);
  };

  const executeToggleStatus = () => {
    if (!confirmData) return;
    const { targetId, isSub, parentId } = confirmData;

    setDataCabang(prevData => {
      return prevData.map(cabang => {
        if (!isSub && cabang.id === targetId) {
          return { ...cabang, isActive: !cabang.isActive };
        }
        if (isSub && cabang.id === parentId) {
          const updatedSub = cabang.subCabang.map(sub => 
            sub.id === targetId ? { ...sub, isActive: !sub.isActive } : sub
          );
          return { ...cabang, subCabang: updatedSub };
        }
        return cabang;
      });
    });

    setShowConfirmModal(false);
    setConfirmData(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleSaveData = (e) => {
    e.preventDefault(); 
    alert(`${modalTitle} berhasil disimpan!`);
    setShowModal(false);
    setEditData(null);
  };

  return (
    <div className="hrd-container">

      {/* ===== MOBILE TOPBAR ===== */}
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar} aria-label="Buka menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* ===== OVERLAY ===== */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <button className="btn-sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">
          ✕
        </button>

        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav('/hrd/dashboard')}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon-main"/> 
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          <div className="menu-item active" onClick={() => handleNav('/hrd/kelolacabang')}> 
            <div className="menu-left">
                <img src={iconKelola} alt="kelola" className="menu-icon-main"/> 
                <span className="menu-text-main">Kelola Cabang</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => handleNav('/hrd/datakaryawan')}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon-main"/> 
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          <div className="menu-item has-arrow" onClick={() => handleNav('/hrd/absenmanual')}>
            <div className="menu-left">
                <img src={iconKehadiran} alt="hadir" className="menu-icon-main"/> 
                <span className="menu-text-main">Kehadiran</span>
            </div>
            <img src={iconBawah} alt="down" className="arrow-icon-main" /> 
          </div>

          <div className="menu-item" onClick={() => handleNav('/hrd/laporan')}>
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

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        <div className="header-cabang-content">
            <h1>Kelola Cabang</h1>
            <p>Manajemen lokasi dan unit operasional</p>
            <div className="action-row-cabang">
                <button className="btn-tambah-cabang-baru" onClick={handleOpenTambah}>
                    <img src={iconTambah} alt="add" /> Tambah Cabang Baru
                </button>
            </div>
        </div>

        <div className="table-cabang-container">
            <div className="table-cabang-header">Nama Cabang</div>
            <div className="table-cabang-body">
                {dataCabang.map((item) => (
                    <React.Fragment key={item.id}>
                        <div className="table-cabang-row" onClick={() => toggleRow(item.id)}>
                            <span className="cabang-name">
                              {item.nama} {item.subCabang && (expandedRows[item.id] ? '▲' : '▼')}
                            </span>
                            
                            <div className="table-cabang-actions">
                                <button className="btn-action-text" onClick={(e) => { e.stopPropagation(); handleOpenTambahSub(item); }}>
                                    + Sub-Cabang
                                </button>
                                
                                <button className="btn-icon-action" onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }} title="Edit Cabang">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>

                                <button className="btn-status-toggle" onClick={(e) => handleToggleStatusClick(e, item.id, false)} title="Ubah Status">
                                    <span className={`status-dot ${item.isActive ? 'active' : 'inactive'}`}></span>
                                </button>
                            </div>
                        </div>

                        {item.subCabang && expandedRows[item.id] && (
                            <div className="sub-rows-wrapper">
                                {item.subCabang.map((sub) => (
                                    <div className="table-cabang-row sub-row" key={sub.id}>
                                        <span className="cabang-name">{sub.nama}</span>
                                        
                                        <div className="table-cabang-actions">
                                            <button className="btn-icon-action" onClick={(e) => { e.stopPropagation(); handleOpenEdit(sub); }} title="Edit Sub-Cabang">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
            
                                            <button className="btn-status-toggle" onClick={(e) => handleToggleStatusClick(e, sub.id, true, item.id)} title="Ubah Status">
                                                <span className={`status-dot ${sub.isActive ? 'active' : 'inactive'}`}></span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </main>

      {/* ================= MODAL FORM TAMBAH/EDIT ================= */}
      {showModal && (
        <div className="modal-overlay-clean">
            <div className="modal-card-edit large-card">
                <h2 className="modal-title">{modalTitle}</h2>
                
                <form onSubmit={handleSaveData}>
                  <div className="modal-grid">
                      <div className="input-block">
                        <label>Nama</label>
                        <input type="text" defaultValue={editData?.nama} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Alamat</label>
                        <input type="text" defaultValue={editData?.alamat} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Username</label>
                        <input type="text" defaultValue={editData?.username} className="modal-input" required />
                      </div>
                      
                      <div className="input-block">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              defaultValue={editData?.password} 
                              className="modal-input" 
                              required 
                            />
                            <button 
                              type="button" 
                              className="btn-eye" 
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              )}
                            </button>
                        </div>
                      </div>

                      <div className="input-block">
                        <label>Titik Koordinat</label>
                        <input type="text" defaultValue={editData?.titikKoordinat} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Jam Masuk</label>
                        <input type="time" defaultValue={editData?.jamMasuk} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Jam Keluar</label>
                        <input type="time" defaultValue={editData?.jamKeluar} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Keterlambatan (Menit)</label>
                        <input type="number" defaultValue={editData?.keterlambatan} placeholder="Misal: 15" className="modal-input" required />
                      </div>
                  </div>
                  <div className="modal-footer-actions">
                      <button type="button" className="btn-cancel-mini" onClick={() => setShowModal(false)}>Batal</button>
                      <button type="submit" className="btn-save-dynamic">Simpan</button>
                  </div>
                </form>
            </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI STATUS ================= */}
      {showConfirmModal && (
        <div className="modal-overlay-clean">
            <div className="modal-card-confirm">
                <h3>Konfirmasi Perubahan</h3>
                <p>Apakah Anda yakin ingin mengubah status cabang ini?</p>
                <div className="confirm-btn-group">
                    <button className="btn-konfirm-batal" onClick={() => { setShowConfirmModal(false); setConfirmData(null); }}>
                        Batal
                    </button>
                    <button className="btn-konfirm-yakin" onClick={executeToggleStatus}>
                        Ya, Ubah
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default KelolaCabang;