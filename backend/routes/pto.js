const express = require('express');
const router = express.Router();
const PTORequest = require('../models/PTORequest');

// Create a PTO request
router.post('/', async (req, res) => {
  try {
    const { nurseId, startDate, endDate, reason } = req.body;
    const pto = new PTORequest({ nurseId, startDate, endDate, reason });
    await pto.save();
    res.status(201).json(pto);
    console.log(pto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all PTO requests
router.get('/', async (req, res) => {
  try {
    const ptos = await PTORequest.find().populate('nurseId');
    res.json(ptos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
