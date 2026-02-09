import React from "react";
import "./login.css";

import logo from "../../assets/logoamaga.svg";
import profileIcon from "../../assets/profile.svg";
import passwordIcon from "../../assets/password.svg";

const Login = () => {
  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="logo-wrapper">
          <img src={logo} alt="Logo Amaga" className="logo" />
        </div>

        <h2 className="title">Sistem Absensi</h2>
        <p className="subtitle">Masuk ke akun anda</p>

        <div className="input-group">
          <label>Username</label>
          <div className="input-wrapper">
            <img src={profileIcon} alt="Username" />
            <input type="text" placeholder="Masukkan Username" />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-wrapper">
            <img src={passwordIcon} alt="Password" />
            <input type="password" placeholder="Masukkan Password" />
          </div>
        </div>

        <button className="login-button">Masuk</button>

        <p className="footer-text">Sistem Absensi Karyawan</p>

      </div>
    </div>
  );
};

export default Login;
