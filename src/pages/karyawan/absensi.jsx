import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
import { createClient } from "@supabase/supabase-js";
import "./absensi.css";
import { ChevronDown, ArrowLeft } from "lucide-react";

import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";
import cameraIcon from "../../assets/camera.svg";

// Setup koneksi ke database Supabase untuk penyimpanan foto absensi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rumus Haversine untuk menghitung jarak lurus (meter) antara 2 titik koordinat GPS
const hitungJarak = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radius bumi dalam meter
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

// Mengubah format gambar dari Base64 (canvas) menjadi format File agar bisa di-upload
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

// Mengambil waktu saat ini dalam format JJ:MM:DD untuk pencatatan absen
const getCurrentTimeStr = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
};

// Mengambil tanggal saat ini dengan format lokal Indonesia (contoh: Senin, 1 Januari 2024)
const getFormatDateIndo = () => {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Absensi = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State untuk mengontrol tab aktif (Masuk/Pulang/Istirahat) dan jam real-time
  const [activeTab, setActiveTab] = useState("Masuk");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakStartTime, setBreakStartTime] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk mengontrol kamera HP/Laptop dan menyimpan hasil jepretan foto
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // State untuk melacak posisi GPS karyawan dan memvalidasinya dengan lokasi kantor
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [jarakDariKantor, setJarakDariKantor] = useState(null);
  const [isLocationValid, setIsLocationValid] = useState(false);

  // Referensi elemen DOM untuk memutar stream video kamera dan menggambar foto (canvas)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Efek samping: Update jam digital di layar setiap 1 detik
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Efek samping: Matikan akses kamera secara paksa jika komponen ditutup/pindah halaman
  useEffect(() => {
    return () => tutupKamera();
  }, []);

  // Efek samping: Cek lokasi GPS karyawan setiap kali pindah tab (kecuali tab Istirahat)
  useEffect(() => {
    if (activeTab !== "Istirahat") {
      cekLokasiKaryawan();
    }
  }, [activeTab]);

  // Validasi input waktu mulai istirahat: Tidak boleh memilih jam yang sudah berlalu
  const handleStartTimeChange = (e) => {
    const selectedTime = e.target.value;
    const nowStr = getCurrentTimeStr().substring(0, 5); // Ambil format Jam:Menit saja
    
    if (selectedTime < nowStr) {
      alert("Waktu sudah terlewat! Silakan pilih jam sekarang atau kedepan.");
      setBreakStartTime(nowStr); // Reset paksa ke jam sekarang
    } else {
      setBreakStartTime(selectedTime);
    }
  };

  // Menghitung otomatis jam selesai istirahat (otomatis ditambah 3 jam dari jam mulai)
  const getEndTimeStr = () => {
    if (!breakStartTime) return "--:--";
    const [hh, mm] = breakStartTime.split(":").map(Number);
    let endHh = hh + 3;
    
    // Mencegah format jam melebihi 24 (misal: 25:00 diubah menjadi 01:00)
    if (endHh >= 24) endHh -= 24;
    return `${String(endHh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  // Menghapus data sesi pengguna saat ini dan mengembalikannya ke halaman login
  const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("session_token");
  navigate("/auth/login");
};

  // Meminta akses GPS dari browser/HP untuk mendeteksi posisi karyawan secara akurat
  const cekLokasiKaryawan = () => {
    // Memastikan perangkat atau browser mendukung fitur Geolokasi
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung GPS");
      return;
    }

    setLocationError("Sedang mencari lokasi Anda");

    // Mengambil titik koordinat (Latitude & Longitude) karyawan saat ini
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        setCurrentLocation({ lat: userLat, lon: userLon });

        // Mengambil titik koordinat pusat cabang dan radius toleransi dari data user
        const cabangKoordinatStr = user?.titik_koordinat;
        const radiusToleransi = user?.radius_toleransi || 20;

        // Cegah proses absen jika HRD belum mengatur titik koordinat untuk cabang tersebut
        if (!cabangKoordinatStr) {
          setLocationError("Cabang Anda belum memiliki titik koordinat. Hubungi HRD.");
          setIsLocationValid(false);
          return;
        }

        // Memecah koordinat cabang dan menghitung jaraknya (dalam meter) dengan koordinat HP karyawan
        const [cabangLat, cabangLon] = cabangKoordinatStr.split(",").map((coord) => parseFloat(coord.trim()));
        const jarakMeter = Math.round(hitungJarak(userLat, userLon, cabangLat, cabangLon));
        
        setJarakDariKantor(jarakMeter);

        // Jika jarak masih masuk toleransi, izinkan absen. Jika tidak, blokir dan tampilkan pesan error
        if (jarakMeter <= radiusToleransi) {
          setLocationError("");
          setIsLocationValid(true);
        } else {
          setLocationError(`Anda berada ${jarakMeter} meter dari cabang. Maksimal toleransi adalah ${radiusToleransi} meter. Harap mendekat ke lokasi!`);
          setIsLocationValid(false);
        }
      },
      // Penanganan error jika akses GPS ditolak, HP tidak ada sinyal, atau timeout
      (err) => {
        setIsLocationValid(false);
        if (err.code === 1) {
          setLocationError("Akses GPS ditolak! Izinkan akses lokasi di browser HP Anda.");
        } else {
          setLocationError("Sinyal GPS lemah atau tidak ditemukan.");
        }
      },
      // Konfigurasi GPS: Paksa minta akurasi tinggi dan jangan pakai cache lokasi lama
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fungsi untuk menyalakan kamera depan HP/Laptop
  const bukaKamera = async () => {
    // Tolak buka kamera kalau karyawan masih berada di luar area kantor
    if (!isLocationValid) {
      alert("Lokasi Anda tidak valid atau akses GPS ditolak! Silakan cek peringatan di layar.");
      cekLokasiKaryawan();
      return;
    }

    setCapturedPhoto(null);
    setIsCameraOpen(true);

    try {
      // Meminta akses khusus kamera depan (facingMode: "user") tanpa audio
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
      alert("Gagal mengakses kamera. Izinkan akses kamera di pengaturan browser Anda!");
      setIsCameraOpen(false);
    }
  };

  // Mematikan aliran (stream) data dari kamera agar hardware tidak terus menyala
  const tutupKamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Menangkap *frame* video saat ini dan menempelkan teks (watermark) ke atas fotonya
  const ambilFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Sesuaikan ukuran canvas dengan resolusi asli video dari kamera
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Menggambar foto jepretan kamera ke atas canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Membuat kotak hitam transparan di bagian bawah foto untuk alas watermark
    const padding = 20;
    const boxHeight = 120;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight);

    // Konfigurasi font untuk watermark nama karyawan
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#ffffff";

    const marginX = 25;
    const startY = canvas.height - 80;

    const namaTeks = user?.nama || "Unknown User";
    const cabangTeks = `Lokasi: Cabang ${user?.cabangUtama || "-"} (${jarakDariKantor}m)`;
    const waktuTeks = `${getFormatDateIndo()} - ${getCurrentTimeStr()}`;

    // Menuliskan Nama, Lokasi Cabang (beserta jarak GPS), dan Jam Real-time ke atas foto
    ctx.fillText(namaTeks, marginX, startY);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffdd57"; // Warna kuning untuk teks lokasi
    ctx.fillText(cabangTeks, marginX, startY + 30);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(waktuTeks, marginX, startY + 60);

    // Menyimpan hasil akhir (foto + watermark) dalam format gambar Base64
    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(dataURL);
    tutupKamera();
  };

  // Reset foto lama dan nyalakan kamera kembali
  const fotoUlang = () => {
    bukaKamera();
  };

  // Mengubah Base64 jadi File, lalu mengirimkannya ke Storage Supabase
  const uploadFotoKeSupabase = async () => {
    if (!capturedPhoto) return null;
    try {
      const fileToUpload = dataURLtoFile(
        capturedPhoto,
        `${user.nik}_absen_${activeTab.toLowerCase()}_${Date.now()}.jpg`
      );

      const { error: uploadError } = await supabase.storage
        .from("foto_absensi")
        .upload(fileToUpload.name, fileToUpload);

      if (uploadError) throw uploadError;

      // Mengambil link publik agar foto bisa dilihat lewat browser
      const { data: publicUrlData } = supabase.storage
        .from("foto_absensi")
        .getPublicUrl(fileToUpload.name);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error upload foto:", error);
      throw new Error("Gagal mengunggah foto");
    }
  };

  // Proses validasi dan pengiriman data absen (Masuk/Pulang/Istirahat) ke database internal
  const handleAbsen = async () => {
    if (!user) {
      alert("Sesi anda telah habis. Silahkan login kembali.");
      return navigate("/auth/login");
    }

    // Syarat absen Masuk/Pulang: GPS harus valid dan foto sudah diambil
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

    // Syarat absen Istirahat: Karyawan harus menentukan jam mulainya
    if (activeTab === "Istirahat" && !breakStartTime) {
      alert("Mohon tentukan jam mulai istirahat!");
      return;
    }

    setLoading(true);
    try {
      let urlFoto = null;
      // Khusus Masuk dan Pulang, jalankan fungsi upload foto ke Supabase dulu
      if (activeTab !== "Istirahat") {
        urlFoto = await uploadFotoKeSupabase();
      }

      // Menyusun struktur data (payload) absensi yang akan dikirim ke database backend
      const payload = {
  tipe_absen: activeTab,
  waktu: getCurrentTimeStr(),
  foto: urlFoto,
  waktu_istirahat_mulai: activeTab === "Istirahat" ? `${breakStartTime}:00` : null,
  waktu_istirahat_selesai: activeTab === "Istirahat" ? `${getEndTimeStr()}:00` : null,
};

      // Mengirimkan data absen lewat API dan memproses respon berhasil/gagal dari server
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/absensi", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
  alert(data.message);
  navigate("/karyawan/dashboard");
} else {
  if (response.status === 401) {
    localStorage.removeItem("user");
    localStorage.removeItem("session_token");
    alert(data.message || "Session tidak valid. Silakan login ulang.");
    navigate("/auth/login");
    return;
  }

  alert(`Gagal: ${data.message}`);
}
      
    // Menangkap error jika proses upload foto atau koneksi ke server terputus di tengah jalan
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
        
        {/* Bagian header/kepala halaman dengan tombol kembali (khusus tampilan mobile) */}
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
                  style={{ cursor: "pointer", fontFamily: "Inter" }}
                />
              </div>
              <div className="input-group flex-1">
                <label>Jam Selesai</label>
                <div className="time-display" style={{ backgroundColor: "#eee", color: "#888" }}>
                  {getEndTimeStr()}
                </div>
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Bukti Foto Wajah ({activeTab})</span>
                <button
                  onClick={cekLokasiKaryawan}
                  style={{ background: "none", border: "none", color: "#2fb800", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                >
                  Refresh GPS
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
                <div style={{ position: "relative", width: "100%", backgroundColor: "#000", borderRadius: "10px", overflow: "hidden" }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: "350px", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", bottom: "0", width: "100%", padding: "15px", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", gap: "15px" }}>
                    <button onClick={tutupKamera} style={{ padding: "10px 20px", background: "#ff1744", color: "white", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold" }}>Batal</button>
                    <button onClick={ambilFoto} style={{ padding: "10px 20px", background: "#2fb800", color: "white", border: "none", borderRadius: "30px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>Ambil Foto</button>
                  </div>
                </div>
              ) : capturedPhoto ? (
                <div style={{ position: "relative", width: "100%", borderRadius: "10px", overflow: "hidden", border: "2px solid #2fb800" }}>
                  <img src={capturedPhoto} alt="Hasil Absen" style={{ width: "100%", display: "block" }} />
                  <button onClick={fotoUlang} style={{ position: "absolute", top: "10px", right: "10px", padding: "8px 15px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Ambil Ulang Foto</button>
                </div>
              ) : (
                <button
                  className="btn-camera-open"
                  onClick={bukaKamera}
                  disabled={!isLocationValid}
                  style={{ opacity: isLocationValid ? 1 : 0.5, cursor: isLocationValid ? "pointer" : "not-allowed" }}
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
            disabled={
  loading ||
  (activeTab !== "Istirahat" && !isLocationValid) ||
  (activeTab !== "Istirahat" && isCameraOpen)
}
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