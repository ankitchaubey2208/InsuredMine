const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const { getConfig } = require('../config/env');
const { AppError } = require('../errors/AppError');

const allowed = new Set(['.csv', '.xlsx']);
const { maxUploadMb } = getConfig();

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '../../uploads'),
    filename: (_req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    }
  }),
  limits: { fileSize: maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isAllowed = allowed.has(extension);
    callback(isAllowed ? null : new AppError('Only CSV and XLSX files are supported', 400), isAllowed);
  }
});

module.exports = upload;
