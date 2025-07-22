const express = require('express');
const router = express.Router();
const {addNewNurse, loginNurse, refresh} = require('../controllers/loginController');
const {deleteNurse} = require('../controllers/deleteController');
const {getAllNurses} = require('../controllers/nursesController');
const {updateAvailablity} = require('../controllers/updateController');
const authenticateToken = require('../middleware/auth');


//define routes
router.post('/nurses', addNewNurse);
router.post('/login', loginNurse);
router.post('/refresh', refresh);
router.get('/nurses', getAllNurses);
router.delete('/nurses/:id', deleteNurse);
router.patch('/nurses/:id/availablity', updateAvailablity);

module.exports = router;