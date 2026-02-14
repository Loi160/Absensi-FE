import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./laporan.css"; 

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const Laporan = () => {
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

  const dataLaporan = [
    { id: 1, nama: "Syahrul", hadir: "10", izin: "2", sakit: "3", cuti: "2", terlambat: "1", fimtk: "1 Jam", lembur: "1 Jam", alpha: "1" },
    { id: 2, nama: "Budi", hadir: "12", izin: "0", sakit: "0", cuti: "0", terlambat: "0", fimtk: "-", lembur: "2 Jam", alpha: "0" },
    { id: 3, nama: "Siti", hadir: "11", izin: "1", sakit: "0", cuti: "1", terlambat: "2", fimtk: "-", lembur: "-", alpha: "0" },
  ];

  return (
    <div className="hrd-container">
      <aside className="sidebar no-print">
        <div className="logo-area">
          <h2 className="logo-title">SISTEM ABSENSI</h2>
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}><div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item" onClick={() => navigate('/hrd/kelolacabang')}><div className="menu-left"><img src={iconKelola} alt="kelola" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div></div>
          <div className="menu-item" onClick={() => navigate('/hrd/datakaryawan')}><div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item has-arrow" onClick={() => navigate('/hrd/absenmanual')}><div className="menu-left"><img src={iconKehadiran} alt="hadir" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div><img src={iconBawah} alt="down" className="arrow-icon-main" /></div>
          <div className="menu-item active" onClick={() => navigate('/hrd/laporan')}><div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      <main className="main-content">
        <div className="header-laporan-neo">
            <h1>Laporan</h1>
            <p>Data rekapitulasi absensi seluruh unit kerja AmagaCorp</p>
        </div>

        {/* NEO FILTER ZONE (REVISI POSISI KANAN & VERTIKAL) */}
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

            {/* BUTTON GROUP PINDAH KANAN & VERTIKAL (PRINT ATAS, FILTER BAWAH) */}
            <div className="button-group-vertical-right">
                <button className="btn-neo-print-top" onClick={() => window.print()}>Print</button>
                
                <div className="dropdown-neo-bottom-wrapper">
                    <button className="btn-neo-filter-bottom" onClick={toggleFilter}>
                        {selectedFilter} <img src={iconBawah} alt="v" className={showFilter ? 'rotate' : ''} />
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

        <div className="neo-table-card">
            <div className="neo-table-header">Data Kehadiran Karyawan</div>
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
                                <td className="text-center"><span className="neo-badge">{item.hadir}</span></td>
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

export default Laporan;