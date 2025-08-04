const express = require('express');
const router = express.Router();
const {addNewNurse, addNewAdmin, loginNurse, refresh} = require('../controllers/loginController');
const {deleteNurse} = require('../controllers/deleteController');
const {getAllNurses, getNurse} = require('../controllers/nursesController');
const {updateAvailability, getAvailability, updateInfo} = require('../controllers/updateController');
const authenticateToken = require('../middleware/auth');


//define routes
router.post('/nurses', addNewNurse);
router.post('/admins', addNewAdmin);
router.post('/login', loginNurse);
router.post('/refresh', refresh);
router.get('/nurses', getAllNurses);
router.get('/nurses/:id', getNurse);
router.delete('/nurses/:id', deleteNurse);
//router.delete('/nurses', deleteAllNurses);
router.patch('/nurses/:id/availability', updateAvailability);
router.get('/nurses/:id/availability', getAvailability);
router.patch('/nurses/:id', updateInfo)


module.exports = router;