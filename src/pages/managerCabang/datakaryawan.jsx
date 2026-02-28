import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../hrd/datakaryawan.css"; // Mengambil CSS dari HRD

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
// iconKelola dihapus karena tidak dipakai
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg"; // Dipakai untuk menu Perizinan
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg"; // Tetap dipertahankan untuk FilterDropdown
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";
import iconEdit from "../../assets/edit.svg";

const DataKaryawanManager = () => {
  const navigate = useNavigate();

  /* ================= DATA DUMMY ================= */
  const [karyawanList] = useState([
    {
      id: 1,
      nama: "Syahrul",
      jabatan: "CEO",
      nik: "123456789",
      password: "123",
      tempatLahir: "Semarang",
      tanggalLahir: "01 Januari 2026",
      alamat: "Semarang",
      divisi: "Operasional",
      tanggalMasuk: "01/01/2023",
      jenisKelamin: "Laki-laki",
      cabang: "1"
    },
    {
      id: 2,
      nama: "Budi",
      jabatan: "Staff",
      nik: "987654321",
      password: "123",
      tempatLahir: "Jakarta",
      tanggalLahir: "12 Februari 1999",
      alamat: "Jakarta Selatan",
      divisi: "Marketing",
      tanggalMasuk: "15/03/2023",
      jenisKelamin: "Laki-laki",
      cabang: "2"
    },
    {
      id: 3,
      nama: "Siti",
      jabatan: "HRD",
      nik: "1122334455",
      password: "123",
      tempatLahir: "Bandung",
      tanggalLahir: "10 Maret 2000",
      alamat: "Bandung Kota",
      divisi: "HR",
      tanggalMasuk: "20/05/2023",
      jenisKelamin: "Perempuan",
      cabang: "3"
    },
  ]);

  const cabang4SubBranches = ["Cabang A", "Cabang B", "Cabang C"];

  /* ================= STATE CONFIG ================= */
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Filter");
  
  // STATE MODAL EDIT/ADD
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

  // --- LOGIC MODAL ADD/EDIT ---
  const handleOpenAdd = () => {
    setIsEditMode(false);       
    setSelectedEmployee(null);  
    setShowModal(true);         
  };

  const handleOpenEdit = (employee) => {
    setIsEditMode(true);        
    setSelectedEmployee(employee); 
    setShowModal(true);         
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  // --- LOGIC PINDAH KE HALAMAN DETAIL ---
  const handleNameClick = (employee) => {
    // Navigasi ke route detail manager cabang
    navigate("/managerCabang/detail-karyawan", { state: { employee: employee } });
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
          {["Cabang 1", "Cabang 2", "Cabang 3", "Cabang 4", "Semua Cabang"].map((cabang, index) => (
            <div key={index} className="dropdown-item" onClick={() => handleSelectCabang(cabang === "Semua Cabang" ? "Filter" : cabang)}>
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
          <th>Nik</th>
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
          <tr key={item.id}>
            {/* CLICK NAMA -> PINDAH HALAMAN */}
            <td 
              style={{ fontWeight: 600, cursor: "pointer", color: "#222" }} 
              onClick={() => handleNameClick(item)}
              className="hover-underline"
            >
              {item.nama}
            </td>
            <td>{item.jabatan}</td>
            <td>{item.nik}</td>
            <td>{item.password}</td>
            <td>{item.tempatLahir}</td>
            <td>{item.tanggalLahir}</td>
            <td>{item.alamat}</td>
            <td className="text-center">
              <button className="btn-edit-clean" onClick={() => handleOpenEdit(item)}>
                <img src={iconEdit} alt="Edit" className="img-edit-gray" />
              </button>
            </td>
            <td className="text-center">
              <div className="status-dots-spaced">
                <span className="dot dot-green"></span>
                <span className="dot dot-red"></span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="hrd-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate("/managerCabang/dashboard")}>
            <div className="menu-left">
                <img src={iconDashboard} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          
          {/* Menu Kelola Cabang Dihapus */}

          {/* Menu Active: Data Karyawan */}
          <div className="menu-item active">
            <div className="menu-left">
                <img src={iconKaryawan} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          {/* Menu Kehadiran diubah jadi Perizinan */}
          <div className="menu-item" onClick={() => navigate("/managerCabang/perizinan")}>
            <div className="menu-left">
                <img src={iconKehadiran} alt="" className="menu-icon-main" />
                <span className="menu-text-main">Perizinan</span>
            </div>
          </div>

          <div className="menu-item" onClick={() => navigate("/managerCabang/laporan")}>
            <div className="menu-left">
                <img src={iconLaporan} alt="" className="menu-icon-main" />
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
        <div className="page-header">
          <h1>Data Karyawan</h1>
          <p>Daftar pusat informasi dan detail administrasi karyawan cabang</p>
        </div>

        {selectedCabang !== "Cabang 4" && (
          <div className="action-bar">
            <FilterDropdown />
            <button className="btn-tambah" onClick={handleOpenAdd}>
              <img src={iconTambah} alt="" /> Tambah Karyawan
            </button>
          </div>
        )}

        {selectedCabang === "Cabang 4" ? (
          <div className="stacked-layout">
            {cabang4SubBranches.map((subCabang, index) => (
              <div key={index} className="stacked-card-wrapper">
                <div className="sub-branch-header">
                  <h3 className="sub-branch-title">{subCabang}</h3>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {index === 0 && <FilterDropdown />}
                    <button className="btn-tambah" onClick={handleOpenAdd}>
                      <img src={iconTambah} alt="" /> Tambah Karyawan
                    </button>
                  </div>
                </div>
                <div className="approval-section">
                  <div className="approval-header">Permintaan Menunggu Approval</div>
                  {renderTable()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="approval-section" style={{ marginTop: selectedCabang !== "Cabang 4" ? "0" : "20px" }}>
            <div className="approval-header">Permintaan Menunggu Approval</div>
            {renderTable()}
          </div>
        )}
      </main>

      {/* MODAL ADD / EDIT */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{isEditMode ? "Edit" : "Tambah Karyawan"}</h2>
              <p className="modal-subtitle">{isEditMode ? "Data Pribadi" : "Silahkan lengkapi data karyawan baru"}</p>
              <hr className="modal-divider" />
            </div>
            <div className="modal-form">
              <div className="form-grid">
                <div className="form-group"><label>Nama</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.nama : ""} /></div>
                <div className="form-group"><label>Tanggal Masuk</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.tanggalMasuk : ""} /></div>
                <div className="form-group"><label>Jabatan</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.jabatan : ""} /></div>
                <div className="form-group"><label>Divisi</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.divisi : ""} /></div>
                <div className="form-group"><label>Nik (Username)</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.nik : ""} /></div>
                <div className="form-group"><label>Password</label><input type="password" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.password : ""} /></div>
                <div className="form-group"><label>Tempat Lahir</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.tempatLahir : ""} /></div>
                <div className="form-group"><label>Tanggal Lahir</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.tanggalLahir : ""} /></div>
                <div className="form-group"><label>Jenis Kelamin</label><select className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.jenisKelamin : ""}><option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                <div className="form-group"><label>Cabang</label><select className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.cabang : ""}><option value="">Pilih Cabang</option><option value="1">Cabang 1</option><option value="2">Cabang 2</option><option value="3">Cabang 3</option><option value="4">Cabang 4</option></select></div>
              </div>
              <div className="form-group full-width"><label>Alamat</label><input type="text" className="input-gray" defaultValue={isEditMode && selectedEmployee ? selectedEmployee.alamat : ""} /></div>
              <div className="docs-section">
                <h4 className="docs-title">Dokumen Pendukung</h4>
                <hr className="modal-divider" />
                <div className="upload-grid">
                  {["Foto Diri", "Foto KTP", "KK (Kartu Keluarga)", "SKCK", "SIM", "Sertifikat Pendukung", "Dokumen Tambahan"].map((label, idx) => (
                    <div key={idx} className="upload-box">
                      <p className="upload-label">{label}</p>
                      <div className="upload-content"><span className="upload-icon">⬆</span><span className="upload-text">Klik untuk upload</span></div>
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

export default DataKaryawanManager;