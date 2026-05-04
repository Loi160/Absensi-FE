import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../context/AuthHeaders";
import "./kehadiran.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconAbsen from "../../assets/tambah.svg";
import iconIzin from "../../assets/perizinan.svg";

// ============================================================================
// CONSTANTS: API & NAVIGATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MENU_ITEMS = [
  {
    path: "/hrd/dashboard",
    icon: iconDashboard,
    alt: "dash",
    text: "Dashboard",
  },
  {
    path: "/hrd/kelolacabang",
    icon: iconKelola,
    alt: "kelola",
    text: "Kelola Cabang",
  },
  {
    path: "/hrd/datakaryawan",
    icon: iconKaryawan,
    alt: "karyawan",
    text: "Data Karyawan",
  },
  {
    path: "/hrd/laporan",
    icon: iconLaporan,
    alt: "lapor",
    text: "Laporan",
  },
];

const SUBMENU_ITEMS = [
  {
    key: "absenManual",
    icon: iconAbsen,
    text: "Absen Manual",
  },
  {
    key: "perizinan",
    icon: iconIzin,
    text: "Perizinan",
  },
];

// ============================================================================
// HELPERS
// ============================================================================

// Mengubah format tanggal standar menjadi tampilan bahasa Indonesia.
const formatDateIndo = (dateString) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Mengambil tanggal hari ini dalam format YYYY-MM-DD untuk input bertipe date.
const getTodayInputDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Mengurutkan data agar status Pending muncul paling atas, lalu tanggal terbaru.
const sortData = (dataArray) => {
  return [...dataArray].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") {
      return -1;
    }

    if (a.status !== "Pending" && b.status === "Pending") {
      return 1;
    }

    return b.rawDate - a.rawDate;
  });
};

// Menentukan nama class CSS badge berdasarkan tipe izin.
const getBadgeClass = (tipe) => {
  if (!tipe) {
    return "lainnya";
  }

  const lower = tipe.toLowerCase();

  if (lower.includes("sakit")) {
    return "sakit";
  }

  if (lower.includes("pribadi")) {
    return "pribadi";
  }

  if (lower.includes("keluar")) {
    return "keluar";
  }

  if (lower.includes("pulang")) {
    return "pulang";
  }

  if (lower.includes("khusus")) {
    return "khusus";
  }

  if (lower.includes("tahunan")) {
    return "tahunan";
  }

  return "lainnya";
};

// Menentukan class CSS badge status approval.
const getStatusBadgeClass = (status) => {
  if (status === "Disetujui") {
    return "approve";
  }

  if (status === "Ditolak") {
    return "reject";
  }

  return "pending";
};

// Memetakan data perizinan dari backend ke format yang dibutuhkan tabel dan modal.
const mapPermissionData = (perizinan) => {
  return {
    id: perizinan.id,
    nama: perizinan.users?.nama || "Unknown",
    cabang: perizinan.users?.cabang?.nama || "-",
    jabatan: perizinan.users?.jabatan || "-",
    divisi: perizinan.users?.divisi || "-",
    noTelp: perizinan.users?.no_telp || "-",
    tipeIzin: perizinan.jenis_izin,
    keterangan: perizinan.keterangan || perizinan.keperluan,
    tglMulai: formatDateIndo(perizinan.tanggal_mulai),
    tglSelesai: formatDateIndo(perizinan.tanggal_selesai),
    tanggal: formatDateIndo(perizinan.tanggal_mulai),
    jamMulai: perizinan.jam_mulai,
    jamSelesai: perizinan.jam_selesai,
    keperluan: perizinan.keperluan,
    kendaraan: perizinan.kendaraan,
    alasan: perizinan.keterangan,
    status: perizinan.status_approval,
    foto: perizinan.bukti_foto,
    rawDate: new Date(perizinan.created_at).getTime(),
  };
};

// ============================================================================
// COMPONENT: KEHADIRAN
// ============================================================================

