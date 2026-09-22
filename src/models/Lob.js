const mongoose = require('mongoose');
const { baseSchemaOptions } = require('./options');

const lobSchema = new mongoose.Schema({
  categoryName: { type: String, required: true, trim: true, unique: true, index: true }
}, baseSchemaOptions);

module.exports = mongoose.models.Lob || mongoose.model('Lob', lobSchema);
