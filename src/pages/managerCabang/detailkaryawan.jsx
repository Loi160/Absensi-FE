import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Mengambil CSS langsung dari folder HRD agar layout tetap sama persis
import "../hrd/datakaryawan.css"; 

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg"; 
import iconLaporan from "../../assets/laporan.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const DetailKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(employee || {});
  const [showPassword, setShowPassword] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const cabangUtama = storedUser.cabangUtama || "Cabang Utama";
  const subCabang = Array.isArray(storedUser.subCabang) ? storedUser.subCabang : [];
  const opsiCabangManager = [cabangUtama, ...subCabang].filter(Boolean);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    alert("Perubahan berhasil disimpan!");
    setIsEditing(false); 
  };

  if (!employee) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Data tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="btn-batal">Kembali</button>
      </div>
    );
  }

  // DATA DOKUMEN LENGKAP (7 ITEM)
  const dokumenList = ["Foto Diri", "Foto KTP", "KK (Kartu Keluarga)", "SKCK", "SIM", "Sertifikat Pendukung", "Dokumen Tambahan"];

  return (
    <div className="hrd-container">
      {/* ================= SIDEBAR MANAGER CABANG ================= */}
      <aside className="sidebar">
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate("/managerCabang/dashboard")}>
            <div className="menu-left">
                <img src={iconDashboard} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          <div className="menu-item active" onClick={() => navigate("/managerCabang/datakaryawan")}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>
          
          <div className="menu-item" onClick={() => navigate("/managerCabang/perizinan")}>
            <div className="menu-left">
                <img src={iconPerizinan} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Perizinan</span>
            </div>
          </div>
          
          <div className="menu-item" onClick={() => navigate("/managerCabang/laporan")}>
            <div className="menu-left">
                <img src={iconLaporan} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Laporan</span>
            </div>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        <div className="page-header">
            {/* UPDATE STRUKTUR: Meletakkan tombol Edit di bawah kanan area teks, analog dengan Kelola Cabang */}
            <h1>Detail Karyawan</h1>
            <p>Informasi detail data diri karyawan</p>
            
            <div className="action-row-karyawan">
                {!isEditing && (
                    <button className="btn-edit-data" onClick={() => setIsEditing(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit Data
                    </button>
                )}
            </div>
        </div>

        {/* CARD PUTIH (SCROLLABLE) */}
        <div className="detail-card">
          <form onSubmit={handleSaveEdit}>
            <div className="form-grid-3">
                <div className="form-group"><label>Nama</label><input name="nama" type="text" className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.nama} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Tanggal Masuk</label><input name="tanggalMasuk" type={isEditing ? "date" : "text"} className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.tanggalMasuk || "-"} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Jabatan</label><input name="jabatan" type="text" className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.jabatan} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Divisi</label><input name="divisi" type="text" className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.divisi || "-"} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>NIK (Username)</label><input name="nik" type="text" className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.nik} onChange={handleInputChange} required /></div>
                
                <div className="form-group">
                    <label>Password</label>
                    <div className="password-wrapper">
                        <input name="password" type={showPassword ? "text" : "password"} className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.password} onChange={handleInputChange} required />
                        <button type="button" className="btn-eye" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                        </button>
                    </div>
                </div>

                <div className="form-group"><label>Tempat Lahir</label><input name="tempatLahir" type="text" className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.tempatLahir} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Tanggal Lahir</label><input name="tanggalLahir" type={isEditing ? "date" : "text"} className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.tanggalLahir} onChange={handleInputChange} required /></div>
                
                <div className="form-group">
                    <label>Jenis Kelamin</label>
                    {isEditing ? (
                        <select name="jenisKelamin" className="input-gray" value={formData.jenisKelamin} onChange={handleInputChange} required>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    ) : (
                        <input type="text" className="input-white" readOnly value={formData.jenisKelamin || "-"} />
                    )}
                </div>
                
                <div className="form-group">
                    <label>Cabang Penempatan</label>
                    {isEditing ? (
                        <select name="cabang" className="input-gray" value={formData.cabang} onChange={handleInputChange} required>
                            {opsiCabangManager.map((cbg, idx) => <option key={idx} value={cbg}>{cbg}</option>)}
                        </select>
                    ) : (
                        <input type="text" className="input-white" readOnly value={formData.cabang || "-"} />
                    )}
                </div>

                <div className="form-group">
                    <label>Status Karyawan</label>
                    {isEditing ? (
                        <select name="status" className="input-gray" value={formData.status} onChange={handleInputChange} required>
                            <option value="Aktif">Aktif</option>
                            <option value="Resign">Resign</option>
                        </select>
                    ) : (
                        <input type="text" className="input-white" readOnly value={formData.status || "Aktif"} style={{ color: formData.status === "Resign" ? "red" : "green", fontWeight: "bold" }} />
                    )}
                </div>

                <div className="form-group" style={{ gridColumn: "span 3" }}><label>Alamat</label><input name="alamat" type="text" className={isEditing ? "input-gray" : "input-white"} readOnly={!isEditing} value={formData.alamat} onChange={handleInputChange} required /></div>
            </div>

            <div className="docs-section">
                <h4 className="docs-title" style={{ marginTop: '20px' }}>Dokumen Pendukung {isEditing && <span style={{fontSize:'11px', color:'#888', fontWeight:'normal'}}>(Opsional, Maks 2MB)</span>}</h4>
                <hr className="modal-divider" />
                <div className="upload-grid-3">
                {dokumenList.map((label, idx) => (
                    <div key={idx} className="upload-box">
                    <p className="upload-label">{label}</p>
                    {isEditing ? (
                        <input type="file" className="input-gray" style={{fontSize: '12px'}} accept="image/*,.pdf" onChange={(e) => { if(e.target.files[0]?.size > 2*1024*1024){ alert('Maksimal 2 MB'); e.target.value=''; } }} />
                    ) : (
                        <div className="upload-content-white" onClick={() => alert(`Membuka dokumen: ${label}`)} style={{ cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "#8dae12", fontWeight: "bold" }}>Lihat / Unduh</span>
                        </div>
                    )}
                    </div>
                ))}
                </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', paddingBottom: '15px', gap: '15px' }}>
                {isEditing ? (
                    <>
                        <button type="button" className="btn-batal" onClick={() => { setIsEditing(false); setFormData(employee); }}>Batal</button>
                        <button type="submit" className="btn-simpan" style={{ width: '200px' }}>Simpan Perubahan</button>
                    </>
                ) : (
                    <button type="button" className="btn-batal" onClick={() => navigate(-1)} style={{ width: '150px' }}>Kembali</button>
                )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DetailKaryawanManagerCabang;