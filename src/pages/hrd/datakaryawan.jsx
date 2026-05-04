import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
import "./datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";
import iconTambah from "../../assets/tambah.svg";

// ============================================================================
// CONSTANTS: API & NAVIGATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AUTH_ERROR_STATUSES = [401, 403];

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
    active: true,
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
// CONSTANTS: FORM OPTIONS
// ============================================================================

const ROLE_OPTIONS = [
  {
    value: "karyawan",
    label: "Karyawan",
  },
  {
    value: "managerCabang",
    label: "Manager Cabang",
  },
  {
    value: "hrd",
    label: "HRD",
  },
];

const INITIAL_FORM_DATA = {
  nama: "",
  nik: "",
  password: "",
  role: "karyawan",
  cabang_id: "",
  jabatan: "",
  divisi: "",
  no_telp: "",
  status: "Aktif",
};

// ============================================================================
// HELPERS
// ============================================================================

// Mengubah role dari backend menjadi label yang mudah dibaca pengguna.
const getRoleLabel = (role) => {
  if (role === "hrd") {
    return "HRD";
  }

  if (role === "managerCabang") {
    return "Manager Cabang";
  }

  return "Karyawan";
};

// Mengecek apakah response API menunjukkan sesi pengguna sudah tidak valid.
const isAuthError = (status) => {
  return AUTH_ERROR_STATUSES.includes(status);
};

// Membersihkan payload sebelum dikirim ke backend.
const buildEmployeePayload = (formData) => {
  return {
    ...formData,
    nama: formData.nama.trim(),
    nik: formData.nik.trim(),
    password: formData.password.trim(),
    jabatan: formData.jabatan.trim(),
    divisi: formData.divisi.trim(),
    no_telp: formData.no_telp.trim(),
  };
};

// ============================================================================
// COMPONENTS: ICON
// ============================================================================

