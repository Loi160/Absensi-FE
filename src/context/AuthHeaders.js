// ============================================================================
// UTILITIES: AUTHENTICATION HEADERS
// ============================================================================

// Menghasilkan header HTTP yang memuat kredensial sesi pengguna untuk request API
export const getAuthHeaders = () => {
  let user = null;

  // Memastikan parsing JSON aman dari potensi error jika data storage korup
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Gagal mengurai data pengguna dari localStorage:", error);
  }

  const sessionToken = localStorage.getItem("session_token");

  return {
    "Content-Type": "application/json",
    "x-user-id": user?.id || "",
    "x-session-token": sessionToken || "",
  };
};