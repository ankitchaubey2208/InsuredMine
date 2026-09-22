const mongoose = require('mongoose');
const { baseSchemaOptions } = require('./options');

const agentSchema = new mongoose.Schema({
  agentName: { type: String, required: true, trim: true, unique: true, index: true }
}, baseSchemaOptions);

module.exports = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
