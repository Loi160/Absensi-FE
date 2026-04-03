import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./absensi.css"; 
import { ChevronDown, ArrowLeft } from "lucide-react";

// Import assets
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg"; 
import cameraIcon from "../../assets/camera.svg";

const Absensi = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Masuk");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakStartTime, setBreakStartTime] = useState("");
  const [loading, setLoading] = useState(false);

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
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleStartTimeChange = (e) => {
    const selectedTime = e.target.value;
    const nowStr = getCurrentTimeStr().substring(0, 5); // ambil HH:MM
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // FUNGSI SIMPAN ABSENSI KE DATABASE
  const handleAbsen = async () => {
    if (!user) {
      alert("Sesi anda telah habis. Silahkan login kembali.");
      return navigate("/auth/login");
    }

    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        tipe_absen: activeTab, // "Masuk", "Istirahat", "Pulang"
        waktu: getCurrentTimeStr()
      };

      const response = await fetch("http://localhost:3000/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/karyawan/dashboard");
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (error) {
      console.error("Error absensi:", error);
      alert("Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="card-container">
        
        {/* HEADER / SIDEBAR */}
        <div className="header-section">
          <button className="btn-back mobile-only" onClick={() => navigate("/karyawan/dashboard")}>
            <ArrowLeft size={24} color="white" />
          </button>

          <div className="sidebar-logo-desktop desktop-only">
             <img src={logoPersegi} alt="Amaga Corp" />
          </div>
          
          <div className="logo-center-area">
            <img src={logoAmaga} alt="Logo Amaga" className="img-circle-content mobile-only" />
            <img src={profileImg} alt="Profile User" className="img-circle-content desktop-only" />
          </div>

          <h2 className="title-form">Absensi</h2>
          <p className="subtitle-form">Silahkan Melakukan Absensi</p>

          <button className="btn-logout-desktop desktop-only" onClick={handleLogout}>
             Log Out
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="form-section">
          <div className="form-header-wrapper">
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
              <select className="custom-select" disabled>
                <option value="">{user?.cabang || "Pilih cabang"}</option>
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
                  min={getCurrentTimeStr().substring(0,5)}
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

          <button className="btn-submit-primary" onClick={handleAbsen} disabled={loading}>
            {loading ? "Menyimpan..." : `${activeTab} Absensi`}
          </button>
        </div>
        <div className="bottom-gap"></div>
      </div>
    </div>
  );
};

export default Absensi;