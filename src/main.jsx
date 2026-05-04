import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";

// ============================================================================
// ROOT: INISIALISASI APLIKASI
// ============================================================================

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// ============================================================================
// RENDER: APLIKASI UTAMA
// ============================================================================

// Menjalankan aplikasi di dalam StrictMode untuk membantu mendeteksi potensi masalah saat development.
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);