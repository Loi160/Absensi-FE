import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../hrd/datakaryawan.css"; // Menggunakan CSS utama dari HRD

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconPerizinan from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";

// Icon Mata SVG (Sederhana)
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const DataKaryawanManagerCabang = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const [userData, setUserData] = useState({ nama: "Manager", cabangUtama: "Memuat...", subCabang: [] });
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("Semua Sub-Cabang");
  const [showModal, setShowModal] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: "", nik: "", password: "", role: "karyawan", cabang_id: "", jabatan: "", divisi: "", no_telp: "", tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "", alamat: "", status: "Aktif"
  });

  useEffect(() => {
    if (user) {
      setUserData({
        nama: user.nama,
        cabangUtama: user.cabangUtama,
        subCabang: user.subCabang || [],
      });

      const fetchKaryawan = async () => {
        try {
          setLoading(true);
          const res = await fetch("http://localhost:3000/api/karyawan");
          const data = await res.json();
          
          // Filter hanya karyawan yang ada di cabang utama atau sub-cabangnya
          const allMyBranches = [user.cabangUtama, ...(user.subCabang || [])];
          const filteredByBranch = data.filter(k => allMyBranches.includes(k.cabang?.nama));
          
          setKaryawanList(filteredByBranch);
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchKaryawan();
    }
  }, [user]);

  const hasSubCabang = userData.subCabang.length > 0;
  const opsiCabangManager = [userData.cabangUtama, ...userData.subCabang].filter(Boolean);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleNav = (path) => { closeSidebar(); navigate(path); };

  const handleRowClick = (karyawan) => {
    navigate("/managerCabang/detailkaryawan", { state: { employee: karyawan } });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cabang_id) return alert("Pilih cabang terlebih dahulu!");

    // Menyesuaikan penempatan cabang dari Teks(nama) ke ID cabang. 
    // *Catatan: Di tahap produksi, dropdown cabang sebaiknya menarik data ID dari Supabase.
    // Di contoh ini kita berasumsi endpoint menerima nama cabang jika tidak ada ID khusus.
    const payloadData = { ...formData };

    try {
      const res = await fetch("http://localhost:3000/api/karyawan", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadData)
      });
      if (res.ok) {
        alert("Karyawan berhasil ditambahkan!");
        setShowModal(false);
        window.location.reload(); // Refresh data
      } else { alert("Gagal menyimpan data."); }
    } catch (err) { alert("Kesalahan jaringan."); }
  };

  // Filter data berdasarkan dropdown cabang yang dipilih
  const filteredData = karyawanList.filter((k) => {
    if (!hasSubCabang) return true; // Jika tidak punya sub cabang, tampilkan semua
    if (selectedCabang === "Semua Sub-Cabang") return true;
    return k.cabang?.nama === selectedCabang;
  });

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar}><span></span><span></span><span></span></button>
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar}>✕</button>
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav('/managerCabang/dashboard')}><div className="menu-left"><img src={iconDashboard} alt="" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item active"><div className="menu-left"><img src={iconKaryawan} alt="" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/managerCabang/perizinan')}><div className="menu-left"><img src={iconPerizinan} alt="" className="menu-icon-main" /><span className="menu-text-main">Perizinan</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/managerCabang/laporan')}><div className="menu-left"><img src={iconLaporan} alt="" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      <main className="main-content">
        
        {/* HEADER AREA (Teks Saja) */}
        <header className="dk-header-area">
          <h1 className="dk-title">Data Karyawan - {userData.cabangUtama}</h1>
          <p className="dk-subtitle">Daftar pusat informasi dan detail administrasi karyawan</p>
        </header>

        {/* ACTION ROW (Tombol di bawah teks, merapat ke kanan) */}
        <div className="dk-action-row">
          <div className="dk-action-group">
            <div className="filter-wrapper">
              <button 
                className="btn-dk-filter" 
                onClick={() => { if (hasSubCabang) setShowFilter(!showFilter) }}
                style={{ cursor: hasSubCabang ? 'pointer' : 'default', opacity: hasSubCabang ? 1 : 0.8 }}
              >
                {!hasSubCabang ? userData.cabangUtama : selectedCabang} 
                {hasSubCabang && <img src={iconBawah} alt="v" style={{ width: '10px', filter: 'brightness(0) invert(1)', transform: showFilter ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
              </button>
              {showFilter && hasSubCabang && (
                <div className="filter-dropdown">
                  <div className="dropdown-item" onClick={() => {setSelectedCabang("Semua Sub-Cabang"); setShowFilter(false)}}>Semua Sub-Cabang</div>
                  {userData.subCabang.map((c, idx) => <div key={idx} className="dropdown-item" onClick={() => {setSelectedCabang(c); setShowFilter(false)}}>{c}</div>)}
                </div>
              )}
            </div>
            <button className="btn-dk-tambah" onClick={() => setShowModal(true)}>
              <img src={iconTambah} alt="+" /> Tambah Karyawan
            </button>
          </div>
        </div>

        {/* TABLE KARYAWAN */}
        <div className="dk-table-container">
          <div className="dk-table-header-title">Daftar Karyawan</div>
          <div className="dk-table-wrapper">
            <table className="dk-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>NIK (Username)</th>
                  <th>Password</th>
                  <th>Tempat Lahir</th>
                  <th>Tanggal Lahir</th>
                  <th>Alamat</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Memuat data...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Tidak ada karyawan.</td></tr>
                ) : (
                  filteredData.map((k) => {
                    const isActive = k.status === 'Aktif' || !k.status; 
                    return (
                      <tr key={k.id} onClick={() => handleRowClick(k)}>
                        <td className="dk-td-name">{k.nama}</td>
                        <td>{k.jabatan || "-"}</td>
                        <td>{k.nik}</td>
                        <td>
                           <div className="dk-pwd-mask">
                              <span>........</span> <EyeOffIcon />
                           </div>
                        </td>
                        <td>{k.tempat_lahir || "-"}</td>
                        <td>{k.tanggal_lahir || "-"}</td>
                        <td>{k.alamat || "-"}</td>
                        <td className="text-center">
                          <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ================= MODAL TAMBAH KARYAWAN ================= */}
      {showModal && (
        <div className="modal-overlay-clean" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Tambah Karyawan Baru</h2>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-grid-2">
                <div className="form-group"><label>Nama Lengkap</label><input type="text" className="input-edit" required onChange={(e) => setFormData({...formData, nama: e.target.value})} /></div>
                <div className="form-group"><label>NIK (Username)</label><input type="text" className="input-edit" required onChange={(e) => setFormData({...formData, nik: e.target.value})} /></div>
                
                <div className="form-group">
                  <label>Password Login</label>
                  <div className="pwd-wrapper">
                    <input type={showPasswordInModal ? "text" : "password"} className="input-edit" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <button type="button" className="btn-eye" onClick={() => setShowPasswordInModal(!showPasswordInModal)}>
                      {showPasswordInModal ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Role Akses</label>
                  <select className="input-edit" required onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="karyawan">Karyawan Biasa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Penempatan Cabang</label>
                  <select className="input-edit" required onChange={(e) => setFormData({...formData, cabang_id: e.target.value})}>
                    <option value="">Pilih Cabang...</option>
                    {opsiCabangManager.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>No. Telepon / WA</label><input type="text" className="input-edit" onChange={(e) => setFormData({...formData, no_telp: e.target.value})} /></div>
                <div className="form-group"><label>Jabatan</label><input type="text" className="input-edit" placeholder="Misal: Staff IT" onChange={(e) => setFormData({...formData, jabatan: e.target.value})} /></div>
                <div className="form-group"><label>Divisi</label><input type="text" className="input-edit" placeholder="Misal: Technology" onChange={(e) => setFormData({...formData, divisi: e.target.value})} /></div>
                <div className="form-group"><label>Tempat Lahir</label><input type="text" className="input-edit" onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})} /></div>
                <div className="form-group"><label>Tanggal Lahir</label><input type="date" className="input-edit" onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})} /></div>
                <div className="form-group">
                  <label>Jenis Kelamin</label>
                  <select className="input-edit" required onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}>
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="form-group"><label>Alamat</label><input type="text" className="input-edit" onChange={(e) => setFormData({...formData, alamat: e.target.value})} /></div>
              </div>

              <div className="detail-footer" style={{ marginTop: '20px', paddingBottom: '0' }}>
                <button type="button" className="btn-batal" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-simpan">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKaryawanManagerCabang;