import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../hrd/laporan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconIzin from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

// ============================================================================
// KONSTANTA: MENU SIDEBAR
// ============================================================================

const MENU_ITEMS = [
  {
    path: "/managerCabang/dashboard",
    icon: iconDashboard,
    text: "Dashboard",
  },
  {
    path: "/managerCabang/datakaryawan",
    icon: iconKaryawan,
    text: "Data Karyawan",
  },
  {
    path: "/managerCabang/perizinan",
    icon: iconIzin,
    text: "Perizinan",
  },
  {
    path: "/managerCabang/laporan",
    icon: iconLaporan,
    text: "Laporan",
    active: true,
  },
];

// ============================================================================
// KONSTANTA: FILTER, MODAL, DAN NILAI DEFAULT
// ============================================================================

const ALL_BRANCH_FILTER = "Semua Cabang Saya";

const DEFAULT_MODAL_INFO = {
  title: "",
  nama: "",
  nik: "",
  jenisData: "",
  data: [],
};

const REPORT_TYPES = {
  HADIR_APP: "Hadir via App",
  HADIR_MANUAL: "Hadir Manual",
  TERLAMBAT: "Terlambat",
  FIMTK: "FIMTK",
  SAKIT: "Sakit",
  IZIN: "Izin",
  CUTI: "Cuti",
  ALPHA: "Alpha",
  LEMBUR: "Lembur",
};

// ============================================================================
// KONSTANTA: STYLE INLINE
// ============================================================================

const DROPDOWN_EXPORT_STYLE = {
  top: "115%",
};

const MODAL_DIVIDER_STYLE = {
  border: "none",
  borderBottom: "1px solid #eee",
  margin: "20px 0",
};

const EMPTY_MODAL_TEXT_STYLE = {
  textAlign: "center",
  color: "#888",
  marginTop: "20px",
};

const TABLE_TOTAL_LABEL_STYLE = {
  textAlign: "right",
  paddingRight: "20px",
};

const FLEX_FULL_STYLE = {
  flex: 1,
};

const MODAL_TEXTAREA_STYLE = {
  minHeight: "40px",
  height: "auto",
};

const WARNING_LABEL_STYLE = {
  color: "#d9480f",
};

const MANUAL_NOTE_STYLE = {
  background: "#fff9db",
  borderColor: "#fcc419",
  color: "#b06500",
  fontSize: "13px",
};

const LATE_TIME_STYLE = {
  color: "#d9480f",
  fontWeight: "700",
};

const LATE_DURATION_STYLE = {
  background: "#fff5f5",
  borderColor: "#ffc9c9",
  color: "#c92a2a",
  fontWeight: "700",
};

const OVERTIME_TIME_STYLE = {
  color: "#2980b9",
  fontWeight: "700",
};

const OVERTIME_DURATION_STYLE = {
  background: "#e3f2fd",
  borderColor: "#90caf9",
  color: "#1565c0",
  fontWeight: "700",
};

const SYSTEM_NOTE_STYLE = {
  background: "#f8f9fa",
  borderColor: "#ddd",
  color: "#555",
  fontSize: "13px",
};

const ALPHA_STATUS_STYLE = {
  color: "#e03131",
  fontWeight: "700",
};

const ALPHA_NOTE_STYLE = {
  background: "#fff5f5",
  borderColor: "#ffc9c9",
  color: "#c92a2a",
  fontSize: "13px",
};

// ============================================================================
// HELPER: FORMAT TANGGAL DAN CUT-OFF
// ============================================================================

const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const date = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

// Menentukan periode laporan default berdasarkan cut-off tanggal 26 sampai 25.
const getCutoffDates = () => {
  const currentDate = new Date();
  const date = currentDate.getDate();

  let start;
  let end;

  if (date <= 25) {
    start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      26,
    );

    end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      25,
    );
  } else {
    start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      26,
    );

    end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      25,
    );
  }

  return {
    start,
    end,
  };
};

// ============================================================================
// HELPER: DATA LAPORAN
// ============================================================================

// Menentukan class peringatan baris berdasarkan jumlah keterlambatan.
const getLateRowClass = (lateCount) => {
  const parsedLateCount = parseInt(lateCount, 10);

  if (Number.isNaN(parsedLateCount)) {
    return "";
  }

  if (parsedLateCount === 3) {
    return "row-warn-yellow";
  }

  if (parsedLateCount >= 4 && parsedLateCount <= 5) {
    return "row-warn-orange";
  }

  if (parsedLateCount >= 6) {
    return "row-warn-red";
  }

  return "";
};

const getInitialStartDate = () => formatDate(getCutoffDates().start);

const getInitialEndDate = () => formatDate(getCutoffDates().end);

const isUnauthorizedResponse = (response) => {
  return response.status === 401 || response.status === 403;
};

const shouldSkipDetail = (value) => {
  return value === "0" || value === "-" || value === "0 Jam";
};

const parseReportNumber = (value) => {
  return parseInt(value, 10) || 0;
};

