const { AppError } = require('../errors/AppError');
const { buildScheduleDate } = require('../utils/scheduleDate');

function validateScheduleMessage(body = {}, now = new Date()) {
  const { message, day, time, utcOffset } = body;
  if (typeof message !== 'string' || !message.trim()) {
    throw new AppError('message is required', 400);
  }
  if (message.length > 10_000) {
    throw new AppError('message is too long', 400);
  }

  let scheduledFor;
  try {
    scheduledFor = buildScheduleDate(day, time, utcOffset);
  } catch (error) {
    throw new AppError(error.message, 400);
  }

  if (scheduledFor.getTime() <= now.getTime()) {
    throw new AppError('Scheduled date and time must be in the future', 400);
  }

  return { message: message.trim(), scheduledFor };
}

module.exports = { validateScheduleMessage };
