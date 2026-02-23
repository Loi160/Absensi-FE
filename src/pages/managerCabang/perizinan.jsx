import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./perizinan.css"; 

// --- IMPORT ICONS ---
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const PerizinanManager = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // --- STATE UNTUK MODAL CUTI ---
  const [showCutiModal, setShowCutiModal] = useState(false);
  const [selectedCutiData, setSelectedCutiData] = useState(null);

  const handleCutiNameClick = (data) => {
    setSelectedCutiData(data);
    setShowCutiModal(true);
  };

  const handleCloseCutiModal = () => {
    setShowCutiModal(false);
    setSelectedCutiData(null);
  };

  // --- DATA DUMMY ---
  const dataPerizinanUtama = [
    { id: 1, nama: "Syahrul", tanggal: "01/01/2026", jenis: "Sakit", ket: "Keperluan Keluarga", status: "Pending" },
    { id: 2, nama: "Syahrul", tanggal: "01/01/2026", jenis: "Cuti", ket: "Keperluan Keluarga", status: "Approve" },
    { id: 3, nama: "Syahrul", tanggal: "01/01/2026", jenis: "Lainnya", ket: "Keperluan Keluarga", status: "Approve" },
  ];

  const dataIzinMeninggalkan = [
    { id: 1, nama: "Syahrul", jabatan: "CEO", tanggal: "Senin, 01/01/2026", jam: "09.00 - 10.00", perlu: "Kantor", status: "Pending" },
    { id: 2, nama: "Syahrul", jabatan: "Direktur", tanggal: "-", jam: "-", perlu: "Pribadi", status: "Approve" },
    { id: 3, nama: "Syahrul", jabatan: "Owner", tanggal: "-", jam: "-", perlu: "Pribadi", status: "Approve" },
  ];

  const dataCuti = [
    { id: 1, nama: "Syahrul", jabatan: "CEO", tanggal: "Senin, 01/01/2026", jam: "09.00 - 10.00", alasan: "Kantor", status: "Pending" },
    { id: 2, nama: "Syahrul", jabatan: "Direktur", tanggal: "-", jam: "-", alasan: "Keperluan Keluarga", status: "Approve" },
    { id: 3, nama: "Syahrul", jabatan: "Owner", tanggal: "-", jam: "-", alasan: "Keperluan Keluarga", status: "Approve" },
  ];

  return (
    <div className="hrd-container">
      {/* SIDEBAR KHUSUS MANAGER CABANG (4 MENU) */}
      <aside className="sidebar">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/managerCabang/dashboard')}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon-main" />
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          <div className="menu-item" onClick={() => navigate('/managerCabang/datakaryawan')}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon-main" />
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>
          
          <div className="menu-item active">
            <div className="menu-left">
              <img src={iconPerizinan} alt="izin" className="menu-icon-main" />
              <span className="menu-text-main">Perizinan</span>
            </div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/managerCabang/laporan')}>
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

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* HEADER */}
        <div className="page-header">
            <h1>Perizinan</h1>
            <p>Perizinan</p>
        </div>

        {/* TABEL 1: PERIZINAN UMUM */}
        <div className="perizinan-card">
            <div className="card-header-green">Permintaan Menunggu Approval</div>
            <table className="table-izin fixed-layout">
                <thead>
                    <tr>
                        <th style={{width: '20%'}}>Nama</th>
                        <th style={{width: '15%'}}>Tanggal</th>
                        <th style={{width: '10%'}}>Jenis</th>
                        <th style={{width: '25%'}}>Keterangan</th>
                        <th style={{width: '10%'}} className="text-center">Status</th>
                        <th style={{width: '20%'}} className="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {dataPerizinanUtama.map(item => (
                        <tr key={item.id}>
                            <td>{item.nama}</td>
                            <td>{item.tanggal}</td>
                            <td><span className={`badge-jenis ${item.jenis.toLowerCase()}`}>{item.jenis}</span></td>
                            <td>{item.ket}</td>
                            <td className="text-center"><span className={`badge-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                            <td className="text-center">
                                {item.status === 'Pending' && (
                                    <div className="action-buttons center-btn">
                                        <button className="btn-approve">Approve</button>
                                        <button className="btn-reject">Reject</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* TABEL 2: IZIN MENINGGALKAN KERJA */}
        <h3 className="section-title">Perizinan Izin Meninggalkan Kerja</h3>
        <div className="perizinan-card">
            <div className="card-header-green">Permintaan Menunggu Approval</div>
            <table className="table-izin fixed-layout">
                <thead>
                    <tr>
                        <th style={{width: '20%'}}>Nama</th>
                        <th style={{width: '10%'}}>Jabatan</th>
                        <th style={{width: '15%'}}>Hari, Tanggal</th>
                        <th style={{width: '10%'}}>Jam</th>
                        <th style={{width: '15%'}}>Keperluan</th>
                        <th style={{width: '10%'}} className="text-center">Status</th>
                        <th style={{width: '20%'}} className="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {dataIzinMeninggalkan.map(item => (
                        <tr key={item.id}>
                            <td>{item.nama}</td>
                            <td>{item.jabatan}</td>
                            <td>{item.tanggal}</td>
                            <td>{item.jam}</td>
                            <td>{item.perlu}</td>
                            <td className="text-center"><span className={`badge-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                            <td className="text-center">
                                {item.status === 'Pending' && (
                                    <div className="action-buttons center-btn">
                                        <button className="btn-approve">Approve</button>
                                        <button className="btn-reject">Reject</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* TABEL 3: CUTI (DENGAN POPUP) */}
        <h3 className="section-title">Formulir Cuti Karyawan Amaga Corporation</h3>
        <div className="perizinan-card">
            <div className="card-header-green">Permintaan Menunggu Approval</div>
            <table className="table-izin fixed-layout">
                <thead>
                    <tr>
                        <th style={{width: '20%'}}>Nama</th>
                        <th style={{width: '10%'}}>Jabatan</th>
                        <th style={{width: '10%'}}>Izin Cuti</th>
                        <th style={{width: '15%'}}>Hari, Tanggal</th>
                        <th style={{width: '15%'}}>Alasan</th>
                        <th style={{width: '10%'}} className="text-center">Status</th>
                        <th style={{width: '20%'}} className="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {dataCuti.map(item => (
                        <tr key={item.id}>
                            <td 
                                className="clickable-name"
                                onClick={() => handleCutiNameClick(item)}
                                title="Klik untuk lihat detail"
                            >
                                {item.nama}
                            </td>
                            <td>{item.jabatan}</td>
                            <td>-</td>
                            <td>{item.tanggal}<br/>{item.jam}</td>
                            <td>{item.alasan}</td>
                            <td className="text-center"><span className={`badge-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                            <td className="text-center">
                                {item.status === 'Pending' && (
                                    <div className="action-buttons center-btn">
                                        <button className="btn-approve">Approve</button>
                                        <button className="btn-reject">Reject</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </main>

      {/* --- MODAL CUTI POPUP SIMPEL --- */}
      {showCutiModal && (
        <div className="modal-overlay" onClick={handleCloseCutiModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form className="absen-form-grid">
                    <div className="form-group"><label>Nama</label><input type="text" className="input-field" defaultValue={selectedCutiData?.nama}/></div>
                    
                    <div className="form-group"><label>Cabang</label>
                        <select className="input-field">
                            <option value="">Pilih cabang</option>
                            <option value="Cabang 1">Cabang 1</option>
                            <option value="Cabang 2">Cabang 2</option>
                            <option value="Cabang 3">Cabang 3</option>
                            <option value="Cabang 4">Cabang 4</option>
                        </select>
                    </div>

                    <div className="form-group"><label>Jabatan</label><input type="text" className="input-field" defaultValue={selectedCutiData?.jabatan}/></div>
                    <div className="form-group"><label>Divisi</label><input type="text" className="input-field" /></div>

                    <div className="form-group"><label>Izin Cuti</label>
                        <select className="input-field">
                            <option>C THN/ C KHS</option>
                        </select>
                    </div>
                    <div className="form-group"></div> {/* Spacer */}

                    <div className="form-group"><label>Tanggal Mulai</label><input type="text" className="input-field" placeholder="dd/mm/yyyy"/></div>
                    <div className="form-group"><label>Tanggal Akhir</label><input type="text" className="input-field" placeholder="dd/mm/yyyy"/></div>

                    <div className="form-group full-width"><label>Keterangan</label><textarea className="input-field" style={{height: '80px'}}></textarea></div>
                    
                    <div className="form-group full-width"><label>Nomor Telefon</label><input type="text" className="input-field" placeholder="Nomor HP"/></div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default PerizinanManager;