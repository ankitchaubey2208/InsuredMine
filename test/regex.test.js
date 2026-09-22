const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeRegex } = require('../src/utils/regex');

test('escapes user input before building a search regular expression', () => {
  const pattern = new RegExp(escapeRegex('a.b[c]$'), 'i');
  assert.equal(pattern.test('A.B[C]$'), true);
  assert.equal(pattern.test('axb'), false);
});
