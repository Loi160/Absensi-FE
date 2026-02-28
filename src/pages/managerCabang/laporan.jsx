import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../hrd/laporan.css"; // Mengambil CSS dari HRD

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
// iconKelola dihapus dari import sidebar
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg"; // Digunakan untuk Perizinan
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg"; // Dipertahankan untuk dropdown filter
import logoPersegi from "../../assets/logopersegi.svg";

const LaporanManager = () => {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Filter Cabang");

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

  /* DATA DUMMY DENGAN 2 KOTAK HADIR (APP & MANUAL) */
  const dataLaporan = [
    { id: 1, nama: "Syahrul", hadirApp: "10", hadirManual: "10", izin: "2", sakit: "3", cuti: "2", terlambat: "1", fimtk: "1 Jam", lembur: "1 Jam", alpha: "1" },
    { id: 2, nama: "Budi", hadirApp: "12", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "0", fimtk: "-", lembur: "2 Jam", alpha: "0" },
    { id: 3, nama: "Siti", hadirApp: "11", hadirManual: "1", izin: "1", sakit: "0", cuti: "1", terlambat: "2", fimtk: "-", lembur: "-", alpha: "0" },
  ];

  // Helper function buat render tabel biar kode ga redundan
  const renderTable = (headerText) => (
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
            {dataLaporan.map((item) => (
              <tr key={item.id}>
                <td className="neo-td-name">{item.nama}</td>
                
                {/* KOLOM HADIR: 2 KOTAK (APP & MANUAL) */}
                <td className="text-center">
                  <div className="neo-dual-badge-container">
                    <span className="neo-badge">{item.hadirApp}</span>
                    <span className="neo-badge">{item.hadirManual}</span>
                  </div>
                </td>

                <td className="text-center"><span className="neo-badge">{item.izin}</span></td>
                <td className="text-center"><span className="neo-badge">{item.sakit}</span></td>
                <td className="text-center"><span className="neo-badge">{item.cuti}</span></td>
                <td className="text-center"><span className="neo-badge warn">{item.terlambat}</span></td>
                <td className="text-center"><span className="neo-badge info">{item.fimtk}</span></td>
                <td className="text-center"><span className="neo-badge info">{item.lembur}</span></td>
                <td className="text-center"><span className="neo-badge alert">{item.alpha}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="hrd-container">
      {/* SIDEBAR */}
      <aside className="sidebar no-print">
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/managerCabang/dashboard')}>
            <div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div>
          </div>
          
          {/* Menu Kelola Cabang Dihapus */}

          <div className="menu-item" onClick={() => navigate('/managerCabang/datakaryawan')}>
            <div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div>
          </div>
          
          {/* Menu Kehadiran diubah jadi Perizinan, class arrow dan icon bawah dihapus */}
          <div className="menu-item" onClick={() => navigate('/managerCabang/perizinan')}>
            <div className="menu-left"><img src={iconKehadiran} alt="izin" className="menu-icon-main" /><span className="menu-text-main">Perizinan</span></div>
          </div>
          
          <div className="menu-item active" onClick={() => navigate('/managerCabang/laporan')}>
            <div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div>
          </div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="header-laporan-neo">
            <h1>Laporan Cabang</h1>
            <p>Data rekapitulasi absensi seluruh unit operasional cabang</p>
        </div>

        {/* ZONE FILTER & BUTTONS */}
        <div className="neo-filter-zone no-print">
            <div className="input-group-neo">
                <div className="neo-field">
                    <label>Cari Nama</label>
                    <input type="text" placeholder="Ketik nama..." className="neo-input" />
                </div>
                <div className="neo-field">
                    <label>Mulai</label>
                    <input type="date" className="neo-input" />
                </div>
                <div className="neo-field">
                    <label>Selesai</label>
                    <input type="date" className="neo-input" />
                </div>
            </div>

            {/* BUTTON GROUP (PRINT & FILTER CABANG) */}
            <div className="button-group-vertical-right">
                <button className="btn-neo-print-top" onClick={() => window.print()}>Print</button>
                
                <div className="dropdown-neo-bottom-wrapper">
                    <button className="btn-neo-filter-bottom" onClick={toggleFilter}>
                        {selectedFilter} 
                        <img src={iconBawah} alt="v" className={showFilter ? 'rotate' : ''} />
                    </button>
                    {showFilter && (
                        <div className="neo-dropdown-list-right">
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 1")}>Cabang 1</div>
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 2")}>Cabang 2</div>
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 3")}>Cabang 3</div>
                            <div className="neo-drop-item" onClick={() => handleSelectFilter("Cabang 4")}>Cabang 4</div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* LOGIKA CONDITIONAL RENDERING CABANG 4 vs LAINNYA */}
        {selectedFilter === "Cabang 4" ? (
          <div className="multi-cabang-wrapper">
            {/* CABANG A */}
            <div className="cabang-section" style={{ marginBottom: "24px" }}>
              <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>Cabang A</h3>
              {renderTable("Data Kehadiran Karyawan")}
            </div>

            {/* CABANG B */}
            <div className="cabang-section" style={{ marginBottom: "24px" }}>
              <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>Cabang B</h3>
              {renderTable("Data Kehadiran Karyawan")}
            </div>

            {/* CABANG C */}
            <div className="cabang-section">
              <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>Cabang C</h3>
              {renderTable("Data Kehadiran Karyawan")}
            </div>
          </div>
        ) : (
          /* TAMPILAN DEFAULT UNTUK CABANG 1, 2, 3 ATAU BELUM MILIH */
          renderTable("Data Kehadiran Karyawan")
        )}
      </main>
    </div>
  );
};

export default LaporanManager;