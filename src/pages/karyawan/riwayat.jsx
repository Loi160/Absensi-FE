import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./riwayat.css";
import { ArrowLeft, Trash2, X, ZoomIn, Clock } from "lucide-react";

// Assets
import perizinanIcon from "../../assets/perizinan.svg";
import lokasiIcon from "../../assets/lokasi.svg";
import kalenderIcon from "../../assets/kalender.svg";
import logoAmaga from "../../assets/logoamaga.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import profileImg from "../../assets/profile.svg";

const Riwayat = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [historyList, setHistoryList] = useState([
    {
      id: 1,
      type: "Absensi",
      status: "HADIR",
      name: "Syahrul",
      nik: "202401001",
      branch: "Cabang 1",
      date: "30 Jan 2026",
      timeUpdate: "21:50",
      note: "Foto Absen Terlampir",
      isPartial: false,
      detail: {
        clockIn: "08:00",
        clockOut: "17:00",
        photoIn: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        photoOut: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      },
    },
    {
      id: 2,
      type: "Perizinan",
      status: "SAKIT",
      name: "Syahrul",
      nik: "202401001",
      branch: "Cabang 1",
      date: "29 Jan 2026",
      timeUpdate: "10:15",
      note: "Pengajuan Izin Sakit",
      isSpecial: true,
      detail: {
        keterangan: "Demam tinggi dan flu",
        tglMulai: "2026-12-01",
        tglAkhir: "2026-12-02",
        tipeIzin: "Sakit",
      },
    },
    {
      id: 3,
      type: "Absensi",
      status: "HADIR",
      name: "Syahrul",
      nik: "202401001",
      branch: "Cabang 1",
      date: "28 Jan 2026",
      timeUpdate: "17:05",
      note: "Belum Absen Pulang",
      isPartial: true,
      detail: {
        clockIn: "07:55",
        clockOut: "--:--",
        photoIn: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        photoOut: null,
      },
    },
    {
      id: 4,
      type: "Absensi",
      status: "HADIR",
      name: "Syahrul",
      nik: "202401001",
      branch: "Cabang 1",
      date: "27 Jan 2026",
      timeUpdate: "17:10",
      note: "Foto Absen Terlampir",
      isPartial: false,
      detail: {
        clockIn: "08:05",
        clockOut: "17:10",
        photoIn: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        photoOut: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      },
    },
  ]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus data perizinan ini?")) {
      const updatedList = historyList.filter((item) => item.id !== id);
      setHistoryList(updatedList);
      alert("Data berhasil dihapus.");
    }
  };

  return (
    <div className="rw-wrapper">
      <div className="rw-container">
        
        {/* BACKGROUND GRADIENT FIXED (HANYA MOBILE) */}
        <div className="rw-mobile-bg desktop-none"></div>

        {/* ================= HEADER / SIDEBAR ================= */}
        {/* UI/UX Update: Header dibuat sticky agar selalu terlihat */}
        <div className="rw-header-section">
          
          <div className="rw-header-mobile-content mobile-only">
             <button className="rw-btn-back" onClick={() => navigate("/karyawan/dashboard")}>
               <ArrowLeft size={24} color="white" />
             </button>
             <div className="rw-header-text-group">
               <h2 className="rw-title-text">Riwayat</h2>
               <p className="rw-subtitle-text">Riwayat absensi dan perizinan Anda</p>
             </div>
          </div>
          
          {/* Logo Persegi Desktop (Pojok Atas) */}
          <div className="rw-sidebar-logo-desktop desktop-only">
             <img src={logoPersegi} alt="Amaga Corp" />
          </div>

          <div className="rw-logo-center-area desktop-only">
            {/* Tampilan Desktop Sidebar: Foto Profil */}
            <img src={profileImg} alt="Profile User" className="rw-img-circle-content" />
          </div>

          <h2 className="rw-title-text desktop-only">Riwayat</h2>
          <p className="rw-subtitle-text desktop-only">Riwayat absensi dan perizinan Anda</p>

          {/* Tombol Logout Desktop */}
          <button className="rw-btn-logout-desktop desktop-only" onClick={() => navigate("/")}>
             Log Out
          </button>
        </div>

        {/* ================= KONTEN KANAN / LIST CARD ================= */}
        {/* UI/UX Update: Area konten yang bisa discroll */}
        <div className="rw-content-list-wrapper">
          
          {/* Header Form Desktop (Sejajar dengan Back Button) */}
          <div className="rw-form-header-wrapper desktop-only">
            <button className="rw-btn-back-desktop" onClick={() => navigate("/karyawan/dashboard")}>
              <ArrowLeft size={24} color="#333" strokeWidth={2.5} />
            </button>
            <h3 className="rw-card-title">Riwayat</h3> 
          </div>

          <div className="rw-content-list">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="rw-card-item"
                onClick={() => handleItemClick(item)}
              >
                {/* ICON */}
                <div className="rw-icon-wrapper">
                  <img src={perizinanIcon} alt="Icon" className="rw-icon-main" />
                </div>

                {/* INFO BOX */}
                <div className="rw-info-box">
                  {/* TOP ROW */}
                  <div className="rw-row-top">
                    <span className="rw-type-text">{item.type}</span>
                    <span
                      className={`rw-badge ${
                        item.status === "SAKIT"
                          ? "badge-sakit"
                          : item.isPartial
                          ? "badge-hadir-partial"
                          : "badge-hadir-full"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* NAME */}
                  <p className="rw-name">{item.name}</p>

                  {/* META */}
                  <div className="rw-meta-row">
                    <div className="rw-meta-item">
                      <img src={lokasiIcon} alt="Lokasi" className="rw-mini-icon" />
                      <span>{item.branch}</span>
                    </div>
                    <div className="rw-meta-item">
                      <img src={kalenderIcon} alt="Tanggal" className="rw-mini-icon" />
                      <span>{item.date}</span>
                    </div>
                    <div className="rw-meta-item">
                      <Clock size={14} />
                      <span>{item.timeUpdate}</span>
                    </div>
                  </div>

                  {/* NOTE */}
                  <p className="rw-note">{item.note}</p>
                </div>

                {/* DELETE BUTTON ONLY FOR PERIZINAN */}
                {item.type === "Perizinan" && (
                  <button
                    className="rw-btn-delete"
                    onClick={(e) => handleDelete(e, item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <div className="rw-spacer"></div>
          </div>
        </div>

        {/* ================= MODAL DETAIL ================= */}
        {selectedItem && (
          <div className="rw-modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="rw-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="rw-modal-close" onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>

              <h3 className="rw-modal-title">Detail {selectedItem.type}</h3>

              <div className="rw-form-group">
                <label>Nama</label>
                <input type="text" className="rw-input" value={selectedItem.name} disabled />
              </div>

              <div className="rw-form-group">
                <label>NIK</label>
                <input type="text" className="rw-input" value={selectedItem.nik} disabled />
              </div>

              <div className="rw-form-group">
                <label>Cabang</label>
                <input type="text" className="rw-input" value={selectedItem.branch} disabled />
              </div>

              {/* ===== ABSENSI DETAIL ===== */}
              {selectedItem.type === "Absensi" && (
                <>
                  <div className="rw-row-2">
                    <div className="rw-col">
                      <label>Jam Masuk</label>
                      <input type="text" className="rw-input text-center" value={selectedItem.detail.clockIn} disabled />
                    </div>
                    <div className="rw-col">
                      <label>Jam Pulang</label>
                      <input type="text" className="rw-input text-center" value={selectedItem.detail.clockOut} disabled />
                    </div>
                  </div>

                  <div className="rw-form-group">
                    <label>Bukti Foto Absensi</label>
                    <div className="rw-photo-grid">
                      {/* PHOTO IN */}
                      <div className="rw-photo-item" onClick={() => selectedItem.detail.photoIn && setPreviewImage(selectedItem.detail.photoIn)}>
                        {selectedItem.detail.photoIn ? (
                          <>
                            <img src={selectedItem.detail.photoIn} alt="Masuk" />
                            <div className="rw-zoom-overlay"><ZoomIn size={16} /></div>
                          </>
                        ) : (
                          <div className="no-photo">Belum Ada Foto</div>
                        )}
                        <div className="rw-photo-label">Absen Masuk</div>
                      </div>

                      {/* PHOTO OUT */}
                      <div className="rw-photo-item" onClick={() => selectedItem.detail.photoOut && setPreviewImage(selectedItem.detail.photoOut)}>
                        {selectedItem.detail.photoOut ? (
                          <>
                            <img src={selectedItem.detail.photoOut} alt="Pulang" />
                            <div className="rw-zoom-overlay"><ZoomIn size={16} /></div>
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

              {/* ===== PERIZINAN DETAIL ===== */}
              {selectedItem.type === "Perizinan" && (
                <>
                  <div className="rw-form-group">
                    <label>Jenis Izin</label>
                    <input type="text" className="rw-input" value={selectedItem.detail.tipeIzin} disabled />
                  </div>

                  <div className="rw-form-group">
                    <label>Keterangan</label>
                    <textarea className="rw-input rw-textarea" value={selectedItem.detail.keterangan} disabled />
                  </div>

                  <div className="rw-row-2">
                    <div className="rw-col">
                      <label>Mulai</label>
                      <input type="text" className="rw-input text-center" value={selectedItem.detail.tglMulai} disabled />
                    </div>
                    <div className="rw-col">
                      <label>Akhir</label>
                      <input type="text" className="rw-input text-center" value={selectedItem.detail.tglAkhir} disabled />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div className="rw-preview-overlay" onClick={() => setPreviewImage(null)}>
            <div className="rw-preview-container">
              <button className="rw-preview-close" onClick={() => setPreviewImage(null)}>
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
