import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./laporan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

// ============================================================================
// CONSTANTS: NAVIGATION
// ============================================================================

const MENU_ITEMS = [
  {
    path: "/hrd/dashboard",
    icon: iconDashboard,
    text: "Dashboard",
  },
  {
    path: "/hrd/kelolacabang",
    icon: iconKelola,
    text: "Kelola Cabang",
  },
  {
    path: "/hrd/datakaryawan",
    icon: iconKaryawan,
    text: "Data Karyawan",
  },
  {
    path: "/hrd/kehadiran",
    icon: iconKehadiran,
    text: "Kehadiran",
    hasArrow: true,
  },
  {
    path: "/hrd/laporan",
    icon: iconLaporan,
    text: "Laporan",
    active: true,
  },
];

// ============================================================================
// CONSTANTS: API & EXPORT
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AUTH_ERROR_STATUSES = [401, 403];

const REPORT_COLUMNS = [
  "Nama Karyawan",
  "Hadir App / Manual",
  "Terlambat",
  "FIMTK",
  "Sakit",
  "Izin",
  "Cuti",
  "Alpha",
  "Lembur",
];

const EMPTY_TOTALS = {
  hadirApp: 0,
  hadirManual: 0,
  terlambat: 0,
  fimtk: 0,
  sakit: 0,
  izin: 0,
  cuti: 0,
  alpha: 0,
  lembur: 0,
};

const INITIAL_MODAL_INFO = {
  title: "",
  nama: "",
  nik: "",
  jenisData: "",
  data: [],
};

// ============================================================================
// HELPERS: DATE & AUTH
// ============================================================================

// Mengubah objek Date menjadi format YYYY-MM-DD untuk input tanggal.
const formatDate = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

// Menentukan periode default laporan berdasarkan cutoff tanggal 26-25.
const getCutoffDates = () => {
  const today = new Date();
  const date = today.getDate();

  if (date <= 25) {
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 26),
      end: new Date(today.getFullYear(), today.getMonth(), 25),
    };
  }

  return {
    start: new Date(today.getFullYear(), today.getMonth(), 26),
    end: new Date(today.getFullYear(), today.getMonth() + 1, 25),
  };
};

// Mengecek apakah response API menunjukkan sesi pengguna sudah tidak valid.
const isAuthError = (status) => {
  return AUTH_ERROR_STATUSES.includes(status);
};

// ============================================================================
// HELPERS: DATA PROCESSING
// ============================================================================

// Mengubah nilai menjadi angka aman agar perhitungan total tidak menghasilkan NaN.
const toNumber = (value) => {
  return parseInt(value, 10) || 0;
};

// Menentukan class peringatan baris berdasarkan jumlah keterlambatan.
const getRowTerlambatClass = (jumlahTerlambat) => {
  const angka = parseInt(jumlahTerlambat, 10);

  if (isNaN(angka)) {
    return "";
  }

  if (angka === 3) {
    return "row-warn-yellow";
  }

  if (angka >= 4 && angka <= 5) {
    return "row-warn-orange";
  }

  if (angka >= 6) {
    return "row-warn-red";
  }

  return "";
};

// Mengecek apakah badge memiliki detail yang bisa dibuka.
const isDetailAvailable = (jumlah) => {
  return jumlah !== "0" && jumlah !== "-" && jumlah !== "0 Jam";
};

// Menghitung total semua kolom laporan dari data yang sedang tampil.
const calculateTotals = (data) => {
  return data.reduce(
    (totals, item) => ({
      hadirApp: totals.hadirApp + toNumber(item.hadirApp),
      hadirManual: totals.hadirManual + toNumber(item.hadirManual),
      terlambat: totals.terlambat + toNumber(item.terlambat),
      fimtk: totals.fimtk + toNumber(item.fimtk),
      sakit: totals.sakit + toNumber(item.sakit),
      izin: totals.izin + toNumber(item.izin),
      cuti: totals.cuti + toNumber(item.cuti),
      alpha: totals.alpha + toNumber(item.alpha),
      lembur: totals.lembur + toNumber(item.lembur),
    }),
    { ...EMPTY_TOTALS }
  );
};

// Mengurutkan detail modal dari tanggal terbaru ke tanggal terlama.
const sortDetailByDateDesc = (data) => {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.tanggal || a.tanggalMulai).getTime();
    const dateB = new Date(b.tanggal || b.tanggalMulai).getTime();

    return dateB - dateA;
  });
};

