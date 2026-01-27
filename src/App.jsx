import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-[#E2E5FF] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[400px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center p-8 pt-16">
        <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Sistem Absensi</h1>
        <p className="text-gray-500 mb-10 text-center">Masuk ke akun anda</p>
        <div className="w-full space-y-6">
          <input type="text" placeholder="Masukkan Username" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <input type="password" placeholder="Masukkan Password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-lg mt-4">Masuk</button>
        </div>
        <footer className="mt-12 text-gray-400 text-sm">Sistem Absensi Karyawan</footer>
      </div>
    </div>
  );
}
export default App;