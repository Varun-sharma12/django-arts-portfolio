// frontend/app/lib/api.js

const API_BASE = "http://127.0.0.1:8000";

export async function apiFetch(endpoint, options = {}) {
  let accessToken = localStorage.getItem("accessToken");

  // 1️⃣ Attach Authorization header
  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };

  // 2️⃣ Make API request
  let response = await fetch(`${API_BASE}${endpoint}`, options);

  // 3️⃣ If access token expired → try refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    // 4️⃣ If refresh fails → logout
    if (!refreshed) {
      logout();
      throw new Error("Session expired");
    }

    // 5️⃣ Retry original request with new access token
    accessToken = localStorage.getItem("accessToken");
    options.headers.Authorization = `Bearer ${accessToken}`;
    response = await fetch(`${API_BASE}${endpoint}`, options);
  }

  return response;
}

/* ---------------- REFRESH TOKEN ---------------- */

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) return false;

  const data = await response.json();

  // Save new tokens
  localStorage.setItem("accessToken", data.access);
  if (data.refresh) {
    localStorage.setItem("refreshToken", data.refresh);
  }

  return true;
}

/* ---------------- LOGOUT ---------------- */

function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
