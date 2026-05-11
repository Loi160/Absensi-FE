import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
import "./kelolacabang.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";

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
    active: true,
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
  },
];

// ============================================================================
// CONSTANTS: FORM VALIDATION
// ============================================================================

const REQUIRED_FIELDS = [
  "nama",
  "alamat",
  "titik_koordinat",
  "radius_toleransi",
  "jam_masuk_weekday",
  "jam_keluar_weekday",
  "jam_masuk_weekend",
  "jam_keluar_weekend",
  "jam_mulai_lembur",
  "jam_selesai_lembur",
  "keterlambatan",
];

const TIME_FIELDS = [
  "jam_masuk_weekday",
  "jam_keluar_weekday",
  "jam_masuk_weekend",
  "jam_keluar_weekend",
  "jam_mulai_lembur",
  "jam_selesai_lembur",
];

const AUTH_ERROR_STATUSES = [401, 403];

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ============================================================================
// HELPERS
// ============================================================================

// Mengurutkan data cabang berdasarkan nama dari A-Z.
const sortByNama = (a, b) => {
  return (a.nama || "").localeCompare(b.nama || "", "id", {
    sensitivity: "base",
  });
};

// Mengecek apakah request ditolak karena sesi pengguna tidak valid.
const isAuthError = (status) => {
  return AUTH_ERROR_STATUSES.includes(status);
};

// Memastikan input wajib sudah terisi sebelum dikirim ke server.
const hasEmptyRequiredField = (data) => {
  return REQUIRED_FIELDS.some((field) => {
    return (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    );
  });
};

// Mengubah format waktu dari HH:mm menjadi HH:mm:ss agar sesuai kebutuhan backend.
const normalizeTimeFields = (data) => {
  TIME_FIELDS.forEach((field) => {
    if (data[field] && data[field].length === 5) {
      data[field] = `${data[field]}:00`;
    }
  });
};

// Mengambil nilai waktu dalam format HH:mm untuk input bertipe time.
const getTimeValue = (value, fallback) => {
  return value?.substring(0, 5) || fallback;
};

// Menyusun data cabang menjadi struktur parent-child untuk kebutuhan tampilan tabel.
const buildStructuredCabang = (listCabang) => {
  const parents = listCabang.filter((cabang) => !cabang.parent_id).sort(sortByNama);
  const children = listCabang.filter((cabang) => cabang.parent_id).sort(sortByNama);

  return parents.map((parent) => ({
    ...parent,
    subCabang: children
      .filter((child) => Number(child.parent_id) === Number(parent.id))
      .sort(sortByNama),
  }));
};

// ============================================================================
// COMPONENTS: SHARED ICON
// ============================================================================

const EditIcon = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
};

// ============================================================================
// COMPONENT: KELOLA CABANG
// ============================================================================

