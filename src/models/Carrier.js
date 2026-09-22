const mongoose = require('mongoose');
const { baseSchemaOptions } = require('./options');

const carrierSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true, unique: true, index: true }
}, baseSchemaOptions);

module.exports = mongoose.models.Carrier || mongoose.model('Carrier', carrierSchema);
