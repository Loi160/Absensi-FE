import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import "./laporan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

// Konfigurasi daftar menu navigasi di sidebar dengan menu Laporan dalam keadaan aktif
const MENU_ITEMS = [
  { path: "/hrd/dashboard", icon: iconDashboard, text: "Dashboard" },
  { path: "/hrd/kelolacabang", icon: iconKelola, text: "Kelola Cabang" },
  { path: "/hrd/datakaryawan", icon: iconKaryawan, text: "Data Karyawan" },
  { path: "/hrd/kehadiran", icon: iconKehadiran, text: "Kehadiran", hasArrow: true },
  { path: "/hrd/laporan", icon: iconLaporan, text: "Laporan", active: true },
];

// Mengubah format tanggal mentah dari JavaScript menjadi format YYYY-MM-DD yang standar untuk database
const formatDate = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Menghitung otomatis rentang tanggal cut-off bulanan (tanggal 26 bulan lalu s.d 25 bulan ini)
const getCutoffDates = () => {
  const d = new Date();
  const date = d.getDate();
  let start, end;
  if (date <= 25) {
    start = new Date(d.getFullYear(), d.getMonth() - 1, 26);
    end = new Date(d.getFullYear(), d.getMonth(), 25);
  } else {
    start = new Date(d.getFullYear(), d.getMonth(), 26);
    end = new Date(d.getFullYear(), d.getMonth() + 1, 25);
  }
  return { start, end };
};

// Memberikan warna peringatan (kuning, oranye, merah) pada baris tabel berdasarkan jumlah keterlambatan karyawan
const getRowTerlambatClass = (jumlahTerlambat) => {
  const angka = parseInt(jumlahTerlambat, 10);
  if (isNaN(angka)) return "";
  if (angka === 3) return "row-warn-yellow";
  if (angka >= 4 && angka <= 5) return "row-warn-orange";
  if (angka >= 6) return "row-warn-red";
  return "";
};