const EyeOffIcon = () => {
  return (
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
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
};

// ============================================================================
// COMPONENT: DATA KARYAWAN HRD
// ============================================================================

const DataKaryawanHRD = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [karyawanList, setKaryawanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang");
  const [showFilter, setShowFilter] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const cabangUtamaList = useMemo(() => {
    return cabangList.filter((cabang) => !cabang.parent_id);
  }, [cabangList]);

  const cabangOptions = useMemo(() => {
    if (formData.role === "managerCabang") {
      return cabangUtamaList;
    }

    return cabangList;
  }, [cabangList, cabangUtamaList, formData.role]);

  const filteredData = useMemo(() => {
    return karyawanList.filter((karyawan) => {
      return (
        selectedCabang === "Semua Cabang" ||
        karyawan.cabang?.nama === selectedCabang
      );
    });
  }, [karyawanList, selectedCabang]);

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

  // Membuka halaman detail karyawan dengan membawa data karyawan yang dipilih.
  const handleRowClick = (karyawan) => {
    navigate("/hrd/detailkaryawan", {
      state: {
        employee: karyawan,
      },
    });
  };

  // ============================================================================
  // HANDLERS: FORM STATE
  // ============================================================================

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  const updateFormField = (field, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value,
    }));
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  // Mengubah role sekaligus mengosongkan cabang agar pilihan penempatan tetap valid.
  const handleRoleChange = (role) => {
    setFormData((previousData) => ({
      ...previousData,
      role,
      cabang_id: "",
    }));
  };

  // Membatasi input NIK hanya angka agar validasi 8 digit lebih konsisten.
  const handleNikInput = (event) => {
    const numericValue = event.target.value.replace(/[^0-9]/g, "");

    event.target.value = numericValue;
    updateFormField("nik", numericValue);
  };

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Mengambil data cabang dan karyawan dari backend.
  const fetchData = async () => {
    try {
      setLoading(true);

      const resCabang = await fetch(`${API_BASE_URL}/api/cabang`, {
        headers: getAuthHeaders(),
      });

      if (isAuthError(resCabang.status)) {
        handleLogout();
        return;
      }

      const dataCabang = await resCabang.json();

      if (!resCabang.ok) {
        throw new Error(dataCabang.message || "Gagal mengambil data cabang");
      }

      const resKaryawan = await fetch(`${API_BASE_URL}/api/karyawan`, {
        headers: getAuthHeaders(),
      });

      if (isAuthError(resKaryawan.status)) {
        handleLogout();
        return;
      }

      const dataKaryawan = await resKaryawan.json();

      if (!resKaryawan.ok) {
        throw new Error(
          dataKaryawan.message || "Gagal mengambil data karyawan"
        );
      }

      setCabangList(Array.isArray(dataCabang) ? dataCabang : []);
      setKaryawanList(Array.isArray(dataKaryawan) ? dataKaryawan : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(error.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================================
  // VALIDATION & SUBMIT
  // ============================================================================

  // Memvalidasi input tambah karyawan sebelum dikirim ke backend.
  const validateForm = () => {
    if (!formData.nama.trim()) {
      alert("Nama lengkap wajib diisi.");
      return false;
    }

    if (!/^\d{8}$/.test(formData.nik)) {
      alert("NIK harus berupa angka tepat 8 digit.");
      return false;
    }

    if (!formData.password.trim()) {
      alert("Password login wajib diisi.");
      return false;
    }

    if (!formData.role) {
      alert("Hak akses wajib dipilih.");
      return false;
    }

    if (!formData.cabang_id) {
      alert("Pilih cabang penempatan terlebih dahulu.");
      return false;
    }

    if (formData.role === "managerCabang") {
      const selectedBranch = cabangList.find((cabang) => {
        return Number(cabang.id) === Number(formData.cabang_id);
      });

      if (selectedBranch?.parent_id) {
        alert(
          "Manager Cabang hanya boleh ditempatkan pada cabang utama, bukan sub-cabang."
        );
        return false;
      }
    }

    return true;
  };

  // Menyimpan data karyawan baru ke backend.
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = buildEmployeePayload(formData);

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/api/karyawan`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (isAuthError(response.status)) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        alert(
          result.detail
            ? `${result.message}\n\n${result.detail}`
            : result.message || "Gagal menyimpan data."
        );
        return;
      }

      alert("Karyawan berhasil ditambahkan.");
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
      alert("Kesalahan jaringan. Pastikan backend sedang berjalan.");
    } finally {
      setSaving(false);
    }
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
  // RENDER HELPERS: FILTER
  // ============================================================================

  const toggleFilter = () => {
    setShowFilter((previousValue) => !previousValue);
  };

  const handleSelectCabang = (cabangName) => {
    setSelectedCabang(cabangName);
    setShowFilter(false);
  };

  const renderFilterDropdown = () => {
    if (!showFilter) {
      return null;
    }

    return (
      <div className="filter-dropdown">
        <div
          className="dropdown-item"
          onClick={() => handleSelectCabang("Semua Cabang")}
        >
          Semua Cabang
        </div>

        {cabangList.map((cabang) => (
          <div
            key={cabang.id}
            className="dropdown-item"
            onClick={() => handleSelectCabang(cabang.nama)}
          >
            {cabang.nama}
          </div>
        ))}
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: TABLE
  // ============================================================================

  const renderEmptyTableRow = (message) => {
    return (
      <tr>
        <td
          colSpan="10"
          style={{
            textAlign: "center",
            padding: "30px",
            color: "#666",
          }}
        >
          {message}
        </td>
      </tr>
    );
  };

  const renderEmployeeRow = (karyawan) => {
    const isActive = karyawan.status === "Aktif" || !karyawan.status;

    return (
      <tr key={karyawan.id} onClick={() => handleRowClick(karyawan)}>
        <td className="dk-td-name">{karyawan.nama}</td>
        <td>{karyawan.jabatan || "-"}</td>
        <td>{karyawan.roleLabel || getRoleLabel(karyawan.role)}</td>
        <td>{karyawan.nik}</td>
        <td>
          <div className="dk-pwd-mask">
            <span>........</span>
            <EyeOffIcon />
          </div>
        </td>
        <td>{karyawan.cabang?.nama || "-"}</td>
        <td>{karyawan.tempat_lahir || "-"}</td>
        <td>{karyawan.tanggal_lahir || "-"}</td>
        <td>{karyawan.alamat || "-"}</td>
        <td className="text-center">
          <span
            className={`status-dot ${isActive ? "active" : "inactive"}`}
          ></span>
        </td>
      </tr>
    );
  };

  const renderTableBody = () => {
    if (loading) {
      return renderEmptyTableRow("Memuat data...");
    }

    if (filteredData.length === 0) {
      return renderEmptyTableRow("Tidak ada karyawan.");
    }

    return filteredData.map((karyawan) => renderEmployeeRow(karyawan));
  };

  // ============================================================================
  // RENDER HELPERS: FORM
  // ============================================================================

  const renderRoleNote = () => {
    if (formData.role === "hrd") {
      return (
        <small
          style={{
            color: "#d9480f",
            fontWeight: "600",
          }}
        >
          Catatan: HRD aktif hanya boleh 1 orang.
        </small>
      );
    }

    if (formData.role === "managerCabang") {
      return (
        <small
          style={{
            color: "#d9480f",
            fontWeight: "600",
          }}
        >
          Manager Cabang hanya boleh ditempatkan di cabang utama.
        </small>
      );
    }

    return null;
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
        <header className="dk-header-area">
          <h1 className="dk-title">Data Karyawan</h1>
          <p className="dk-subtitle">
            Daftar pusat informasi dan detail administrasi karyawan
          </p>
        </header>

        <div className="dk-action-row">
          <div className="dk-action-group">
            <div className="filter-wrapper">
              <button className="btn-dk-filter" onClick={toggleFilter}>
                {selectedCabang}
                <img
                  src={iconBawah}
                  alt="v"
                  style={{
                    width: "10px",
                    filter: "brightness(0) invert(1)",
                    transform: showFilter ? "rotate(180deg)" : "none",
                    transition: "0.2s",
                  }}
                />
              </button>

              {renderFilterDropdown()}
            </div>

            <button className="btn-dk-tambah" onClick={handleOpenModal}>
              <img src={iconTambah} alt="+" /> Tambah Karyawan
            </button>
          </div>
        </div>

        <div className="dk-table-container">
          <div className="dk-table-header-title">Daftar Karyawan</div>

          <div className="dk-table-wrapper">
            <table className="dk-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Hak Akses</th>
                  <th>NIK (Username)</th>
                  <th>Password</th>
                  <th>Cabang</th>
                  <th>Tempat Lahir</th>
                  <th>Tanggal Lahir</th>
                  <th>Alamat</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay-clean" onClick={handleCloseModal}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="modal-title">Tambah Karyawan Baru</h2>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    className="input-edit"
                    required
                    value={formData.nama}
                    onChange={(event) =>
                      updateFormField("nama", event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>NIK (Username)</label>
                  <input
                    type="text"
                    className="input-edit"
                    placeholder="Wajib 8 digit angka"
                    required
                    pattern="\d{8}"
                    maxLength="8"
                    minLength="8"
                    title="NIK harus berisi 8 digit angka."
                    value={formData.nik}
                    onInput={handleNikInput}
                  />
                </div>

                <div className="form-group">
                  <label>Password Login</label>
                  <input
                    type="text"
                    className="input-edit"
                    required
                    value={formData.password}
                    onChange={(event) =>
                      updateFormField("password", event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hak Akses</label>
                  <select
                    className="input-edit"
                    required
                    value={formData.role}
                    onChange={(event) => handleRoleChange(event.target.value)}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>

                  {renderRoleNote()}
                </div>

                <div className="form-group">
                  <label>Penempatan Cabang</label>
                  <select
                    className="input-edit"
                    required
                    value={formData.cabang_id}
                    onChange={(event) =>
                      updateFormField("cabang_id", event.target.value)
                    }
                  >
                    <option value="">Pilih Cabang...</option>

                    {cabangOptions.map((cabang) => (
                      <option key={cabang.id} value={cabang.id}>
                        {cabang.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status Karyawan</label>
                  <select
                    className="input-edit"
                    required
                    value={formData.status}
                    onChange={(event) =>
                      updateFormField("status", event.target.value)
                    }
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>No. Telepon / WA</label>
                  <input
                    type="text"
                    className="input-edit"
                    value={formData.no_telp}
                    onChange={(event) =>
                      updateFormField("no_telp", event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Jabatan</label>
                  <input
                    type="text"
                    className="input-edit"
                    placeholder="Misal: Staff IT"
                    value={formData.jabatan}
                    onChange={(event) =>
                      updateFormField("jabatan", event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Divisi</label>
                  <input
                    type="text"
                    className="input-edit"
                    placeholder="Misal: Operasional"
                    value={formData.divisi}
                    onChange={(event) =>
                      updateFormField("divisi", event.target.value)
                    }
                  />
                </div>
              </div>

              <div
                className="detail-footer"
                style={{
                  marginTop: "20px",
                  paddingBottom: "0",
                }}
              >
                <button
                  type="button"
                  className="btn-batal"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button type="submit" className="btn-simpan" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKaryawanHRD;