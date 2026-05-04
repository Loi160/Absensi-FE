import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./kelolacabang.css";
import { getAuthHeaders } from "../../context/AuthHeaders";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";

// Daftar menu navigasi sidebar dengan status aktif pada menu Kelola Cabang
const MENU_ITEMS = [
  { path: "/hrd/dashboard", icon: iconDashboard, text: "Dashboard" },
  {
    path: "/hrd/kelolacabang",
    icon: iconKelola,
    text: "Kelola Cabang",
    active: true,
  },
  { path: "/hrd/datakaryawan", icon: iconKaryawan, text: "Data Karyawan" },
  {
    path: "/hrd/kehadiran",
    icon: iconKehadiran,
    text: "Kehadiran",
    hasArrow: true,
  },
  { path: "/hrd/laporan", icon: iconLaporan, text: "Laporan" },
];

// Komponen utama untuk mengelola data operasional cabang dan sub-cabang
const KelolaCabang = () => {
  const navigate = useNavigate();

  // State untuk manajemen jendela pop-up (modal) tambah/edit dan data yang sedang diproses
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [editData, setEditData] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // State untuk modal konfirmasi perubahan status cabang (aktif/non-aktif)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State untuk menyimpan daftar cabang hasil sinkronisasi dengan database
  const [dataCabang, setDataCabang] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data dari server dan menyusunnya menjadi struktur pohon (parent-child)
  const fetchCabang = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/cabang",
        {
          headers: getAuthHeaders(),
        },
      );
      const data = await response.json();

      const sortByNama = (a, b) =>
  (a.nama || "").localeCompare(b.nama || "", "id", {
    sensitivity: "base",
  });

const parents = data.filter((c) => !c.parent_id).sort(sortByNama);
const children = data.filter((c) => c.parent_id).sort(sortByNama);

const structuredData = parents.map((parent) => ({
  ...parent,
  subCabang: children
    .filter((child) => Number(child.parent_id) === Number(parent.id))
    .sort(sortByNama),
}));

