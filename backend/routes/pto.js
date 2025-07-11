const express = require('express');
const router = express.Router();
const ptoController = require('../controllers/ptoController');
router.get('/', ptoController.getPTO);
module.exports = router;
