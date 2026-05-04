import React, { useState, useEffect } from "react";
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

const MENU_ITEMS = [
  { path: "/hrd/dashboard", icon: iconDashboard, text: "Dashboard" },
  { path: "/hrd/kelolacabang", icon: iconKelola, text: "Kelola Cabang" },
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
  { path: "/hrd/laporan", icon: iconLaporan, text: "Laporan" },
];

const ROLE_OPTIONS = [
  { value: "karyawan", label: "Karyawan" },
  { value: "managerCabang", label: "Manager Cabang" },
  { value: "hrd", label: "HRD" },
];

const getRoleLabel = (role) => {
  if (role === "hrd") return "HRD";
  if (role === "managerCabang") return "Manager Cabang";
  return "Karyawan";
};

const EyeOffIcon = () => (
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

const DataKaryawanHRD = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const [karyawanList, setKaryawanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCabang, setSelectedCabang] = useState("Semua Cabang");
  const [showFilter, setShowFilter] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    password: "",
    role: "karyawan",
    cabang_id: "",
    jabatan: "",
    divisi: "",
    no_telp: "",
    status: "Aktif",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const resCabang = await fetch(
        import.meta.env.VITE_API_URL + "/api/cabang",
        {
          headers: getAuthHeaders(),
        }
      );

      if (resCabang.status === 401 || resCabang.status === 403) {
        logout();
        navigate("/auth/login");
        return;
      }

      const dataCabang = await resCabang.json();

      if (!resCabang.ok) {
        throw new Error(dataCabang.message || "Gagal mengambil data cabang");
      }

      const resKaryawan = await fetch(
        import.meta.env.VITE_API_URL + "/api/karyawan",
        {
          headers: getAuthHeaders(),
        }
      );

      if (resKaryawan.status === 401 || resKaryawan.status === 403) {
        logout();
        navigate("/auth/login");
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
    } catch (err) {
      console.error("Error fetching data:", err);
      alert(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleRowClick = (karyawan) => {
    navigate("/hrd/detailkaryawan", { state: { employee: karyawan } });
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      nik: "",
      password: "",
      role: "karyawan",
      cabang_id: "",
      jabatan: "",
      divisi: "",
      no_telp: "",
      status: "Aktif",
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    resetForm();
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      cabang_id: "",
    }));
  };

  const cabangUtamaList = cabangList.filter((c) => !c.parent_id);

  const cabangOptions =
    formData.role === "managerCabang" ? cabangUtamaList : cabangList;

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    if (!/^\d{8}$/.test(formData.nik)) {
      alert("NIK harus berupa angka tepat 8 digit.");
      return;
    }

    if (!formData.password.trim()) {
      alert("Password login wajib diisi.");
      return;
    }

    if (!formData.role) {
      alert("Hak akses wajib dipilih.");
      return;
    }

    if (!formData.cabang_id) {
      alert("Pilih cabang penempatan terlebih dahulu.");
      return;
    }

    if (formData.role === "managerCabang") {
      const selectedBranch = cabangList.find(
        (c) => Number(c.id) === Number(formData.cabang_id)
      );

      if (selectedBranch?.parent_id) {
        alert(
          "Manager Cabang hanya boleh ditempatkan pada cabang utama, bukan sub-cabang."
        );
        return;
      }
    }

    const payload = {
      ...formData,
      nama: formData.nama.trim(),
      nik: formData.nik.trim(),
      password: formData.password.trim(),
      jabatan: formData.jabatan.trim(),
      divisi: formData.divisi.trim(),
      no_telp: formData.no_telp.trim(),
    };

    try {
      setSaving(true);

      const res = await fetch(import.meta.env.VITE_API_URL + "/api/karyawan", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/auth/login");
        return;
      }

      if (!res.ok) {
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
    } catch (err) {
      console.error("Kesalahan jaringan:", err);
      alert("Kesalahan jaringan. Pastikan backend sedang berjalan.");
    } finally {
      setSaving(false);
    }
  };

  const filteredData = karyawanList.filter((k) => {
    return (
      selectedCabang === "Semua Cabang" || k.cabang?.nama === selectedCabang
    );
  });

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
          ))}
        </nav>

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
              <button
                className="btn-dk-filter"
                onClick={() => setShowFilter(!showFilter)}
              >
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

              {showFilter && (
                <div className="filter-dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCabang("Semua Cabang");
                      setShowFilter(false);
                    }}
                  >
                    Semua Cabang
                  </div>

                  {cabangList.map((c) => (
                    <div
                      key={c.id}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedCabang(c.nama);
                        setShowFilter(false);
                      }}
                    >
                      {c.nama}
                    </div>
                  ))}
                </div>
              )}
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

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#666",
                      }}
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#666",
                      }}
                    >
                      Tidak ada karyawan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((k) => {
                    const isActive = k.status === "Aktif" || !k.status;

                    return (
                      <tr key={k.id} onClick={() => handleRowClick(k)}>
                        <td className="dk-td-name">{k.nama}</td>
                        <td>{k.jabatan || "-"}</td>
                        <td>{k.roleLabel || getRoleLabel(k.role)}</td>
                        <td>{k.nik}</td>
                        <td>
                          <div className="dk-pwd-mask">
                            <span>........</span> <EyeOffIcon />
                          </div>
                        </td>
                        <td>{k.cabang?.nama || "-"}</td>
                        <td>{k.tempat_lahir || "-"}</td>
                        <td>{k.tanggal_lahir || "-"}</td>
                        <td>{k.alamat || "-"}</td>
                        <td className="text-center">
                          <span
                            className={`status-dot ${
                              isActive ? "active" : "inactive"
                            }`}
                          ></span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay-clean" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
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
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, nik: e.target.value });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Password Login</label>
                  <input
                    type="text"
                    className="input-edit"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hak Akses</label>
                  <select
                    className="input-edit"
                    required
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>

                  {formData.role === "hrd" && (
                    <small style={{ color: "#d9480f", fontWeight: "600" }}>
                      Catatan: HRD aktif hanya boleh 1 orang.
                    </small>
                  )}

                  {formData.role === "managerCabang" && (
                    <small style={{ color: "#d9480f", fontWeight: "600" }}>
                      Manager Cabang hanya boleh ditempatkan di cabang utama.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Penempatan Cabang</label>
                  <select
                    className="input-edit"
                    required
                    value={formData.cabang_id}
                    onChange={(e) =>
                      setFormData({ ...formData, cabang_id: e.target.value })
                    }
                  >
                    <option value="">Pilih Cabang...</option>
                    {cabangOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama}
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
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
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
                    onChange={(e) =>
                      setFormData({ ...formData, no_telp: e.target.value })
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
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
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
                    onChange={(e) =>
                      setFormData({ ...formData, divisi: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                className="detail-footer"
                style={{ marginTop: "20px", paddingBottom: "0" }}
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