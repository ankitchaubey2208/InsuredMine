const test = require('node:test');
const assert = require('node:assert/strict');
const { buildScheduleDate } = require('../src/utils/scheduleDate');

test('builds a date from an explicit UTC offset', () => {
  assert.equal(buildScheduleDate('2026-09-22', '18:30', '+05:30').toISOString(), '2026-09-22T13:00:00.000Z');
});

test('rejects impossible calendar dates', () => {
  assert.throws(() => buildScheduleDate('2026-02-30', '10:00', '+00:00'), /valid calendar date/);
});

test('rejects invalid time values', () => {
  assert.throws(() => buildScheduleDate('2026-09-22', '25:00'), /time must use/);
});
