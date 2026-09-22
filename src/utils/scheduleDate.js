function parseOffsetMinutes(offset) {
  if (!offset) {
    return null;
  }

  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!match) {
    throw new Error('utcOffset must use +HH:MM or -HH:MM');
  }

  const minutes = Number(match[2]) * 60 + Number(match[3]);
  if (minutes > 14 * 60) {
    throw new Error('utcOffset is outside the supported range');
  }

  return (match[1] === '+' ? 1 : -1) * minutes;
}

function buildScheduleDate(day, time, utcOffset) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) {
    throw new Error('day must use YYYY-MM-DD');
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time || '')) {
    throw new Error('time must use HH:mm or HH:mm:ss');
  }

  const [year, month, date] = day.split('-').map(Number);
  const [hour, minute, second = 0] = time.split(':').map(Number);
  const offsetMinutes = parseOffsetMinutes(utcOffset);
  const result = offsetMinutes === null
    ? new Date(year, month - 1, date, hour, minute, second, 0)
    : new Date(Date.UTC(year, month - 1, date, hour, minute, second) - offsetMinutes * 60_000);

  const dateToCheck = offsetMinutes === null
    ? result
    : new Date(result.getTime() + offsetMinutes * 60_000);
  const validParts = offsetMinutes === null
    ? dateToCheck.getFullYear() === year &&
      dateToCheck.getMonth() === month - 1 &&
      dateToCheck.getDate() === date
    : dateToCheck.getUTCFullYear() === year &&
      dateToCheck.getUTCMonth() === month - 1 &&
      dateToCheck.getUTCDate() === date;

  if (!validParts) {
    throw new Error('day is not a valid calendar date');
  }

  return result;
}

module.exports = { buildScheduleDate, parseOffsetMinutes };
