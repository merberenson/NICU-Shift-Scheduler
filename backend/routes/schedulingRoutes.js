// Fixed schedulingRoutes.js - Correct route ordering to prevent conflicts
const express = require('express');
const router = express.Router();
const { getMonthlySchedule, getNurseShifts } = require('../controllers/schedulingController');
const {
    generateSchedule,
    getScheduleTemplate,
    updateScheduleRequirements,
    previewScheduleConstraints,
    publishSchedule,
    deleteSchedule
} = require('../controllers/scheduleGenerationController');
const authenticateToken = require('../middleware/auth');

// ============ CRITICAL: SPECIFIC ROUTES MUST COME FIRST ============
// These routes have literal path segments that would otherwise be captured
// by the generic :yearmonth parameter routes below

// Schedule generation routes (Admin only) - MOVED TO TOP
router.post('/schedule/generate/:yearmonth', authenticateToken, generateSchedule);
router.get('/schedule/template/:yearmonth', authenticateToken, getScheduleTemplate);
router.post('/schedule/requirements/:yearmonth', authenticateToken, updateScheduleRequirements);
router.get('/schedule/preview/:yearmonth', authenticateToken, previewScheduleConstraints);
router.post('/schedule/publish/:yearmonth', authenticateToken, publishSchedule);

// ============ GENERIC PARAMETER ROUTES - MUST COME LAST ============
// These routes use parameters that could match the literal segments above
// if placed in the wrong order

// Delete schedule (Admin only) - Before GET routes to avoid conflicts
router.delete('/schedule/:yearmonth', authenticateToken, deleteSchedule);

// Get full monthly schedule - Second to last
router.get('/schedule/:yearmonth', getMonthlySchedule);

// Get specific nurse shifts - MUST BE LAST (most specific parameter route)
router.get('/schedule/:yearmonth/:empId', getNurseShifts);

module.exports = router;