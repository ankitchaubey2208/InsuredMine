const mongoose = require('mongoose');
const { baseSchemaOptions } = require('./options');

const policySchema = new mongoose.Schema({
  policyNumber: { type: String, required: true, trim: true, unique: true, index: true },
  policyStartDate: Date,
  policyEndDate: Date,
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Lob', required: true, index: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier', required: true, index: true }
}, baseSchemaOptions);

policySchema.index({ user: 1, policyStartDate: -1 });

module.exports = mongoose.models.Policy || mongoose.model('Policy', policySchema);