// Menghitung total data laporan berdasarkan data yang sedang aktif.
const calculateTotals = (dataArray = []) => {
  const totals = {
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

  dataArray.forEach((item) => {
    totals.hadirApp += parseReportNumber(item.hadirApp);
    totals.hadirManual += parseReportNumber(item.hadirManual);
    totals.terlambat += parseReportNumber(item.terlambat);
    totals.fimtk += parseReportNumber(item.fimtk);
    totals.sakit += parseReportNumber(item.sakit);
    totals.izin += parseReportNumber(item.izin);
    totals.cuti += parseReportNumber(item.cuti);
    totals.alpha += parseReportNumber(item.alpha);
    totals.lembur += parseReportNumber(item.lembur);
  });

  return totals;
};

// ============================================================================
// HELPER: MODAL DETAIL
// ============================================================================

const sortDetailDataByDate = (detailData) => {
  return [...detailData].sort((firstItem, secondItem) => {
    const firstDate = new Date(
      firstItem.tanggal || firstItem.tanggalMulai,
    ).getTime();

    const secondDate = new Date(
      secondItem.tanggal || secondItem.tanggalMulai,
    ).getTime();

    return secondDate - firstDate;
  });
};

const mapAttendanceAppDetail = (attendanceList, branchName) => {
  const appAttendanceList = attendanceList.filter(
    (attendance) => !attendance.is_manual_masuk,
  );

  return appAttendanceList.map((attendance) => ({
    tipe: "absen",
    tanggal: attendance.tanggal,
    cabang: branchName,
    masuk: {
      jam: attendance.waktu_masuk || "-",
      isManual: false,
      foto: attendance.foto_masuk || null,
      keterangan: "",
      admin: "",
    },
    pulang: {
      jam: attendance.waktu_pulang || "-",
      isManual: false,
      foto: attendance.foto_pulang || null,
      keterangan: "",
      admin: "",
    },
  }));
};

const mapManualAttendanceDetail = (attendanceList, branchName) => {
  const manualAttendanceList = attendanceList.filter(
    (attendance) => attendance.is_manual_masuk,
  );

  return manualAttendanceList.map((attendance) => ({
    tipe: "absen",
    isLogManual: true,
    tanggal: attendance.tanggal,
    cabang: branchName,
    masuk: {
      jam: attendance.waktu_masuk || "-",
      isManual: true,
      foto: null,
      keterangan: attendance.keterangan_manual || "-",
      admin: "HRD",
    },
    pulang: {
      jam: attendance.waktu_pulang || "-",
      isManual: true,
      foto: null,
      keterangan: attendance.keterangan_manual || "-",
      admin: "HRD",
    },
  }));
};

const mapLateDetail = (attendanceList, branchName) => {
  const lateAttendanceList = attendanceList.filter(
    (attendance) => attendance.menit_terlambat > 0,
  );

  return lateAttendanceList.map((attendance) => ({
    tipe: "terlambat",
    tanggal: attendance.tanggal,
    cabang: branchName,
    jamMasuk: attendance.waktu_masuk || "-",
    menitTelat: attendance.menit_terlambat,
    isManual: attendance.is_manual_masuk,
  }));
};

const mapSickPermissionDetail = (permissionList) => {
  const sickPermissionList = permissionList.filter(
    (permission) =>
      permission.kategori === "Izin" &&
      permission.jenis_izin === "Sakit",
  );

  return sickPermissionList.map((permission) => ({
    tipe: "izin_sakit",
    jenisIzin: "Sakit",
    tanggalMulai: permission.tanggal_mulai,
    tanggalAkhir: permission.tanggal_selesai,
    keterangan: permission.keterangan || "-",
    foto: permission.bukti_foto || null,
  }));
};

const mapGeneralPermissionDetail = (permissionList) => {
  const generalPermissionList = permissionList.filter(
    (permission) =>
      permission.kategori === "Izin" &&
      permission.jenis_izin !== "Sakit",
  );

  return generalPermissionList.map((permission) => ({
    tipe: "izin_sakit",
    jenisIzin: permission.jenis_izin || "Lainnya",
    tanggalMulai: permission.tanggal_mulai,
    tanggalAkhir: permission.tanggal_selesai,
    keterangan: permission.keterangan || permission.keperluan || "-",
    foto: permission.bukti_foto || null,
  }));
};

const mapLeaveDetail = (permissionList, employeeItem) => {
  const leaveList = permissionList.filter(
    (permission) => permission.kategori === "Cuti",
  );

  return leaveList.map((permission) => ({
    tipe: "cuti",
    cabang: employeeItem.cabang,
    jabatan: employeeItem.jabatan || "-",
    divisi: employeeItem.divisi || "-",
    jenisCuti: permission.jenis_izin || "Cuti Tahunan",
    tanggalMulai: permission.tanggal_mulai,
    tanggalAkhir: permission.tanggal_selesai,
    keterangan: permission.keterangan || permission.keperluan || "-",
    noTelp: employeeItem.noTelp || "-",
  }));
};

const mapFimtkDetail = (permissionList, employeeItem) => {
  const fimtkList = permissionList.filter(
    (permission) => permission.kategori === "FIMTK",
  );

  return fimtkList.map((permission) => ({
    tipe: "fimtk",
    cabang: employeeItem.cabang,
    jabatan: employeeItem.jabatan || "-",
    divisi: employeeItem.divisi || "-",
    izinMTK: permission.jenis_izin || "FIMTK",
    tanggal: permission.tanggal_mulai,
    jamMulai: permission.jam_mulai || "-",
    jamAkhir: permission.jam_selesai || "-",
    keperluan: permission.keperluan || "-",
    kendaraan: permission.kendaraan || "-",
    alasan: permission.keterangan || "-",
  }));
};

const mapAlphaDetail = (alphaList, branchName) => {
  return alphaList.map((alphaItem) => ({
    tipe: "alpha",
    tanggal: alphaItem.tanggal,
    cabang: branchName,
    jadwal: "Sesuai Jam Operasional",
    status: "ALPHA",
    keterangan: alphaItem.keterangan,
  }));
};

const getOvertimeReason = (attendance) => {
  if (attendance.waktu_istirahat_mulai) {
    return "Lembur reguler di luar jam kerja";
  }

  if (attendance.menit_lembur > 180) {
    return "Kompensasi tidak istirahat & lembur reguler";
  }

  return "Kompensasi lembur karena tidak mengambil hak istirahat (3 Jam)";
};

const mapOvertimeDetail = (attendanceList, branchName) => {
  const overtimeList = attendanceList.filter(
    (attendance) => attendance.menit_lembur > 0,
  );

  return overtimeList.map((attendance) => ({
    tipe: "lembur",
    tanggal: attendance.tanggal,
    cabang: branchName,
    jamPulang: attendance.waktu_pulang || "-",
    menitLembur: attendance.menit_lembur,
    alasan: getOvertimeReason(attendance),
    isManual: attendance.is_manual_masuk,
  }));
};

// ============================================================================
// KOMPONEN: ICON
// ============================================================================

const ZoomIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle
      cx="11"
      cy="11"
      r="8"
    ></circle>
    <line
      x1="21"
      y1="21"
      x2="16.65"
      y2="16.65"
    ></line>
  </svg>
);