// Komponen utama untuk menampilkan dan merekap laporan kehadiran seluruh karyawan
const Laporan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State untuk mengontrol tampilan menu sidebar pada perangkat mobile (HP)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // State untuk mengontrol tampilan menu pop-up (dropdown) filter cabang dan export file
  const [showFilter, setShowFilter] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // State untuk menyimpan nilai filter dan pencarian yang sedang aktif
  const [selectedFilter, setSelectedFilter] = useState("Semua Cabang");
  const [searchTerm, setSearchTerm] = useState("");
  const [cabangList, setCabangList] = useState([]);

  // State untuk menyimpan data laporan dari server beserta status loading-nya
  const [dataLaporan, setDataLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk mengatur rentang waktu laporan yang ditarik dari server (default: cut-off saat ini)
  const [startDate, setStartDate] = useState(() => formatDate(getCutoffDates().start));
  const [endDate, setEndDate] = useState(() => formatDate(getCutoffDates().end));
  
  // State untuk mengatur jendela modal detail kehadiran (pop-up) saat angka di tabel diklik
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "",
    nama: "",
    nik: "",
    jenisData: "",
    data: [],
  });
  
  // State khusus untuk menampilkan foto bukti kehadiran dalam ukuran penuh di dalam modal
  const [previewImage, setPreviewImage] = useState(null);

  // Menjalankan fungsi tarik data laporan dan cabang secara otomatis setiap kali tanggal filter diubah
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resCabang = await fetch(`${import.meta.env.VITE_API_URL}/api/cabang`);
        const listC = await resCabang.json();
        setCabangList(listC.map((c) => c.nama));

        const resLaporan = await fetch(
          `${import.meta.env.VITE_API_URL}/api/laporan?role=hrd&start_date=${startDate}&end_date=${endDate}`,
        );
        const dataLap = await resLaporan.json();
        setDataLaporan(dataLap);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  // Membersihkan sesi pengguna dan mengarahkan kembali ke halaman login
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // Berpindah halaman menggunakan menu navigasi sekaligus menutup sidebar
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  // Membuka atau menutup pilihan filter cabang serta mengatur cabang mana yang sedang dipilih
  const toggleFilter = () => setShowFilter(!showFilter);
  const handleSelectFilter = (val) => {
    setSelectedFilter(val);
    setShowFilter(false);
  };

  // Menyaring data laporan berdasarkan nama yang dicari di kolom pencarian dan cabang yang dipilih
  const filteredData = dataLaporan.filter((item) => {
    const matchName = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    let matchBranch = true;
    if (selectedFilter !== "Semua Cabang") {
      matchBranch = item.cabang === selectedFilter;
    }
    return matchName && matchBranch;
  });

  // Menjumlahkan seluruh data pada kolom tabel yang sedang difilter untuk ditampilkan di baris paling bawah
  const getTotals = () => {
    let t = { hadirApp: 0, hadirManual: 0, terlambat: 0, fimtk: 0, sakit: 0, izin: 0, cuti: 0, alpha: 0, lembur: 0 };
    filteredData.forEach((item) => {
      t.hadirApp += parseInt(item.hadirApp) || 0;
      t.hadirManual += parseInt(item.hadirManual) || 0;
      t.terlambat += parseInt(item.terlambat) || 0;
      t.fimtk += parseInt(item.fimtk) || 0;
      t.sakit += parseInt(item.sakit) || 0;
      t.izin += parseInt(item.izin) || 0;
      t.cuti += parseInt(item.cuti) || 0;
      t.alpha += parseInt(item.alpha) || 0;
      t.lembur += parseInt(item.lembur) || 0;
    });
    return t;
  };

  // Menyusun ulang data yang ada di tabel ke format Excel (.xlsx) dan memicu proses unduhan
  const handleExportExcel = () => {
    const exportData = filteredData.map((item) => ({
      "Nama Karyawan": item.nama,
      "NIK": item.nik,
      "Cabang": item.cabang,
      "Hadir via App": parseInt(item.hadirApp) || 0,
      "Hadir Manual": parseInt(item.hadirManual) || 0,
      "Terlambat": parseInt(item.terlambat) || 0,
      "FIMTK": parseInt(item.fimtk) || 0,
      "Sakit": parseInt(item.sakit) || 0,
      "Izin": parseInt(item.izin) || 0,
      "Cuti": parseInt(item.cuti) || 0,
      "Alpha": parseInt(item.alpha) || 0,
      "Lembur": item.lembur,
    }));

    // Menyisipkan baris total keseluruhan di bagian paling bawah data Excel
    const totals = getTotals();
    exportData.push({
      "Nama Karyawan": "TOTAL KESELURUHAN",
      "NIK": "-",
      "Cabang": "-",
      "Hadir via App": totals.hadirApp,
      "Hadir Manual": totals.hadirManual,
      "Terlambat": totals.terlambat,
      "FIMTK": totals.fimtk,
      "Sakit": totals.sakit,
      "Izin": totals.izin,
      "Cuti": totals.cuti,
      "Alpha": totals.alpha,
      "Lembur": totals.lembur,
    });

    // Mengkonversi format data ke worksheet dan mendownloadnya menggunakan library XLSX
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Kehadiran");

    XLSX.writeFile(workbook, `Rekap_Kehadiran_HRD_${startDate}_sd_${endDate}.xlsx`);
  };

  // Menampilkan modal pop-up yang berisi rincian (history) dari angka yang diklik di tabel
  const openDetail = (item, jenis, jumlah) => {
    // Mencegah modal terbuka jika data yang diklik kosong atau bernilai nol
    if (jumlah === "0" || jumlah === "-" || jumlah === "0 Jam") return;

    const { nama, nik, cabang, rawAbsensi = [], rawPerizinan = [], rawAlpha = [] } = item;
    let realData = [];
    let title = `Rincian ${jenis}`;

    // Memfilter dan menyusun format data log absensi mandiri karyawan lewat aplikasi
    if (jenis === "Hadir via App") {
      title = "Log Absensi Mandiri (Karyawan)";
      const dataApp = rawAbsensi.filter((a) => !a.is_manual_masuk);
      realData = dataApp.map((a) => ({
        tipe: "absen", tanggal: a.tanggal, cabang: cabang,
        masuk: { jam: a.waktu_masuk || "-", isManual: false, foto: a.foto_masuk || null, keterangan: "", admin: "" },
        pulang: { jam: a.waktu_pulang || "-", isManual: false, foto: a.foto_pulang || null, keterangan: "", admin: "" },
      }));
    
    // Memfilter dan menyusun format data log absensi yang diinputkan secara manual oleh HRD/Admin
    } else if (jenis === "Hadir Manual") {
      title = "Log Rekapitulasi Manual (Admin HRD)";
      const dataManual = rawAbsensi.filter((a) => a.is_manual_masuk);
      realData = dataManual.map((a) => ({
        tipe: "absen", isLogManual: true, tanggal: a.tanggal, cabang: cabang,
        masuk: { jam: a.waktu_masuk || "-", isManual: true, foto: null, keterangan: a.keterangan_manual || "-", admin: "HRD" },
        pulang: { jam: a.waktu_pulang || "-", isManual: true, foto: null, keterangan: a.keterangan_manual || "-", admin: "HRD" },
      }));
    
    // Memfilter daftar hari di mana karyawan masuk kerja tapi melewati batas jam masuk (keterlambatan)
    } else if (jenis === "Terlambat") {
      title = "Rincian Keterlambatan";
      const dataTelat = rawAbsensi.filter((a) => a.menit_terlambat > 0);
      realData = dataTelat.map((a) => ({
        tipe: "terlambat", tanggal: a.tanggal, cabang: cabang, jamMasuk: a.waktu_masuk || "-", menitTelat: a.menit_terlambat, isManual: a.is_manual_masuk,
      }));
    
    // Memfilter data perizinan yang disetujui dengan kategori sakit
    } else if (jenis === "Sakit") {
      title = `Log Perizinan (Sakit)`;
      const dataSakit = rawPerizinan.filter((p) => p.kategori === "Izin" && p.jenis_izin === "Sakit");
      realData = dataSakit.map((p) => ({
        tipe: "izin_sakit", jenisIzin: "Sakit", tanggalMulai: p.tanggal_mulai, tanggalAkhir: p.tanggal_selesai, keterangan: p.keterangan || "-", foto: p.bukti_foto || null,
      }));
    
    // Memfilter data perizinan di luar sakit (seperti izin acara keluarga, menikah, dll)
    } else if (jenis === "Izin") {
      title = `Log Perizinan (Izin)`;
      const dataIzin = rawPerizinan.filter((p) => p.kategori === "Izin" && p.jenis_izin !== "Sakit");
      realData = dataIzin.map((p) => ({
        tipe: "izin_sakit", jenisIzin: p.jenis_izin || "Lainnya", tanggalMulai: p.tanggal_mulai, tanggalAkhir: p.tanggal_selesai, keterangan: p.keterangan || p.keperluan || "-", foto: p.bukti_foto || null,
      }));
    
    // Memfilter data khusus perizinan cuti tahunan/panjang
    } else if (jenis === "Cuti") {
      title = `Log Perizinan (Cuti)`;
      const dataCuti = rawPerizinan.filter((p) => p.kategori === "Cuti");
      realData = dataCuti.map((p) => ({
        tipe: "cuti", cabang: cabang, jabatan: item.jabatan || "-", divisi: item.divisi || "-", jenisCuti: p.jenis_izin || "Cuti Tahunan", tanggalMulai: p.tanggal_mulai, tanggalAkhir: p.tanggal_selesai, keterangan: p.keterangan || p.keperluan || "-", noTelp: item.noTelp || "-",
      }));
    
    // Memfilter Form Izin Meninggalkan Tempat Kerja (FIMTK)
    } else if (jenis === "FIMTK") {
      title = `Log Perizinan (FIMTK)`;
      const dataFimtk = rawPerizinan.filter((p) => p.kategori === "FIMTK");
      realData = dataFimtk.map((p) => ({
        tipe: "fimtk", cabang: cabang, jabatan: item.jabatan || "-", divisi: item.divisi || "-", izinMTK: p.jenis_izin || "FIMTK", tanggal: p.tanggal_mulai, jamMulai: p.jam_mulai || "-", jamAkhir: p.jam_selesai || "-", keperluan: p.keperluan || "-", kendaraan: p.kendaraan || "-", alasan: p.keterangan || "-",
      }));
    
    // Mengambil data ketidakhadiran tanpa keterangan (Alpha)
    } else if (jenis === "Alpha") {
      title = "Rincian Alpha";
      realData = rawAlpha.map((a) => ({
        tipe: "alpha", tanggal: a.tanggal, cabang: cabang, jadwal: "Sesuai Jam Operasional", status: "ALPHA", keterangan: a.keterangan,
      }));
    
    // Mengambil rincian menit lembur dan mendeteksi alasan lembur (reguler atau akibat tidak istirahat)
    } else if (jenis === "Lembur") {
      title = "Rincian Lembur";
      const dataLembur = rawAbsensi.filter((a) => a.menit_lembur > 0);
      realData = dataLembur.map((a) => {
        let alasan = "Lembur reguler di luar jam kerja";
        if (!a.waktu_istirahat_mulai) {
          alasan = "Kompensasi lembur karena tidak mengambil hak istirahat (3 Jam)";
          if (a.menit_lembur > 180) alasan = "Kompensasi tidak istirahat & lembur reguler";
        }
        return {
          tipe: "lembur", tanggal: a.tanggal, cabang: cabang, jamPulang: a.waktu_pulang || "-", menitLembur: a.menit_lembur, alasan: alasan, isManual: a.is_manual_masuk,
        };
      });
    }

    // Mengurutkan data di dalam modal agar yang terbaru selalu berada di paling atas
    realData.sort((a, b) => {
      const dateA = new Date(a.tanggal || a.tanggalMulai).getTime();
      const dateB = new Date(b.tanggal || b.tanggalMulai).getTime();
      return dateB - dateA;
    });

    // Menampung semua data yang sudah diproses ke state untuk ditampilkan di layar
    setModalInfo({ title, nama, nik, jenisData: jenis, data: realData });
    setShowDetailModal(true);
  };

  const renderModalBody = (item, idx) => (
    <div key={idx} className="lap-modal-record-card">
      {item.tipe === "absen" && (
        <>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal Absensi</label>
              <div className="lap-modal-input">{item.tanggal}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Cabang</label>
              <div className="lap-modal-input">{item.cabang}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">{item.isLogManual ? "Absen Masuk" : "Jam Masuk"}</label>
              <div className="lap-modal-input">{item.masuk.jam}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">{item.isLogManual ? "Absen Pulang" : "Jam Pulang"}</label>
              <div className="lap-modal-input">{item.pulang.jam}</div>
            </div>
          </div>
          {(item.masuk.isManual || item.pulang.isManual) && (
            <div className="lap-modal-row">
              <div className="lap-modal-group" style={{ flex: 1 }}>
                <label className="lap-modal-label">Keterangan</label>
                <div className="lap-modal-input" style={{ minHeight: "40px", height: "auto" }}>
                  {item.masuk.keterangan}
                </div>
              </div>
            </div>
          )}
          {!item.isLogManual && (
            <div className="lap-foto-container">
              <div className="lap-foto-box">
                {!item.masuk.foto ? (
                  <div className="lap-manual-placeholder">
                    <span>Tidak Ada Foto</span>
                    <small>No Photo Available</small>
                  </div>
                ) : item.masuk.foto.includes("Dihapus Otomatis") ? (
                  <div className="lap-manual-placeholder">
                    <span>Telah Dihapus</span>
                    <small>Usia file &gt; 30 Hari</small>
                  </div>
                ) : (
                  <>
                    <img src={item.masuk.foto} alt="Masuk" className="lap-foto-img" />
                    <div className="lap-foto-overlay">Absen Masuk</div>
                    <button type="button" className="lap-zoom-btn" onClick={() => setPreviewImage(item.masuk.foto)}>🔍</button>
                  </>
                )}
              </div>
              <div className="lap-foto-box">
                {!item.pulang.foto ? (
                  <div className="lap-manual-placeholder">
                    <span>Tidak Ada Foto</span>
                    <small>No Photo Available</small>
                  </div>
                ) : item.pulang.foto.includes("Dihapus Otomatis") ? (
                  <div className="lap-manual-placeholder">
                    <span>Telah Dihapus</span>
                    <small>Usia file &gt; 30 Hari</small>
                  </div>
                ) : (
                  <>
                    <img src={item.pulang.foto} alt="Pulang" className="lap-foto-img" />
                    <div className="lap-foto-overlay">Absen Pulang</div>
                    <button type="button" className="lap-zoom-btn" onClick={() => setPreviewImage(item.pulang.foto)}>🔍</button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {item.tipe === "terlambat" && (
        <>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal</label>
              <div className="lap-modal-input">{item.tanggal}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Cabang</label>
              <div className="lap-modal-input">{item.cabang}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jam Masuk</label>
              <div className="lap-modal-input" style={{ color: "#d9480f", fontWeight: "700" }}>{item.jamMasuk}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Keterlambatan</label>
              <div className="lap-modal-input" style={{ background: "#fff5f5", borderColor: "#ffc9c9", color: "#c92a2a", fontWeight: "700" }}>
                {item.menitTelat} Menit
              </div>
            </div>
          </div>
          {item.isManual && (
            <div className="lap-modal-row">
              <div className="lap-modal-group" style={{ flex: 1 }}>
                <label className="lap-modal-label" style={{ color: "#d9480f" }}>⚠️ Diinput Manual oleh HRD</label>
                <div className="lap-modal-input" style={{ background: "#fff9db", borderColor: "#fcc419", color: "#b06500", fontSize: "13px" }}>
                  Data kehadiran dan keterlambatan ini tercatat melalui sistem Absensi Manual.
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {item.tipe === "lembur" && (
        <>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal</label>
              <div className="lap-modal-input">{item.tanggal}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Cabang</label>
              <div className="lap-modal-input">{item.cabang}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jam Pulang Aktual</label>
              <div className="lap-modal-input" style={{ color: "#2980b9", fontWeight: "700" }}>{item.jamPulang}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Durasi Lembur</label>
              <div className="lap-modal-input" style={{ background: "#e3f2fd", borderColor: "#90caf9", color: "#1565c0", fontWeight: "700" }}>
                {Math.floor(item.menitLembur / 60)} Jam {item.menitLembur % 60} Menit
              </div>
            </div>
          </div>
          {item.isManual && (
            <div className="lap-modal-row">
              <div className="lap-modal-group" style={{ flex: 1 }}>
                <label className="lap-modal-label" style={{ color: "#d9480f" }}>⚠️ Diinput Manual oleh HRD</label>
                <div className="lap-modal-input" style={{ background: "#fff9db", borderColor: "#fcc419", color: "#b06500", fontSize: "13px" }}>
                  Data kehadiran dan lembur ini tercatat melalui sistem Absensi Manual.
                </div>
              </div>
            </div>
          )}
          <div className="lap-modal-row">
            <div className="lap-modal-group" style={{ flex: 1 }}>
              <label className="lap-modal-label">Keterangan / Catatan Sistem</label>
              <div className="lap-modal-input" style={{ background: "#f8f9fa", borderColor: "#ddd", color: "#555", fontSize: "13px" }}>
                {item.alasan}
              </div>
            </div>
          </div>
        </>
      )}

      {item.tipe === "izin_sakit" && (
        <>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jenis Izin</label>
              <div className="lap-modal-input">{item.jenisIzin}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal Mulai</label>
              <div className="lap-modal-input">{item.tanggalMulai}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal Akhir</label>
              <div className="lap-modal-input">{item.tanggalAkhir}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Keterangan</label>
              <div className="lap-modal-input">{item.keterangan}</div>
            </div>
          </div>
          <div className="lap-foto-container">
            <div className="lap-foto-box">
              {item.foto ? (
                <>
                  <img src={item.foto} alt="Bukti" className="lap-foto-img" />
                  <div className="lap-foto-overlay">Bukti Dokumen / Surat</div>
                  <button type="button" className="lap-zoom-btn" onClick={() => setPreviewImage(item.foto)}>🔍</button>
                </>
              ) : (
                <div className="lap-manual-placeholder">
                  <span>📄 Tidak Ada Bukti</span>
                  <small>Dikirim tanpa lampiran foto</small>
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
        </>
      )}
      {item.tipe === "cuti" && (
        <>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Cabang</label>
              <div className="lap-modal-input">{item.cabang}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jenis Cuti</label>
              <div className="lap-modal-input">{item.jenisCuti}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jabatan</label>
              <div className="lap-modal-input">{item.jabatan}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Divisi</label>
              <div className="lap-modal-input">{item.divisi}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal Mulai</label>
              <div className="lap-modal-input">{item.tanggalMulai}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal Akhir</label>
              <div className="lap-modal-input">{item.tanggalAkhir}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group" style={{ flex: 1 }}>
              <label className="lap-modal-label">Keterangan</label>
              <div className="lap-modal-input" style={{ minHeight: "40px", height: "auto" }}>{item.keterangan}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group" style={{ flex: 1 }}>
              <label className="lap-modal-label">Nomor Telepon</label>
              <div className="lap-modal-input">{item.noTelp}</div>
            </div>
          </div>
        </>
      )}
      {item.tipe === "fimtk" && (
        <>
          <div className="lap-modal-row">
            <div className="lap-modal-group" style={{ flex: 1 }}>
              <label className="lap-modal-label">Cabang</label>
              <div className="lap-modal-input">{item.cabang}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jabatan</label>
              <div className="lap-modal-input">{item.jabatan}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Divisi</label>
              <div className="lap-modal-input">{item.divisi}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Izin MTK</label>
              <div className="lap-modal-input">{item.izinMTK}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal</label>
              <div className="lap-modal-input">{item.tanggal}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jam Mulai</label>
              <div className="lap-modal-input">{item.jamMulai}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jam Akhir</label>
              <div className="lap-modal-input">{item.jamAkhir}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Keperluan</label>
              <div className="lap-modal-input">{item.keperluan}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Kendaraan</label>
              <div className="lap-modal-input">{item.kendaraan}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group" style={{ flex: 1 }}>
              <label className="lap-modal-label">Alasan</label>
              <div className="lap-modal-input" style={{ minHeight: "40px", height: "auto" }}>{item.alasan}</div>
            </div>
          </div>
        </>
      )}
      {item.tipe === "alpha" && (
        <>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Tanggal</label>
              <div className="lap-modal-input">{item.tanggal}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Cabang</label>
              <div className="lap-modal-input">{item.cabang}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jadwal Kerja Seharusnya</label>
              <div className="lap-modal-input">{item.jadwal}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Status</label>
              <div className="lap-modal-input" style={{ color: "#e03131", fontWeight: "700" }}>{item.status}</div>
            </div>
          </div>
          <div className="lap-modal-row">
            <div className="lap-modal-group" style={{ flex: 1 }}>
              <label className="lap-modal-label">Keterangan / Catatan Sistem</label>
              <div className="lap-modal-input" style={{ background: "#fff5f5", borderColor: "#ffc9c9", color: "#c92a2a", fontSize: "13px" }}>
                {item.keterangan}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTable = (headerText, tableData) => {
    const totals = getTotals();

    return (
      <div className="neo-table-card">
        <div className="neo-table-header">{headerText}</div>
        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
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
              {loading ? (
                <tr>
                  <td colSpan="9" className="empty-state">Memuat data...</td>
                </tr>
              ) : tableData.length > 0 ? (
                tableData.map((item) => {
                  const rowClass = getRowTerlambatClass(item.terlambat);
                  return (
                    <tr key={item.id} className={rowClass}>
                      <td className="neo-td-name">{item.nama}</td>
                      <td className="text-center">
                        <div className="neo-dual-badge-container">
                          <span className={`neo-badge ${item.hadirApp !== "0" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Hadir via App", item.hadirApp)}>{item.hadirApp}</span>
                          <span className={`neo-badge manual ${item.hadirManual !== "0" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Hadir Manual", item.hadirManual)}>{item.hadirManual}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`neo-badge ${rowClass ? "warn-badge" : ""} ${item.terlambat !== "0" && item.terlambat !== "-" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Terlambat", item.terlambat)}>{item.terlambat}</span>
                      </td>
                      <td className="text-center">
                        <span className={`neo-badge info ${item.fimtk !== "0" && item.fimtk !== "-" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "FIMTK", item.fimtk)}>{item.fimtk}</span>
                      </td>
                      <td className="text-center">
                        <span className={`neo-badge ${item.sakit !== "0" && item.sakit !== "-" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Sakit", item.sakit)}>{item.sakit}</span>
                      </td>
                      <td className="text-center">
                        <span className={`neo-badge ${item.izin !== "0" && item.izin !== "-" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Izin", item.izin)}>{item.izin}</span>
                      </td>
                      <td className="text-center">
                        <span className={`neo-badge ${item.cuti !== "0" && item.cuti !== "-" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Cuti", item.cuti)}>{item.cuti}</span>
                      </td>
                      <td className="text-center">
                        <span className={`neo-badge alert ${item.alpha !== "0" && item.alpha !== "-" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Alpha", item.alpha)}>{item.alpha}</span>
                      </td>
                      <td className="text-center">
                        <span className={`neo-badge info ${item.lembur !== "0" && item.lembur !== "-" && item.lembur !== "0 Jam" ? "clickable-badge" : ""}`} onClick={() => openDetail(item, "Lembur", item.lembur)}>{item.lembur}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="empty-state">Data karyawan tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
            {tableData.length > 0 && !loading && (
              <tfoot>
                <tr>
                  <td className="neo-td-name" style={{ textAlign: "right", paddingRight: "20px" }}>TOTAL KESELURUHAN</td>
                  <td className="text-center">
                    <div className="neo-dual-badge-container">
                      <span className="neo-badge">{totals.hadirApp}</span>
                      <span className="neo-badge manual">{totals.hadirManual}</span>
                    </div>
                  </td>
                  <td className="text-center"><span className="neo-badge">{totals.terlambat}</span></td>
                  <td className="text-center"><span className="neo-badge info">{totals.fimtk}</span></td>
                  <td className="text-center"><span className="neo-badge">{totals.sakit}</span></td>
                  <td className="text-center"><span className="neo-badge">{totals.izin}</span></td>
                  <td className="text-center"><span className="neo-badge">{totals.cuti}</span></td>
                  <td className="text-center"><span className="neo-badge alert">{totals.alpha}</span></td>
                  <td className="text-center"><span className="neo-badge info">{totals.lembur}</span></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button className="btn-hamburger" onClick={openSidebar} aria-label="Buka menu"><span></span><span></span><span></span></button>
      </div>

      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={closeSidebar} />

      <aside className={`sidebar no-print ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">✕</button>
        <div className="logo-area"><img src={logoPersegi} alt="AMAGACORP" className="logo-img" /></div>
        <nav className="menu-nav">
          {MENU_ITEMS.map((item, index) => (
            <div
              key={index}
              className={`menu-item ${item.active ? "active" : ""} ${item.hasArrow ? "has-arrow" : ""}`}
              onClick={() => handleNav(item.path)}
            >
              <div className="menu-left">
                <img src={item.icon} alt="" className="menu-icon-main" />
                <span className="menu-text-main">{item.text}</span>
              </div>
              {item.hasArrow && <img src={iconBawah} alt="down" className="arrow-icon-main" />}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={handleLogout}>Log Out</button></div>
      </aside>

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
              <input type="date" className="neo-input" value={startDate} onChange={(e) => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(""); }} />
            </div>
            <div className="neo-field">
              <label>Tanggal Selesai</label>
              <input type="date" className="neo-input" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!startDate} />
            </div>
          </div>

          <div className="button-group-vertical-right">
            <div className="dropdown-neo-bottom-wrapper">
              <button className="btn-neo-print-top no-print" onClick={() => setShowExportMenu(!showExportMenu)}>Print</button>
              {showExportMenu && (
                <div className="neo-dropdown-list-right" style={{ top: "115%" }}>
                  <div className="neo-drop-item" onClick={() => { window.print(); setShowExportMenu(false); }}>Unduh PDF</div>
                  <div className="neo-drop-item" onClick={() => { handleExportExcel(); setShowExportMenu(false); }}>Unduh Excel</div>
                </div>
              )}
            </div>

            <div className="dropdown-neo-bottom-wrapper">
              <button className="btn-neo-filter-bottom" onClick={toggleFilter}>
                {selectedFilter} <img src={iconBawah} alt="v" className={showFilter ? "rotate" : ""} />
              </button>
              {showFilter && (
                <div className="neo-dropdown-list-right">
                  <div className="neo-drop-item" onClick={() => handleSelectFilter("Semua Cabang")}>Semua Cabang</div>
                  {cabangList.map((c) => (
                    <div key={c} className="neo-drop-item" onClick={() => handleSelectFilter(c)}>{c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {renderTable("Data Kehadiran Karyawan", filteredData)}
      </main>

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
              <hr style={{ border: "none", borderBottom: "1px solid #eee", margin: "20px 0" }} />
              <div className="lap-modal-scroll-area">
                {modalInfo.data.length > 0 ? (
                  modalInfo.data.map((item, idx) => renderModalBody(item, idx))
                ) : (
                  <p style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>Belum ada riwayat detail yang tercatat.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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