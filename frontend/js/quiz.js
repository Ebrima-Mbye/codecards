// CodeCards — quiz.js

document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const deckId = params.get("id");
  if (!deckId) {
    window.location.href = "dashboard.html";
    return;
  }

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const loadingEl = document.getElementById("quiz-loading");
  const errorEl = document.getElementById("quiz-error");
  const progressWrap = document.getElementById("quiz-progress-wrap");
  const flashcardWrap = document.getElementById("flashcard-wrap");
  const flashcard = document.getElementById("flashcard");
  const frontContent = document.getElementById("card-front-content");
  const backContent = document.getElementById("card-back-content");
  const flipHint = document.getElementById("flip-hint");
  const verdictBtns = document.getElementById("verdict-btns");
  const missedBtn = document.getElementById("missed-btn");
  const gotItBtn = document.getElementById("got-it-btn");
  const progressBar = document.getElementById("progress-bar");
  const progressLabel = document.getElementById("progress-label");
  const deckNameEl = document.getElementById("deck-name");
  const resultsScreen = document.getElementById("results-screen");

  document.getElementById("quit-btn").addEventListener("click", () => {
    if (confirm("Quit the quiz? Progress will not be saved.")) {
      window.location.href = `deck.html?id=${deckId}`;
    }
  });

  // ── State ─────────────────────────────────────────────────────────────────
  let cardQueue = [];
  let currentIdx = 0;
  let correct = 0;
  let isFlipped = false;

  // ── Load quiz data ────────────────────────────────────────────────────────
  try {
    const data = await quiz.start(deckId);
    cardQueue = data.cards;
    deckNameEl.textContent = data.deck.title;
    document.title = `Quiz: ${data.deck.title} — CodeCards`;
    loadingEl.classList.add("hidden");
    progressWrap.classList.remove("hidden");
    flashcardWrap.classList.remove("hidden");
    document.getElementById("back-to-deck-btn").href = `deck.html?id=${deckId}`;
    showCard(0);
  } catch (err) {
    loadingEl.classList.add("hidden");
    showError(errorEl, err.message);
    return;
  }

  // ── Card display ──────────────────────────────────────────────────────────
  function showCard(idx) {
    isFlipped = false;
    flashcard.classList.remove("flipped");
    verdictBtns.classList.add("hidden");
    flipHint.classList.remove("hidden");

    const card = cardQueue[idx];
    const isCode = card.cardType === "code";

    frontContent.className =
      "card-content " + (isCode ? "card-code" : "card-text");
    frontContent.textContent = card.front;

    backContent.className =
      "card-content " + (isCode ? "card-code" : "card-text");
    backContent.textContent = card.back;

    updateProgress(idx);
  }

  function updateProgress(idx) {
    const total = cardQueue.length;
    const pct = Math.round((idx / total) * 100);
    progressBar.style.width = `${pct}%`;
    progressLabel.textContent = `${idx + 1} of ${total}`;
  }

  function flipCard() {
    if (isFlipped) return;
    isFlipped = true;
    flashcard.classList.add("flipped");
    flipHint.classList.add("hidden");
    verdictBtns.classList.remove("hidden");
  }

  // ── Interactions ──────────────────────────────────────────────────────────
  flashcard.addEventListener("click", flipCard);
  flashcard.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flipCard();
    }
  });

  gotItBtn.addEventListener("click", () => recordVerdict(true));
  missedBtn.addEventListener("click", () => recordVerdict(false));

  document.addEventListener("keydown", (e) => {
    if (!isFlipped) return;
    if (e.key === "ArrowRight" || e.key === "1") recordVerdict(true);
    if (e.key === "ArrowLeft" || e.key === "2") recordVerdict(false);
  });

  function recordVerdict(gotIt) {
    if (gotIt) correct++;
    currentIdx++;
    if (currentIdx < cardQueue.length) {
      showCard(currentIdx);
    } else {
      endQuiz();
    }
  }

  // ── Results ───────────────────────────────────────────────────────────────
  async function endQuiz() {
    progressWrap.classList.add("hidden");
    flashcardWrap.classList.add("hidden");
    resultsScreen.classList.remove("hidden");

    const total = cardQueue.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

    document.getElementById("results-score").textContent =
      `${correct} / ${total}`;
    const bar = document.getElementById("results-bar");
    bar.style.width = `${pct}%`;
    bar.className = `results-bar ${pct >= 80 ? "bar-good" : pct >= 50 ? "bar-mid" : "bar-bad"}`;

    const msg =
      pct === 100
        ? "Perfect score! 🎉"
        : pct >= 80
          ? "Great job! Keep it up."
          : pct >= 50
            ? "Good effort — review the missed cards."
            : "Keep practising — you'll get there!";
    document.getElementById("results-msg").textContent = msg;

    // Save score to backend (fire-and-forget; don't block UI)
    quiz.submitScore(deckId, { correct, total }).catch(() => {});

    document.getElementById("retry-btn").addEventListener("click", () => {
      window.location.reload();
    });
  }
});
