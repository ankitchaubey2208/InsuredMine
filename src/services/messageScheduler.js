const { MessageSchedule, Message } = require('../models');
const { MESSAGE_STATUS } = require('../constants/messageStatus');

const MAX_ATTEMPTS = 3;
const STALE_PROCESSING_MS = 5 * 60 * 1000;

async function recoverStalledMessages(now = new Date()) {
  const staleBefore = new Date(now.getTime() - STALE_PROCESSING_MS);
  return MessageSchedule.updateMany(
    { status: { $in: [MESSAGE_STATUS.PROCESSING, 'processing'] }, updatedAt: { $lte: staleBefore } },
    { $set: { status: MESSAGE_STATUS.SCHEDULED, lastError: 'Recovered after interrupted processing' } }
  );
}

async function processNextDueMessage(now = new Date()) {
  const schedule = await MessageSchedule.findOneAndUpdate(
    {
      status: { $in: [MESSAGE_STATUS.SCHEDULED, 'pending'] },
      scheduledFor: { $lte: now }
    },
    {
      $set: { status: MESSAGE_STATUS.PROCESSING },
      $inc: { attempts: 1 },
      $unset: { lastError: 1, failedAt: 1 }
    },
    { sort: { scheduledFor: 1 }, new: true }
  );
  if (!schedule) {
    return false;
  }

  try {
    await Message.updateOne(
      { schedule: schedule._id },
      {
        $setOnInsert: {
          message: schedule.message,
          scheduledFor: schedule.scheduledFor,
          insertedAt: new Date()
        }
      },
      { upsert: true }
    );
    await MessageSchedule.updateOne(
      { _id: schedule._id },
      { $set: { status: MESSAGE_STATUS.COMPLETED, processedAt: new Date() } }
    );
  } catch (error) {
    await MessageSchedule.updateOne(
      { _id: schedule._id },
      { $set: {
        status: schedule.attempts >= MAX_ATTEMPTS ? MESSAGE_STATUS.FAILED : MESSAGE_STATUS.SCHEDULED,
        lastError: error.message,
        ...(schedule.attempts >= MAX_ATTEMPTS ? { failedAt: new Date() } : {})
      } }
    );
    throw error;
  }
  return true;
}

function startMessageScheduler(intervalMs = 1000) {
  let running = false;
  const tick = async () => {
    if (running) {
      return;
    }

    running = true;
    try {
      while (await processNextDueMessage()) {
        // Keep going until there are no more due messages.
      }
    } catch (error) {
      console.error('[scheduler]', error);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(tick, intervalMs);
  timer.unref();
  recoverStalledMessages()
    .then(tick)
    .catch((error) => console.error('[scheduler:recovery]', error));
  return () => clearInterval(timer);
}

module.exports = { processNextDueMessage, recoverStalledMessages, startMessageScheduler };
