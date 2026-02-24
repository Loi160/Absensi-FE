import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./formperizinan.css"; 
import { ChevronDown, ArrowLeft } from "lucide-react";

// Import assets
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg"; // <-- IMPORT INI DIKEMBALIKAN
import profileImg from "../../assets/profile.svg";
import cameraIcon from "../../assets/camera.svg"; 

const FormPerizinan = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Izin"); 
  const [tanggalMulai, setTanggalMulai] = useState("");

  const getTitle = () => {
    if (activeTab === "Izin") return "Form Perizinan";
    if (activeTab === "Cuti") return "Form Cuti";
    if (activeTab === "FIMTK") return "Form FIMTK";
  };

  const getSubtitle = () => {
    if (activeTab === "Izin") return "Silahkan Melakukan Perizinan";
    if (activeTab === "Cuti") return "Silahkan Melakukan Perizinan Cuti";
    if (activeTab === "FIMTK") return "Silahkan Melakukan Perizinan FIMTK";
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleAbsen = (e) => {
    e.preventDefault(); 
    alert(`Data ${activeTab} berhasil dikirim!`); 
    navigate("/karyawan/dashboard");
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-container">
        
        {/* ================= HEADER / SIDEBAR ================= */}
        <div className="fp-header">
          {/* Tombol Back Mobile */}
          <button className="fp-btn-back mobile-only" type="button" onClick={() => navigate("/karyawan/dashboard")}>
            <ArrowLeft size={20} color="black" strokeWidth={2.5} />
          </button>

          {/* Logo Persegi Desktop (Pojok Atas) */}
          <div className="fp-sidebar-logo-desktop desktop-only">
             {/* DI SINI PERBAIKANNYA: Menggunakan logoPersegi, bukan logoAmaga */}
             <img src={logoPersegi} alt="Amaga Corp" />
          </div>
          
          <div className="fp-logo-center-area">
            {/* Tampilan Mobile: Logo Amaga Bulat */}
            <img src={logoAmaga} alt="Logo Amaga" className="fp-img-circle-content mobile-only" />
            
            {/* Tampilan Desktop Sidebar: Foto Profil */}
            <img src={profileImg} alt="Profile User" className="fp-img-circle-content desktop-only" />
          </div>

          <h2 className="fp-title">{getTitle()}</h2>
          <p className="fp-subtitle">{getSubtitle()}</p>

          {/* Tombol Logout Desktop */}
          <button className="fp-btn-logout-desktop desktop-only" onClick={() => navigate("/")}>
             Log Out
          </button>
        </div>

        {/* ================= FORM CONTENT ================= */}
        <div className="fp-form-card">
          
          {/* Header Form Desktop (Sejajar dengan Back Button) */}
          <div className="fp-form-header-wrapper">
            <button className="fp-btn-back-desktop desktop-only" onClick={() => navigate("/karyawan/dashboard")}>
              <ArrowLeft size={24} color="#333" strokeWidth={2.5} />
            </button>
            <h3 className="fp-card-title">{getTitle()}</h3> 
          </div>

          <div className="fp-input-group">
            <label className="fp-label">Jenis Izin</label>
            <div className="fp-tab-container">
              {["Izin", "Cuti", "FIMTK"].map((tab) => (
                <button
                  key={tab}
                  type="button" 
                  className={`fp-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setTanggalMulai(""); 
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAbsen}>
            
            {/* IZIN */}
            {activeTab === "Izin" && (
              <>
                <div className="fp-input-group">
                  <label className="fp-label">Nama</label>
                  <input type="text" className="fp-input" placeholder="Masukkan Nama" required />
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Cabang</label>
                  <div className="fp-select-wrapper">
                    <select className="fp-select" required>
                      <option value="">Pilih cabang</option>
                      <option value="pusat">Cabang Pusat</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Perizinan</label>
                  <div className="fp-select-wrapper">
                    <select className="fp-select" required>
                      <option value="">Pilih Izin</option>
                      <option value="sakit">Sakit</option>
                      <option value="acara">Acara Keluarga</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Keterangan</label>
                  <textarea className="fp-textarea" placeholder="Keterangan" rows={3} required />
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Mulai</label>
                    <input type="date" className="fp-input" required min={getTodayDate()} onChange={(e) => setTanggalMulai(e.target.value)} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Akhir</label>
                    <input type="date" className="fp-input" required min={tanggalMulai || getTodayDate()} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Bukti Foto</label>
                  <button className="btn-camera-open" type="button">
                    <img src={cameraIcon} alt="Cam" style={{width: "20px"}} />
                    <span>Buka Camera</span>
                  </button>
                </div>
                <button type="submit" className="btn-submit-green">Masuk Absensi</button>
              </>
            )}

            {/* CUTI */}
            {activeTab === "Cuti" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Nama</label>
                    <input type="text" className="fp-input" placeholder="Masukkan Nama" required />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Cabang</label>
                    <div className="fp-select-wrapper">
                      <select className="fp-select" required>
                        <option value="">Pilih cabang</option>
                        <option value="pusat">Cabang Pusat</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jabatan</label>
                    <input type="text" className="fp-input" placeholder="Jabatan" required />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Divisi</label>
                    <input type="text" className="fp-input" placeholder="Divisi" required />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Perizinan</label>
                  <div className="fp-select-wrapper">
                    <select className="fp-select" required>
                      <option value="">Pilih cuti</option>
                      <option value="tahunan">Cuti Tahunan</option>
                      <option value="khusus">Cuti Khusus</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Mulai</label>
                    <input type="date" className="fp-input" required min={getTodayDate()} onChange={(e) => setTanggalMulai(e.target.value)} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Akhir</label>
                    <input type="date" className="fp-input" required min={tanggalMulai || getTodayDate()} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Keterangan</label>
                  <textarea className="fp-textarea" placeholder="Keterangan" rows={3} required />
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Nomor Telepon</label>
                  <input type="number" className="fp-input" placeholder="Masukkan Nomor Telepon" required />
                </div>
                <button type="submit" className="btn-submit-green">Masuk Absensi</button>
              </>
            )}

            {/* FIMTK */}
            {activeTab === "FIMTK" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Nama</label>
                    <input type="text" className="fp-input" placeholder="Masukkan Nama" required />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Cabang</label>
                    <div className="fp-select-wrapper">
                      <select className="fp-select" required>
                        <option value="">Pilih cabang</option>
                        <option value="pusat">Cabang Pusat</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jabatan</label>
                    <input type="text" className="fp-input" placeholder="Jabatan" required />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Divisi</label>
                    <input type="text" className="fp-input" placeholder="Divisi" required />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Izin MTK</label>
                    <div className="fp-select-wrapper">
                      <select className="fp-select" required>
                        <option value="">Izin</option>
                        <option value="keluar">Keluar Kantor</option>
                        <option value="pulang">Pulang Cepat</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal</label>
                    <input type="date" className="fp-input" required min={getTodayDate()} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jam Mulai</label>
                    <input type="time" className="fp-input" required />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Jam Akhir</label>
                    <input type="time" className="fp-input" required />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Keperluan</label>
                    <div className="fp-select-wrapper">
                      <select className="fp-select" required>
                        <option value="">Keperluan</option>
                        <option value="kantor">Kantor</option>
                        <option value="pribadi">Pribadi</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Kendaraan</label>
                    <div className="fp-select-wrapper">
                      <select className="fp-select" required>
                        <option value="">Pilih kendaraan</option>
                        <option value="kantor">Kantor</option>
                        <option value="pribadi">Pribadi</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Alasan</label>
                  <textarea className="fp-textarea" placeholder="Alasan" rows={3} required />
                </div>
                <button type="submit" className="btn-submit-green">Masuk Absensi</button>
              </>
            )}

          </form> 
        </div>
      </div>
    </div>
  );
};

export default FormPerizinan;