const Deck = require("../models/deck.model");

async function createDeck(req, res, next) {
  try {
    const { title, description, language } = req.body;
    if (!title) {
      const err = new Error("title is required");
      err.statusCode = 400;
      return next(err);
    }
    const deck = await Deck.create({
      owner: req.userId,
      title,
      description,
      language,
    });
    res.status(201).json(deck);
  } catch (err) {
    next(err);
  }
}

async function getDecks(req, res, next) {
  try {
    const decks = await Deck.find({ owner: req.userId }).sort({
      createdAt: -1,
    });
    res.json(decks);
  } catch (err) {
    next(err);
  }
}

async function getDeck(req, res, next) {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, owner: req.userId });
    if (!deck) {
      const err = new Error("Deck not found");
      err.statusCode = 404;
      return next(err);
    }
    res.json(deck);
  } catch (err) {
    next(err);
  }
}

async function updateDeck(req, res, next) {
  try {
    const { title, description, language } = req.body;
    const deck = await Deck.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { title, description, language },
      { new: true, runValidators: true },
    );
    if (!deck) {
      const err = new Error("Deck not found");
      err.statusCode = 404;
      return next(err);
    }
    res.json(deck);
  } catch (err) {
    next(err);
  }
}

async function deleteDeck(req, res, next) {
  try {
    const deck = await Deck.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!deck) {
      const err = new Error("Deck not found");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ message: "Deck deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { createDeck, getDecks, getDeck, updateDeck, deleteDeck };
