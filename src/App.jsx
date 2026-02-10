import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Halaman sesuai struktur folder Abang
import Login from "./pages/auth/login"; 
import Dashboard from "./pages/karyawan/dashboard";
import Absensi from "./pages/karyawan/absensi"; 
import FormPerizinan from "./pages/karyawan/formperizinan"; 

// 1. TAMBAHKAN IMPORT RIWAYAT
import Riwayat from "./pages/karyawan/riwayat"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Jalur utama (Login) */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Halaman Absensi */}
        <Route path="/karyawan/absensi" element={<Absensi />} />

        {/* Halaman Perizinan */}
        <Route path="/karyawan/perizinan" element={<FormPerizinan />} />
        
        {/* 2. TAMBAHKAN JALUR RIWAYAT INI */}
        {/* Path ini harus "/riwayat" agar cocok dengan tombol di Dashboard */}
        <Route path="/riwayat" element={<Riwayat />} />
        
      </Routes>
    </Router>
  );
}

export default App;