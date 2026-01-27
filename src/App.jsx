import React from 'react';
// 1. Import kedua gambar custom kamu di sini
import profileIcon from './gambar/Profile.png';
import passwordIcon from './gambar/Password.png'; // <--- Ini yang baru ditambahkan

// Catatan: Kita hapus import LockClosedIcon karena sudah tidak dipakai lagi.

function App() {
  return (
    <div className="min-h-screen bg-[#E2E5FF] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[400px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center p-8 pt-16 relative">
        
        {/* --- Bagian Ikon Atas (Gembok Besar) --- */}
        <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg p-4">
          {/* Kita ganti LockClosedIcon dengan gambar Password.png */}
          <img 
            src={passwordIcon} 
            alt="Security Icon" 
            // Tambahkan 'brightness-0 invert' agar gambarnya jadi putih (jika gambar aslinya hitam/abu)
            // Hapus 'brightness-0 invert' jika gambar Password.png kamu sudah berwarna putih.
            className="h-full w-full object-contain brightness-0 invert" 
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">Sistem Absensi</h1>
        <p className="text-gray-500 mb-10 text-center">Masuk ke akun anda</p>

        <div className="w-full space-y-6">
          {/* --- Input Username (Pakai Profile.png) --- */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <div className="relative text-gray-400 focus-within:text-blue-500">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img 
                  src={profileIcon} 
                  alt="User Icon" 
                  className="h-5 w-5 object-contain" 
                />
              </div>
              <input 
                type="text" 
                placeholder="Masukkan Username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

          {/* --- Input Password (Pakai Password.png) --- */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative text-gray-400 focus-within:text-blue-500">
              {/* Di sini kita ganti ikon Heroicons dengan gambar custom */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                 <img 
                  src={passwordIcon} // <--- Menggunakan gambar yang diimpor
                  alt="Password Icon" 
                  className="h-5 w-5 object-contain" // Styling disamakan dengan ikon profil
                />
              </div>
              <input 
                type="password" 
                placeholder="Masukkan Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-lg mt-4">
            Masuk
          </button>
        </div>

        <footer className="mt-12 text-gray-400 text-sm">
          Sistem Absensi Karyawan
        </footer>
      </div>
    </div>
  );
}

export default App;