const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createCard,
  getCards,
  updateCard,
  deleteCard,
} = require("../controllers/card.controller");

router.use(authMiddleware);

router.get("/", getCards);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

module.exports = router;
