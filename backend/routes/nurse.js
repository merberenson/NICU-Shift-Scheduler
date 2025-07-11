const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
router.get('/', nurseController.getNurse);
module.exports = router;
