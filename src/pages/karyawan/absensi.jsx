import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./absensi.css"; 
import { ChevronDown, ArrowLeft } from "lucide-react";

// Import assets
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg"; 
import cameraIcon from "../../assets/camera.svg";

const Absensi = () => {
  const [activeTab, setActiveTab] = useState("Masuk");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakStartTime, setBreakStartTime] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeStr = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleStartTimeChange = (e) => {
    const selectedTime = e.target.value;
    const nowStr = getCurrentTimeStr();

    if (selectedTime < nowStr) {
      alert("Waktu sudah terlewat! Silakan pilih jam sekarang atau kedepan.");
      setBreakStartTime(nowStr);
    } else {
      setBreakStartTime(selectedTime);
    }
  };

  const getEndTimeStr = () => {
    if (!breakStartTime) return "--:--";
    const [hh, mm] = breakStartTime.split(":").map(Number);
    let endHh = hh + 3;
    if (endHh >= 24) endHh -= 24;
    return `${String(endHh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const handleAbsen = () => {
    navigate("/karyawan/dashboard");
  };

  return (
    <div className="main-wrapper">
      <div className="card-container">
        
        {/* ================= HEADER / SIDEBAR ================= */}
        <div className="header-section">
          {/* Tombol Back (HANYA MUNCUL DI MOBILE) */}
          <button className="btn-back mobile-only" onClick={() => navigate("/karyawan/dashboard")}>
            {/* UPDATE: Mengubah size menjadi 24 dan color menjadi white agar persis seperti menu Riwayat */}
            <ArrowLeft size={24} color="white" />
          </button>

          {/* Logo Persegi (HANYA MUNCUL DI DESKTOP - POJOK ATAS) */}
          <div className="sidebar-logo-desktop desktop-only">
             <img src={logoPersegi} alt="Amaga Corp" />
          </div>
          
          {/* Area Lingkaran Profil */}
          <div className="logo-center-area">
            <img src={logoAmaga} alt="Logo Amaga" className="img-circle-content mobile-only" />
            <img src={profileImg} alt="Profile User" className="img-circle-content desktop-only" />
          </div>

          <h2 className="title-form">Absensi</h2>
          <p className="subtitle-form">Silahkan Melakukan Absensi</p>

          {/* Tombol Logout (HANYA MUNCUL DI DESKTOP - POJOK BAWAH) */}
          <button className="btn-logout-desktop desktop-only" onClick={() => navigate("/")}>
             Log Out
          </button>
        </div>

        {/* ================= FORM CONTENT ================= */}
        <div className="form-section">
          
          {/* Wrapper Judul agar Tombol Back Desktop sejajar dengan Teks */}
          <div className="form-header-wrapper">
            {/* Tombol Back (HANYA MUNCUL DI DESKTOP) */}
            <button className="btn-back-desktop desktop-only" onClick={() => navigate("/karyawan/dashboard")}>
              <ArrowLeft size={24} color="#333" strokeWidth={2.5} />
            </button>
            <h3 className="form-header-text">Form Absensi</h3>
          </div>
          
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

          {activeTab === "Istirahat" ? (
            <div className="time-row">
              <div className="input-group flex-1">
                <label>Jam Mulai</label>
                <input 
                  type="time" 
                  className="time-display"
                  value={breakStartTime}
                  onChange={handleStartTimeChange}
                  min={getCurrentTimeStr()}
                  style={{ cursor: "pointer", fontFamily: "Inter" }}
                />
              </div>
              <div className="input-group flex-1">
                <label>Jam Akhir</label>
                <div className="time-display">{getEndTimeStr()}</div>
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