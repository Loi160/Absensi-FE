import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const sortData = (dataArray) => {
  return [...dataArray].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return b.rawDate - a.rawDate;
  });
};

const getBadgeClass = (tipe) => {
  if (!tipe) return "lainnya";
  const lower = tipe.toLowerCase();
  if (lower.includes("sakit")) return "sakit";
  if (lower.includes("pribadi")) return "pribadi";
  if (lower.includes("keluar")) return "keluar";
  if (lower.includes("pulang")) return "pulang";
  if (lower.includes("khusus")) return "khusus";
  if (lower.includes("tahunan")) return "tahunan";
  return "lainnya";
};

const Kehadiran = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("perizinan");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(true);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

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

  const [tanggalAbsen, setTanggalAbsen] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [searchKaryawan, setSearchKaryawan] = useState("");
  const [showKaryawanDropdown, setShowKaryawanDropdown] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); 

  const fetchData = async () => {
    try {
      setLoading(true);
      const resCabang = await fetch(import.meta.env.VITE_API_URL + "/api/cabang");
      const listCabang = await resCabang.json();
      setCabangList(Array.isArray(listCabang) ? listCabang.map((c) => c.nama) : []);

      const resKaryawan = await fetch(import.meta.env.VITE_API_URL + "/api/karyawan");
      const listKaryawan = await resKaryawan.json();
      setKaryawanList(Array.isArray(listKaryawan) ? listKaryawan : []);

      const resPerizinan = await fetch(import.meta.env.VITE_API_URL + "/api/perizinan/all");
      const allPerizinan = await resPerizinan.json();

      const harian = [];
      const fimtk = [];
      const cuti = [];

      if (Array.isArray(allPerizinan)) {
        allPerizinan.forEach((p) => {
          const mappedData = {
            id: p.id,
            nama: p.users?.nama || "Unknown",
            cabang: p.users?.cabang?.nama || "-",
            jabatan: p.users?.jabatan || "-",
            divisi: p.users?.divisi || "-",
            noTelp: p.users?.no_telp || "-",
            tipeIzin: p.jenis_izin,
            keterangan: p.keterangan || p.keperluan,
            tglMulai: formatDateIndo(p.tanggal_mulai),
            tglSelesai: formatDateIndo(p.tanggal_selesai),
            tanggal: formatDateIndo(p.tanggal_mulai),
            jamMulai: p.jam_mulai,
            jamSelesai: p.jam_selesai,
            keperluan: p.keperluan,
            kendaraan: p.kendaraan,
            alasan: p.keterangan,
            status: p.status_approval,
            foto: p.bukti_foto,
            rawDate: new Date(p.created_at).getTime(),
          };

          if (p.kategori === "Izin") harian.push(mappedData);
          else if (p.kategori === "FIMTK") fimtk.push(mappedData);
          else if (p.kategori === "Cuti") cuti.push(mappedData);
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

  useEffect(() => {
    if (selectedKaryawanId) {
      const found = karyawanList.find((k) => String(k.id) === String(selectedKaryawanId));
      setKaryawanDetail(found);
    } else {
      setKaryawanDetail(null);
    }
  }, [selectedKaryawanId, karyawanList]);

  const filteredKaryawanList = karyawanList.filter(
    (k) =>
      (k.nama.toLowerCase().includes(searchKaryawan.toLowerCase()) ||
        k.nik.includes(searchKaryawan)) &&
      (k.status === "Aktif" || !k.status)
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const handleRowClick = (item, type) => {
    setSelectedData(item);
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedData(null);
    setModalType("");
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/perizinan/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_approval: newStatus }),
      });
      if (res.ok) {
        alert(`Berhasil di-${newStatus}`);
        fetchData();
        handleCloseModal();
      } else {
        alert("Gagal mengupdate status.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleAbsenManualSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKaryawanId) {
      alert("Silahkan cari dan pilih karyawan dari dropdown terlebih dahulu!");
      return;
    }

    setLoadingAbsen(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      user_id: selectedKaryawanId,
      tanggal: tanggalAbsen,
      waktu_masuk: data.tipe_absen === "Masuk" ? data.jam_absen : null,
      waktu_pulang: data.tipe_absen === "Pulang" ? data.jam_absen : null,
      keterangan: data.keterangan,
    };

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/absensi/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        e.target.reset();
        setSelectedKaryawanId("");
        setSearchKaryawan("");
        setTanggalAbsen(new Date().toISOString().split("T")[0]);
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingAbsen(false);
    }
  };

  const filterByCabang = (dataArray) => {
    if (selectedFilter === "Semua Cabang") return dataArray;
    return dataArray.filter((item) => item.cabang === selectedFilter);
  };

  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    closeSidebar();
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
          &times;
        </button>
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          <div className="menu-item" onClick={() => handleNav("/hrd/dashboard")}>
            <div className="menu-left">
              <img src={iconDashboard} alt="dash" className="menu-icon-main" />
              <span className="menu-text-main">Dashboard</span>
            </div>
          </div>
          <div className="menu-item" onClick={() => handleNav("/hrd/kelolacabang")}>
            <div className="menu-left">
              <img src={iconKelola} alt="kelola" className="menu-icon-main" />
              <span className="menu-text-main">Kelola Cabang</span>
            </div>
          </div>
          <div className="menu-item" onClick={() => handleNav("/hrd/datakaryawan")}>
            <div className="menu-left">
              <img src={iconKaryawan} alt="karyawan" className="menu-icon-main" />
              <span className="menu-text-main">Data Karyawan</span>
            </div>
          </div>

          <div
            className="menu-item active has-arrow"
            onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
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
              <div
                className={`submenu-item ${activeTab === "absenManual" ? "active-sub" : ""}`}
                onClick={() => handleTabChange("absenManual")}
              >
                <img src={iconAbsen} alt="-" className="submenu-icon" />
                <span>Absen Manual</span>
              </div>
              <div
                className={`submenu-item ${activeTab === "perizinan" ? "active-sub" : ""}`}
                onClick={() => handleTabChange("perizinan")}
              >
                <img src={iconIzin} alt="-" className="submenu-icon" />
                <span>Perizinan</span>
              </div>
            </div>
          )}

          <div className="menu-item" onClick={() => handleNav("/hrd/laporan")}>
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
        {activeTab === "perizinan" && (
          <>
            <div className="header-titles">
              <h1>Perizinan</h1>
              <p>Kelola seluruh permohonan izin dan cuti karyawan</p>
            </div>

            <div className="action-row-perizinan">
              <div className="filter-wrapper">
                <button
                  className="btn-filter-green"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  {selectedFilter}{" "}
                  <img
                    src={iconBawah}
                    alt="v"
                    className={`filter-arrow ${showFilter ? "rotate" : ""}`}
                  />
                </button>
                {showFilter && (
                  <div className="filter-dropdown">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedFilter("Semua Cabang");
                        setShowFilter(false);
                      }}
                    >
                      Semua Cabang
                    </div>
                    {cabangList.map((c) => (
                      <div
                        key={c}
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedFilter(c);
                          setShowFilter(false);
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", marginTop: "50px", color: "#666" }}>
                Memuat data perizinan...
              </div>
            ) : (
              <>
                <h3 className="section-title">Permohonan Izin Harian</h3>
                <div className="perizinan-card">
                  <div className="card-header-green">Permintaan Menunggu Approval</div>
                  <table className="table-izin">
                    <thead>
                      <tr>
                        <th style={{ width: "20%" }}>NAMA</th>
                        <th style={{ width: "15%" }}>MULAI</th>
                        <th style={{ width: "15%" }}>SELESAI</th>
                        <th style={{ width: "15%" }}>TIPE IZIN</th>
                        <th style={{ width: "10%" }} className="text-center">STATUS</th>
                        <th style={{ width: "25%" }} className="text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterByCabang(sortData(dataIzinHarian)).length > 0 ? (
                        filterByCabang(sortData(dataIzinHarian)).map((item) => (
                          <tr
                            key={item.id}
                            className="clickable-row"
                            onClick={() => handleRowClick(item, "harian")}
                          >
                            <td className="clickable-name">{item.nama}</td>
                            <td>{item.tglMulai}</td>
                            <td>{item.tglSelesai}</td>
                            <td>
                              <span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>
                                {item.tipeIzin}
                              </span>
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge-status ${item.status === "Disetujui" ? "approve" : item.status === "Ditolak" ? "reject" : "pending"}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="text-center" onClick={(e) => e.stopPropagation()}>
                              {item.status === "Pending" ? (
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
                              ) : (
                                <span className="text-selesai">- Selesai -</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center empty-state-cell" style={{ padding: "20px" }}>
                            Belum ada data izin harian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <h3 className="section-title">Permohonan Izin Meninggalkan Tempat Kerja</h3>
                <div className="perizinan-card">
                  <div className="card-header-green">Permintaan Menunggu Approval</div>
                  <table className="table-izin">
                    <thead>
                      <tr>
                        <th style={{ width: "20%" }}>NAMA</th>
                        <th style={{ width: "15%" }}>JABATAN</th>
                        <th style={{ width: "15%" }}>TIPE IZIN</th>
                        <th style={{ width: "15%" }}>TANGGAL</th>
                        <th style={{ width: "10%" }} className="text-center">STATUS</th>
                        <th style={{ width: "25%" }} className="text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterByCabang(sortData(dataIzinFIMTK)).length > 0 ? (
                        filterByCabang(sortData(dataIzinFIMTK)).map((item) => (
                          <tr
                            key={item.id}
                            className="clickable-row"
                            onClick={() => handleRowClick(item, "fimtk")}
                          >
                            <td className="clickable-name">{item.nama}</td>
                            <td>{item.jabatan}</td>
                            <td>
                              <span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>
                                {item.tipeIzin}
                              </span>
                            </td>
                            <td>{item.tanggal}</td>
                            <td className="text-center">
                              <span
                                className={`badge-status ${item.status === "Disetujui" ? "approve" : item.status === "Ditolak" ? "reject" : "pending"}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="text-center" onClick={(e) => e.stopPropagation()}>
                              {item.status === "Pending" ? (
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
                              ) : (
                                <span className="text-selesai">- Selesai -</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center empty-state-cell" style={{ padding: "20px" }}>
                            Belum ada data izin FIMTK.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <h3 className="section-title">Permohonan Izin Cuti Karyawan</h3>
                <div className="perizinan-card">
                  <div className="card-header-green">Permintaan Menunggu Approval</div>
                  <table className="table-izin">
                    <thead>
                      <tr>
                        <th style={{ width: "20%" }}>NAMA</th>
                        <th style={{ width: "15%" }}>JABATAN</th>
                        <th style={{ width: "15%" }}>TIPE IZIN</th>
                        <th style={{ width: "15%" }}>MULAI CUTI</th>
                        <th style={{ width: "10%" }} className="text-center">STATUS</th>
                        <th style={{ width: "25%" }} className="text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterByCabang(sortData(dataCuti)).length > 0 ? (
                        filterByCabang(sortData(dataCuti)).map((item) => (
                          <tr
                            key={item.id}
                            className="clickable-row"
                            onClick={() => handleRowClick(item, "cuti")}
                          >
                            <td className="clickable-name">{item.nama}</td>
                            <td>{item.jabatan}</td>
                            <td>
                              <span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>
                                {item.tipeIzin}
                              </span>
                            </td>
                            <td>{item.tglMulai}</td>
                            <td className="text-center">
                              <span
                                className={`badge-status ${item.status === "Disetujui" ? "approve" : item.status === "Ditolak" ? "reject" : "pending"}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="text-center" onClick={(e) => e.stopPropagation()}>
                              {item.status === "Pending" ? (
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
                              ) : (
                                <span className="text-selesai">- Selesai -</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center empty-state-cell" style={{ padding: "20px" }}>
                            Belum ada data izin Cuti.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "absenManual" && (
          <div className="absen-form-wrapper">
            <div className="header-titles">
              <h1>Absensi Manual</h1>
              <p>Formulir penginputan data absensi karyawan secara manual</p>
            </div>

            <form onSubmit={handleAbsenManualSubmit} className="absen-form-grid" style={{ marginTop: "20px" }}>
              <div className="form-group" style={{ position: "relative" }}>
                <label>Nama</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: "100%", paddingRight: "35px", cursor: "text" }}
                    placeholder="Ketik atau pilih Karyawan..."
                    value={searchKaryawan}
                    onChange={(e) => {
                      setSearchKaryawan(e.target.value);
                      setShowKaryawanDropdown(true);
                      if (e.target.value === "") {
                        setSelectedKaryawanId("");
                      }
                    }}
                    onFocus={() => setShowKaryawanDropdown(true)}
                    onBlur={() => setTimeout(() => setShowKaryawanDropdown(false), 200)}
                    required={!selectedKaryawanId}
                  />
                  <svg
                    style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
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

                {showKaryawanDropdown && (
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
                      filteredKaryawanList.map((k) => (
                        <div
                          key={k.id}
                          style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedKaryawanId(k.id);
                            setSearchKaryawan(k.nama);
                            setShowKaryawanDropdown(false);
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9f9f9")}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                        >
                          <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>{k.nama}</div>
                          <div style={{ fontSize: "11px", color: "#888" }}>{k.nik} - {k.cabang?.nama}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "15px", color: "#888", fontSize: "13px", textAlign: "center" }}>
                        Karyawan tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>NIK</label>
                <input
                  type="text"
                  className="input-field"
                  value={karyawanDetail?.nik || ""}
                  readOnly
                  style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                />
              </div>
              <div className="form-group">
                <label>Jabatan</label>
                <input
                  type="text"
                  className="input-field"
                  value={karyawanDetail?.jabatan || ""}
                  readOnly
                  style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                />
              </div>
              <div className="form-group">
                <label>Divisi</label>
                <input
                  type="text"
                  className="input-field"
                  value={karyawanDetail?.divisi || ""}
                  readOnly
                  style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                />
              </div>
              <div className="form-group">
                <label>Tanggal Absensi Manual</label>
                <input
                  type="date"
                  name="tanggal"
                  className="input-field"
                  value={tanggalAbsen}
                  onChange={(e) => setTanggalAbsen(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Jam Absen</label>
                <input type="time" name="jam_absen" className="input-field" required />
              </div>
              <div className="form-group">
                <label>Cabang Penempatan</label>
                <input
                  type="text"
                  className="input-field"
                  value={karyawanDetail?.cabang?.nama || ""}
                  readOnly
                  style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                />
              </div>
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
                  onClick={() => {
                    setSelectedKaryawanId("");
                    setSearchKaryawan("");
                    setTanggalAbsen(new Date().toISOString().split("T")[0]);
                    document.querySelector(".absen-form-grid").reset();
                  }}
                >
                  Batal
                </button>
                <button type="submit" className="btn-simpan-green" disabled={loadingAbsen}>
                  {loadingAbsen ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {showModal && selectedData && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>
                {modalType === "harian" && "Detail Izin Harian"}
                {modalType === "fimtk" && "Detail Izin FIMTK"}
                {modalType === "cuti" && "Detail Izin Cuti"}
              </h2>
              <button className="modal-close-icon" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <div className="modal-body-modern">
              {modalType === "harian" && (
                <>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Nama</label>
                      <div className="modal-field-value">{selectedData.nama}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Cabang</label>
                      <div className="modal-field-value">{selectedData.cabang}</div>
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Tipe Izin</label>
                    <div className="modal-field-value">{selectedData.tipeIzin}</div>
                  </div>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Tanggal Mulai</label>
                      <div className="modal-field-value">{selectedData.tglMulai}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Tanggal Selesai</label>
                      <div className="modal-field-value">{selectedData.tglSelesai}</div>
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Keterangan / Alasan</label>
                    <div className="modal-field-value" style={{ minHeight: "60px" }}>
                      {selectedData.keterangan}
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Bukti Foto</label>
                    <div className="modal-foto-box" style={{ position: "relative" }}>
                      {selectedData.foto ? (
                        <>
                          <img
                            src={selectedData.foto}
                            alt="Bukti"
                            style={{ maxWidth: "100%", maxHeight: "100%", cursor: "pointer", objectFit: "contain" }}
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
                </>
              )}

              {modalType === "fimtk" && (
                <>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Nama</label>
                      <div className="modal-field-value">{selectedData.nama}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Cabang</label>
                      <div className="modal-field-value">{selectedData.cabang}</div>
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Tipe Izin</label>
                    <div className="modal-field-value">{selectedData.tipeIzin}</div>
                  </div>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Jabatan</label>
                      <div className="modal-field-value">{selectedData.jabatan}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Divisi</label>
                      <div className="modal-field-value">{selectedData.divisi}</div>
                    </div>
                  </div>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Tanggal</label>
                      <div className="modal-field-value">{selectedData.tanggal}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Jam Izin</label>
                      <div className="modal-field-value">
                        {selectedData.jamMulai} - {selectedData.jamSelesai}
                      </div>
                    </div>
                  </div>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Keperluan</label>
                      <div className="modal-field-value">{selectedData.keperluan}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Kendaraan</label>
                      <div className="modal-field-value">{selectedData.kendaraan}</div>
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Keterangan / Alasan</label>
                    <div className="modal-field-value" style={{ minHeight: "60px" }}>
                      {selectedData.keterangan}
                    </div>
                  </div>
                </>
              )}

              {modalType === "cuti" && (
                <>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Nama</label>
                      <div className="modal-field-value">{selectedData.nama}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Cabang</label>
                      <div className="modal-field-value">{selectedData.cabang}</div>
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Tipe Izin</label>
                    <div className="modal-field-value">{selectedData.tipeIzin}</div>
                  </div>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Tanggal Mulai</label>
                      <div className="modal-field-value">{selectedData.tglMulai}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">Tanggal Selesai</label>
                      <div className="modal-field-value">{selectedData.tglSelesai}</div>
                    </div>
                  </div>
                  <div className="modal-row-split">
                    <div className="modal-field-group">
                      <label className="modal-field-label">Jabatan & Divisi</label>
                      <div className="modal-field-value">
                        {selectedData.jabatan} - {selectedData.divisi}
                      </div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">No. Telepon</label>
                      <div className="modal-field-value">{selectedData.noTelp}</div>
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Keterangan / Alasan</label>
                    <div className="modal-field-value" style={{ minHeight: "60px" }}>
                      {selectedData.keterangan}
                    </div>
                  </div>
                </>
              )}
            </div>

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
                  onClick={() => handleUpdateStatus(selectedData.id, "Disetujui")}
                >
                  Setujui
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {previewImage && (
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Kehadiran;