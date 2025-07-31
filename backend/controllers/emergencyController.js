// controllers/emergencyController.js - Handle on-call and absence management
const OnCallPool = require('../database/models/OnCallPool');
const Absence = require('../database/models/Absence');
const WorkDay = require('../database/models/workDay');
const Assignment = require('../database/models/workAssignment');
const Nurse = require('../database/models/nurse');
const authenticateToken = require('../middleware/auth');

/**
 * @route   POST /api/emergency/report-absence
 * @desc    Report a nurse absence and trigger replacement process
 * @access  Nurse/Admin
 */
const reportAbsence = async (req, res) => {
    try {
        const { workId, absenceType, reason } = req.body;
        const nurseId = req.user?.Id; // From JWT token
        
        // Find the work assignment
        const assignment = await Assignment.findOne({ 
            workID: workId, 
            empID: nurseId 
        });
        
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }
        
        // Get work day details
        const workDay = await WorkDay.findById(workId);
        if (!workDay) {
            return res.status(404).json({
                success: false,
                message: 'Work day not found'
            });
        }
        
        // Calculate shift start time
        const shiftStartHour = workDay.shiftType === 'day' ? 7 : 19;
        const shiftStartTime = new Date(`${workDay.date}T${String(shiftStartHour).padStart(2, '0')}:00:00`);
        
        // Create absence record
        const absence = new Absence({
            nurseId,
            workId,
            date: workDay.date,
            shiftType: workDay.shiftType,
            absenceType,
            reason,
            shiftStartTime
        });
        
        await absence.save();
        
        // Remove the original assignment
        await Assignment.deleteOne({ _id: assignment._id });
        
        // Attempt to find replacement
        await absence.findReplacement();
        
        // If replacement found, create new assignment
        if (absence.replacementNurse && absence.replacementStatus === 'assigned') {
            const newAssignment = new Assignment({
                workID: workId,
                empID: absence.replacementNurse,
                assignedby: 'emergency_system',
                timestamp: new Date().toISOString()
            });
            
            await newAssignment.save();
        }
        
        // Return response with absence details and replacement status
        const populatedAbsence = await Absence.findById(absence._id)
            .populate('nurseId', 'name username')
            .populate('replacementNurse', 'name username phone');
        
        res.status(201).json({
            success: true,
            message: 'Absence reported successfully',
            data: {
                absence: populatedAbsence,
                replacementStatus: absence.replacementStatus,
                requiresAdminAttention: absence.replacementStatus === 'emergency_staffing'
            }
        });
        
    } catch (error) {
        console.error('Error reporting absence:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report absence',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/emergency/on-call/:date/:shiftType
 * @desc    Get on-call pool for specific date and shift
 * @access  Admin
 */
const getOnCallPool = async (req, res) => {
    try {
        const { date, shiftType } = req.params;
        
        const pool = await OnCallPool.findOrCreate(date, shiftType);
        await pool.populate('onCallNurses.nurseId', 'name username phone email');
        
        res.status(200).json({
            success: true,
            data: pool
        });
        
    } catch (error) {
        console.error('Error fetching on-call pool:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch on-call pool',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/emergency/on-call/:poolId
 * @desc    Update on-call pool (add/remove nurses, change priorities)
 * @access  Admin only
 */
const updateOnCallPool = async (req, res) => {
    try {
        const { poolId } = req.params;
        const { onCallNurses, targetStaffing, minimumStaffing } = req.body;
        
        const pool = await OnCallPool.findById(poolId);
        if (!pool) {
            return res.status(404).json({
                success: false,
                message: 'On-call pool not found'
            });
        }
        
        // Update pool settings
        if (onCallNurses) pool.onCallNurses = onCallNurses;
        if (targetStaffing !== undefined) pool.targetStaffing = targetStaffing;
        if (minimumStaffing !== undefined) pool.minimumStaffing = minimumStaffing;
        
        await pool.save();
        await pool.populate('onCallNurses.nurseId', 'name username phone');
        
        res.status(200).json({
            success: true,
            message: 'On-call pool updated successfully',
            data: pool
        });
        
    } catch (error) {
        console.error('Error updating on-call pool:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update on-call pool',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/emergency/activate/:poolId
 * @desc    Activate emergency staffing for a shift
 * @access  Admin only
 */
const activateEmergencyStaffing = async (req, res) => {
    try {
        const { poolId } = req.params;
        const adminId = req.user?.Id;
        
        const pool = await OnCallPool.findById(poolId);
        if (!pool) {
            return res.status(404).json({
                success: false,
                message: 'On-call pool not found'
            });
        }
        
        await pool.activateEmergency(adminId);
        
        // Log the emergency activation
        console.log(`EMERGENCY STAFFING ACTIVATED: ${pool.date} ${pool.shiftType} by admin ${adminId}`);
        
        res.status(200).json({
            success: true,
            message: 'Emergency staffing activated',
            data: {
                activatedAt: pool.activatedAt,
                activatedBy: pool.activatedBy
            }
        });
        
    } catch (error) {
        console.error('Error activating emergency staffing:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate emergency staffing',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/emergency/absences
 * @desc    Get recent absences with replacement status
 * @access  Admin only
 */
const getRecentAbsences = async (req, res) => {
    try {
        const { days = 7, status = 'all' } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        let query = {
            reportedAt: { $gte: startDate }
        };
        
        if (status !== 'all') {
            query.replacementStatus = status;
        }
        
        const absences = await Absence.find(query)
            .populate('nurseId', 'name username')
            .populate('replacementNurse', 'name username')
            .populate('approvedBy', 'name username')
            .sort({ reportedAt: -1 });
        
        // Get summary statistics
        const stats = await Absence.getStats(startDate, new Date());
        
        res.status(200).json({
            success: true,
            data: {
                absences,
                statistics: stats,
                totalCount: absences.length
            }
        });
        
    } catch (error) {
        console.error('Error fetching absences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch absences',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/emergency/absence/:absenceId/approve
 * @desc    Admin approval of absence and replacement
 * @access  Admin only
 */
const approveAbsence = async (req, res) => {
    try {
        const { absenceId } = req.params;
        const { adminNotes, requiresFollowUp } = req.body;
        const adminId = req.user?.Id;
        
        const absence = await Absence.findById(absenceId);
        if (!absence) {
            return res.status(404).json({
                success: false,
                message: 'Absence not found'
            });
        }
        
        absence.approvedBy = adminId;
        absence.handledAt = new Date();
        absence.adminNotes = adminNotes;
        absence.requiresFollowUp = requiresFollowUp || false;
        
        if (!absence.requiresFollowUp) {
            absence.resolvedAt = new Date();
        }
        
        await absence.save();
        
        res.status(200).json({
            success: true,
            message: 'Absence approved successfully',
            data: absence
        });
        
    } catch (error) {
        console.error('Error approving absence:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve absence',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/emergency/dashboard
 * @desc    Get emergency management dashboard data
 * @access  Admin only
 */
const getEmergencyDashboard = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Get today's and tomorrow's on-call pools
        const todayPools = await OnCallPool.find({
            date: { $in: [today, tomorrow] }
        }).populate('onCallNurses.nurseId', 'name username phone');
        
        // Get recent critical absences
        const criticalAbsences = await Absence.find({
            reportedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            criticalityLevel: { $in: ['high', 'critical'] }
        }).populate('nurseId', 'name username');
        
        // Get unfilled shifts
        const unfilledShifts = await Absence.find({
            replacementStatus: { $in: ['unfilled', 'emergency_staffing'] },
            date: { $gte: today }
        }).populate('nurseId', 'name username');
        
        // Calculate staffing levels for today
        const todayWorkDays = await WorkDay.find({ date: today });
        const todayAssignments = await Assignment.find({
            workID: { $in: todayWorkDays.map(wd => wd._id) }
        });
        
        const staffingLevels = todayWorkDays.map(workDay => {
            const assignedCount = todayAssignments.filter(
                a => a.workID.toString() === workDay._id.toString()
            ).length;
            
            return {
                date: workDay.date,
                shiftType: workDay.shiftType,
                required: workDay.requiredEmployees,
                assigned: assignedCount,
                minimum: workDay.minimumEmployees || 2,
                status: assignedCount >= workDay.requiredEmployees ? 'adequate' :
                       assignedCount >= (workDay.minimumEmployees || 2) ? 'minimum' : 'critical'
            };
        });
        
        res.status(200).json({
            success: true,
            data: {
                onCallPools: todayPools,
                criticalAbsences,
                unfilledShifts,
                staffingLevels,
                alerts: {
                    criticalStaffing: staffingLevels.filter(s => s.status === 'critical').length,
                    unfilledShifts: unfilledShifts.length,
                    emergencyActivations: todayPools.filter(p => p.emergencyActivated).length
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching emergency dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emergency dashboard',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/emergency/manual-assignment
 * @desc    Manually assign a nurse to cover an absence
 * @access  Admin only
 */
const manualAssignment = async (req, res) => {
    try {
        const { absenceId, replacementNurseId, notes } = req.body;
        const adminId = req.user?.Id;
        
        const absence = await Absence.findById(absenceId);
        if (!absence) {
            return res.status(404).json({
                success: false,
                message: 'Absence not found'
            });
        }
        
        // Verify replacement nurse exists and is available
        const replacementNurse = await Nurse.findById(replacementNurseId);
        if (!replacementNurse) {
            return res.status(404).json({
                success: false,
                message: 'Replacement nurse not found'
            });
        }
        
        // Update absence record
        absence.replacementNurse = replacementNurseId;
        absence.replacementSource = 'admin_override';
        absence.replacementStatus = 'assigned';
        absence.approvedBy = adminId;
        absence.handledAt = new Date();
        absence.adminNotes = notes;
        
        await absence.save();
        
        // Create new assignment
        const newAssignment = new Assignment({
            workID: absence.workId,
            empID: replacementNurseId,
            assignedby: `admin_${adminId}`,
            timestamp: new Date().toISOString()
        });
        
        await newAssignment.save();
        
        res.status(200).json({
            success: true,
            message: 'Manual assignment completed successfully',
            data: {
                absence,
                assignment: newAssignment
            }
        });
        
    } catch (error) {
        console.error('Error in manual assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete manual assignment',
            error: error.message
        });
    }
};

module.exports = {
    reportAbsence,
    getOnCallPool,
    updateOnCallPool,
    activateEmergencyStaffing,
    getRecentAbsences,
    approveAbsence,
    getEmergencyDashboard,
    manualAssignment
};