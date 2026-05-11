import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";

import "./absensi.css";

import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";
import cameraIcon from "../../assets/camera.svg";

// ============================================================================
// CONFIG: SUPABASE
// ============================================================================

// Menginisialisasi koneksi Supabase untuk penyimpanan foto absensi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// CONSTANTS
// ============================================================================

const ABSENSI_TABS = ["Masuk", "Istirahat", "Pulang"];
const EARTH_RADIUS_IN_METERS = 6371e3;
const BREAK_DURATION_IN_HOURS = 3;

// ============================================================================
// HELPERS: DATE & TIME
// ============================================================================

// Mengambil waktu saat ini dalam format HH:MM:SS
const getCurrentTimeStr = () => {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

// Mengambil tanggal saat ini dalam format lokal Indonesia
const getFormatDateIndo = () => {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ============================================================================
// HELPERS: FILE & LOCATION
// ============================================================================
// HELPERS: IMAGE PROCESSING
// ============================================================================

// Mengecilkan ukuran gambar dan mengompres kualitasnya sebelum diunggah
const compressImage = (dataUrl, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = maxWidth / img.width;
      
      if (scale < 1) {
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Mengembalikan dalam format JPEG dengan kualitas yang ditentukan
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
  });
};

// Mengubah gambar Base64 dari canvas menjadi File agar dapat diunggah

// Mengubah gambar Base64 dari canvas menjadi File agar dapat diunggah
const dataURLtoFile = (dataUrl, filename) => {
  const dataParts = dataUrl.split(",");
  const mimeType = dataParts[0].match(/:(.*?);/)[1];
  const binaryString = atob(dataParts[1]);

  let binaryLength = binaryString.length;
  const bytes = new Uint8Array(binaryLength);

  while (binaryLength--) {
    bytes[binaryLength] = binaryString.charCodeAt(binaryLength);
  }

  return new File([bytes], filename, {
    type: mimeType,
  });
};

// Menghitung jarak dalam meter antara dua titik koordinat GPS menggunakan rumus Haversine
const hitungJarak = (lat1, lon1, lat2, lon2) => {
  const point1 = (lat1 * Math.PI) / 180;
  const point2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const haversineValue =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(point1) *
      Math.cos(point2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return EARTH_RADIUS_IN_METERS * centralAngle;
};

// ============================================================================
// COMPONENT: ABSENSI
// ============================================================================

const Absensi = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Masuk");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakStartTime, setBreakStartTime] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [jarakDariKantor, setJarakDariKantor] = useState(null);
  const [isLocationValid, setIsLocationValid] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ==========================================================================
  // HANDLERS: SESSION
  // ==========================================================================

  // Menghapus data sesi pengguna dan mengarahkan kembali ke halaman login
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session_token");
    navigate("/auth/login");
  };

  // ==========================================================================
  // HANDLERS: CAMERA
  // ==========================================================================

  // Mematikan stream kamera agar perangkat tidak terus menggunakan kamera
  const tutupKamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsCameraOpen(false);
  };

  // Membuka kamera depan setelah lokasi karyawan dinyatakan valid
  const bukaKamera = async () => {
    if (!isLocationValid) {
      alert("Lokasi Anda tidak valid atau akses GPS ditolak! Silakan cek peringatan di layar.");
      cekLokasiKaryawan();
      return;
    }

    setCapturedPhoto(null);
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error akses kamera:", err);
      alert("Gagal mengakses kamera. Izinkan akses kamera di pengaturan browser Anda!");
      setIsCameraOpen(false);
    }
  };

  // Mengambil gambar dari video kamera dan menambahkan watermark informasi absensi
  const ambilFoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const padding = 20;
    const boxHeight = 120;
    const marginX = 25;
    const startY = canvas.height - 80;

    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight);

    const namaTeks = user?.nama || "Unknown User";
    const cabangTeks = `Lokasi: Cabang ${user?.cabangUtama || "-"} (${jarakDariKantor}m)`;
    const waktuTeks = `${getFormatDateIndo()} - ${getCurrentTimeStr()}`;

    context.font = "bold 26px Arial";
    context.fillStyle = "#ffffff";
    context.fillText(namaTeks, marginX, startY);

    context.font = "20px Arial";
    context.fillStyle = "#ffdd57";
    context.fillText(cabangTeks, marginX, startY + 30);

    context.fillStyle = "#ffffff";
    context.fillText(waktuTeks, marginX, startY + 60);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedPhoto(dataUrl);
    tutupKamera();
  };

  // Mengulang proses pengambilan foto dari awal
  const fotoUlang = () => {
    bukaKamera();
  };

  // ==========================================================================
  // HANDLERS: LOCATION
  // ==========================================================================

  // Mengecek lokasi GPS karyawan dan membandingkannya dengan titik koordinat cabang
  const cekLokasiKaryawan = () => {
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung GPS");
      return;
    }

    setLocationError("Sedang mencari lokasi Anda");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        setCurrentLocation({
          lat: userLat,
          lon: userLon,
        });

        const cabangKoordinatStr = user?.titik_koordinat;
        const radiusToleransi = user?.radius_toleransi || 20;

        if (!cabangKoordinatStr) {
          setLocationError("Cabang Anda belum memiliki titik koordinat. Hubungi HRD.");
          setIsLocationValid(false);
          return;
        }

        const [cabangLat, cabangLon] = cabangKoordinatStr
          .split(",")
          .map((coord) => parseFloat(coord.trim()));

        const jarakMeter = Math.round(
          hitungJarak(userLat, userLon, cabangLat, cabangLon)
        );

        setJarakDariKantor(jarakMeter);

        if (jarakMeter <= radiusToleransi) {
          setLocationError("");
          setIsLocationValid(true);
          return;
        }

        setLocationError(
          `Anda berada ${jarakMeter} meter dari cabang. Maksimal toleransi adalah ${radiusToleransi} meter. Harap mendekat ke lokasi!`
        );
        setIsLocationValid(false);
      },
      (err) => {
        setIsLocationValid(false);

        if (err.code === 1) {
          setLocationError("Akses GPS ditolak! Izinkan akses lokasi di browser HP Anda.");
          return;
        }

        setLocationError("Sinyal GPS lemah atau tidak ditemukan.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================================================
  // HANDLERS: BREAK TIME
  // ==========================================================================

  // Memvalidasi jam mulai istirahat agar tidak menggunakan waktu yang sudah berlalu
  const handleStartTimeChange = (event) => {
    const selectedTime = event.target.value;
    const currentTimeStr = getCurrentTimeStr().substring(0, 5);

    if (selectedTime < currentTimeStr) {
      alert("Waktu sudah terlewat! Silakan pilih jam sekarang atau kedepan.");
      setBreakStartTime(currentTimeStr);
      return;
    }

    setBreakStartTime(selectedTime);
  };

  // Menghitung jam selesai istirahat berdasarkan durasi istirahat yang ditentukan
  const getEndTimeStr = () => {
    if (!breakStartTime) {
      return "--:--";
    }

    const [startHour, startMinute] = breakStartTime.split(":").map(Number);
    let endHour = startHour + BREAK_DURATION_IN_HOURS;

    if (endHour >= 24) {
      endHour -= 24;
    }

    return `${String(endHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
  };

  // ==========================================================================
  // API: UPLOAD FOTO
  // ==========================================================================

  // Mengunggah foto absensi ke Cloudinary dan mengembalikan public URL
  const uploadFotoKeCloudinary = async () => {
    if (!capturedPhoto) {
      return null;
    }

    try {
      // 1. Kompres gambar terlebih dahulu (dari ~3MB jadi ~50KB)
      const compressedPhoto = await compressImage(capturedPhoto);

      // 2. Persiapkan form data untuk Cloudinary
      const formData = new FormData();
      formData.append("file", compressedPhoto);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "foto_absensi");

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      
      // 3. Upload ke Cloudinary API
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Gagal upload ke Cloudinary");
      }

      // Mengembalikan URL foto yang sudah di-upload
      return data.secure_url;
    } catch (error) {
      console.error("Error upload foto Cloudinary:", error);
      throw new Error("Gagal mengunggah foto ke CDN");
    }
  };

  // Alias untuk kompatibilitas dengan fungsi yang sudah ada
  const uploadFotoKeSupabase = uploadFotoKeCloudinary;

  // ==========================================================================
  // HANDLERS: ABSENSI
  // ==========================================================================

  // Memvalidasi data absensi, mengunggah foto jika diperlukan, lalu mengirim payload ke backend
  const handleAbsen = async () => {
    if (!user) {
      alert("Sesi anda telah habis. Silahkan login kembali.");
      return navigate("/auth/login");
    }

    if (activeTab !== "Istirahat") {
      if (!isLocationValid) {
        alert("Lokasi GPS Anda di luar batas toleransi! Silakan mendekat ke area absen.");
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
        tipe_absen: activeTab,
        waktu: getCurrentTimeStr(),
        foto: urlFoto,
        waktu_istirahat_mulai:
          activeTab === "Istirahat" ? `${breakStartTime}:00` : null,
        waktu_istirahat_selesai:
          activeTab === "Istirahat" ? `${getEndTimeStr()}:00` : null,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/absensi`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/karyawan/dashboard");
        return;
      }

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("session_token");
        alert(data.message || "Session tidak valid. Silakan login ulang.");
        navigate("/auth/login");
        return;
      }

      alert(`Gagal: ${data.message}`);
    } catch (error) {
      console.error("Error absensi:", error);
      alert(error.message || "Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Memperbarui jam real-time setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Membersihkan stream kamera saat komponen ditutup atau halaman berpindah
  useEffect(() => {
    return () => tutupKamera();
  }, []);

  // Mengecek ulang lokasi setiap tab berubah, kecuali pada tab Istirahat
  useEffect(() => {
    if (activeTab !== "Istirahat") {
      cekLokasiKaryawan();
    }
  }, [activeTab]);

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const isPhotoRequired = activeTab !== "Istirahat";
  const isSubmitDisabled =
    loading ||
    (isPhotoRequired && !isLocationValid) ||
    (isPhotoRequired && isCameraOpen);

  const locationStatusStyle = {
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: isLocationValid ? "#eaf4d1" : "#ffebee",
    color: isLocationValid ? "#2fb800" : "#d32f2f",
    border: `1px solid ${isLocationValid ? "#2fb800" : "#ef5350"}`,
  };

  const cameraPreviewStyle = {
    position: "relative",
    width: "100%",
    backgroundColor: "#000",
    borderRadius: "10px",
    overflow: "hidden",
  };

  const videoStyle = {
    width: "100%",
    maxHeight: "350px",
    objectFit: "cover",
    display: "block",
  };

  const cameraActionWrapperStyle = {
    position: "absolute",
    bottom: "0",
    width: "100%",
    padding: "15px",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  };

  const cancelCameraButtonStyle = {
    padding: "10px 20px",
    background: "#ff1744",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const captureButtonStyle = {
    padding: "10px 20px",
    background: "#2fb800",
    color: "white",
    border: "none",
    borderRadius: "30px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  };

  const capturedPhotoWrapperStyle = {
    position: "relative",
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    border: "2px solid #2fb800",
  };

  const capturedPhotoStyle = {
    width: "100%",
    display: "block",
  };

  const retakePhotoButtonStyle = {
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
  };

  const refreshGpsButtonStyle = {
    background: "none",
    border: "none",
    color: "#2fb800",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  };

  const photoLabelStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const disabledTimeDisplayStyle = {
    backgroundColor: "#eee",
    color: "#888",
  };

  const breakStartInputStyle = {
    cursor: "pointer",
    fontFamily: "Inter",
  };

  const openCameraButtonStyle = {
    opacity: isLocationValid ? 1 : 0.5,
    cursor: isLocationValid ? "pointer" : "not-allowed",
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="main-wrapper">
      <div className="card-container">
        {/* Header utama halaman absensi */}
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
              {ABSENSI_TABS.map((tab) => (
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
                <label>Jam Mulai</label>

                <input
                  type="time"
                  className="time-display"
                  value={breakStartTime}
                  onChange={handleStartTimeChange}
                  min={getCurrentTimeStr().substring(0, 5)}
                  style={breakStartInputStyle}
                />
              </div>

              <div className="input-group flex-1">
                <label>Jam Selesai</label>

                <div
                  className="time-display"
                  style={disabledTimeDisplayStyle}
                >
                  {getEndTimeStr()}
                </div>
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label style={photoLabelStyle}>
                <span>Bukti Foto Wajah ({activeTab})</span>

                <button
                  onClick={cekLokasiKaryawan}
                  style={refreshGpsButtonStyle}
                >
                  Refresh GPS
                </button>
              </label>

              {locationError && (
                <div style={locationStatusStyle}>
                  {locationError}
                </div>
              )}

              {isCameraOpen ? (
                <div style={cameraPreviewStyle}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={videoStyle}
                  />

                  <div style={cameraActionWrapperStyle}>
                    <button
                      onClick={tutupKamera}
                      style={cancelCameraButtonStyle}
                    >
                      Batal
                    </button>

                    <button
                      onClick={ambilFoto}
                      style={captureButtonStyle}
                    >
                      Ambil Foto
                    </button>
                  </div>
                </div>
              ) : capturedPhoto ? (
                <div style={capturedPhotoWrapperStyle}>
                  <img
                    src={capturedPhoto}
                    alt="Hasil Absen"
                    style={capturedPhotoStyle}
                  />

                  <button
                    onClick={fotoUlang}
                    style={retakePhotoButtonStyle}
                  >
                    Ambil Ulang Foto
                  </button>
                </div>
              ) : (
                <button
                  className="btn-camera-open"
                  onClick={bukaKamera}
                  disabled={!isLocationValid}
                  style={openCameraButtonStyle}
                >
                  <img src={cameraIcon} alt="Cam" />
                  <span>Buka Kamera Depan</span>
                </button>
              )}

              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          )}

          <button
            className="btn-submit-primary"
            onClick={handleAbsen}
            disabled={isSubmitDisabled}
          >
            {loading ? "Menyimpan Data" : `Simpan Absen ${activeTab}`}
          </button>
        </div>

        <div className="bottom-gap"></div>
      </div>
    </div>
  );
};

export default Absensi;