setExpandedRows({});
setDataCabang(structuredData);

    } catch (error) {
      console.error("Gagal mengambil data cabang:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memicu pengambilan data cabang saat halaman pertama kali dimuat
  useEffect(() => {
    fetchCabang();
  }, []);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Berpindah halaman navigasi dan otomatis menutup menu sidebar mobile
  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  // Membuka atau menutup baris sub-cabang pada tabel (fitur accordion)
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Menyiapkan modal untuk memperbarui informasi cabang yang sudah ada
  const handleOpenEdit = (item) => {
    setModalTitle("Edit Cabang");
    setEditData(item);
    setParentId(null);
    setShowModal(true);
  };

  // Menyiapkan modal untuk menambah cabang baru di bawah naungan cabang tertentu
  const handleOpenTambahSub = (parentItem) => {
    setModalTitle(`Tambah Sub-Cabang untuk ${parentItem.nama}`);
    setEditData(null);
    setParentId(parentItem.id);
    setShowModal(true);
  };

  // Menyiapkan modal kosong untuk membuat cabang utama baru
  const handleOpenTambah = () => {
    setModalTitle("Tambah Cabang Baru");
    setEditData(null);
    setParentId(null);
    setShowModal(true);
  };

  const handleSaveData = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const requiredFields = [
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

  const emptyField = requiredFields.find((field) => {
    return data[field] === undefined || data[field] === null || String(data[field]).trim() === "";
  });

  if (emptyField) {
    alert("Semua isian cabang wajib diisi. Tidak boleh ada yang kosong.");
    return;
  }

  data.nama = data.nama.trim();
  data.alamat = data.alamat.trim();
  data.titik_koordinat = data.titik_koordinat.trim();

  data.keterlambatan = parseInt(data.keterlambatan, 10);
  data.radius_toleransi = parseInt(data.radius_toleransi, 10);

  if (isNaN(data.keterlambatan) || data.keterlambatan < 0) {
    alert("Keterlambatan harus berupa angka dan tidak boleh kurang dari 0.");
    return;
  }

  if (isNaN(data.radius_toleransi) || data.radius_toleransi <= 0) {
    alert("Toleransi titik koordinat harus berupa angka dan lebih dari 0.");
    return;
  }

  const timeFields = [
    "jam_masuk_weekday",
    "jam_keluar_weekday",
    "jam_masuk_weekend",
    "jam_keluar_weekend",
    "jam_mulai_lembur",
    "jam_selesai_lembur",
  ];

  timeFields.forEach((field) => {
    if (data[field] && data[field].length === 5) {
      data[field] = `${data[field]}:00`;
    }
  });

  if (parentId) data.parent_id = parentId;

  try {
    let url = import.meta.env.VITE_API_URL + "/api/cabang";
    let method = "POST";

    if (editData) {
      url = `${import.meta.env.VITE_API_URL}/api/cabang/${editData.id}`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert(`${modalTitle} berhasil disimpan!`);
      setShowModal(false);
      fetchCabang();
    } else {
      const errData = await response.json();
      alert(`Gagal menyimpan data: ${errData.detail || errData.message}`);
    }
  } catch (error) {
    console.error("Error saving:", error);
    alert("Terjadi kesalahan jaringan.");
  }
};

  // Menampilkan modal konfirmasi sebelum mengubah status aktif/non-aktif sebuah cabang
  const handleToggleStatusClick = (e, item) => {
    e.stopPropagation();
    setConfirmData(item);
    setShowConfirmModal(true);
  };

  // Mengeksekusi perintah perubahan status cabang ke server
  const executeToggleStatus = async () => {
    if (!confirmData) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cabang/${confirmData.id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ is_active: !confirmData.is_active }),
        },
      );

      if (response.ok) {
        setShowConfirmModal(false);
        setConfirmData(null);
        fetchCabang();
      }
    } catch (error) {
      console.error("Error update status:", error);
      alert("Gagal mengubah status.");
    }
  };

  // Menghapus data akun dan mengarahkan kembali ke halaman masuk
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session_token");
    navigate("/auth/login");
  };

  return (
    <div className="hrd-container">
      <div className="mobile-topbar">
        <img src={logoPersegi} alt="AMAGACORP" className="mobile-topbar-logo" />
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
          ✕
        </button>
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
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
              {item.hasArrow && (
                <img src={iconBawah} alt="down" className="arrow-icon-main" />
              )}
            </div>
          ))}
        </nav>
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
          <div className="table-cabang-body">
            {loading ? (
              <div className="table-empty-state">
                Memuat data dari server...
              </div>
            ) : dataCabang.length === 0 ? (
              <div className="table-empty-state">Belum ada data cabang.</div>
            ) : (
              dataCabang.map((item) => (
                <React.Fragment key={item.id}>
                  <div
                    className="table-cabang-row"
                    onClick={() => toggleRow(item.id)}
                  >
                    <span className="cabang-name">
                      {item.nama}{" "}
                      {item.subCabang &&
                        item.subCabang.length > 0 &&
                        (expandedRows[item.id] ? "▲" : "▼")}
                    </span>

                    <div className="table-cabang-actions">
                      <button
                        className="btn-action-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTambahSub(item);
                        }}
                      >
                        + Sub-Cabang
                      </button>
                      <button
                        className="btn-icon-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(item);
                        }}
                        title="Edit Cabang"
                      >
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
                      </button>
                      <button
                        className="btn-status-toggle"
                        onClick={(e) => handleToggleStatusClick(e, item)}
                        title="Ubah Status"
                      >
                        <span
                          className={`status-dot ${item.is_active ? "active" : "inactive"}`}
                        ></span>
                      </button>
                    </div>
                  </div>

                  {item.subCabang &&
                    item.subCabang.length > 0 &&
                    expandedRows[item.id] && (
                      <div className="sub-rows-wrapper">
                        {item.subCabang.map((sub) => (
                          <div
                            className="table-cabang-row sub-row"
                            key={sub.id}
                          >
                            <span className="cabang-name">{sub.nama}</span>
                            <div className="table-cabang-actions">
                              <button
                                className="btn-icon-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(sub);
                                }}
                                title="Edit Sub-Cabang"
                              >
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
                              </button>
                              <button
                                className="btn-status-toggle"
                                onClick={(e) => handleToggleStatusClick(e, sub)}
                                title="Ubah Status"
                              >
                                <span
                                  className={`status-dot ${sub.is_active ? "active" : "inactive"}`}
                                ></span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div
          className="modal-overlay-clean"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-card-edit"
            onClick={(e) => e.stopPropagation()}
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
                    defaultValue={editData?.nama}
                    className="modal-input"
                    required
                  />
                </div>
                <div className="input-block">
                  <label>Alamat Lokasi</label>
                  <input
                    type="text"
                    name="alamat"
                    defaultValue={editData?.alamat}
                    className="modal-input"
                    required
                  />
                </div>
                <div className="input-block">
                  <label>Titik Koordinat</label>
                  <input
                    type="text"
                    name="titik_koordinat"
                    defaultValue={editData?.titik_koordinat}
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
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  <div className="input-block">
                    <label>Jam Masuk</label>
                    <input
                      type="time"
                      name="jam_masuk_weekday"
                      defaultValue={
                        editData?.jam_masuk_weekday?.substring(0, 5) || "08:00"
                      }
                      className="modal-input"
                      required
                    />
                  </div>
                  <div className="input-block">
                    <label>Jam Keluar</label>
                    <input
                      type="time"
                      name="jam_keluar_weekday"
                      defaultValue={
                        editData?.jam_keluar_weekday?.substring(0, 5) || "17:00"
                      }
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
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  <div className="input-block">
                    <label>Jam Masuk</label>
                    <input
                      type="time"
                      name="jam_masuk_weekend"
                      defaultValue={
                        editData?.jam_masuk_weekend?.substring(0, 5) || "08:00"
                      }
                      className="modal-input"
                      required
                    />
                  </div>
                  <div className="input-block">
                    <label>Jam Keluar</label>
                    <input
                      type="time"
                      name="jam_keluar_weekend"
                      defaultValue={
                        editData?.jam_keluar_weekend?.substring(0, 5) || "15:00"
                      }
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
                  style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                >
                  <div className="input-block">
                    <label>Mulai Lembur</label>
                    <input
                      type="time"
                      name="jam_mulai_lembur"
                      defaultValue={
                        editData?.jam_mulai_lembur?.substring(0, 5) || "18:00"
                      }
                      className="modal-input"
                      required
                    />
                  </div>
                  <div className="input-block">
                    <label>Batas Lembur</label>
                    <input
                      type="time"
                      name="jam_selesai_lembur"
                      defaultValue={
                        editData?.jam_selesai_lembur?.substring(0, 5) || "20:00"
                      }
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
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-cancel-mini"
                  onClick={() => setShowModal(false)}
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
        <div
          className="modal-overlay-clean"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="modal-card-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Konfirmasi Perubahan</h3>
            <p>Apakah Anda yakin ingin mengubah status cabang ini?</p>
            <div className="confirm-btn-group">
              <button
                className="btn-konfirm-batal"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmData(null);
                }}
              >
                Batal
              </button>
              <button
                className="btn-konfirm-yakin"
                onClick={executeToggleStatus}
              >
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
