// Debug version of scheduleGenerationController.js with enhanced logging
const ScheduleGenerator = require('../services/scheduleGenerator');
const ScheduleTemplate = require('../database/models/ScheduleTemplate');
const Nurse = require('../database/models/nurse');
const PTORequest = require('../database/models/PTORequest');

/**
 * @route   POST /api/schedule/generate/:yearmonth
 * @desc    Generate monthly schedule
 * @access  Admin only
 */
const generateSchedule = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`[DEBUG] generateSchedule called with yearmonth: ${yearmonth}`);
        console.log(`[DEBUG] Request user:`, req.user);
        
        const adminId = req.user?.Id; // From JWT token
        console.log(`[DEBUG] Admin ID from JWT: ${adminId}`);
        
        // Validate yearmonth format
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            console.log(`[ERROR] Invalid yearmonth format: ${yearmonth}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }

        // Validate adminId if provided
        if (adminId && !require('mongoose').Types.ObjectId.isValid(adminId)) {
            console.log(`[ERROR] Invalid adminId format: ${adminId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid admin ID format in authentication token'
            });
        }

        console.log(`[DEBUG] Admin ${adminId} requesting schedule generation for ${yearmonth}`);

        // Check if schedule already exists and is published
        console.log(`[DEBUG] Checking for existing template...`);
        const existingTemplate = await ScheduleTemplate.findOne({ 
            month: yearmonth, 
            status: { $in: ['generated', 'published'] } 
        });

        if (existingTemplate && !req.body.forceRegenerate) {
            console.log(`[DEBUG] Template already exists with status: ${existingTemplate.status}`);
            return res.status(409).json({
                success: false,
                message: 'Schedule already exists for this month. Use forceRegenerate=true to override.',
                data: {
                    status: existingTemplate.status,
                    generatedAt: existingTemplate.generatedAt,
                    generatedBy: existingTemplate.generatedBy
                }
            });
        }

        // Initialize schedule generator
        console.log(`[DEBUG] Initializing schedule generator...`);
        const generator = new ScheduleGenerator();
        
        // Generate the schedule
        console.log(`[DEBUG] Starting schedule generation...`);
        const result = await generator.generateMonthlySchedule(yearmonth, adminId);
        console.log(`[DEBUG] Schedule generation result:`, result);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.stats,
                warnings: result.warnings
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                errors: result.errors
            });
        }

    } catch (error) {
        console.error('[ERROR] Schedule generation failed:', error);
        console.error('[ERROR] Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Internal server error during schedule generation',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @route   GET /api/schedule/template/:yearmonth
 * @desc    Get schedule template and generation status
 * @access  Admin only
 */
const getScheduleTemplate = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`[DEBUG] getScheduleTemplate called with yearmonth: ${yearmonth}`);
        
        // Validate yearmonth format
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }
        
        const template = await ScheduleTemplate.findOne({ month: yearmonth })
            .populate('generatedBy', 'name username');

        if (!template) {
            console.log(`[DEBUG] No template found for ${yearmonth}`);
            return res.status(404).json({
                success: false,
                message: 'Schedule template not found for this month'
            });
        }

        console.log(`[DEBUG] Found template with status: ${template.status}`);
        res.status(200).json({
            success: true,
            data: template
        });

    } catch (error) {
        console.error('[ERROR] Error fetching schedule template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule template',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/schedule/requirements/:yearmonth
 * @desc    Update daily requirements for schedule generation
 * @access  Admin only
 */
const updateScheduleRequirements = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        const { dailyRequirements } = req.body;
        console.log(`[DEBUG] updateScheduleRequirements called for ${yearmonth}`);

        // Validate yearmonth format
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }

        let template = await ScheduleTemplate.findOne({ month: yearmonth });

        if (!template) {
            // Create new template if it doesn't exist
            const [year, month] = yearmonth.split('-').map(Number);
            template = new ScheduleTemplate({
                month: yearmonth,
                year: year,
                monthNumber: month,
                dailyRequirements: dailyRequirements,
                status: 'draft'
            });
        } else {
            template.dailyRequirements = dailyRequirements;
            template.status = 'draft'; // Reset to draft when requirements change
        }

        await template.save();
        console.log(`[DEBUG] Template updated successfully`);

        res.status(200).json({
            success: true,
            message: 'Schedule requirements updated successfully',
            data: template
        });

    } catch (error) {
        console.error('[ERROR] Error updating schedule requirements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update schedule requirements',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/schedule/preview/:yearmonth
 * @desc    Preview schedule constraints and nurse availability
 * @access  Admin only
 */
const previewScheduleConstraints = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`[DEBUG] previewScheduleConstraints called for ${yearmonth}`);
        
        // Validate yearmonth format
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }
        
        // Get all active nurses with availability
        console.log(`[DEBUG] Fetching active nurses...`);
        const nurses = await Nurse.find() //const nurses = await Nurse.find({ isActive: true })
            .select('name username shiftPreference availability seniority weekendRotation hireDate maxWeeklyHours')
            .lean();

        console.log(`[DEBUG] Found ${nurses.length} active nurses`);

        // Get pending/approved PTO requests for the month
        const [year, month] = yearmonth.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        console.log(`[DEBUG] Fetching PTO requests from ${startDate} to ${endDate}`);
        const ptoRequests = await PTORequest.find({
            status: { $in: ['pending', 'approved'] },
            $or: [
                { startDate: { $gte: startDate, $lte: endDate } },
                { endDate: { $gte: startDate, $lte: endDate } },
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ]
        }).populate('nurseId', 'name username').lean();

        console.log(`[DEBUG] Found ${ptoRequests.length} PTO requests`);

        // Calculate nurse statistics
        const nurseStats = nurses.map(nurse => {
            const yearsOfService = (Date.now() - new Date(nurse.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            
            // Count available days
            const availableDays = nurse.availability?.filter(avail => avail.timeOfDay !== 'unavailable').length || 0;
            
            return {
                ...nurse,
                yearsOfService: Math.floor(yearsOfService),
                availableDaysPerWeek: availableDays,
                ptoRequests: ptoRequests.filter(pto => pto.nurseId._id.toString() === nurse._id.toString())
            };
        });

        // Calculate coverage statistics
        const dayNurses = nurseStats.filter(n => n.shiftPreference === 'day').length;
        const nightNurses = nurseStats.filter(n => n.shiftPreference === 'night').length;
        const weekendEligible = nurseStats.filter(n => n.weekendRotation !== 'exempt').length;

        console.log(`[DEBUG] Stats - Day: ${dayNurses}, Night: ${nightNurses}, Weekend eligible: ${weekendEligible}`);

        res.status(200).json({
            success: true,
            data: {
                nurses: nurseStats,
                ptoRequests: ptoRequests,
                stats: {
                    totalActiveNurses: nurses.length,
                    dayShiftNurses: dayNurses,
                    nightShiftNurses: nightNurses,
                    weekendEligibleNurses: weekendEligible,
                    pendingPTORequests: ptoRequests.filter(pto => pto.status === 'pending').length,
                    approvedPTORequests: ptoRequests.filter(pto => pto.status === 'approved').length
                }
            }
        });

    } catch (error) {
        console.error('[ERROR] Error generating schedule preview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate schedule preview',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/schedule/publish/:yearmonth
 * @desc    Publish generated schedule (make it official)
 * @access  Admin only
 */
const publishSchedule = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`[DEBUG] publishSchedule called for ${yearmonth}`);
        
        // Validate yearmonth format
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }
        
        const template = await ScheduleTemplate.findOne({ month: yearmonth });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Schedule template not found'
            });
        }

        if (template.status !== 'generated') {
            return res.status(400).json({
                success: false,
                message: 'Schedule must be generated before it can be published'
            });
        }

        template.status = 'published';
        await template.save();

        console.log(`[DEBUG] Schedule published successfully`);
        res.status(200).json({
            success: true,
            message: 'Schedule published successfully',
            data: template
        });

    } catch (error) {
        console.error('[ERROR] Error publishing schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to publish schedule',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/schedule/:yearmonth
 * @desc    Delete generated schedule (allows regeneration)
 * @access  Admin only
 */
const deleteSchedule = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`[DEBUG] deleteSchedule called for ${yearmonth}`);
        
        // Validate yearmonth format
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }
        
        // Delete schedule template
        await ScheduleTemplate.deleteOne({ month: yearmonth });
        
        // Delete associated work days and assignments
        const Work = require('../database/models/workDay');
        const Assignment = require('../database/models/workAssignment');
        
        console.log(`[DEBUG] Deleting work days and assignments for ${yearmonth}`);
        const workDays = await Work.find({ scheduleMonth: yearmonth });
        const workIDs = workDays.map(w => w._id);
        
        await Assignment.deleteMany({ workID: { $in: workIDs } });
        await Work.deleteMany({ scheduleMonth: yearmonth });

        console.log(`[DEBUG] Schedule deleted successfully`);
        res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
        });

    } catch (error) {
        console.error('[ERROR] Error deleting schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete schedule',
            error: error.message
        });
    }
};

module.exports = {
    generateSchedule,
    getScheduleTemplate,
    updateScheduleRequirements,
    previewScheduleConstraints,
    publishSchedule,
    deleteSchedule
};