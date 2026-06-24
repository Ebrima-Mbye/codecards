// CodeCards — api.js
// Thin fetch wrapper that attaches the JWT and handles JSON.

const API_BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("cc_token");
}

function saveAuth(token, user) {
  localStorage.setItem("cc_token", token);
  localStorage.setItem("cc_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("cc_token");
  localStorage.removeItem("cc_user");
}

function getUser() {
  const raw = localStorage.getItem("cc_user");
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return Boolean(getToken());
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Auth
const auth = {
  register: (body) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
};

// Decks
const decks = {
  list: () => apiFetch("/decks"),
  get: (id) => apiFetch(`/decks/${id}`),
  create: (body) =>
    apiFetch("/decks", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    apiFetch(`/decks/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => apiFetch(`/decks/${id}`, { method: "DELETE" }),
};

// Cards
const cards = {
  list: (deckId) => apiFetch(`/decks/${deckId}/cards`),
  create: (deckId, body) =>
    apiFetch(`/decks/${deckId}/cards`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (deckId, id, body) =>
    apiFetch(`/decks/${deckId}/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (deckId, id) =>
    apiFetch(`/decks/${deckId}/cards/${id}`, { method: "DELETE" }),
};

// Quiz
const quiz = {
  start: (deckId) => apiFetch(`/quiz/${deckId}`),
  submitScore: (deckId, body) =>
    apiFetch(`/quiz/${deckId}/score`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  scores: () => apiFetch("/quiz/scores"),
};

function showError(containerEl, message) {
  containerEl.textContent = message;
  containerEl.classList.remove("hidden");
}

function redirectIfLoggedOut() {
  if (!isLoggedIn()) {
    window.location.href = "../pages/login.html";
  }
}

function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = "./pages/dashboard.html";
  }
}
