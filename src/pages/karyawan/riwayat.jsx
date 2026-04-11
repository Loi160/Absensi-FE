import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./riwayat.css";
import { ArrowLeft, Trash2, X, ZoomIn, Clock } from "lucide-react";

// Assets
import perizinanIcon from "../../assets/perizinan.svg";
import lokasiIcon from "../../assets/lokasi.svg";
import kalenderIcon from "../../assets/kalender.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";

const Riwayat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  const formatDateIndo = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getJam = (waktu) => {
    if (!waktu) return "--:--";
    return String(waktu).substring(0, 5);
  };

  const fetchRiwayat = async () => {
    if (!user || !user.id) {
      setErrorMessage("Sesi login tidak valid. Silakan login ulang.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/riwayat/${user.id}`,
      );

      if (!res.ok) {
        throw new Error(
          `Server Error: ${res.status} - Pastikan Backend sudah direstart.`,
        );
      }

      const data = await res.json();

      const absensiData = data.absensi || [];
      const perizinanData = data.perizinan || [];

      // Format Data Absensi
      const formatAbsensi = absensiData.map((a) => {
        const rawTS = a.tanggal ? new Date(a.tanggal).getTime() : 0;
        
        // Pengecekan status Alpha dari Backend
        const isAlpha = a.status_kehadiran === "ALPHA";
        // Cek Partial (Bukan Alpha, dan salah satu jam kosong)
        const isPartial = !isAlpha && !(a.waktu_masuk && a.waktu_pulang);

        let noteText = a.waktu_pulang ? "Absen Selesai" : "Belum Absen Pulang";
        if (isAlpha) noteText = "Tidak ada keterangan kehadiran";

        return {
          id: a.is_alpha ? a.id : `abs_${a.id}`,
          realId: a.id,
          type: "Absensi",
          status: a.status_kehadiran ? a.status_kehadiran.toUpperCase() : "HADIR",
          name: user.nama || "Karyawan",
          nik: user.nik || "-",
          branch: user.cabangUtama || "-",
          date: formatDateIndo(a.tanggal),
          rawDate: rawTS,
          timeUpdate: isAlpha ? "--:--" : (getJam(a.waktu_pulang) !== "--:--" ? getJam(a.waktu_pulang) : getJam(a.waktu_masuk)),
          note: noteText,
          isPartial: isPartial,
          detail: {
            clockIn: getJam(a.waktu_masuk),
            clockOut: getJam(a.waktu_pulang),
            photoIn: a.foto_masuk || null,
            photoOut: a.foto_pulang || null,
          },
        };
      });

      // Format Data Perizinan
      const formatPerizinan = perizinanData.map((p) => {
        const tglAcuan = p.created_at || p.tanggal_mulai || new Date();
        const rawTS = new Date(tglAcuan).getTime();
        return {
          id: `izin_${p.id}`,
          realId: p.id,
          type: "Perizinan",
          status: p.jenis_izin ? p.jenis_izin.toUpperCase() : p.kategori ? p.kategori.toUpperCase() : "IZIN",
          name: user.nama || "Karyawan",
          nik: user.nik || "-",
          branch: user.cabangUtama || "-",
          date: formatDateIndo(tglAcuan),
          rawDate: rawTS,
          timeUpdate: "--:--",
          note: p.keterangan || `Pengajuan ${p.kategori || "Perizinan"}`,
          isSpecial: true,
          statusApproval: p.status_approval, 
          detail: {
            tipeIzin: p.jenis_izin || p.kategori || "-",
            keterangan: p.keterangan || p.keperluan || "-",
            tglMulai: formatDateIndo(p.tanggal_mulai || p.tanggal),
            tglAkhir: formatDateIndo(p.tanggal_selesai || p.tanggal),
            buktiFoto: p.bukti_foto || null,
          },
        };
      });

      const combined = [...formatAbsensi, ...formatPerizinan].sort((a, b) => {
        const dateA = a.rawDate || 0;
        const dateB = b.rawDate || 0;
        return dateB - dateA;
      });

      setHistoryList(combined);
    } catch (err) {
      console.error("Gagal fetch riwayat:", err);
      setErrorMessage(`Gagal memuat data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [user]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleDelete = async (e, id, realId) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Apakah Anda yakin ingin membatalkan/menghapus data perizinan ini?",
      )
    ) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/perizinan/${realId}`,
          { method: "DELETE" },
        );
        if (res.ok) {
          setHistoryList((prev) => prev.filter((item) => item.id !== id));
          alert("Pengajuan berhasil dibatalkan");
          setSelectedItem(null); 
        } else {
          alert("Gagal menghapus data");
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan jaringan");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const getBadgeStatusClass = (statusApp) => {
    if (statusApp === "Disetujui") return "badge-status-disetujui";
    if (statusApp === "Ditolak") return "badge-status-ditolak";
    return "badge-status-pending";
  };

  const getBadgeTypeClass = (item) => {
    if (item.type === "Absensi") {
      if (item.status === "ALPHA") return "badge-alpha";
      return item.isPartial ? "badge-hadir-partial" : "badge-hadir-full";
    }
    return "badge-izin-kuning"; 
  };

  return (
    <div className="rw-wrapper">
      <div className="rw-container">
        <div className="rw-mobile-bg desktop-none"></div>

        {/* HEADER / SIDEBAR */}
        <div className="rw-header-section">
          <div className="rw-header-mobile-content mobile-only">
            <button
              className="rw-btn-back"
              onClick={() => navigate("/karyawan/dashboard")}
            >
              <ArrowLeft size={24} color="white" />
            </button>
            <div className="rw-header-text-group">
              <h2 className="rw-title-text">Riwayat</h2>
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

          <h2 className="rw-title-text desktop-only">Riwayat</h2>
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

        {/* KONTEN KANAN / LIST CARD */}
        <div className="rw-content-list-wrapper">
          <div className="rw-form-header-wrapper desktop-only">
            <button
              className="rw-btn-back-desktop"
              onClick={() => navigate("/karyawan/dashboard")}
            >
              <ArrowLeft size={24} color="#333" strokeWidth={2.5} />
            </button>
            <h3 className="rw-card-title">Riwayat Anda</h3>
          </div>

          <div className="rw-content-list">
            {errorMessage && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "red",
                  fontWeight: "bold",
                  background: "#fee2e2",
                  borderRadius: "10px",
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}

            {loading ? (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                Memuat riwayat...
              </div>
            ) : !errorMessage && historyList.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
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
                      <span className="rw-type-text">{item.type}</span>

                      {/* AREA BADGE STATUS & TIPE IZIN */}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        
                        {item.type === "Perizinan" && (
                          <span className={`rw-badge ${getBadgeStatusClass(item.statusApproval)}`}>
                            {item.statusApproval}
                          </span>
                        )}

                        <span className={`rw-badge ${getBadgeTypeClass(item)}`}>
                          {item.status}
                        </span>

                      </div>
                    </div>

                    <p className="rw-name">{item.name}</p>

                    <div className="rw-meta-row">
                      <div className="rw-meta-item">
                        <img
                          src={lokasiIcon}
                          alt="Lokasi"
                          className="rw-mini-icon"
                        />
                        <span>{item.branch}</span>
                      </div>
                      <div className="rw-meta-item">
                        <img
                          src={kalenderIcon}
                          alt="Tanggal"
                          className="rw-mini-icon"
                        />
                        <span>{item.date}</span>
                      </div>
                      <div className="rw-meta-item">
                        <Clock size={14} />
                        <span>{item.timeUpdate}</span>
                      </div>
                    </div>
                    <p className="rw-note">{item.note}</p>
                  </div>

                  {item.type === "Perizinan" &&
                    item.statusApproval === "Pending" && (
                      <button
                        className="rw-btn-delete"
                        onClick={(e) => handleDelete(e, item.id, item.realId)}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                </div>
              ))
            )}
            <div className="rw-spacer"></div>
          </div>
        </div>

        {/* MODAL DETAIL */}
        {selectedItem && (
          <div
            className="rw-modal-overlay"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="rw-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="rw-modal-close"
                onClick={() => setSelectedItem(null)}
              >
                <X size={20} />
              </button>

              <h3 className="rw-modal-title">Detail {selectedItem.type}</h3>
              <div className="rw-form-group">
                <label>Nama</label>
                <input
                  type="text"
                  className="rw-input"
                  value={selectedItem.name}
                  disabled
                />
              </div>
              <div className="rw-form-group">
                <label>NIK</label>
                <input
                  type="text"
                  className="rw-input"
                  value={selectedItem.nik}
                  disabled
                />
              </div>
              <div className="rw-form-group">
                <label>Cabang</label>
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
                      <label>Jam Masuk</label>
                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.clockIn}
                        disabled
                      />
                    </div>
                    <div className="rw-col">
                      <label>Jam Pulang</label>
                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.clockOut}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="rw-form-group">
                    <label>Bukti Foto Absensi</label>
                    <div className="rw-photo-grid">
                      <div
                        className="rw-photo-item"
                        onClick={() =>
                          selectedItem.detail.photoIn &&
                          setPreviewImage(selectedItem.detail.photoIn)
                        }
                      >
                        {selectedItem.detail.photoIn ? (
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
                          <div className="no-photo">Belum Ada Foto</div>
                        )}
                        <div className="rw-photo-label">Absen Masuk</div>
                      </div>
                      <div
                        className="rw-photo-item"
                        onClick={() =>
                          selectedItem.detail.photoOut &&
                          setPreviewImage(selectedItem.detail.photoOut)
                        }
                      >
                        {selectedItem.detail.photoOut ? (
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
                          <div className="no-photo">Belum Ada Foto</div>
                        )}
                        <div className="rw-photo-label">Absen Pulang</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedItem.type === "Perizinan" && (
                <>
                  <div className="rw-form-group">
                    <label>Jenis Izin</label>
                    <input
                      type="text"
                      className="rw-input"
                      value={selectedItem.detail.tipeIzin}
                      disabled
                    />
                  </div>
                  <div className="rw-form-group">
                    <label>Keterangan</label>
                    <textarea
                      className="rw-input rw-textarea"
                      value={selectedItem.detail.keterangan}
                      disabled
                    />
                  </div>
                  <div className="rw-row-2">
                    <div className="rw-col">
                      <label>Mulai</label>
                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.tglMulai}
                        disabled
                      />
                    </div>
                    <div className="rw-col">
                      <label>Akhir</label>
                      <input
                        type="text"
                        className="rw-input text-center"
                        value={selectedItem.detail.tglAkhir}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="rw-form-group" style={{ marginTop: "15px" }}>
                    <label>Bukti Dokumen / Surat Dokter</label>
                    <div
                      className="rw-photo-grid"
                      style={{ gridTemplateColumns: "1fr" }}
                    >
                      <div
                        className="rw-photo-item"
                        style={{ height: "150px" }}
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
                              style={{
                                objectFit: "contain",
                                backgroundColor: "#f5f5f5",
                              }}
                            />
                            <div className="rw-zoom-overlay">
                              <ZoomIn size={24} />
                            </div>
                          </>
                        ) : (
                          <div
                            className="no-photo"
                            style={{ color: "#aaa", fontStyle: "italic" }}
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
              <img src={previewImage} alt="Preview" className="rw-full-image" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Riwayat;