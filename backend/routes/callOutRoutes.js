const express = require('express');
const router = express.Router();
const { unscheduleNurse } = require('../controllers/callOutController');

// POST /api/callout/unschedule
router.post('/unschedule', async (req, res) => {
  try {
    const { empID, date, shiftType } = req.body;

    if (!empID || !date || !shiftType) {
      return res.status(400).json({ error: 'empID, date and shiftType are required' });
    }

    const result = await unscheduleNurse(date, shiftType, empID);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;