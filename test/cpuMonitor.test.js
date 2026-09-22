const test = require('node:test');
const assert = require('node:assert/strict');
const { utilization } = require('../src/services/cpuMonitor');

test('calculates CPU utilization from cumulative snapshots', () => {
  const percent = utilization({ idle: 100, total: 200 }, { idle: 120, total: 300 });
  assert.equal(percent, 80);
});

test('clamps invalid deltas to zero', () => {
  assert.equal(utilization({ idle: 10, total: 10 }, { idle: 10, total: 10 }), 0);
});
