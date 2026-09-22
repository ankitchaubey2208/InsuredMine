const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeRow, parseDate } = require('../src/utils/importMapping');

test('normalizes required CSV columns and preserves identifier strings', () => {
  const result = normalizeRow({
    agent: ' Alex Watson ', firstname: 'Lura', dob: '1960-02-11', address: '170 Main',
    phone: '001234', state: 'NC', zip: '027028', email: 'LURA@EXAMPLE.COM', gender: '',
    userType: 'Active Client', account_name: 'Lura Account', category_name: 'Commercial Auto',
    company_name: 'Carrier', policy_number: '000-POLICY', policy_start_date: '2018-11-02',
    policy_end_date: '2019-11-02'
  }, 2);
  assert.equal(result.value.zipCode, '027028');
  assert.equal(result.value.phoneNumber, '001234');
  assert.equal(result.value.policyNumber, '000-POLICY');
  assert.equal(result.value.email, 'lura@example.com');
  assert.equal(result.value.userKey, 'email:lura@example.com');
});

test('reports missing required fields with source row number', () => {
  const result = normalizeRow({ firstname: 'A' }, 9);
  assert.match(result.error, /^Row 9:/);
  assert.match(result.error, /policyNumber/);
});

test('rejects invalid dates', () => {
  assert.equal(parseDate('not-a-date'), null);
  assert.equal(parseDate('2026-02-30'), null);
});
