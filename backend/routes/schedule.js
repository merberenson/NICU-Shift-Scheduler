// backend/routes/schedule.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/', scheduleController.getSchedule); // just a skeleton

module.exports = router;
