const { sendError } = require('../utils/apiResponse');

function notFound(req, res) {
  return sendError(res, { status: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);
  const status = error.statusCode || error.status || (error.name === 'MulterError' ? 400 : 500);
  return sendError(res, {
    status,
    message: status === 500 ? 'Internal server error' : error.message,
    details: error.details
  });
}

module.exports = { notFound, errorHandler };
