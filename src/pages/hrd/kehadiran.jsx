import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./kehadiran.css"; 

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
  const [activeTab, setActiveTab] = useState('perizinan'); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar  = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua Cabang");
  const [cabangList, setCabangList] = useState([]);

  // STATE DATA REAL
  const [dataIzinHarian, setDataIzinHarian] = useState([]);
  const [dataIzinFIMTK, setDataIzinFIMTK] = useState([]);
  const [dataCuti, setDataCuti] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE MODAL DETAIL
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [selectedData, setSelectedData] = useState(null);

  // FORMAT TANGGAL
  const formatDateIndo = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // MENGAMBIL DATA DARI BACKEND
  const fetchData = async () => {
    try {
      setLoading(true);
      // Ambil daftar cabang untuk filter
      const resCabang = await fetch("http://localhost:3000/api/cabang");
      const listCabang = await resCabang.json();
      setCabangList(listCabang.map(c => c.nama));

      // Ambil semua perizinan
      const resPerizinan = await fetch("http://localhost:3000/api/perizinan/all");
      const allPerizinan = await resPerizinan.json();

      // Memecah data berdasarkan kategori
      const harian = [];
      const fimtk = [];
      const cuti = [];

      allPerizinan.forEach(p => {
        const mappedData = {
          id: p.id,
          nama: p.users?.nama || "Unknown",
          cabang: p.users?.cabang?.nama || "-",
          jabatan: p.users?.jabatan || "-",
          divisi: p.users?.divisi || "-",
          noTelp: p.users?.no_telp || "-",
          tipeIzin: p.jenis_izin,
          keterangan: p.keterangan || p.keperluan,
          tglMulai: formatDateIndo(p.tanggal_mulai),
          tglSelesai: formatDateIndo(p.tanggal_selesai),
          tanggal: formatDateIndo(p.tanggal_mulai), // Untuk FIMTK
          jamMulai: p.jam_mulai,
          jamSelesai: p.jam_selesai,
          keperluan: p.keperluan,
          kendaraan: p.kendaraan,
          alasan: p.keterangan,
          status: p.status_approval,
          foto: p.bukti_foto || "Tidak Ada Bukti",
          rawDate: new Date(p.created_at).getTime()
        };

        if (p.kategori === 'Izin') harian.push(mappedData);
        else if (p.kategori === 'FIMTK') fimtk.push(mappedData);
        else if (p.kategori === 'Cuti') cuti.push(mappedData);
      });

      setDataIzinHarian(harian);
      setDataIzinFIMTK(fimtk);
      setDataCuti(cuti);

    } catch (error) {
      console.error("Gagal mengambil data perizinan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

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

  // UPDATE STATUS APPROVAL KE DATABASE
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/perizinan/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_approval: newStatus })
      });
      
      if (res.ok) {
        alert(`Berhasil di-${newStatus}`);
        fetchData(); // Refresh UI setelah update
        handleCloseModal();
      } else {
        alert("Gagal mengupdate status.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // Sorting: Pending di atas, lalu urut tanggal terbaru
  const sortData = (dataArray) => {
    return [...dataArray].sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return b.rawDate - a.rawDate;
    });
  };

  const filterByCabang = (dataArray) => {
    if (selectedFilter === "Semua Cabang") return dataArray;
    return dataArray.filter(item => item.cabang === selectedFilter);
  };

  const getBadgeClass = (tipe) => {
    if (!tipe) return 'lainnya';
    const lower = tipe.toLowerCase();
    if (lower.includes('sakit')) return 'sakit';
    if (lower.includes('pribadi')) return 'pribadi';
    if (lower.includes('keluar')) return 'keluar';
    if (lower.includes('pulang')) return 'pulang';
    if (lower.includes('khusus')) return 'khusus';
    if (lower.includes('tahunan')) return 'tahunan';
    return 'lainnya';
  };

  const handleNav = (path) => { closeSidebar(); navigate(path); };
  const handleTabChange = (tab) => { setActiveTab(tab); closeSidebar(); };

  return (
    <div className="hrd-container">
      {/* MOBILE TOPBAR & SIDEBAR */}
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar}><span></span><span></span><span></span></button>
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar}>&times;</button>
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav('/hrd/dashboard')}><div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/hrd/kelolacabang')}><div className="menu-left"><img src={iconKelola} alt="kelola" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/hrd/datakaryawan')}><div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          
          <div className="menu-item active has-arrow">
            <div className="menu-left"><img src={iconKehadiran} alt="hadir" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div>
            <img src={iconBawah} alt="down" className="arrow-icon-main rotate-up" />
          </div>
          <div className="submenu-container">
            <div className={`submenu-item ${activeTab === 'absenManual' ? 'active-sub' : ''}`} onClick={() => handleTabChange('absenManual')}><img src={iconAbsen} alt="-" className="submenu-icon" /><span>Absen Manual</span></div>
            <div className={`submenu-item ${activeTab === 'perizinan' ? 'active-sub' : ''}`} onClick={() => handleTabChange('perizinan')}><img src={iconIzin} alt="-" className="submenu-icon" /><span>Perizinan</span></div>
          </div>
          <div className="menu-item" onClick={() => handleNav('/hrd/laporan')}><div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      <main className="main-content">
        {activeTab === 'perizinan' && (
            <>
                <div className="header-titles">
                    <h1>Perizinan</h1>
                    <p>Kelola seluruh permohonan izin dan cuti karyawan</p>
                </div>
                
                <div className="action-row-perizinan">
                    <div className="filter-wrapper">
                        <button className="btn-filter-green" onClick={() => setShowFilter(!showFilter)}>
                            {selectedFilter} <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? 'rotate' : ''}`} />
                        </button>
                        {showFilter && (
                            <div className="filter-dropdown">
                                <div className="dropdown-item" onClick={() => handleSelectFilter("Semua Cabang")}>Semua Cabang</div>
                                {cabangList.map(c => (
                                    <div key={c} className="dropdown-item" onClick={() => {setSelectedFilter(c); setShowFilter(false);}}>{c}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign: "center", marginTop: "50px", color: "#666"}}>Memuat data perizinan...</div>
                ) : (
                  <>
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
                                {filterByCabang(sortData(dataIzinHarian)).length > 0 ? filterByCabang(sortData(dataIzinHarian)).map(item => (
                                    <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, 'harian')}>
                                        <td className="clickable-name">{item.nama}</td>
                                        <td>{item.tglMulai}</td>
                                        <td>{item.tglSelesai}</td>
                                        <td><span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span></td>
                                        <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                            {item.status === 'Pending' ? (
                                                <div className="action-buttons">
                                                    <button className="btn-approve" onClick={() => handleUpdateStatus(item.id, 'Disetujui')}>Setujui</button>
                                                    <button className="btn-reject" onClick={() => handleUpdateStatus(item.id, 'Ditolak')}>Tolak</button>
                                                </div>
                                            ) : <span className="text-selesai">- Selesai -</span>}
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="6" className="text-center" style={{padding: "20px"}}>Belum ada data izin harian.</td></tr>}
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
                                {filterByCabang(sortData(dataIzinFIMTK)).length > 0 ? filterByCabang(sortData(dataIzinFIMTK)).map(item => (
                                    <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, 'fimtk')}>
                                        <td className="clickable-name">{item.nama}</td>
                                        <td>{item.jabatan}</td>
                                        <td><span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span></td>
                                        <td>{item.tanggal}</td>
                                        <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                            {item.status === 'Pending' ? (
                                                <div className="action-buttons">
                                                    <button className="btn-approve" onClick={() => handleUpdateStatus(item.id, 'Disetujui')}>Setujui</button>
                                                    <button className="btn-reject" onClick={() => handleUpdateStatus(item.id, 'Ditolak')}>Tolak</button>
                                                </div>
                                            ) : <span className="text-selesai">- Selesai -</span>}
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="6" className="text-center" style={{padding: "20px"}}>Belum ada data izin FIMTK.</td></tr>}
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
                                {filterByCabang(sortData(dataCuti)).length > 0 ? filterByCabang(sortData(dataCuti)).map(item => (
                                    <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, 'cuti')}>
                                        <td className="clickable-name">{item.nama}</td>
                                        <td>{item.jabatan}</td>
                                        <td><span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span></td>
                                        <td>{item.tglMulai}</td>
                                        <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                            {item.status === 'Pending' ? (
                                                <div className="action-buttons">
                                                    <button className="btn-approve" onClick={() => handleUpdateStatus(item.id, 'Disetujui')}>Setujui</button>
                                                    <button className="btn-reject" onClick={() => handleUpdateStatus(item.id, 'Ditolak')}>Tolak</button>
                                                </div>
                                            ) : <span className="text-selesai">- Selesai -</span>}
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="6" className="text-center" style={{padding: "20px"}}>Belum ada data izin Cuti.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                  </>
                )}
            </>
        )}
      </main>

      {/* MODAL DETAIL (Sama seperti sebelumnya) */}
      {showModal && selectedData && (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-modern">
                    <h2>
                        {modalType === 'harian' && 'Detail Izin Harian'}
                        {modalType === 'fimtk' && 'Detail Izin FIMTK'}
                        {modalType === 'cuti' && 'Detail Izin Cuti'}
                    </h2>
                    <button className="modal-close-icon" onClick={handleCloseModal}>&times;</button>
                </div>
                
                <div className="modal-body-modern">
                    <div className="modal-row-split">
                        <div className="modal-field-group"><label className="modal-field-label">Nama</label><div className="modal-field-value">{selectedData.nama}</div></div>
                        <div className="modal-field-group"><label className="modal-field-label">Cabang</label><div className="modal-field-value">{selectedData.cabang}</div></div>
                    </div>
                    <div className="modal-field-group"><label className="modal-field-label">Tipe Izin</label><div className="modal-field-value">{selectedData.tipeIzin}</div></div>

                    {(modalType === 'harian' || modalType === 'cuti') && (
                        <div className="modal-row-split">
                            <div className="modal-field-group"><label className="modal-field-label">Tanggal Mulai</label><div className="modal-field-value">{selectedData.tglMulai}</div></div>
                            <div className="modal-field-group"><label className="modal-field-label">Tanggal Selesai</label><div className="modal-field-value">{selectedData.tglSelesai}</div></div>
                        </div>
                    )}

                    {modalType === 'fimtk' && (
                        <>
                            <div className="modal-row-split">
                                <div className="modal-field-group"><label className="modal-field-label">Jabatan</label><div className="modal-field-value">{selectedData.jabatan}</div></div>
                                <div className="modal-field-group"><label className="modal-field-label">Divisi</label><div className="modal-field-value">{selectedData.divisi}</div></div>
                            </div>
                            <div className="modal-row-split">
                                <div className="modal-field-group"><label className="modal-field-label">Tanggal</label><div className="modal-field-value">{selectedData.tanggal}</div></div>
                                <div className="modal-field-group"><label className="modal-field-label">Jam Izin</label><div className="modal-field-value">{selectedData.jamMulai} - {selectedData.jamSelesai}</div></div>
                            </div>
                            <div className="modal-row-split">
                                <div className="modal-field-group"><label className="modal-field-label">Keperluan</label><div className="modal-field-value">{selectedData.keperluan}</div></div>
                                <div className="modal-field-group"><label className="modal-field-label">Kendaraan</label><div className="modal-field-value">{selectedData.kendaraan}</div></div>
                            </div>
                        </>
                    )}

                    {modalType === 'cuti' && (
                        <div className="modal-row-split">
                            <div className="modal-field-group"><label className="modal-field-label">Jabatan & Divisi</label><div className="modal-field-value">{selectedData.jabatan} - {selectedData.divisi}</div></div>
                            <div className="modal-field-group"><label className="modal-field-label">No. Telepon</label><div className="modal-field-value">{selectedData.noTelp}</div></div>
                        </div>
                    )}

                    <div className="modal-field-group">
                        <label className="modal-field-label">Keterangan / Alasan</label>
                        <div className="modal-field-value" style={{minHeight: '80px'}}>{selectedData.keterangan}</div>
                    </div>
                </div>

                {selectedData.status === 'Pending' && (
                    <div className="modal-footer-modern">
                        <button className="btn-reject-modern" onClick={() => handleUpdateStatus(selectedData.id, 'Ditolak')}>Tolak</button>
                        <button className="btn-approve-modern" onClick={() => handleUpdateStatus(selectedData.id, 'Disetujui')}>Setujui</button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Kehadiran;