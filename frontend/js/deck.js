// CodeCards — deck.js

document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearAuth();
    window.location.href = "../index.html";
  });

  const params = new URLSearchParams(window.location.search);
  const deckId = params.get("id");
  if (!deckId) {
    window.location.href = "dashboard.html";
    return;
  }

  // ── Load deck header ─────────────────────────────────────────────────────
  try {
    const deck = await decks.get(deckId);
    document.title = `${deck.title} — CodeCards`;
    document.getElementById("deck-title").textContent = deck.title;
    document.getElementById("deck-desc").textContent = deck.description || "";
    document.getElementById("deck-lang-badge").textContent =
      deck.language || "general";
    document.getElementById("quiz-btn").href = `quiz.html?id=${deckId}`;
  } catch (err) {
    showError(document.getElementById("page-error"), err.message);
  }

  await loadCards();

  // ── Modal ────────────────────────────────────────────────────────────────
  const modal = document.getElementById("card-modal");
  const modalTitle = document.getElementById("card-modal-title");
  const cardForm = document.getElementById("card-form");
  const submitBtn = document.getElementById("card-submit-btn");
  const modalError = document.getElementById("card-modal-error");
  const langGroup = document.getElementById("lang-group");

  document
    .getElementById("add-card-btn")
    .addEventListener("click", () => openModal());
  document
    .getElementById("card-modal-close")
    .addEventListener("click", closeModal);
  document
    .getElementById("card-modal-cancel")
    .addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById("card-type").addEventListener("change", (e) => {
    langGroup.style.display = e.target.value === "code" ? "" : "none";
  });

  function openModal(card = null) {
    modalError.classList.add("hidden");
    document.getElementById("card-id").value = card ? card._id : "";
    document.getElementById("card-front").value = card ? card.front : "";
    document.getElementById("card-back").value = card ? card.back : "";
    document.getElementById("card-type").value = card ? card.cardType : "text";
    document.getElementById("card-language").value = card
      ? card.language || ""
      : "";
    langGroup.style.display = card && card.cardType === "code" ? "" : "none";
    modalTitle.textContent = card ? "Edit Card" : "Add Card";
    submitBtn.textContent = card ? "Save Changes" : "Add Card";
    modal.classList.remove("hidden");
    document.getElementById("card-front").focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  cardForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    modalError.classList.add("hidden");
    submitBtn.disabled = true;

    const id = document.getElementById("card-id").value;
    const front = document.getElementById("card-front").value.trim();
    const back = document.getElementById("card-back").value.trim();
    const cardType = document.getElementById("card-type").value;
    const language = document.getElementById("card-language").value.trim();

    if (!front || !back) {
      showError(modalError, "Both front and back are required.");
      submitBtn.disabled = false;
      return;
    }

    try {
      if (id) {
        await cards.update(deckId, id, { front, back, cardType, language });
      } else {
        await cards.create(deckId, { front, back, cardType, language });
      }
      closeModal();
      await loadCards();
    } catch (err) {
      showError(modalError, err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ── Cards list ───────────────────────────────────────────────────────────
  async function loadCards() {
    const list = document.getElementById("cards-list");
    const errEl = document.getElementById("page-error");
    try {
      const data = await cards.list(deckId);
      if (data.length === 0) {
        list.innerHTML = `<p class="empty-state">No cards yet. Hit "+ Add Card" to create your first one.</p>`;
        return;
      }
      list.innerHTML = data
        .map(
          (card, i) => `
        <div class="card-item" data-id="${card._id}">
          <div class="card-item-index">${i + 1}</div>
          <div class="card-item-body">
            <div class="card-side-label">Front</div>
            <div class="${card.cardType === "code" ? "card-code" : "card-text"}">${escHtml(card.front)}</div>
            <div class="card-side-label mt-sm">Back</div>
            <div class="${card.cardType === "code" ? "card-code" : "card-text"}">${escHtml(card.back)}</div>
            ${card.language ? `<span class="card-lang-tag">${escHtml(card.language)}</span>` : ""}
          </div>
          <div class="card-item-actions">
            <button class="btn btn-ghost btn-sm edit-card-btn" data-card='${JSON.stringify(card).replace(/'/g, "&#39;")}'>Edit</button>
            <button class="btn btn-danger btn-sm delete-card-btn" data-id="${card._id}">Delete</button>
          </div>
        </div>
      `,
        )
        .join("");

      list.querySelectorAll(".edit-card-btn").forEach((btn) => {
        btn.addEventListener("click", () =>
          openModal(JSON.parse(btn.dataset.card)),
        );
      });

      list.querySelectorAll(".delete-card-btn").forEach((btn) => {
        btn.addEventListener("click", () => deleteCard(btn.dataset.id));
      });
    } catch (err) {
      showError(errEl, err.message);
    }
  }

  async function deleteCard(id) {
    if (!confirm("Delete this card?")) return;
    try {
      await cards.remove(deckId, id);
      await loadCards();
    } catch (err) {
      showError(document.getElementById("page-error"), err.message);
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
