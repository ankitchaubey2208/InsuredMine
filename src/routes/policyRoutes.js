const express = require('express');
const { searchPolicies, aggregatePolicies } = require('../controllers/policyController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/search', asyncHandler(searchPolicies));
router.get('/aggregate', asyncHandler(aggregatePolicies));
router.get('/by-user', asyncHandler(aggregatePolicies));

module.exports = router;
