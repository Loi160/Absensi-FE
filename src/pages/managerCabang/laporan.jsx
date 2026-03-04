import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// FIX: Mengambil CSS langsung dari folder hrd
import "../hrd/laporan.css"; 

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconIzin from "../../assets/perizinan.svg"; // Icon khusus Manager Cabang
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const LaporanManagerCabang = () => {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  
  const [selectedFilter, setSelectedFilter] = useState("Filter Cabang");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => setShowFilter(!showFilter);
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

  // FUNGSI UNTUK MENENTUKAN KELAS BARIS SECARA PENUH BERDASARKAN JUMLAH TERLAMBAT
  const getRowTerlambatClass = (jumlahTerlambat) => {
    const angka = parseInt(jumlahTerlambat, 10);
    if (isNaN(angka)) return ""; 
    
    if (angka === 3) return "row-warn-yellow";        // 3x = Baris Kuning
    if (angka >= 4 && angka <= 5) return "row-warn-orange";  // 4-5x = Baris Orange
    if (angka >= 6) return "row-warn-red";            // >= 6x = Baris Merah
    
    return ""; // 0, 1, 2 = Tetap putih/abu bawaan
  };

  /* DATA DUMMY */
  const dataLaporan = [
    { id: 1, nama: "Syahrul", cabang: "Cabang 1", hadirApp: "10", hadirManual: "10", izin: "2", sakit: "3", cuti: "2", terlambat: "1", fimtk: "1 Jam", lembur: "1 Jam", alpha: "1" },
    { id: 2, nama: "Budi Santoso", cabang: "Cabang 2", hadirApp: "12", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "3", fimtk: "-", lembur: "2 Jam", alpha: "0" }, 
    { id: 3, nama: "Siti Aminah", cabang: "Cabang 3", hadirApp: "11", hadirManual: "1", izin: "1", sakit: "0", cuti: "1", terlambat: "5", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 4, nama: "Joko Anwar", cabang: "Cabang A", hadirApp: "15", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "6", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 5, nama: "Rina Kartika", cabang: "Cabang B", hadirApp: "14", hadirManual: "0", izin: "0", sakit: "1", cuti: "0", terlambat: "0", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 6, nama: "Agus Supriyanto", cabang: "Cabang 1", hadirApp: "10", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "2", fimtk: "-", lembur: "-", alpha: "0" } 
  ];

  /* FILTER GANDA (NAMA + CABANG) */
  const filteredData = dataLaporan.filter(item => {
    const matchName = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchBranch = true; 
    if (selectedFilter !== "Filter Cabang" && selectedFilter !== "Semua Cabang") {
        if (selectedFilter === "Cabang 4") {
            matchBranch = ["Cabang A", "Cabang B", "Cabang C"].includes(item.cabang);
        } else {
            matchBranch = item.cabang === selectedFilter;
        }
    }
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
                  Data karyawan {searchTerm ? `dengan nama "${searchTerm}" ` : ""}tidak ditemukan di {selectedFilter}.
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
          
          <div className="menu-item" onClick={() => navigate('/managerCabang/perizinan')}>
            <div className="menu-left">
                <img src={iconIzin} alt="perizinan" className="menu-icon-main" />
                <span className="menu-text-main">Perizinan</span>
            </div>
          </div>
          
          <div className="menu-item active">
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
        
        <header className="content-header">
            <div className="header-text">
                <h1>Laporan Kehadiran</h1>
                <p>Data rekapitulasi absensi seluruh karyawan</p>
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

            {/* BUTTON GROUP */}
            <div className="button-group-vertical-right">
                <button className="btn-neo-print-top" onClick={() => window.print()}>Print</button>
                
                <div className="dropdown-neo-bottom-wrapper">
                    <button className="btn-neo-filter-bottom" onClick={toggleFilter}>
                        {selectedFilter} 
                        <img src={iconBawah} alt="v" className={showFilter ? 'rotate' : ''} />
                    </button>
                    {showFilter && (
                        <div className="neo-dropdown-list-right">
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Semua Cabang")}>Semua Cabang</div>
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 1")}>Cabang 1</div>
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 2")}>Cabang 2</div>
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 3")}>Cabang 3</div>
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 4")}>Cabang 4</div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* LOGIKA CONDITIONAL RENDERING CABANG */}
        {selectedFilter === "Cabang 4" ? (
          <div className="multi-cabang-wrapper">
            <div className="cabang-section" style={{ marginBottom: "24px" }}>
              <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>Cabang A</h3>
              {renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang A"))}
            </div>
            <div className="cabang-section" style={{ marginBottom: "24px" }}>
              <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>Cabang B</h3>
              {renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang B"))}
            </div>
            <div className="cabang-section">
              <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>Cabang C</h3>
              {renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang C"))}
            </div>
          </div>
        ) : (
          renderTable("Data Kehadiran Karyawan", filteredData)
        )}
      </main>
    </div>
  );
};

export default LaporanManagerCabang;