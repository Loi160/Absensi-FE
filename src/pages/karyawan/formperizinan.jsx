import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createClient } from "@supabase/supabase-js";
import "./formperizinan.css";
import { ChevronDown, ArrowLeft } from "lucide-react";

import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";
import cameraIcon from "../../assets/camera.svg";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const TAB_CONTENT = {
  Izin: {
    title: "Form Perizinan",
    subtitle: "Silahkan Melakukan Perizinan",
  },
  Cuti: {
    title: "Form Cuti",
    subtitle: "Silahkan Melakukan Perizinan Cuti",
  },
  FIMTK: {
    title: "Form FIMTK",
    subtitle: "Silahkan Melakukan Perizinan Meninggalkan Tempat Kerja",
  },
};

const FormPerizinan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("Izin");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [loading, setLoading] = useState(false);

  const [fileBukti, setFileBukti] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const currentTabInfo = TAB_CONTENT[activeTab];

  const handleBukaFile = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        e.target.value = null;
        return;
      }
      setFileBukti(file);
      setFileName(file.name);
    }
  };

  const uploadBuktiKeSupabase = async () => {
    if (!fileBukti) return null;
    try {
      const fileExt = fileBukti.name.split(".").pop();
      const safeName = `${user.nik}_bukti_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("bukti_perizinan")
        .upload(safeName, fileBukti);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("bukti_perizinan")
        .getPublicUrl(safeName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error upload file:", error);
      throw new Error(
        "Gagal mengunggah bukti ke Supabase. Pastikan bucket 'bukti_perizinan' sudah dibuat dan memiliki Policy INSERT."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Sesi login berakhir. Silahkan login kembali.");

    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      let urlBukti = null;
      if (activeTab === "Izin" && fileBukti) {
        urlBukti = await uploadBuktiKeSupabase();
      }

      let payload = {
        user_id: user.id,
        kategori: activeTab,
        status_approval: "Pending",
      };

      if (activeTab === "Izin") {
        payload.jenis_izin = data.jenis_izin;
        payload.keterangan = data.keterangan;
        payload.tanggal_mulai = data.tanggal_mulai;
        payload.tanggal_selesai = data.tanggal_selesai;
        payload.bukti_foto = urlBukti;
      } else if (activeTab === "Cuti") {
        payload.jenis_izin = data.jenis_izin;
        payload.tanggal_mulai = data.tanggal_mulai;
        payload.tanggal_selesai = data.tanggal_selesai;
        payload.keterangan = data.keterangan;
      } else if (activeTab === "FIMTK") {
        payload.jenis_izin = data.jenis_izin;
        payload.tanggal_mulai = data.tanggal;
        payload.tanggal_selesai = data.tanggal;
        payload.jam_mulai = data.jam_mulai;
        payload.jam_selesai = data.jam_selesai;
        payload.keperluan = data.keperluan;
        payload.kendaraan = data.kendaraan;
        payload.keterangan = data.alasan;
      }

      const response = await fetch(import.meta.env.VITE_API_URL + "/api/perizinan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Pengajuan Berhasil Dikirim!");
        navigate("/karyawan/riwayat");
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-container">
        <div className="fp-header">
          <button
            className="fp-btn-back mobile-only"
            type="button"
            onClick={() => navigate("/karyawan/dashboard")}
          >
            <ArrowLeft size={24} color="white" />
          </button>
          <div className="fp-sidebar-logo-desktop desktop-only">
            <img src={logoPersegi} alt="Amaga Corp" />
          </div>
          <div className="fp-logo-center-area">
            <img
              src={logoAmaga}
              alt="Logo Amaga"
              className="fp-img-circle-content mobile-only"
            />
            <img
              src={profileImg}
              alt="Profile User"
              className="fp-img-circle-content desktop-only"
            />
          </div>
          <h2 className="fp-title">{currentTabInfo.title}</h2>
          <p className="fp-subtitle">{currentTabInfo.subtitle}</p>
        </div>

        <div className="fp-form-card">
          <div className="fp-form-header-wrapper">
            <button
              className="fp-btn-back-desktop desktop-only"
              onClick={() => navigate("/karyawan/dashboard")}
            >
              <ArrowLeft size={24} color="#333" strokeWidth={2.5} />
            </button>
            <h3 className="fp-card-title">{currentTabInfo.title}</h3>
          </div>

          <div className="fp-input-group">
            <label className="fp-label">Jenis Izin</label>
            <div className="fp-tab-container">
              {Object.keys(TAB_CONTENT).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`fp-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setTanggalMulai("");
                    setFileBukti(null);
                    setFileName("");
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === "Izin" && (
              <>
                <div className="fp-input-group">
                  <label className="fp-label">Nama</label>
                  <input
                    type="text"
                    className="fp-input"
                    value={user?.nama || ""}
                    readOnly
                    style={{ backgroundColor: "#eee" }}
                  />
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Cabang</label>
                  <input
                    type="text"
                    className="fp-input"
                    value={user?.cabangUtama || "-"}
                    readOnly
                    style={{ backgroundColor: "#eee" }}
                  />
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
                  <textarea
                    name="keterangan"
                    className="fp-textarea"
                    placeholder="Keterangan sakit atau acara..."
                    rows={3}
                    required
                  />
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Awal</label>
                    <input
                      name="tanggal_mulai"
                      type="date"
                      className="fp-input"
                      required
                      min={getTodayDate()}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                    />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Akhir</label>
                    <input
                      name="tanggal_selesai"
                      type="date"
                      className="fp-input"
                      required
                      min={tanggalMulai || getTodayDate()}
                    />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Bukti Foto (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*, .pdf"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  {fileName ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#eaf4d1",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #8dae12",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#2fb800",
                          fontWeight: "bold",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        ✅ {fileName}
                      </span>
                      <button
                        type="button"
                        onClick={handleBukaFile}
                        style={{
                          background: "#fff",
                          border: "1px solid #2fb800",
                          color: "#2fb800",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Ganti File
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-camera-open"
                      type="button"
                      onClick={handleBukaFile}
                      style={{ cursor: "pointer", opacity: 1 }}
                    >
                      <img src={cameraIcon} alt="Cam" style={{ width: "20px" }} />
                      <span>Upload Foto/Dokumen</span>
                    </button>
                  )}
                  <small style={{ fontSize: "11px", color: "#888", marginTop: "5px", display: "block" }}>
                    Format: JPG/PNG/PDF (Max 2MB)
                  </small>
                </div>
                <button type="submit" className="btn-submit-green" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </>
            )}

            {activeTab === "Cuti" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Nama</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.nama || ""}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Cabang</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.cabangUtama || "-"}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jabatan</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.jabatan || "-"}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Divisi</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.divisi || "-"}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Perizinan Cuti</label>
                  <div className="fp-select-wrapper">
                    <select name="jenis_izin" className="fp-select" required>
                      <option value="">Pilih tipe cuti</option>
                      <option value="Cuti Tahunan">Cuti Tahunan</option>
                      <option value="Cuti Khusus">Cuti Khusus</option>
                    </select>
                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Awal Cuti</label>
                    <input
                      name="tanggal_mulai"
                      type="date"
                      className="fp-input"
                      required
                      min={getTodayDate()}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                    />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal Akhir Cuti</label>
                    <input
                      name="tanggal_selesai"
                      type="date"
                      className="fp-input"
                      required
                      min={tanggalMulai || getTodayDate()}
                    />
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Keterangan</label>
                  <textarea
                    name="keterangan"
                    className="fp-textarea"
                    placeholder="Jelaskan keperluan cuti"
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" className="btn-submit-green" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </>
            )}

            {activeTab === "FIMTK" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Nama</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.nama || ""}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Cabang</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.cabangUtama || "-"}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jabatan</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.jabatan || "-"}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Divisi</label>
                    <input
                      type="text"
                      className="fp-input"
                      value={user?.divisi || "-"}
                      readOnly
                      style={{ backgroundColor: "#eee" }}
                    />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Izin MTK</label>
                    <div className="fp-select-wrapper">
                      <select name="jenis_izin" className="fp-select" required>
                        <option value="">Pilih Izin</option>
                        <option value="Keluar Kantor">Keluar Kantor</option>
                        <option value="Pulang Cepat">Pulang Cepat</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Tanggal</label>
                    <input
                      name="tanggal"
                      type="date"
                      className="fp-input"
                      required
                      min={getTodayDate()}
                    />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Jam Keluar</label>
                    <input name="jam_mulai" type="time" className="fp-input" required />
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Jam Kembali</label>
                    <input name="jam_selesai" type="time" className="fp-input" required />
                  </div>
                </div>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">Keperluan</label>
                    <div className="fp-select-wrapper">
                      <select name="keperluan" className="fp-select" required>
                        <option value="">Pilih</option>
                        <option value="Kantor">Urusan Kantor</option>
                        <option value="Pribadi">Urusan Pribadi</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                  <div className="fp-col">
                    <label className="fp-label">Kendaraan</label>
                    <div className="fp-select-wrapper">
                      <select name="kendaraan" className="fp-select" required>
                        <option value="">Pilih Kendaraan</option>
                        <option value="Kantor">Kendaraan Kantor</option>
                        <option value="Pribadi">Kendaraan Pribadi</option>
                      </select>
                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                </div>
                <div className="fp-input-group">
                  <label className="fp-label">Alasan Detail</label>
                  <textarea
                    name="alasan"
                    className="fp-textarea"
                    placeholder="Jelaskan alasan detail"
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" className="btn-submit-green" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormPerizinan;