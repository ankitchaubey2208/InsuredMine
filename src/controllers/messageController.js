const mongoose = require('mongoose');
const { AppError } = require('../errors/AppError');
const { MessageSchedule } = require('../models');
const { sendSuccess } = require('../utils/apiResponse');
const { validateScheduleMessage } = require('../validators/messageValidator');

async function scheduleMessage(req, res) {
  const scheduleInput = validateScheduleMessage(req.body);
  const schedule = await MessageSchedule.create(scheduleInput);
  return sendSuccess(res, {
    status: 201,
    message: 'Message scheduled successfully',
    data: {
      id: schedule._id,
      message: schedule.message,
      scheduledFor: schedule.scheduledFor,
      status: schedule.status
    }
  });
}

async function getScheduledMessage(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError('Invalid schedule id', 400);
  }

  const schedule = await MessageSchedule.findById(req.params.id).lean();
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }

  return sendSuccess(res, { message: 'Schedule retrieved successfully', data: schedule });
}

module.exports = { scheduleMessage, getScheduledMessage };
