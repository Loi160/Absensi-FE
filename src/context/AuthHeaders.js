export const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const sessionToken = localStorage.getItem("session_token");

  return {
    "Content-Type": "application/json",
    "x-user-id": user?.id || "",
    "x-session-token": sessionToken || "",
  };
};