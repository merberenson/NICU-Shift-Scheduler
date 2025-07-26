const express = require('express');
const router = express.Router();
const {addNewNurse, addNewAdmin, loginNurse, refresh} = require('../controllers/loginController');
const {deleteNurse} = require('../controllers/deleteController');
const {getAllNurses, getNurse} = require('../controllers/nursesController');
const {updateAvailability, updateInfo} = require('../controllers/updateController');
const authenticateToken = require('../middleware/auth');


//define routes
router.post('/nurses', addNewNurse);
router.post('/admins', addNewAdmin);
router.post('/login', loginNurse);
router.post('/refresh', refresh);
router.get('/nurses', getAllNurses);
router.get('/nurses/:id', getNurse);
router.delete('/nurses/:id', deleteNurse);
router.patch('/nurses/:id/availability', updateAvailability);
router.patch('/nurses/:id', updateInfo)


module.exports = router;