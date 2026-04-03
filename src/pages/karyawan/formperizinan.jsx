import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./formperizinan.css"; 
import { ChevronDown, ArrowLeft } from "lucide-react";

// Import assets
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg"; 
import profileImg from "../../assets/profile.svg";
import cameraIcon from "../../assets/camera.svg"; 

const FormPerizinan = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Ambil data user yang sedang login
  const [activeTab, setActiveTab] = useState("Izin"); 
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    if (activeTab === "Izin") return "Form Perizinan";
    if (activeTab === "Cuti") return "Form Cuti";
    if (activeTab === "FIMTK") return "Form FIMTK";
  };

  const getSubtitle = () => {
    if (activeTab === "Izin") return "Silahkan Melakukan Perizinan";
    if (activeTab === "Cuti") return "Silahkan Melakukan Perizinan Cuti";
    if (activeTab === "FIMTK") return "Silahkan Melakukan Perizinan Meninggalkan Tempat Kerja";
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!user) return alert("Sesi login berakhir. Silahkan login kembali.");
    
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Menyusun payload sesuai kolom di tabel 'perizinan' Supabase
    let payload = {
      user_id: user.id,
      kategori: activeTab,
      status_approval: 'Pending'
    };

    if (activeTab === "Izin") {
      payload.jenis_izin = data.jenis_izin;
      payload.keterangan = data.keterangan;
      payload.tanggal_mulai = data.tanggal_mulai;
      payload.tanggal_selesai = data.tanggal_selesai;
    } else if (activeTab === "Cuti") {
      payload.jenis_izin = data.jenis_izin;
      payload.tanggal_mulai = data.tanggal_mulai;
      payload.tanggal_selesai = data.tanggal_selesai;
      payload.keterangan = data.keterangan;
    } else if (activeTab === "FIMTK") {
      payload.jenis_izin = data.jenis_izin;
      payload.tanggal_mulai = data.tanggal; 
      payload.tanggal_selesai = data.tanggal; // FIMTK biasanya 1 hari
      payload.jam_mulai = data.jam_mulai;
      payload.jam_selesai = data.jam_selesai;
      payload.keperluan = data.keperluan;
      payload.kendaraan = data.kendaraan;
      payload.keterangan = data.alasan;
    }

    try {
      const response = await fetch("http://localhost:3000/api/perizinan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(result.message); 
        // Arahkan ke Riwayat agar user bisa langsung lihat status 'Pending' nya
        navigate("/karyawan/riwayat");
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-container">
        
        {/* HEADER / SIDEBAR */}
        <div className="fp-header">
          <button className="fp-btn-back mobile-only" type="button" onClick={() => navigate("/karyawan/dashboard")}>
            <ArrowLeft size={24} color="white" />
          </button>
          <div className="fp-sidebar-logo-desktop desktop-only">
             <img src={logoPersegi} alt="Amaga Corp" />
          </div>
          <div className="fp-logo-center-area">
            <img src={logoAmaga} alt="Logo Amaga" className="fp-img-circle-content mobile-only" />
            <img src={profileImg} alt="Profile User" className="fp-img-circle-content desktop-only" />
          </div>
          <h2 className="fp-title">{getTitle()}</h2>
          <p className="fp-subtitle">{getSubtitle()}</p>
        </div>

        {/* FORM CONTENT */}
        <div className="fp-form-card">
          
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

          <form onSubmit={handleSubmit}>
            
            {/* IZIN */}
            {activeTab === "Izin" && (
              <>
                <div className="fp-input-group">
                  <label className="fp-label">Nama</label>
                  <input type="text" className="fp-input" value={user?.nama || ""} readOnly style={{backgroundColor: '#eee'}} />
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Cabang</label>
                  <input type="text" className="fp-input" value={user?.cabang || ""} readOnly style={{backgroundColor: '#eee'}} />
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Perizinan</label>
                  <div className="fp-select-wrapper">
                    <select name="jenis_izin" className="fp-select" required>
                      <option value="">Pilih Izin</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Acara Pribadi">Acara Pribadi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Keterangan</label>
                  <textarea name="keterangan" className="fp-textarea" placeholder="Keterangan" rows={3} required />
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Mulai</label>
                    <input name="tanggal_mulai" type="date" className="fp-input" required min={getTodayDate()} onChange={(e) => setTanggalMulai(e.target.value)} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Akhir</label>
                    <input name="tanggal_selesai" type="date" className="fp-input" required min={tanggalMulai || getTodayDate()} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Bukti Foto</label>
                  <button className="btn-camera-open" type="button" disabled title="Upload menyusul">
                    <img src={cameraIcon} alt="Cam" style={{width: "20px"}} />
                    <span>Buka Camera</span>
                  </button>
                </div>
                <button type="submit" className="btn-submit-green" disabled={loading}>{loading ? "Mengirim..." : "Kirim Pengajuan"}</button>
              </>
            )}

            {/* CUTI */}
            {activeTab === "Cuti" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Nama</label>
                    <input type="text" className="fp-input" value={user?.nama || ""} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Cabang</label>
                    <input type="text" className="fp-input" value={user?.cabang || ""} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jabatan</label>
                    <input type="text" className="fp-input" value={user?.jabatan || "-"} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Divisi</label>
                    <input type="text" className="fp-input" value={user?.divisi || "-"} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Perizinan</label>
                  <div className="fp-select-wrapper">
                    <select name="jenis_izin" className="fp-select" required>
                      <option value="">Pilih cuti</option>
                      <option value="Cuti Tahunan">Cuti Tahunan</option>
                      <option value="Cuti Khusus">Cuti Khusus</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Mulai</label>
                    <input name="tanggal_mulai" type="date" className="fp-input" required min={getTodayDate()} onChange={(e) => setTanggalMulai(e.target.value)} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Akhir</label>
                    <input name="tanggal_selesai" type="date" className="fp-input" required min={tanggalMulai || getTodayDate()} />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Keterangan</label>
                  <textarea name="keterangan" className="fp-textarea" placeholder="Keterangan" rows={3} required />
                </div>
                <button type="submit" className="btn-submit-green" disabled={loading}>{loading ? "Mengirim..." : "Kirim Pengajuan"}</button>
              </>
            )}

            {/* FIMTK */}
            {activeTab === "FIMTK" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Nama</label>
                    <input type="text" className="fp-input" value={user?.nama || ""} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Cabang</label>
                    <input type="text" className="fp-input" value={user?.cabang || ""} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jabatan</label>
                    <input type="text" className="fp-input" value={user?.jabatan || "-"} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Divisi</label>
                    <input type="text" className="fp-input" value={user?.divisi || "-"} readOnly style={{backgroundColor: '#eee'}} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Izin MTK</label>
                    <div className="fp-select-wrapper">
                      <select name="jenis_izin" className="fp-select" required>
                        <option value="">Izin</option>
                        <option value="Keluar Kantor">Keluar Kantor</option>
                        <option value="Pulang Cepat">Pulang Cepat</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal</label>
                    <input name="tanggal" type="date" className="fp-input" required min={getTodayDate()} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jam Mulai</label>
                    <input name="jam_mulai" type="time" className="fp-input" required />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Jam Akhir</label>
                    <input name="jam_selesai" type="time" className="fp-input" required />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Keperluan</label>
                    <div className="fp-select-wrapper">
                      <select name="keperluan" className="fp-select" required>
                        <option value="">Keperluan</option>
                        <option value="Kantor">Kantor</option>
                        <option value="Pribadi">Pribadi</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Kendaraan</label>
                    <div className="fp-select-wrapper">
                      <select name="kendaraan" className="fp-select" required>
                        <option value="">Pilih kendaraan</option>
                        <option value="Kantor">Kantor</option>
                        <option value="Pribadi">Pribadi</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Alasan</label>
                  <textarea name="alasan" className="fp-textarea" placeholder="Alasan" rows={3} required />
                </div>
                <button type="submit" className="btn-submit-green" disabled={loading}>{loading ? "Mengirim..." : "Kirim Pengajuan"}</button>
              </>
            )}

          </form> 
        </div>
      </div>
    </div>
  );
};

export default FormPerizinan;