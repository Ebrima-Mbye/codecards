// CodeCards — main.js
// Entry point for the landing page. Auth-aware redirect logic, shared init.

const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip landing page and go to dashboard
  if (localStorage.getItem("cc_token")) {
    window.location.href = "pages/dashboard.html";
  }
});
