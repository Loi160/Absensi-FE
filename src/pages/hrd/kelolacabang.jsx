import React, { useState, useEffect } from "react";
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

// Icon Mata SVG (Sederhana)
const EyeIcon = ({ show }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </>
    )}
  </svg>
);

const KelolaCabang = () => {
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState(""); 
  const [editData, setEditData] = useState(null); 
  const [parentId, setParentId] = useState(null); 
  const [expandedRows, setExpandedRows] = useState({});
  const [showPassword, setShowPassword] = useState(false); 

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dataCabang, setDataCabang] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCabang = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/cabang");
      const data = await response.json();

      const parents = data.filter(c => !c.parent_id);
      const children = data.filter(c => c.parent_id);

      const structuredData = parents.map(parent => ({
        ...parent,
        subCabang: children.filter(child => child.parent_id === parent.id)
      }));

      setDataCabang(structuredData);
    } catch (error) {
      console.error("Gagal mengambil data cabang:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCabang();
  }, []);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNav = (path) => { closeSidebar(); navigate(path); };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenEdit = (item) => {
    setModalTitle("Edit Cabang");
    setEditData(item);
    setParentId(null);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenTambahSub = (parentItem) => {
    setModalTitle(`Tambah Sub-Cabang untuk ${parentItem.nama}`);
    setEditData(null); 
    setParentId(parentItem.id);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenTambah = () => {
    setModalTitle("Tambah Cabang Baru");
    setEditData(null); 
    setParentId(null);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSaveData = async (e) => {
    e.preventDefault(); 
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (parentId) data.parent_id = parentId;

    try {
      let url = "http://localhost:3000/api/cabang";
      let method = "POST"; 

      if (editData) {
        url = `http://localhost:3000/api/cabang/${editData.id}`;
        method = "PUT"; 
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert(`${modalTitle} berhasil disimpan!`);
        setShowModal(false);
        fetchCabang(); 
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleToggleStatusClick = (e, item) => {
    e.stopPropagation(); 
    setConfirmData(item);
    setShowConfirmModal(true);
  };

  const executeToggleStatus = async () => {
    if (!confirmData) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/cabang/${confirmData.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !confirmData.is_active })
      });

      if (response.ok) {
        setShowConfirmModal(false);
        setConfirmData(null);
        fetchCabang(); 
      }
    } catch (error) {
      console.error("Error update status:", error);
      alert("Gagal mengubah status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  return (
    <div className="hrd-container">
      {/* MOBILE TOPBAR */}
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar}><span></span><span></span><span></span></button>
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={closeSidebar} />
      
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar}>✕</button>
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav('/hrd/dashboard')}><div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main"/> <span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item active" onClick={() => handleNav('/hrd/kelolacabang')}><div className="menu-left"><img src={iconKelola} alt="kelola" className="menu-icon-main"/> <span className="menu-text-main">Kelola Cabang</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/hrd/datakaryawan')}><div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main"/> <span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item has-arrow" onClick={() => handleNav('/hrd/absenmanual')}><div className="menu-left"><img src={iconKehadiran} alt="hadir" className="menu-icon-main"/> <span className="menu-text-main">Kehadiran</span></div><img src={iconBawah} alt="down" className="arrow-icon-main" /></div>
          <div className="menu-item" onClick={() => handleNav('/hrd/laporan')}><div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main"/> <span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* 1. HEADER (Turun ke bawah / Vertikal) */}
        <header className="header-cabang-area">
            <h1 className="cabang-title">Kelola Cabang</h1>
            <p className="cabang-subtitle">Manajemen lokasi dan unit operasional</p>
        </header>

        {/* 2. TOMBOL TAMBAH CABANG (Rata Kanan) */}
        <div className="action-row-cabang">
            <button className="btn-tambah-cabang-baru" onClick={handleOpenTambah}>
                <img src={iconTambah} alt="add" /> Tambah Cabang Baru
            </button>
        </div>

        {/* 3. TABEL AREA */}
        <div className="table-cabang-container">
            <div className="table-cabang-header">Nama Cabang</div>
            <div className="table-cabang-body">
                {loading ? (
                    <div className="table-empty-state">Memuat data dari server...</div>
                ) : dataCabang.length === 0 ? (
                    <div className="table-empty-state">Belum ada data cabang.</div>
                ) : (
                    dataCabang.map((item) => (
                        <React.Fragment key={item.id}>
                            <div className="table-cabang-row" onClick={() => toggleRow(item.id)}>
                                <span className="cabang-name">
                                  {item.nama} {item.subCabang && item.subCabang.length > 0 && (expandedRows[item.id] ? '▲' : '▼')}
                                </span>
                                
                                <div className="table-cabang-actions">
                                    <button className="btn-action-text" onClick={(e) => { e.stopPropagation(); handleOpenTambahSub(item); }}>+ Sub-Cabang</button>
                                    <button className="btn-icon-action" onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }} title="Edit Cabang">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button className="btn-status-toggle" onClick={(e) => handleToggleStatusClick(e, item)} title="Ubah Status">
                                        <span className={`status-dot ${item.is_active ? 'active' : 'inactive'}`}></span>
                                    </button>
                                </div>
                            </div>

                            {item.subCabang && item.subCabang.length > 0 && expandedRows[item.id] && (
                                <div className="sub-rows-wrapper">
                                    {item.subCabang.map((sub) => (
                                        <div className="table-cabang-row sub-row" key={sub.id}>
                                            <span className="cabang-name">{sub.nama}</span>
                                            <div className="table-cabang-actions">
                                                <button className="btn-icon-action" onClick={(e) => { e.stopPropagation(); handleOpenEdit(sub); }} title="Edit Sub-Cabang">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button className="btn-status-toggle" onClick={(e) => handleToggleStatusClick(e, sub)} title="Ubah Status">
                                                    <span className={`status-dot ${sub.is_active ? 'active' : 'inactive'}`}></span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))
                )}
            </div>
        </div>
      </main>

      {/* ================= MODAL FORM TAMBAH/EDIT ================= */}
      {showModal && (
        <div className="modal-overlay-clean" onClick={() => setShowModal(false)}>
            <div className="modal-card-edit" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{modalTitle}</h2>
                <form onSubmit={handleSaveData}>
                  
                  {/* GRID 2 KOLOM */}
                  <div className="modal-grid">
                      <div className="input-block">
                        <label>Nama</label>
                        <input type="text" name="nama" defaultValue={editData?.nama} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Alamat</label>
                        <input type="text" name="alamat" defaultValue={editData?.alamat} className="modal-input" required />
                      </div>
                      
                      <div className="input-block">
                        <label>Username</label>
                        <input type="text" name="username" defaultValue={editData?.username} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Password</label>
                        <div className="password-wrapper">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            defaultValue={editData?.password} 
                            className="modal-input" 
                            required 
                          />
                          <button type="button" className="btn-eye" onClick={() => setShowPassword(!showPassword)}>
                            <EyeIcon show={showPassword} />
                          </button>
                        </div>
                      </div>

                      <div className="input-block">
                        <label>Titik Koordinat</label>
                        <input type="text" name="titik_koordinat" defaultValue={editData?.titik_koordinat} placeholder="-6.200000, 106.816666" className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Jam Masuk</label>
                        <input type="time" name="jam_masuk" defaultValue={editData?.jam_masuk} className="modal-input" required />
                      </div>

                      <div className="input-block">
                        <label>Jam Keluar</label>
                        <input type="time" name="jam_keluar" defaultValue={editData?.jam_keluar} className="modal-input" required />
                      </div>
                      <div className="input-block">
                        <label>Keterlambatan (Menit)</label>
                        <input type="number" name="keterlambatan" defaultValue={editData?.keterlambatan} placeholder="Misal: 15" className="modal-input" required />
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
        <div className="modal-overlay-clean" onClick={() => setShowConfirmModal(false)}>
            <div className="modal-card-confirm" onClick={(e) => e.stopPropagation()}>
                <h3>Konfirmasi Perubahan</h3>
                <p>Apakah Anda yakin ingin mengubah status cabang ini?</p>
                <div className="confirm-btn-group">
                    <button className="btn-konfirm-batal" onClick={() => { setShowConfirmModal(false); setConfirmData(null); }}>Batal</button>
                    <button className="btn-konfirm-yakin" onClick={executeToggleStatus}>Ya, Ubah</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default KelolaCabang;