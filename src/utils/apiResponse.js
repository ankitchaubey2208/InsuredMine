function sendSuccess(res, { status = 200, message, data = null, meta } = {}) {
  const body = { success: true, message, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(status).json(body);
}

function sendError(res, { status = 500, message = 'Internal server error', details } = {}) {
  const body = { success: false, message, data: null };
  if (details !== undefined) body.details = details;
  return res.status(status).json(body);
}

module.exports = { sendSuccess, sendError };
