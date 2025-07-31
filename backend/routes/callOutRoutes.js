const express = require('express');
const router = express.Router();
const {
    reportCallOut,
    getRecentCallOuts,
    getCallOutDashboard
} = require('../controllers/callOutController');
const authenticateToken = require('../middleware/auth');


// Report call-out (Nurse can report their own call-out)
router.post('/report', authenticateToken, reportCallOut);

// Get recent call-outs for a specific nurse
router.get('/recent/:nurseId', authenticateToken, getRecentCallOuts);

// Get call-out dashboard data (Admin only)
router.get('/dashboard', authenticateToken, getCallOutDashboard);

// Test route to verify the routes are working
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Call-out routes are working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;