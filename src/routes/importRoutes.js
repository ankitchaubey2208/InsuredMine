const express = require('express');
const { importPolicies } = require('../controllers/importController');
const upload = require('../middleware/upload');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', upload.single('file'), asyncHandler(importPolicies));

module.exports = router;
