const express = require('express');
const router = express.Router();
const {addNewNurse, loginNurse, refresh} = require('../controllers/loginController')
const authenticateToken = require('../middleware/auth');


//define routes
router.post('/nurses', addNewNurse);
router.post('/login', loginNurse);
router.post('/refresh', refresh);

module.exports = router;