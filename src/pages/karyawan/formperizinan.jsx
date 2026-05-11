import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";

import "./formperizinan.css";

import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";
import cameraIcon from "../../assets/camera.svg";

// ============================================================================
// CONFIG: SUPABASE
// ============================================================================

// Menginisialisasi koneksi Supabase untuk menyimpan file bukti perizinan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FILE_SIZE_IN_MB = 2;
const MAX_FILE_SIZE_IN_BYTES = MAX_FILE_SIZE_IN_MB * 1024 * 1024;

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

// ============================================================================
// HELPERS: DATE
// ============================================================================

// Mengambil tanggal hari ini dalam format YYYY-MM-DD untuk batas minimum input tanggal
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

// ============================================================================
// COMPONENT: FORM PERIZINAN
// ============================================================================

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

  // ==========================================================================
  // HANDLERS: FILE
  // ==========================================================================

  // Membuka input file tersembunyi melalui tombol upload
  const handleBukaFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Memvalidasi file bukti agar ukuran file tidak melebihi batas maksimal
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_IN_BYTES) {
      alert("Ukuran file terlalu besar! Maksimal 2MB.");
      event.target.value = null;
      return;
    }

    setFileBukti(selectedFile);
    setFileName(selectedFile.name);
  };

  // ==========================================================================
  // API: UPLOAD FILE
  // ==========================================================================

  // Mengunggah file bukti ke Supabase Storage dan mengembalikan public URL
  const uploadBuktiKeSupabase = async () => {
    if (!fileBukti) {
      return null;
    }

    try {
      const fileExtension = fileBukti.name.split(".").pop();
      const safeFileName = `${user.nik}_bukti_${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("bukti_perizinan")
        .upload(safeFileName, fileBukti);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("bukti_perizinan")
        .getPublicUrl(safeFileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error upload file:", error);

      throw new Error(
        "Gagal mengunggah bukti ke Supabase. Pastikan bucket 'bukti_perizinan' sudah dibuat dan memiliki Policy INSERT."
      );
    }
  };

  // ==========================================================================
  // HANDLERS: FORM
  // ==========================================================================

  // Mengganti tab form dan mereset state yang hanya relevan untuk tab sebelumnya
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTanggalMulai("");
    setFileBukti(null);
    setFileName("");
  };

  // Menyusun payload sesuai kategori perizinan yang sedang aktif
  const buildPayload = (formData, uploadedProofUrl) => {
    const payload = {
      kategori: activeTab,
    };

    if (activeTab === "Izin") {
      payload.jenis_izin = formData.jenis_izin;
      payload.keterangan = formData.keterangan;
      payload.tanggal_mulai = formData.tanggal_mulai;
      payload.tanggal_selesai = formData.tanggal_selesai;
      payload.bukti_foto = uploadedProofUrl;

      return payload;
    }

    if (activeTab === "Cuti") {
      payload.jenis_izin = formData.jenis_izin;
      payload.tanggal_mulai = formData.tanggal_mulai;
      payload.tanggal_selesai = formData.tanggal_selesai;
      payload.keterangan = formData.keterangan;

      return payload;
    }

    if (activeTab === "FIMTK") {
      payload.jenis_izin = formData.jenis_izin;
      payload.tanggal_mulai = formData.tanggal;
      payload.tanggal_selesai = formData.tanggal;
      payload.jam_mulai = formData.jam_mulai;
      payload.jam_selesai = formData.jam_selesai;
      payload.keperluan = formData.keperluan;
      payload.kendaraan = formData.kendaraan;
      payload.keterangan = formData.alasan;
    }

    return payload;
  };

  // Memvalidasi data, mengunggah bukti jika diperlukan, lalu mengirim pengajuan ke backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      alert("Sesi login berakhir. Silahkan login kembali.");
      return;
    }

    setLoading(true);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      let urlBukti = null;

      if (activeTab === "Izin" && fileBukti) {
        urlBukti = await uploadBuktiKeSupabase();
      }

      const payload = buildPayload(data, urlBukti);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/perizinan`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Pengajuan Berhasil Dikirim!");
        navigate("/karyawan/riwayat");
        return;
      }

      alert(`Gagal: ${result.message}${result.detail ? `\nDetail: ${result.detail}` : ""}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const readOnlyInputStyle = {
    backgroundColor: "#eee",
  };

  const hiddenFileInputStyle = {
    display: "none",
  };

  const selectedFileWrapperStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#eaf4d1",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #8dae12",
  };

  const selectedFileNameStyle = {
    fontSize: "12px",
    color: "#2fb800",
    fontWeight: "bold",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const changeFileButtonStyle = {
    background: "#fff",
    border: "1px solid #2fb800",
    color: "#2fb800",
    padding: "5px 10px",
    borderRadius: "5px",
    fontSize: "11px",
    cursor: "pointer",
  };

  const uploadButtonStyle = {
    cursor: "pointer",
    opacity: 1,
  };

  const cameraIconStyle = {
    width: "20px",
  };

  const fileHintStyle = {
    fontSize: "11px",
    color: "#888",
    marginTop: "5px",
    display: "block",
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="fp-wrapper">
      <div className="fp-container">
        {/* Header halaman form perizinan */}
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

          <h2 className="fp-title">
            {currentTabInfo.title}
          </h2>

          <p className="fp-subtitle">
            {currentTabInfo.subtitle}
          </p>
        </div>

        <div className="fp-form-card">
          <div className="fp-form-header-wrapper">
            <button
              className="fp-btn-back-desktop desktop-only"
              onClick={() => navigate("/karyawan/dashboard")}
            >
              <ArrowLeft size={24} color="#333" strokeWidth={2.5} />
            </button>

            <h3 className="fp-card-title">
              {currentTabInfo.title}
            </h3>
          </div>

          <div className="fp-input-group">
            <label className="fp-label">
              Jenis Izin
            </label>

            <div className="fp-tab-container">
              {Object.keys(TAB_CONTENT).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`fp-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => handleTabChange(tab)}
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
                  <label className="fp-label">
                    Nama
                  </label>

                  <input
                    type="text"
                    className="fp-input"
                    value={user?.nama || ""}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                </div>

                <div className="fp-input-group">
                  <label className="fp-label">
                    Cabang
                  </label>

                  <input
                    type="text"
                    className="fp-input"
                    value={user?.cabangUtama || "-"}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                </div>

                <div className="fp-input-group">
                  <label className="fp-label">
                    Perizinan
                  </label>

                  <div className="fp-select-wrapper">
                    <select
                      name="jenis_izin"
                      className="fp-select"
                      required
                    >
                      <option value="">
                        Pilih Izin
                      </option>
                      <option value="Sakit">
                        Sakit
                      </option>
                      <option value="Acara Pribadi">
                        Acara Pribadi
                      </option>
                      <option value="Lainnya">
                        Lainnya
                      </option>
                    </select>

                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>

                <div className="fp-input-group">
                  <label className="fp-label">
                    Keterangan
                  </label>

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
                    <label className="fp-label">
                      Tanggal Awal
                    </label>

                    <input
                      name="tanggal_mulai"
                      type="date"
                      className="fp-input"
                      required
                      min={getTodayDate()}
                      onChange={(event) => setTanggalMulai(event.target.value)}
                    />
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Tanggal Akhir
                    </label>

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
                  <label className="fp-label">
                    Bukti Foto (Opsional)
                  </label>

                  <input
                    type="file"
                    accept="image/*, .pdf"
                    ref={fileInputRef}
                    style={hiddenFileInputStyle}
                    onChange={handleFileChange}
                  />

                  {fileName ? (
                    <div style={selectedFileWrapperStyle}>
                      <span style={selectedFileNameStyle}>
                        {fileName}
                      </span>

                      <button
                        type="button"
                        onClick={handleBukaFile}
                        style={changeFileButtonStyle}
                      >
                        Ganti File
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-camera-open"
                      type="button"
                      onClick={handleBukaFile}
                      style={uploadButtonStyle}
                    >
                      <img
                        src={cameraIcon}
                        alt="Cam"
                        style={cameraIconStyle}
                      />

                      <span>
                        Upload Foto/Dokumen
                      </span>
                    </button>
                  )}

                  <small style={fileHintStyle}>
                    Format: JPG/PNG/PDF (Max 2MB)
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn-submit-green"
                  disabled={loading}
                >
                  {loading ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </>
            )}

            {activeTab === "Cuti" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">
                      Nama
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.nama || ""}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Cabang
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.cabangUtama || "-"}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>
                </div>

                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">
                      Jabatan
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.jabatan || "-"}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Divisi
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.divisi || "-"}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>
                </div>

                <div className="fp-input-group">
                  <label className="fp-label">
                    Perizinan Cuti
                  </label>

                  <div className="fp-select-wrapper">
                    <select
                      name="jenis_izin"
                      className="fp-select"
                      required
                    >
                      <option value="">
                        Pilih tipe cuti
                      </option>
                      <option value="Cuti Tahunan">
                        Cuti Tahunan
                      </option>
                      <option value="Cuti Khusus">
                        Cuti Khusus
                      </option>
                    </select>

                    <ChevronDown className="fp-select-icon" size={16} />
                  </div>
                </div>

                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">
                      Tanggal Awal Cuti
                    </label>

                    <input
                      name="tanggal_mulai"
                      type="date"
                      className="fp-input"
                      required
                      min={getTodayDate()}
                      onChange={(event) => setTanggalMulai(event.target.value)}
                    />
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Tanggal Akhir Cuti
                    </label>

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
                  <label className="fp-label">
                    Keterangan
                  </label>

                  <textarea
                    name="keterangan"
                    className="fp-textarea"
                    placeholder="Jelaskan keperluan cuti"
                    rows={3}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-submit-green"
                  disabled={loading}
                >
                  {loading ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </>
            )}

            {activeTab === "FIMTK" && (
              <>
                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">
                      Nama
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.nama || ""}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Cabang
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.cabangUtama || "-"}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>
                </div>

                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">
                      Jabatan
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.jabatan || "-"}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Divisi
                    </label>

                    <input
                      type="text"
                      className="fp-input"
                      value={user?.divisi || "-"}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </div>
                </div>

                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">
                      Izin MTK
                    </label>

                    <div className="fp-select-wrapper">
                      <select
                        name="jenis_izin"
                        className="fp-select"
                        required
                      >
                        <option value="">
                          Pilih Izin
                        </option>
                        <option value="Keluar Kantor">
                          Keluar Kantor
                        </option>
                        <option value="Pulang Cepat">
                          Pulang Cepat
                        </option>
                      </select>

                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Tanggal
                    </label>

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
                    <label className="fp-label">
                      Jam Keluar
                    </label>

                    <input
                      name="jam_mulai"
                      type="time"
                      className="fp-input"
                      required
                    />
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Jam Kembali
                    </label>

                    <input
                      name="jam_selesai"
                      type="time"
                      className="fp-input"
                      required
                    />
                  </div>
                </div>

                <div className="fp-input-group fp-row-2">
                  <div className="fp-col">
                    <label className="fp-label">
                      Keperluan
                    </label>

                    <div className="fp-select-wrapper">
                      <select
                        name="keperluan"
                        className="fp-select"
                        required
                      >
                        <option value="">
                          Pilih
                        </option>
                        <option value="Kantor">
                          Urusan Kantor
                        </option>
                        <option value="Pribadi">
                          Urusan Pribadi
                        </option>
                      </select>

                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>

                  <div className="fp-col">
                    <label className="fp-label">
                      Kendaraan
                    </label>

                    <div className="fp-select-wrapper">
                      <select
                        name="kendaraan"
                        className="fp-select"
                        required
                      >
                        <option value="">
                          Pilih Kendaraan
                        </option>
                        <option value="Kantor">
                          Kendaraan Kantor
                        </option>
                        <option value="Pribadi">
                          Kendaraan Pribadi
                        </option>
                      </select>

                      <ChevronDown className="fp-select-icon" size={16} />
                    </div>
                  </div>
                </div>

                <div className="fp-input-group">
                  <label className="fp-label">
                    Alasan Detail
                  </label>

                  <textarea
                    name="alasan"
                    className="fp-textarea"
                    placeholder="Jelaskan alasan detail"
                    rows={3}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-submit-green"
                  disabled={loading}
                >
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