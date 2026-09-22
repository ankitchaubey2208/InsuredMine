const test = require('node:test');
const assert = require('node:assert/strict');
const { numberFromEnv } = require('../src/config/env');

test('uses a numeric environment value within bounds', () => {
  process.env.TEST_NUMERIC_CONFIG = '42';
  assert.equal(numberFromEnv('TEST_NUMERIC_CONFIG', 10, { min: 1, max: 100 }), 42);
  delete process.env.TEST_NUMERIC_CONFIG;
});

test('rejects an out-of-range environment value', () => {
  process.env.TEST_NUMERIC_CONFIG = '101';
  assert.throws(
    () => numberFromEnv('TEST_NUMERIC_CONFIG', 10, { min: 1, max: 100 }),
    /between 1 and 100/
  );
  delete process.env.TEST_NUMERIC_CONFIG;
});
