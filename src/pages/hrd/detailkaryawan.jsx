import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { getAuthHeaders } from "../../context/AuthHeaders";
import "./datakaryawan.css";

import iconDashboard from "../../assets/dashboard.svg";
import iconKelola from "../../assets/kelola.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconKehadiran from "../../assets/kehadiran.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

// ============================================================================
// CONFIG: SUPABASE & API
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AUTH_ERROR_STATUSES = [401, 403];

const MAX_DOCUMENT_SIZE = 2 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const ALLOWED_FILE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "pdf",
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

const DOCUMENT_LIST = [
  {
    label: "Foto Profil Karyawan",
    dbKey: "foto_karyawan",
  },
  {
    label: "Kartu Tanda Penduduk (KTP)",
    dbKey: "ktp",
  },
  {
    label: "Kartu Keluarga (KK)",
    dbKey: "kk",
  },
  {
    label: "SKCK",
    dbKey: "skck",
  },
  {
    label: "Surat Izin Mengemudi (SIM)",
    dbKey: "sim",
  },
  {
    label: "Sertifikat Pendukung",
    dbKey: "sertifikat",
  },
  {
    label: "Dokumen Tambahan",
    dbKey: "dokumen_tambahan",
  },
];

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

// Menghapus sesi lokal dan mengarahkan pengguna ke halaman login.
const clearSessionAndRedirect = (navigate) => {
  localStorage.removeItem("user");
  localStorage.removeItem("session_token");
  navigate("/auth/login");
};

// Membaca data user yang tersimpan di localStorage dengan aman.
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// Membuat nama file aman untuk kebutuhan upload dokumen.
const createSafeFileName = ({ employeeName, nik, dbColumnName, extension }) => {
  const safeName = (employeeName || "karyawan")
    .replace(/\s+/g, "_")
    .toLowerCase();

  const safeNik = nik || "tanpa_nik";

  return `${safeName}_${safeNik}_${dbColumnName}_${Date.now()}.${extension}`;
};

// ============================================================================
// COMPONENTS: ICON
// ============================================================================

const EyeOpenIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
};

