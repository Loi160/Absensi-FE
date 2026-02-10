import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./formperizinan.css"; // Import CSS baru
import { ChevronDown, ArrowLeft } from "lucide-react";

// Mengambil logo dari assets (naik 2 folder: pages -> src -> assets)
import logoAmaga from "../../assets/logoamaga.svg";

const FormPerizinan = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Izin"); // Default Tab: Izin

  // Ubah Judul Header sesuai Tab
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

  return (
    <div className="fp-wrapper">
      <div className="fp-container">
        
        {/* --- HEADER --- */}
        <div className="fp-header">
          {/* Tombol Kembali ke Dashboard */}
          <button className="fp-btn-back" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={20} color="black" strokeWidth={2.5} />
          </button>
          
          {/* Logo dalam Lingkaran */}
          <div className="fp-logo-container">
            <img src={logoAmaga} alt="Logo Amaga" className="fp-logo-img" />
          </div>

          <h2 className="fp-title">{getTitle()}</h2>
          <p className="fp-subtitle">{getSubtitle()}</p>
        </div>

        {/* --- CARD FORM --- */}
        <div className="fp-form-card">
          <h3 className="fp-card-title">Form Absensi</h3> 

          {/* TAB BUTTONS */}
          <div className="fp-input-group">
            <label className="fp-label">Absensi</label>
            <div className="fp-tab-container">
              {["Izin", "Cuti", "FIMTK"].map((tab) => (
                <button
                  key={tab}
                  className={`fp-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* --- LOGIKA ISI FORM --- */}
          
          {/* 1. TAMPILAN TAB: IZIN */}
          {activeTab === "Izin" && (
            <>
              {/* Nama (Full Width) */}
              <div className="fp-input-group">
                <label className="fp-label">Nama</label>
                <input type="text" className="fp-input" placeholder="Pilih cabang" />
              </div>

              {/* Cabang (Full Width) */}
              <div className="fp-input-group">
                <label className="fp-label">Cabang</label>
                <div className="fp-select-wrapper">
                  <select className="fp-select">
                    <option value="">Pilih cabang</option>
                  </select>
                  <ChevronDown className="fp-select-icon" size={16} />
                </div>
              </div>

              {/* Perizinan (Full Width) */}
              <div className="fp-input-group">
                <label className="fp-label">Perizinan</label>
                <div className="fp-select-wrapper">
                  <select className="fp-select">
                    <option value="">Pilih cabang</option>
                  </select>
                  <ChevronDown className="fp-select-icon" size={16} />
                </div>
              </div>
            </>
          )}

          {/* 2. TAMPILAN TAB: CUTI */}
          {activeTab === "Cuti" && (
            <>
              {/* Baris 1: Nama & Cabang (2 Kolom) */}
              <div className="fp-input-group fp-row-2">
                <div className="fp-col">
                  <label className="fp-label">Nama</label>
                  <input type="text" className="fp-input" placeholder="Pilih cabang" />
                </div>
                <div className="fp-col">
                  <label className="fp-label">Cabang</label>
                  <div className="fp-select-wrapper">
                    <select className="fp-select">
                      <option value="">Pilih cabang</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
              </div>

              {/* Baris 2: Jabatan & Divisi (2 Kolom) */}
              <div className="fp-input-group fp-row-2">
                <div className="fp-col">
                  <label className="fp-label">Jabatan</label>
                  <input type="text" className="fp-input" placeholder="Jabatan" />
                </div>
                <div className="fp-col">
                  <label className="fp-label">Divisi</label>
                  <input type="text" className="fp-input" placeholder="Divisi" />
                </div>
              </div>

              {/* Baris 3: Perizinan (Full Width) */}
              <div className="fp-input-group">
                <label className="fp-label">Perizinan</label>
                <div className="fp-select-wrapper">
                  <select className="fp-select">
                    <option value="">C thn / C khs</option>
                  </select>
                  <ChevronDown className="fp-select-icon" size={16} />
                </div>
              </div>
            </>
          )}

          {/* 3. TAMPILAN TAB: FIMTK */}
          {activeTab === "FIMTK" && (
            <>
              {/* Baris 1: Nama & Cabang (2 Kolom) */}
              <div className="fp-input-group fp-row-2">
                <div className="fp-col">
                  <label className="fp-label">Nama</label>
                  <input type="text" className="fp-input" placeholder="Pilih cabang" />
                </div>
                <div className="fp-col">
                  <label className="fp-label">Cabang</label>
                  <div className="fp-select-wrapper">
                    <select className="fp-select">
                      <option value="">Pilih cabang</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
              </div>

              {/* Baris 2: Jabatan & Divisi (2 Kolom) */}
              <div className="fp-input-group fp-row-2">
                <div className="fp-col">
                  <label className="fp-label">Jabatan</label>
                  <input type="text" className="fp-input" placeholder="Jabatan" />
                </div>
                <div className="fp-col">
                  <label className="fp-label">Divisi</label>
                  <input type="text" className="fp-input" placeholder="Divisi" />
                </div>
              </div>

              {/* Baris 3: Izin MTK & Tanggal (2 Kolom) */}
              <div className="fp-input-group fp-row-2">
                <div className="fp-col">
                  <label className="fp-label">Izin MTK</label>
                  <div className="fp-select-wrapper">
                    <select className="fp-select">
                      <option value="">Izin</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
                <div className="fp-col">
                  <label className="fp-label">Tanggal</label>
                  <div className="fp-select-wrapper">
                    <select className="fp-select">
                      <option value="">dd/mm/yyyy</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
        
        <div className="fp-bottom-spacer"></div>
      </div>
    </div>
  );
};

export default FormPerizinan;