import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./datakaryawan.css"; 

// --- IMPORT ICONS ---
import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";
import iconEdit from "../../assets/edit.svg"; 

const DataKaryawan = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // State Data Karyawan
  const [karyawanList] = useState([
    { id: 1, nama: "Syahrul", jabatan: "CEO", nik: "123456789", password: "***************", tempatLahir: "Semarang", tanggalLahir: "01 Januari 2026", alamat: "Semarang" },
    { id: 2, nama: "Budi", jabatan: "Staff", nik: "987654321", password: "***************", tempatLahir: "Jakarta", tanggalLahir: "12 Februari 1999", alamat: "Jakarta Selatan" },
    { id: 3, nama: "Siti", jabatan: "HRD", nik: "1122334455", password: "***************", tempatLahir: "Bandung", tanggalLahir: "10 Maret 2000", alamat: "Bandung Kota" },
  ]);

  // --- STATE FILTER ---
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Filter");
  const toggleFilter = () => setShowFilter(!showFilter);
  const handleSelectCabang = (cabang) => { setSelectedCabang(cabang); setShowFilter(false); };

  // --- STATE MODAL EDIT ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const handleEditClick = (employee) => { setSelectedEmployee(employee); setShowEditModal(true); };
  const handleCloseEditModal = () => { setShowEditModal(false); setSelectedEmployee(null); };

  // --- STATE MODAL TAMBAH ---
  const [showAddModal, setShowAddModal] = useState(false);
  const handleAddClick = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  // --- STATE MODAL DETAIL ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState(null);
  const handleNameClick = (employee) => { setSelectedDetailEmployee(employee); setShowDetailModal(true); };
  const handleCloseDetailModal = () => { setShowDetailModal(false); setSelectedDetailEmployee(null); };

  // --- STATE MODAL PREVIEW FILE (BARU) ---
  const [previewFile, setPreviewFile] = useState(null); // { title: "Foto Diri", content: "..." }

  const handleFileClick = (title) => {
    setPreviewFile({ title: title });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  return (
    <div className="hrd-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}>
             <div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div>
          </div>
          <div className="menu-item" onClick={() => navigate('/hrd/kelolacabang')}>
             <div className="menu-left"><img src={iconKelola} alt="kelola" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div>
          </div>
          <div className="menu-item active" onClick={() => navigate('/hrd/datakaryawan')}>
             <div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div>
          </div>
          <div className="menu-item has-arrow">
             <div className="menu-left"><img src={iconKehadiran} alt="hadir" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div>
             <img src={iconBawah} alt="down" className="arrow-icon-main" />
          </div>
          <div className="menu-item">
             <div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div>
          </div>
        </nav>
        <div className="sidebar-footer">
            <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="page-header">
          <h1>Data Karyawan</h1>
          <p>Informasi karyawan anda saat ini</p>
        </div>

        <div className="action-bar">
            <div className="filter-wrapper">
                <button className="btn-filter" onClick={toggleFilter}>
                    {selectedCabang} <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? 'rotate' : ''}`}/>
                </button>
                {showFilter && (
                    <div className="filter-dropdown">
                        <div className="dropdown-item" onClick={() => handleSelectCabang("Cabang 1")}>Cabang 1</div>
                        <div className="dropdown-item" onClick={() => handleSelectCabang("Cabang 2")}>Cabang 2</div>
                        <div className="dropdown-item" onClick={() => handleSelectCabang("Cabang 3")}>Cabang 3</div>
                        <div className="dropdown-item" onClick={() => handleSelectCabang("Cabang 4")}>Cabang 4</div>
                        <div className="dropdown-item" onClick={() => handleSelectCabang("Filter")}>Semua Cabang</div>
                    </div>
                )}
            </div>
            <button className="btn-tambah" onClick={handleAddClick}>
                <img src={iconTambah} alt="+" /> Tambah Karyawan
            </button>
        </div>

        <div className="approval-section">
            <div className="approval-header">Permintaan Menunggu Approval</div>
            <div className="table-responsive">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Nama</th><th>Jabatan</th><th>Nik (User)</th><th>Password</th><th>Tempat Lahir</th><th>Tanggal Lahir</th><th>Alamat</th>
                            <th className="text-center">Edit</th><th className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {karyawanList.map((item) => (
                            <tr key={item.id}>
                                <td onClick={() => handleNameClick(item)} style={{cursor: 'pointer', fontWeight: '600'}}>{item.nama}</td>
                                <td>{item.jabatan}</td><td>{item.nik}</td><td>{item.password}</td><td>{item.tempatLahir}</td><td>{item.tanggalLahir}</td><td>{item.alamat}</td>
                                <td className="text-center"><button className="btn-edit-clean" onClick={() => handleEditClick(item)}><img src={iconEdit} alt="edit" className="img-edit-gray" /></button></td>
                                <td className="text-center"><div className="status-dots-spaced"><span className="dot dot-green"></span><span className="dot dot-red"></span></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

      {/* MODAL EDIT (EXISTING) */}
      {showEditModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="edit-title">Edit</h2>
                <p className="edit-subtitle">Data Pribadi</p>
                <hr className="edit-divider"/>
                <form className="modal-form-grid">
                    <div className="form-group"><label>Nama</label><input type="text" defaultValue={selectedEmployee?.nama} /></div>
                    <div className="form-group"><label>Tanggal Masuk</label><input type="text" placeholder="DD/MM/YYYY" /></div>
                    <div className="form-group"><label>Jabatan</label><input type="text" defaultValue={selectedEmployee?.jabatan} /></div>
                    <div className="form-group"><label>Divisi</label><input type="text" /></div>
                    <div className="form-group"><label>Nik (Username)</label><input type="text" defaultValue={selectedEmployee?.nik} /></div>
                    <div className="form-group"><label>Password</label><input type="password" defaultValue={selectedEmployee?.password} /></div>
                    <div className="form-group"><label>Tempat Lahir</label><input type="text" defaultValue={selectedEmployee?.tempatLahir} /></div>
                    <div className="form-group"><label>Tanggal Lahir</label><input type="text" defaultValue={selectedEmployee?.tanggalLahir} /></div>
                    <div className="form-group"><label>Jenis Kelamin</label><select className="custom-select"><option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                    <div className="form-group"><label>Cabang</label><select className="custom-select"><option value="">Pilih Cabang</option><option value="Cabang 1">Cabang 1</option><option value="Cabang 2">Cabang 2</option><option value="Cabang 3">Cabang 3</option><option value="Cabang 4">Cabang 4</option></select></div>
                    <div className="form-actions-final">
                        <button type="button" className="btn-cancel-stiff" onClick={handleCloseEditModal}>Batal</button>
                        <button type="submit" className="btn-save-full-width">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL TAMBAH (EXISTING) */}
      {showAddModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="edit-title">Tambah Karyawan</h2>
                <p className="edit-subtitle">Data Pribadi</p>
                <hr className="edit-divider"/>
                <form className="modal-form-grid">
                    <div className="form-group"><label>Nama</label><input type="text" /></div>
                    <div className="form-group"><label>Tanggal Masuk</label><input type="text" /></div>
                    <div className="form-group"><label>Jabatan</label><input type="text" /></div>
                    <div className="form-group"><label>Divisi</label><input type="text" /></div>
                    <div className="form-group"><label>Nik (Username)</label><input type="text" /></div>
                    <div className="form-group"><label>Password</label><input type="password" /></div>
                    <div className="form-group"><label>Tempat Lahir</label><input type="text" /></div>
                    <div className="form-group"><label>Tanggal Lahir</label><input type="text" /></div>
                    <div className="form-group"><label>Jenis Kelamin</label><select className="custom-select"><option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                    <div className="form-group"><label>Cabang</label><select className="custom-select"><option value="">Pilih Cabang</option><option value="Cabang 1">Cabang 1</option><option value="Cabang 2">Cabang 2</option><option value="Cabang 3">Cabang 3</option><option value="Cabang 4">Cabang 4</option></select></div>
                    <div className="form-actions-final">
                        <button type="button" className="btn-cancel-stiff" onClick={handleCloseAddModal}>Batal</button>
                        <button type="submit" className="btn-save-full-width">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL DETAIL KARYAWAN */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <h2 className="edit-title">Data Karyawan</h2>
                <p className="edit-subtitle">Informasi karyawan anda saat ini</p>
                
                <div className="modal-form-grid-3">
                    <div className="form-group"><label>Nama</label><input type="text" defaultValue={selectedDetailEmployee?.nama} /></div>
                    <div className="form-group"><label>Tanggal Masuk</label><input type="text" placeholder="DD/MM/YYYY" /></div>
                    <div className="form-group"><label>Jabatan</label><input type="text" defaultValue={selectedDetailEmployee?.jabatan} /></div>
                    <div className="form-group"><label>Divisi</label><input type="text" /></div>
                    <div className="form-group"><label>Nik (Username)</label><input type="text" defaultValue={selectedDetailEmployee?.nik} /></div>
                    <div className="form-group"><label>Password</label><input type="password" defaultValue={selectedDetailEmployee?.password} /></div>
                    <div className="form-group"><label>Tempat Lahir</label><input type="text" defaultValue={selectedDetailEmployee?.tempatLahir} /></div>
                    <div className="form-group"><label>Tanggal Lahir</label><input type="text" defaultValue={selectedDetailEmployee?.tanggalLahir} /></div>
                    <div className="form-group"><label>Jenis Kelamin</label><select className="custom-select"><option>Pilih</option></select></div>
                    <div className="form-group"><label>Cabang</label><select className="custom-select"><option>Pilih</option></select></div>
                    <div className="form-group"><label>Alamat</label><input type="text" defaultValue={selectedDetailEmployee?.alamat} /></div>
                    <div className="form-group"></div>

                    {/* AREA FILE YANG BISA DIKLIK */}
                    <div className="form-group"><label>Foto Diri</label><div className="file-upload-box clickable" onClick={() => handleFileClick("Foto Diri")}></div></div>
                    <div className="form-group"><label>Foto KTP</label><div className="file-upload-box clickable" onClick={() => handleFileClick("Foto KTP")}></div></div>
                    <div className="form-group"><label>KK (Kartu Keluarga)</label><div className="file-upload-box clickable" onClick={() => handleFileClick("KK (Kartu Keluarga)")}></div></div>
                    <div className="form-group"><label>SKCK</label><div className="file-upload-box clickable" onClick={() => handleFileClick("SKCK")}></div></div>
                    <div className="form-group"><label>SIM</label><div className="file-upload-box clickable" onClick={() => handleFileClick("SIM")}></div></div>
                    <div className="form-group"><label>Sertifikat Pendukung</label><div className="file-upload-box clickable" onClick={() => handleFileClick("Sertifikat Pendukung")}></div></div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL PREVIEW FILE (NEW) --- */}
      {previewFile && (
        // z-index lebih tinggi dari modal detail agar menumpuk di atasnya
        <div className="modal-overlay" style={{zIndex: 1100}} onClick={handleClosePreview}>
            <div className="preview-content" onClick={(e) => e.stopPropagation()}>
                {/* Judul File di Tengah Atas */}
                <h3 className="preview-title">{previewFile.title}</h3>
                
                {/* Area Preview Kosong (Placeholder) */}
                <div className="preview-image-placeholder">
                    {/* Nanti diisi <img> jika sudah ada gambarnya */}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default DataKaryawan;