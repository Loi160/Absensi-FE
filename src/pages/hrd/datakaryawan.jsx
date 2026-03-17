import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./datakaryawan.css";

/* ================= ICON IMPORT ================= */
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

  // --- DATA SELURUH CABANG AMAGA CORP ---
  const semuaCabangAmaga = [
    "F&B Jakarta",
    "F&B Sudirman (Sub)",
    "F&B Kemang (Sub)",
    "Jam Tangan Jkt",
    "Pakaian Jkt",
    "Sepatu Jkt"
  ];

  /* ================= DATA DUMMY ================= */
  const [karyawanList] = useState([
    {
      id: 1, nama: "Syahrul", jabatan: "CEO", nik: "123456789", password: "123", tempatLahir: "Semarang", tanggalLahir: "01 Januari 2026", alamat: "Semarang", divisi: "Operasional", tanggalMasuk: "01/01/2023", jenisKelamin: "Laki-laki", 
      cabang: "F&B Jakarta", 
      status: "Aktif" 
    },
    {
      id: 2, nama: "Budi", jabatan: "Staff", nik: "987654321", password: "123", tempatLahir: "Jakarta", tanggalLahir: "12 Februari 1999", alamat: "Jakarta Selatan", divisi: "Marketing", tanggalMasuk: "15/03/2023", jenisKelamin: "Laki-laki", 
      cabang: "F&B Kemang (Sub)", 
      status: "Aktif"
    },
    {
      id: 3, nama: "Siti", jabatan: "HRD", nik: "1122334455", password: "123", tempatLahir: "Bandung", tanggalLahir: "10 Maret 2000", alamat: "Bandung Kota", divisi: "HR", tanggalMasuk: "20/05/2023", jenisKelamin: "Perempuan", 
      cabang: "Jam Tangan Jkt", 
      status: "Resign" 
    },
  ]);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang");
  
  const [showModal, setShowModal] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false); 
  const [selectedEmployee, setSelectedEmployee] = useState(null); 

  /* ================= HANDLERS ================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleSelectCabang = (cabang) => {
    setSelectedCabang(cabang);
    setShowFilter(false);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);       
    setSelectedEmployee(null);  
    setShowModal(true);         
  };

  const handleOpenEdit = (employee, e) => {
    e.stopPropagation(); 
    setIsEditMode(true);        
    setSelectedEmployee(employee); 
    setShowModal(true);         
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleRowClick = (employee) => {
    navigate("/hrd/detail-karyawan", { state: { employee: employee } });
  };

  /* ================= COMPONENTS ================= */
  const FilterDropdown = () => (
    <div className="filter-wrapper">
      <button className="btn-filter" onClick={toggleFilter}>
        {selectedCabang}
        <img src={iconBawah} alt="" className={`filter-arrow ${showFilter ? "rotate" : ""}`} />
      </button>
      {showFilter && (
        <div className="filter-dropdown">
          {["Semua Cabang", ...semuaCabangAmaga].map((cabang, index) => (
            <div key={index} className="dropdown-item" onClick={() => handleSelectCabang(cabang)}>
              {cabang}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTable = () => (
    <table className="custom-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Jabatan</th>
          <th>NIK</th>
          <th>Password</th>
          <th>Tempat Lahir</th>
          <th>Tanggal Lahir</th>
          <th>Alamat</th>
          <th className="text-center">Edit</th>
          <th className="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {karyawanList.map((item) => (
          <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item)}>
            <td className="clickable-name">{item.nama}</td>
            <td>{item.jabatan}</td>
            <td>{item.nik}</td>
            <td>{item.password}</td>
            <td>{item.tempatLahir}</td>
            <td>{item.tanggalLahir}</td>
            <td>{item.alamat}</td>
            <td className="text-center" onClick={(e) => e.stopPropagation()}>
              <button className="btn-edit-clean" onClick={(e) => handleOpenEdit(item, e)}>
                <img src={iconEdit} alt="Edit" className="img-edit-gray" />
              </button>
            </td>
            <td className="text-center" onClick={(e) => e.stopPropagation()}>
              <div className="status-dots-spaced">
                {item.status === 'Aktif' ? (
                  <span className="dot dot-green" title="Aktif"></span>
                ) : (
                  <span className="dot dot-red" title="Resign"></span>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="hrd-container">
      <aside className="sidebar">
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate("/hrd/dashboard")}><div className="menu-left"><img src={iconDashboard} alt="" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item" onClick={() => navigate("/hrd/kelolacabang")}><div className="menu-left"><img src={iconKelola} alt="" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div></div>
          <div className="menu-item active"><div className="menu-left"><img src={iconKaryawan} alt="" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item has-arrow" onClick={() => navigate("/hrd/absenmanual")}><div className="menu-left"><img src={iconKehadiran} alt="" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div><img src={iconBawah} alt="" className="arrow-icon-main" /></div>
          <div className="menu-item" onClick={() => navigate("/hrd/laporan")}><div className="menu-left"><img src={iconLaporan} alt="" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h1>Data Karyawan</h1>
          <p>Daftar pusat informasi dan detail administrasi karyawan</p>
        </div>
        
        <div className="action-bar">
          <FilterDropdown />
          <button className="btn-tambah" onClick={handleOpenAdd}><img src={iconTambah} alt="" /> Tambah Karyawan</button>
        </div>
        
        <div className="approval-section" style={{ marginTop: "20px" }}>
           <div className="approval-header">Daftar Karyawan</div>
           {renderTable()}
        </div>
      </main>

      {/* MODAL ADD / EDIT */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{isEditMode ? "Edit Karyawan" : "Tambah Karyawan"}</h2>
              <p className="modal-subtitle">{isEditMode ? "Ubah data pribadi karyawan" : "Silahkan lengkapi data karyawan baru"}</p>
              <hr className="modal-divider" style={{margin: '15px 0', border: 'none', borderBottom: '1px solid #ddd'}} />
            </div>
            <div className="modal-form">
              <div className="form-grid-3">
                <div className="form-group"><label>Nama</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.nama : ""} /></div>
                <div className="form-group"><label>Tanggal Masuk</label><input type="date" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.tanggalMasuk : ""} /></div>
                <div className="form-group"><label>Jabatan</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.jabatan : ""} /></div>
                
                <div className="form-group"><label>Divisi</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.divisi : ""} /></div>
                <div className="form-group"><label>Nik (Username)</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.nik : ""} /></div>
                <div className="form-group"><label>Password</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.password : ""} /></div>
                
                <div className="form-group"><label>Tempat Lahir</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.tempatLahir : ""} /></div>
                <div className="form-group"><label>Tanggal Lahir</label><input type="date" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.tanggalLahir : ""} /></div>
                <div className="form-group"><label>Jenis Kelamin</label><select className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.jenisKelamin : ""}><option value="">Pilih</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
                
                <div className="form-group">
                  <label>Cabang Penempatan</label>
                  <select className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.cabang : ""}>
                    <option value="">Pilih Cabang</option>
                    {semuaCabangAmaga.map((cabangName, index) => (
                      <option key={index} value={cabangName}>{cabangName}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status Karyawan</label>
                  <select className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.status : "Aktif"}>
                    <option value="Aktif">Aktif</option>
                    <option value="Resign">Resign</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{marginBottom: '20px'}}><label>Alamat</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.alamat : ""} /></div>
              
              <div className="docs-section">
                <h4 style={{fontSize: '14px', marginBottom: '10px'}}>Dokumen Pendukung</h4>
                <div className="form-grid-3">
                  {["Foto Diri", "Foto KTP", "KK", "SKCK", "SIM", "Sertifikat"].map((label, idx) => (
                    <div key={idx} className="form-group">
                        <label>{label}</label>
                        <input type="file" className="input-gray" style={{fontSize: '12px'}} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-batal" onClick={handleCloseModal}>Batal</button>
              <button className="btn-simpan">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKaryawan;