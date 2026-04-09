import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./datakaryawan.css"; 

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const DetailKaryawan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(employee || {});
  const [showPassword, setShowPassword] = useState(false);
  const [cabangList, setCabangList] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNav = (path) => { closeSidebar(); navigate(path); };

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = storedUser.role === "managerCabang";
  const basePath = isManager ? "/managerCabang" : "/hrd";

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/cabang");
        setCabangList(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchCabang();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/karyawan/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("Perubahan berhasil disimpan!");
        setIsEditing(false);
      } else {
        alert("Gagal menyimpan perubahan.");
      }
    } catch(err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  if (!employee) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: 'Inter' }}>
        <h2>Data Karyawan Tidak Ditemukan</h2>
        <p>Silakan kembali ke halaman Data Karyawan.</p>
        <button onClick={() => navigate(`${basePath}/datakaryawan`)} className="btn-batal" style={{ marginTop: '20px' }}>Kembali</button>
      </div>
    );
  }

  const dokumenList = ["Foto Karyawan", "Kartu Tanda Penduduk", "Kartu Keluarga", "Surat Keterangan Catatan Kepolisian", "Surat Izin Mengemudi", "Sertifikat Pendukung", "Dokumen Tambahan"];

  return (
    <div className="hrd-container">

      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar}><span></span><span></span><span></span></button>
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar}>✕</button>
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav(`${basePath}/dashboard`)}><div className="menu-left"><img src={iconDashboard} alt="" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          {!isManager && ( <div className="menu-item" onClick={() => handleNav(`${basePath}/kelolacabang`)}><div className="menu-left"><img src={iconKelola} alt="" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div></div> )}
          <div className="menu-item active" onClick={() => handleNav(`${basePath}/datakaryawan`)}><div className="menu-left"><img src={iconKaryawan} alt="" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          {!isManager && ( <div className="menu-item has-arrow" onClick={() => handleNav(`${basePath}/absenmanual`)}><div className="menu-left"><img src={iconKehadiran} alt="" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div><img src={iconBawah} alt="" className="arrow-icon-main" /></div> )}
          <div className="menu-item" onClick={() => handleNav(`${basePath}/laporan`)}><div className="menu-left"><img src={iconLaporan} alt="" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      <main className="main-content">
        
        <header className="dk-header-area">
          <div className="dk-title-group">
            <h1 className="dk-title">Detail Karyawan</h1>
            <p className="dk-subtitle">Informasi detail data diri karyawan</p>
          </div>
        </header>

        <div className="dk-action-row">
          <div className="dk-action-group" style={{ justifyContent: 'flex-end', width: '100%' }}>
            {!isEditing && (
              <button className="btn-edit-outline" onClick={() => setIsEditing(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit Data
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveEdit}>
          <div className="detail-form-grid">
            <div className="form-group"><label>Nama</label><input name="nama" type="text" className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.nama} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Tanggal Masuk</label><input name="tanggal_masuk" type={isEditing ? "date" : "text"} className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.tanggal_masuk || ""} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Jabatan</label><input name="jabatan" type="text" className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.jabatan || ""} onChange={handleInputChange} /></div>
            
            <div className="form-group"><label>Divisi</label><input name="divisi" type="text" className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.divisi || ""} onChange={handleInputChange} /></div>
            <div className="form-group"><label>NIK (Username)</label><input name="nik" type="text" className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.nik} onChange={handleInputChange} required /></div>
            <div className="form-group">
              <label>Password</label>
              <div className="pwd-wrapper">
                <input name="password" type={showPassword ? "text" : "password"} className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.password} onChange={handleInputChange} required />
                <button type="button" className="btn-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group"><label>Tempat Lahir</label><input name="tempat_lahir" type="text" className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.tempat_lahir || ""} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Tanggal Lahir</label><input name="tanggal_lahir" type={isEditing ? "date" : "text"} className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.tanggal_lahir || ""} onChange={handleInputChange} /></div>
            <div className="form-group">
              <label>Jenis Kelamin</label>
              {isEditing ? (
                <select name="jenis_kelamin" className="input-edit" value={formData.jenis_kelamin || ""} onChange={handleInputChange}>
                  <option value="">Pilih...</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                </select>
              ) : (
                <input type="text" className="input-read" readOnly value={formData.jenis_kelamin || "-"} />
              )}
            </div>

            <div className="form-group">
              <label>Cabang Penempatan</label>
              {isEditing ? (
                <select name="cabang_id" className="input-edit" value={formData.cabang_id || ""} onChange={handleInputChange}>
                  {cabangList.map(cbg => <option key={cbg.id} value={cbg.id}>{cbg.nama}</option>)}
                </select>
              ) : (
                <input type="text" className="input-read" readOnly value={formData.cabang?.nama || "-"} />
              )}
            </div>
            
            <div className="form-group">
              <label>Status Karyawan</label>
              {isEditing ? (
                <select name="status" className="input-edit" value={formData.status || "Aktif"} onChange={handleInputChange}>
                  <option value="Aktif">Aktif</option><option value="Nonaktif">Nonaktif</option><option value="Resign">Resign</option>
                </select>
              ) : (
                <input type="text" className="input-read" readOnly value={formData.status || "Aktif"} style={{ color: formData.status === "Nonaktif" || formData.status === "Resign" ? "#e74c3c" : "#2fb800", fontWeight: "700" }} />
              )}
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Alamat</label><input name="alamat" type="text" className={isEditing ? "input-edit" : "input-read"} readOnly={!isEditing} value={formData.alamat || ""} onChange={handleInputChange} /></div>
          </div>

          <div className="docs-section">
            <h4 className="docs-title">Dokumen Pendukung</h4>
            <div className="docs-grid">
              {dokumenList.map((label, idx) => (
                <div key={idx} className="doc-box">
                  <span className="doc-label">{label}</span>
                  <div className="doc-card" onClick={() => !isEditing && alert(`Membuka dokumen: ${label}`)}>
                    {isEditing ? (
                      <input type="file" style={{ fontSize: '11px', padding: '10px' }} accept="image/*,.pdf" />
                    ) : (
                      <span className="doc-text">Lihat / Unduh</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-footer">
            {isEditing ? (
              <>
                <button type="button" className="btn-batal" onClick={() => { setIsEditing(false); setFormData(employee); }}>Batal</button>
                <button type="submit" className="btn-simpan">Simpan Perubahan</button>
              </>
            ) : (
              <button type="button" className="btn-batal" onClick={() => navigate(-1)}>Kembali</button>
            )}
          </div>
        </form>

      </main>
    </div>
  );
};

export default DetailKaryawan;