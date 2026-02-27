import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./laporan.css"; 

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
// iconKehadiran dihapus, diganti Perizinan biar sama kayak Dashboard
import iconPerizinan from "../../assets/perizinan.svg"; 
import iconLaporan from "../../assets/laporan.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const LaporanManager = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  /* DATA DUMMY KHUSUS CABANG MANAGER */
  const dataLaporan = [
    { id: 1, nama: "Syahrul", hadirApp: "10", hadirManual: "10", izin: "2", sakit: "3", cuti: "2", terlambat: "1", fimtk: "1 Jam", lembur: "1 Jam", alpha: "1" },
    { id: 2, nama: "Budi", hadirApp: "12", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "0", fimtk: "-", lembur: "2 Jam", alpha: "0" },
    { id: 3, nama: "Siti", hadirApp: "11", hadirManual: "1", izin: "1", sakit: "0", cuti: "1", terlambat: "2", fimtk: "-", lembur: "-", alpha: "0" },
  ];

  return (
    <div className="hrd-container">
      {/* SIDEBAR MANAGER */}
      <aside className="sidebar no-print">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        
        {/* SIDEBAR DISAMAKAN DENGAN DASHBOARD + PAKAI LINK */}
        <nav className="menu-nav">
          <Link to="/managerCabang/dashboard" className="menu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="menu-left">
                <img src={iconDashboard} alt="dash" className="menu-icon-main"/> 
                <span className="menu-text-main">Dashboard</span>
            </div>
          </Link>
          
          <Link to="/managerCabang/datakaryawan" className="menu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="menu-left">
                <img src={iconKaryawan} alt="karyawan" className="menu-icon-main"/> 
                <span className="menu-text-main">Data Karyawan</span>
            </div>
          </Link>

          {/* PERIZINAN KEMBALI */}
          <Link to="/managerCabang/perizinan" className="menu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="menu-left">
                <img src={iconPerizinan} alt="izin" className="menu-icon-main"/> 
                <span className="menu-text-main">Perizinan</span>
            </div>
          </Link>

          <Link to="/managerCabang/laporan" className="menu-item active" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="menu-left">
                <img src={iconLaporan} alt="lapor" className="menu-icon-main"/> 
                <span className="menu-text-main">Laporan</span>
            </div>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="header-laporan-neo">
            <h1>Laporan</h1>
            <p>Data rekapitulasi absensi unit kerja cabang</p>
        </div>

        {/* ZONE SEARCH & PRINT (TANPA FILTER CABANG) */}
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

            <div className="button-group-vertical-right">
                <button className="btn-neo-print-top" onClick={() => window.print()}>Print</button>
            </div>
        </div>

        {/* TABLE REKAPITULASI SINGLE */}
        <div className="neo-table-card">
          <div className="neo-table-header">Data Kehadiran Karyawan Cabang</div>
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
      </main>
    </div>
  );
};

export default LaporanManager;