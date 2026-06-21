const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  language: { type: String, trim: true, default: 'general' }, // e.g. "JavaScript", "Python"
}, { timestamps: true });

module.exports = mongoose.model('Deck', deckSchema);
