const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
  correct: { type: Number, required: true },
  total: { type: Number, required: true },
  takenAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Score', scoreSchema);
