const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getQuizCards,
  submitScore,
  getScores,
} = require("../controllers/quiz.controller");

router.use(authMiddleware);

// Must come before /:deckId to avoid shadowing
router.get("/scores", getScores);
router.get("/:deckId", getQuizCards);
router.post("/:deckId/score", submitScore);

module.exports = router;
