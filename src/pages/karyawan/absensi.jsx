import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createClient } from "@supabase/supabase-js";
import "./absensi.css";
import { ChevronDown, ArrowLeft } from "lucide-react";

// Import assets
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";
import cameraIcon from "../../assets/camera.svg";

// =========================================================================
// MENGGUNAKAN KEY DARI FILE .env (LEBIH AMAN)
// =========================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Absensi = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Masuk");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakStartTime, setBreakStartTime] = useState("");
  const [loading, setLoading] = useState(false);

  // State Kamera & Watermark
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // State GPS (Koordinat & Validasi Lokasi)
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [jarakDariKantor, setJarakDariKantor] = useState(null);
  const [isLocationValid, setIsLocationValid] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => tutupKamera();
  }, []);

  // Meminta Izin Lokasi Otomatis Saat Halaman Dibuka
  useEffect(() => {
    if (activeTab !== "Istirahat") {
      cekLokasiKaryawan();
    }
  }, [activeTab]);

  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  };

  const getFormatDateIndo = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("id-ID", options);
  };

  const handleStartTimeChange = (e) => {
    const selectedTime = e.target.value;
    const nowStr = getCurrentTimeStr().substring(0, 5);
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

  // =========================================================================
  // SISTEM LOKASI (GPS GEOFENCING)
  // =========================================================================

  const hitungJarak = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const cekLokasiKaryawan = () => {
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung GPS.");
      return;
    }

    setLocationError("Sedang mencari lokasi Anda...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        setCurrentLocation({ lat: userLat, lon: userLon });

        const cabangKoordinatStr = user?.titik_koordinat;
        const radiusToleransi = user?.radius_toleransi || 20;

        if (!cabangKoordinatStr) {
          setLocationError(
            "Cabang Anda belum memiliki titik koordinat. Hubungi HRD.",
          );
          setIsLocationValid(false);
          return;
        }

        const [cabangLat, cabangLon] = cabangKoordinatStr
          .split(",")
          .map((coord) => parseFloat(coord.trim()));

        const jarakMeter = Math.round(
          hitungJarak(userLat, userLon, cabangLat, cabangLon),
        );
        setJarakDariKantor(jarakMeter);

        if (jarakMeter <= radiusToleransi) {
          setLocationError("");
          setIsLocationValid(true);
        } else {
          setLocationError(
            `Anda berada ${jarakMeter} meter dari cabang. Maksimal toleransi adalah ${radiusToleransi} meter. Harap mendekat ke lokasi!`,
          );
          setIsLocationValid(false);
        }
      },
      (err) => {
        setIsLocationValid(false);
        if (err.code === 1)
          setLocationError(
            "Akses GPS ditolak! Tolong izinkan akses lokasi di browser HP Anda.",
          );
        else setLocationError("Sinyal GPS lemah atau tidak ditemukan.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // =========================================================================
  // SISTEM KAMERA LIVE WEBRTC & WATERMARK
  // =========================================================================

  const bukaKamera = async () => {
    if (!isLocationValid) {
      alert(
        "Lokasi Anda tidak valid atau akses GPS ditolak! Silakan cek peringatan di layar.",
      );
      cekLokasiKaryawan();
      return;
    }

    setCapturedPhoto(null);
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error akses kamera:", err);
      alert(
        "Gagal mengakses kamera. Tolong izinkan akses kamera di pengaturan browser Anda!",
      );
      setIsCameraOpen(false);
    }
  };

  const tutupKamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const ambilFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const padding = 20;
    const boxHeight = 120;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight);

    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#ffffff";

    const marginX = 25;
    const startY = canvas.height - 80;

    const namaTeks = user?.nama || "Unknown User";
    const cabangTeks = `Lokasi: Cabang ${user?.cabangUtama || "-"} (${jarakDariKantor}m)`;
    const waktuTeks = `${getFormatDateIndo()} - ${getCurrentTimeStr()}`;

    ctx.fillText(namaTeks, marginX, startY);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffdd57";
    ctx.fillText(cabangTeks, marginX, startY + 30);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(waktuTeks, marginX, startY + 60);

    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(dataURL);
    tutupKamera();
  };

  const fotoUlang = () => {
    bukaKamera();
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const uploadFotoKeSupabase = async () => {
    if (!capturedPhoto) return null;
    try {
      const fileToUpload = dataURLtoFile(
        capturedPhoto,
        `${user.nik}_absen_${activeTab.toLowerCase()}_${Date.now()}.jpg`,
      );

      const { error: uploadError } = await supabase.storage
        .from("foto_absensi")
        .upload(fileToUpload.name, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("foto_absensi")
        .getPublicUrl(fileToUpload.name);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error upload foto:", error);
      throw new Error("Gagal mengunggah foto ke Supabase Storage. Cek Policy.");
    }
  };

  // =========================================================================
  // SIMPAN ABSENSI KE BACKEND
  // =========================================================================
  const handleAbsen = async () => {
    if (!user) {
      alert("Sesi anda telah habis. Silahkan login kembali.");
      return navigate("/auth/login");
    }

    if (activeTab !== "Istirahat") {
      if (!isLocationValid) {
        alert(
          "Lokasi GPS Anda di luar batas toleransi! Silakan mendekat ke area absen.",
        );
        return;
      }
      if (!capturedPhoto) {
        alert(`Mohon ambil foto bukti absen ${activeTab} terlebih dahulu!`);
        return;
      }
    }

    if (activeTab === "Istirahat" && !breakStartTime) {
      alert("Mohon tentukan jam mulai istirahat!");
      return;
    }

    setLoading(true);
    try {
      let urlFoto = null;
      if (activeTab !== "Istirahat") {
        urlFoto = await uploadFotoKeSupabase();
      }

      const payload = {
        user_id: user.id,
        tipe_absen: activeTab,
        waktu: getCurrentTimeStr(),
        foto: urlFoto,
        waktu_istirahat_mulai:
          activeTab === "Istirahat" ? `${breakStartTime}:00` : null,
        waktu_istirahat_selesai:
          activeTab === "Istirahat" ? `${getEndTimeStr()}:00` : null,
      };

      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/absensi",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/karyawan/dashboard");
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (error) {
      console.error("Error absensi:", error);
      alert(error.message || "Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="card-container">
        <div className="header-section">
          <button
            className="btn-back mobile-only"
            onClick={() => navigate("/karyawan/dashboard")}
          >
            <ArrowLeft size={24} color="white" />
          </button>

          <div className="sidebar-logo-desktop desktop-only">
            <img src={logoPersegi} alt="Amaga Corp" />
          </div>

          <div className="logo-center-area">
            <img
              src={logoAmaga}
              alt="Logo Amaga"
              className="img-circle-content mobile-only"
            />
            <img
              src={profileImg}
              alt="Profile User"
              className="img-circle-content desktop-only"
            />
          </div>

          <h2 className="title-form">Absensi</h2>
          <p className="subtitle-form">Silahkan Melakukan Absensi</p>

          <button
            className="btn-logout-desktop desktop-only"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>

        <div className="form-section">
          <div className="form-header-wrapper">
            <button
              className="btn-back-desktop desktop-only"
              onClick={() => navigate("/karyawan/dashboard")}
            >
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
                  onClick={() => {
                    setActiveTab(tab);
                    setCapturedPhoto(null);
                    tutupKamera();
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Cabang Penempatan</label>
            <div className="select-wrapper">
              <select className="custom-select" disabled>
                <option value="">{user?.cabangUtama || "Pilih cabang"}</option>
              </select>
              <ChevronDown className="select-icon" size={18} />
            </div>
          </div>

          {activeTab === "Istirahat" ? (
            <div className="time-row">
              <div className="input-group flex-1">
                <label>Jam Mulai Istirahat</label>
                <input
                  type="time"
                  className="time-display"
                  value={breakStartTime}
                  onChange={handleStartTimeChange}
                  min={getCurrentTimeStr().substring(0, 5)}
                  style={{ cursor: "pointer", fontFamily: "Inter" }}
                />
              </div>
              <div className="input-group flex-1">
                <label>Jam Akhir Istirahat</label>
                <div
                  className="time-display"
                  style={{ backgroundColor: "#eee", color: "#888" }}
                >
                  {getEndTimeStr()}
                </div>
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Bukti Foto Wajah ({activeTab})</span>
                <button
                  onClick={cekLokasiKaryawan}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2fb800",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  🔄 Refresh GPS
                </button>
              </label>

              {locationError && (
                <div
                  style={{
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: isLocationValid ? "#eaf4d1" : "#ffebee",
                    color: isLocationValid ? "#2fb800" : "#d32f2f",
                    border: `1px solid ${isLocationValid ? "#2fb800" : "#ef5350"}`,
                  }}
                >
                  {locationError}
                </div>
              )}

              {isCameraOpen ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    backgroundColor: "#000",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: "100%",
                      maxHeight: "350px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      width: "100%",
                      padding: "15px",
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                    }}
                  >
                    <button
                      onClick={tutupKamera}
                      style={{
                        padding: "10px 20px",
                        background: "#ff1744",
                        color: "white",
                        border: "none",
                        borderRadius: "30px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={ambilFoto}
                      style={{
                        padding: "10px 20px",
                        background: "#2fb800",
                        color: "white",
                        border: "none",
                        borderRadius: "30px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      }}
                    >
                      📸 Jepret
                    </button>
                  </div>
                </div>
              ) : capturedPhoto ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "2px solid #2fb800",
                  }}
                >
                  <img
                    src={capturedPhoto}
                    alt="Hasil Absen"
                    style={{ width: "100%", display: "block" }}
                  />
                  <button
                    onClick={fotoUlang}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      padding: "8px 15px",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    🔄 Ulangi Foto
                  </button>
                </div>
              ) : (
                <button
                  className="btn-camera-open"
                  onClick={bukaKamera}
                  disabled={!isLocationValid}
                  style={{
                    opacity: isLocationValid ? 1 : 0.5,
                    cursor: isLocationValid ? "pointer" : "not-allowed",
                  }}
                >
                  <img src={cameraIcon} alt="Cam" />
                  <span>Nyalakan Kamera Depan</span>
                </button>
              )}

              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          )}

          <button
            className="btn-submit-primary"
            onClick={handleAbsen}
            disabled={
              loading ||
              !isLocationValid ||
              (activeTab !== "Istirahat" && isCameraOpen)
            }
          >
            {loading ? "Menyimpan Data..." : `Simpan Absen ${activeTab}`}
          </button>
        </div>
        <div className="bottom-gap"></div>
      </div>
    </div>
  );
};

export default Absensi;
