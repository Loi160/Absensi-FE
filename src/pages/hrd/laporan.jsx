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

  // STATE MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNav = (path) => { closeSidebar(); navigate(path); };

  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Filter Cabang");
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState(() => {
      const d = getYesterday();
      let m = d.getMonth();
      let y = d.getFullYear();
      if (d.getDate() < 26) { m -= 1; if (m < 0) { m = 11; y -= 1; } }
      return `${y}-${String(m+1).padStart(2,'0')}-26`;
  });

  const [endDate, setEndDate] = useState(() => formatDate(getYesterday()));
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: '', nama: '', nik: '', jenisData: '', data: [] });
  const [previewImage, setPreviewImage] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleFilter = () => setShowFilter(!showFilter);
  const handleSelectFilter = (val) => { setSelectedFilter(val); setShowFilter(false); };

  const getRowTerlambatClass = (jumlahTerlambat) => {
    const angka = parseInt(jumlahTerlambat, 10);
    if (isNaN(angka)) return "";
    if (angka === 3) return "row-warn-yellow";
    if (angka >= 4 && angka <= 5) return "row-warn-orange";
    if (angka >= 6) return "row-warn-red";
    return "";
  };

  const openDetail = (nama, nik, jenis, jumlah, cabang) => {
      if (jumlah === "0" || jumlah === "-") return;
      let dummyData = [];
      const jml = parseInt(jumlah);
      let title = `Rincian ${jenis}`;

      for(let i=1; i <= (isNaN(jml) ? 1 : jml); i++) {
          const fakeDate = `1${i} Mar 2026`;

          if (jenis === "Hadir via App" || jenis === "Hadir Manual") {
              const isAppKlik = jenis === "Hadir via App";
              const mixLogic = i % 2 === 0;
              title = isAppKlik ? "Log Absensi Mandiri (Karyawan)" : "Log Rekapitulasi Manual (Admin HRD)";
              dummyData.push({
                  tanggal: fakeDate, cabang: cabang,
                  masuk: { jam: isAppKlik ? `07:5${i} WIB` : `08:1${i} WIB`, isManual: !isAppKlik, foto: isAppKlik ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" : null, keterangan: !isAppKlik ? "Lupa absen HP mati" : "", admin: !isAppKlik ? "Admin_Siti" : "" },
                  pulang: { jam: `17:0${i} WIB`, isManual: isAppKlik ? mixLogic : !mixLogic, foto: (isAppKlik ? mixLogic : !mixLogic) ? null : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", keterangan: (isAppKlik ? mixLogic : !mixLogic) ? "Dibantu inputkan karena error" : "", admin: (isAppKlik ? mixLogic : !mixLogic) ? "Admin_Budi" : "" },
                  tipe: "absen"
              });
          } else if (jenis === "Izin" || jenis === "Sakit") {
              title = `Log Perizinan (${jenis})`;
              dummyData.push({ jenisIzin: jenis === "Sakit" ? "Sakit" : (i % 2 === 0 ? "Acara Pribadi" : "Lainnya"), tanggalMulai: fakeDate, tanggalAkhir: `1${i+2} Mar 2026`, keterangan: jenis === "Sakit" ? "Sakit demam tinggi, butuh istirahat." : "Ada keperluan keluarga mendesak di luar kota.", foto: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop", tipe: "izin_sakit" });
          } else if (jenis === "Cuti") {
              title = `Log Perizinan (Cuti)`;
              dummyData.push({ cabang: cabang, jabatan: "Staff", divisi: "Operasional", jenisCuti: i % 2 === 0 ? "Cuti Tahunan" : "Cuti Khusus", tanggalMulai: fakeDate, tanggalAkhir: `1${i+4} Mar 2026`, keterangan: i % 2 === 0 ? "Cuti liburan tahunan bersama keluarga" : "Pernikahan saudara kandung", noTelp: "08123456789" + i, tipe: "cuti" });
          } else if (jenis === "FIMTK") {
              title = `Log Perizinan (FIMTK)`;
              dummyData.push({ cabang: cabang, jabatan: "Staff IT", divisi: "Technology", izinMTK: i % 2 === 0 ? "Keluar Kantor" : "Pulang Cepat", tanggal: fakeDate, jamMulai: `10:0${i} WIB`, jamAkhir: `14:3${i} WIB`, keperluan: i % 2 === 0 ? "Kantor" : "Pribadi", kendaraan: i % 2 === 0 ? "Kantor" : "Pribadi", alasan: i % 2 === 0 ? "Ada meeting dadakan dengan klien di luar kota." : "Urusan keluarga mendesak di rumah.", tipe: "fimtk" });
          } else if (jenis === "Terlambat") {
              title = `Log Keterlambatan Karyawan`;
              const menitTelat = 10 + (i * 5);
              dummyData.push({ tanggal: fakeDate, cabang: cabang, jadwal: "08:00 WIB", aktual: `08:${menitTelat} WIB`, durasi: `${menitTelat} Menit`, status: i % 3 === 0 ? "Absensi Manual HRD" : "Absensi Karyawan", tipe: "terlambat" });
          } else if (jenis === "Lembur") {
              title = `Log Kalkulasi Lembur`;
              dummyData.push({ tanggal: fakeDate, cabang: cabang, jamMasuk: `07:5${i} WIB`, jamPulang: `17:0${i} WIB`, statusIstirahat: "Tidak Diambil / Dilewati", durasiLembur: "3 Jam", keteranganLembur: "Kompensasi waktu istirahat yang tidak digunakan.", tipe: "lembur" });
          } else if (jenis === "Alpha") {
              title = `Log Ketidakhadiran (Alpha)`;
              dummyData.push({ tanggal: fakeDate, cabang: cabang, jadwal: "08:00 WIB - 17:00 WIB", status: "Tanpa Keterangan", keterangan: "Sistem tidak mendeteksi adanya data absensi masuk/pulang maupun permohonan izin/cuti pada tanggal tersebut.", tipe: "alpha" });
          } else {
              dummyData.push({ tanggal: fakeDate, ket: `Rincian data ${jenis} ke-${i}`, tipe: "lainnya" });
          }
      }
      setModalInfo({ title, nama, nik, jenisData: jenis, data: dummyData });
      setShowDetailModal(true);
  };

  const dataLaporan = [
    { id: 1, nama: "Syahrul", nik: "123456789", cabang: "Cabang 1", hadirApp: "10", hadirManual: "10", izin: "2", sakit: "3", cuti: "2", terlambat: "1", fimtk: "1", lembur: "3", alpha: "1" },
    { id: 2, nama: "Budi Santoso", nik: "987654321", cabang: "Cabang 2", hadirApp: "12", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "3", fimtk: "-", lembur: "2", alpha: "2" },
    { id: 3, nama: "Siti Aminah", nik: "112233445", cabang: "Cabang 3", hadirApp: "11", hadirManual: "1", izin: "1", sakit: "0", cuti: "1", terlambat: "5", fimtk: "-", lembur: "-", alpha: "0" },
    { id: 4, nama: "Joko Anwar", nik: "554433221", cabang: "Cabang A", hadirApp: "15", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "6", fimtk: "-", lembur: "-", alpha: "0" },
    { id: 5, nama: "Rina Kartika", nik: "998877665", cabang: "Cabang B", hadirApp: "14", hadirManual: "0", izin: "0", sakit: "1", cuti: "0", terlambat: "0", fimtk: "-", lembur: "-", alpha: "0" },
    { id: 6, nama: "Agus Supriyanto", nik: "102938475", cabang: "Cabang 1", hadirApp: "10", hadirManual: "0", izin: "0", sakit: "0", cuti: "0", terlambat: "2", fimtk: "-", lembur: "-", alpha: "0" }
  ];

  const filteredData = dataLaporan.filter(item => {
    const matchName = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    let matchBranch = true;
    if (selectedFilter !== "Filter Cabang" && selectedFilter !== "Semua Cabang") {
        if (selectedFilter === "Cabang 4") { matchBranch = ["Cabang A", "Cabang B", "Cabang C"].includes(item.cabang); }
        else { matchBranch = item.cabang === selectedFilter; }
    }
    return matchName && matchBranch;
  });

  const renderModalBody = (item, idx) => (
    <div key={idx} className="lap-modal-record-card">
      {item.tipe === "absen" && (
        <>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Tanggal Absensi</label><div className="lap-modal-input">{item.tanggal}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Cabang</label><div className="lap-modal-input">{item.cabang}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jam Masuk</label><div className="lap-modal-input">{item.masuk.jam}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Jam Pulang</label><div className="lap-modal-input">{item.pulang.jam}</div></div></div>
          {(item.masuk.isManual || item.pulang.isManual) && (<div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label" style={{color:'#d9480f'}}>⚠️ Catatan Absensi Manual HRD</label><div className="lap-modal-input" style={{background:'#fff9db',borderColor:'#fcc419',color:'#b06500',fontSize:'12px'}}>{item.masuk.isManual && `[Masuk] ${item.masuk.keterangan} (${item.masuk.admin}). `}{item.pulang.isManual && `[Pulang] ${item.pulang.keterangan} (${item.pulang.admin}).`}</div></div></div>)}
          <div className="lap-foto-container">
            <div className="lap-foto-box">{item.masuk.isManual ? (<div className="lap-manual-placeholder"><span>📝 Absensi Manual</span><small>No Photo Available</small></div>) : (<><img src={item.masuk.foto} alt="Masuk" className="lap-foto-img" /><div className="lap-foto-overlay">Absen Masuk</div><button className="lap-zoom-btn" onClick={() => setPreviewImage(item.masuk.foto)}>🔍</button></>)}</div>
            <div className="lap-foto-box">{item.pulang.isManual ? (<div className="lap-manual-placeholder"><span>📝 Absensi Manual</span><small>No Photo Available</small></div>) : (<><img src={item.pulang.foto} alt="Pulang" className="lap-foto-img" /><div className="lap-foto-overlay">Absen Pulang</div><button className="lap-zoom-btn" onClick={() => setPreviewImage(item.pulang.foto)}>🔍</button></>)}</div>
          </div>
        </>
      )}
      {item.tipe === "izin_sakit" && (
        <>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jenis Izin</label><div className="lap-modal-input">{item.jenisIzin}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Tanggal Mulai</label><div className="lap-modal-input">{item.tanggalMulai}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Tanggal Akhir</label><div className="lap-modal-input">{item.tanggalAkhir}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Keterangan</label><div className="lap-modal-input">{item.keterangan}</div></div></div>
          <div className="lap-foto-container"><div className="lap-foto-box">{item.foto ? (<><img src={item.foto} alt="Bukti" className="lap-foto-img" /><div className="lap-foto-overlay">Bukti Dokumen / Surat</div><button className="lap-zoom-btn" onClick={() => setPreviewImage(item.foto)}>🔍</button></>) : (<div className="lap-manual-placeholder"><span>📄 Tidak Ada Bukti</span><small>Dikirim tanpa lampiran foto</small></div>)}</div><div style={{flex:1}}></div></div>
        </>
      )}
      {item.tipe === "cuti" && (
        <>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Cabang</label><div className="lap-modal-input">{item.cabang}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Jenis Cuti</label><div className="lap-modal-input">{item.jenisCuti}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jabatan</label><div className="lap-modal-input">{item.jabatan}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Divisi</label><div className="lap-modal-input">{item.divisi}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Tanggal Mulai</label><div className="lap-modal-input">{item.tanggalMulai}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Tanggal Akhir</label><div className="lap-modal-input">{item.tanggalAkhir}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label">Keterangan</label><div className="lap-modal-input" style={{minHeight:'40px',height:'auto'}}>{item.keterangan}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label">Nomor Telepon</label><div className="lap-modal-input">{item.noTelp}</div></div></div>
        </>
      )}
      {item.tipe === "fimtk" && (
        <>
          <div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label">Cabang</label><div className="lap-modal-input">{item.cabang}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jabatan</label><div className="lap-modal-input">{item.jabatan}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Divisi</label><div className="lap-modal-input">{item.divisi}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Izin MTK</label><div className="lap-modal-input">{item.izinMTK}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Tanggal</label><div className="lap-modal-input">{item.tanggal}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jam Mulai</label><div className="lap-modal-input">{item.jamMulai}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Jam Akhir</label><div className="lap-modal-input">{item.jamAkhir}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Keperluan</label><div className="lap-modal-input">{item.keperluan}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Kendaraan</label><div className="lap-modal-input">{item.kendaraan}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label">Alasan</label><div className="lap-modal-input" style={{minHeight:'40px',height:'auto'}}>{item.alasan}</div></div></div>
        </>
      )}
      {item.tipe === "terlambat" && (
        <>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Tanggal</label><div className="lap-modal-input">{item.tanggal}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Cabang</label><div className="lap-modal-input">{item.cabang}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jam Masuk Seharusnya</label><div className="lap-modal-input">{item.jadwal}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Jam Absen Aktual</label><div className="lap-modal-input" style={{color:'#d9480f',fontWeight:'700'}}>{item.aktual}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label">Durasi Keterlambatan & Status</label><div className="lap-modal-input">Terlambat {item.durasi} ({item.status})</div></div></div>
        </>
      )}
      {item.tipe === "lembur" && (
        <>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Tanggal</label><div className="lap-modal-input">{item.tanggal}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Cabang</label><div className="lap-modal-input">{item.cabang}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jam Masuk</label><div className="lap-modal-input">{item.jamMasuk}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Jam Pulang</label><div className="lap-modal-input">{item.jamPulang}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Status Waktu Istirahat</label><div className="lap-modal-input" style={{color:'#e03131',fontWeight:'600'}}>{item.statusIstirahat}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Total Durasi Lembur</label><div className="lap-modal-input" style={{color:'#2fb800',fontWeight:'700'}}>{item.durasiLembur}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label">Keterangan Sistem</label><div className="lap-modal-input" style={{background:'#f0fdf4',borderColor:'#b2f2bb',color:'#2b8a3e',fontSize:'13px'}}>{item.keteranganLembur}</div></div></div>
        </>
      )}
      {item.tipe === "alpha" && (
        <>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Tanggal</label><div className="lap-modal-input">{item.tanggal}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Cabang</label><div className="lap-modal-input">{item.cabang}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group"><label className="lap-modal-label">Jadwal Kerja Seharusnya</label><div className="lap-modal-input">{item.jadwal}</div></div><div className="lap-modal-group"><label className="lap-modal-label">Status</label><div className="lap-modal-input" style={{color:'#e03131',fontWeight:'700'}}>{item.status}</div></div></div>
          <div className="lap-modal-row"><div className="lap-modal-group" style={{flex:1}}><label className="lap-modal-label">Keterangan / Catatan Sistem</label><div className="lap-modal-input" style={{background:'#fff5f5',borderColor:'#ffc9c9',color:'#c92a2a',fontSize:'13px'}}>{item.keterangan}</div></div></div>
        </>
      )}
    </div>
  );

  const renderTable = (headerText, tableData) => (
    <div className="neo-table-card">
      <div className="neo-table-header">{headerText}</div>
      <div className="neo-table-wrapper">
        <table className="neo-table">
          <thead>
            {/* URUTAN OPSI 1: HADIR | TERLAMBAT | FIMTK | SAKIT | IZIN | CUTI | ALPHA | LEMBUR */}
            <tr>
              <th>Nama Karyawan</th>
              <th className="text-center">Hadir</th>
              <th className="text-center">Terlambat</th>
              <th className="text-center">FIMTK</th>
              <th className="text-center">Sakit</th>
              <th className="text-center">Izin</th>
              <th className="text-center">Cuti</th>
              <th className="text-center">Alpha</th>
              <th className="text-center">Lembur</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? tableData.map((item) => {
              const rowClass = getRowTerlambatClass(item.terlambat);
              return (
                <tr key={item.id} className={rowClass}>
                  <td className="neo-td-name">{item.nama}</td>
                  {/* Hadir */}
                  <td className="text-center"><div className="neo-dual-badge-container"><span className={`neo-badge ${item.hadirApp !== '0' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Hadir via App", item.hadirApp, item.cabang)}>{item.hadirApp}</span><span className={`neo-badge manual ${item.hadirManual !== '0' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Hadir Manual", item.hadirManual, item.cabang)}>{item.hadirManual}</span></div></td>
                  {/* Terlambat */}
                  <td className="text-center"><span className={`neo-badge ${rowClass ? 'warn-badge' : ''} ${item.terlambat !== '0' && item.terlambat !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Terlambat", item.terlambat, item.cabang)}>{item.terlambat}</span></td>
                  {/* FIMTK */}
                  <td className="text-center"><span className={`neo-badge info ${item.fimtk !== '0' && item.fimtk !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "FIMTK", item.fimtk, item.cabang)}>{item.fimtk}</span></td>
                  {/* Sakit */}
                  <td className="text-center"><span className={`neo-badge ${item.sakit !== '0' && item.sakit !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Sakit", item.sakit, item.cabang)}>{item.sakit}</span></td>
                  {/* Izin */}
                  <td className="text-center"><span className={`neo-badge ${item.izin !== '0' && item.izin !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Izin", item.izin, item.cabang)}>{item.izin}</span></td>
                  {/* Cuti */}
                  <td className="text-center"><span className={`neo-badge ${item.cuti !== '0' && item.cuti !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Cuti", item.cuti, item.cabang)}>{item.cuti}</span></td>
                  {/* Alpha */}
                  <td className="text-center"><span className={`neo-badge alert ${item.alpha !== '0' && item.alpha !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Alpha", item.alpha, item.cabang)}>{item.alpha}</span></td>
                  {/* Lembur */}
                  <td className="text-center"><span className={`neo-badge info ${item.lembur !== '0' && item.lembur !== '-' ? 'clickable-badge' : ''}`} onClick={() => openDetail(item.nama, item.nik, "Lembur", item.lembur, item.cabang)}>{item.lembur}</span></td>
                </tr>
              );
            }) : (
              <tr><td colSpan="9" className="empty-state">Data karyawan {searchTerm ? `dengan nama "${searchTerm}" ` : ""}tidak ditemukan di {selectedFilter}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="hrd-container">

      {/* ===== MOBILE TOPBAR ===== */}
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar} aria-label="Buka menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* ===== OVERLAY ===== */}
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={closeSidebar} />

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar no-print ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">✕</button>
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav('/hrd/dashboard')}><div className="menu-left"><img src={iconDashboard} alt="dash" className="menu-icon-main" /><span className="menu-text-main">Dashboard</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/hrd/kelolacabang')}><div className="menu-left"><img src={iconKelola} alt="kelola" className="menu-icon-main" /><span className="menu-text-main">Kelola Cabang</span></div></div>
          <div className="menu-item" onClick={() => handleNav('/hrd/datakaryawan')}><div className="menu-left"><img src={iconKaryawan} alt="karyawan" className="menu-icon-main" /><span className="menu-text-main">Data Karyawan</span></div></div>
          <div className="menu-item has-arrow" onClick={() => handleNav('/hrd/absenmanual')}><div className="menu-left"><img src={iconKehadiran} alt="hadir" className="menu-icon-main" /><span className="menu-text-main">Kehadiran</span></div><img src={iconBawah} alt="down" className="arrow-icon-main" /></div>
          <div className="menu-item active" onClick={() => handleNav('/hrd/laporan')}><div className="menu-left"><img src={iconLaporan} alt="lapor" className="menu-icon-main" /><span className="menu-text-main">Laporan</span></div></div>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-text">
            <h1>Laporan Kehadiran</h1>
            <p>Data rekapitulasi absensi seluruh karyawan</p>
          </div>
        </header>

        <div className="neo-filter-zone no-print">
          
          <div className="input-group-neo">
            <div className="neo-field">
              <label>Cari Nama</label>
              <input type="text" placeholder="Ketik nama..." className="neo-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="neo-field">
              <label>Tanggal Mulai</label>
              <input type="date" className="neo-input" max={formatDate(getYesterday())} value={startDate} onChange={(e) => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(""); }} />
            </div>
            <div className="neo-field">
              <label>Tanggal Selesai</label>
              <input type="date" className="neo-input" min={startDate} max={formatDate(getYesterday())} value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!startDate} />
            </div>
          </div>

          <div className="button-group-vertical-right">
            <button className="btn-neo-print-top no-print" onClick={() => window.print()}>Print</button>
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

        {selectedFilter === "Cabang 4" ? (
          <div className="multi-cabang-wrapper">
            <div className="cabang-section"><h3>Cabang A</h3>{renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang A"))}</div>
            <div className="cabang-section"><h3>Cabang B</h3>{renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang B"))}</div>
            <div className="cabang-section"><h3>Cabang C</h3>{renderTable("Data Kehadiran Karyawan", filteredData.filter(d => d.cabang === "Cabang C"))}</div>
          </div>
        ) : (
          renderTable("Data Kehadiran Karyawan", filteredData)
        )}
      </main>

      {/* ===== MODAL DETAIL ===== */}
      {showDetailModal && (
        <div className="modal-overlay-lap" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content-lap" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-lap">
              <h2>{modalInfo.title}</h2>
              <button className="close-btn-lap" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div className="modal-body-lap">
              <div className="lap-modal-row">
                <div className="lap-modal-group"><label className="lap-modal-label">Nama</label><div className="lap-modal-input">{modalInfo.nama}</div></div>
                <div className="lap-modal-group"><label className="lap-modal-label">NIK</label><div className="lap-modal-input">{modalInfo.nik}</div></div>
              </div>
              <hr style={{border:'none',borderBottom:'1px solid #eee',margin:'20px 0'}} />
              <div className="lap-modal-scroll-area">
                {modalInfo.data.map((item, idx) => renderModalBody(item, idx))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL PREVIEW GAMBAR ===== */}
      {previewImage && (
        <div className="lap-preview-overlay" onClick={() => setPreviewImage(null)}>
          <button className="lap-preview-close" onClick={() => setPreviewImage(null)}>&times;</button>
          <img src={previewImage} alt="Preview" className="lap-preview-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default Laporan;