import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./laporan.css"; 

/* ================= ICON IMPORT ================= */
import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

// --- FUNGSI TANGGAL KEMARIN (BATAS MAX & DEFAULT END) ---
const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
};

const formatDate = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const Laporan = () => {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Filter Cabang");
  const [searchTerm, setSearchTerm] = useState("");
  
  // ================= STATE TANGGAL DEFAULT (SIKLUS 26 - 25) =================
  const [startDate, setStartDate] = useState(() => {
      const d = getYesterday();
      let m = d.getMonth();
      let y = d.getFullYear();
      if (d.getDate() < 26) {
          m -= 1;
          if (m < 0) { m = 11; y -= 1; }
      }
      return `${y}-${String(m+1).padStart(2,'0')}-26`;
  });
  
  const [endDate, setEndDate] = useState(() => formatDate(getYesterday()));

  // ================= STATE MODAL DETAIL =================
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Tambah properti nik
  const [modalInfo, setModalInfo] = useState({ title: '', nama: '', nik: '', data: [] });

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

  const getRowTerlambatClass = (jumlahTerlambat) => {
    const angka = parseInt(jumlahTerlambat, 10);
    if (isNaN(angka)) return ""; 
    if (angka === 3) return "row-warn-yellow";       
    if (angka >= 4 && angka <= 5) return "row-warn-orange"; 
    if (angka >= 6) return "row-warn-red";            
    return ""; 
  };

  // ================= LOGIKA PEMBUATAN DATA DUMMY DETAIL =================
  // UPDATE: Membawa NIK dan Cabang untuk dirender di Log Detail
  const openDetail = (nama, nik, jenis, jumlah, cabang) => {
      if (jumlah === "0" || jumlah === "-") return; 
      
      let dummyData = [];
      const jml = parseInt(jumlah);
      let title = `Rincian ${jenis}`;

      for(let i=1; i <= (isNaN(jml) ? 1 : jml); i++) {
          const fakeDate = `1${i} Mar 2026`;
          
          if (jenis === "Hadir via App") {
              title = "Log Absensi Mandiri (Karyawan)";
              dummyData.push(`📍 ${fakeDate} | 07:5${i} WIB | Absen: Masuk | Cabang: ${cabang} | Bukti: Foto Terlampir`);
          } else if (jenis === "Hadir Manual") {
              title = "Log Rekapitulasi Manual (Admin HRD)";
              dummyData.push(`✍️ ${fakeDate} | Input: 09:1${i} WIB | Absen: Masuk | Cabang: ${cabang} | Ket: Lupa absen HP mati (Input by Admin_Siti)`);
          } else {
              dummyData.push(`📅 ${fakeDate} - Rincian data ${jenis} ke-${i}`);
          }
      }
      
      setModalInfo({ title: title, nama: nama, nik: nik, data: dummyData });
      setShowDetailModal(true);
  };

  /* DATA DUMMY (Sudah ditambah NIK) */
  const dataLaporan = [
    { id: 1, nama: "Syahrul", nik: "123456789", cabang: "Cabang 1", hadirApp: "10", hadirManual: "10", izin: "2", sakit: "3", cuti: "2", terlambat: "1", fimtk: "1", lembur: "1", alpha: "1" },
    { id: 2, nama: "Budi Santoso", nik: "987654321", cabang: "Cabang 2", hadirApp: "12", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "3", fimtk: "-", lembur: "2", alpha: "0" }, 
    { id: 3, nama: "Siti Aminah", nik: "112233445", cabang: "Cabang 3", hadirApp: "11", hadirManual: "1", izin: "1", sakit: "0", cuti: "1", terlambat: "5", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 4, nama: "Joko Anwar", nik: "554433221", cabang: "Cabang A", hadirApp: "15", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "6", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 5, nama: "Rina Kartika", nik: "998877665", cabang: "Cabang B", hadirApp: "14", hadirManual: "0", izin: "0", sakit: "1", cuti: "0", terlambat: "0", fimtk: "-", lembur: "-", alpha: "0" }, 
    { id: 6, nama: "Agus Supriyanto", nik: "102938475", cabang: "Cabang 1", hadirApp: "10", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "2", fimtk: "-", lembur: "-", alpha: "0" } 
  ];

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
                        <span className={`neo-badge ${item.hadirApp !== '0' ? 'clickable-badge' : ''}`} title="Klik lihat detail Hadir App" onClick={() => openDetail(item.nama, item.nik, "Hadir via App", item.hadirApp, item.cabang)}>{item.hadirApp}</span>
                        <span className={`neo-badge manual ${item.hadirManual !== '0' ? 'clickable-badge' : ''}`} title="Klik lihat detail Hadir Manual" onClick={() => openDetail(item.nama, item.nik, "Hadir Manual", item.hadirManual, item.cabang)}>{item.hadirManual}</span>
                      </div>
                    </td>

                    <td className="text-center"><span className={`neo-badge ${item.izin !== '0' && item.izin !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Izin", item.izin, item.cabang)}>{item.izin}</span></td>
                    <td className="text-center"><span className={`neo-badge ${item.sakit !== '0' && item.sakit !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Sakit", item.sakit, item.cabang)}>{item.sakit}</span></td>
                    <td className="text-center"><span className={`neo-badge ${item.cuti !== '0' && item.cuti !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Cuti", item.cuti, item.cabang)}>{item.cuti}</span></td>
                    
                    <td className="text-center">
                        <span className={`neo-badge ${rowClass ? 'warn-badge' : ''} ${item.terlambat !== '0' && item.terlambat !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Terlambat", item.terlambat, item.cabang)}>
                            {item.terlambat}
                        </span>
                    </td>

                    <td className="text-center"><span className={`neo-badge info ${item.fimtk !== '0' && item.fimtk !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "FIMTK", item.fimtk, item.cabang)}>{item.fimtk}</span></td>
                    <td className="text-center"><span className={`neo-badge info ${item.lembur !== '0' && item.lembur !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Lembur", item.lembur, item.cabang)}>{item.lembur}</span></td>
                    <td className="text-center"><span className={`neo-badge alert ${item.alpha !== '0' && item.alpha !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Alpha", item.alpha, item.cabang)}>{item.alpha}</span></td>
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
      {/* SIDEBAR */}
      <aside className="sidebar no-print">
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigate('/hrd/dashboard')}>
            <div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/hrd/kelolacabang')}>
            <div className="menu-left"><img src={iconKelola} alt="kelola" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div>
          </div>
          
          <div className="menu-item" onClick={() => navigate('/hrd/datakaryawan')}>
            <div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div>
          </div>
          
          <div className="menu-item has-arrow" onClick={() => navigate('/hrd/absenmanual')}>
            <div className="menu-left"><img src={iconKehadiran} alt="hadir" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div>
            <img src={iconBawah} alt="down" className="arrow-icon-main" />
          </div>
          
          <div className="menu-item active" onClick={() => navigate('/hrd/laporan')}>
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

                {/* INPUT TANGGAL MULAI (MAX=KEMARIN) */}
                <div className="neo-field">
                    <label>Tanggal Mulai</label>
                    <input 
                        type="date" 
                        className="neo-input" 
                        max={formatDate(getYesterday())} 
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (endDate && e.target.value > endDate) {
                            setEndDate("");
                          }
                        }}
                    />
                </div>

                {/* INPUT TANGGAL SELESAI (MAX=KEMARIN) */}
                <div className="neo-field">
                    <label>Tanggal Selesai</label>
                    <input 
                        type="date" 
                        className="neo-input" 
                        min={startDate} 
                        max={formatDate(getYesterday())} 
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

        {/* LOGIKA CONDITIONAL RENDERING CABANG HRD */}
        {selectedFilter === "Cabang 4" ? (
          <div className="multi-cabang-wrapper">
            <div className="cabang-section">
              <h3>Cabang A</h3>
              {renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang A"))}
            </div>
            <div className="cabang-section">
              <h3>Cabang B</h3>
              {renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang B"))}
            </div>
            <div className="cabang-section">
              <h3>Cabang C</h3>
              {renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang C"))}
            </div>
          </div>
        ) : (
          renderTable("Data Kehadiran Karyawan", filteredData)
        )}
      </main>

      {/* ================= MODAL DETAIL POP-UP (UPDATE NAMA & NIK) ================= */}
      {showDetailModal && (
        <div className="modal-overlay-lap" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content-lap" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-lap">
                    <h2>{modalInfo.title}</h2>
                    <button className="close-btn-lap" onClick={() => setShowDetailModal(false)}>&times;</button>
                </div>
                <div className="modal-body-lap">
                    <div className="sub-info-wrapper">
                        <p className="sub-info">Karyawan: <strong>{modalInfo.nama}</strong></p>
                        <p className="sub-info">NIK: <strong>{modalInfo.nik}</strong></p>
                    </div>
                    <ul>
                        {modalInfo.data.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Laporan;