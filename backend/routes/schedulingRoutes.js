const express = require('express');
const router = express.Router();
const { getMonthlySchedule, getNurseShifts } = require('../controllers/schedulingController');

router.get('/schedule/:yearmonth', getMonthlySchedule);
router.get('/schedule/:yearmonth/:empId', getNurseShifts);


module.exports = router;
