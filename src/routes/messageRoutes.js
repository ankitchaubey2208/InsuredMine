const express = require('express');
const { scheduleMessage, getScheduledMessage } = require('../controllers/messageController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/schedule', asyncHandler(scheduleMessage));
router.get('/schedule/:id', asyncHandler(getScheduledMessage));

module.exports = router;
