import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// IMPORT HALAMAN OTENTIKASI 
import Login from "./pages/auth/login";

// IMPORT HALAMAN ROLE HRD (ADMIN PUSAT)
import DashboardHRD from "./pages/hrd/dashboard"; 
import KelolaCabang from "./pages/hrd/kelolacabang"; 
import DataKaryawan from "./pages/hrd/datakaryawan"; 
import DetailKaryawan from "./pages/hrd/detailkaryawan"; 
import AbsenManual from "./pages/hrd/kehadiran";
import Laporan from "./pages/hrd/laporan"; 

// IMPORT HALAMAN ROLE KARYAWAN (USER)
import DashboardKaryawan from "./pages/karyawan/dashboard"; 
import Absensi from "./pages/karyawan/absensi";
import FormPerizinan from "./pages/karyawan/formperizinan";
import Riwayat from "./pages/karyawan/riwayat";

// IMPORT HALAMAN ROLE MANAGER CABANG
import DashboardManagerCabang from "./pages/managerCabang/dashboard";
import DataKaryawanManager from "./pages/managerCabang/datakaryawan";
import DetailKaryawanManager from "./pages/managerCabang/detailkaryawan";
import PerizinanManager from "./pages/managerCabang/perizinan";
import LaporanManager from "./pages/managerCabang/laporan";

function App() {
  return (
    // AuthProvider membungkus seluruh aplikasi agar status login bisa diakses di semua komponen
    <AuthProvider>
      <Router>
        <Routes>
          {/* Alur Awal: Jika user mengakses root '/', arahkan otomatis ke halaman login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />

          {/* ==========================================
              GROUP ROUTE: KHUSUS HRD
              Memeriksa apakah user memiliki role 'hrd'
              ========================================== */}
          <Route element={<ProtectedRoute allowedRoles={['hrd']} />}>
            <Route path="/hrd/dashboard" element={<DashboardHRD />} />
            <Route path="/hrd/kelolacabang" element={<KelolaCabang />} />
            <Route path="/hrd/datakaryawan" element={<DataKaryawan />} />
            
            {/* Route Detail Karyawan mendukung akses umum maupun spesifik berdasarkan ID */}
            <Route path="/hrd/detailkaryawan" element={<DetailKaryawan />} />
            <Route path="/hrd/detailkaryawan/:id" element={<DetailKaryawan />} />
            
            {/* Mengarahkan pengelolaan kehadiran sesuai dengan path yang digunakan pada Sidebar */}
            <Route path="/hrd/kehadiran" element={<AbsenManual />} />
            <Route path="/hrd/laporan" element={<Laporan />} />
          </Route>

          {/* ==========================================
              GROUP ROUTE: KHUSUS KARYAWAN
              Memeriksa apakah user memiliki role 'karyawan'
              ========================================== */}
          <Route element={<ProtectedRoute allowedRoles={['karyawan']} />}>
            <Route path="/karyawan/dashboard" element={<DashboardKaryawan />} />
            <Route path="/karyawan/absensi" element={<Absensi />} />
            <Route path="/karyawan/perizinan" element={<FormPerizinan />} />
            <Route path="/karyawan/riwayat" element={<Riwayat />} />
          </Route>

          {/* ==========================================
              GROUP ROUTE: KHUSUS MANAGER CABANG
              Memeriksa apakah user memiliki role 'managerCabang'
              ========================================== */}
          <Route element={<ProtectedRoute allowedRoles={['managerCabang']} />}>
            <Route path="/managerCabang/dashboard" element={<DashboardManagerCabang />} />
            <Route path="/managerCabang/datakaryawan" element={<DataKaryawanManager />} />
            
            {/* Route Detail Karyawan Cabang mendukung akses spesifik ID untuk melihat profil bawahan */}
            <Route path="/managerCabang/detailkaryawan" element={<DetailKaryawanManager />} />
            <Route path="/managerCabang/detailkaryawan/:id" element={<DetailKaryawanManager />} />
            
            <Route path="/managerCabang/perizinan" element={<PerizinanManager />} />
            <Route path="/managerCabang/laporan" element={<LaporanManager />} />
          </Route>

          {/* Catch-all Route: Proteksi keamanan jika user mencoba akses URL yang tidak terdaftar */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;