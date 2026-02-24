import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/login";
import DashboardHRD from "./pages/hrd/dashboard"; 
import KelolaCabang from "./pages/hrd/kelolacabang"; 
import DataKaryawan from "./pages/hrd/datakaryawan"; 
import DetailKaryawan from "./pages/hrd/detailkaryawan"; 
import AbsenManual from "./pages/hrd/kehadiran"; 
import Laporan from "./pages/hrd/laporan"; 

import DashboardKaryawan from "./pages/karyawan/dashboard"; 
import Absensi from "./pages/karyawan/absensi";
import FormPerizinan from "./pages/karyawan/formperizinan";
import Riwayat from "./pages/karyawan/riwayat";

import DashboardManagerCabang from "./pages/managerCabang/dashboard";
import DataKaryawanManager from "./pages/managerCabang/datakaryawan";
import DetailKaryawanManager from "./pages/managerCabang/detailkaryawan";
import PerizinanManager from "./pages/managerCabang/perizinan";

// SEKARANG SUDAH AKTIF:
import LaporanManager from "./pages/managerCabang/laporan";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />

          {/* ROUTE KHUSUS HRD */}
          <Route element={<ProtectedRoute allowedRoles={['hrd']} />}>
            <Route path="/hrd/dashboard" element={<DashboardHRD />} />
            <Route path="/hrd/kelolacabang" element={<KelolaCabang />} />
            <Route path="/hrd/datakaryawan" element={<DataKaryawan />} />
            <Route path="/hrd/detail-karyawan" element={<DetailKaryawan />} />
            <Route path="/hrd/absenmanual" element={<AbsenManual />} />
            <Route path="/hrd/laporan" element={<Laporan />} />
          </Route>

          {/* ROUTE KHUSUS KARYAWAN */}
          <Route element={<ProtectedRoute allowedRoles={['karyawan']} />}>
            <Route path="/karyawan/dashboard" element={<DashboardKaryawan />} />
            <Route path="/karyawan/absensi" element={<Absensi />} />
            <Route path="/karyawan/perizinan" element={<FormPerizinan />} />
            <Route path="/karyawan/riwayat" element={<Riwayat />} />
          </Route>

          {/* ROUTE KHUSUS MANAGER CABANG */}
          <Route element={<ProtectedRoute allowedRoles={['managerCabang']} />}>
            <Route path="/managerCabang/dashboard" element={<DashboardManagerCabang />} />
            <Route path="/managerCabang/datakaryawan" element={<DataKaryawanManager />} />
            <Route path="/managerCabang/detail-karyawan" element={<DetailKaryawanManager />} />
            <Route path="/managerCabang/perizinan" element={<PerizinanManager />} />
            
            {/* ROUTE LAPORAN SUDAH DIAKTIFKAN: */}
            <Route path="/managerCabang/laporan" element={<LaporanManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;