const Card = require("../models/card.model");
const Deck = require("../models/deck.model");
const Score = require("../models/score.model");

async function getQuizCards(req, res, next) {
  try {
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      owner: req.userId,
    });
    if (!deck) {
      const err = new Error("Deck not found");
      err.statusCode = 404;
      return next(err);
    }
    const cards = await Card.find({ deck: deck._id });
    if (cards.length === 0) {
      const err = new Error("This deck has no cards yet");
      err.statusCode = 400;
      return next(err);
    }
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    res.json({ deck, cards });
  } catch (err) {
    next(err);
  }
}

async function submitScore(req, res, next) {
  try {
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      owner: req.userId,
    });
    if (!deck) {
      const err = new Error("Deck not found");
      err.statusCode = 404;
      return next(err);
    }
    const { correct, total } = req.body;
    if (correct === undefined || total === undefined) {
      const err = new Error("correct and total are required");
      err.statusCode = 400;
      return next(err);
    }
    const score = await Score.create({
      user: req.userId,
      deck: deck._id,
      correct,
      total,
    });
    res.status(201).json(score);
  } catch (err) {
    next(err);
  }
}

async function getScores(req, res, next) {
  try {
    const scores = await Score.find({ user: req.userId })
      .populate("deck", "title language")
      .sort({ takenAt: -1 })
      .limit(20);
    res.json(scores);
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuizCards, submitScore, getScores };