// ============================================================================
// COMPONENT: LAPORAN
// ============================================================================

const Laporan = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState("Semua Cabang");
  const [searchTerm, setSearchTerm] = useState("");
  const [cabangList, setCabangList] = useState([]);

  const [dataLaporan, setDataLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(() => {
    return formatDate(getCutoffDates().start);
  });

  const [endDate, setEndDate] = useState(() => {
    return formatDate(getCutoffDates().end);
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalInfo, setModalInfo] = useState(INITIAL_MODAL_INFO);
  const [previewImage, setPreviewImage] = useState(null);

  // ============================================================================
  // HANDLERS: AUTH & NAVIGATION
  // ============================================================================

  // Menghapus sesi pengguna dan mengarahkan kembali ke halaman login.
  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mengarahkan pengguna ke halaman yang dipilih dan menutup sidebar mobile.
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  // ============================================================================
  // HANDLERS: DATA FETCHING
  // ============================================================================

  // Mengambil daftar cabang dan data laporan sesuai periode yang dipilih.
  const fetchReportData = async () => {
    try {
      setLoading(true);

      const cabangResponse = await fetch(`${API_BASE_URL}/api/cabang`, {
        headers: getAuthHeaders(),
      });

      if (isAuthError(cabangResponse.status)) {
        handleLogout();
        return;
      }

      const cabangData = await cabangResponse.json();
      const cabangNames = Array.isArray(cabangData)
        ? cabangData.map((cabang) => cabang.nama)
        : [];

      setCabangList(cabangNames);

      const laporanResponse = await fetch(
        `${API_BASE_URL}/api/laporan?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (isAuthError(laporanResponse.status)) {
        handleLogout();
        return;
      }

      const laporanData = await laporanResponse.json();
      setDataLaporan(Array.isArray(laporanData) ? laporanData : []);
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, logout, navigate]);

  // ============================================================================
  // MEMOIZED DATA
  // ============================================================================

  const filteredData = useMemo(() => {
    if (!Array.isArray(dataLaporan)) {
      return [];
    }

    return dataLaporan.filter((item) => {
      const nama = item.nama || "";
      const cabang = item.cabang || "";

      const matchName = nama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBranch =
        selectedFilter === "Semua Cabang" || cabang === selectedFilter;

      return matchName && matchBranch;
    });
  }, [dataLaporan, searchTerm, selectedFilter]);

  const totals = useMemo(() => {
    return calculateTotals(filteredData);
  }, [filteredData]);

  // ============================================================================
  // HANDLERS: FILTER & EXPORT MENU
  // ============================================================================

  const toggleFilter = () => {
    setShowFilter((previousValue) => !previousValue);
  };

  const toggleExportMenu = () => {
    setShowExportMenu((previousValue) => !previousValue);
  };

  // Memilih cabang pada dropdown filter dan menutup dropdown setelah dipilih.
  const handleSelectFilter = (value) => {
    setSelectedFilter(value);
    setShowFilter(false);
  };

  // Memperbarui tanggal mulai dan mengosongkan tanggal selesai jika periodenya tidak valid.
  const handleStartDateChange = (event) => {
    const selectedDate = event.target.value;

    setStartDate(selectedDate);

    if (endDate && selectedDate > endDate) {
      setEndDate("");
    }
  };

  // ============================================================================
  // HANDLERS: EXPORT PDF & EXCEL
  // ============================================================================

  // Membuat data baris tabel untuk kebutuhan export PDF.
  const buildPdfTableBody = () => {
    const tableBody = filteredData.map((item) => [
      item.nama || "-",
      `${item.hadirApp || "0"} / ${item.hadirManual || "0"}`,
      item.terlambat || "0",
      item.fimtk || "0",
      item.sakit || "0",
      item.izin || "0",
      item.cuti || "0",
      item.alpha || "0",
      item.lembur || "0 Jam",
    ]);

    tableBody.push([
      "TOTAL KESELURUHAN",
      `${totals.hadirApp} / ${totals.hadirManual}`,
      totals.terlambat,
      totals.fimtk,
      totals.sakit,
      totals.izin,
      totals.cuti,
      totals.alpha,
      `${totals.lembur} Jam`,
    ]);

    return tableBody;
  };

  // Mengunduh laporan kehadiran dalam format PDF.
  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const printedAt = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const tableBody = buildPdfTableBody();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Laporan Kehadiran", 14, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Data rekapitulasi absensi seluruh karyawan", 14, 20);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 26);
    doc.text(`Cabang: ${selectedFilter}`, 14, 32);

    autoTable(doc, {
      startY: 38,
      head: [REPORT_COLUMNS],
      body: tableBody,
      theme: "grid",
      margin: {
        top: 38,
        left: 14,
        right: 14,
        bottom: 16,
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        valign: "middle",
        overflow: "linebreak",
        lineWidth: 0.1,
        lineColor: [180, 180, 180],
      },
      headStyles: {
        fillColor: [141, 174, 18],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: {
          cellWidth: 58,
          halign: "left",
        },
        1: {
          cellWidth: 30,
          halign: "center",
        },
        2: {
          cellWidth: 24,
          halign: "center",
        },
        3: {
          cellWidth: 20,
          halign: "center",
        },
        4: {
          cellWidth: 20,
          halign: "center",
        },
        5: {
          cellWidth: 20,
          halign: "center",
        },
        6: {
          cellWidth: 20,
          halign: "center",
        },
        7: {
          cellWidth: 20,
          halign: "center",
        },
        8: {
          cellWidth: 25,
          halign: "center",
        },
      },
      didParseCell: (data) => {
        const isTotalRow = data.row.index === tableBody.length - 1;

        if (isTotalRow) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [245, 245, 245];
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
    });

    const totalPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80);

      doc.text(`Dicetak: ${printedAt}`, 14, pageHeight - 8);
      doc.text(`Halaman ${page} / ${totalPages}`, pageWidth - 42, pageHeight - 8);
    }

    doc.save(`Rekap_Kehadiran_HRD_${startDate}_sd_${endDate}.pdf`);
  };

  // Mengunduh laporan kehadiran dalam format Excel.
  const handleExportExcel = () => {
    const exportData = filteredData.map((item) => ({
      "Nama Karyawan": item.nama,
      NIK: item.nik,
      Cabang: item.cabang,
      "Hadir via App": toNumber(item.hadirApp),
      "Hadir Manual": toNumber(item.hadirManual),
      Terlambat: toNumber(item.terlambat),
      FIMTK: toNumber(item.fimtk),
      Sakit: toNumber(item.sakit),
      Izin: toNumber(item.izin),
      Cuti: toNumber(item.cuti),
      Alpha: toNumber(item.alpha),
      Lembur: item.lembur,
    }));

    exportData.push({
      "Nama Karyawan": "TOTAL KESELURUHAN",
      NIK: "-",
      Cabang: "-",
      "Hadir via App": totals.hadirApp,
      "Hadir Manual": totals.hadirManual,
      Terlambat: totals.terlambat,
      FIMTK: totals.fimtk,
      Sakit: totals.sakit,
      Izin: totals.izin,
      Cuti: totals.cuti,
      Alpha: totals.alpha,
      Lembur: `${totals.lembur} Jam`,
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Kehadiran");
    XLSX.writeFile(
      workbook,
      `Rekap_Kehadiran_HRD_${startDate}_sd_${endDate}.xlsx`
    );
  };

  // ============================================================================
  // HELPERS: DETAIL DATA
  // ============================================================================

  const buildHadirAppDetails = (item) => {
    const { cabang, rawAbsensi = [] } = item;

    return rawAbsensi
      .filter((absensi) => !absensi.is_manual_masuk)
      .map((absensi) => ({
        tipe: "absen",
        tanggal: absensi.tanggal,
        cabang,
        masuk: {
          jam: absensi.waktu_masuk || "-",
          isManual: false,
          foto: absensi.foto_masuk || null,
          keterangan: "",
          admin: "",
        },
        pulang: {
          jam: absensi.waktu_pulang || "-",
          isManual: false,
          foto: absensi.foto_pulang || null,
          keterangan: "",
          admin: "",
        },
      }));
  };

  const buildHadirManualDetails = (item) => {
    const { cabang, rawAbsensi = [] } = item;

    return rawAbsensi
      .filter((absensi) => absensi.is_manual_masuk)
      .map((absensi) => ({
        tipe: "absen",
        isLogManual: true,
        tanggal: absensi.tanggal,
        cabang,
        masuk: {
          jam: absensi.waktu_masuk || "-",
          isManual: true,
          foto: null,
          keterangan: absensi.keterangan_manual || "-",
          admin: "HRD",
        },
        pulang: {
          jam: absensi.waktu_pulang || "-",
          isManual: true,
          foto: null,
          keterangan: absensi.keterangan_manual || "-",
          admin: "HRD",
        },
      }));
  };

  const buildTerlambatDetails = (item) => {
    const { cabang, rawAbsensi = [] } = item;

    return rawAbsensi
      .filter((absensi) => absensi.menit_terlambat > 0)
      .map((absensi) => ({
        tipe: "terlambat",
        tanggal: absensi.tanggal,
        cabang,
        jamMasuk: absensi.waktu_masuk || "-",
        menitTelat: absensi.menit_terlambat,
        isManual: absensi.is_manual_masuk,
      }));
  };

  const buildSakitDetails = (item) => {
    const { rawPerizinan = [] } = item;

    return rawPerizinan
      .filter((perizinan) => {
        return perizinan.kategori === "Izin" && perizinan.jenis_izin === "Sakit";
      })
      .map((perizinan) => ({
        tipe: "izin_sakit",
        jenisIzin: "Sakit",
        tanggalMulai: perizinan.tanggal_mulai,
        tanggalAkhir: perizinan.tanggal_selesai,
        keterangan: perizinan.keterangan || "-",
        foto: perizinan.bukti_foto || null,
      }));
  };

  const buildIzinDetails = (item) => {
    const { rawPerizinan = [] } = item;

    return rawPerizinan
      .filter((perizinan) => {
        return perizinan.kategori === "Izin" && perizinan.jenis_izin !== "Sakit";
      })
      .map((perizinan) => ({
        tipe: "izin_sakit",
        jenisIzin: perizinan.jenis_izin || "Lainnya",
        tanggalMulai: perizinan.tanggal_mulai,
        tanggalAkhir: perizinan.tanggal_selesai,
        keterangan: perizinan.keterangan || perizinan.keperluan || "-",
        foto: perizinan.bukti_foto || null,
      }));
  };

  const buildCutiDetails = (item) => {
    const { cabang, rawPerizinan = [] } = item;

    return rawPerizinan
      .filter((perizinan) => perizinan.kategori === "Cuti")
      .map((perizinan) => ({
        tipe: "cuti",
        cabang,
        jabatan: item.jabatan || "-",
        divisi: item.divisi || "-",
        jenisCuti: perizinan.jenis_izin || "Cuti Tahunan",
        tanggalMulai: perizinan.tanggal_mulai,
        tanggalAkhir: perizinan.tanggal_selesai,
        keterangan: perizinan.keterangan || perizinan.keperluan || "-",
        noTelp: item.noTelp || "-",
      }));
  };

  const buildFimtkDetails = (item) => {
    const { cabang, rawPerizinan = [] } = item;

    return rawPerizinan
      .filter((perizinan) => perizinan.kategori === "FIMTK")
      .map((perizinan) => ({
        tipe: "fimtk",
        cabang,
        jabatan: item.jabatan || "-",
        divisi: item.divisi || "-",
        izinMTK: perizinan.jenis_izin || "FIMTK",
        tanggal: perizinan.tanggal_mulai,
        jamMulai: perizinan.jam_mulai || "-",
        jamAkhir: perizinan.jam_selesai || "-",
        keperluan: perizinan.keperluan || "-",
        kendaraan: perizinan.kendaraan || "-",
        alasan: perizinan.keterangan || "-",
      }));
  };

  const buildAlphaDetails = (item) => {
    const { cabang, rawAlpha = [] } = item;

    return rawAlpha.map((alpha) => ({
      tipe: "alpha",
      tanggal: alpha.tanggal,
      cabang,
      jadwal: "Sesuai Jam Operasional",
      status: "ALPHA",
      keterangan: alpha.keterangan,
    }));
  };

  const buildLemburDetails = (item) => {
    const { cabang, rawAbsensi = [] } = item;

    return rawAbsensi
      .filter((absensi) => absensi.menit_lembur > 0)
      .map((absensi) => {
        let alasan = "Lembur reguler di luar jam kerja";

        if (!absensi.waktu_istirahat_mulai) {
          alasan =
            "Kompensasi lembur karena tidak mengambil hak istirahat (3 Jam)";

          if (absensi.menit_lembur > 180) {
            alasan = "Kompensasi tidak istirahat & lembur reguler";
          }
        }

        return {
          tipe: "lembur",
          tanggal: absensi.tanggal,
          cabang,
          jamPulang: absensi.waktu_pulang || "-",
          menitLembur: absensi.menit_lembur,
          alasan,
          isManual: absensi.is_manual_masuk,
        };
      });
  };

  // Menyiapkan data detail sesuai badge laporan yang dipilih.
  const getDetailDataByType = (item, jenis) => {
    if (jenis === "Hadir via App") {
      return {
        title: "Log Absensi Mandiri (Karyawan)",
        data: buildHadirAppDetails(item),
      };
    }

    if (jenis === "Hadir Manual") {
      return {
        title: "Log Rekapitulasi Manual (Admin HRD)",
        data: buildHadirManualDetails(item),
      };
    }

    if (jenis === "Terlambat") {
      return {
        title: "Rincian Keterlambatan",
        data: buildTerlambatDetails(item),
      };
    }

    if (jenis === "Sakit") {
      return {
        title: "Log Perizinan (Sakit)",
        data: buildSakitDetails(item),
      };
    }

    if (jenis === "Izin") {
      return {
        title: "Log Perizinan (Izin)",
        data: buildIzinDetails(item),
      };
    }

    if (jenis === "Cuti") {
      return {
        title: "Log Perizinan (Cuti)",
        data: buildCutiDetails(item),
      };
    }

    if (jenis === "FIMTK") {
      return {
        title: "Log Perizinan (FIMTK)",
        data: buildFimtkDetails(item),
      };
    }

    if (jenis === "Alpha") {
      return {
        title: "Rincian Alpha",
        data: buildAlphaDetails(item),
      };
    }

    if (jenis === "Lembur") {
      return {
        title: "Rincian Lembur",
        data: buildLemburDetails(item),
      };
    }

    return {
      title: `Rincian ${jenis}`,
      data: [],
    };
  };

  // Membuka modal detail ketika jumlah pada badge laporan diklik.
  const openDetail = (item, jenis, jumlah) => {
    if (!isDetailAvailable(jumlah)) {
      return;
    }

    const detail = getDetailDataByType(item, jenis);

    setModalInfo({
      title: detail.title,
      nama: item.nama,
      nik: item.nik,
      jenisData: jenis,
      data: sortDetailByDateDesc(detail.data),
    });

    setShowDetailModal(true);
  };

  // ============================================================================
  // RENDER HELPERS: SIDEBAR
  // ============================================================================

  const renderMenuItems = () => {
    return MENU_ITEMS.map((item) => (
      <div
        key={item.path}
        className={`menu-item ${item.active ? "active" : ""} ${
          item.hasArrow ? "has-arrow" : ""
        }`}
        onClick={() => handleNav(item.path)}
      >
        <div className="menu-left">
          <img src={item.icon} alt="" className="menu-icon-main" />
          <span className="menu-text-main">{item.text}</span>
        </div>

        {item.hasArrow && (
          <img src={iconBawah} alt="down" className="arrow-icon-main" />
        )}
      </div>
    ));
  };

  // ============================================================================
  // RENDER HELPERS: MODAL FOTO
  // ============================================================================

  const renderPhotoPreviewButton = (photoUrl) => {
    return (
      <button
        type="button"
        className="lap-zoom-btn"
        onClick={() => setPreviewImage(photoUrl)}
      >
        🔍
      </button>
    );
  };

  const renderAbsensiPhotoBox = (photoUrl, label) => {
    return (
      <div className="lap-foto-box">
        {!photoUrl ? (
          <div className="lap-manual-placeholder">
            <span>Tidak Ada Foto</span>
            <small>No Photo Available</small>
          </div>
        ) : photoUrl.includes("Dihapus Otomatis") ? (
          <div className="lap-manual-placeholder">
            <span>Telah Dihapus</span>
            <small>Usia file &gt; 30 Hari</small>
          </div>
        ) : (
          <>
            <img src={photoUrl} alt={label} className="lap-foto-img" />
            <div className="lap-foto-overlay">Absen {label}</div>
            {renderPhotoPreviewButton(photoUrl)}
          </>
        )}
      </div>
    );
  };

  const renderBuktiPerizinanPhoto = (photoUrl) => {
    return (
      <div className="lap-foto-box">
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="Bukti" className="lap-foto-img" />
            <div className="lap-foto-overlay">Bukti Dokumen / Surat</div>
            {renderPhotoPreviewButton(photoUrl)}
          </>
        ) : (
          <div className="lap-manual-placeholder">
            <span>📄 Tidak Ada Bukti</span>
            <small>Dikirim tanpa lampiran foto</small>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: MODAL DETAIL
  // ============================================================================

  const renderAbsenDetail = (item) => {
    return (
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
            <label className="lap-modal-label">
              {item.isLogManual ? "Absen Masuk" : "Jam Masuk"}
            </label>
            <div className="lap-modal-input">{item.masuk.jam}</div>
          </div>

          <div className="lap-modal-group">
            <label className="lap-modal-label">
              {item.isLogManual ? "Absen Pulang" : "Jam Pulang"}
            </label>
            <div className="lap-modal-input">{item.pulang.jam}</div>
          </div>
        </div>

        {(item.masuk.isManual || item.pulang.isManual) && (
          <div className="lap-modal-row">
            <div className="lap-modal-group" style={{ flex: 1 }}>
              <label className="lap-modal-label">Keterangan</label>
              <div
                className="lap-modal-input"
                style={{
                  minHeight: "40px",
                  height: "auto",
                }}
              >
                {item.masuk.keterangan}
              </div>
            </div>
          </div>
        )}

        {!item.isLogManual && (
          <div className="lap-foto-container">
            {renderAbsensiPhotoBox(item.masuk.foto, "Masuk")}
            {renderAbsensiPhotoBox(item.pulang.foto, "Pulang")}
          </div>
        )}
      </>
    );
  };

  const renderManualWarning = (message) => {
    return (
      <div className="lap-modal-row">
        <div className="lap-modal-group" style={{ flex: 1 }}>
          <label className="lap-modal-label" style={{ color: "#d9480f" }}>
            ⚠️ Diinput Manual oleh HRD
          </label>

          <div
            className="lap-modal-input"
            style={{
              background: "#fff9db",
              borderColor: "#fcc419",
              color: "#b06500",
              fontSize: "13px",
            }}
          >
            {message}
          </div>
        </div>
      </div>
    );
  };

  const renderTerlambatDetail = (item) => {
    return (
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
            <div
              className="lap-modal-input"
              style={{
                color: "#d9480f",
                fontWeight: "700",
              }}
            >
              {item.jamMasuk}
            </div>
          </div>

          <div className="lap-modal-group">
            <label className="lap-modal-label">Keterlambatan</label>
            <div
              className="lap-modal-input"
              style={{
                background: "#fff5f5",
                borderColor: "#ffc9c9",
                color: "#c92a2a",
                fontWeight: "700",
              }}
            >
              {item.menitTelat} Menit
            </div>
          </div>
        </div>

        {item.isManual &&
          renderManualWarning(
            "Data kehadiran dan keterlambatan ini tercatat melalui sistem Absensi Manual."
          )}
      </>
    );
  };

  const renderLemburDetail = (item) => {
    return (
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
            <div
              className="lap-modal-input"
              style={{
                color: "#2980b9",
                fontWeight: "700",
              }}
            >
              {item.jamPulang}
            </div>
          </div>

          <div className="lap-modal-group">
            <label className="lap-modal-label">Durasi Lembur</label>
            <div
              className="lap-modal-input"
              style={{
                background: "#e3f2fd",
                borderColor: "#90caf9",
                color: "#1565c0",
                fontWeight: "700",
              }}
            >
              {Math.floor(item.menitLembur / 60)} Jam {item.menitLembur % 60}{" "}
              Menit
            </div>
          </div>
        </div>

        {item.isManual &&
          renderManualWarning(
            "Data kehadiran dan lembur ini tercatat melalui sistem Absensi Manual."
          )}

        <div className="lap-modal-row">
          <div className="lap-modal-group" style={{ flex: 1 }}>
            <label className="lap-modal-label">
              Keterangan / Catatan Sistem
            </label>

            <div
              className="lap-modal-input"
              style={{
                background: "#f8f9fa",
                borderColor: "#ddd",
                color: "#555",
                fontSize: "13px",
              }}
            >
              {item.alasan}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderIzinSakitDetail = (item) => {
    return (
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
          {renderBuktiPerizinanPhoto(item.foto)}
          <div style={{ flex: 1 }} />
        </div>
      </>
    );
  };

  const renderCutiDetail = (item) => {
    return (
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
            <div
              className="lap-modal-input"
              style={{
                minHeight: "40px",
                height: "auto",
              }}
            >
              {item.keterangan}
            </div>
          </div>
        </div>

        <div className="lap-modal-row">
          <div className="lap-modal-group" style={{ flex: 1 }}>
            <label className="lap-modal-label">Nomor Telepon</label>
            <div className="lap-modal-input">{item.noTelp}</div>
          </div>
        </div>
      </>
    );
  };

  const renderFimtkDetail = (item) => {
    return (
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
            <div
              className="lap-modal-input"
              style={{
                minHeight: "40px",
                height: "auto",
              }}
            >
              {item.alasan}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderAlphaDetail = (item) => {
    return (
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
            <div
              className="lap-modal-input"
              style={{
                color: "#e03131",
                fontWeight: "700",
              }}
            >
              {item.status}
            </div>
          </div>
        </div>

        <div className="lap-modal-row">
          <div className="lap-modal-group" style={{ flex: 1 }}>
            <label className="lap-modal-label">
              Keterangan / Catatan Sistem
            </label>

            <div
              className="lap-modal-input"
              style={{
                background: "#fff5f5",
                borderColor: "#ffc9c9",
                color: "#c92a2a",
                fontSize: "13px",
              }}
            >
              {item.keterangan}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderModalBody = (item, index) => {
    const detailRenderers = {
      absen: renderAbsenDetail,
      terlambat: renderTerlambatDetail,
      lembur: renderLemburDetail,
      izin_sakit: renderIzinSakitDetail,
      cuti: renderCutiDetail,
      fimtk: renderFimtkDetail,
      alpha: renderAlphaDetail,
    };

    const renderDetail = detailRenderers[item.tipe];

    return (
      <div key={index} className="lap-modal-record-card">
        {renderDetail ? renderDetail(item) : null}
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: TABLE
  // ============================================================================

  const renderClickableBadge = ({
    item,
    jenis,
    value,
    extraClass = "",
    rowClass = "",
  }) => {
    const clickableClass = isDetailAvailable(value) ? "clickable-badge" : "";
    const warningClass = rowClass ? "warn-badge" : "";

    return (
      <span
        className={`neo-badge ${extraClass} ${warningClass} ${clickableClass}`}
        onClick={() => openDetail(item, jenis, value)}
      >
        {value}
      </span>
    );
  };

  const renderHadirBadges = (item) => {
    return (
      <div className="neo-dual-badge-container">
        {renderClickableBadge({
          item,
          jenis: "Hadir via App",
          value: item.hadirApp,
        })}

        {renderClickableBadge({
          item,
          jenis: "Hadir Manual",
          value: item.hadirManual,
          extraClass: "manual",
        })}
      </div>
    );
  };

  const renderDataRow = (item) => {
    const rowClass = getRowTerlambatClass(item.terlambat);

    return (
      <tr key={item.id} className={rowClass}>
        <td className="neo-td-name">{item.nama}</td>

        <td className="text-center">{renderHadirBadges(item)}</td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            jenis: "Terlambat",
            value: item.terlambat,
            rowClass,
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            jenis: "FIMTK",
            value: item.fimtk,
            extraClass: "info",
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            jenis: "Sakit",
            value: item.sakit,
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            jenis: "Izin",
            value: item.izin,
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            jenis: "Cuti",
            value: item.cuti,
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            jenis: "Alpha",
            value: item.alpha,
            extraClass: "alert",
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            jenis: "Lembur",
            value: item.lembur,
            extraClass: "info",
          })}
        </td>
      </tr>
    );
  };

  const renderTotalRow = () => {
    if (!filteredData || filteredData.length === 0 || loading) {
      return null;
    }

    return (
      <tr className="total-row-print">
        <td
          className="neo-td-name"
          style={{
            textAlign: "right",
            paddingRight: "20px",
          }}
        >
          TOTAL KESELURUHAN
        </td>

        <td className="text-center">
          <div className="neo-dual-badge-container">
            <span className="neo-badge">{totals.hadirApp}</span>
            <span className="neo-badge manual">{totals.hadirManual}</span>
          </div>
        </td>

        <td className="text-center">
          <span className="neo-badge">{totals.terlambat}</span>
        </td>

        <td className="text-center">
          <span className="neo-badge info">{totals.fimtk}</span>
        </td>

        <td className="text-center">
          <span className="neo-badge">{totals.sakit}</span>
        </td>

        <td className="text-center">
          <span className="neo-badge">{totals.izin}</span>
        </td>

        <td className="text-center">
          <span className="neo-badge">{totals.cuti}</span>
        </td>

        <td className="text-center">
          <span className="neo-badge alert">{totals.alpha}</span>
        </td>

        <td className="text-center">
          <span className="neo-badge info">{totals.lembur}</span>
        </td>
      </tr>
    );
  };

  const renderTableBody = (tableData) => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" className="empty-state">
            Memuat data...
          </td>
        </tr>
      );
    }

    if (tableData.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="empty-state">
            Data karyawan tidak ditemukan.
          </td>
        </tr>
      );
    }

    return tableData.map((item) => renderDataRow(item));
  };

  const renderTable = (headerText, tableData) => {
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
              {renderTableBody(tableData)}
              {renderTotalRow()}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img
          src={logoPersegi}
          alt="AMAGACORP"
          className="mobile-topbar-logo"
        />

        <button
          className="btn-hamburger"
          onClick={openSidebar}
          aria-label="Buka menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar no-print ${sidebarOpen ? "open" : ""}`}>
        <button
          className="btn-sidebar-close"
          onClick={closeSidebar}
          aria-label="Tutup menu"
        >
          ✕
        </button>

        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">{renderMenuItems()}</nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
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
              <input
                type="text"
                placeholder="Ketik nama..."
                className="neo-input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="neo-field">
              <label>Tanggal Mulai</label>
              <input
                type="date"
                className="neo-input"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>

            <div className="neo-field">
              <label>Tanggal Selesai</label>
              <input
                type="date"
                className="neo-input"
                min={startDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={!startDate}
              />
            </div>
          </div>

          <div className="button-group-vertical-right">
            <div className="dropdown-neo-bottom-wrapper">
              <button
                className="btn-neo-print-top no-print"
                onClick={toggleExportMenu}
              >
                Print
              </button>

              {showExportMenu && (
                <div
                  className="neo-dropdown-list-right"
                  style={{
                    top: "115%",
                  }}
                >
                  <div
                    className="neo-drop-item"
                    onClick={() => {
                      handleExportPdf();
                      setShowExportMenu(false);
                    }}
                  >
                    Unduh PDF
                  </div>

                  <div
                    className="neo-drop-item"
                    onClick={() => {
                      handleExportExcel();
                      setShowExportMenu(false);
                    }}
                  >
                    Unduh Excel
                  </div>
                </div>
              )}
            </div>

            <div className="dropdown-neo-bottom-wrapper">
              <button className="btn-neo-filter-bottom" onClick={toggleFilter}>
                {selectedFilter}
                <img
                  src={iconBawah}
                  alt="v"
                  className={showFilter ? "rotate" : ""}
                />
              </button>

              {showFilter && (
                <div className="neo-dropdown-list-right">
                  <div
                    className="neo-drop-item"
                    onClick={() => handleSelectFilter("Semua Cabang")}
                  >
                    Semua Cabang
                  </div>

                  {cabangList.map((cabang) => (
                    <div
                      key={cabang}
                      className="neo-drop-item"
                      onClick={() => handleSelectFilter(cabang)}
                    >
                      {cabang}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {renderTable("Data Kehadiran Karyawan", filteredData)}
      </main>

      {showDetailModal && (
        <div
          className="modal-overlay-lap"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content-lap"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header-lap">
              <h2>{modalInfo.title}</h2>

              <button
                className="close-btn-lap"
                onClick={() => setShowDetailModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body-lap">
              <div className="lap-modal-row">
                <div className="lap-modal-group">
                  <label className="lap-modal-label">Nama</label>
                  <div className="lap-modal-input">{modalInfo.nama}</div>
                </div>

                <div className="lap-modal-group">
                  <label className="lap-modal-label">NIK</label>
                  <div className="lap-modal-input">{modalInfo.nik}</div>
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  borderBottom: "1px solid #eee",
                  margin: "20px 0",
                }}
              />

              <div className="lap-modal-scroll-area">
                {modalInfo.data.length > 0 ? (
                  modalInfo.data.map((item, index) =>
                    renderModalBody(item, index)
                  )
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#888",
                      marginTop: "20px",
                    }}
                  >
                    Belum ada riwayat detail yang tercatat.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="lap-preview-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="lap-preview-close"
            onClick={() => setPreviewImage(null)}
          >
            &times;
          </button>

          <img
            src={previewImage}
            alt="Preview"
            className="lap-preview-img"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Laporan;