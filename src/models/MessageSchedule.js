const mongoose = require('mongoose');
const { MESSAGE_STATUS } = require('../constants/messageStatus');
const { baseSchemaOptions } = require('./options');

const messageScheduleSchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true },
  scheduledFor: { type: Date, required: true },
  status: {
    type: String,
    enum: Object.values(MESSAGE_STATUS),
    default: MESSAGE_STATUS.SCHEDULED
  },
  attempts: { type: Number, default: 0, min: 0 },
  processedAt: Date,
  failedAt: Date,
  lastError: String
}, baseSchemaOptions);

messageScheduleSchema.index({ status: 1, scheduledFor: 1 });

module.exports = mongoose.models.MessageSchedule || mongoose.model('MessageSchedule', messageScheduleSchema);
