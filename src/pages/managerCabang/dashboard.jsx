import "./dashboard.css";

import dashboardIcon from "./gambar/dashboard.svg";
import tambahIcon from "./gambar/tambah.svg";
import kehadiranIcon from "./gambar/kehadiran.svg";
import laporanIcon from "./gambar/laporan.svg";

export default function Dashboard() {
  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">Sistem Absensi</h2>

        <ul className="menu">
          <li>
            <img src={dashboardIcon} className="icon" />
            Dashboard
          </li>

          <li className="active">
            <img src={tambahIcon} className="icon" />
            Kelola Cabang
          </li>

          {/* ✅ FIX: pakai icon tambah */}
          <li>
            <img src={tambahIcon} className="icon" />
            Kelola Karyawan
          </li>

          <li>
            <img src={kehadiranIcon} className="icon" />
            Kehadiran
          </li>

          <li>
            <img src={laporanIcon} className="icon" />
            Laporan
          </li>
        </ul>
      </aside>


      {/* CONTENT */}
      <main className="content">

        <div className="content-header">
          <div>
            <h1>Kelola Cabang</h1>
            <p>Kelola Cabang</p>
          </div>

          <button className="btn-add">
            <img src={tambahIcon} className="icon-small" />
            Tambah Cabang Baru
          </button>
        </div>

        {/* TABLE */}
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Nama Cabang</th>
                {/* ✅ FIX: kosong tanpa tulisan Aksi */}
                <th></th>
              </tr>
            </thead>

            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  {/* ✅ semua rata kiri */}
                  <td>Cabang {i}</td>
                  <td className="action">Edit Cabang</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
