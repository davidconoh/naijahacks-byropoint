const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Number, required: true },
  storedAt: { type: Number, default: Date.now },
  paragraphs: [String],
  subtitle: String
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', schema);