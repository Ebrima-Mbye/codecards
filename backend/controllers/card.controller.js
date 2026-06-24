const Card = require("../models/card.model");
const Deck = require("../models/deck.model");

async function createCard(req, res, next) {
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
    const { front, back, cardType, language } = req.body;
    if (!front || !back) {
      const err = new Error("front and back are required");
      err.statusCode = 400;
      return next(err);
    }
    const card = await Card.create({
      deck: deck._id,
      front,
      back,
      cardType,
      language,
    });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

async function getCards(req, res, next) {
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
    const cards = await Card.find({ deck: deck._id }).sort({ createdAt: 1 });
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

async function updateCard(req, res, next) {
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
    const { front, back, cardType, language } = req.body;
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, deck: deck._id },
      { front, back, cardType, language },
      { new: true, runValidators: true },
    );
    if (!card) {
      const err = new Error("Card not found");
      err.statusCode = 404;
      return next(err);
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function deleteCard(req, res, next) {
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
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      deck: deck._id,
    });
    if (!card) {
      const err = new Error("Card not found");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ message: "Card deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCard, getCards, updateCard, deleteCard };
