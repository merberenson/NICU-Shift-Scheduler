const express = require('express');
const router = express.Router();
const { getCallInList, updateCallInStatus, getDayOfWeek, getShiftHours } = require('../controllers/callInController'); 

// Get available nurses for call-in
router.get('/available', async (req, res) => {
  try {
    const { date, shiftType } = req.query;
    if (!date || !shiftType) {
      return res.status(400).json({ error: 'Date and shiftType are required' });
    }

    const availableNurses = await getCallInList(date, shiftType);
    res.json(availableNurses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update call-in status
router.put('/status', async (req, res) => {
  try {
    const { date, shiftType, empID, status } = req.body;
    if (!date || !shiftType || !empID || !status) {
      return res.status(400).json({ error: 'All fields (date, shiftType, empID, status) are required' });
    }

    const updatedCallIn = await updateCallInStatus(date, shiftType, empID, status);
    res.json(updatedCallIn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;