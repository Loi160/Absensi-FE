import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./datakaryawan.css";

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNav = (path) => { closeSidebar(); navigate(path); };

  // STATE UNTUK DATA REAL DARI DATABASE
  const [karyawanList, setKaryawanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // FUNGSI MENGAMBIL DATA KARYAWAN & CABANG
  const fetchData = async () => {
    try {
      setLoading(true);
      // Ambil Karyawan
      const resKaryawan = await fetch("http://localhost:3000/api/karyawan");
      const dataKaryawan = await resKaryawan.json();
      setKaryawanList(dataKaryawan);

      // Ambil Cabang (untuk Dropdown Filter & Form Tambah)
      const resCabang = await fetch("http://localhost:3000/api/cabang");
      const dataCabang = await resCabang.json();
      setCabangList(dataCabang);

    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => setShowFilter(!showFilter);
  const handleSelectCabang = (cabang) => { setSelectedCabang(cabang); setShowFilter(false); };
  const handleOpenAdd = () => { setShowPasswordInModal(false); setShowAddModal(true); };
  const handleCloseModal = () => setShowAddModal(false);

  const handleRowClick = (employee) => {
    navigate("/hrd/detail-karyawan", { state: { employee } });
  };

  const toggleTablePassword = (id, e) => {
    e.stopPropagation();
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // FUNGSI SIMPAN KARYAWAN BARU KE DATABASE
  const handleSaveData = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Sesuaikan nama field dengan tabel users di database SQL
    const payload = {
      nama: data.nama,
      tanggal_masuk: data.tanggal_masuk,
      jabatan: data.jabatan,
      divisi: data.divisi,
      nik: data.nik,
      password: data.password,
      tempat_lahir: data.tempat_lahir,
      tanggal_lahir: data.tanggal_lahir,
      jenis_kelamin: data.jenis_kelamin,
      cabang_id: data.cabang_id ? parseInt(data.cabang_id) : null,
      status: data.status,
      alamat: data.alamat,
      role: data.role // Akan bernilai 'hrd', 'managerCabang', atau 'karyawan'
    };

    try {
      const response = await fetch("http://localhost:3000/api/karyawan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Karyawan Baru berhasil ditambahkan!");
        handleCloseModal();
        fetchData(); // Refresh tabel setelah data berhasil masuk
      } else {
        const errData = await response.json();
        alert(`Gagal: ${errData.message || "Periksa kembali data Anda."}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert(`File "${file.name}" terlalu besar! Maksimal 2 MB.`);
      e.target.value = "";
    }
  };

  // Filter Data untuk Tabel
  const filteredKaryawan = karyawanList.filter((k) => {
    if (selectedCabang === "Semua Cabang") return true;
    return k.cabang?.nama === selectedCabang;
  });

  const FilterDropdown = () => (
    <div className="filter-wrapper">
      <button className="btn-filter" onClick={toggleFilter}>
        {selectedCabang}
        <img src={iconBawah} alt="" className={`filter-arrow ${showFilter ? "rotate" : ""}`} />
      </button>
      {showFilter && (
        <div className="filter-dropdown">
          <div className="dropdown-item" onClick={() => handleSelectCabang("Semua Cabang")}>Semua Cabang</div>
          {cabangList.map((c) => (
            <div key={c.id} className="dropdown-item" onClick={() => handleSelectCabang(c.nama)}>{c.nama}</div>
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
            <th>Cabang</th>
            <th>Role</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7" className="text-center">Memuat data...</td></tr>
          ) : filteredKaryawan.length === 0 ? (
            <tr><td colSpan="7" className="text-center">Belum ada data karyawan.</td></tr>
          ) : (
            filteredKaryawan.map((item) => (
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
                <td>{item.cabang?.nama || '-'}</td>
                <td>{item.role}</td>
                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="status-dots-spaced">
                    {item.status === 'Aktif' ? <span className="dot dot-green" title="Aktif"></span> : <span className="dot dot-red" title="Resign"></span>}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="hrd-container">

      {/* MOBILE & OVERLAY */}
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
          <div className="menu-item" onClick={() => handleNav("/hrd/dashboard")}><div className="menu-left"><img src={iconDashboard} alt="" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item" onClick={() => handleNav("/hrd/kelolacabang")}><div className="menu-left"><img src={iconKelola} alt="" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div></div>
          <div className="menu-item active"><div className="menu-left"><img src={iconKaryawan} alt="" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item has-arrow" onClick={() => handleNav("/hrd/absenmanual")}><div className="menu-left"><img src={iconKehadiran} alt="" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div><img src={iconBawah} alt="" className="arrow-icon-main" /></div>
          <div className="menu-item" onClick={() => handleNav("/hrd/laporan")}><div className="menu-left"><img src={iconLaporan} alt="" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      {/* MAIN CONTENT */}
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

      {/* ===== MODAL TAMBAH ===== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tambah Karyawan</h2>
              <p className="modal-subtitle">Silahkan lengkapi data karyawan baru</p>
              <hr className="modal-divider" />
            </div>
            <form onSubmit={handleSaveData}>
              <div className="modal-form">
                <div className="form-grid-3">
                  <div className="form-group"><label>Nama</label><input name="nama" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>Tanggal Masuk</label><input name="tanggal_masuk" type="date" className="input-gray" required /></div>
                  <div className="form-group"><label>Jabatan</label><input name="jabatan" type="text" className="input-gray" required /></div>
                  
                  <div className="form-group"><label>Divisi</label><input name="divisi" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>NIK (Username)</label><input name="nik" type="text" className="input-gray" required /></div>
                  
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-wrapper">
                      <input name="password" type={showPasswordInModal ? "text" : "password"} className="input-gray" required />
                      <button type="button" className="btn-eye" onClick={() => setShowPasswordInModal(!showPasswordInModal)}>
                        {/* UPDATE ICON MATA DI SINI MENGGUNAKAN SVG STANDAR */}
                        {showPasswordInModal ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-group"><label>Tempat Lahir</label><input name="tempat_lahir" type="text" className="input-gray" required /></div>
                  <div className="form-group"><label>Tanggal Lahir</label><input name="tanggal_lahir" type="date" className="input-gray" required /></div>
                  <div className="form-group"><label>Jenis Kelamin</label>
                    <select name="jenis_kelamin" className="input-gray" required>
                      <option value="">Pilih</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cabang Penempatan</label>
                    <select name="cabang_id" className="input-gray" required>
                      <option value="">Pilih Cabang</option>
                      {/* Pilihan cabang diambil langsung dari Database */}
                      {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                  </div>

                  <div className="form-group"><label>Status Karyawan</label>
                    <select name="status" className="input-gray" required>
                      <option value="Aktif">Aktif</option>
                      <option value="Resign">Resign</option>
                    </select>
                  </div>

                  <div className="form-group"><label>Hak Akses (Role)</label>
                    <select name="role" className="input-gray" required>
                      {/* PASTIKAN VALUE SESUAI DENGAN TABEL (hrd, managerCabang, karyawan) */}
                      <option value="karyawan">Karyawan</option>
                      <option value="managerCabang">Manager Cabang</option>
                      <option value="hrd">HRD</option>
                    </select>
                  </div>

                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}><label>Alamat Lengkap</label><input name="alamat" type="text" className="input-gray" required /></div>
                
                {/* DOKUMEN PENDUKUNG (Sekadar placeholder UI dulu sesuai rencana kita) */}
                <div className="docs-section">
                  <div style={{ marginBottom: '10px' }}>
                    <h4 className="docs-title">Dokumen Pendukung</h4>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>(Opsional, Fitur Upload menyusul)</p>
                  </div>
                  <div className="form-grid-3">
                    {["Foto Karyawan", "KTP", "Kartu Keluarga", "SKCK", "SIM", "Sertifikat", "Lainnya"].map((label, idx) => (
                      <div key={idx} className="form-group"><label>{label}</label><input type="file" className="input-gray" style={{ fontSize: '12px' }} onChange={handleFileChange} accept="image/*,.pdf" disabled title="Upload sementara dimatikan" /></div>
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