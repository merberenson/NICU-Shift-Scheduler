const express = require('express');
const router = express.Router();
const { getNurseSchedule, getMonthlySchedule } = require('../controllers/schedulingController');

router.get('/schedule/:nurseId/:startDate', getNurseSchedule);
router.get('/schedule/:startDate', getMonthlySchedule);
module.exports = router;
