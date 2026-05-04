import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../context/AuthHeaders";
import "../hrd/kehadiran.css";

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
    active: true,
  },
  {
    path: "/managerCabang/laporan",
    icon: iconLaporan,
    text: "Laporan",
  },
];

// ============================================================================
// KONSTANTA: FILTER DAN TIPE PERIZINAN
// ============================================================================

const ALL_BRANCH_FILTER = "Semua Cabang Saya";

const PERMISSION_CATEGORY = {
  IZIN: "Izin",
  FIMTK: "FIMTK",
  CUTI: "Cuti",
};

const MODAL_TYPE = {
  HARIAN: "harian",
  FIMTK: "fimtk",
  CUTI: "cuti",
};

const APPROVAL_STATUS = {
  PENDING: "Pending",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

// ============================================================================
// KONSTANTA: STYLE INLINE
// ============================================================================

const LOADING_TEXT_STYLE = {
  textAlign: "center",
  marginTop: "50px",
};

const MODAL_TEXTAREA_STYLE = {
  minHeight: "60px",
};

const MODAL_IMAGE_BOX_STYLE = {
  position: "relative",
};

const PROOF_IMAGE_STYLE = {
  maxWidth: "100%",
  maxHeight: "100%",
  cursor: "pointer",
  objectFit: "contain",
};

const IMAGE_PREVIEW_BUTTON_STYLE = {
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
};

const IMAGE_PREVIEW_OVERLAY_STYLE = {
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
};

const IMAGE_PREVIEW_CLOSE_BUTTON_STYLE = {
  position: "absolute",
  top: "20px",
  right: "30px",
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: "40px",
  cursor: "pointer",
};

const IMAGE_PREVIEW_STYLE = {
  maxWidth: "90%",
  maxHeight: "90%",
  borderRadius: "8px",
  objectFit: "contain",
  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
};

const TABLE_COLUMN_WIDTHS = {
  name: {
    width: "20%",
  },
  medium: {
    width: "15%",
  },
  status: {
    width: "10%",
  },
  action: {
    width: "25%",
  },
};

// ============================================================================
// HELPER: FORMAT DAN TRANSFORMASI DATA
// ============================================================================

// Mengubah format tanggal dari API menjadi format tanggal Indonesia.
const formatDateIndo = (dateString) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Mengurutkan data agar status pending berada di atas, lalu diikuti data terbaru.
const sortPermissionData = (data) =>
  [...data].sort((firstItem, secondItem) => {
    if (
      firstItem.status === APPROVAL_STATUS.PENDING &&
      secondItem.status !== APPROVAL_STATUS.PENDING
    ) {
      return -1;
    }

    if (
      firstItem.status !== APPROVAL_STATUS.PENDING &&
      secondItem.status === APPROVAL_STATUS.PENDING
    ) {
      return 1;
    }

    return secondItem.rawDate - firstItem.rawDate;
  });

// Menyaring data berdasarkan cabang yang dipilih pada dropdown filter.
const filterByBranch = (dataArray, selectedFilter) => {
  if (selectedFilter === ALL_BRANCH_FILTER) {
    return dataArray;
  }

  return dataArray.filter((item) => item.cabang === selectedFilter);
};

// Menentukan class badge berdasarkan jenis izin.
const getBadgeClass = (permissionType) => {
  if (!permissionType) {
    return "lainnya";
  }

  const normalizedType = permissionType.toLowerCase();

  if (normalizedType.includes("sakit")) {
    return "sakit";
  }

  if (normalizedType.includes("pribadi")) {
    return "pribadi";
  }

  if (normalizedType.includes("keluar")) {
    return "keluar";
  }

  if (normalizedType.includes("pulang")) {
    return "pulang";
  }

  if (normalizedType.includes("khusus")) {
    return "khusus";
  }

  if (normalizedType.includes("tahunan")) {
    return "tahunan";
  }

  return "lainnya";
};

// Mengubah data perizinan dari API menjadi format yang digunakan oleh tabel dan modal.
const mapPermissionData = (permission) => ({
  id: permission.id,
  nama: permission.users?.nama || "Unknown",
  cabang: permission.users?.cabang?.nama || "-",
  jabatan: permission.users?.jabatan || "-",
  divisi: permission.users?.divisi || "-",
  noTelp: permission.users?.no_telp || "-",
  tipeIzin: permission.jenis_izin || permission.kategori || "-",
  keterangan: permission.keterangan || permission.keperluan || "-",
  tglMulai: formatDateIndo(permission.tanggal_mulai),
  tglSelesai: formatDateIndo(permission.tanggal_selesai),
  tanggal: formatDateIndo(permission.tanggal_mulai),
  jamMulai: permission.jam_mulai || "-",
  jamSelesai: permission.jam_selesai || "-",
  keperluan: permission.keperluan || "-",
  kendaraan: permission.kendaraan || "-",
  alasan: permission.keterangan || "-",
  status: permission.status_approval || APPROVAL_STATUS.PENDING,
  foto: permission.bukti_foto || null,
  rawDate: new Date(
    permission.created_at || permission.tanggal_mulai,
  ).getTime(),
});

// ============================================================================
// KOMPONEN: ICON
// ============================================================================

const ZoomIcon = () => (
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
// KOMPONEN: PERIZINAN MANAGER CABANG
// ============================================================================

const PerizinanManagerCabang = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFilter, setSelectedFilter] = useState(ALL_BRANCH_FILTER);
  const [branchList, setBranchList] = useState([]);

  const [dailyPermissionData, setDailyPermissionData] = useState([]);
  const [fimtkPermissionData, setFimtkPermissionData] = useState([]);
  const [leavePermissionData, setLeavePermissionData] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Menyaring dan mengurutkan data izin harian sesuai filter cabang aktif.
  const filteredDailyPermissions = useMemo(
    () =>
      filterByBranch(
        sortPermissionData(dailyPermissionData),
        selectedFilter,
      ),
    [dailyPermissionData, selectedFilter],
  );

  // Menyaring dan mengurutkan data FIMTK sesuai filter cabang aktif.
  const filteredFimtkPermissions = useMemo(
    () =>
      filterByBranch(
        sortPermissionData(fimtkPermissionData),
        selectedFilter,
      ),
    [fimtkPermissionData, selectedFilter],
  );

  // Menyaring dan mengurutkan data cuti sesuai filter cabang aktif.
  const filteredLeavePermissions = useMemo(
    () =>
      filterByBranch(
        sortPermissionData(leavePermissionData),
        selectedFilter,
      ),
    [leavePermissionData, selectedFilter],
  );

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

  const toggleFilterVisibility = () => {
    setIsFilterVisible((currentValue) => !currentValue);
  };

  // Mengubah filter cabang lalu menutup dropdown filter.
  const handleFilterSelection = (branchName) => {
    setSelectedFilter(branchName);
    setIsFilterVisible(false);
  };

  // Membuka modal detail sesuai jenis data perizinan yang dipilih.
  const handleRowClick = (item, type) => {
    setSelectedData(item);
    setModalType(type);
    setIsModalVisible(true);
  };

  // Menutup modal dan menghapus data detail yang sedang dipilih.
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedData(null);
    setModalType("");
  };

  const handleClosePreviewImage = () => {
    setPreviewImage(null);
  };

  // Mengelompokkan data perizinan berdasarkan kategori dari API.
  const groupPermissionDataByCategory = (permissionList) => {
    const groupedData = {
      daily: [],
      fimtk: [],
      leave: [],
    };

    if (!Array.isArray(permissionList)) {
      return groupedData;
    }

    permissionList.forEach((permission) => {
      const mappedData = mapPermissionData(permission);

      if (permission.kategori === PERMISSION_CATEGORY.IZIN) {
        groupedData.daily.push(mappedData);
      } else if (permission.kategori === PERMISSION_CATEGORY.FIMTK) {
        groupedData.fimtk.push(mappedData);
      } else if (permission.kategori === PERMISSION_CATEGORY.CUTI) {
        groupedData.leave.push(mappedData);
      }
    });

    return groupedData;
  };

  // Mengambil data cabang dan seluruh data perizinan yang dapat diakses manager.
  const fetchPermissionData = async () => {
    try {
      setIsLoading(true);

      const branchResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cabang`,
        {
          headers: getAuthHeaders(),
        },
      );

      const branchData = await branchResponse.json();

      if (branchResponse.status === 401 || branchResponse.status === 403) {
        logout();
        navigate("/auth/login");
        return;
      }

      if (!branchResponse.ok) {
        alert(branchData.message || "Gagal mengambil data cabang.");
        return;
      }

      setBranchList(
        Array.isArray(branchData)
          ? branchData.map((branch) => branch.nama)
          : [],
      );

      const permissionResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/perizinan/all`,
        {
          headers: getAuthHeaders(),
        },
      );

      const permissionData = await permissionResponse.json();

      if (
        permissionResponse.status === 401 ||
        permissionResponse.status === 403
      ) {
        logout();
        navigate("/auth/login");
        return;
      }

      if (!permissionResponse.ok) {
        alert(permissionData.message || "Gagal mengambil data perizinan.");
        return;
      }

      const groupedPermissionData =
        groupPermissionDataByCategory(permissionData);

      setDailyPermissionData(groupedPermissionData.daily);
      setFimtkPermissionData(groupedPermissionData.fimtk);
      setLeavePermissionData(groupedPermissionData.leave);
    } catch (error) {
      console.error("Gagal mengambil data perizinan:", error);
      alert("Gagal mengambil data perizinan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mengubah status approval perizinan menjadi disetujui atau ditolak.
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/perizinan/${id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status_approval: newStatus,
          }),
        },
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        logout();
        navigate("/auth/login");
        return;
      }

      if (response.ok) {
        alert(result.message || `Berhasil di-${newStatus}`);
        fetchPermissionData();
        handleCloseModal();
        return;
      }

      alert(
        `Gagal: ${result.message || "Gagal mengupdate status."}${
          result.detail ? `\nDetail: ${result.detail}` : ""
        }`,
      );
    } catch (error) {
      console.error("Gagal update status:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchPermissionData();
    }
  }, [user]);

  const renderStatusBadge = (status) => (
    <span
      className={`badge-status ${
        status === APPROVAL_STATUS.APPROVED
          ? "approve"
          : status === APPROVAL_STATUS.REJECTED
            ? "reject"
            : "pending"
      }`}
    >
      {status}
    </span>
  );

  const renderActionButtons = (item) => (
    <td
      className="text-center"
      onClick={(event) => event.stopPropagation()}
    >
      {item.status === APPROVAL_STATUS.PENDING ? (
        <div className="action-buttons">
          <button
            type="button"
            className="btn-approve"
            onClick={() =>
              handleUpdateStatus(
                item.id,
                APPROVAL_STATUS.APPROVED,
              )
            }
          >
            Setujui
          </button>

          <button
            type="button"
            className="btn-reject"
            onClick={() =>
              handleUpdateStatus(
                item.id,
                APPROVAL_STATUS.REJECTED,
              )
            }
          >
            Tolak
          </button>
        </div>
      ) : (
        <span className="text-selesai">
          - Selesai -
        </span>
      )}
    </td>
  );

  const renderEmptyTableRow = (message) => (
    <tr>
      <td
        colSpan="6"
        className="empty-state-cell"
      >
        {message}
      </td>
    </tr>
  );

  const renderPermissionTypeBadge = (permissionType) => (
    <span className={`badge-jenis ${getBadgeClass(permissionType)}`}>
      {permissionType}
    </span>
  );

  const renderDailyPermissionRows = () => {
    if (filteredDailyPermissions.length === 0) {
      return renderEmptyTableRow("Belum ada data izin harian.");
    }

    return filteredDailyPermissions.map((item) => (
      <tr
        key={item.id}
        className="clickable-row"
        onClick={() => handleRowClick(item, MODAL_TYPE.HARIAN)}
      >
        <td className="clickable-name">
          {item.nama}
        </td>

        <td>
          {item.tglMulai}
        </td>

        <td>
          {item.tglSelesai}
        </td>

        <td>
          {renderPermissionTypeBadge(item.tipeIzin)}
        </td>

        <td className="text-center">
          {renderStatusBadge(item.status)}
        </td>

        {renderActionButtons(item)}
      </tr>
    ));
  };

  const renderFimtkPermissionRows = () => {
    if (filteredFimtkPermissions.length === 0) {
      return renderEmptyTableRow("Belum ada data izin FIMTK.");
    }

    return filteredFimtkPermissions.map((item) => (
      <tr
        key={item.id}
        className="clickable-row"
        onClick={() => handleRowClick(item, MODAL_TYPE.FIMTK)}
      >
        <td className="clickable-name">
          {item.nama}
        </td>

        <td>
          {item.jabatan}
        </td>

        <td>
          {renderPermissionTypeBadge(item.tipeIzin)}
        </td>

        <td>
          {item.tanggal}
        </td>

        <td className="text-center">
          {renderStatusBadge(item.status)}
        </td>

        {renderActionButtons(item)}
      </tr>
    ));
  };

  const renderLeavePermissionRows = () => {
    if (filteredLeavePermissions.length === 0) {
      return renderEmptyTableRow("Belum ada data izin Cuti.");
    }

    return filteredLeavePermissions.map((item) => (
      <tr
        key={item.id}
        className="clickable-row"
        onClick={() => handleRowClick(item, MODAL_TYPE.CUTI)}
      >
        <td className="clickable-name">
          {item.nama}
        </td>

        <td>
          {item.jabatan}
        </td>

        <td>
          {renderPermissionTypeBadge(item.tipeIzin)}
        </td>

        <td>
          {item.tglMulai}
        </td>

        <td className="text-center">
          {renderStatusBadge(item.status)}
        </td>

        {renderActionButtons(item)}
      </tr>
    ));
  };

  const renderTableHeader = (columns) => (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.label}
            style={column.style}
            className={column.className}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderPermissionTable = ({
    sectionTitle,
    columns,
    renderRows,
  }) => (
    <>
      <h3 className="section-title">
        {sectionTitle}
      </h3>

      <div className="perizinan-card">
        <div className="card-header-green">
          Permintaan Menunggu Approval
        </div>

        <table className="table-izin">
          {renderTableHeader(columns)}

          <tbody>
            {renderRows()}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderModalField = ({
    label,
    value,
    style,
  }) => (
    <div className="modal-field-group">
      <label className="modal-field-label">
        {label}
      </label>

      <div
        className="modal-field-value"
        style={style}
      >
        {value}
      </div>
    </div>
  );

  const renderModalFieldRow = (fields) => (
    <div className="modal-row-split">
      {fields.map((field) => (
        <div
          key={field.label}
          className="modal-field-group"
        >
          <label className="modal-field-label">
            {field.label}
          </label>

          <div className="modal-field-value">
            {field.value}
          </div>
        </div>
      ))}
    </div>
  );

  const renderProofPhoto = () => (
    <div className="modal-field-group">
      <label className="modal-field-label">
        Bukti Foto
      </label>

      <div
        className="modal-foto-box"
        style={MODAL_IMAGE_BOX_STYLE}
      >
        {selectedData.foto ? (
          <>
            <img
              src={selectedData.foto}
              alt="Bukti"
              style={PROOF_IMAGE_STYLE}
              onClick={() => setPreviewImage(selectedData.foto)}
            />

            <button
              type="button"
              onClick={() => setPreviewImage(selectedData.foto)}
              style={IMAGE_PREVIEW_BUTTON_STYLE}
              aria-label="Perbesar bukti foto"
            >
              <ZoomIcon />
            </button>
          </>
        ) : (
          "Gambar: Belum ada bukti terlampir"
        )}
      </div>
    </div>
  );

  const renderDailyPermissionDetail = () => (
    <>
      {renderModalFieldRow([
        {
          label: "Nama",
          value: selectedData.nama,
        },
        {
          label: "Cabang",
          value: selectedData.cabang,
        },
      ])}

      {renderModalField({
        label: "Tipe Izin",
        value: selectedData.tipeIzin,
      })}

      {renderModalFieldRow([
        {
          label: "Tanggal Mulai",
          value: selectedData.tglMulai,
        },
        {
          label: "Tanggal Selesai",
          value: selectedData.tglSelesai,
        },
      ])}

      {renderModalField({
        label: "Keterangan / Alasan",
        value: selectedData.keterangan,
        style: MODAL_TEXTAREA_STYLE,
      })}

      {renderProofPhoto()}
    </>
  );

  const renderFimtkPermissionDetail = () => (
    <>
      {renderModalFieldRow([
        {
          label: "Nama",
          value: selectedData.nama,
        },
        {
          label: "Cabang",
          value: selectedData.cabang,
        },
      ])}

      {renderModalField({
        label: "Tipe Izin",
        value: selectedData.tipeIzin,
      })}

      {renderModalFieldRow([
        {
          label: "Jabatan",
          value: selectedData.jabatan,
        },
        {
          label: "Divisi",
          value: selectedData.divisi,
        },
      ])}

      {renderModalFieldRow([
        {
          label: "Tanggal",
          value: selectedData.tanggal,
        },
        {
          label: "Jam Izin",
          value: `${selectedData.jamMulai} - ${selectedData.jamSelesai}`,
        },
      ])}

      {renderModalFieldRow([
        {
          label: "Keperluan",
          value: selectedData.keperluan,
        },
        {
          label: "Kendaraan",
          value: selectedData.kendaraan,
        },
      ])}

      {renderModalField({
        label: "Keterangan / Alasan",
        value: selectedData.keterangan,
        style: MODAL_TEXTAREA_STYLE,
      })}
    </>
  );

  const renderLeavePermissionDetail = () => (
    <>
      {renderModalFieldRow([
        {
          label: "Nama",
          value: selectedData.nama,
        },
        {
          label: "Cabang",
          value: selectedData.cabang,
        },
      ])}

      {renderModalField({
        label: "Tipe Izin",
        value: selectedData.tipeIzin,
      })}

      {renderModalFieldRow([
        {
          label: "Tanggal Mulai",
          value: selectedData.tglMulai,
        },
        {
          label: "Tanggal Selesai",
          value: selectedData.tglSelesai,
        },
      ])}

      {renderModalFieldRow([
        {
          label: "Jabatan & Divisi",
          value: `${selectedData.jabatan} - ${selectedData.divisi}`,
        },
        {
          label: "No. Telepon",
          value: selectedData.noTelp,
        },
      ])}

      {renderModalField({
        label: "Keterangan / Alasan",
        value: selectedData.keterangan,
        style: MODAL_TEXTAREA_STYLE,
      })}
    </>
  );

  const renderModalContent = () => {
    if (modalType === MODAL_TYPE.HARIAN) {
      return renderDailyPermissionDetail();
    }

    if (modalType === MODAL_TYPE.FIMTK) {
      return renderFimtkPermissionDetail();
    }

    if (modalType === MODAL_TYPE.CUTI) {
      return renderLeavePermissionDetail();
    }

    return null;
  };

  const renderModalTitle = () => {
    if (modalType === MODAL_TYPE.HARIAN) {
      return "Detail Izin Harian";
    }

    if (modalType === MODAL_TYPE.FIMTK) {
      return "Detail Izin FIMTK";
    }

    if (modalType === MODAL_TYPE.CUTI) {
      return "Detail Izin Cuti";
    }

    return "";
  };

  const dailyTableColumns = [
    {
      label: "NAMA",
      style: TABLE_COLUMN_WIDTHS.name,
    },
    {
      label: "MULAI",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "SELESAI",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "TIPE IZIN",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "STATUS",
      style: TABLE_COLUMN_WIDTHS.status,
      className: "text-center",
    },
    {
      label: "AKSI",
      style: TABLE_COLUMN_WIDTHS.action,
      className: "text-center",
    },
  ];

  const fimtkTableColumns = [
    {
      label: "NAMA",
      style: TABLE_COLUMN_WIDTHS.name,
    },
    {
      label: "JABATAN",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "TIPE IZIN",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "TANGGAL",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "STATUS",
      style: TABLE_COLUMN_WIDTHS.status,
      className: "text-center",
    },
    {
      label: "AKSI",
      style: TABLE_COLUMN_WIDTHS.action,
      className: "text-center",
    },
  ];

  const leaveTableColumns = [
    {
      label: "NAMA",
      style: TABLE_COLUMN_WIDTHS.name,
    },
    {
      label: "JABATAN",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "TIPE IZIN",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "MULAI CUTI",
      style: TABLE_COLUMN_WIDTHS.medium,
    },
    {
      label: "STATUS",
      style: TABLE_COLUMN_WIDTHS.status,
      className: "text-center",
    },
    {
      label: "AKSI",
      style: TABLE_COLUMN_WIDTHS.action,
      className: "text-center",
    },
  ];

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
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <button
          type="button"
          className="btn-sidebar-close"
          onClick={closeSidebar}
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
        <div className="header-titles">
          <h1>
            Perizinan Cabang - {user?.cabangUtama || "-"}
          </h1>

          <p>
            Kelola permohonan izin karyawan di wilayah kerja Anda
          </p>
        </div>

        <div className="action-row-perizinan">
          <div className="filter-wrapper">
            <button
              type="button"
              className="btn-filter-green"
              onClick={toggleFilterVisibility}
            >
              {selectedFilter}{" "}

              <img
                src={iconBawah}
                alt="v"
                className={`filter-arrow ${
                  isFilterVisible ? "rotate" : ""
                }`}
              />
            </button>

            {isFilterVisible && (
              <div className="filter-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() =>
                    handleFilterSelection(ALL_BRANCH_FILTER)
                  }
                >
                  Semua Cabang Saya
                </div>

                {branchList.map((branchName) => (
                  <div
                    key={branchName}
                    className="dropdown-item"
                    onClick={() => handleFilterSelection(branchName)}
                  >
                    {branchName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <p style={LOADING_TEXT_STYLE}>
            Memuat...
          </p>
        ) : (
          <>
            {renderPermissionTable({
              sectionTitle: "Permohonan Izin Harian",
              columns: dailyTableColumns,
              renderRows: renderDailyPermissionRows,
            })}

            {renderPermissionTable({
              sectionTitle:
                "Permohonan Izin Meninggalkan Tempat Kerja",
              columns: fimtkTableColumns,
              renderRows: renderFimtkPermissionRows,
            })}

            {renderPermissionTable({
              sectionTitle: "Permohonan Izin Cuti Karyawan",
              columns: leaveTableColumns,
              renderRows: renderLeavePermissionRows,
            })}
          </>
        )}
      </main>

      {isModalVisible && selectedData && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header-modern">
              <h2>
                {renderModalTitle()}
              </h2>

              <button
                type="button"
                className="modal-close-icon"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>

            <div className="modal-body-modern">
              {renderModalContent()}
            </div>

            {selectedData.status === APPROVAL_STATUS.PENDING && (
              <div className="modal-footer-modern">
                <button
                  type="button"
                  className="btn-reject-modern"
                  onClick={() =>
                    handleUpdateStatus(
                      selectedData.id,
                      APPROVAL_STATUS.REJECTED,
                    )
                  }
                >
                  Tolak
                </button>

                <button
                  type="button"
                  className="btn-approve-modern"
                  onClick={() =>
                    handleUpdateStatus(
                      selectedData.id,
                      APPROVAL_STATUS.APPROVED,
                    )
                  }
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
          style={IMAGE_PREVIEW_OVERLAY_STYLE}
          onClick={handleClosePreviewImage}
        >
          <button
            type="button"
            style={IMAGE_PREVIEW_CLOSE_BUTTON_STYLE}
            onClick={handleClosePreviewImage}
          >
            &times;
          </button>

          <img
            src={previewImage}
            alt="Preview Zoom"
            style={IMAGE_PREVIEW_STYLE}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default PerizinanManagerCabang;