import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./riwayat.css";
import { ArrowLeft, Trash2, X } from "lucide-react"; 

// Import Assets
import perizinanIcon from "../../assets/perizinan.svg"; 
import lokasiIcon from "../../assets/lokasi.svg";       
import kalenderIcon from "../../assets/kalender.svg";   

const Riwayat = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  
  // State untuk menampung data form yang bisa diedit
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    tipeIzin: "",
    keterangan: "",
    tglMulai: "",
    tglAkhir: ""
  });

  // Data Dummy
  const [historyList] = useState([
    { 
      id: 1, type: "Absensi", status: "Hadir", name: "Syahrul", branch: "Cabang 1", 
      date: "30 Jan 2026, 21:50", note: "Foto Absen Terlampir", isSpecial: false 
    },
    { 
      id: 2, type: "Perizinan", status: "SAKIT", name: "Syahrul", branch: "Cabang 1", 
      date: "29 Jan 2026", note: "Periode : 01 Des - 02 Des 2026", isSpecial: true,
      detail: {
        keterangan: "Demam tinggi dan flu",
        tglMulai: "2026-12-01", // Format YYYY-MM-DD agar masuk ke input date
        tglAkhir: "2026-12-02",
        tipeIzin: "Sakit"
      }
    },
    { 
      id: 3, type: "Absensi", status: "Hadir", name: "Syahrul", branch: "Cabang 1", 
      date: "30 Jan 2026, 21:50", note: "Foto Absen Terlampir", isSpecial: false 
    },
    { 
      id: 4, type: "Perizinan", status: "CUTI", name: "Syahrul", branch: "Cabang 1", 
      date: "15 Jan 2026", note: "Cuti Tahunan", isSpecial: true,
      detail: {
        keterangan: "Acara Keluarga",
        tglMulai: "2026-01-15",
        tglAkhir: "2026-01-16",
        tipeIzin: "Cuti"
      }
    },
    { 
      id: 5, type: "Absensi", status: "Hadir", name: "Syahrul", branch: "Cabang 1", 
      date: "30 Jan 2026, 21:50", note: "Foto Absen Terlampir", isSpecial: false 
    },
  ]);

  // Saat item diklik, masukkan data ke state formData agar bisa diedit
  const handleItemClick = (item) => {
    if (item.isSpecial) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        branch: item.branch,
        tipeIzin: item.detail?.tipeIzin || "Sakit",
        keterangan: item.detail?.keterangan || "",
        tglMulai: item.detail?.tglMulai || "",
        tglAkhir: item.detail?.tglAkhir || ""
      });
    }
  };

  // Fungsi untuk menangani perubahan input (ketik/pilih)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="rw-wrapper">
      <div className="rw-container">
        
        {/* BACKGROUND HIJAU (FIXED) */}
        <div className="rw-green-bg"></div>

        {/* HEADER (FIXED) */}
        <div className="rw-header">
          <button className="rw-btn-back" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={24} color="black" strokeWidth={2} />
          </button>
        </div>

        {/* LIST CARD */}
        <div className="rw-content-list">
          {historyList.map((item) => (
            <div 
              key={item.id} 
              className="rw-card-item" 
              onClick={() => handleItemClick(item)} 
            >
              <div className="rw-icon-wrapper">
                <img src={perizinanIcon} alt="Doc" className="rw-icon-main" />
              </div>

              <div className="rw-info-box">
                <div className="rw-top-row">
                  <span className="rw-type-text">{item.type}</span>
                  <span className={`rw-badge ${item.isSpecial ? "badge-solid-green" : "badge-outline-yellow"}`}>
                    {item.status}
                  </span>
                </div>
                
                <p className="rw-name">{item.name}</p>
                
                <div className="rw-meta-row">
                  <div className="rw-meta-item">
                    <img src={lokasiIcon} alt="Loc" className="rw-mini-icon" />
                    <span>{item.branch}</span>
                  </div>
                  <div className="rw-meta-item">
                    <img src={kalenderIcon} alt="Cal" className="rw-mini-icon" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <p className="rw-note">{item.note}</p>
              </div>

              {item.isSpecial && (
                <button className="rw-btn-delete" onClick={(e) => e.stopPropagation()}>
                  <Trash2 size={18} color="black" />
                </button>
              )}
            </div>
          ))}
          <div className="rw-spacer"></div>
        </div>

        {/* --- POPUP FORM EDITABLE (MODAL) --- */}
        {selectedItem && (
          <div className="rw-modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="rw-modal-content" onClick={(e) => e.stopPropagation()}>
              
              <button className="rw-modal-close" onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>

              {/* INPUT NAMA */}
              <div className="rw-form-group">
                <label>Nama</label>
                <input 
                  type="text" 
                  name="name"
                  className="rw-input" 
                  value={formData.name} 
                  onChange={handleChange}
                />
              </div>

              {/* SELECT CABANG */}
              <div className="rw-form-group">
                <label>Cabang</label>
                <select 
                  name="branch" 
                  className="rw-input rw-select" 
                  value={formData.branch} 
                  onChange={handleChange}
                >
                  <option value="Cabang 1">Cabang 1</option>
                  <option value="Cabang 2">Cabang 2</option>
                  <option value="Cabang 3">Cabang 3</option>
                </select>
              </div>

              {/* SELECT PERIZINAN */}
              <div className="rw-form-group">
                <label>Perizinan</label>
                <select 
                  name="tipeIzin" 
                  className="rw-input rw-select" 
                  value={formData.tipeIzin} 
                  onChange={handleChange}
                >
                  <option value="Sakit">Sakit</option>
                  <option value="Cuti">Cuti</option>
                  <option value="FIMTK">FIMTK</option>
                </select>
              </div>

              {/* TEXTAREA KETERANGAN */}
              <div className="rw-form-group">
                <label>Keterangan</label>
                <textarea 
                  name="keterangan"
                  className="rw-input rw-textarea" 
                  value={formData.keterangan}
                  onChange={handleChange}
                  placeholder="Isi keterangan..."
                />
              </div>

              {/* TANGGAL MULAI & AKHIR */}
              <div className="rw-row-2">
                <div className="rw-col">
                  <label>Tanggal Mulai</label>
                  <input 
                    type="date" 
                    name="tglMulai"
                    className="rw-input text-center" 
                    value={formData.tglMulai} 
                    onChange={handleChange}
                  />
                </div>
                <div className="rw-col">
                  <label>Tanggal Akhir</label>
                  <input 
                    type="date" 
                    name="tglAkhir"
                    className="rw-input text-center" 
                    value={formData.tglAkhir} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* BUKTI FOTO (Placeholder Upload) */}
              <div className="rw-form-group">
                <label>Bukti Foto</label>
                <div className="rw-photo-box">
                  <span style={{color: '#888'}}>Foto</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Riwayat;