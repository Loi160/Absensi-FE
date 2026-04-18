import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../hrd/kehadiran.css"; 

import iconDashboard from "../../assets/dashboard.svg";
import iconKaryawan from "../../assets/datakaryawan.svg";
import iconIzin from "../../assets/perizinan.svg";
import iconLaporan from "../../assets/laporan.svg";
import iconBawah from "../../assets/bawah.svg";
import logoPersegi from "../../assets/logopersegi.svg";

const MENU_ITEMS = [
  { path: "/managerCabang/dashboard", icon: iconDashboard, text: "Dashboard" },
  { path: "/managerCabang/datakaryawan", icon: iconKaryawan, text: "Data Karyawan" },
  { path: "/managerCabang/perizinan", icon: iconIzin, text: "Perizinan", active: true },
  { path: "/managerCabang/laporan", icon: iconLaporan, text: "Laporan" },
];

const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const sortData = (data) =>
  [...data].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return b.rawDate - a.rawDate;
  });

const filterByCabang = (dataArray, selectedFilter) => {
  if (selectedFilter === "Semua Sub-Cabang") return dataArray;
  return dataArray.filter((item) => item.cabang === selectedFilter);
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

const PerizinanManagerCabang = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Semua Sub-Cabang");

  const [dataIzinHarian, setDataIzinHarian] = useState([]);
  const [dataIzinFIMTK, setDataIzinFIMTK] = useState([]);
  const [dataCuti, setDataCuti] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchData = async () => {
    if (!user?.cabang_id) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/manager/perizinan/${user.cabang_id}`);
      const allPerizinan = await res.json();

      const harian = [];
      const fimtk = [];
      const cuti = [];

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

      setDataIzinHarian(harian);
      setDataIzinFIMTK(fimtk);
      setDataCuti(cuti);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleNav = (path) => {
    closeSidebar();
    navigate(path);
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
      }
    } catch (err) {
      alert("Gagal update");
    }
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
      
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="btn-sidebar-close" onClick={closeSidebar}>
          &times;
        </button>
        <div className="logo-area">
          <img src={logoPersegi} alt="AMAGACORP" className="logo-img" />
        </div>
        <nav className="menu-nav">
          {MENU_ITEMS.map((item, index) => (
            <div
              key={index}
              className={`menu-item ${item.active ? "active" : ""}`}
              onClick={() => handleNav(item.path)}
            >
              <div className="menu-left">
                <img src={item.icon} alt="" className="menu-icon-main" />
                <span className="menu-text-main">{item.text}</span>
              </div>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/auth/login");
          }}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="header-titles">
          <h1>Perizinan Cabang - {user?.cabangUtama}</h1>
          <p>Kelola permohonan izin karyawan di wilayah kerja Anda</p>
        </div>

        <div className="action-row-perizinan">
          <div className="filter-wrapper">
            <button className="btn-filter-green" onClick={() => setShowFilter(!showFilter)}>
              {selectedFilter} <img src={iconBawah} alt="v" className={`filter-arrow ${showFilter ? "rotate" : ""}`} />
            </button>
            {showFilter && (
              <div className="filter-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedFilter("Semua Sub-Cabang");
                    setShowFilter(false);
                  }}
                >
                  Semua Sub-Cabang
                </div>
                {user?.subCabang?.map((c) => (
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
          <p style={{ textAlign: "center", marginTop: "50px" }}>Memuat...</p>
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
                  {filterByCabang(sortData(dataIzinHarian), selectedFilter).length > 0 ? (
                    filterByCabang(sortData(dataIzinHarian), selectedFilter).map((item) => (
                      <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, "harian")}>
                        <td className="clickable-name">{item.nama}</td>
                        <td>{item.tglMulai}</td>
                        <td>{item.tglSelesai}</td>
                        <td>
                          <span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span>
                        </td>
                        <td className="text-center">
                          <span className={`badge-status ${item.status === "Disetujui" ? "approve" : item.status === "Ditolak" ? "reject" : "pending"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          {item.status === "Pending" ? (
                            <div className="action-buttons">
                              <button className="btn-approve" onClick={() => handleUpdateStatus(item.id, "Disetujui")}>Setujui</button>
                              <button className="btn-reject" onClick={() => handleUpdateStatus(item.id, "Ditolak")}>Tolak</button>
                            </div>
                          ) : (
                            <span className="text-selesai">- Selesai -</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state-cell">Belum ada data izin harian.</td>
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
                  {filterByCabang(sortData(dataIzinFIMTK), selectedFilter).length > 0 ? (
                    filterByCabang(sortData(dataIzinFIMTK), selectedFilter).map((item) => (
                      <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, "fimtk")}>
                        <td className="clickable-name">{item.nama}</td>
                        <td>{item.jabatan}</td>
                        <td>
                          <span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span>
                        </td>
                        <td>{item.tanggal}</td>
                        <td className="text-center">
                          <span className={`badge-status ${item.status === "Disetujui" ? "approve" : item.status === "Ditolak" ? "reject" : "pending"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          {item.status === "Pending" ? (
                            <div className="action-buttons">
                              <button className="btn-approve" onClick={() => handleUpdateStatus(item.id, "Disetujui")}>Setujui</button>
                              <button className="btn-reject" onClick={() => handleUpdateStatus(item.id, "Ditolak")}>Tolak</button>
                            </div>
                          ) : (
                            <span className="text-selesai">- Selesai -</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state-cell">Belum ada data izin FIMTK.</td>
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
                  {filterByCabang(sortData(dataCuti), selectedFilter).length > 0 ? (
                    filterByCabang(sortData(dataCuti), selectedFilter).map((item) => (
                      <tr key={item.id} className="clickable-row" onClick={() => handleRowClick(item, "cuti")}>
                        <td className="clickable-name">{item.nama}</td>
                        <td>{item.jabatan}</td>
                        <td>
                          <span className={`badge-jenis ${getBadgeClass(item.tipeIzin)}`}>{item.tipeIzin}</span>
                        </td>
                        <td>{item.tglMulai}</td>
                        <td className="text-center">
                          <span className={`badge-status ${item.status === "Disetujui" ? "approve" : item.status === "Ditolak" ? "reject" : "pending"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          {item.status === "Pending" ? (
                            <div className="action-buttons">
                              <button className="btn-approve" onClick={() => handleUpdateStatus(item.id, "Disetujui")}>Setujui</button>
                              <button className="btn-reject" onClick={() => handleUpdateStatus(item.id, "Ditolak")}>Tolak</button>
                            </div>
                          ) : (
                            <span className="text-selesai">- Selesai -</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state-cell">Belum ada data izin Cuti.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
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
              <button className="modal-close-icon" onClick={handleCloseModal}>&times;</button>
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
                    <div className="modal-field-value" style={{ minHeight: "60px" }}>{selectedData.keterangan}</div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Bukti Foto</label>
                    <div className="modal-foto-box" style={{ position: "relative" }}>
                      {selectedData.foto ? (
                        <>
                          <img src={selectedData.foto} alt="Bukti" style={{ maxWidth: "100%", maxHeight: "100%", cursor: "pointer", objectFit: "contain" }} onClick={() => setPreviewImage(selectedData.foto)} />
                          <button type="button" onClick={() => setPreviewImage(selectedData.foto)} style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>🔍</button>
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
                      <div className="modal-field-value">{selectedData.jamMulai} - {selectedData.jamSelesai}</div>
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
                    <div className="modal-field-value" style={{ minHeight: "60px" }}>{selectedData.keterangan}</div>
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
                      <div className="modal-field-value">{selectedData.jabatan} - {selectedData.divisi}</div>
                    </div>
                    <div className="modal-field-group">
                      <label className="modal-field-label">No. Telepon</label>
                      <div className="modal-field-value">{selectedData.noTelp}</div>
                    </div>
                  </div>
                  <div className="modal-field-group">
                    <label className="modal-field-label">Keterangan / Alasan</label>
                    <div className="modal-field-value" style={{ minHeight: "60px" }}>{selectedData.keterangan}</div>
                  </div>
                </>
              )}
            </div>

            {selectedData.status === "Pending" && (
              <div className="modal-footer-modern">
                <button className="btn-reject-modern" onClick={() => handleUpdateStatus(selectedData.id, "Ditolak")}>Tolak</button>
                <button className="btn-approve-modern" onClick={() => handleUpdateStatus(selectedData.id, "Disetujui")}>Setujui</button>
              </div>
            )}
          </div>
        </div>
      )}

      {previewImage && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.85)", zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setPreviewImage(null)}>
          <button style={{ position: "absolute", top: "20px", right: "30px", background: "none", border: "none", color: "#fff", fontSize: "40px", cursor: "pointer" }} onClick={() => setPreviewImage(null)}>&times;</button>
          <img src={previewImage} alt="Preview Zoom" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px", objectFit: "contain", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default PerizinanManagerCabang;