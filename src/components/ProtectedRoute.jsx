import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. Kalau belum login, tendang ke login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 2. Kalau role tidak sesuai, tendang keluar (opsional, bisa ke dashboard user ybs)
  // Misal: User karyawan mau masuk halaman HRD
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     alert("Anda tidak punya akses ke halaman ini!");
     return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;