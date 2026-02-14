import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/login";
import DashboardHRD from "./pages/hrd/dashboard"; 
import KelolaCabang from "./pages/hrd/kelolacabang"; 
import DataKaryawan from "./pages/hrd/datakaryawan"; 

// Import dari file 'kehadiran.jsx', tapi kita namain komponennya AbsenManual
import AbsenManual from "./pages/hrd/kehadiran"; 

// --- 1. TAMBAHAN: IMPORT LAPORAN ---
import Laporan from "./pages/hrd/laporan"; 

// ... import halaman karyawan lainnya ...
import DashboardKaryawan from "./pages/karyawan/dashboard"; 
import Absensi from "./pages/karyawan/absensi";
import FormPerizinan from "./pages/karyawan/formperizinan";
import Riwayat from "./pages/karyawan/riwayat";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />

          {/* --- ROUTE KHUSUS HRD --- */}
          <Route element={<ProtectedRoute allowedRoles={['hrd']} />}>
            <Route path="/hrd/dashboard" element={<DashboardHRD />} />
            <Route path="/hrd/kelolacabang" element={<KelolaCabang />} />
            <Route path="/hrd/datakaryawan" element={<DataKaryawan />} />
            
            {/* Route Absen Manual / Kehadiran */}
            <Route path="/hrd/absenmanual" element={<AbsenManual />} />

            {/* --- 2. TAMBAHAN: ROUTE LAPORAN --- */}
            <Route path="/hrd/laporan" element={<Laporan />} />
          </Route>

          {/* --- ROUTE KHUSUS KARYAWAN --- */}
          <Route element={<ProtectedRoute allowedRoles={['karyawan']} />}>
            <Route path="/karyawan/dashboard" element={<DashboardKaryawan />} />
            <Route path="/karyawan/absensi" element={<Absensi />} />
            <Route path="/karyawan/perizinan" element={<FormPerizinan />} />
            <Route path="/karyawan/riwayat" element={<Riwayat />} />
          </Route>

          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;