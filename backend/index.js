const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Core middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CodeCards API is running" });
});

// Route mounting
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/decks", require("./routes/deck.routes"));
app.use("/api/decks/:deckId/cards", require("./routes/card.routes"));
app.use("/api/quiz", require("./routes/quiz.routes"));

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
