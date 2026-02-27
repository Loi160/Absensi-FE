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
  const [activeTab, setActiveTab] = useState('absenManual'); 
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Filter");

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => setShowFilter(!showFilter);
  const handleSelectFilter = (val) => { setSelectedFilter(val); setShowFilter(false); };

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

  // --- HANDLER SUBMIT FORM ---
  const handleSimpanAbsenManual = (e) => {
    e.preventDefault(); 
    alert("Form Absensi Manual berhasil disubmit!");
  };

  const handleSimpanCuti = (e) => {
    e.preventDefault();
    alert("Form Cuti berhasil disubmit!");
    handleCloseCutiModal();
  };

  // =========================================================
  // DATA DUMMY DIUBAH MENJADI STATE AGAR BISA DIUBAH (REAKTIF)
  // =========================================================
  const [dataPerizinanUtama, setDataPerizinanUtama] = useState([
    { id: 1, nama: "Syahrul", tanggal: "01/01/2026", jenis: "Sakit", ket: "Keperluan Keluarga", status: "Pending" },
    { id: 2, nama: "Budi", tanggal: "01/01/2026", jenis: "Cuti", ket: "Keperluan Keluarga", status: "Disetujui" },
    { id: 3, nama: "Siti", tanggal: "01/01/2026", jenis: "Lainnya", ket: "Keperluan Keluarga", status: "Disetujui" },
  ]);

  const [dataIzinMeninggalkan, setDataIzinMeninggalkan] = useState([
    { id: 1, nama: "Syahrul", jabatan: "CEO", tanggal: "Senin, 01/01/2026", jam: "09.00 - 10.00", perlu: "Kantor", status: "Pending" },
    { id: 2, nama: "Budi", jabatan: "Direktur", tanggal: "-", jam: "-", perlu: "Pribadi", status: "Disetujui" },
    { id: 3, nama: "Siti", jabatan: "Owner", tanggal: "-", jam: "-", perlu: "Pribadi", status: "Disetujui" },
  ]);

  const [dataCuti, setDataCuti] = useState([
    { id: 1, nama: "Syahrul", jabatan: "CEO", tanggal: "Senin, 01/01/2026", jam: "09.00 - 10.00", alasan: "Kantor", status: "Pending" },
    { id: 2, nama: "Budi", jabatan: "Direktur", tanggal: "-", jam: "-", alasan: "Keperluan Keluarga", status: "Disetujui" },
    { id: 3, nama: "Siti", jabatan: "Owner", tanggal: "-", jam: "-", alasan: "Keperluan Keluarga", status: "Disetujui" },
  ]);

  // --- FUNGSI UNTUK MENGUBAH STATUS (APPROVE/REJECT) ---
  const handleUpdateStatus = (tabelTarget, id, newStatus) => {
    if (tabelTarget === "utama") {
      setDataPerizinanUtama(prevData => 
        prevData.map(item => item.id === id ? { ...item, status: newStatus } : item)
      );
    } else if (tabelTarget === "meninggalkan") {
      setDataIzinMeninggalkan(prevData => 
        prevData.map(item => item.id === id ? { ...item, status: newStatus } : item)
      );
    } else if (tabelTarget === "cuti") {
      setDataCuti(prevData => 
        prevData.map(item => item.id === id ? { ...item, status: newStatus } : item)
      );
    }
  };

  return (
    <div className="hrd-container">
      {/* SIDEBAR TERBARU */}
      <aside className="sidebar">
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}>
            <div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div>
          </div>
          <div className="menu-item" onClick={() => navigate('/hrd/kelolacabang')}>
            <div className="menu-left"><img src={iconKelola} alt="kelola" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div>
          </div>
          <div className="menu-item" onClick={() => navigate('/hrd/datakaryawan')}>
            <div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div>
          </div>
          
          {/* Menu Kehadiran Aktif (Parent) */}
          <div className="menu-item active has-arrow">
            <div className="menu-left">
              <img src={iconKehadiran} alt="hadir" className="menu-icon-main" />
              <span className="menu-text-main">Kehadiran</span>
            </div>
            <img src={iconBawah} alt="down" className="arrow-icon-main rotate-up" />
          </div>
          
          {/* Submenu Item (Akan menjadi putih jika active-sub) */}
          <div className="submenu-container">
            <div className={`submenu-item ${activeTab === 'absenManual' ? 'active-sub' : ''}`} onClick={() => setActiveTab('absenManual')}>
                <img src={iconAbsen} alt="-" className="submenu-icon" /><span>Absen Manual</span>
            </div>
            <div className={`submenu-item ${activeTab === 'perizinan' ? 'active-sub' : ''}`} onClick={() => setActiveTab('perizinan')}>
                <img src={iconIzin} alt="-" className="submenu-icon" /><span>Perizinan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate('/hrd/laporan')}>
            <div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div>
          </div>
        </nav>
        <div className="sidebar-footer">
            <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* TAB 1: ABSEN MANUAL */}
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
                            <select className="input-field" required>
                                <option value="">Pilih Cabang</option>
                                <option value="Cabang 1">Cabang 1</option>
                                <option value="Cabang 2">Cabang 2</option>
                                <option value="Cabang 3">Cabang 3</option>
                                <option value="Cabang 4">Cabang 4</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Tipe Absen</label>
                            <select className="input-field" required>
                                <option value="">Pilih Tipe</option>
                                <option value="Masuk">Masuk</option>
                                <option value="Istirahat">Istirahat</option>
                                <option value="Pulang">Pulang</option>
                                <option value="Izin">Izin</option>
                                <option value="Cuti">Cuti</option>
                                <option value="FIMTK">FIMTK</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Cabang (Shift)</label>
                            <select className="input-field" required>
                                <option value="">Pilih Shift</option>
                                <option value="Pagi">Pagi</option>
                                <option value="Siang">Siang</option>
                                <option value="Malam">Malam</option>
                            </select>
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

        {/* TAB 2: PERIZINAN */}
        {activeTab === 'perizinan' && (
            <>
                <div className="header-titles">
                    <h1>Perizinan</h1>
                    <p>Daftar permohonan izin dan cuti karyawan</p>
                </div>
                
                <div className="action-row-perizinan">
                    <div className="filter-wrapper">
                        <button className="btn-filter-green" onClick={toggleFilter}>
                            {selectedFilter} 
                            <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? 'rotate' : ''}`} />
                        </button>
                        {showFilter && (
                            <div className="filter-dropdown">
                                {["Cabang 1", "Cabang 2", "Cabang 3", "Cabang 4"].map(cabang => (
                                    <div key={cabang} className="dropdown-item" onClick={() => handleSelectFilter(cabang)}>{cabang}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* TABEL 1 */}
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
                                    {/* Class status dinamis berdasarkan teks Disetujui/Ditolak/Pending */}
                                    <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                    <td className="text-center">
                                        {item.status === 'Pending' ? (
                                            <div className="action-buttons center-btn">
                                                <button className="btn-approve" onClick={() => handleUpdateStatus('utama', item.id, 'Disetujui')}>Disetujui</button>
                                                <button className="btn-reject" onClick={() => handleUpdateStatus('utama', item.id, 'Ditolak')}>Ditolak</button>
                                            </div>
                                        ) : (
                                            <span style={{color: '#999', fontSize: '13px'}}>- Selesai -</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* TABEL 2 */}
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
                                    <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                    <td className="text-center">
                                        {item.status === 'Pending' ? (
                                            <div className="action-buttons center-btn">
                                                <button className="btn-approve" onClick={() => handleUpdateStatus('meninggalkan', item.id, 'Disetujui')}>Disetujui</button>
                                                <button className="btn-reject" onClick={() => handleUpdateStatus('meninggalkan', item.id, 'Ditolak')}>Ditolak</button>
                                            </div>
                                        ) : (
                                            <span style={{color: '#999', fontSize: '13px'}}>- Selesai -</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* TABEL 3: CUTI */}
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
                                    <td className="clickable-name" onClick={() => handleCutiNameClick(item)}>{item.nama}</td>
                                    <td>{item.jabatan}</td>
                                    <td>-</td>
                                    <td>{item.tanggal}<br/>{item.jam}</td>
                                    <td>{item.alasan}</td>
                                    <td className="text-center"><span className={`badge-status ${item.status === 'Disetujui' ? 'approve' : item.status === 'Ditolak' ? 'reject' : 'pending'}`}>{item.status}</span></td>
                                    <td className="text-center">
                                        {item.status === 'Pending' ? (
                                            <div className="action-buttons center-btn">
                                                <button className="btn-approve" onClick={() => handleUpdateStatus('cuti', item.id, 'Disetujui')}>Disetujui</button>
                                                <button className="btn-reject" onClick={() => handleUpdateStatus('cuti', item.id, 'Ditolak')}>Ditolak</button>
                                            </div>
                                        ) : (
                                            <span style={{color: '#999', fontSize: '13px'}}>- Selesai -</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

      </main>

      {/* --- MODAL CUTI POPUP --- */}
      {showCutiModal && (
        <div className="modal-overlay" onClick={handleCloseCutiModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form className="absen-form-grid" onSubmit={handleSimpanCuti}>
                    <div className="form-group"><label>Nama</label><input type="text" className="input-field" defaultValue={selectedCutiData?.nama} required/></div>
                    
                    <div className="form-group"><label>Cabang</label>
                        <select className="input-field" required>
                            <option value="">Pilih cabang</option>
                            <option value="Cabang 1">Cabang 1</option>
                            <option value="Cabang 2">Cabang 2</option>
                            <option value="Cabang 3">Cabang 3</option>
                            <option value="Cabang 4">Cabang 4</option>
                        </select>
                    </div>

                    <div className="form-group"><label>Jabatan</label><input type="text" className="input-field" defaultValue={selectedCutiData?.jabatan} required/></div>
                    <div className="form-group"><label>Divisi</label><input type="text" className="input-field" required/></div>

                    <div className="form-group"><label>Izin Cuti</label>
                        <select className="input-field" required>
                            <option value="">Pilih Jenis</option>
                            <option value="C THN">C THN</option>
                            <option value="C KHS">C KHS</option>
                        </select>
                    </div>
                    <div className="form-group"></div> 

                    <div className="form-group"><label>Tanggal Mulai</label><input type="date" className="input-field" required/></div>
                    <div className="form-group"><label>Tanggal Akhir</label><input type="date" className="input-field" required/></div>

                    <div className="form-group full-width"><label>Keterangan</label><textarea className="input-field" style={{height: '80px'}} required></textarea></div>
                    
                    <div className="form-group full-width"><label>Nomor Telefon</label><input type="tel" className="input-field" placeholder="Nomor HP" required/></div>
                    
                    <div className="form-actions-bottom">
                        <button type="submit" className="btn-simpan-green">Simpan</button>
                        <button type="button" className="btn-batal-red" onClick={handleCloseCutiModal}>Batal</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Kehadiran;