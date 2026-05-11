import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, X, ZoomIn } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";

import "./riwayat.css";

import perizinanIcon from "../../assets/perizinan.svg";
import lokasiIcon from "../../assets/lokasi.svg";
import kalenderIcon from "../../assets/kalender.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";

// ============================================================================
// HELPERS: FORMAT DATA
// ============================================================================

// Mengubah format tanggal sistem menjadi format lokal Indonesia
const formatDateIndo = (dateString) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (isNaN(date)) {
    return dateString;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Mengambil format jam HH:MM dari string waktu
const getJam = (waktu) => {
  if (!waktu) {
    return "--:--";
  }

  return String(waktu).substring(0, 5);
};

// ============================================================================
// HELPERS: BADGE STATUS
// ============================================================================

// Menentukan class badge berdasarkan status persetujuan HRD
const getBadgeStatusClass = (statusApproval) => {
  if (statusApproval === "Disetujui") {
    return "badge-status-disetujui";
  }

  if (statusApproval === "Ditolak") {
    return "badge-status-ditolak";
  }

  return "badge-status-pending";
};

// Menentukan class badge berdasarkan tipe riwayat dan status kehadiran
const getBadgeTypeClass = (item) => {
  if (item.type === "Absensi") {
    if (item.status === "ALPHA") {
      return "badge-alpha";
    }

    return item.isPartial ? "badge-hadir-partial" : "badge-hadir-full";
  }

  return "badge-izin-kuning";
};

// ============================================================================
// COMPONENT: RIWAYAT
// ============================================================================

const Riwayat = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================================================
  // HANDLERS: SESSION
  // ==========================================================================

  // Menghapus sesi login dan mengarahkan pengguna ke halaman login
  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  // ==========================================================================
  // HELPERS: NORMALIZE DATA
  // ==========================================================================

  // Menyamakan struktur data absensi agar mudah ditampilkan pada daftar riwayat
  const formatAbsensiData = (absensiData) => {
    return absensiData.map((absensi) => {
      const rawDate = absensi.tanggal ? new Date(absensi.tanggal).getTime() : 0;
      const isAlpha = absensi.status_kehadiran === "ALPHA";
      const isPartial =
        !isAlpha && !(absensi.waktu_masuk && absensi.waktu_pulang);

      let noteText = absensi.waktu_pulang
        ? "Absen Selesai"
        : "Belum Absen Pulang";

      if (isAlpha) {
        noteText = "Tidak ada keterangan kehadiran";
      }

      const clockIn = getJam(absensi.waktu_masuk);
      const clockOut = getJam(absensi.waktu_pulang);
      const timeUpdate = isAlpha
        ? "--:--"
        : clockOut !== "--:--"
          ? clockOut
          : clockIn;

      return {
        id: absensi.is_alpha ? absensi.id : `abs_${absensi.id}`,
        realId: absensi.id,
        type: "Absensi",
        status: absensi.status_kehadiran
          ? absensi.status_kehadiran.toUpperCase()
          : "HADIR",
        name: user.nama || "Karyawan",
        nik: user.nik || "-",
        branch: user.cabangUtama || "-",
        date: formatDateIndo(absensi.tanggal),
        rawDate,
        timeUpdate,
        note: noteText,
        isPartial,
        detail: {
          clockIn,
          clockOut,
          photoIn: absensi.foto_masuk || null,
          photoOut: absensi.foto_pulang || null,
        },
      };
    });
  };

  // Menyamakan struktur data perizinan agar konsisten dengan data absensi
  const formatPerizinanData = (perizinanData) => {
    return perizinanData.map((perizinan) => {
      const referenceDate =
        perizinan.created_at || perizinan.tanggal_mulai || new Date();

      const rawDate = new Date(referenceDate).getTime();

      return {
        id: `izin_${perizinan.id}`,
        realId: perizinan.id,
        type: "Perizinan",
        status: perizinan.jenis_izin
          ? perizinan.jenis_izin.toUpperCase()
          : perizinan.kategori
            ? perizinan.kategori.toUpperCase()
            : "IZIN",
        name: user.nama || "Karyawan",
        nik: user.nik || "-",
        branch: user.cabangUtama || "-",
        date: formatDateIndo(referenceDate),
        rawDate,
        timeUpdate: "--:--",
        note:
          perizinan.keterangan ||
          `Pengajuan ${perizinan.kategori || "Perizinan"}`,
        isSpecial: true,
        statusApproval: perizinan.status_approval,
        detail: {
          tipeIzin: perizinan.jenis_izin || perizinan.kategori || "-",
          keterangan: perizinan.keterangan || perizinan.keperluan || "-",
          tglMulai: formatDateIndo(
            perizinan.tanggal_mulai || perizinan.tanggal
          ),
          tglAkhir: formatDateIndo(
            perizinan.tanggal_selesai || perizinan.tanggal
          ),
          buktiFoto: perizinan.bukti_foto || null,
        },
      };
    });
  };

  // ==========================================================================
  // API: RIWAYAT
  // ==========================================================================

  // Mengambil data riwayat absensi dan perizinan dari backend
  const fetchRiwayat = async () => {
    if (!user || !user.id) {
      setErrorMessage("Sesi login tidak valid. Silakan login ulang.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/riwayat/${user.id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          logout();
          navigate("/auth/login");
          return;
        }

        throw new Error(errorData.message || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      const absensiData = data.absensi || [];
      const perizinanData = data.perizinan || [];

      const formattedAbsensi = formatAbsensiData(absensiData);
      const formattedPerizinan = formatPerizinanData(perizinanData);

      const combinedHistory = [
        ...formattedAbsensi,
        ...formattedPerizinan,
      ].sort((firstItem, secondItem) => {
        const firstDate = firstItem.rawDate || 0;
        const secondDate = secondItem.rawDate || 0;

        return secondDate - firstDate;
      });

      setHistoryList(combinedHistory);
    } catch (error) {
      console.error("Gagal fetch riwayat:", error);
      setErrorMessage(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // HANDLERS: UI
  // ==========================================================================

  // Membuka modal detail riwayat berdasarkan kartu yang dipilih
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Membuka preview gambar jika URL foto tersedia dan belum dihapus otomatis
  const handlePhotoPreview = (photoUrl) => {
    if (!photoUrl || photoUrl.includes("Dihapus Otomatis")) {
      return;
    }

    setPreviewImage(photoUrl);
  };

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Memuat ulang riwayat saat halaman dibuka atau data user berubah
  useEffect(() => {
    fetchRiwayat();
  }, [user]);

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const messageBoxStyle = {
    textAlign: "center",
    padding: "20px",
    color: "red",
    fontWeight: "bold",
    background: "#fee2e2",
    borderRadius: "10px",
  };

  const loadingTextStyle = {
    textAlign: "center",
    padding: "20px",
    color: "#fcfbfb",
  };

  const badgeWrapperStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  };

  const proofSectionStyle = {
    marginTop: "15px",
  };

  const singlePhotoGridStyle = {
    gridTemplateColumns: "1fr",
  };

  const permissionPhotoItemStyle = {
    height: "150px",
  };

  const permissionProofImageStyle = {
    objectFit: "contain",
    backgroundColor: "#f5f5f5",
  };

  const noProofTextStyle = {
    color: "#aaa",
    fontStyle: "italic",
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="rw-wrapper">
      <div className="rw-container">
        <div className="rw-mobile-bg desktop-none"></div>

        <div className="rw-header-section">
          <div className="rw-header-mobile-content mobile-only">
            <button
              className="rw-btn-back"
              onClick={() => navigate("/karyawan/dashboard")}
            >
              <ArrowLeft size={24} color="white" />
            </button>

            <div className="rw-header-text-group">
              <h2 className="rw-title-text">
                Riwayat
              </h2>

              <p className="rw-subtitle-text">
                Riwayat absensi dan perizinan Anda
              </p>
            </div>
          </div>

          <div className="rw-sidebar-logo-desktop desktop-only">
            <img src={logoPersegi} alt="Amaga Corp" />
          </div>

          <div className="rw-logo-center-area desktop-only">
            <img
              src={profileImg}
              alt="Profile User"
              className="rw-img-circle-content"
            />
          </div>

          <h2 className="rw-title-text desktop-only">
            Riwayat
          </h2>

          <p className="rw-subtitle-text desktop-only">
            Riwayat absensi dan perizinan Anda
          </p>

          <button
            className="rw-btn-logout-desktop desktop-only"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>

        <div className="rw-content-list-wrapper">
          <div className="rw-form-header-wrapper desktop-only">
            <button
              className="rw-btn-back-desktop"
              onClick={() => navigate("/karyawan/dashboard")}
            >
              <ArrowLeft size={24} color="#333" strokeWidth={2.5} />
            </button>

            <h3 className="rw-card-title">
              Riwayat Anda
            </h3>
          </div>

          <div className="rw-content-list">
            {errorMessage && (
              <div style={messageBoxStyle}>
                {errorMessage}
              </div>
            )}

            {loading ? (
              <div style={loadingTextStyle}>
                Memuat riwayat...
              </div>
            ) : !errorMessage && historyList.length === 0 ? (
              <div style={loadingTextStyle}>
                Belum ada riwayat absensi atau perizinan.
              </div>
            ) : (
              historyList.map((item) => (
                <div
                  key={item.id}
                  className="rw-card-item"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="rw-icon-wrapper">
                    <img
                      src={perizinanIcon}
                      alt="Icon"
                      className="rw-icon-main"
                    />
                  </div>

                  <div className="rw-info-box">
                    <div className="rw-row-top">
                      <span className="rw-type-text">
                        {item.type}
                      </span>

                      <div style={badgeWrapperStyle}>
                        {item.type === "Perizinan" && (
                          <span
                            className={`rw-badge ${getBadgeStatusClass(
                              item.statusApproval
                            )}`}
                          >
                            {item.statusApproval}
                          </span>
                        )}

                        <span className={`rw-badge ${getBadgeTypeClass(item)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <p className="rw-name">
                      {item.name}
                    </p>

                    <div className="rw-meta-row">
                      <div className="rw-meta-item">
                        <img
                          src={lokasiIcon}
                          alt="Lokasi"
                          className="rw-mini-icon"
                        />

                        <span>
                          {item.branch}
                        </span>
                      </div>

                      <div className="rw-meta-item">
                        <img
                          src={kalenderIcon}
                          alt="Tanggal"
                          className="rw-mini-icon"
                        />

                        <span>
                          {item.date}
                        </span>
                      </div>

                      <div className="rw-meta-item">
                        <Clock size={14} />

                        <span>
                          {item.timeUpdate}
                        </span>
                      </div>
                    </div>

                    <p className="rw-note">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))
            )}

            <div className="rw-spacer"></div>
          </div>
        </div>

        {selectedItem && (
          <div
            className="rw-modal-overlay"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="rw-modal-content"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="rw-modal-close"
                onClick={() => setSelectedItem(null)}
              >
                <X size={20} />
              </button>

              <h3 className="rw-modal-title">
                Detail {selectedItem.type}
              </h3>

              <div className="rw-form-group">
                <label>
                  Nama
                </label>

                <input
                  type="text"
                  className="rw-input"
                  value={selectedItem.name}
                  disabled
                />
              </div>

              <div className="rw-form-group">
                <label>
                  NIK
                </label>

                <input
                  type="text"
                  className="rw-input"
                  value={selectedItem.nik}
                  disabled
                />
              </div>

              <div className="rw-form-group">
                <label>
                  Cabang
                </label>

                <input
                  type="text"
                  className="rw-input"
                  value={selectedItem.branch}
                  disabled
                />
              </div>

              {selectedItem.type === "Absensi" && (
                <>
                  <div className="rw-row-2">
                    <div className="rw-col">
                      <label>
                        Jam Masuk
                      </label>

                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.clockIn}
                        disabled
                      />
                    </div>

                    <div className="rw-col">
                      <label>
                        Jam Pulang
                      </label>

                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.clockOut}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="rw-form-group">
                    <label>
                      Bukti Foto Absensi
                    </label>

                    <div className="rw-photo-grid">
                      <div
                        className="rw-photo-item"
                        onClick={() =>
                          handlePhotoPreview(selectedItem.detail.photoIn)
                        }
                      >
                        {selectedItem.detail.photoIn &&
                        !selectedItem.detail.photoIn.includes(
                          "Dihapus Otomatis"
                        ) ? (
                          <>
                            <img
                              src={selectedItem.detail.photoIn}
                              alt="Masuk"
                            />

                            <div className="rw-zoom-overlay">
                              <ZoomIn size={16} />
                            </div>
                          </>
                        ) : (
                          <div className="no-photo">
                            {selectedItem.detail.photoIn &&
                            selectedItem.detail.photoIn.includes(
                              "Dihapus Otomatis"
                            )
                              ? "Telah Dihapus (30 Hari)"
                              : "Belum Ada Foto"}
                          </div>
                        )}

                        <div className="rw-photo-label">
                          Absen Masuk
                        </div>
                      </div>

                      <div
                        className="rw-photo-item"
                        onClick={() =>
                          handlePhotoPreview(selectedItem.detail.photoOut)
                        }
                      >
                        {selectedItem.detail.photoOut &&
                        !selectedItem.detail.photoOut.includes(
                          "Dihapus Otomatis"
                        ) ? (
                          <>
                            <img
                              src={selectedItem.detail.photoOut}
                              alt="Pulang"
                            />

                            <div className="rw-zoom-overlay">
                              <ZoomIn size={16} />
                            </div>
                          </>
                        ) : (
                          <div className="no-photo">
                            {selectedItem.detail.photoOut &&
                            selectedItem.detail.photoOut.includes(
                              "Dihapus Otomatis"
                            )
                              ? "Telah Dihapus (30 Hari)"
                              : "Belum Ada Foto"}
                          </div>
                        )}

                        <div className="rw-photo-label">
                          Absen Pulang
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedItem.type === "Perizinan" && (
                <>
                  <div className="rw-form-group">
                    <label>
                      Jenis Izin
                    </label>

                    <input
                      type="text"
                      className="rw-input"
                      value={selectedItem.detail.tipeIzin}
                      disabled
                    />
                  </div>

                  <div className="rw-form-group">
                    <label>
                      Keterangan
                    </label>

                    <textarea
                      className="rw-input rw-textarea"
                      value={selectedItem.detail.keterangan}
                      disabled
                    />
                  </div>

                  <div className="rw-row-2">
                    <div className="rw-col">
                      <label>
                        Mulai
                      </label>

                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.tglMulai}
                        disabled
                      />
                    </div>

                    <div className="rw-col">
                      <label>
                        Akhir
                      </label>

                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.tglAkhir}
                        disabled
                      />
                    </div>
                  </div>

                  <div
                    className="rw-form-group"
                    style={proofSectionStyle}
                  >
                    <label>
                      Bukti Dokumen / Surat Dokter
                    </label>

                    <div
                      className="rw-photo-grid"
                      style={singlePhotoGridStyle}
                    >
                      <div
                        className="rw-photo-item"
                        style={permissionPhotoItemStyle}
                        onClick={() =>
                          selectedItem.detail.buktiFoto &&
                          setPreviewImage(selectedItem.detail.buktiFoto)
                        }
                      >
                        {selectedItem.detail.buktiFoto ? (
                          <>
                            <img
                              src={selectedItem.detail.buktiFoto}
                              alt="Bukti Izin"
                              style={permissionProofImageStyle}
                            />

                            <div className="rw-zoom-overlay">
                              <ZoomIn size={24} />
                            </div>
                          </>
                        ) : (
                          <div
                            className="no-photo"
                            style={noProofTextStyle}
                          >
                            Pengajuan ini dikirim tanpa lampiran foto bukti
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {previewImage && (
          <div
            className="rw-preview-overlay"
            onClick={() => setPreviewImage(null)}
          >
            <div className="rw-preview-container">
              <button
                className="rw-preview-close"
                onClick={() => setPreviewImage(null)}
              >
                <X size={35} color="white" />
              </button>

              <img
                src={previewImage}
                alt="Preview"
                className="rw-full-image"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Riwayat;