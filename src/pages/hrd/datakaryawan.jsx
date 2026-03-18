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

const DataKaryawan = () => {
  const navigate = useNavigate();

  const semuaCabangAmaga = [
    "F&B Jakarta",
    "F&B Sudirman (Sub)",
    "F&B Kemang (Sub)",
    "Jam Tangan Jkt",
    "Pakaian Jkt",
    "Sepatu Jkt"
  ];

  /* ================= DATA DUMMY ================= */
  const [karyawanList, setKaryawanList] = useState([
    {
      id: 1, nama: "Syahrul", jabatan: "CEO", nik: "123456789", password: "passwordrahasia1", tempatLahir: "Semarang", tanggalLahir: "2026-01-01", alamat: "Semarang", divisi: "Operasional", tanggalMasuk: "2023-01-01", jenisKelamin: "Laki-laki", 
      cabang: "F&B Jakarta", 
      status: "Aktif" 
    },
    {
      id: 2, nama: "Budi", jabatan: "Staff", nik: "987654321", password: "passwordrahasia2", tempatLahir: "Jakarta", tanggalLahir: "1999-02-12", alamat: "Jakarta Selatan", divisi: "Marketing", tanggalMasuk: "2023-03-15", jenisKelamin: "Laki-laki", 
      cabang: "F&B Kemang (Sub)", 
      status: "Aktif"
    },
    {
      id: 3, nama: "Siti", jabatan: "HRD", nik: "1122334455", password: "passwordrahasia3", tempatLahir: "Bandung", tanggalLahir: "2000-03-10", alamat: "Bandung Kota", divisi: "HR", tanggalMasuk: "2023-05-20", jenisKelamin: "Perempuan", 
      cabang: "Jam Tangan Jkt", 
      status: "Resign" 
    },
  ]);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang");
  
  // MODAL HANYA UNTUK TAMBAH KARYAWAN SEKARANG
  const [showAddModal, setShowAddModal] = useState(false); 
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  // State untuk Toggle Mata Password di Tabel
  const [visiblePasswords, setVisiblePasswords] = useState({});

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

  const handleOpenAdd = () => {
    setShowPasswordInModal(false);
    setShowAddModal(true);         
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleRowClick = (employee) => {
    // Navigasi ke halaman detail (di sana bisa view/edit)
    navigate("/hrd/detail-karyawan", { state: { employee: employee } });
  };

  const toggleTablePassword = (id, e) => {
    e.stopPropagation(); // Mencegah baris tereksekusi klik (tidak pindah halaman)
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveData = (e) => {
    e.preventDefault(); 
    const formData = new FormData(e.target);
    const newData = Object.fromEntries(formData.entries());

    // Tambah karyawan baru
    setKaryawanList(prevList => [
      ...prevList, 
      { id: Date.now(), ...newData }
    ]);
    
    alert(`Data Karyawan Baru berhasil ditambahkan!`);
    handleCloseModal();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) { 
      alert(`File "${file.name}" terlalu besar! Maksimal ukuran file adalah 2 MB.`);
      e.target.value = ""; 
    }
  };

  /* ================= COMPONENTS ================= */
  const FilterDropdown = () => (
    <div className="filter-wrapper">
      <button className="btn-filter" onClick={toggleFilter}>
        {selectedCabang}
        <img src={iconBawah} alt="" className={`filter-arrow ${showFilter ? "rotate" : ""}`} />
      </button>
      {showFilter && (
        <div className="filter-dropdown">
          {["Semua Cabang", ...semuaCabangAmaga].map((cabang, index) => (
            <div key={index} className="dropdown-item" onClick={() => handleSelectCabang(cabang)}>
              {cabang}
            </div>
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
            <th>Nama</th>
            <th>Jabatan</th>
            <th>NIK (Username)</th>
            <th>Password</th>
            <th>Tempat Lahir</th>
            <th>Tanggal Lahir</th>
            <th>Alamat</th>
            <th className="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            {karyawanList.map((item) => (
            <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item)}>
                <td className="clickable-name">{item.nama}</td>
                <td>{item.jabatan}</td>
                <td>{item.nik}</td>
                
                {/* KOLOM PASSWORD MEMANJANG DENGAN MATA */}
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: '120px' }}>
                        <span>{visiblePasswords[item.id] ? item.password : "••••••••"}</span>
                        <button onClick={(e) => toggleTablePassword(item.id, e)} className="btn-eye" style={{position: 'static', padding: '0 5px'}}>
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
                
                {/* STATUS */}
                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                <div className="status-dots-spaced">
                    {item.status === 'Aktif' ? (
                    <span className="dot dot-green" title="Aktif"></span>
                    ) : (
                    <span className="dot dot-red" title="Resign"></span>
                    )}
                </div>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );

  return (
    <div className="hrd-container">
      <aside className="sidebar">
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate("/hrd/dashboard")}><div className="menu-left"><img src={iconDashboard} alt="" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item" onClick={() => navigate("/hrd/kelolacabang")}><div className="menu-left"><img src={iconKelola} alt="" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div></div>
          <div className="menu-item active"><div className="menu-left"><img src={iconKaryawan} alt="" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item has-arrow" onClick={() => navigate("/hrd/absenmanual")}><div className="menu-left"><img src={iconKehadiran} alt="" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div><img src={iconBawah} alt="" className="arrow-icon-main" /></div>
          <div className="menu-item" onClick={() => navigate("/hrd/laporan")}><div className="menu-left"><img src={iconLaporan} alt="" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h1>Data Karyawan</h1>
          <p>Daftar pusat informasi dan detail administrasi karyawan</p>
        </div>
        
        <div className="action-bar">
          <FilterDropdown />
          <button className="btn-tambah" onClick={handleOpenAdd}><img src={iconTambah} alt="" /> Tambah Karyawan</button>
        </div>
        
        <div className="approval-section" style={{ marginTop: "20px" }}>
           <div className="approval-header">Daftar Karyawan</div>
           {renderTable()}
        </div>
      </main>

      {/* MODAL HANYA UNTUK ADD */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tambah Karyawan</h2>
              <p className="modal-subtitle">Silahkan lengkapi data karyawan baru</p>
              <hr className="modal-divider" style={{margin: '15px 0', border: 'none', borderBottom: '1px solid #ddd'}} />
            </div>
            
            <form onSubmit={handleSaveData}>
              <div className="modal-form">
                <div className="form-grid-3">
                  <div className="form-group"><label>Nama</label><input name="nama" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>Tanggal Masuk</label><input name="tanggalMasuk" type="date" className="input-gray" required /></div>
                  <div className="form-group"><label>Jabatan</label><input name="jabatan" type="text" className="input-gray" required /></div>
                  
                  <div className="form-group"><label>Divisi</label><input name="divisi" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>NIK (Username)</label><input name="nik" type="text" className="input-gray" required /></div>
                  
                  {/* PASSWORD FIELD DENGAN EYE ICON */}
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
                      {semuaCabangAmaga.map((cabangName, index) => (
                        <option key={index} value={cabangName}>{cabangName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Status Karyawan</label>
                    <select name="status" className="input-gray" required>
                      <option value="Aktif">Aktif</option>
                      <option value="Resign">Resign</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{marginBottom: '20px'}}><label>Alamat</label><input name="alamat" type="text" className="input-gray" required /></div>
                
                {/* DOKUMEN PENDUKUNG (OPSIONAL) */}
                <div className="docs-section">
                  <h4 style={{fontSize: '14px', marginBottom: '10px'}}>Dokumen Pendukung <span style={{fontSize: '11px', color: '#888', fontWeight: 'normal'}}>(Opsional, Maks 2MB)</span></h4>
                  <div className="form-grid-3">
                    {["Foto Diri", "Foto KTP", "KK", "SKCK", "SIM", "Sertifikat"].map((label, idx) => (
                      <div key={idx} className="form-group">
                          <label>{label}</label>
                          <input type="file" className="input-gray" style={{fontSize: '12px'}} onChange={handleFileChange} accept="image/*,.pdf" />
                      </div>
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

export default DataKaryawan;