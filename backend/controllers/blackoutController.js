// controllers/blackoutController.js - Handle training and blackout date management
const BlackoutDate = require('../database/models/BlackoutDate');
const Nurse = require('../database/models/nurse');

/**
 * @route   POST /api/blackouts
 * @desc    Create a new blackout date/period
 * @access  Admin only
 */
const createBlackoutDate = async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            blackoutType,
            affectedRoles,
            affectedNurses,
            blockScheduling = true,
            allowEmergencyOverride = false,
            minimumStaffingRequired = 0,
            allDay = true,
            startTime,
            endTime,
            isRecurring = false,
            recurrencePattern,
            recurrenceEnd,
            notifyInAdvance = 7
        } = req.body;
        
        const adminId = req.user?.Id;
        
        const blackoutDate = new BlackoutDate({
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            blackoutType,
            affectedRoles: affectedRoles || [],
            affectedNurses: affectedNurses || [],
            blockScheduling,
            allowEmergencyOverride,
            minimumStaffingRequired,
            allDay,
            startTime,
            endTime,
            isRecurring,
            recurrencePattern,
            recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
            notifyInAdvance,
            createdBy: adminId,
            status: 'draft'
        });
        
        await blackoutDate.save();
        
        // Generate recurring instances if applicable
        let recurringInstances = [];
        if (isRecurring) {
            const instances = await blackoutDate.generateRecurringInstances();
            if (instances.length > 0) {
                recurringInstances = await BlackoutDate.insertMany(instances);
            }
        }
        
        res.status(201).json({
            success: true,
            message: 'Blackout date created successfully',
            data: {
                blackoutDate,
                recurringInstances: recurringInstances.length
            }
        });
        
    } catch (error) {
        console.error('Error creating blackout date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create blackout date',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/blackouts
 * @desc    Get all blackout dates with filtering
 * @access  Admin
 */
const getBlackoutDates = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            status = 'all',
            blackoutType = 'all',
            page = 1,
            limit = 50
        } = req.query;
        
        let query = {};
        
        // Date range filter
        if (startDate && endDate) {
            query.$or = [
                { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
                { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
                { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } }
            ];
        }
        
        // Status filter
        if (status !== 'all') {
            query.status = status;
        }
        
        // Type filter
        if (blackoutType !== 'all') {
            query.blackoutType = blackoutType;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const blackouts = await BlackoutDate.find(query)
            .populate('affectedNurses', 'name username')
            .populate('createdBy', 'name username')
            .populate('approvedBy', 'name username')
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalCount = await BlackoutDate.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: {
                blackouts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNext: skip + blackouts.length < totalCount,
                    hasPrev: parseInt(page) > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching blackout dates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blackout dates',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/blackouts/:id
 * @desc    Get specific blackout date details
 * @access  Admin
 */
const getBlackoutDate = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blackout = await BlackoutDate.findById(id)
            .populate('affectedNurses', 'name username email phone')
            .populate('createdBy', 'name username')
            .populate('approvedBy', 'name username');
        
        if (!blackout) {
            return res.status(404).json({
                success: false,
                message: 'Blackout date not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: blackout
        });
        
    } catch (error) {
        console.error('Error fetching blackout date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blackout date',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/blackouts/:id
 * @desc    Update blackout date
 * @access  Admin only
 */
const updateBlackoutDate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const blackout = await BlackoutDate.findById(id);
        if (!blackout) {
            return res.status(404).json({
                success: false,
                message: 'Blackout date not found'
            });
        }
        
        // Update fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                blackout[key] = updateData[key];
            }
        });
        
        await blackout.save();
        
        res.status(200).json({
            success: true,
            message: 'Blackout date updated successfully',
            data: blackout
        });
        
    } catch (error) {
        console.error('Error updating blackout date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update blackout date',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/blackouts/:id/approve
 * @desc    Approve a blackout date
 * @access  Admin only
 */
const approveBlackoutDate = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.Id;
        
        const blackout = await BlackoutDate.findById(id);
        if (!blackout) {
            return res.status(404).json({
                success: false,
                message: 'Blackout date not found'
            });
        }
        
        blackout.status = 'approved';
        blackout.approvedBy = adminId;
        
        await blackout.save();
        
        res.status(200).json({
            success: true,
            message: 'Blackout date approved successfully',
            data: blackout
        });
        
    } catch (error) {
        console.error('Error approving blackout date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve blackout date',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/blackouts/:id
 * @desc    Delete/cancel a blackout date
 * @access  Admin only
 */
const deleteBlackoutDate = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blackout = await BlackoutDate.findById(id);
        if (!blackout) {
            return res.status(404).json({
                success: false,
                message: 'Blackout date not found'
            });
        }
        
        // If it's active, mark as cancelled instead of deleting
        if (blackout.status === 'active') {
            blackout.status = 'cancelled';
            await blackout.save();
            
            return res.status(200).json({
                success: true,
                message: 'Blackout date cancelled successfully'
            });
        }
        
        // Otherwise, delete it
        await BlackoutDate.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Blackout date deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting blackout date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete blackout date',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/blackouts/check-conflicts
 * @desc    Check for scheduling conflicts with blackout dates
 * @access  Admin
 */
const checkSchedulingConflicts = async (req, res) => {
    try {
        const { date, shiftType, nurseIds } = req.body;
        
        if (!date || !shiftType || !nurseIds || !Array.isArray(nurseIds)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: date, shiftType, nurseIds'
            });
        }
        
        const conflicts = await BlackoutDate.checkSchedulingConflicts(
            date, 
            shiftType, 
            nurseIds
        );
        
        res.status(200).json({
            success: true,
            data: {
                hasConflicts: conflicts.length > 0,
                conflicts,
                affectedNurses: [...new Set(conflicts.map(c => c.nurseId))]
            }
        });
        
    } catch (error) {
        console.error('Error checking scheduling conflicts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check scheduling conflicts',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/blackouts/nurse/:nurseId
 * @desc    Get blackout dates affecting a specific nurse
 * @access  Nurse/Admin
 */
const getNurseBlackouts = async (req, res) => {
    try {
        const { nurseId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Default to next 90 days if no date range provided
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        
        const blackouts = await BlackoutDate.findActiveBlackouts(start, end, nurseId);
        
        res.status(200).json({
            success: true,
            data: {
                blackouts,
                totalCount: blackouts.length,
                dateRange: {
                    startDate: start,
                    endDate: end
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching nurse blackouts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nurse blackouts',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/blackouts/calendar/:yearMonth
 * @desc    Get blackout dates for calendar view
 * @access  Admin
 */
const getBlackoutCalendar = async (req, res) => {
    try {
        const { yearMonth } = req.params; // Format: "2025-07"
        
        const [year, month] = yearMonth.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const blackouts = await BlackoutDate.find({
            status: { $in: ['approved', 'active'] },
            $or: [
                { startDate: { $lte: endDate, $gte: startDate } },
                { endDate: { $lte: endDate, $gte: startDate } },
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ]
        })
        .populate('affectedNurses', 'name username')
        .select('title startDate endDate blackoutType affectedRoles affectedNurses allDay startTime endTime');
        
        // Format for calendar display
        const calendarEvents = blackouts.map(blackout => ({
            id: blackout._id,
            title: blackout.title,
            start: blackout.startDate,
            end: blackout.endDate,
            allDay: blackout.allDay,
            startTime: blackout.startTime,
            endTime: blackout.endTime,
            type: blackout.blackoutType,
            affectedRoles: blackout.affectedRoles,
            affectedNursesCount: blackout.affectedNurses.length,
            className: `blackout-${blackout.blackoutType}` // For CSS styling
        }));
        
        res.status(200).json({
            success: true,
            data: {
                events: calendarEvents,
                month: yearMonth,
                totalEvents: calendarEvents.length
            }
        });
        
    } catch (error) {
        console.error('Error fetching blackout calendar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blackout calendar',
            error: error.message
        });
    }
};

module.exports = {
    createBlackoutDate,
    getBlackoutDates,
    getBlackoutDate,
    updateBlackoutDate,
    approveBlackoutDate,
    deleteBlackoutDate,
    checkSchedulingConflicts,
    getNurseBlackouts,
    getBlackoutCalendar
};