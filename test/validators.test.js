const test = require('node:test');
const assert = require('node:assert/strict');
const { validateScheduleMessage } = require('../src/validators/messageValidator');
const { validatePagination, validatePolicySearch } = require('../src/validators/policyValidator');

test('normalizes a valid policy search', () => {
  assert.deepEqual(validatePolicySearch({ username: '  Lura  ' }), { username: 'Lura' });
});

test('rejects an empty policy search', () => {
  assert.throws(() => validatePolicySearch({}), /required/);
});

test('validates aggregation pagination bounds', () => {
  assert.deepEqual(validatePagination({ page: '2', limit: '50' }), { page: 2, limit: 50 });
  assert.throws(() => validatePagination({ limit: '101' }), /between 1 and 100/);
});

test('accepts a future scheduled message', () => {
  const input = validateScheduleMessage(
    { message: ' Renewal reminder ', day: '2030-01-01', time: '10:30', utcOffset: '+00:00' },
    new Date('2029-01-01T00:00:00.000Z')
  );
  assert.equal(input.message, 'Renewal reminder');
  assert.equal(input.scheduledFor.toISOString(), '2030-01-01T10:30:00.000Z');
});

test('rejects a past scheduled message', () => {
  assert.throws(() => validateScheduleMessage(
    { message: 'Late', day: '2028-01-01', time: '10:30', utcOffset: '+00:00' },
    new Date('2029-01-01T00:00:00.000Z')
  ), /future/);
});