const EyeOffIcon = () => {
  return (
    <svg
      width="20"
      height="20"
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

const EditIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
};

// ============================================================================
// COMPONENT: DETAIL KARYAWAN
// ============================================================================

const DetailKaryawan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;

  const storedUser = getStoredUser();
  const isManager = storedUser.role === "managerCabang";
  const isHrd = storedUser.role === "hrd";
  const basePath = isManager ? "/managerCabang" : "/hrd";
  const canEdit = isHrd && !isManager;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(employee || {});
  const [showPassword, setShowPassword] = useState(false);
  const [cabangList, setCabangList] = useState([]);
  const [uploadingState, setUploadingState] = useState("");
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = useMemo(() => {
    if (isManager) {
      return [
        {
          path: "/managerCabang/dashboard",
          icon: iconDashboard,
          text: "Dashboard",
          show: true,
        },
        {
          path: "/managerCabang/datakaryawan",
          icon: iconKaryawan,
          text: "Data Karyawan",
          show: true,
          active: true,
        },
        {
          path: "/managerCabang/perizinan",
          icon: iconKehadiran,
          text: "Perizinan",
          show: true,
        },
        {
          path: "/managerCabang/laporan",
          icon: iconLaporan,
          text: "Laporan",
          show: true,
        },
      ];
    }

    return [
      {
        path: "/hrd/dashboard",
        icon: iconDashboard,
        text: "Dashboard",
        show: true,
      },
      {
        path: "/hrd/kelolacabang",
        icon: iconKelola,
        text: "Kelola Cabang",
        show: true,
      },
      {
        path: "/hrd/datakaryawan",
        icon: iconKaryawan,
        text: "Data Karyawan",
        show: true,
        active: true,
      },
      {
        path: "/hrd/kehadiran",
        icon: iconKehadiran,
        text: "Kehadiran",
        show: true,
        hasArrow: true,
      },
      {
        path: "/hrd/laporan",
        icon: iconLaporan,
        text: "Laporan",
        show: true,
      },
    ];
  }, [isManager]);

  const cabangUtamaList = useMemo(() => {
    return cabangList.filter((cabang) => !cabang.parent_id);
  }, [cabangList]);

  const cabangOptions = useMemo(() => {
    if (formData.role === "managerCabang") {
      return cabangUtamaList;
    }

    return cabangList;
  }, [cabangList, cabangUtamaList, formData.role]);

  // ============================================================================
  // HANDLERS: AUTH & NAVIGATION
  // ============================================================================

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

  // Menghapus sesi pengguna dan mengarahkan kembali ke halaman login.
  const handleLogout = () => {
    clearSessionAndRedirect(navigate);
  };

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Mengambil daftar cabang untuk kebutuhan pilihan penempatan karyawan.
  const fetchCabang = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cabang`, {
        headers: getAuthHeaders(),
      });

      if (isAuthError(response.status)) {
        clearSessionAndRedirect(navigate);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data cabang.");
      }

      setCabangList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil cabang:", error);
    }
  };

  useEffect(() => {
    fetchCabang();
  }, [navigate]);

  // ============================================================================
  // HANDLERS: FORM
  // ============================================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Membatasi input NIK hanya angka ketika form sedang dalam mode edit.
  const handleNikChange = (event) => {
    if (!isEditing) {
      return;
    }

    event.target.value = event.target.value.replace(/[^0-9]/g, "");
    handleInputChange(event);
  };

  // Mengubah role sekaligus memastikan Manager Cabang tidak memakai sub-cabang.
  const handleRoleChange = (event) => {
    const newRole = event.target.value;

    setFormData((previousData) => {
      const selectedBranch = cabangList.find((cabang) => {
        return Number(cabang.id) === Number(previousData.cabang_id);
      });

      const shouldResetCabang =
        newRole === "managerCabang" && selectedBranch?.parent_id;

      return {
        ...previousData,
        role: newRole,
        cabang_id: shouldResetCabang ? "" : previousData.cabang_id,
      };
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((previousValue) => !previousValue);
  };

  const cancelOrBack = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    navigate(-1);
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  // Memvalidasi data karyawan sebelum perubahan disimpan ke backend.
  const validateEmployeeForm = () => {
    if (!canEdit) {
      alert("Manager Cabang hanya memiliki akses melihat data.");
      return false;
    }

    if (!formData.nama?.trim()) {
      alert("Nama lengkap wajib diisi.");
      return false;
    }

    if (!/^\d{8}$/.test(formData.nik || "")) {
      alert("Simpan gagal: NIK harus berupa angka tepat 8 digit.");
      return false;
    }

    if (!formData.password?.trim()) {
      alert("Password wajib diisi.");
      return false;
    }

    if (!formData.role) {
      alert("Hak Akses wajib dipilih.");
      return false;
    }

    if (!formData.cabang_id) {
      alert("Cabang penempatan wajib dipilih.");
      return false;
    }

    if (!["Aktif", "Nonaktif"].includes(formData.status || "Aktif")) {
      alert("Status karyawan hanya boleh Aktif atau Nonaktif.");
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

  // Memvalidasi file dokumen sebelum diunggah ke Supabase Storage.
  const validateDocumentFile = (file) => {
    if (!canEdit) {
      alert("Anda tidak memiliki akses untuk mengubah dokumen.");
      return false;
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      alert("File terlalu besar! Maksimal ukuran file adalah 2 MB.");
      return false;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isAllowedType = ALLOWED_FILE_TYPES.includes(file.type);
    const isAllowedExtension = ALLOWED_FILE_EXTENSIONS.includes(fileExtension);

    if (!isAllowedType || !isAllowedExtension) {
      alert(
        "Format file tidak didukung! Silakan kirim ulang format JPG, JPEG, PNG, atau PDF."
      );
      return false;
    }

    return true;
  };

  // ============================================================================
  // HANDLERS: FILE UPLOAD
  // ============================================================================

  // Mengunggah dokumen karyawan ke Supabase lalu menyimpan public URL ke form.
  const handleFileUpload = async (event, dbColumnName) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!validateDocumentFile(file)) {
      event.target.value = null;
      return;
    }

    try {
      setUploadingState(`Sedang mengunggah file untuk ${dbColumnName}...`);

      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileName = createSafeFileName({
        employeeName: formData.nama,
        nik: formData.nik,
        dbColumnName,
        extension: fileExtension,
      });

      const { error: uploadError } = await supabase.storage
        .from("dokumen_karyawan")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("dokumen_karyawan")
        .getPublicUrl(fileName);

      setFormData((previousData) => ({
        ...previousData,
        [dbColumnName]: publicUrlData.publicUrl,
      }));
    } catch (error) {
      console.error("Error upload:", error);
      alert(
        "Gagal mengunggah file. Pastikan bucket dokumen_karyawan dan policy storage Supabase sudah benar."
      );
    } finally {
      setUploadingState("");
    }
  };

  // ============================================================================
  // HANDLERS: SAVE
  // ============================================================================

  // Menyimpan perubahan data karyawan ke backend.
  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!validateEmployeeForm()) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/api/karyawan/${formData.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (isAuthError(response.status)) {
        clearSessionAndRedirect(navigate);
        return;
      }

      if (!response.ok) {
        alert(
          result.detail
            ? `${result.message}\n\n${result.detail}`
            : result.message || "Gagal menyimpan perubahan."
        );
        return;
      }

      alert("Data karyawan berhasil diperbarui.");
      setIsEditing(false);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Terjadi kesalahan jaringan. Pastikan backend sedang berjalan.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS: FALLBACK
  // ============================================================================

  const renderEmployeeNotFound = () => {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          fontFamily: "Inter",
        }}
      >
        <h2>Data Karyawan Tidak Ditemukan</h2>
        <p>Silakan kembali ke halaman Data Karyawan.</p>

        <button
          onClick={() => navigate(`${basePath}/datakaryawan`)}
          className="btn-batal"
          style={{
            marginTop: "20px",
          }}
        >
          Kembali
        </button>
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: SIDEBAR
  // ============================================================================

  const renderMenuItems = () => {
    return menuItems
      .filter((item) => item.show)
      .map((item) => (
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
            <img src={iconBawah} alt="" className="arrow-icon-main" />
          )}
        </div>
      ));
  };

  // ============================================================================
  // RENDER HELPERS: FORM FIELD
  // ============================================================================

  const getInputClassName = () => {
    return isEditing ? "input-edit" : "input-read";
  };

  const renderTextInput = ({
    label,
    name,
    type = "text",
    required = false,
    placeholder,
    style,
    onChange = handleInputChange,
  }) => {
    return (
      <div className="form-group">
        <label>{label}</label>

        <input
          name={name}
          type={type}
          className={getInputClassName()}
          readOnly={!isEditing}
          value={formData[name] || ""}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          style={style}
        />
      </div>
    );
  };

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

  const renderCabangField = () => {
    return (
      <div className="form-group">
        <label>Cabang Penempatan</label>

        {isEditing ? (
          <select
            name="cabang_id"
            className="input-edit"
            value={formData.cabang_id || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Pilih Cabang...</option>

            {cabangOptions.map((cabang) => (
              <option key={cabang.id} value={cabang.id}>
                {cabang.nama}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="input-read"
            readOnly
            value={formData.cabang?.nama || "-"}
          />
        )}
      </div>
    );
  };

  const renderPasswordField = () => {
    return (
      <div className="form-group">
        <label>Password</label>

        <div className="pwd-wrapper">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            className={getInputClassName()}
            readOnly={!isEditing}
            value={formData.password || ""}
            onChange={handleInputChange}
            required
          />

          <button
            type="button"
            className="btn-eye"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOpenIcon /> : <EyeOffIcon />}
          </button>
        </div>
      </div>
    );
  };

  const renderGenderField = () => {
    return (
      <div className="form-group">
        <label>Jenis Kelamin</label>

        {isEditing ? (
          <select
            name="jenis_kelamin"
            className="input-edit"
            value={formData.jenis_kelamin || ""}
            onChange={handleInputChange}
          >
            <option value="">Pilih...</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        ) : (
          <input
            type="text"
            className="input-read"
            readOnly
            value={formData.jenis_kelamin || "-"}
          />
        )}
      </div>
    );
  };

  const renderStatusField = () => {
    return (
      <div className="form-group">
        <label>Status Karyawan</label>

        {isEditing ? (
          <select
            name="status"
            className="input-edit"
            value={formData.status || "Aktif"}
            onChange={handleInputChange}
          >
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        ) : (
          <input
            type="text"
            className="input-read"
            readOnly
            value={formData.status || "Aktif"}
            style={{
              color: formData.status === "Nonaktif" ? "#e74c3c" : "#2fb800",
              fontWeight: "700",
            }}
          />
        )}
      </div>
    );
  };

  const renderRoleField = () => {
    return (
      <div className="form-group">
        <label>Hak Akses</label>

        {isEditing ? (
          <>
            <select
              name="role"
              className="input-edit"
              value={formData.role || "karyawan"}
              onChange={handleRoleChange}
              required
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            {renderRoleNote()}
          </>
        ) : (
          <input
            type="text"
            className="input-read"
            readOnly
            value={getRoleLabel(formData.role)}
            style={{
              fontWeight: "700",
              color:
                formData.role === "hrd"
                  ? "#c92a2a"
                  : formData.role === "managerCabang"
                    ? "#1565c0"
                    : "#2fb800",
            }}
          />
        )}
      </div>
    );
  };

  const renderAddressField = () => {
    return (
      <div
        className="form-group"
        style={{
          gridColumn: "1 / -1",
        }}
      >
        <label>Alamat</label>

        <input
          name="alamat"
          type="text"
          className={getInputClassName()}
          readOnly={!isEditing}
          value={formData.alamat || ""}
          onChange={handleInputChange}
        />
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: DOCUMENTS
  // ============================================================================

  const renderDocumentContent = (documentItem) => {
    if (isEditing) {
      return (
        <label className="doc-upload-area">
          {formData[documentItem.dbKey] ? (
            <span className="doc-upload-success">
              Dokumen Berhasil Diunggah
            </span>
          ) : (
            <span className="doc-upload-placeholder">
              Pilih/Upload Dokumen
            </span>
          )}

          <input
            type="file"
            className="doc-file-input"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={(event) => handleFileUpload(event, documentItem.dbKey)}
          />

          <small className="doc-upload-note">
            Max 2MB (JPG/PNG/PDF)
          </small>
        </label>
      );
    }

    if (formData[documentItem.dbKey]) {
      return (
        <a
          href={formData[documentItem.dbKey]}
          target="_blank"
          rel="noreferrer"
          className="doc-link"
        >
          Lihat Dokumen
        </a>
      );
    }

    return (
      <span className="doc-empty-text">
        Belum ada dokumen
      </span>
    );
  };

  const renderDocumentCard = (documentItem) => {
    return (
      <div key={documentItem.dbKey} className="doc-box">
        <span className="doc-label">{documentItem.label}</span>

        <div
          className={`doc-card ${isEditing ? "doc-card-editable" : ""}`}
          style={{
            backgroundColor: isEditing ? "#fff" : "#f9f9f9",
            border:
              isEditing && formData[documentItem.dbKey]
                ? "1px solid #2fb800"
                : "1px solid #ddd",
          }}
        >
          {renderDocumentContent(documentItem)}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!employee) {
    return renderEmployeeNotFound();
  }

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
          <div className="dk-title-group">
            <h1 className="dk-title">Detail Karyawan</h1>
            <p className="dk-subtitle">
              Informasi profil {formData.nama || "karyawan"}
            </p>
          </div>
        </header>

        <div className="dk-action-row">
          <div
            className="dk-action-group"
            style={{
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {canEdit && !isEditing && (
              <button
                className="btn-edit-outline"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon />
                Edit Data
              </button>
            )}
          </div>
        </div>

        {uploadingState && (
          <div
            style={{
              padding: "12px",
              background: "#eaf4d1",
              color: "#2fb800",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "bold",
              border: "1px solid #b2f2bb",
            }}
          >
            {uploadingState}
          </div>
        )}

        <form onSubmit={handleSaveEdit}>
          <div className="detail-form-grid">
            {renderTextInput({
              label: "Nama Lengkap",
              name: "nama",
              required: true,
            })}

            <div className="form-group">
              <label>NIK (Username)</label>

              <input
                name="nik"
                type="text"
                className={getInputClassName()}
                readOnly={!isEditing}
                value={formData.nik || ""}
                onChange={handleNikChange}
                required
                pattern="\d{8}"
                maxLength="8"
                minLength="8"
                title="NIK harus berisi 8 digit angka."
                placeholder="Wajib 8 digit angka"
              />
            </div>

            {renderCabangField()}

            {renderTextInput({
              label: "Jabatan",
              name: "jabatan",
            })}

            {renderTextInput({
              label: "Tanggal Masuk",
              name: "tanggal_masuk",
              type: isEditing ? "date" : "text",
            })}

            {renderTextInput({
              label: "Divisi",
              name: "divisi",
            })}

            {renderPasswordField()}

            {renderTextInput({
              label: "Tempat Lahir",
              name: "tempat_lahir",
            })}

            {renderTextInput({
              label: "Tanggal Lahir",
              name: "tanggal_lahir",
              type: isEditing ? "date" : "text",
            })}

            {renderGenderField()}

            {renderStatusField()}

            {renderRoleField()}

            {renderAddressField()}
          </div>

          <div className="docs-section">
            <h4 className="docs-title">Dokumen Pendukung</h4>

            <div className="docs-grid">
              {DOCUMENT_LIST.map((documentItem) =>
                renderDocumentCard(documentItem)
              )}
            </div>
          </div>

          <div className="detail-footer">
            {isEditing && canEdit && (
              <button type="submit" className="btn-simpan" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            )}

            <button
              type="button"
              className="btn-batal"
              disabled={saving}
              onClick={cancelOrBack}
            >
              {isEditing ? "Batal" : "Kembali"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DetailKaryawan;