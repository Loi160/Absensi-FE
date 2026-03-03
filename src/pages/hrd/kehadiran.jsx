import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./kehadiran.css"; 

// --- IMPORT ICONS ---
import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconAbsen from "../../assets/tambah.svg"; 
import iconIzin from "../../assets/perizinan.svg"; 

const Kehadiran = () => {
  const navigate = useNavigate();
  
  // State untuk Tab
  const [activeTab, setActiveTab] = useState('perizinan'); 
  
  // State untuk Filter Dropdown
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Filter");

  // Handler Logout
  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // Handler Filter
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleSelectFilter = (val) => { 
    setSelectedFilter(val); 
    setShowFilter(false); 
  };

  // =========================================================
  // STATE MODAL (POP-UP)
  // =========================================================
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'harian', 'fimtk', atau 'cuti'
  const [selectedData, setSelectedData] = useState(null);

  // Handler klik baris
  const handleRowClick = (item, type) => {
    setSelectedData(item);
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedData(null);
    setModalType("");
  };

  const handleSimpanAbsenManual = (e) => {
    e.preventDefault(); 
    alert("Form Absensi Manual berhasil disubmit!");
  };

  // =========================================================
  // DATA STATE (INTERAKTIF & TERISI PENUH)
  // =========================================================
  
  // Tabel 1: Izin Harian 
  const [dataIzinHarian, setDataIzinHarian] = useState([
    { id: 1, nama: "Syahrul", cabang: "Cabang 1", tglMulai: "01/03/2026", tglSelesai: "02/03/2026", tipeIzin: "Sakit", keterangan: "Demam Tinggi", status: "Pending", foto: "Ada Bukti Surat Sakit" },
    { id: 2, nama: "Budi Santoso", cabang: "Cabang Pusat", tglMulai: "05/03/2026", tglSelesai: "05/03/2026", tipeIzin: "Acara Pribadi", keterangan: "Urusan Bank", status: "Disetujui", foto: "Tidak Ada Foto" },
    { id: 3, nama: "Siti Aminah", cabang: "Cabang 2", tglMulai: "10/03/2026", tglSelesai: "11/03/2026", tipeIzin: "Lainnya", keterangan: "Bencana Alam", status: "Pending", foto: "Ada Bukti Kondisi Rumah" },
  ]);

  // Tabel 2: FIMTK
  const [dataIzinFIMTK, setDataIzinFIMTK] = useState([
    { id: 1, nama: "Ghilbran Alfaries", cabang: "Cabang Pusat", jabatan: "Staff IT", divisi: "Technology", tipeIzin: "Keluar Kantor", tanggal: "01/03/2026", jamMulai: "09.00", jamSelesai: "11.00", keperluan: "Kantor", kendaraan: "Kantor", keterangan: "Meeting Vendor", status: "Pending" },
    { id: 2, nama: "Ahmad Dani", cabang: "Cabang 1", jabatan: "Direktur Ops", divisi: "Operasional", tipeIzin: "Pulang Cepat", tanggal: "02/03/2026", jamMulai: "13.00", jamSelesai: "15.00", keperluan: "Pribadi", kendaraan: "Pribadi", keterangan: "Sakit Mendadak", status: "Disetujui" },
    { id: 3, nama: "Rina Kartika", cabang: "Cabang 2", jabatan: "HRD Staff", divisi: "Human Resource", tipeIzin: "Keluar Kantor", tanggal: "03/03/2026", jamMulai: "10.00", jamSelesai: "12.00", keperluan: "Pribadi", kendaraan: "Pribadi", keterangan: "Keperluan Medis", status: "Pending" },
  ]);

  // Tabel 3: Cuti
  const [dataCuti, setDataCuti] = useState([
    { id: 1, nama: "Syahrul", cabang: "Cabang Pusat", jabatan: "CEO", divisi: "Management", noTelp: "08123456789", tipeIzin: "Cuti Tahunan", tglMulai: "05/03/2026", tglSelesai: "10/03/2026", keterangan: "Liburan Keluarga", status: "Pending" },
    { id: 2, nama: "Budi Santoso", cabang: "Cabang 1", jabatan: "Direktur Ops", divisi: "Operasional", noTelp: "08987654321", tipeIzin: "Cuti Khusus", tglMulai: "12/03/2026", tglSelesai: "14/03/2026", keterangan: "Pernikahan Saudara", status: "Disetujui" },
  ]);

  // --- FUNGSI SORTING (Pending Selalu di Atas) ---
  const sortData = (dataArray) => {
    if (!dataArray) return []; 
    return [...dataArray].sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return 0;
    });
  };

  // --- FUNGSI UPDATE STATUS ---
  const handleUpdateStatus = (tabel, id, newStatus) => {
    const updater = (prevData) => {
        return prevData.map(item => {
            if (item.id === id) {
                return { ...item, status: newStatus };
            }
            return item;
        });
    };

    if (tabel === 'harian') {
        setDataIzinHarian(updater);
    } else if (tabel === 'fimtk') {
        setDataIzinFIMTK(updater);
    } else if (tabel === 'cuti') {
        setDataCuti(updater); 
    }
  };

  // --- FUNGSI WARNA BADGE ---
  const getBadgeClass = (tipe) => {
    if (tipe === 'Sakit') return 'sakit';
    if (tipe === 'Acara Pribadi') return 'pribadi';
    if (tipe === 'Lainnya') return 'lainnya';
    if (tipe === 'Keluar Kantor') return 'keluar';
    if (tipe === 'Pulang Cepat') return 'pulang';
    if (tipe === 'Cuti Khusus') return 'khusus';
    if (tipe === 'Cuti Tahunan') return 'tahunan';
    return 'lainnya';
  };

  return (
    <div className="hrd-container">
      {/* ================================================= */}
      {/* ==================== SIDEBAR ==================== */}
      {/* ================================================= */}
      <aside className="sidebar">
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon-main" />
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/hrd/kelolacabang')}>
            <div className="menu-left">
                <img src={iconKelola} alt="kelola" className="menu-icon-main" />
                <span className="menu-text-main">Kelola Cabang</span>
            </div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/hrd/datakaryawan')}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon-main" />
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>
          
          {/* Menu Kehadiran (Parent Aktif) */}
          <div className="menu-item active has-arrow">
            <div className="menu-left">
              <img src={iconKehadiran} alt="hadir" className="menu-icon-main" />
              <span className="menu-text-main">Kehadiran</span>
            </div>
            <img src={iconBawah} alt="down" className="arrow-icon-main rotate-up" />
          </div>
          
          {/* Submenu Container */}
          <div className="submenu-container">
            <div 
                className={`submenu-item ${activeTab === 'absenManual' ? 'active-sub' : ''}`} 
                onClick={() => setActiveTab('absenManual')}
            >
                <img src={iconAbsen} alt="-" className="submenu-icon" />
                <span>Absen Manual</span>
            </div>
            
            <div 
                className={`submenu-item ${activeTab === 'perizinan' ? 'active-sub' : ''}`} 
                onClick={() => setActiveTab('perizinan')}
            >
                <img src={iconIzin} alt="-" className="submenu-icon" />
                <span>Perizinan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/hrd/laporan')}>
            <div className="menu-left">
                <img src={iconLaporan} alt="lapor" className="menu-icon-main" />
                <span className="menu-text-main">Laporan</span>
            </div>
          </div>
        </nav>
        
        <div className="sidebar-footer">
            <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* ================================================= */}
      {/* ================= MAIN CONTENT ================== */}
      {/* ================================================= */}
      <main className="main-content">
        
        {/* ================= TAB 1: ABSEN MANUAL ================= */}
        {activeTab === 'absenManual' && (
            <>
                <div className="page-header">
                    <h1>Absensi Manual</h1>
                    <p>Formulir penginputan data absensi karyawan</p>
                </div>
                <div className="form-container-box">
                    <form className="absen-form-grid" onSubmit={handleSimpanAbsenManual}>
                        <div className="form-group"><label>Nama</label><input type="text" className="input-field" required /></div>
                        <div className="form-group"><label>NIK</label><input type="text" className="input-field" required /></div>
                        <div className="form-group"><label>Jabatan</label><input type="text" className="input-field" required /></div>
                        <div className="form-group"><label>Divisi</label><input type="text" className="input-field" required /></div>
                        <div className="form-group"><label>Cabang</label>
                            <select className="input-field" required><option value="">Pilih Cabang</option><option value="Cabang 1">Cabang 1</option><option value="Cabang 2">Cabang 2</option></select>
                        </div>
                        <div className="form-group"><label>Tipe Absen</label>
                            <select className="input-field" required><option value="">Pilih Tipe</option><option value="Masuk">Masuk</option><option value="Pulang">Pulang</option></select>
                        </div>
                        <div className="form-group"><label>Shift</label>
                            <select className="input-field" required><option value="">Pilih Shift</option><option value="Pagi">Pagi</option><option value="Siang">Siang</option></select>
                        </div>
                        <div className="form-group"></div> 
                        <div className="form-group full-width"><label>Keterangan</label><textarea className="input-field textarea-field" required></textarea></div>
                        <div className="form-actions-bottom">
                            <button type="submit" className="btn-simpan-green">Simpan</button>
                            <button type="reset" className="btn-batal-red">Batal</button>
                        </div>
                    </form>
                </div>
            </>
        )}

        {/* ================= TAB 2: PERIZINAN ================= */}
        {activeTab === 'perizinan' && (
            <>
                <div className="header-titles">
                    <h1>Perizinan</h1>
                    <p>Kelola seluruh permohonan izin dan cuti karyawan</p>
                </div>
                
                <div className="action-row-perizinan">
                    <div className="filter-wrapper">
                        <button className="btn-filter-green" onClick={toggleFilter}>
                            {selectedFilter} <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? 'rotate' : ''}`} />
                        </button>
                        {showFilter && (
                            <div className="filter-dropdown">
                                {["Cabang 1", "Cabang 2", "Semua"].map(c => (
                                    <div key={c} className="dropdown-item" onClick={() => handleSelectFilter(c)}>{c}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* TABEL 1: IZIN HARIAN */}
                <h3 className="section-title">Permohonan Izin Harian</h3>
                <div className="perizinan-card">
                    <div className="card-header-green">Permintaan Menunggu Approval</div>
                    <table className="table-izin">
                        <thead>
                            <tr>
                                <th style={{width: '20%'}}>Nama</th>
                                <th style={{width: '15%'}}>Mulai</th>
                                <th style={{width: '15%'}}>Selesai</th>
                                <th style={{width: '15%'}}>Tipe Izin</th>
                                <th style={{width: '10%'}} className="text-center">Status</th>
                                <th style={{width: '25%'}} className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(dataIzinHarian).map(item => (
                                <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, 'harian')}>
                                    <td className="clickable-name">{item.nama}</td>
                                    <td>{item.tglMulai}</td>
                                    <td>{item.tglSelesai}</td>
                                    <td><span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span></td>
                                    <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                        {item.status === 'Pending' ? (
                                            <div className="action-buttons">
                                                <button className="btn-approve" onClick={() => handleUpdateStatus('harian', item.id, 'Disetujui')}>Setujui</button>
                                                <button className="btn-reject" onClick={() => handleUpdateStatus('harian', item.id, 'Ditolak')}>Tolak</button>
                                            </div>
                                        ) : <span className="text-selesai">- Selesai -</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* TABEL 2: FIMTK */}
                <h3 className="section-title">Permohonan Izin Meninggalkan Tempat Kerja</h3>
                <div className="perizinan-card">
                    <div className="card-header-green">Permintaan Menunggu Approval</div>
                    <table className="table-izin">
                        <thead>
                            <tr>
                                <th style={{width: '20%'}}>Nama</th>
                                <th style={{width: '15%'}}>Jabatan</th>
                                <th style={{width: '15%'}}>Tipe Izin</th>
                                <th style={{width: '15%'}}>Tanggal</th>
                                <th style={{width: '10%'}} className="text-center">Status</th>
                                <th style={{width: '25%'}} className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(dataIzinFIMTK).map(item => (
                                <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, 'fimtk')}>
                                    <td className="clickable-name">{item.nama}</td>
                                    <td>{item.jabatan}</td>
                                    <td><span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span></td>
                                    <td>{item.tanggal}</td>
                                    <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                        {item.status === 'Pending' ? (
                                            <div className="action-buttons">
                                                <button className="btn-approve" onClick={() => handleUpdateStatus('fimtk', item.id, 'Disetujui')}>Setujui</button>
                                                <button className="btn-reject" onClick={() => handleUpdateStatus('fimtk', item.id, 'Ditolak')}>Tolak</button>
                                            </div>
                                        ) : <span className="text-selesai">- Selesai -</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* TABEL 3: CUTI */}
                <h3 className="section-title">Permohonan Izin Cuti Karyawan</h3>
                <div className="perizinan-card">
                    <div className="card-header-green">Permintaan Menunggu Approval</div>
                    <table className="table-izin">
                        <thead>
                            <tr>
                                <th style={{width: '20%'}}>Nama</th>
                                <th style={{width: '15%'}}>Jabatan</th>
                                <th style={{width: '15%'}}>Tipe Izin</th>
                                <th style={{width: '15%'}}>Mulai Cuti</th>
                                <th style={{width: '10%'}} className="text-center">Status</th>
                                <th style={{width: '25%'}} className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(dataCuti).map(item => (
                                <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, 'cuti')}>
                                    <td className="clickable-name">{item.nama}</td>
                                    <td>{item.jabatan}</td>
                                    <td><span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span></td>
                                    <td>{item.tglMulai}</td>
                                    <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                        {item.status === 'Pending' ? (
                                            <div className="action-buttons">
                                                <button className="btn-approve" onClick={() => handleUpdateStatus('cuti', item.id, 'Disetujui')}>Setujui</button>
                                                <button className="btn-reject" onClick={() => handleUpdateStatus('cuti', item.id, 'Ditolak')}>Tolak</button>
                                            </div>
                                        ) : <span className="text-selesai">- Selesai -</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}
      </main>

      {/* ================================================= */}
      {/* ================= MODAL POP-UP MODERN ============= */}
      {/* ================================================= */}
      {showModal && selectedData && (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* Header Modal Baru dengan X icon */}
                <div className="modal-header-modern">
                    <h2>
                        {modalType === 'harian' && 'Detail Izin Harian'}
                        {modalType === 'fimtk' && 'Detail Izin FIMTK'}
                        {modalType === 'cuti' && 'Detail Izin Cuti'}
                    </h2>
                    <button className="modal-close-icon" onClick={handleCloseModal}>&times;</button>
                </div>
                
                <div className="modal-body-modern">
                    
                    {/* BERSAMAAN: Row 1 (Nama & Cabang Bersebelahan) */}
                    <div className="modal-row-split">
                        <div className="modal-field-group">
                            <label className="modal-field-label">Nama</label>
                            <div className="modal-field-value">{selectedData.nama}</div>
                        </div>
                        <div className="modal-field-group">
                            <label className="modal-field-label">Cabang</label>
                            <div className="modal-field-value">{selectedData.cabang}</div>
                        </div>
                    </div>

                    <div className="modal-field-group">
                        <label className="modal-field-label">Tipe Izin</label>
                        <div className="modal-field-value">{selectedData.tipeIzin}</div>
                    </div>

                    {/* SPESIFIK HARIAN & CUTI */}
                    {(modalType === 'harian' || modalType === 'cuti') && (
                        <div className="modal-row-split">
                            <div className="modal-field-group">
                                <label className="modal-field-label">Tanggal Mulai</label>
                                <div className="modal-field-value">{selectedData.tglMulai}</div>
                            </div>
                            <div className="modal-field-group">
                                <label className="modal-field-label">Tanggal Selesai</label>
                                <div className="modal-field-value">{selectedData.tglSelesai}</div>
                            </div>
                        </div>
                    )}

                    {/* SPESIFIK FIMTK */}
                    {modalType === 'fimtk' && (
                        <>
                            <div className="modal-row-split">
                                <div className="modal-field-group">
                                    <label className="modal-field-label">Jabatan</label>
                                    <div className="modal-field-value">{selectedData.jabatan}</div>
                                </div>
                                <div className="modal-field-group">
                                    <label className="modal-field-label">Divisi</label>
                                    <div className="modal-field-value">{selectedData.divisi}</div>
                                </div>
                            </div>
                            <div className="modal-row-split">
                                <div className="modal-field-group">
                                    <label className="modal-field-label">Tanggal</label>
                                    <div className="modal-field-value">{selectedData.tanggal}</div>
                                </div>
                                <div className="modal-field-group">
                                    <label className="modal-field-label">Jam Izin</label>
                                    <div className="modal-field-value">{selectedData.jamMulai} - {selectedData.jamSelesai}</div>
                                </div>
                            </div>
                            <div className="modal-row-split">
                                <div className="modal-field-group">
                                    <label className="modal-field-label">Keperluan</label>
                                    <div className="modal-field-value">{selectedData.keperluan}</div>
                                </div>
                                <div className="modal-field-group">
                                    <label className="modal-field-label">Kendaraan</label>
                                    <div className="modal-field-value">{selectedData.kendaraan}</div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SPESIFIK CUTI TAMBAHAN */}
                    {modalType === 'cuti' && (
                        <div className="modal-row-split">
                            <div className="modal-field-group">
                                <label className="modal-field-label">Jabatan & Divisi</label>
                                <div className="modal-field-value">{selectedData.jabatan} - {selectedData.divisi}</div>
                            </div>
                            <div className="modal-field-group">
                                <label className="modal-field-label">No. Telepon</label>
                                <div className="modal-field-value">{selectedData.noTelp}</div>
                            </div>
                        </div>
                    )}

                    <div className="modal-field-group">
                        <label className="modal-field-label">Keterangan / Alasan</label>
                        <div className="modal-field-value" style={{minHeight: '80px'}}>{selectedData.keterangan}</div>
                    </div>
                    
                    {/* BUKTI FOTO HANYA UNTUK HARIAN */}
                    {modalType === 'harian' && (
                        <div className="modal-field-group">
                            <label className="modal-field-label">Bukti Foto</label>
                            <div className="modal-foto-box">
                                {selectedData.foto !== "-" ? `Gambar: ${selectedData.foto}` : "Tidak ada foto yang dilampirkan"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Modal dengan Tombol Baru */}
                {selectedData.status === 'Pending' && (
                    <div className="modal-footer-modern">
                        <button className="btn-reject-modern" onClick={() => { handleUpdateStatus(modalType, selectedData.id, 'Ditolak'); handleCloseModal(); }}>
                            Tolak
                        </button>
                        <button className="btn-approve-modern" onClick={() => { handleUpdateStatus(modalType, selectedData.id, 'Disetujui'); handleCloseModal(); }}>
                            Setujui
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Kehadiran;