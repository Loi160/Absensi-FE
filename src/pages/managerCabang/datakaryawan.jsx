import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../hrd/datakaryawan.css";

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg"; 
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";
import iconEdit from "../../assets/edit.svg";

const DataKaryawanManagerCabang = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    nama: "Loading...",
    cabangUtama: "Memuat Data...",
    subCabang: [] 
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          nama: parsedUser.nama || "Manager",
          cabangUtama: parsedUser.cabangUtama || "Cabang Tidak Diketahui",
          subCabang: Array.isArray(parsedUser.subCabang) ? parsedUser.subCabang : []
        });
      } catch (error) {
        console.error("Gagal memparsing data user dari localStorage", error);
      }
    }
  }, [navigate]);

  // --- DROPDOWN DINAMIS MANAGER (Hanya cabang yang dikelola) ---
  const opsiCabangManager = [userData.cabangUtama, ...userData.subCabang].filter(Boolean);

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
    }
  ]);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Sub-Cabang"); 

  const hasSubCabang = userData.subCabang.length > 0;
  const isStackedMode = hasSubCabang && selectedCabang === "Semua Sub-Cabang";

  const [showModal, setShowModal] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false); 
  const [selectedEmployee, setSelectedEmployee] = useState(null); 

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => { if (hasSubCabang) setShowFilter(!showFilter); };
  const handleSelectCabang = (cabang) => { setSelectedCabang(cabang); setShowFilter(false); };
  
  const handleOpenAdd = () => { setIsEditMode(false); setSelectedEmployee(null); setShowModal(true); };
  const handleOpenEdit = (employee, e) => { e.stopPropagation(); setIsEditMode(true); setSelectedEmployee(employee); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setSelectedEmployee(null); };

  const handleRowClick = (employee) => {
    navigate("/managerCabang/detail-karyawan", { state: { employee: employee } });
  };

  const FilterDropdown = () => (
    <div className="filter-wrapper">
      <button className="btn-filter" onClick={toggleFilter} style={{ cursor: hasSubCabang ? 'pointer' : 'default' }}>
        {!hasSubCabang ? userData.cabangUtama : selectedCabang}
        {hasSubCabang && (<img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? "rotate" : ""}`} />)}
      </button>
      {showFilter && hasSubCabang && (
        <div className="filter-dropdown">
          {["Semua Sub-Cabang", ...userData.subCabang].map((cabang, index) => (
            <div key={index} className="dropdown-item" onClick={() => handleSelectCabang(cabang)}>{cabang}</div>
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
            <td className="text-center" onClick={(e) => e.stopPropagation()}><button className="btn-edit-clean" onClick={(e) => handleOpenEdit(item, e)}><img src={iconEdit} alt="Edit" className="img-edit-gray" /></button></td>
            <td className="text-center" onClick={(e) => e.stopPropagation()}>
              <div className="status-dots-spaced">{item.status === 'Aktif' ? (<span className="dot dot-green" title="Aktif"></span>) : (<span className="dot dot-red" title="Resign"></span>)}</div>
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
          <div className="menu-item" onClick={() => navigate('/managerCabang/dashboard')}><div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main"/> <span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item active"><div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main"/> <span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item" onClick={() => navigate('/managerCabang/perizinan')}><div className="menu-left"><img src={iconPerizinan} alt="perizinan" className="menu-icon-main"/> <span className="menu-text-main">Perizinan</span></div></div>
          <div className="menu-item" onClick={() => navigate('/managerCabang/laporan')}><div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main"/> <span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h1>Data Karyawan - {userData.cabangUtama}</h1>
          <p>Daftar pusat informasi dan detail administrasi karyawan</p>
        </div>
        {!isStackedMode && (
          <div className="action-bar"><FilterDropdown /><button className="btn-tambah" onClick={handleOpenAdd}><img src={iconTambah} alt="" /> Tambah Karyawan</button></div>
        )}
        {isStackedMode ? (
          <div className="stacked-layout">
            {userData.subCabang.map((subCabang, index) => (
              <div key={index} className="stacked-card-wrapper">
                <div className="sub-branch-header">
                  <h3 className="sub-branch-title">{subCabang}</h3>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {index === 0 && <FilterDropdown />}
                    <button className="btn-tambah" onClick={handleOpenAdd}><img src={iconTambah} alt="" /> Tambah Karyawan</button>
                  </div>
                </div>
                <div className="approval-section"><div className="approval-header">Daftar Karyawan</div>{renderTable()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="approval-section" style={{ marginTop: !isStackedMode ? "0" : "20px" }}><div className="approval-header">Daftar Karyawan</div>{renderTable()}</div>
        )}
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
                    {opsiCabangManager.map((cabangName, index) => (
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

export default DataKaryawanManagerCabang;