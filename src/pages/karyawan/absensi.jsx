import "./absensi.css";

export default function Absensi() {
  return (
    <div className="absensi">

      {/* HEADER HIJAU */}
      <div className="header">
        <div className="back">←</div>

        <div className="logo">AMGACORP</div>

        <h2>Sistem Absensi Karyawan</h2>
        <p>Silakan lakukan absensi hari ini</p>
      </div>

      {/* CARD */}
      <div className="card">
        <h3>Formulir Absensi</h3>
        <span className="sub">Pastikan data kehadiran diisi dengan benar.</span>

        <div className="status">
          <button className="active">Masuk</button>
          <button>Istirahat</button>
          <button>Pulang</button>
        </div>

        <label>Cabang</label>
        <select>
          <option>Pilih cabang penugasan</option>
        </select>

        <label>Bukti Foto</label>
        <button className="foto">📷 Ambil Foto Kehadiran</button>

        <button className="submit">✔ Kirim Absensi Sekarang</button>
      </div>
    </div>
  );
}