// ============================================================================
// KOMPONEN: LAPORAN MANAGER CABANG
// ============================================================================

const LaporanManagerCabang = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isExportMenuVisible, setIsExportMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFilter, setSelectedFilter] = useState(ALL_BRANCH_FILTER);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchList, setBranchList] = useState([]);
  const [reportData, setReportData] = useState([]);

  const [startDate, setStartDate] = useState(getInitialStartDate);
  const [endDate, setEndDate] = useState(getInitialEndDate);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState(DEFAULT_MODAL_INFO);
  const [previewImage, setPreviewImage] = useState(null);

  const mainBranchName = user?.cabangUtama || "Cabang";
  const hasBranchFilter = branchList.length > 1;

  // Menyaring laporan berdasarkan nama karyawan dan cabang yang dipilih.
  const filteredData = useMemo(() => {
    if (!Array.isArray(reportData)) {
      return [];
    }

    return reportData.filter((item) => {
      const employeeName = item.nama || "";
      const branchName = item.cabang || "";

      const matchesName = employeeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesBranch =
        selectedFilter === ALL_BRANCH_FILTER ||
        branchName === selectedFilter;

      return matchesName && matchesBranch;
    });
  }, [reportData, searchTerm, selectedFilter]);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Menghapus sesi login dan mengarahkan pengguna ke halaman login.
  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  // Menutup sidebar mobile sebelum berpindah ke halaman yang dipilih.
  const handleNavigation = (path) => {
    closeSidebar();
    navigate(path);
  };

  const redirectToLogin = () => {
    logout();
    navigate("/auth/login");
  };

  const toggleFilter = () => {
    if (!hasBranchFilter) {
      return;
    }

    setIsFilterVisible((currentValue) => !currentValue);
  };

  // Mengubah filter cabang lalu menutup dropdown filter.
  const handleSelectFilter = (value) => {
    setSelectedFilter(value);
    setIsFilterVisible(false);
  };

  const toggleExportMenu = () => {
    setIsExportMenuVisible((currentValue) => !currentValue);
  };

  const closeExportMenu = () => {
    setIsExportMenuVisible(false);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
  };

  const closePreviewImage = () => {
    setPreviewImage(null);
  };

  // Mengambil data cabang dan laporan sesuai periode tanggal yang dipilih.
  const fetchReportData = async () => {
    if (!user?.cabang_id) {
      return;
    }

    try {
      setIsLoading(true);

      const branchResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cabang`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (isUnauthorizedResponse(branchResponse)) {
        redirectToLogin();
        return;
      }

      const branchData = await branchResponse.json();

      setBranchList(
        Array.isArray(branchData)
          ? branchData.map((branch) => branch.nama)
          : [],
      );

      const reportResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/laporan?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (isUnauthorizedResponse(reportResponse)) {
        redirectToLogin();
        return;
      }

      const reportResult = await reportResponse.json();

      if (!reportResponse.ok) {
        console.error("Gagal mengambil laporan:", reportResult);
        setReportData([]);
        return;
      }

      setReportData(Array.isArray(reportResult) ? reportResult : []);
    } catch (error) {
      console.error("Gagal mengambil data laporan manager:", error);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [user?.cabang_id, startDate, endDate]);

  const getTotals = (dataArray = filteredData) => {
    return calculateTotals(dataArray);
  };

  // Mengunduh laporan dalam format PDF berdasarkan data yang sedang difilter.
  const handleExportPdf = () => {
    const document = new jsPDF({
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

    const totals = getTotals(filteredData);

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

    document.setFont("helvetica", "bold");
    document.setFontSize(14);
    document.text(`Laporan Kehadiran - ${mainBranchName}`, 14, 14);

    document.setFont("helvetica", "normal");
    document.setFontSize(9);
    document.text(
      "Data rekapitulasi absensi karyawan di wilayah kerja Anda",
      14,
      20,
    );
    document.text(`Periode: ${startDate} s/d ${endDate}`, 14, 26);
    document.text(`Cabang: ${selectedFilter}`, 14, 32);

    autoTable(document, {
      startY: 38,
      head: [
        [
          "Nama Karyawan",
          "Hadir App / Manual",
          "Terlambat",
          "FIMTK",
          "Sakit",
          "Izin",
          "Cuti",
          "Alpha",
          "Lembur",
        ],
      ],
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

    const totalPages = document.internal.getNumberOfPages();

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      document.setPage(pageNumber);

      const pageWidth = document.internal.pageSize.getWidth();
      const pageHeight = document.internal.pageSize.getHeight();

      document.setFont("helvetica", "normal");
      document.setFontSize(8);
      document.setTextColor(80);

      document.text(`Dicetak: ${printedAt}`, 14, pageHeight - 8);
      document.text(
        `Halaman ${pageNumber} / ${totalPages}`,
        pageWidth - 42,
        pageHeight - 8,
      );
    }

    document.save(
      `Rekap_Kehadiran_Manager_${startDate}_sd_${endDate}.pdf`,
    );
  };

  // Mengunduh laporan dalam format Excel berdasarkan data yang sedang difilter.
  const handleExportExcel = () => {
    const exportData = filteredData.map((item) => ({
      "Nama Karyawan": item.nama || "-",
      NIK: item.nik || "-",
      Cabang: item.cabang || "-",
      "Hadir via App": parseReportNumber(item.hadirApp),
      "Hadir Manual": parseReportNumber(item.hadirManual),
      Terlambat: parseReportNumber(item.terlambat),
      FIMTK: parseReportNumber(item.fimtk),
      Sakit: parseReportNumber(item.sakit),
      Izin: parseReportNumber(item.izin),
      Cuti: parseReportNumber(item.cuti),
      Alpha: parseReportNumber(item.alpha),
      Lembur: item.lembur || "0 Jam",
    }));

    const totals = getTotals(filteredData);

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

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Rekap Kehadiran",
    );

    XLSX.writeFile(
      workbook,
      `Rekap_Kehadiran_Manager_${startDate}_sd_${endDate}.xlsx`,
    );
  };

  // Membuka modal detail berdasarkan jenis data laporan yang dipilih.
  const openDetail = (item, reportType, value) => {
    if (shouldSkipDetail(value)) {
      return;
    }

    const {
      nama,
      nik,
      cabang,
      rawAbsensi = [],
      rawPerizinan = [],
      rawAlpha = [],
    } = item;

    let detailData = [];
    let title = `Rincian ${reportType}`;

    if (reportType === REPORT_TYPES.HADIR_APP) {
      title = "Log Absensi Mandiri (Karyawan)";
      detailData = mapAttendanceAppDetail(rawAbsensi, cabang);
    } else if (reportType === REPORT_TYPES.HADIR_MANUAL) {
      title = "Log Rekapitulasi Manual (Admin HRD)";
      detailData = mapManualAttendanceDetail(rawAbsensi, cabang);
    } else if (reportType === REPORT_TYPES.TERLAMBAT) {
      title = "Rincian Keterlambatan";
      detailData = mapLateDetail(rawAbsensi, cabang);
    } else if (reportType === REPORT_TYPES.SAKIT) {
      title = "Log Perizinan (Sakit)";
      detailData = mapSickPermissionDetail(rawPerizinan);
    } else if (reportType === REPORT_TYPES.IZIN) {
      title = "Log Perizinan (Izin)";
      detailData = mapGeneralPermissionDetail(rawPerizinan);
    } else if (reportType === REPORT_TYPES.CUTI) {
      title = "Log Perizinan (Cuti)";
      detailData = mapLeaveDetail(rawPerizinan, item);
    } else if (reportType === REPORT_TYPES.FIMTK) {
      title = "Log Perizinan (FIMTK)";
      detailData = mapFimtkDetail(rawPerizinan, item);
    } else if (reportType === REPORT_TYPES.ALPHA) {
      title = "Rincian Alpha";
      detailData = mapAlphaDetail(rawAlpha, cabang);
    } else if (reportType === REPORT_TYPES.LEMBUR) {
      title = "Rincian Lembur";
      detailData = mapOvertimeDetail(rawAbsensi, cabang);
    }

    setModalInfo({
      title,
      nama,
      nik,
      jenisData: reportType,
      data: sortDetailDataByDate(detailData),
    });

    setIsDetailModalVisible(true);
  };

  const renderZoomButton = (imageUrl) => (
    <button
      type="button"
      className="lap-zoom-btn"
      onClick={() => setPreviewImage(imageUrl)}
      aria-label="Perbesar gambar"
    >
      <ZoomIcon />
    </button>
  );

  const renderNoPhotoPlaceholder = () => (
    <div className="lap-manual-placeholder">
      <span>
        Tidak Ada Foto
      </span>

      <small>
        No Photo Available
      </small>
    </div>
  );

  const renderDeletedPhotoPlaceholder = () => (
    <div className="lap-manual-placeholder">
      <span>
        Telah Dihapus
      </span>

      <small>
        Usia file &gt; 30 Hari
      </small>
    </div>
  );

  const renderPhotoBox = ({
    imageUrl,
    alt,
    overlayText,
  }) => (
    <div className="lap-foto-box">
      {!imageUrl ? (
        renderNoPhotoPlaceholder()
      ) : imageUrl.includes("Dihapus Otomatis") ? (
        renderDeletedPhotoPlaceholder()
      ) : (
        <>
          <img
            src={imageUrl}
            alt={alt}
            className="lap-foto-img"
          />

          <div className="lap-foto-overlay">
            {overlayText}
          </div>

          {renderZoomButton(imageUrl)}
        </>
      )}
    </div>
  );

  const renderEvidenceBox = (imageUrl) => (
    <div className="lap-foto-box">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Bukti"
            className="lap-foto-img"
          />

          <div className="lap-foto-overlay">
            Bukti Dokumen / Surat
          </div>

          {renderZoomButton(imageUrl)}
        </>
      ) : (
        <div className="lap-manual-placeholder">
          <span>
            Tidak Ada Bukti
          </span>

          <small>
            Dikirim tanpa lampiran foto
          </small>
        </div>
      )}
    </div>
  );

  const renderModalField = ({
    label,
    value,
    style,
  }) => (
    <div className="lap-modal-group">
      <label className="lap-modal-label">
        {label}
      </label>

      <div
        className="lap-modal-input"
        style={style}
      >
        {value}
      </div>
    </div>
  );

  const renderModalRow = (fields) => (
    <div className="lap-modal-row">
      {fields.map((field) => (
        <div
          key={field.label}
          className="lap-modal-group"
          style={field.groupStyle}
        >
          <label
            className="lap-modal-label"
            style={field.labelStyle}
          >
            {field.label}
          </label>

          <div
            className="lap-modal-input"
            style={field.valueStyle}
          >
            {field.value}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAttendanceDetail = (item) => (
    <>
      {renderModalRow([
        {
          label: "Tanggal Absensi",
          value: item.tanggal,
        },
        {
          label: "Cabang",
          value: item.cabang,
        },
      ])}

      {renderModalRow([
        {
          label: item.isLogManual ? "Absen Masuk" : "Jam Masuk",
          value: item.masuk?.jam || "-",
        },
        {
          label: item.isLogManual ? "Absen Pulang" : "Jam Pulang",
          value: item.pulang?.jam || "-",
        },
      ])}

      {(item.masuk?.isManual || item.pulang?.isManual) && (
        <div className="lap-modal-row">
          <div
            className="lap-modal-group"
            style={FLEX_FULL_STYLE}
          >
            <label className="lap-modal-label">
              Keterangan
            </label>

            <div
              className="lap-modal-input"
              style={MODAL_TEXTAREA_STYLE}
            >
              {item.masuk?.keterangan || "-"}
            </div>
          </div>
        </div>
      )}

      {!item.isLogManual && (
        <div className="lap-foto-container">
          {renderPhotoBox({
            imageUrl: item.masuk?.foto,
            alt: "Masuk",
            overlayText: "Absen Masuk",
          })}

          {renderPhotoBox({
            imageUrl: item.pulang?.foto,
            alt: "Pulang",
            overlayText: "Absen Pulang",
          })}
        </div>
      )}
    </>
  );

  const renderLateDetail = (item) => (
    <>
      {renderModalRow([
        {
          label: "Tanggal",
          value: item.tanggal,
        },
        {
          label: "Cabang",
          value: item.cabang,
        },
      ])}

      {renderModalRow([
        {
          label: "Jam Masuk",
          value: item.jamMasuk,
          valueStyle: LATE_TIME_STYLE,
        },
        {
          label: "Keterlambatan",
          value: `${item.menitTelat} Menit`,
          valueStyle: LATE_DURATION_STYLE,
        },
      ])}

      {item.isManual && (
        <div className="lap-modal-row">
          <div
            className="lap-modal-group"
            style={FLEX_FULL_STYLE}
          >
            <label
              className="lap-modal-label"
              style={WARNING_LABEL_STYLE}
            >
              Diinput Manual oleh HRD
            </label>

            <div
              className="lap-modal-input"
              style={MANUAL_NOTE_STYLE}
            >
              Data kehadiran dan keterlambatan ini tercatat melalui sistem
              Absensi Manual.
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderOvertimeDetail = (item) => (
    <>
      {renderModalRow([
        {
          label: "Tanggal",
          value: item.tanggal,
        },
        {
          label: "Cabang",
          value: item.cabang,
        },
      ])}

      {renderModalRow([
        {
          label: "Jam Pulang Aktual",
          value: item.jamPulang,
          valueStyle: OVERTIME_TIME_STYLE,
        },
        {
          label: "Durasi Lembur",
          value: `${Math.floor(item.menitLembur / 60)} Jam ${
            item.menitLembur % 60
          } Menit`,
          valueStyle: OVERTIME_DURATION_STYLE,
        },
      ])}

      {item.isManual && (
        <div className="lap-modal-row">
          <div
            className="lap-modal-group"
            style={FLEX_FULL_STYLE}
          >
            <label
              className="lap-modal-label"
              style={WARNING_LABEL_STYLE}
            >
              Diinput Manual oleh HRD
            </label>

            <div
              className="lap-modal-input"
              style={MANUAL_NOTE_STYLE}
            >
              Data kehadiran dan lembur ini tercatat melalui sistem Absensi
              Manual.
            </div>
          </div>
        </div>
      )}

      {renderModalRow([
        {
          label: "Keterangan / Catatan Sistem",
          value: item.alasan,
          groupStyle: FLEX_FULL_STYLE,
          valueStyle: SYSTEM_NOTE_STYLE,
        },
      ])}
    </>
  );

  const renderPermissionDetail = (item) => (
    <>
      {renderModalRow([
        {
          label: "Jenis Izin",
          value: item.jenisIzin,
        },
        {
          label: "Tanggal Mulai",
          value: item.tanggalMulai,
        },
      ])}

      {renderModalRow([
        {
          label: "Tanggal Akhir",
          value: item.tanggalAkhir,
        },
        {
          label: "Keterangan",
          value: item.keterangan,
        },
      ])}

      <div className="lap-foto-container">
        {renderEvidenceBox(item.foto)}

        <div style={FLEX_FULL_STYLE} />
      </div>
    </>
  );

  const renderLeaveDetail = (item) => (
    <>
      {renderModalRow([
        {
          label: "Cabang",
          value: item.cabang,
        },
        {
          label: "Jenis Cuti",
          value: item.jenisCuti,
        },
      ])}

      {renderModalRow([
        {
          label: "Jabatan",
          value: item.jabatan,
        },
        {
          label: "Divisi",
          value: item.divisi,
        },
      ])}

      {renderModalRow([
        {
          label: "Tanggal Mulai",
          value: item.tanggalMulai,
        },
        {
          label: "Tanggal Akhir",
          value: item.tanggalAkhir,
        },
      ])}

      {renderModalRow([
        {
          label: "Keterangan",
          value: item.keterangan,
          groupStyle: FLEX_FULL_STYLE,
          valueStyle: MODAL_TEXTAREA_STYLE,
        },
      ])}

      {renderModalRow([
        {
          label: "Nomor Telepon",
          value: item.noTelp,
          groupStyle: FLEX_FULL_STYLE,
        },
      ])}
    </>
  );

  const renderFimtkDetail = (item) => (
    <>
      {renderModalRow([
        {
          label: "Cabang",
          value: item.cabang,
          groupStyle: FLEX_FULL_STYLE,
        },
      ])}

      {renderModalRow([
        {
          label: "Jabatan",
          value: item.jabatan,
        },
        {
          label: "Divisi",
          value: item.divisi,
        },
      ])}

      {renderModalRow([
        {
          label: "Izin MTK",
          value: item.izinMTK,
        },
        {
          label: "Tanggal",
          value: item.tanggal,
        },
      ])}

      {renderModalRow([
        {
          label: "Jam Mulai",
          value: item.jamMulai,
        },
        {
          label: "Jam Akhir",
          value: item.jamAkhir,
        },
      ])}

      {renderModalRow([
        {
          label: "Keperluan",
          value: item.keperluan,
        },
        {
          label: "Kendaraan",
          value: item.kendaraan,
        },
      ])}

      {renderModalRow([
        {
          label: "Alasan",
          value: item.alasan,
          groupStyle: FLEX_FULL_STYLE,
          valueStyle: MODAL_TEXTAREA_STYLE,
        },
      ])}
    </>
  );

  const renderAlphaDetail = (item) => (
    <>
      {renderModalRow([
        {
          label: "Tanggal",
          value: item.tanggal,
        },
        {
          label: "Cabang",
          value: item.cabang,
        },
      ])}

      {renderModalRow([
        {
          label: "Jadwal Kerja Seharusnya",
          value: item.jadwal,
        },
        {
          label: "Status",
          value: item.status,
          valueStyle: ALPHA_STATUS_STYLE,
        },
      ])}

      {renderModalRow([
        {
          label: "Keterangan / Catatan Sistem",
          value: item.keterangan,
          groupStyle: FLEX_FULL_STYLE,
          valueStyle: ALPHA_NOTE_STYLE,
        },
      ])}
    </>
  );

  const renderModalBody = (item, index) => (
    <div
      key={index}
      className="lap-modal-record-card"
    >
      {item.tipe === "absen" && renderAttendanceDetail(item)}
      {item.tipe === "terlambat" && renderLateDetail(item)}
      {item.tipe === "lembur" && renderOvertimeDetail(item)}
      {item.tipe === "izin_sakit" && renderPermissionDetail(item)}
      {item.tipe === "cuti" && renderLeaveDetail(item)}
      {item.tipe === "fimtk" && renderFimtkDetail(item)}
      {item.tipe === "alpha" && renderAlphaDetail(item)}
    </div>
  );

  const renderClickableBadge = ({
    item,
    reportType,
    value,
    className = "",
  }) => (
    <span
      className={`neo-badge ${className} ${
        value !== "0" && value !== "-" && value !== "0 Jam"
          ? "clickable-badge"
          : ""
      }`}
      onClick={() => openDetail(item, reportType, value)}
    >
      {value}
    </span>
  );

  const renderReportRow = (item) => {
    const rowClass = getLateRowClass(item.terlambat);

    return (
      <tr
        key={item.id}
        className={rowClass}
      >
        <td className="neo-td-name">
          {item.nama}
        </td>

        <td className="text-center">
          <div className="neo-dual-badge-container">
            {renderClickableBadge({
              item,
              reportType: REPORT_TYPES.HADIR_APP,
              value: item.hadirApp,
            })}

            {renderClickableBadge({
              item,
              reportType: REPORT_TYPES.HADIR_MANUAL,
              value: item.hadirManual,
              className: "manual",
            })}
          </div>
        </td>

        <td className="text-center">
          <span
            className={`neo-badge ${rowClass ? "warn-badge" : ""} ${
              item.terlambat !== "0" && item.terlambat !== "-"
                ? "clickable-badge"
                : ""
            }`}
            onClick={() =>
              openDetail(
                item,
                REPORT_TYPES.TERLAMBAT,
                item.terlambat,
              )
            }
          >
            {item.terlambat}
          </span>
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            reportType: REPORT_TYPES.FIMTK,
            value: item.fimtk,
            className: "info",
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            reportType: REPORT_TYPES.SAKIT,
            value: item.sakit,
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            reportType: REPORT_TYPES.IZIN,
            value: item.izin,
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            reportType: REPORT_TYPES.CUTI,
            value: item.cuti,
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            reportType: REPORT_TYPES.ALPHA,
            value: item.alpha,
            className: "alert",
          })}
        </td>

        <td className="text-center">
          {renderClickableBadge({
            item,
            reportType: REPORT_TYPES.LEMBUR,
            value: item.lembur,
            className: "info",
          })}
        </td>
      </tr>
    );
  };

  const renderTotalRow = (totals) => (
    <tr className="total-row-print">
      <td
        className="neo-td-name"
        style={TABLE_TOTAL_LABEL_STYLE}
      >
        TOTAL KESELURUHAN
      </td>

      <td className="text-center">
        <div className="neo-dual-badge-container">
          <span className="neo-badge">
            {totals.hadirApp}
          </span>

          <span className="neo-badge manual">
            {totals.hadirManual}
          </span>
        </div>
      </td>

      <td className="text-center">
        <span className="neo-badge">
          {totals.terlambat}
        </span>
      </td>

      <td className="text-center">
        <span className="neo-badge info">
          {totals.fimtk}
        </span>
      </td>

      <td className="text-center">
        <span className="neo-badge">
          {totals.sakit}
        </span>
      </td>

      <td className="text-center">
        <span className="neo-badge">
          {totals.izin}
        </span>
      </td>

      <td className="text-center">
        <span className="neo-badge">
          {totals.cuti}
        </span>
      </td>

      <td className="text-center">
        <span className="neo-badge alert">
          {totals.alpha}
        </span>
      </td>

      <td className="text-center">
        <span className="neo-badge info">
          {totals.lembur}
        </span>
      </td>
    </tr>
  );

  const renderTableBody = (tableData, totals) => {
    if (isLoading) {
      return (
        <tr>
          <td
            colSpan="9"
            className="empty-state"
          >
            Memuat data...
          </td>
        </tr>
      );
    }

    if (tableData.length === 0) {
      return (
        <tr>
          <td
            colSpan="9"
            className="empty-state"
          >
            Data karyawan tidak ditemukan.
          </td>
        </tr>
      );
    }

    return (
      <>
        {tableData.map((item) => renderReportRow(item))}
        {renderTotalRow(totals)}
      </>
    );
  };

  const renderTable = (headerText, tableData) => {
    const totals = getTotals(tableData);

    return (
      <div className="neo-table-card">
        <div className="neo-table-header">
          {headerText}
        </div>

        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
              <tr>
                <th>
                  Nama Karyawan
                </th>

                <th className="text-center">
                  Hadir
                </th>

                <th className="text-center">
                  Terlambat
                </th>

                <th className="text-center">
                  FIMTK
                </th>

                <th className="text-center">
                  Sakit
                </th>

                <th className="text-center">
                  Izin
                </th>

                <th className="text-center">
                  Cuti
                </th>

                <th className="text-center">
                  Alpha
                </th>

                <th className="text-center">
                  Lembur
                </th>
              </tr>
            </thead>

            <tbody>
              {renderTableBody(tableData, totals)}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img
          src={logoPersegi}
          alt="AMAGACORP"
          className="mobile-topbar-logo"
        />

        <button
          type="button"
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
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar no-print ${isSidebarOpen ? "open" : ""}`}>
        <button
          type="button"
          className="btn-sidebar-close"
          onClick={closeSidebar}
          aria-label="Tutup menu"
        >
          &times;
        </button>

        <div className="logo-area">
          <img
            src={logoPersegi}
            alt="AMAGACORP"
            className="logo-img"
          />
        </div>

        <nav className="menu-nav">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.path}
              className={`menu-item ${item.active ? "active" : ""}`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="menu-left">
                <img
                  src={item.icon}
                  alt=""
                  className="menu-icon-main"
                />

                <span className="menu-text-main">
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-text">
            <h1>
              Laporan Kehadiran - {mainBranchName}
            </h1>

            <p>
              Data rekapitulasi absensi karyawan di wilayah kerja Anda
            </p>
          </div>
        </header>

        <div className="neo-filter-zone no-print">
          <div className="input-group-neo">
            <div className="neo-field">
              <label>
                Cari Nama
              </label>

              <input
                type="text"
                placeholder="Ketik nama..."
                className="neo-input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="neo-field">
              <label>
                Tanggal Mulai
              </label>

              <input
                type="date"
                className="neo-input"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);

                  if (endDate && event.target.value > endDate) {
                    setEndDate("");
                  }
                }}
              />
            </div>

            <div className="neo-field">
              <label>
                Tanggal Selesai
              </label>

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
                type="button"
                className="btn-neo-print-top no-print"
                onClick={toggleExportMenu}
              >
                Print
              </button>

              {isExportMenuVisible && (
                <div
                  className="neo-dropdown-list-right"
                  style={DROPDOWN_EXPORT_STYLE}
                >
                  <div
                    className="neo-drop-item"
                    onClick={() => {
                      handleExportPdf();
                      closeExportMenu();
                    }}
                  >
                    Unduh PDF
                  </div>

                  <div
                    className="neo-drop-item"
                    onClick={() => {
                      handleExportExcel();
                      closeExportMenu();
                    }}
                  >
                    Unduh Excel
                  </div>
                </div>
              )}
            </div>

            <div className="dropdown-neo-bottom-wrapper">
              <button
                type="button"
                className="btn-neo-filter-bottom"
                onClick={toggleFilter}
                style={{
                  cursor: hasBranchFilter ? "pointer" : "default",
                  border: hasBranchFilter ? "" : "1px solid #ccc",
                  color: hasBranchFilter ? "" : "#666",
                }}
              >
                {hasBranchFilter ? selectedFilter : mainBranchName}

                {hasBranchFilter && (
                  <img
                    src={iconBawah}
                    alt="v"
                    className={isFilterVisible ? "rotate" : ""}
                  />
                )}
              </button>

              {isFilterVisible && hasBranchFilter && (
                <div className="neo-dropdown-list-right">
                  <div
                    className="neo-drop-item"
                    onClick={() => handleSelectFilter(ALL_BRANCH_FILTER)}
                  >
                    Semua Cabang Saya
                  </div>

                  {branchList.map((branchName) => (
                    <div
                      key={branchName}
                      className="neo-drop-item"
                      onClick={() => handleSelectFilter(branchName)}
                    >
                      {branchName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {renderTable("Data Kehadiran Karyawan", filteredData)}
      </main>

      {isDetailModalVisible && (
        <div
          className="modal-overlay-lap"
          onClick={closeDetailModal}
        >
          <div
            className="modal-content-lap"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header-lap">
              <h2>
                {modalInfo.title}
              </h2>

              <button
                type="button"
                className="close-btn-lap"
                onClick={closeDetailModal}
              >
                &times;
              </button>
            </div>

            <div className="modal-body-lap">
              <div className="lap-modal-row">
                {renderModalField({
                  label: "Nama",
                  value: modalInfo.nama,
                })}

                {renderModalField({
                  label: "NIK",
                  value: modalInfo.nik,
                })}
              </div>

              <hr style={MODAL_DIVIDER_STYLE} />

              <div className="lap-modal-scroll-area">
                {modalInfo.data.length > 0 ? (
                  modalInfo.data.map((item, index) =>
                    renderModalBody(item, index),
                  )
                ) : (
                  <p style={EMPTY_MODAL_TEXT_STYLE}>
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
          onClick={closePreviewImage}
        >
          <button
            type="button"
            className="lap-preview-close"
            onClick={closePreviewImage}
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

export default LaporanManagerCabang;