import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../hrd/laporan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconIzin from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};

const formatDate = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const LaporanManagerCabang = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const [showFilter, setShowFilter] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua Sub-Cabang");
  const [searchTerm, setSearchTerm] = useState("");

  const [dataLaporan, setDataLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasSubCabang = user?.subCabang && user.subCabang.length > 0;
  const subCabangList = user?.subCabang || [];
  const namaCabangUtama = user?.cabangUtama || "Cabang";

  const [startDate, setStartDate] = useState(() => {
    const d = getYesterday();
    let m = d.getMonth();
    let y = d.getFullYear();
    if (d.getDate() < 26) {
      m -= 1;
      if (m < 0) {
        m = 11;
        y -= 1;
      }
    }
    return `${y}-${String(m + 1).padStart(2, "0")}-26`;
  });

  const [endDate, setEndDate] = useState(() => formatDate(getYesterday()));
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "",
    nama: "",
    nik: "",
    jenisData: "",
    data: [],
  });
  const [previewImage, setPreviewImage] = useState(null);

  // UPDATE: RE-FETCH DATA SETIAP TANGGAL FILTER BERUBAH
  useEffect(() => {
    const fetchLaporan = async () => {
      if (!user?.cabang_id) return;
      try {
        setLoading(true);
        // MENGIRIM TANGGAL KE BACKEND
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/laporan?role=managerCabang&cabang_id=${user.cabang_id}&start_date=${startDate}&end_date=${endDate}`,
        );
        const data = await res.json();
        setDataLaporan(data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLaporan();
  }, [user, startDate, endDate]);

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

  const getRowTerlambatClass = (jumlahTerlambat) => {
    const angka = parseInt(jumlahTerlambat, 10);
    if (isNaN(angka)) return "";
    if (angka === 3) return "row-warn-yellow";
    if (angka >= 4 && angka <= 5) return "row-warn-orange";
    if (angka >= 6) return "row-warn-red";
    return "";
  };

  const openDetail = (item, jenis, jumlah) => {
    if (jumlah === "0" || jumlah === "-") return;

    const { nama, nik, cabang, rawAbsensi = [], rawPerizinan = [] } = item;
    let realData = [];
    let title = `Rincian ${jenis}`;

    if (jenis === "Hadir via App") {
      title = "Log Absensi Mandiri (Karyawan)";
      const dataApp = rawAbsensi.filter((a) => !a.is_manual_masuk);
      realData = dataApp.map((a) => ({
        tipe: "absen",
        tanggal: a.tanggal,
        cabang: cabang,
        masuk: {
          jam: a.waktu_masuk || "-",
          isManual: false,
          foto: a.foto_masuk || null,
          keterangan: "",
          admin: "",
        },
        pulang: {
          jam: a.waktu_pulang || "-",
          isManual: false,
          foto: a.foto_pulang || null,
          keterangan: "",
          admin: "",
        },
      }));
    } else if (jenis === "Hadir Manual") {
      title = "Log Rekapitulasi Manual (Admin HRD)";
      const dataManual = rawAbsensi.filter((a) => a.is_manual_masuk);
      realData = dataManual.map((a) => ({
        tipe: "absen",
        tanggal: a.tanggal,
        cabang: cabang,
        masuk: {
          jam: a.waktu_masuk || "-",
          isManual: true,
          foto: null,
          keterangan: a.keterangan || "Absen Manual",
          admin: "HRD",
        },
        pulang: {
          jam: a.waktu_pulang || "-",
          isManual: true,
          foto: null,
          keterangan: a.keterangan || "Absen Manual",
          admin: "HRD",
        },
      }));
    } else if (jenis === "Sakit") {
      title = `Log Perizinan (Sakit)`;
      const dataSakit = rawPerizinan.filter(
        (p) => p.kategori === "Izin" && p.jenis_izin === "Sakit",
      );
      realData = dataSakit.map((p) => ({
        tipe: "izin_sakit",
        jenisIzin: "Sakit",
        tanggalMulai: p.tanggal_mulai,
        tanggalAkhir: p.tanggal_selesai,
        keterangan: p.keterangan || "-",
        foto: p.bukti_foto || null,
      }));
    } else if (jenis === "Izin") {
      title = `Log Perizinan (Izin)`;
      const dataIzin = rawPerizinan.filter(
        (p) => p.kategori === "Izin" && p.jenis_izin !== "Sakit",
      );
      realData = dataIzin.map((p) => ({
        tipe: "izin_sakit",
        jenisIzin: p.jenis_izin || "Lainnya",
        tanggalMulai: p.tanggal_mulai,
        tanggalAkhir: p.tanggal_selesai,
        keterangan: p.keterangan || p.keperluan || "-",
        foto: p.bukti_foto || null,
      }));
    } else if (jenis === "Cuti") {
      title = `Log Perizinan (Cuti)`;
      const dataCuti = rawPerizinan.filter((p) => p.kategori === "Cuti");
      realData = dataCuti.map((p) => ({
        tipe: "cuti",
        cabang: cabang,
        jabatan: item.jabatan || "-",
        divisi: item.divisi || "-",
        jenisCuti: p.jenis_izin || "Cuti Tahunan",
        tanggalMulai: p.tanggal_mulai,
        tanggalAkhir: p.tanggal_selesai,
        keterangan: p.keterangan || p.keperluan || "-",
        noTelp: item.noTelp || "-",
      }));
    } else if (jenis === "FIMTK") {
      title = `Log Perizinan (FIMTK)`;
      const dataFimtk = rawPerizinan.filter((p) => p.kategori === "FIMTK");
      realData = dataFimtk.map((p) => ({
        tipe: "fimtk",
        cabang: cabang,
        jabatan: item.jabatan || "-",
        divisi: item.divisi || "-",
        izinMTK: p.jenis_izin || "FIMTK",
        tanggal: p.tanggal_mulai,
        jamMulai: p.jam_mulai || "-",
        jamAkhir: p.jam_selesai || "-",
        keperluan: p.keperluan || "-",
        kendaraan: p.kendaraan || "-",
        alasan: p.keterangan || "-",
      }));
    }

    setModalInfo({ title, nama, nik, jenisData: jenis, data: realData });
    setShowDetailModal(true);
  };

  const filteredData = dataLaporan.filter((item) => {
    const matchName = item.nama
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    let matchBranch = true;
    if (hasSubCabang && selectedFilter !== "Semua Sub-Cabang") {
      matchBranch = item.cabang === selectedFilter;
    }
    return matchName && matchBranch;
  });

  const getTotals = (dataArray) => {
    let t = {
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

  const handleExportExcel = () => {
    const headers = [
      "Nama Karyawan",
      "NIK",
      "Cabang",
      "Hadir via App",
      "Hadir Manual",
      "Terlambat",
      "FIMTK",
      "Sakit",
      "Izin",
      "Cuti",
      "Alpha",
      "Lembur",
    ];
    const csvRows = [headers.join(";")];

    const dataToExport = filteredData;

    dataToExport.forEach((item) => {
      const row = [
        `"${item.nama}"`,
        `"${item.nik}"`,
        `"${item.cabang}"`,
        item.hadirApp,
        item.hadirManual,
        item.terlambat,
        item.fimtk,
        item.sakit,
        item.izin,
        item.cuti,
        item.alpha,
        item.lembur,
      ];
      csvRows.push(row.join(";"));
    });

    const totals = getTotals(dataToExport);
    const totalRow = [
      `"TOTAL KESELURUHAN"`,
      `"-"`,
      `"-"`,
      totals.hadirApp,
      totals.hadirManual,
      totals.terlambat,
      totals.fimtk,
      totals.sakit,
      totals.izin,
      totals.cuti,
      totals.alpha,
      totals.lembur,
    ];
    csvRows.push(totalRow.join(";"));

    const csvString = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Rekap_Kehadiran_Cabang_${startDate}_sd_${endDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <label className="lap-modal-label">Jam Masuk</label>
              <div className="lap-modal-input">{item.masuk.jam}</div>
            </div>
            <div className="lap-modal-group">
              <label className="lap-modal-label">Jam Pulang</label>
              <div className="lap-modal-input">{item.pulang.jam}</div>
            </div>
          </div>
          {(item.masuk.isManual || item.pulang.isManual) && (
            <div className="lap-modal-row">
              <div className="lap-modal-group" style={{ flex: 1 }}>
                <label className="lap-modal-label" style={{ color: "#d9480f" }}>
                  ⚠️ Catatan Absensi Manual HRD
                </label>
                <div
                  className="lap-modal-input"
                  style={{
                    background: "#fff9db",
                    borderColor: "#fcc419",
                    color: "#b06500",
                    fontSize: "12px",
                  }}
                >
                  {item.masuk.isManual &&
                    `[Masuk] ${item.masuk.keterangan} (${item.masuk.admin}). `}
                  {item.pulang.isManual &&
                    `[Pulang] ${item.pulang.keterangan} (${item.pulang.admin}).`}
                </div>
              </div>
            </div>
          )}
          <div className="lap-foto-container">
            <div className="lap-foto-box">
              {item.masuk.isManual || !item.masuk.foto ? (
                <div className="lap-manual-placeholder">
                  <span>
                    {item.masuk.isManual
                      ? "📝 Absensi Manual"
                      : "📄 Tidak Ada Foto"}
                  </span>
                  <small>No Photo Available</small>
                </div>
              ) : (
                <>
                  <img
                    src={item.masuk.foto}
                    alt="Masuk"
                    className="lap-foto-img"
                  />
                  <div className="lap-foto-overlay">Absen Masuk</div>
                  <button
                    className="lap-zoom-btn"
                    onClick={() => setPreviewImage(item.masuk.foto)}
                  >
                    🔍
                  </button>
                </>
              )}
            </div>
            <div className="lap-foto-box">
              {item.pulang.isManual || !item.pulang.foto ? (
                <div className="lap-manual-placeholder">
                  <span>
                    {item.pulang.isManual
                      ? "📝 Absensi Manual"
                      : "📄 Tidak Ada Foto"}
                  </span>
                  <small>No Photo Available</small>
                </div>
              ) : (
                <>
                  <img
                    src={item.pulang.foto}
                    alt="Pulang"
                    className="lap-foto-img"
                  />
                  <div className="lap-foto-overlay">Absen Pulang</div>
                  <button
                    className="lap-zoom-btn"
                    onClick={() => setPreviewImage(item.pulang.foto)}
                  >
                    🔍
                  </button>
                </>
              )}
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
                  <button
                    className="lap-zoom-btn"
                    onClick={() => setPreviewImage(item.foto)}
                  >
                    🔍
                  </button>
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
              <div
                className="lap-modal-input"
                style={{ minHeight: "40px", height: "auto" }}
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
              <div
                className="lap-modal-input"
                style={{ minHeight: "40px", height: "auto" }}
              >
                {item.alasan}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTable = (headerText, tableData) => {
    const totals = getTotals(tableData);

    return (
      <div className="neo-table-card" style={{ marginBottom: "25px" }}>
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
                  <td colSpan="9" className="empty-state">
                    Memuat data...
                  </td>
                </tr>
              ) : tableData.length > 0 ? (
                tableData.map((item) => {
                  const rowClass = getRowTerlambatClass(item.terlambat);
                  return (
                    <tr key={item.id} className={rowClass}>
                      <td className="neo-td-name">{item.nama}</td>
                      <td className="text-center">
                        <div className="neo-dual-badge-container">
                          <span
                            className={`neo-badge ${item.hadirApp !== "0" ? "clickable-badge" : ""}`}
                            onClick={() =>
                              openDetail(item, "Hadir via App", item.hadirApp)
                            }
                          >
                            {item.hadirApp}
                          </span>
                          <span
                            className={`neo-badge manual ${item.hadirManual !== "0" ? "clickable-badge" : ""}`}
                            onClick={() =>
                              openDetail(item, "Hadir Manual", item.hadirManual)
                            }
                          >
                            {item.hadirManual}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span
                          className={`neo-badge ${rowClass ? "warn-badge" : ""} ${item.terlambat !== "0" && item.terlambat !== "-" ? "clickable-badge" : ""}`}
                          onClick={() =>
                            openDetail(item, "Terlambat", item.terlambat)
                          }
                        >
                          {item.terlambat}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`neo-badge info ${item.fimtk !== "0" && item.fimtk !== "-" ? "clickable-badge" : ""}`}
                          onClick={() => openDetail(item, "FIMTK", item.fimtk)}
                        >
                          {item.fimtk}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`neo-badge ${item.sakit !== "0" && item.sakit !== "-" ? "clickable-badge" : ""}`}
                          onClick={() => openDetail(item, "Sakit", item.sakit)}
                        >
                          {item.sakit}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`neo-badge ${item.izin !== "0" && item.izin !== "-" ? "clickable-badge" : ""}`}
                          onClick={() => openDetail(item, "Izin", item.izin)}
                        >
                          {item.izin}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`neo-badge ${item.cuti !== "0" && item.cuti !== "-" ? "clickable-badge" : ""}`}
                          onClick={() => openDetail(item, "Cuti", item.cuti)}
                        >
                          {item.cuti}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`neo-badge alert ${item.alpha !== "0" && item.alpha !== "-" ? "clickable-badge" : ""}`}
                          onClick={() => openDetail(item, "Alpha", item.alpha)}
                        >
                          {item.alpha}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`neo-badge info ${item.lembur !== "0" && item.lembur !== "-" ? "clickable-badge" : ""}`}
                          onClick={() =>
                            openDetail(item, "Lembur", item.lembur)
                          }
                        >
                          {item.lembur}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="empty-state">
                    Data karyawan{" "}
                    {searchTerm ? `dengan nama "${searchTerm}" ` : ""}tidak
                    ditemukan di cabang ini.
                  </td>
                </tr>
              )}
            </tbody>
            {tableData.length > 0 && !loading && (
              <tfoot>
                <tr>
                  <td
                    className="neo-td-name"
                    style={{ textAlign: "right", paddingRight: "20px" }}
                  >
                    TOTAL KESELURUHAN
                  </td>
                  <td className="text-center">
                    <div className="neo-dual-badge-container">
                      <span className="neo-badge">{totals.hadirApp}</span>
                      <span className="neo-badge manual">
                        {totals.hadirManual}
                      </span>
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
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  const isStackedMode = hasSubCabang && selectedFilter === "Semua Sub-Cabang";

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
        <button
          className="btn-hamburger"
          onClick={openSidebar}
          aria-label="Buka menu"
        >
          <span></span>
          <span></span>
          <span></span>
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
        <nav className="menu-nav">
          <div
            className="menu-item"
            onClick={() => handleNav("/managerCabang/dashboard")}
          >
            <div className="menu-left">
              <img src={iconDashboard} alt="dash" className="menu-icon-main" />
              <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNav("/managerCabang/datakaryawan")}
          >
            <div className="menu-left">
              <img
                src={iconKaryawan}
                alt="karyawan"
                className="menu-icon-main"
              />
              <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>
          <div
            className="menu-item"
            onClick={() => handleNav("/managerCabang/perizinan")}
          >
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
          <button className="btn-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-text">
            <h1>Laporan Kehadiran - {namaCabangUtama}</h1>
            <p>Data rekapitulasi absensi karyawan di wilayah kerja Anda</p>
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="neo-field">
              <label>Tanggal Mulai</label>
              <input
                type="date"
                className="neo-input"
                max={formatDate(getYesterday())}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) setEndDate("");
                }}
              />
            </div>
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

          <div className="button-group-vertical-right">
            <div className="dropdown-neo-bottom-wrapper">
              <button
                className="btn-neo-print-top no-print"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Print
              </button>
              {showExportMenu && (
                <div
                  className="neo-dropdown-list-right"
                  style={{ top: "115%" }}
                >
                  <div
                    className="neo-drop-item"
                    onClick={() => {
                      window.print();
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
              <button
                className="btn-neo-filter-bottom"
                onClick={toggleFilter}
                style={{
                  cursor: hasSubCabang ? "pointer" : "default",
                  border: hasSubCabang ? "" : "1px solid #ccc",
                  color: hasSubCabang ? "" : "#666",
                }}
              >
                {!hasSubCabang ? namaCabangUtama : selectedFilter}
                {hasSubCabang && (
                  <img
                    src={iconBawah}
                    alt="v"
                    className={showFilter ? "rotate" : ""}
                  />
                )}
              </button>
              {showFilter && hasSubCabang && (
                <div className="neo-dropdown-list-right">
                  <div
                    className="neo-drop-item"
                    onClick={() => handleSelectFilter("Semua Sub-Cabang")}
                  >
                    Semua Sub-Cabang
                  </div>
                  {subCabangList.map((c, idx) => (
                    <div
                      key={idx}
                      className="neo-drop-item"
                      onClick={() => handleSelectFilter(c)}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isStackedMode ? (
          <div className="multi-cabang-wrapper" style={{ overflowY: "auto" }}>
            <div className="cabang-section">
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  marginBottom: "10px",
                  color: "#111",
                }}
              >
                {namaCabangUtama}
              </h3>
              {renderTable(
                `Data Kehadiran - ${namaCabangUtama}`,
                filteredData.filter((d) => d.cabang === namaCabangUtama),
              )}
            </div>
            {subCabangList.map((sub, index) => (
              <div key={index} className="cabang-section">
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    marginBottom: "10px",
                    color: "#111",
                  }}
                >
                  {sub}
                </h3>
                {renderTable(
                  `Data Kehadiran - ${sub}`,
                  filteredData.filter((d) => d.cabang === sub),
                )}
              </div>
            ))}
          </div>
        ) : (
          renderTable("Data Kehadiran Karyawan", filteredData)
        )}
      </main>

      {showDetailModal && (
        <div
          className="modal-overlay-lap"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content-lap"
            onClick={(e) => e.stopPropagation()}
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
                  modalInfo.data.map((item, idx) => renderModalBody(item, idx))
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default LaporanManagerCabang;
