const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('csv-parse/sync');
const ExcelJS = require('exceljs');

async function readRows(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.csv') {
    return parse(fs.readFileSync(filePath, 'utf8'), {
      columns: true,
      bom: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true
    });
  }
  if (extension === '.xlsx') {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('Workbook has no worksheets');
    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
      headers[col] = String(cell.text || '').trim();
    });
    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const record = {};
      headers.forEach((header, col) => {
        if (header) record[header] = row.getCell(col).text;
      });
      rows.push(record);
    });
    return rows;
  }
  throw new Error('Only CSV and XLSX files are supported');
}

module.exports = { readRows };