const Kehadiran = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("perizinan");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua Cabang");
  const [cabangList, setCabangList] = useState([]);

  const [dataIzinHarian, setDataIzinHarian] = useState([]);
  const [dataIzinFIMTK, setDataIzinFIMTK] = useState([]);
  const [dataCuti, setDataCuti] = useState([]);
  const [loading, setLoading] = useState(true);

  const [karyawanList, setKaryawanList] = useState([]);
  const [loadingAbsen, setLoadingAbsen] = useState(false);
  const [selectedKaryawanId, setSelectedKaryawanId] = useState("");
  const [karyawanDetail, setKaryawanDetail] = useState(null);
  const [tanggalAbsen, setTanggalAbsen] = useState(getTodayInputDate);

  const [searchKaryawan, setSearchKaryawan] = useState("");
  const [showKaryawanDropdown, setShowKaryawanDropdown] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const filteredIzinHarian = useMemo(() => {
    return filterByCabang(sortData(dataIzinHarian));
  }, [dataIzinHarian, selectedFilter]);

  const filteredIzinFIMTK = useMemo(() => {
    return filterByCabang(sortData(dataIzinFIMTK));
  }, [dataIzinFIMTK, selectedFilter]);

  const filteredCuti = useMemo(() => {
    return filterByCabang(sortData(dataCuti));
  }, [dataCuti, selectedFilter]);

  const filteredKaryawanList = useMemo(() => {
    return karyawanList.filter((karyawan) => {
      const keyword = searchKaryawan.trim().toLowerCase();
      const nama = String(karyawan.nama || "").toLowerCase();
      const nik = String(karyawan.nik || "").toLowerCase();
      const status = String(karyawan.status || "Aktif")
        .trim()
        .toLowerCase();

      return (
        (nama.includes(keyword) || nik.includes(keyword)) &&
        status === "aktif"
      );
    });
  }, [karyawanList, searchKaryawan]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Mengambil data cabang, karyawan, dan perizinan dari backend.
  const fetchData = async () => {
    try {
      setLoading(true);

      const resCabang = await fetch(`${API_BASE_URL}/api/cabang`, {
        headers: getAuthHeaders(),
      });

      const listCabang = await resCabang.json();

      setCabangList(
        Array.isArray(listCabang) ? listCabang.map((cabang) => cabang.nama) : []
      );

      const resKaryawan = await fetch(`${API_BASE_URL}/api/karyawan`, {
        headers: getAuthHeaders(),
      });

      const listKaryawan = await resKaryawan.json();

      setKaryawanList(Array.isArray(listKaryawan) ? listKaryawan : []);

      const resPerizinan = await fetch(`${API_BASE_URL}/api/perizinan/all`, {
        headers: getAuthHeaders(),
      });

      const allPerizinan = await resPerizinan.json();

      const harian = [];
      const fimtk = [];
      const cuti = [];

      if (Array.isArray(allPerizinan)) {
        allPerizinan.forEach((perizinan) => {
          const mappedData = mapPermissionData(perizinan);

          if (perizinan.kategori === "Izin") {
            harian.push(mappedData);
          } else if (perizinan.kategori === "FIMTK") {
            fimtk.push(mappedData);
          } else if (perizinan.kategori === "Cuti") {
            cuti.push(mappedData);
          }
        });
      }

      setDataIzinHarian(harian);
      setDataIzinFIMTK(fimtk);
      setDataCuti(cuti);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Menyesuaikan detail karyawan ketika ID karyawan berubah.
  useEffect(() => {
    if (selectedKaryawanId) {
      const found = karyawanList.find((karyawan) => {
        return String(karyawan.id) === String(selectedKaryawanId);
      });

      setKaryawanDetail(found);
      return;
    }

    setKaryawanDetail(null);
  }, [selectedKaryawanId, karyawanList]);

  // ============================================================================
  // HANDLERS: AUTH & NAVIGATION
  // ============================================================================

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Menghapus data login dari browser dan mengarahkan pengguna ke halaman login.
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session_token");
    navigate("/auth/login");
  };

  // Mengarahkan pengguna ke halaman yang dipilih dan menutup sidebar mobile.
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  // Mengganti tampilan antara tab Perizinan dan Absen Manual.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    closeSidebar();
  };

  // ============================================================================
  // HANDLERS: FILTER
  // ============================================================================

  const toggleFilter = () => {
    setShowFilter((previousValue) => !previousValue);
  };

  const handleSelectFilter = (value) => {
    setSelectedFilter(value);
    setShowFilter(false);
  };

  // Memfilter data berdasarkan cabang yang dipilih.
  function filterByCabang(dataArray) {
    if (selectedFilter === "Semua Cabang") {
      return dataArray;
    }

    return dataArray.filter((item) => item.cabang === selectedFilter);
  }

  // ============================================================================
  // HANDLERS: MODAL & APPROVAL
  // ============================================================================

  // Membuka modal detail berdasarkan baris perizinan yang dipilih.
  const handleRowClick = (item, type) => {
    setSelectedData(item);
    setModalType(type);
    setShowModal(true);
  };

  // Menutup modal detail dan membersihkan data terpilih.
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedData(null);
    setModalType("");
  };

  // Mengirim pembaruan status approval perizinan ke server.
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/perizinan/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status_approval: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || `Berhasil di-${newStatus}`);
        fetchData();
        handleCloseModal();
        return;
      }

      alert(
        `Gagal: ${result.message || "Gagal mengupdate status."}${
          result.detail ? `\nDetail: ${result.detail}` : ""
        }`
      );
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // ============================================================================
  // HANDLERS: ABSEN MANUAL
  // ============================================================================

  const resetAbsenManualForm = () => {
    setSelectedKaryawanId("");
    setSearchKaryawan("");
    setTanggalAbsen(getTodayInputDate());

    const formElement = document.querySelector(".absen-form-grid");

    if (formElement) {
      formElement.reset();
    }
  };

  const handleSearchKaryawanChange = (event) => {
    const value = event.target.value;

    setSearchKaryawan(value);
    setShowKaryawanDropdown(true);

    if (value === "") {
      setSelectedKaryawanId("");
    }
  };

  // Memilih karyawan dari dropdown pencarian absensi manual.
  const handleSelectKaryawan = (event, karyawan) => {
    event.preventDefault();
    setSelectedKaryawanId(karyawan.id);
    setSearchKaryawan(karyawan.nama);
    setShowKaryawanDropdown(false);
  };

  // Mengirim data absensi manual yang diinput oleh HRD.
  const handleAbsenManualSubmit = async (event) => {
    event.preventDefault();

    if (!selectedKaryawanId) {
      alert("Silahkan cari dan pilih karyawan dari dropdown terlebih dahulu!");
      return;
    }

    setLoadingAbsen(true);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      user_id: selectedKaryawanId,
      tanggal: tanggalAbsen,
      waktu_masuk: data.tipe_absen === "Masuk" ? data.jam_absen : null,
      waktu_pulang: data.tipe_absen === "Pulang" ? data.jam_absen : null,
      keterangan: data.keterangan,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/absensi/manual`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        event.target.reset();
        setSelectedKaryawanId("");
        setSearchKaryawan("");
        setTanggalAbsen(getTodayInputDate());
        return;
      }

      alert(`Gagal: ${result.message}`);
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingAbsen(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS: SIDEBAR
  // ============================================================================

  const renderMainMenuItems = () => {
    return MENU_ITEMS.map((item) => (
      <div
        key={item.path}
        className="menu-item"
        onClick={() => handleNav(item.path)}
      >
        <div className="menu-left">
          <img src={item.icon} alt={item.alt} className="menu-icon-main" />
          <span className="menu-text-main">{item.text}</span>
        </div>
      </div>
    ));
  };

  const renderKehadiranMenu = () => {
    return (
      <>
        <div
          className="menu-item active has-arrow"
          onClick={() => setIsSubmenuOpen((previousValue) => !previousValue)}
        >
          <div className="menu-left">
            <img src={iconKehadiran} alt="hadir" className="menu-icon-main" />
            <span className="menu-text-main">Kehadiran</span>
          </div>

          <img
            src={iconBawah}
            alt="down"
            className={`arrow-icon-main ${isSubmenuOpen ? "rotate-up" : ""}`}
          />
        </div>

        {isSubmenuOpen && (
          <div className="submenu-container">
            {SUBMENU_ITEMS.map((item) => (
              <div
                key={item.key}
                className={`submenu-item ${
                  activeTab === item.key ? "active-sub" : ""
                }`}
                onClick={() => handleTabChange(item.key)}
              >
                <img src={item.icon} alt="-" className="submenu-icon" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  // ============================================================================
  // RENDER HELPERS: FILTER
  // ============================================================================

  const renderFilterDropdown = () => {
    if (!showFilter) {
      return null;
    }

    return (
      <div className="filter-dropdown">
        <div
          className="dropdown-item"
          onClick={() => handleSelectFilter("Semua Cabang")}
        >
          Semua Cabang
        </div>

        {cabangList.map((cabang) => (
          <div
            key={cabang}
            className="dropdown-item"
            onClick={() => handleSelectFilter(cabang)}
          >
            {cabang}
          </div>
        ))}
      </div>
    );
  };

  const renderCabangFilter = () => {
    return (
      <div className="action-row-perizinan">
        <div className="filter-wrapper">
          <button className="btn-filter-green" onClick={toggleFilter}>
            {selectedFilter}{" "}
            <img
              src={iconBawah}
              alt="v"
              className={`filter-arrow ${showFilter ? "rotate" : ""}`}
            />
          </button>

          {renderFilterDropdown()}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: TABLE
  // ============================================================================

  const renderStatusBadge = (status) => {
    return (
      <span className={`badge-status ${getStatusBadgeClass(status)}`}>
        {status}
      </span>
    );
  };

  const renderJenisBadge = (tipeIzin) => {
    return (
      <span className={`badge-jenis ${getBadgeClass(tipeIzin)}`}>
        {tipeIzin}
      </span>
    );
  };

  const renderActionCell = (item) => {
    if (item.status !== "Pending") {
      return <span className="text-selesai">- Selesai -</span>;
    }

    return (
      <div className="action-buttons">
        <button
          className="btn-approve"
          onClick={() => handleUpdateStatus(item.id, "Disetujui")}
        >
          Setujui
        </button>

        <button
          className="btn-reject"
          onClick={() => handleUpdateStatus(item.id, "Ditolak")}
        >
          Tolak
        </button>
      </div>
    );
  };

  const renderEmptyTableRow = (message) => {
    return (
      <tr>
        <td
          colSpan="6"
          className="text-center empty-state-cell"
          style={{
            padding: "20px",
          }}
        >
          {message}
        </td>
      </tr>
    );
  };

  const renderPermissionRows = ({ data, type, emptyMessage, renderCells }) => {
    if (data.length === 0) {
      return renderEmptyTableRow(emptyMessage);
    }

    return data.map((item) => (
      <tr
        key={item.id}
        className="clickable-row"
        onClick={() => handleRowClick(item, type)}
      >
        {renderCells(item)}

        <td
          className="text-center"
          onClick={(event) => event.stopPropagation()}
        >
          {renderActionCell(item)}
        </td>
      </tr>
    ));
  };

  const renderPermissionTable = ({
    title,
    headers,
    data,
    type,
    emptyMessage,
    renderCells,
  }) => {
    return (
      <>
        <h3 className="section-title">{title}</h3>

        <div className="perizinan-card">
          <div className="card-header-green">
            Permintaan Menunggu Approval
          </div>

          <table className="table-izin">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header.label}
                    style={{
                      width: header.width,
                    }}
                    className={header.className}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {renderPermissionRows({
                data,
                type,
                emptyMessage,
                renderCells,
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderIzinHarianCells = (item) => {
    return (
      <>
        <td className="clickable-name">{item.nama}</td>
        <td>{item.tglMulai}</td>
        <td>{item.tglSelesai}</td>
        <td>{renderJenisBadge(item.tipeIzin)}</td>
        <td className="text-center">{renderStatusBadge(item.status)}</td>
      </>
    );
  };

  const renderFimtkCells = (item) => {
    return (
      <>
        <td className="clickable-name">{item.nama}</td>
        <td>{item.jabatan}</td>
        <td>{renderJenisBadge(item.tipeIzin)}</td>
        <td>{item.tanggal}</td>
        <td className="text-center">{renderStatusBadge(item.status)}</td>
      </>
    );
  };

  const renderCutiCells = (item) => {
    return (
      <>
        <td className="clickable-name">{item.nama}</td>
        <td>{item.jabatan}</td>
        <td>{renderJenisBadge(item.tipeIzin)}</td>
        <td>{item.tglMulai}</td>
        <td className="text-center">{renderStatusBadge(item.status)}</td>
      </>
    );
  };

  // ============================================================================
  // RENDER HELPERS: PERIZINAN TAB
  // ============================================================================

  const renderPerizinanContent = () => {
    if (loading) {
      return (
        <div
          style={{
            textAlign: "center",
            marginTop: "50px",
            color: "#666",
          }}
        >
          Memuat data perizinan...
        </div>
      );
    }

    return (
      <>
        {renderPermissionTable({
          title: "Permohonan Izin Harian",
          headers: [
            {
              label: "NAMA",
              width: "20%",
            },
            {
              label: "MULAI",
              width: "15%",
            },
            {
              label: "SELESAI",
              width: "15%",
            },
            {
              label: "TIPE IZIN",
              width: "15%",
            },
            {
              label: "STATUS",
              width: "10%",
              className: "text-center",
            },
            {
              label: "AKSI",
              width: "25%",
              className: "text-center",
            },
          ],
          data: filteredIzinHarian,
          type: "harian",
          emptyMessage: "Belum ada data izin harian.",
          renderCells: renderIzinHarianCells,
        })}

        {renderPermissionTable({
          title: "Permohonan Izin Meninggalkan Tempat Kerja",
          headers: [
            {
              label: "NAMA",
              width: "20%",
            },
            {
              label: "JABATAN",
              width: "15%",
            },
            {
              label: "TIPE IZIN",
              width: "15%",
            },
            {
              label: "TANGGAL",
              width: "15%",
            },
            {
              label: "STATUS",
              width: "10%",
              className: "text-center",
            },
            {
              label: "AKSI",
              width: "25%",
              className: "text-center",
            },
          ],
          data: filteredIzinFIMTK,
          type: "fimtk",
          emptyMessage: "Belum ada data izin FIMTK.",
          renderCells: renderFimtkCells,
        })}

        {renderPermissionTable({
          title: "Permohonan Izin Cuti Karyawan",
          headers: [
            {
              label: "NAMA",
              width: "20%",
            },
            {
              label: "JABATAN",
              width: "15%",
            },
            {
              label: "TIPE IZIN",
              width: "15%",
            },
            {
              label: "MULAI CUTI",
              width: "15%",
            },
            {
              label: "STATUS",
              width: "10%",
              className: "text-center",
            },
            {
              label: "AKSI",
              width: "25%",
              className: "text-center",
            },
          ],
          data: filteredCuti,
          type: "cuti",
          emptyMessage: "Belum ada data izin Cuti.",
          renderCells: renderCutiCells,
        })}
      </>
    );
  };

  const renderPerizinanTab = () => {
    return (
      <>
        <div className="header-titles">
          <h1>Perizinan</h1>
          <p>Kelola seluruh permohonan izin dan cuti karyawan</p>
        </div>

        {renderCabangFilter()}
        {renderPerizinanContent()}
      </>
    );
  };

  // ============================================================================
  // RENDER HELPERS: ABSEN MANUAL TAB
  // ============================================================================

  const renderKaryawanDropdown = () => {
    if (!showKaryawanDropdown) {
      return null;
    }

    return (
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginTop: "4px",
          maxHeight: "220px",
          overflowY: "auto",
          zIndex: 50,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        {filteredKaryawanList.length > 0 ? (
          filteredKaryawanList.map((karyawan) => (
            <div
              key={karyawan.id}
              style={{
                padding: "10px 15px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
              onMouseDown={(event) => handleSelectKaryawan(event, karyawan)}
              onMouseEnter={(event) => {
                event.target.style.backgroundColor = "#f9f9f9";
              }}
              onMouseLeave={(event) => {
                event.target.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#333",
                }}
              >
                {karyawan.nama}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#888",
                }}
              >
                {karyawan.nik} - {karyawan.cabang?.nama}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "15px",
              color: "#888",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            Karyawan tidak ditemukan
          </div>
        )}
      </div>
    );
  };

  const renderReadonlyInput = ({ label, value }) => {
    return (
      <div className="form-group">
        <label>{label}</label>

        <input
          type="text"
          className="input-field"
          value={value || ""}
          readOnly
          style={{
            backgroundColor: "#f5f5f5",
            color: "#666",
          }}
        />
      </div>
    );
  };

  const renderEmployeeSearchField = () => {
    return (
      <div
        className="form-group"
        style={{
          position: "relative",
        }}
      >
        <label>Nama</label>

        <div
          style={{
            position: "relative",
          }}
        >
          <input
            type="text"
            className="input-field"
            style={{
              width: "100%",
              paddingRight: "35px",
              cursor: "text",
            }}
            placeholder="Ketik atau pilih Karyawan..."
            value={searchKaryawan}
            onChange={handleSearchKaryawanChange}
            onFocus={() => setShowKaryawanDropdown(true)}
            onBlur={() => setTimeout(() => setShowKaryawanDropdown(false), 200)}
            required={!selectedKaryawanId}
          />

          <svg
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#555"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {renderKaryawanDropdown()}
      </div>
    );
  };

  const renderAbsenManualTab = () => {
    return (
      <div className="absen-form-wrapper">
        <div className="header-titles">
          <h1>Absensi Manual</h1>
          <p>Formulir penginputan data absensi karyawan secara manual</p>
        </div>

        <form
          onSubmit={handleAbsenManualSubmit}
          className="absen-form-grid"
          style={{
            marginTop: "20px",
          }}
        >
          {renderEmployeeSearchField()}

          {renderReadonlyInput({
            label: "NIK",
            value: karyawanDetail?.nik,
          })}

          {renderReadonlyInput({
            label: "Jabatan",
            value: karyawanDetail?.jabatan,
          })}

          {renderReadonlyInput({
            label: "Divisi",
            value: karyawanDetail?.divisi,
          })}

          <div className="form-group">
            <label>Tanggal Absensi Manual</label>

            <input
              type="date"
              name="tanggal"
              className="input-field"
              value={tanggalAbsen}
              onChange={(event) => setTanggalAbsen(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Jam Absen</label>

            <input
              type="time"
              name="jam_absen"
              className="input-field"
              required
            />
          </div>

          {renderReadonlyInput({
            label: "Cabang Penempatan",
            value: karyawanDetail?.cabang?.nama,
          })}

          <div className="form-group">
            <label>Tipe Absen</label>

            <select name="tipe_absen" className="input-field" required>
              <option value="">Pilih Tipe</option>
              <option value="Masuk">Masuk</option>
              <option value="Pulang">Pulang</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Keterangan</label>

            <textarea
              name="keterangan"
              className="input-field"
              rows="3"
              placeholder="Alasan absen manual..."
            ></textarea>
          </div>

          <div className="form-actions-bottom">
            <button
              type="button"
              className="btn-batal-red"
              onClick={resetAbsenManualForm}
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn-simpan-green"
              disabled={loadingAbsen}
            >
              {loadingAbsen ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: MODAL DETAIL
  // ============================================================================

  const renderModalTitle = () => {
    if (modalType === "harian") {
      return "Detail Izin Harian";
    }

    if (modalType === "fimtk") {
      return "Detail Izin FIMTK";
    }

    if (modalType === "cuti") {
      return "Detail Izin Cuti";
    }

    return "";
  };

  const renderModalField = ({ label, value, style }) => {
    return (
      <div className="modal-field-group">
        <label className="modal-field-label">{label}</label>

        <div className="modal-field-value" style={style}>
          {value}
        </div>
      </div>
    );
  };

  const renderModalSplitRow = (children) => {
    return <div className="modal-row-split">{children}</div>;
  };

  const renderBuktiFoto = () => {
    return (
      <div className="modal-field-group">
        <label className="modal-field-label">Bukti Foto</label>

        <div
          className="modal-foto-box"
          style={{
            position: "relative",
          }}
        >
          {selectedData.foto ? (
            <>
              <img
                src={selectedData.foto}
                alt="Bukti"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  cursor: "pointer",
                  objectFit: "contain",
                }}
                onClick={() => setPreviewImage(selectedData.foto)}
              />

              <button
                type="button"
                onClick={() => setPreviewImage(selectedData.foto)}
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "35px",
                  height: "35px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                🔍
              </button>
            </>
          ) : (
            "Gambar: Belum ada bukti terlampir"
          )}
        </div>
      </div>
    );
  };

  const renderHarianModalDetail = () => {
    return (
      <>
        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Nama",
              value: selectedData.nama,
            })}

            {renderModalField({
              label: "Cabang",
              value: selectedData.cabang,
            })}
          </>
        )}

        {renderModalField({
          label: "Tipe Izin",
          value: selectedData.tipeIzin,
        })}

        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Tanggal Mulai",
              value: selectedData.tglMulai,
            })}

            {renderModalField({
              label: "Tanggal Selesai",
              value: selectedData.tglSelesai,
            })}
          </>
        )}

        {renderModalField({
          label: "Keterangan / Alasan",
          value: selectedData.keterangan,
          style: {
            minHeight: "60px",
          },
        })}

        {renderBuktiFoto()}
      </>
    );
  };

  const renderFimtkModalDetail = () => {
    return (
      <>
        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Nama",
              value: selectedData.nama,
            })}

            {renderModalField({
              label: "Cabang",
              value: selectedData.cabang,
            })}
          </>
        )}

        {renderModalField({
          label: "Tipe Izin",
          value: selectedData.tipeIzin,
        })}

        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Jabatan",
              value: selectedData.jabatan,
            })}

            {renderModalField({
              label: "Divisi",
              value: selectedData.divisi,
            })}
          </>
        )}

        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Tanggal",
              value: selectedData.tanggal,
            })}

            {renderModalField({
              label: "Jam Izin",
              value: `${selectedData.jamMulai} - ${selectedData.jamSelesai}`,
            })}
          </>
        )}

        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Keperluan",
              value: selectedData.keperluan,
            })}

            {renderModalField({
              label: "Kendaraan",
              value: selectedData.kendaraan,
            })}
          </>
        )}

        {renderModalField({
          label: "Keterangan / Alasan",
          value: selectedData.keterangan,
          style: {
            minHeight: "60px",
          },
        })}
      </>
    );
  };

  const renderCutiModalDetail = () => {
    return (
      <>
        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Nama",
              value: selectedData.nama,
            })}

            {renderModalField({
              label: "Cabang",
              value: selectedData.cabang,
            })}
          </>
        )}

        {renderModalField({
          label: "Tipe Izin",
          value: selectedData.tipeIzin,
        })}

        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Tanggal Mulai",
              value: selectedData.tglMulai,
            })}

            {renderModalField({
              label: "Tanggal Selesai",
              value: selectedData.tglSelesai,
            })}
          </>
        )}

        {renderModalSplitRow(
          <>
            {renderModalField({
              label: "Jabatan & Divisi",
              value: `${selectedData.jabatan} - ${selectedData.divisi}`,
            })}

            {renderModalField({
              label: "No. Telepon",
              value: selectedData.noTelp,
            })}
          </>
        )}

        {renderModalField({
          label: "Keterangan / Alasan",
          value: selectedData.keterangan,
          style: {
            minHeight: "60px",
          },
        })}
      </>
    );
  };

  const renderModalBody = () => {
    if (modalType === "harian") {
      return renderHarianModalDetail();
    }

    if (modalType === "fimtk") {
      return renderFimtkModalDetail();
    }

    if (modalType === "cuti") {
      return renderCutiModalDetail();
    }

    return null;
  };

  const renderDetailModal = () => {
    if (!showModal || !selectedData) {
      return null;
    }

    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div
          className="modal-content"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-header-modern">
            <h2>{renderModalTitle()}</h2>

            <button className="modal-close-icon" onClick={handleCloseModal}>
              &times;
            </button>
          </div>

          <div className="modal-body-modern">{renderModalBody()}</div>

          {selectedData.status === "Pending" && (
            <div className="modal-footer-modern">
              <button
                className="btn-reject-modern"
                onClick={() => handleUpdateStatus(selectedData.id, "Ditolak")}
              >
                Tolak
              </button>

              <button
                className="btn-approve-modern"
                onClick={() =>
                  handleUpdateStatus(selectedData.id, "Disetujui")
                }
              >
                Setujui
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: IMAGE PREVIEW
  // ============================================================================

  const renderPreviewImage = () => {
    if (!previewImage) {
      return null;
    }

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.85)",
          zIndex: 99999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => setPreviewImage(null)}
      >
        <button
          style={{
            position: "absolute",
            top: "20px",
            right: "30px",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "40px",
            cursor: "pointer",
          }}
          onClick={() => setPreviewImage(null)}
        >
          &times;
        </button>

        <img
          src={previewImage}
          alt="Preview Zoom"
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            borderRadius: "8px",
            objectFit: "contain",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
          onClick={(event) => event.stopPropagation()}
        />
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

        <button className="btn-hamburger" onClick={openSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar}>
          &times;
        </button>

        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>

        <nav className="menu-nav">
          {renderMainMenuItems().slice(0, 3)}
          {renderKehadiranMenu()}
          {renderMainMenuItems().slice(3)}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {activeTab === "perizinan" && renderPerizinanTab()}
        {activeTab === "absenManual" && renderAbsenManualTab()}
      </main>

      {renderDetailModal()}
      {renderPreviewImage()}
    </div>
  );
};

export default Kehadiran;