const mongoose = require('mongoose');
const { baseSchemaOptions } = require('./options');

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true },
  scheduledFor: { type: Date, required: true },
  insertedAt: { type: Date, default: Date.now },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageSchedule', required: true, unique: true }
}, baseSchemaOptions);

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
