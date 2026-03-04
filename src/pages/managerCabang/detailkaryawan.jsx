import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Mengambil CSS langsung dari folder HRD agar layout tetap sama persis
import "../hrd/datakaryawan.css"; 

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg"; // Icon khusus Manager Cabang
import iconLaporan from "../../assets/laporan.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const DetailKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
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
  const dokumenList = [
    "Foto Diri", 
    "Foto KTP", 
    "KK (Kartu Keluarga)", 
    "SKCK", 
    "SIM", 
    "Sertifikat Pendukung", 
    "Dokumen Tambahan"
  ];

  return (
    <div className="hrd-container">
      {/* ================= SIDEBAR MANAGER CABANG ================= */}
      <aside className="sidebar">
        <div className="logo-area">
          {/* Tag h2 dihapus agar logo AMAGACORP tidak numpuk dua kali */}
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate("/managerCabang/dashboard")}>
            <div className="menu-left">
                <img src={iconDashboard} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          {/* Menu Data Karyawan Active karena Detail Karyawan adalah bagian dari sini */}
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

      {/* ================= MAIN CONTENT (SAMA PERSIS DENGAN HRD) ================= */}
      <main className="main-content">
        <div className="page-header">
          <h1>Detail Karyawan</h1>
          <p>Informasi detail data diri karyawan</p>
        </div>

        {/* CARD PUTIH (SCROLLABLE) */}
        <div className="detail-card">
          
          {/* GRID 3 KOLOM */}
          <div className="form-grid-3">
            <div className="form-group"><label>Nama</label><input type="text" className="input-white" readOnly value={employee.nama} /></div>
            <div className="form-group"><label>Tanggal Masuk</label><input type="text" className="input-white" readOnly value={employee.tanggalMasuk || "-"} /></div>
            <div className="form-group"><label>Jabatan</label><input type="text" className="input-white" readOnly value={employee.jabatan} /></div>
            <div className="form-group"><label>Divisi</label><input type="text" className="input-white" readOnly value={employee.divisi || "-"} /></div>
            <div className="form-group"><label>Nik (Username)</label><input type="text" className="input-white" readOnly value={employee.nik} /></div>
            <div className="form-group"><label>Password</label><input type="text" className="input-white" readOnly value={employee.password} /></div>
            <div className="form-group"><label>Tempat Lahir</label><input type="text" className="input-white" readOnly value={employee.tempatLahir} /></div>
            <div className="form-group"><label>Tanggal Lahir</label><input type="text" className="input-white" readOnly value={employee.tanggalLahir} /></div>
            <div className="form-group"><label>Jenis Kelamin</label><input type="text" className="input-white" readOnly value={employee.jenisKelamin || "-"} /></div>
            <div className="form-group"><label>Cabang</label><input type="text" className="input-white" readOnly value={`Cabang ${employee.cabang}` || "-"} /></div>
            <div className="form-group" style={{ gridColumn: "span 2" }}><label>Alamat</label><input type="text" className="input-white" readOnly value={employee.alamat} /></div>
          </div>

          {/* DOKUMEN PENDUKUNG */}
          <div className="docs-section">
            <h4 className="docs-title" style={{ marginTop: '20px' }}>Dokumen Pendukung</h4>
            <hr className="modal-divider" />
            
            <div className="upload-grid-3">
              {dokumenList.map((label, idx) => (
                <div key={idx} className="upload-box">
                  <p className="upload-label">{label}</p>
                  <div 
                    className="upload-content-white" 
                    onClick={() => alert(`Membuka dokumen: ${label}`)}
                    style={{ cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <span style={{ fontSize: "12px", color: "#8dae12", fontWeight: "bold" }}>Lihat / Unduh</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOMBOL KEMBALI DI BAWAH KANAN */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn-batal" onClick={() => navigate(-1)} style={{ width: '150px' }}>
                Kembali
             </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DetailKaryawanManagerCabang;