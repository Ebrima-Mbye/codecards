const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createDeck,
  getDecks,
  getDeck,
  updateDeck,
  deleteDeck,
} = require("../controllers/deck.controller");

router.use(authMiddleware);

router.get("/", getDecks);
router.post("/", createDeck);
router.get("/:id", getDeck);
router.put("/:id", updateDeck);
router.delete("/:id", deleteDeck);

module.exports = router;
