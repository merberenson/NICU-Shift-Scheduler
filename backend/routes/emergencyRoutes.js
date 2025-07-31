// routes/emergencyRoutes.js - Routes for on-call and absence management
const express = require('express');
const router = express.Router();
const {
    reportAbsence,
    getOnCallPool,
    updateOnCallPool,
    activateEmergencyStaffing,
    getRecentAbsences,
    approveAbsence,
    getEmergencyDashboard,
    manualAssignment
} = require('../controllers/emergencyController');

const {
    createBlackoutDate,
    getBlackoutDates,
    getBlackoutDate,
    updateBlackoutDate,
    approveBlackoutDate,
    deleteBlackoutDate,
    checkSchedulingConflicts,
    getNurseBlackouts,
    getBlackoutCalendar
} = require('../controllers/blackoutController');

const authenticateToken = require('../middleware/auth');

// ============ ABSENCE MANAGEMENT ROUTES ============

// Report absence (Nurse can report their own absence)
router.post('/report-absence', authenticateToken, reportAbsence);

// Get recent absences (Admin only)
router.get('/absences', authenticateToken, getRecentAbsences);

// Approve absence (Admin only)
router.put('/absence/:absenceId/approve', authenticateToken, approveAbsence);

// Manual assignment to cover absence (Admin only)
router.post('/manual-assignment', authenticateToken, manualAssignment);

// ============ ON-CALL MANAGEMENT ROUTES ============

// Get on-call pool for specific date/shift (Admin only)
router.get('/on-call/:date/:shiftType', authenticateToken, getOnCallPool);

// Update on-call pool (Admin only)
router.put('/on-call/:poolId', authenticateToken, updateOnCallPool);

// Activate emergency staffing (Admin only)
router.post('/activate/:poolId', authenticateToken, activateEmergencyStaffing);

// Emergency management dashboard (Admin only)
router.get('/dashboard', authenticateToken, getEmergencyDashboard);

// ============ BLACKOUT DATE MANAGEMENT ROUTES ============

// Create blackout date (Admin only)
router.post('/blackouts', authenticateToken, createBlackoutDate);

// Get all blackout dates with filtering (Admin)
router.get('/blackouts', authenticateToken, getBlackoutDates);

// Get specific blackout date (Admin)
router.get('/blackouts/:id', authenticateToken, getBlackoutDate);

// Update blackout date (Admin only)
router.put('/blackouts/:id', authenticateToken, updateBlackoutDate);

// Approve blackout date (Admin only)
router.put('/blackouts/:id/approve', authenticateToken, approveBlackoutDate);

// Delete/cancel blackout date (Admin only)
router.delete('/blackouts/:id', authenticateToken, deleteBlackoutDate);

// Check for scheduling conflicts (Admin)
router.post('/blackouts/check-conflicts', authenticateToken, checkSchedulingConflicts);

// Get blackout dates for specific nurse (Nurse/Admin)
router.get('/blackouts/nurse/:nurseId', authenticateToken, getNurseBlackouts);

// Get blackout calendar view (Admin)
router.get('/blackouts/calendar/:yearMonth', authenticateToken, getBlackoutCalendar);

module.exports = router;