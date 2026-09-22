const { searchPoliciesByUsername, getPoliciesGroupedByUser } = require('../services/policyService');
const { sendSuccess } = require('../utils/apiResponse');
const { validatePolicySearch, validatePagination } = require('../validators/policyValidator');

async function searchPolicies(req, res) {
  const { username } = validatePolicySearch(req.query);
  const policies = await searchPoliciesByUsername(username);
  return sendSuccess(res, {
    message: policies.length ? 'Policies retrieved successfully' : 'No policies found',
    data: policies,
    meta: { count: policies.length }
  });
}

async function aggregatePolicies(req, res) {
  const pagination = validatePagination(req.query);
  const result = await getPoliciesGroupedByUser(pagination);
  const { items, ...meta } = result;
  return sendSuccess(res, {
    message: 'Policies grouped by user retrieved successfully',
    data: items,
    meta
  });
}

module.exports = { searchPolicies, aggregatePolicies };
