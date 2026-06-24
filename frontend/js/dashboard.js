// CodeCards — dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const user = getUser();
  document.getElementById("greeting").textContent = `Hi, ${user.username}`;

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearAuth();
    window.location.href = "../index.html";
  });

  await Promise.all([loadDecks(), loadScores()]);

  // ── Modal ────────────────────────────────────────────────────────────────
  const modal = document.getElementById("deck-modal");
  const modalTitle = document.getElementById("modal-title");
  const deckForm = document.getElementById("deck-form");
  const submitBtn = document.getElementById("deck-submit-btn");
  const modalError = document.getElementById("modal-error");

  document
    .getElementById("new-deck-btn")
    .addEventListener("click", () => openModal());
  document
    .getElementById("modal-close-btn")
    .addEventListener("click", closeModal);
  document
    .getElementById("modal-cancel-btn")
    .addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  function openModal(deck = null) {
    modalError.classList.add("hidden");
    document.getElementById("deck-id").value = deck ? deck._id : "";
    document.getElementById("deck-title").value = deck ? deck.title : "";
    document.getElementById("deck-language").value = deck
      ? deck.language
      : "general";
    document.getElementById("deck-description").value = deck
      ? deck.description || ""
      : "";
    modalTitle.textContent = deck ? "Edit Deck" : "New Deck";
    submitBtn.textContent = deck ? "Save Changes" : "Create Deck";
    modal.classList.remove("hidden");
    document.getElementById("deck-title").focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  deckForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    modalError.classList.add("hidden");
    submitBtn.disabled = true;

    const id = document.getElementById("deck-id").value;
    const title = document.getElementById("deck-title").value.trim();
    const language = document.getElementById("deck-language").value;
    const description = document
      .getElementById("deck-description")
      .value.trim();

    if (!title) {
      showError(modalError, "Title is required.");
      submitBtn.disabled = false;
      return;
    }

    try {
      if (id) {
        await decks.update(id, { title, language, description });
      } else {
        await decks.create({ title, language, description });
      }
      closeModal();
      await loadDecks();
    } catch (err) {
      showError(modalError, err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ── Deck grid ────────────────────────────────────────────────────────────
  async function loadDecks() {
    const grid = document.getElementById("decks-grid");
    const errEl = document.getElementById("deck-error");
    try {
      const data = await decks.list();
      if (data.length === 0) {
        grid.innerHTML = `<p class="empty-state">No decks yet. Create your first one!</p>`;
        return;
      }
      grid.innerHTML = data
        .map(
          (deck) => `
        <div class="deck-card" data-id="${deck._id}">
          <div class="deck-card-body">
            <span class="deck-lang-badge">${deck.language || "general"}</span>
            <h3 class="deck-title">${escHtml(deck.title)}</h3>
            <p class="deck-desc">${escHtml(deck.description || "")}</p>
          </div>
          <div class="deck-card-footer">
            <a href="deck.html?id=${deck._id}" class="btn btn-primary btn-sm">Open</a>
            <button class="btn btn-ghost btn-sm edit-deck-btn" data-deck='${JSON.stringify(deck)}'>Edit</button>
            <button class="btn btn-danger btn-sm delete-deck-btn" data-id="${deck._id}">Delete</button>
          </div>
        </div>
      `,
        )
        .join("");

      grid.querySelectorAll(".edit-deck-btn").forEach((btn) => {
        btn.addEventListener("click", () =>
          openModal(JSON.parse(btn.dataset.deck)),
        );
      });

      grid.querySelectorAll(".delete-deck-btn").forEach((btn) => {
        btn.addEventListener("click", () => deleteDeck(btn.dataset.id));
      });
    } catch (err) {
      showError(errEl, err.message);
    }
  }

  async function deleteDeck(id) {
    if (!confirm("Delete this deck and all its cards? This cannot be undone."))
      return;
    try {
      await decks.remove(id);
      await loadDecks();
    } catch (err) {
      showError(document.getElementById("deck-error"), err.message);
    }
  }

  // ── Scores ───────────────────────────────────────────────────────────────
  async function loadScores() {
    const list = document.getElementById("scores-list");
    try {
      const data = await quiz.scores();
      if (data.length === 0) {
        list.innerHTML = `<p class="empty-state">No quizzes taken yet. Open a deck and hit Start Quiz!</p>`;
        return;
      }
      list.innerHTML = `<table class="scores-table">
        <thead><tr><th>Deck</th><th>Score</th><th>%</th><th>Date</th></tr></thead>
        <tbody>${data
          .map(
            (s) => `
          <tr>
            <td>${escHtml(s.deck ? s.deck.title : "Unknown")}</td>
            <td>${s.correct} / ${s.total}</td>
            <td class="${pctClass(s.correct, s.total)}">${pct(s.correct, s.total)}%</td>
            <td>${new Date(s.takenAt).toLocaleDateString()}</td>
          </tr>`,
          )
          .join("")}
        </tbody>
      </table>`;
    } catch (err) {
      list.innerHTML = `<p class="text-muted">Could not load scores.</p>`;
    }
  }
});

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pct(correct, total) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function pctClass(correct, total) {
  const p = pct(correct, total);
  if (p >= 80) return "score-good";
  if (p >= 50) return "score-mid";
  return "score-bad";
}
