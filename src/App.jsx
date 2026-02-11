import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 1. IMPORT PENTING (Context & Security)
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// 2. IMPORT HALAMAN
import Login from "./pages/auth/login";

// --- HALAMAN HRD ---
import DashboardHRD from "./pages/hrd/dashboard"; 
import KelolaCabang from "./pages/hrd/kelolacabang"; 
import DataKaryawan from "./pages/hrd/datakaryawan"; // <--- TAMBAHAN: Import Data Karyawan

// --- HALAMAN KARYAWAN ---
import DashboardKaryawan from "./pages/karyawan/dashboard"; 
import Absensi from "./pages/karyawan/absensi";
import FormPerizinan from "./pages/karyawan/formperizinan";
import Riwayat from "./pages/karyawan/riwayat";

function App() {
  return (
    // 3. WAJIB BUNGKUS DENGAN AUTHPROVIDER
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* --- ROUTE PUBLIK --- */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />

          {/* --- ROUTE KHUSUS HRD (Diproteksi) --- */}
          <Route element={<ProtectedRoute allowedRoles={['hrd']} />}>
            {/* Dashboard HRD */}
            <Route path="/hrd/dashboard" element={<DashboardHRD />} />
            
            {/* Kelola Cabang */}
            <Route path="/hrd/kelolacabang" element={<KelolaCabang />} />

            {/* Data Karyawan (HALAMAN BARU) */}
            <Route path="/hrd/datakaryawan" element={<DataKaryawan />} />
          </Route>

          {/* --- ROUTE KHUSUS KARYAWAN (Diproteksi) --- */}
          <Route element={<ProtectedRoute allowedRoles={['karyawan']} />}>
            {/* Dashboard Utama Karyawan */}
            <Route path="/karyawan/dashboard" element={<DashboardKaryawan />} />
            
            {/* Fitur-fitur Karyawan */}
            <Route path="/karyawan/absensi" element={<Absensi />} />
            <Route path="/karyawan/perizinan" element={<FormPerizinan />} />
            <Route path="/karyawan/riwayat" element={<Riwayat />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;