import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../hrd/datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";

const DataKaryawanManagerCabang = () => {
  const navigate = useNavigate();

  // STATE MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNav = (path) => { closeSidebar(); navigate(path); };

  const [userData, setUserData] = useState({ nama: "Loading...", cabangUtama: "Memuat Data...", subCabang: [] });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          nama: parsedUser.nama || "Manager",
          cabangUtama: parsedUser.cabangUtama || "Cabang Tidak Diketahui",
          subCabang: Array.isArray(parsedUser.subCabang) ? parsedUser.subCabang : []
        });
      } catch (error) {
        console.error("Gagal memparsing data user dari localStorage", error);
      }
    }
  }, [navigate]);

  const opsiCabangManager = [userData.cabangUtama, ...userData.subCabang].filter(Boolean);

  const [karyawanList, setKaryawanList] = useState([
    { id: 1, nama: "Syahrul", jabatan: "CEO", nik: "123456789", password: "passwordrahasia1", tempatLahir: "Semarang", tanggalLahir: "2026-01-01", alamat: "Semarang", divisi: "Operasional", tanggalMasuk: "2023-01-01", jenisKelamin: "Laki-laki", cabang: "F&B Jakarta", status: "Aktif" },
    { id: 2, nama: "Budi", jabatan: "Staff", nik: "987654321", password: "passwordrahasia2", tempatLahir: "Jakarta", tanggalLahir: "1999-02-12", alamat: "Jakarta Selatan", divisi: "Marketing", tanggalMasuk: "2023-03-15", jenisKelamin: "Laki-laki", cabang: "F&B Kemang (Sub)", status: "Aktif" }
  ]);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Sub-Cabang");
  const hasSubCabang = userData.subCabang.length > 0;
  const isStackedMode = hasSubCabang && selectedCabang === "Semua Sub-Cabang";

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => { if (hasSubCabang) setShowFilter(!showFilter); };
  const handleSelectCabang = (cabang) => { setSelectedCabang(cabang); setShowFilter(false); };
  const handleOpenAdd = () => { setShowPasswordInModal(false); setShowAddModal(true); };
  const handleCloseModal = () => setShowAddModal(false);

  const handleRowClick = (employee) => {
    navigate("/managerCabang/detail-karyawan", { state: { employee } });
  };

  const toggleTablePassword = (id, e) => {
    e.stopPropagation();
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveData = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newData = Object.fromEntries(formData.entries());
    setKaryawanList(prev => [...prev, { id: Date.now(), ...newData }]);
    alert(`Data Karyawan Baru berhasil ditambahkan!`);
    handleCloseModal();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) { alert(`File "${file.name}" terlalu besar! Maksimal 2 MB.`); e.target.value = ""; }
  };

  const FilterDropdown = () => (
    <div className="filter-wrapper">
      <button className="btn-filter" onClick={toggleFilter} style={{ cursor: hasSubCabang ? 'pointer' : 'default' }}>
        {!hasSubCabang ? userData.cabangUtama : selectedCabang}
        {hasSubCabang && <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? "rotate" : ""}`} />}
      </button>
      {showFilter && hasSubCabang && (
        <div className="filter-dropdown">
          {["Semua Sub-Cabang", ...userData.subCabang].map((cabang, index) => (
            <div key={index} className="dropdown-item" onClick={() => handleSelectCabang(cabang)}>{cabang}</div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTable = () => (
    <div className="approval-section-scrollable">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Nama</th><th>Jabatan</th><th>NIK (Username)</th><th>Password</th>
            <th>Tempat Lahir</th><th>Tanggal Lahir</th><th>Alamat</th><th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {karyawanList.map((item) => (
            <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item)}>
              <td className="clickable-name">{item.nama}</td>
              <td>{item.jabatan}</td>
              <td>{item.nik}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: '120px' }}>
                  <span>{visiblePasswords[item.id] ? item.password : "••••••••"}</span>
                  <button onClick={(e) => toggleTablePassword(item.id, e)} className="btn-eye" style={{ position: 'static', padding: '0 5px' }}>
                    {visiblePasswords[item.id] ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>
              </td>
              <td>{item.tempatLahir}</td>
              <td>{item.tanggalLahir}</td>
              <td>{item.alamat}</td>
              <td className="text-center" onClick={(e) => e.stopPropagation()}>
                <div className="status-dots-spaced">{item.status === 'Aktif' ? <span className="dot dot-green" title="Aktif"></span> : <span className="dot dot-red" title="Resign"></span>}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="hrd-container">

      {/* ===== MOBILE TOPBAR ===== */}
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar} aria-label="Buka menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* ===== OVERLAY ===== */}
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={closeSidebar} />

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">✕</button>
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav('/managerCabang/dashboard')}><div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item active"><div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/managerCabang/perizinan')}><div className="menu-left"><img src={iconPerizinan} alt="perizinan" className="menu-icon-main" /><span className="menu-text-main">Perizinan</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/managerCabang/laporan')}><div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        <div className="page-header">
          <h1>Data Karyawan - {userData.cabangUtama}</h1>
          <p>Daftar pusat informasi dan detail administrasi karyawan</p>
        </div>

        {!isStackedMode && (
          <div className="action-bar">
            <FilterDropdown />
            <button className="btn-tambah" onClick={handleOpenAdd}><img src={iconTambah} alt="" /> Tambah Karyawan</button>
          </div>
        )}

        {isStackedMode ? (
          <div className="stacked-layout">
            {userData.subCabang.map((subCabang, index) => (
              <div key={index} className="stacked-card-wrapper" style={{ marginTop: index > 0 ? "40px" : "0" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <h3 className="sub-branch-title" style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0 }}>{subCabang}</h3>
                  <div className="action-bar" style={{ marginTop: '0', marginBottom: '-40px' }}>
                    {index === 0 && <FilterDropdown />}
                    <button className="btn-tambah" onClick={handleOpenAdd}><img src={iconTambah} alt="" /> Tambah Karyawan</button>
                  </div>
                </div>
                <div className="approval-section" style={{ marginTop: "20px" }}>
                  <div className="approval-header">Daftar Karyawan</div>
                  {renderTable()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="approval-section" style={{ marginTop: "20px" }}>
            <div className="approval-header">Daftar Karyawan</div>
            {renderTable()}
          </div>
        )}
      </main>

      {/* ===== MODAL TAMBAH ===== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tambah Karyawan</h2>
              <p className="modal-subtitle">Silahkan lengkapi data karyawan baru</p>
              <hr className="modal-divider" style={{ margin: '15px 0', border: 'none', borderBottom: '1px solid #ddd' }} />
            </div>
            <form onSubmit={handleSaveData}>
              <div className="modal-form">
                <div className="form-grid-3">
                  <div className="form-group"><label>Nama</label><input name="nama" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>Tanggal Masuk</label><input name="tanggalMasuk" type="date" className="input-gray" required /></div>
                  <div className="form-group"><label>Jabatan</label><input name="jabatan" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>Divisi</label><input name="divisi" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>NIK (Username)</label><input name="nik" type="text" className="input-gray" required /></div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-wrapper">
                      <input name="password" type={showPasswordInModal ? "text" : "password"} className="input-gray" required />
                      <button type="button" className="btn-eye" onClick={() => setShowPasswordInModal(!showPasswordInModal)}>
                        {showPasswordInModal ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group"><label>Tempat Lahir</label><input name="tempatLahir" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>Tanggal Lahir</label><input name="tanggalLahir" type="date" className="input-gray" required /></div>
                  <div className="form-group"><label>Jenis Kelamin</label><select name="jenisKelamin" className="input-gray" required><option value="">Pilih</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
                  <div className="form-group">
                    <label>Cabang Penempatan</label>
                    <select name="cabang" className="input-gray" required>
                      <option value="">Pilih Cabang</option>
                      {opsiCabangManager.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Status Karyawan</label><select name="status" className="input-gray" required><option value="Aktif">Aktif</option><option value="Resign">Resign</option></select></div>
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}><label>Alamat</label><input name="alamat" type="text" className="input-gray" required /></div>
                
                {/* --- UPDATE: Teks Dokumen Pendukung dibuat 2 baris --- */}
                <div className="docs-section">
                  <div style={{ marginBottom: '10px' }}>
                    <h4 className="docs-title">Dokumen Pendukung</h4>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>(Opsional, Maks 2MB)</p>
                  </div>
                  <div className="form-grid-3">
                    {["Foto Karyawan", "Kartu Tanda Penduduk", "Kartu Keluarga", "Surat Keterangan Catatan Kepolisian", "Surat Izin Mengemudi", "Sertifikat Pendukung", "Dokumen Tambahan"].map((label, idx) => (
                      <div key={idx} className="form-group"><label>{label}</label><input type="file" className="input-gray" style={{ fontSize: '12px' }} onChange={handleFileChange} accept="image/*,.pdf" /></div>
                    ))}
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn-batal" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn-simpan">Simpan Karyawan Baru</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKaryawanManagerCabang;