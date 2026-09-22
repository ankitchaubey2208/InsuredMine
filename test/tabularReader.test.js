const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const ExcelJS = require('exceljs');
const { readRows } = require('../src/services/tabularReader');

test('reads CSV headers and quoted values', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'policy-csv-'));
  const file = path.join(directory, 'sample.csv');
  await fs.writeFile(file, 'agent,account_name\nAlex,"Smith, Jones"\n');
  const rows = await readRows(file);
  assert.deepEqual(rows, [{ agent: 'Alex', account_name: 'Smith, Jones' }]);
  await fs.rm(directory, { recursive: true, force: true });
});

test('reads the first XLSX worksheet', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'policy-xlsx-'));
  const file = path.join(directory, 'sample.xlsx');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Policies');
  sheet.addRow(['agent', 'policy_number']);
  sheet.addRow(['Alex', 'P-1']);
  await workbook.xlsx.writeFile(file);
  const rows = await readRows(file);
  assert.deepEqual(rows, [{ agent: 'Alex', policy_number: 'P-1' }]);
  await fs.rm(directory, { recursive: true, force: true });
});