const KelolaCabang = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [editData, setEditData] = useState(null);
  const [parentId, setParentId] = useState(null);

  const [expandedRows, setExpandedRows] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dataCabang, setDataCabang] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Mengambil data cabang dari server lalu menyusunnya menjadi struktur parent-child.
  const fetchCabang = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/cabang`, {
        headers: getAuthHeaders(),
      });

      if (isAuthError(response.status)) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data cabang.");
        return;
      }

      const listCabang = Array.isArray(data) ? data : [];
      const structuredData = buildStructuredCabang(listCabang);

      setExpandedRows({});
      setDataCabang(structuredData);
    } catch (error) {
      console.error("Gagal mengambil data cabang:", error);
      alert("Terjadi kesalahan saat mengambil data cabang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCabang();
  }, []);

  // ============================================================================
  // HANDLERS: TABLE INTERACTION
  // ============================================================================

  // Membuka atau menutup daftar sub-cabang pada baris cabang utama.
  const toggleRow = (id) => {
    setExpandedRows((previousRows) => ({
      ...previousRows,
      [id]: !previousRows[id],
    }));
  };

  // ============================================================================
  // HANDLERS: MODAL FORM
  // ============================================================================

  const closeFormModal = () => {
    setShowModal(false);
    setEditData(null);
    setParentId(null);
  };

  // Menyiapkan modal untuk memperbarui data cabang atau sub-cabang.
  const handleOpenEdit = (item) => {
    setModalTitle("Edit Cabang");
    setEditData(item);
    setParentId(null);
    setShowModal(true);
  };

  // Menyiapkan modal untuk menambahkan sub-cabang pada cabang utama.
  const handleOpenTambahSub = (parentItem) => {
    setModalTitle(`Tambah Sub-Cabang untuk ${parentItem.nama}`);
    setEditData(null);
    setParentId(parentItem.id);
    setShowModal(true);
  };

  // Menyiapkan modal untuk membuat cabang utama baru.
  const handleOpenTambah = () => {
    setModalTitle("Tambah Cabang Baru");
    setEditData(null);
    setParentId(null);
    setShowModal(true);
  };

  // Menyiapkan data form sebelum dikirim ke backend.
  const preparePayload = (formElement) => {
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());

    data.nama = String(data.nama || "").trim();
    data.alamat = String(data.alamat || "").trim();
    data.titik_koordinat = String(data.titik_koordinat || "").trim();

    data.keterlambatan = parseInt(data.keterlambatan, 10);
    data.radius_toleransi = parseInt(data.radius_toleransi, 10);

    normalizeTimeFields(data);

    if (parentId) {
      data.parent_id = parentId;
    }

    return data;
  };

  // Memvalidasi data cabang agar tidak ada nilai penting yang kosong atau tidak valid.
  const validatePayload = (data) => {
    if (hasEmptyRequiredField(data)) {
      alert("Semua isian cabang wajib diisi. Tidak boleh ada yang kosong.");
      return false;
    }

    if (isNaN(data.keterlambatan) || data.keterlambatan < 0) {
      alert("Keterlambatan harus berupa angka dan tidak boleh kurang dari 0.");
      return false;
    }

    if (isNaN(data.radius_toleransi) || data.radius_toleransi <= 0) {
      alert("Toleransi titik koordinat harus berupa angka dan lebih dari 0.");
      return false;
    }

    return true;
  };

  // Menyimpan data tambah atau edit cabang ke server.
  const handleSaveData = async (event) => {
    event.preventDefault();

    const data = preparePayload(event.target);

    if (!validatePayload(data)) {
      return;
    }

    try {
      let url = `${API_BASE_URL}/api/cabang`;
      let method = "POST";

      if (editData) {
        url = `${API_BASE_URL}/api/cabang/${editData.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (isAuthError(response.status)) {
        handleLogout();
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(
          `Gagal menyimpan data: ${
            result.detail || result.message || "Terjadi kesalahan."
          }`
        );
        return;
      }

      alert(`${modalTitle} berhasil disimpan!`);
      closeFormModal();
      fetchCabang();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // ============================================================================
  // HANDLERS: STATUS CABANG
  // ============================================================================

  // Menampilkan modal konfirmasi sebelum status cabang diubah.
  const handleToggleStatusClick = (event, item) => {
    event.stopPropagation();
    setConfirmData(item);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmData(null);
  };

  // Mengirim perubahan status aktif atau nonaktif cabang ke server.
  const executeToggleStatus = async () => {
    if (!confirmData) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cabang/${confirmData.id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            is_active: !confirmData.is_active,
          }),
        }
      );

      if (isAuthError(response.status)) {
        handleLogout();
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(result.message || result.detail || "Gagal mengubah status cabang.");
        return;
      }

      closeConfirmModal();
      fetchCabang();
    } catch (error) {
      console.error("Error update status:", error);
      alert("Gagal mengubah status.");
    }
  };

  // ============================================================================
  // RENDER HELPERS
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

  const renderStatusButton = (item) => {
    return (
      <button
        className="btn-status-toggle"
        onClick={(event) => handleToggleStatusClick(event, item)}
        title="Ubah Status"
      >
        <span
          className={`status-dot ${item.is_active ? "active" : "inactive"}`}
        ></span>
      </button>
    );
  };

  const renderEditButton = (item, title) => {
    return (
      <button
        className="btn-icon-action"
        onClick={(event) => {
          event.stopPropagation();
          handleOpenEdit(item);
        }}
        title={title}
      >
        <EditIcon />
      </button>
    );
  };

  const renderSubCabangRows = (item) => {
    if (!item.subCabang || item.subCabang.length === 0 || !expandedRows[item.id]) {
      return null;
    }

    return (
      <div className="sub-rows-wrapper">
        {item.subCabang.map((sub) => (
          <div className="table-cabang-row sub-row" key={sub.id}>
            <span className="cabang-name">{sub.nama}</span>

            <div className="table-cabang-actions">
              {renderEditButton(sub, "Edit Sub-Cabang")}
              {renderStatusButton(sub)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCabangRow = (item) => {
    const hasSubCabang = item.subCabang && item.subCabang.length > 0;
    const isExpanded = expandedRows[item.id];

    return (
      <React.Fragment key={item.id}>
        <div className="table-cabang-row" onClick={() => toggleRow(item.id)}>
          <span className="cabang-name">
            {item.nama} {hasSubCabang && (isExpanded ? "▲" : "▼")}
          </span>

          <div className="table-cabang-actions">
            <button
              className="btn-action-text"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenTambahSub(item);
              }}
            >
              + Sub-Cabang
            </button>

            {renderEditButton(item, "Edit Cabang")}
            {renderStatusButton(item)}
          </div>
        </div>

        {renderSubCabangRows(item)}
      </React.Fragment>
    );
  };

  const renderTableContent = () => {
    if (loading) {
      return <div className="table-empty-state">Memuat data dari server...</div>;
    }

    if (dataCabang.length === 0) {
      return <div className="table-empty-state">Belum ada data cabang.</div>;
    }

    return dataCabang.map((item) => renderCabangRow(item));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
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
        <header className="header-cabang-area">
          <h1 className="cabang-title">Kelola Cabang</h1>
          <p className="cabang-subtitle">
            Manajemen lokasi dan unit operasional
          </p>
        </header>

        <div className="action-row-cabang">
          <button className="btn-tambah-cabang-baru" onClick={handleOpenTambah}>
            <img src={iconTambah} alt="add" /> Tambah Cabang Baru
          </button>
        </div>

        <div className="table-cabang-container">
          <div className="table-cabang-header">Nama Cabang</div>

          <div className="table-cabang-body">{renderTableContent()}</div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay-clean" onClick={closeFormModal}>
          <div
            className="modal-card-edit"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: "650px" }}
          >
            <h2 className="modal-title">{modalTitle}</h2>

            <form onSubmit={handleSaveData}>
              <div className="modal-grid">
                <div className="input-block">
                  <label>Nama Cabang</label>
                  <input
                    type="text"
                    name="nama"
                    defaultValue={editData?.nama || ""}
                    className="modal-input"
                    required
                  />
                </div>

                <div className="input-block">
                  <label>Alamat Lokasi</label>
                  <input
                    type="text"
                    name="alamat"
                    defaultValue={editData?.alamat || ""}
                    className="modal-input"
                    required
                  />
                </div>

                <div className="input-block">
                  <label>Titik Koordinat</label>
                  <input
                    type="text"
                    name="titik_koordinat"
                    defaultValue={editData?.titik_koordinat || ""}
                    placeholder="-6.200000, 106.816666"
                    className="modal-input"
                    required
                  />
                </div>

                <div className="input-block">
                  <label>Toleransi Titik Koordinat (m)</label>
                  <input
                    type="number"
                    name="radius_toleransi"
                    defaultValue={editData?.radius_toleransi || 20}
                    placeholder="Misal: 20"
                    className="modal-input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  marginBottom: "15px",
                  borderTop: "1px solid #eee",
                  paddingTop: "15px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    marginBottom: "10px",
                    color: "#333",
                  }}
                >
                  Jadwal Kerja Reguler (Senin - Jumat)
                </h4>

                <div
                  className="modal-grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <div className="input-block">
                    <label>Jam Masuk</label>
                    <input
                      type="time"
                      name="jam_masuk_weekday"
                      defaultValue={getTimeValue(
                        editData?.jam_masuk_weekday,
                        "08:00"
                      )}
                      className="modal-input"
                      required
                    />
                  </div>

                  <div className="input-block">
                    <label>Jam Keluar</label>
                    <input
                      type="time"
                      name="jam_keluar_weekday"
                      defaultValue={getTimeValue(
                        editData?.jam_keluar_weekday,
                        "17:00"
                      )}
                      className="modal-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "15px",
                  borderTop: "1px solid #eee",
                  paddingTop: "15px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    marginBottom: "10px",
                    color: "#333",
                  }}
                >
                  Jadwal Kerja Weekend (Sabtu - Minggu)
                </h4>

                <div
                  className="modal-grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <div className="input-block">
                    <label>Jam Masuk</label>
                    <input
                      type="time"
                      name="jam_masuk_weekend"
                      defaultValue={getTimeValue(
                        editData?.jam_masuk_weekend,
                        "08:00"
                      )}
                      className="modal-input"
                      required
                    />
                  </div>

                  <div className="input-block">
                    <label>Jam Keluar</label>
                    <input
                      type="time"
                      name="jam_keluar_weekend"
                      defaultValue={getTimeValue(
                        editData?.jam_keluar_weekend,
                        "15:00"
                      )}
                      className="modal-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "15px",
                  borderTop: "1px solid #eee",
                  paddingTop: "15px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    marginBottom: "10px",
                    color: "#333",
                  }}
                >
                  Aturan Lembur & Keterlambatan
                </h4>

                <div
                  className="modal-grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr",
                  }}
                >
                  <div className="input-block">
                    <label>Mulai Lembur</label>
                    <input
                      type="time"
                      name="jam_mulai_lembur"
                      defaultValue={getTimeValue(
                        editData?.jam_mulai_lembur,
                        "18:00"
                      )}
                      className="modal-input"
                      required
                    />
                  </div>

                  <div className="input-block">
                    <label>Batas Lembur</label>
                    <input
                      type="time"
                      name="jam_selesai_lembur"
                      defaultValue={getTimeValue(
                        editData?.jam_selesai_lembur,
                        "20:00"
                      )}
                      className="modal-input"
                      required
                    />
                  </div>

                  <div className="input-block">
                    <label>Keterlambatan (Menit)</label>
                    <input
                      type="number"
                      name="keterlambatan"
                      defaultValue={editData?.keterlambatan || 15}
                      placeholder="Misal: 15"
                      className="modal-input"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-cancel-mini"
                  onClick={closeFormModal}
                >
                  Batal
                </button>

                <button type="submit" className="btn-save-dynamic">
                  Simpan Cabang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay-clean" onClick={closeConfirmModal}>
          <div
            className="modal-card-confirm"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Konfirmasi Perubahan</h3>
            <p>
              Apakah Anda yakin ingin mengubah status cabang{" "}
              <b>{confirmData?.nama}</b>?
            </p>

            <div className="confirm-btn-group">
              <button className="btn-konfirm-batal" onClick={closeConfirmModal}>
                Batal
              </button>

              <button className="btn-konfirm-yakin" onClick={executeToggleStatus}>
                Ya, Ubah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaCabang;