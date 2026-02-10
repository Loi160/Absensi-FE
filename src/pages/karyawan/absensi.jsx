import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./absensi.css"; 
// Tambahkan ArrowLeft di sini
import { ChevronDown, ArrowLeft } from "lucide-react";

// Import assets sesuai struktur folder
import logoAmaga from "../../assets/logoamaga.svg";
import cameraIcon from "../../assets/camera.svg";
// kembaliIcon tidak perlu dipakai lagi di tombol, tapi biarkan importnya kalau mau

const Absensi = () => {
  const [activeTab, setActiveTab] = useState("Masuk");
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}.${minutes}`;
  };

  const formatEndTime = (date) => {
    let endHour = date.getHours() + 1; 
    if (endHour >= 24) endHour -= 24; 
    const hours = String(endHour).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}.${minutes}`;
  };

  const handleAbsen = () => {
    navigate("/dashboard");
  };

  return (
    <div className="main-wrapper">
      <div className="card-container">
        
        {/* --- HEADER SECTION --- */}
        <div className="header-section">
          
          {/* REVISI TOMBOL KEMBALI: Pakai ArrowLeft Lucide biar bersih */}
          <button className="btn-back" onClick={() => navigate("/")}>
            <ArrowLeft size={20} color="black" strokeWidth={2.5} />
          </button>
          
          <div className="logo-center-area">
            <img src={logoAmaga} alt="Logo Amaga" className="logo-img-fix" />
          </div>

          <h2 className="title-form">Form Absensi</h2>
          <p className="subtitle-form">Silahkan Melakukan Absensi</p>
        </div>

        {/* --- FORM SECTION (CARD PUTIH) --- */}
        <div className="form-section">
          <h3 className="form-header-text">Form Absensi</h3>
          
          {/* Tab Navigasi */}
          <div className="input-group">
            <label>Absensi</label>
            <div className="tab-container">
              {["Masuk", "Istirahat", "Pulang"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Cabang */}
          <div className="input-group">
            <label>Cabang</label>
            <div className="select-wrapper">
              <select className="custom-select">
                <option value="">Pilih cabang</option>
                <option value="pusat">Cabang Pusat</option>
              </select>
              <ChevronDown className="select-icon" size={18} />
            </div>
          </div>

          {/* LOGIKA DINAMIS */}
          {activeTab === "Istirahat" ? (
            <div className="time-row">
              <div className="input-group flex-1">
                <label>Jam Mulai</label>
                <div className="time-display">{formatTime(currentTime)}</div>
              </div>
              <div className="input-group flex-1">
                <label>Jam Akhir</label>
                <div className="time-display">{formatEndTime(currentTime)}</div>
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label>Bukti Foto</label>
              <button className="btn-camera-open">
                <img src={cameraIcon} alt="Cam" />
                <span>Buka Camera</span>
              </button>
            </div>
          )}

          <button className="btn-submit-primary" onClick={handleAbsen}>
            {activeTab} Absensi
          </button>
        </div>

        <div className="bottom-gap"></div>
      </div>
    </div>
  );
};

export default Absensi;