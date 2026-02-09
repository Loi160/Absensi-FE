import React from "react";
// Import Login yang sudah ada
import Login from "./pages/auth/login"; 
// 1. Tambahkan Import untuk Absensi (Arahkan ke folder karyawan)
import Absensi from "./pages/karyawan/absensi"; 

function App() {
  return (
    <div className="App">
      {/* 2. Matikan Login sementara dengan cara memberi komentar (pencet Ctrl + /) */}
      {/* <Login /> */}

      {/* 3. Panggil Absensi untuk melihat hasilnya */}
      <Absensi />
    </div>
  );
}

export default App;