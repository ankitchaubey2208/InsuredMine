const { parentPort, workerData } = require('node:worker_threads');
const { connectDatabase, disconnectDatabase } = require('../config/db');
const { normalizeRow } = require('../utils/importMapping');
const { readRows } = require('../services/tabularReader');
const { importRows } = require('../services/importPersistenceService');

async function run() {
  try {
    const rawRows = await readRows(workerData.filePath);
    const rows = [];
    const errors = [];

    for (const [index, row] of rawRows.entries()) {
      const result = normalizeRow(row, index + 2);
      if (result.error) {
        errors.push(result.error);
      } else {
        rows.push(result.value);
      }
    }

    if (!rows.length) {
      throw new Error(`No valid rows found. ${errors.slice(0, 5).join('; ')}`);
    }

    await connectDatabase(workerData.mongoUri);
    const summary = await importRows(rows);
    parentPort.postMessage({
      ok: true,
      summary: {
        ...summary,
        rejectedRows: errors.length,
        errors: errors.slice(0, 20)
      }
    });
  } catch (error) {
    parentPort.postMessage({ ok: false, error: error.message });
  } finally {
    await disconnectDatabase().catch(() => {});
  }
}

run();
