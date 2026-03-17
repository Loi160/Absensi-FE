import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// FIX: Mengambil CSS langsung dari folder hrd
import "../hrd/laporan.css"; 

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconIzin from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const LaporanManagerCabang = () => {
  const navigate = useNavigate();
  
  // ==========================================
  // 1. STATE USER DATA (Dari localStorage)
  // ==========================================
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

  const hasSubCabang = userData.subCabang.length > 0;
  
  const [showFilter, setShowFilter] = useState(false);
  // Default filter: Jika ada sub-cabang, tampilkan semua secara ditumpuk
  const [selectedFilter, setSelectedFilter] = useState("Semua Sub-Cabang");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => {
    if (hasSubCabang) setShowFilter(!showFilter);
  };
  
  const handleSelectFilter = (val) => { 
    setSelectedFilter(val); 
    setShowFilter(false); 
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getRowTerlambatClass = (jumlahTerlambat) => {
    const angka = parseInt(jumlahTerlambat, 10);
    if (isNaN(angka)) return ""; 
    if (angka === 3) return "row-warn-yellow";        
    if (angka >= 4 && angka <= 5) return "row-warn-orange";  
    if (angka >= 6) return "row-warn-red";            
    return ""; 
  };

  /* ================= DATA DUMMY MANAGER ================= */
  // Asumsikan data ini diambil dari API berdasarkan hak akses Manager
  const dataLaporan = [
    { id: 1, nama: "Syahrul", cabang: "F&B Sudirman", hadirApp: "10", hadirManual: "10", izin: "2", sakit: "3", cuti: "2", terlambat: "1", fimtk: "1 Jam", lembur: "1 Jam", alpha: "1" },
    { id: 2, nama: "Budi Santoso", cabang: "F&B Kemang", hadirApp: "12", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "3", fimtk: "-", lembur: "2 Jam", alpha: "0" }, 
    { id: 3, nama: "Siti Aminah", cabang: "F&B Sudirman", hadirApp: "11", hadirManual: "1", izin: "1", sakit: "0", cuti: "1", terlambat: "5", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 4, nama: "Joko Anwar", cabang: "F&B Senayan", hadirApp: "15", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "6", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 5, nama: "Rina Kartika", cabang: "Amaga Watch Jkt", hadirApp: "14", hadirManual: "0", izin: "0", sakit: "1", cuti: "0", terlambat: "0", fimtk: "-", lembur: "-", alpha: "0" }, 
  ];

  /* FILTER DATA BERDASARKAN INPUT DAN DROPDOWN */
  const filteredData = dataLaporan.filter(item => {
    const matchName = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    let matchBranch = true; 
    
    // Jika Manager punya Sub-Cabang dan TIDAK sedang melihat "Semua Sub-Cabang"
    if (hasSubCabang && selectedFilter !== "Semua Sub-Cabang") {
        matchBranch = item.cabang === selectedFilter;
    }
    // Jika tidak punya Sub-Cabang, otomatis tampilkan cabang utamanya saja (data sudah harus difilter dari API)
    
    return matchName && matchBranch;
  });

  const renderTable = (headerText, tableData) => (
    <div className="neo-table-card">
      <div className="neo-table-header">{headerText}</div>
      <div className="neo-table-wrapper">
        <table className="neo-table">
          <thead>
            <tr>
              <th>Nama Karyawan</th>
              <th className="text-center">Hadir</th>
              <th className="text-center">Izin</th>
              <th className="text-center">Sakit</th>
              <th className="text-center">Cuti</th>
              <th className="text-center">Terlambat</th>
              <th className="text-center">FIMTK</th>
              <th className="text-center">Lembur</th>
              <th className="text-center">Alpha</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((item) => {
                const rowClass = getRowTerlambatClass(item.terlambat);

                return (
                  <tr key={item.id} className={rowClass}>
                    <td className="neo-td-name">{item.nama}</td>
                    <td className="text-center">
                      <div className="neo-dual-badge-container">
                        <span className="neo-badge" title="Dari App">{item.hadirApp}</span>
                        <span className="neo-badge manual" title="Input HRD">{item.hadirManual}</span>
                      </div>
                    </td>
                    <td className="text-center"><span className="neo-badge">{item.izin}</span></td>
                    <td className="text-center"><span className="neo-badge">{item.sakit}</span></td>
                    <td className="text-center"><span className="neo-badge">{item.cuti}</span></td>
                    <td className="text-center">
                        <span className={`neo-badge ${rowClass ? 'warn-badge' : ''}`}>
                            {item.terlambat}
                        </span>
                    </td>
                    <td className="text-center"><span className="neo-badge info">{item.fimtk}</span></td>
                    <td className="text-center"><span className="neo-badge info">{item.lembur}</span></td>
                    <td className="text-center"><span className="neo-badge alert">{item.alpha}</span></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="empty-state">
                  Data karyawan {searchTerm ? `dengan nama "${searchTerm}" ` : ""}tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="hrd-container">
      {/* SIDEBAR MANAGER CABANG */}
      <aside className="sidebar no-print">
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/managerCabang/dashboard')}>
            <div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div>
          </div>
          <div className="menu-item" onClick={() => navigate('/managerCabang/datakaryawan')}>
            <div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div>
          </div>
          <div className="menu-item" onClick={() => navigate('/managerCabang/perizinan')}>
            <div className="menu-left"><img src={iconIzin} alt="perizinan" className="menu-icon-main" /><span className="menu-text-main">Perizinan</span></div>
          </div>
          <div className="menu-item active">
            <div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        <header className="content-header">
            <div className="header-text">
                <h1>Laporan Kehadiran - {userData.cabangUtama}</h1>
                <p>Data rekapitulasi absensi karyawan di wilayah kerja Anda</p>
            </div>
        </header>

        {/* ZONE FILTER & BUTTONS */}
        <div className="neo-filter-zone no-print">
            <div className="input-group-neo">
                
                {/* INPUT PENCARIAN NAMA */}
                <div className="neo-field">
                    <label>Cari Nama</label>
                    <input 
                        type="text" 
                        placeholder="Ketik nama..." 
                        className="neo-input" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* INPUT TANGGAL MULAI */}
                <div className="neo-field">
                    <label>Tanggal Mulai</label>
                    <input 
                        type="date" 
                        className="neo-input" 
                        max={getTodayDate()} 
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (endDate && e.target.value > endDate) {
                            setEndDate("");
                          }
                        }}
                    />
                </div>

                {/* INPUT TANGGAL SELESAI */}
                <div className="neo-field">
                    <label>Tanggal Selesai</label>
                    <input 
                        type="date" 
                        className="neo-input" 
                        min={startDate} 
                        max={getTodayDate()} 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={!startDate} 
                    />
                </div>
            </div>

            {/* BUTTON GROUP & FILTER DROPDOWN DINAMIS */}
            <div className="button-group-vertical-right">
                <button className="btn-neo-print-top" onClick={() => window.print()}>Print</button>
                
                <div className="dropdown-neo-bottom-wrapper">
                    <button 
                        className="btn-neo-filter-bottom" 
                        onClick={toggleFilter}
                        style={{ cursor: hasSubCabang ? 'pointer' : 'default', border: hasSubCabang ? '' : '1px solid #ccc', color: hasSubCabang ? '' : '#666' }}
                    >
                        {!hasSubCabang ? userData.cabangUtama : selectedFilter} 
                        {hasSubCabang && <img src={iconBawah} alt="v" className={showFilter ? 'rotate' : ''} />}
                    </button>
                    {showFilter && hasSubCabang && (
                        <div className="neo-dropdown-list-right">
                            {["Semua Sub-Cabang", ...userData.subCabang].map((c, idx) => (
                                <div key={idx} className="neo-drop-item" onClick={() => handleSelectFilter(c)}>
                                    {c}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* LOGIKA CONDITIONAL RENDERING CABANG MANAGER */}
        {hasSubCabang && selectedFilter === "Semua Sub-Cabang" ? (
          // MODE STACKED: Jika Manager punya sub-cabang & memilih "Semua"
          <div className="multi-cabang-wrapper">
            {userData.subCabang.map((sub, index) => (
                <div key={index} className="cabang-section">
                  <h3>{sub}</h3>
                  {renderTable(`Data Kehadiran - ${sub}`, filteredData.filter(d => d.cabang === sub))}
                </div>
            ))}
          </div>
        ) : (
          // MODE NORMAL: Jika Manager cuma 1 cabang ATAU memilih sub-cabang spesifik
          renderTable("Data Kehadiran Karyawan", filteredData)
        )}
      </main>
    </div>
  );
};

export default LaporanManagerCabang;