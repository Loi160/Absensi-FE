import React from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================================
// IMPORT: HALAMAN OTENTIKASI
// ============================================================================

import Login from "./pages/auth/login";

// ============================================================================
// IMPORT: HALAMAN ROLE HRD
// ============================================================================

import DashboardHRD from "./pages/hrd/dashboard";
import KelolaCabang from "./pages/hrd/kelolacabang";
import DataKaryawan from "./pages/hrd/datakaryawan";
import DetailKaryawan from "./pages/hrd/detailkaryawan";
import AbsenManual from "./pages/hrd/kehadiran";
import Laporan from "./pages/hrd/laporan";

// ============================================================================
// IMPORT: HALAMAN ROLE KARYAWAN
// ============================================================================

import DashboardKaryawan from "./pages/karyawan/dashboard";
import Absensi from "./pages/karyawan/absensi";
import FormPerizinan from "./pages/karyawan/formperizinan";
import Riwayat from "./pages/karyawan/riwayat";

// ============================================================================
// IMPORT: HALAMAN ROLE MANAGER CABANG
// ============================================================================

import DashboardManagerCabang from "./pages/managerCabang/dashboard";
import DataKaryawanManager from "./pages/managerCabang/datakaryawan";
import DetailKaryawanManager from "./pages/managerCabang/detailkaryawan";
import PerizinanManager from "./pages/managerCabang/perizinan";
import LaporanManager from "./pages/managerCabang/laporan";

// ============================================================================
// KONSTANTA: ROLE PENGGUNA
// ============================================================================

const USER_ROLES = {
  HRD: "hrd",
  KARYAWAN: "karyawan",
  MANAGER_CABANG: "managerCabang",
};

// ============================================================================
// ROUTES: UMUM
// ============================================================================

function PublicRoutes() {
  return (
    <>
      <Route
        path="/"
        element={
          <Navigate
            to="/auth/login"
            replace
          />
        }
      />

      <Route
        path="/auth/login"
        element={<Login />}
      />
    </>
  );
}

// ============================================================================
// ROUTES: HRD
// ============================================================================

function HRDRoutes() {
  return (
    <Route
      element={
        <ProtectedRoute
          allowedRoles={[USER_ROLES.HRD]}
        />
      }
    >
      <Route
        path="/hrd/dashboard"
        element={<DashboardHRD />}
      />

      <Route
        path="/hrd/kelolacabang"
        element={<KelolaCabang />}
      />

      <Route
        path="/hrd/datakaryawan"
        element={<DataKaryawan />}
      />

      {/* Mendukung akses detail karyawan tanpa ID maupun berdasarkan ID. */}
      <Route
        path="/hrd/detailkaryawan"
        element={<DetailKaryawan />}
      />

      <Route
        path="/hrd/detailkaryawan/:id"
        element={<DetailKaryawan />}
      />

      <Route
        path="/hrd/kehadiran"
        element={<AbsenManual />}
      />

      <Route
        path="/hrd/laporan"
        element={<Laporan />}
      />
    </Route>
  );
}

// ============================================================================
// ROUTES: KARYAWAN
// ============================================================================

function KaryawanRoutes() {
  return (
    <Route
      element={
        <ProtectedRoute
          allowedRoles={[USER_ROLES.KARYAWAN]}
        />
      }
    >
      <Route
        path="/karyawan/dashboard"
        element={<DashboardKaryawan />}
      />

      <Route
        path="/karyawan/absensi"
        element={<Absensi />}
      />

      <Route
        path="/karyawan/perizinan"
        element={<FormPerizinan />}
      />

      <Route
        path="/karyawan/riwayat"
        element={<Riwayat />}
      />
    </Route>
  );
}

// ============================================================================
// ROUTES: MANAGER CABANG
// ============================================================================

function ManagerCabangRoutes() {
  return (
    <Route
      element={
        <ProtectedRoute
          allowedRoles={[USER_ROLES.MANAGER_CABANG]}
        />
      }
    >
      <Route
        path="/managerCabang/dashboard"
        element={<DashboardManagerCabang />}
      />

      <Route
        path="/managerCabang/datakaryawan"
        element={<DataKaryawanManager />}
      />

      {/* Mendukung akses detail karyawan cabang tanpa ID maupun berdasarkan ID. */}
      <Route
        path="/managerCabang/detailkaryawan"
        element={<DetailKaryawanManager />}
      />

      <Route
        path="/managerCabang/detailkaryawan/:id"
        element={<DetailKaryawanManager />}
      />

      <Route
        path="/managerCabang/perizinan"
        element={<PerizinanManager />}
      />

      <Route
        path="/managerCabang/laporan"
        element={<LaporanManager />}
      />
    </Route>
  );
}

// ============================================================================
// ROUTES: FALLBACK
// ============================================================================

function FallbackRoute() {
  return (
    <Route
      path="*"
      element={
        <Navigate
          to="/auth/login"
          replace
        />
      }
    />
  );
}

// ============================================================================
// ROOT COMPONENT
// ============================================================================

function App() {
  return (
    // AuthProvider menyediakan akses status autentikasi ke seluruh aplikasi.
    <AuthProvider>
      <Router>
        <Routes>
          {PublicRoutes()}
          {HRDRoutes()}
          {KaryawanRoutes()}
          {ManagerCabangRoutes()}
          {FallbackRoute()}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;