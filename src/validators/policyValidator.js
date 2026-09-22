const { AppError } = require('../errors/AppError');

function validatePolicySearch(query = {}) {
  const username = String(query.username || '').trim();
  if (!username) {
    throw new AppError('username query parameter is required', 400);
  }
  if (username.length > 120) {
    throw new AppError('username is too long', 400);
  }

  return { username };
}

function validatePagination(query = {}) {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 25;
  if (page < 1) {
    throw new AppError('page must be a positive integer', 400);
  }
  if (limit < 1 || limit > 100) {
    throw new AppError('limit must be between 1 and 100', 400);
  }

  return { page, limit };
}

module.exports = { validatePolicySearch, validatePagination };
