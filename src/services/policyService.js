const { escapeRegex } = require('../utils/regex');
const { findPoliciesByUserPattern, aggregatePoliciesByUser } = require('../repositories/policyRepository');

async function searchPoliciesByUsername(username) {
  const literalPattern = new RegExp(escapeRegex(username), 'i');
  return findPoliciesByUserPattern(literalPattern);
}

async function getPoliciesGroupedByUser(pagination) {
  const result = await aggregatePoliciesByUser(pagination);
  return {
    ...result,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(result.totalUsers / pagination.limit)
  };
}

module.exports = { searchPoliciesByUsername, getPoliciesGroupedByUser };
