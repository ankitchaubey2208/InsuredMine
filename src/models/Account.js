const mongoose = require('mongoose');
const { baseSchemaOptions } = require('./options');

const accountSchema = new mongoose.Schema({
  accountKey: { type: String, required: true, unique: true, index: true },
  accountName: { type: String, required: true, trim: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, baseSchemaOptions);

module.exports = mongoose.models.Account || mongoose.model('Account', accountSchema);
