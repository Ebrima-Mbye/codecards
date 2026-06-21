const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
  cardType: { type: String, enum: ['text', 'code'], default: 'text' },
  front: { type: String, required: true }, // question, or code snippet with a blank/bug
  back: { type: String, required: true },  // answer / explanation
  language: { type: String, trim: true },  // syntax highlighting hint, e.g. "javascript"
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
