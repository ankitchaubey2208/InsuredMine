const fs = require('node:fs/promises');
const { AppError } = require('../errors/AppError');
const { importFileInWorker } = require('../services/importService');
const { sendSuccess } = require('../utils/apiResponse');

async function importPolicies(req, res) {
  if (!req.file) {
    throw new AppError('Attach a file in multipart field "file"', 400);
  }

  try {
    const summary = await importFileInWorker(req.file.path, process.env.MONGODB_URI);
    return sendSuccess(res, {
      status: 201,
      message: 'Import completed',
      data: summary
    });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
}

module.exports = { importPolicies };
