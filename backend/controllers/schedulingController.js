// Fixed schedulingController.js with better error handling
const Nurse = require('../database/models/nurse');
const Work = require('../database/models/workDay');
const Assigned = require('../database/models/workAssignment');
const mongoose = require('mongoose');

/**
 * @route   GET /api/schedule/:yearmonth
 * @desc    Fetches full schedule for a given year-month (e.g., 2025-07)
 * @access  Public
 */
const getMonthlySchedule = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`[DEBUG] getMonthlySchedule called with yearmonth: ${yearmonth}`);

        // Validate yearmonth format
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            console.log(`[ERROR] Invalid yearmonth format: ${yearmonth}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }

        console.log(`[DEBUG] Fetching schedule for: ${yearmonth}`);

        const schedule = await Work.aggregate([
            {
                $match: {
                    scheduleMonth: yearmonth  // Use scheduleMonth instead of date regex
                }
            },
            {
                $lookup: {
                    from: 'assignments',
                    localField: '_id',        // FIXED: Use _id instead of workID
                    foreignField: 'workID',
                    as: 'assignedDocs'
                }
            },
            {
                $unwind: {
                    path: '$assignedDocs',
                    preserveNullAndEmptyArrays: true
                }
            }, 
            {
                $lookup: {
                    from: 'nurses',
                    localField: 'assignedDocs.empID',
                    foreignField: '_id',
                    as: 'nurseInfo'
                }
            },
            {
                $unwind: {
                    path: '$nurseInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',              // FIXED: Group by _id instead of workID
                    date: { $first: '$date' },
                    shiftType: { $first: '$shiftType' },
                    requiredEmployees: { $first: '$requiredEmployees' },
                    assigned: {
                        $push: {
                            $cond: [
                                { $ifNull: ['$nurseInfo._id', false] },
                                {
                                    empID: '$nurseInfo._id',
                                    name: '$nurseInfo.name',
                                    phone: '$nurseInfo.phone'
                                },
                                '$REMOVE'
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    workID: '$_id',           // FIXED: Return _id as workID for compatibility
                    date: 1,
                    shiftType: 1,
                    requiredEmployees: 1,
                    assigned: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        console.log(`[DEBUG] Found ${schedule.length} shifts for ${yearmonth}`);

        if (!schedule.length) {
            return res.status(404).json({
                success: false,
                message: `No schedule data found for ${yearmonth}.`
            });
        }

        res.status(200).json({
            success: true,
            message: `Retrieved ${schedule.length} shifts.`,
            data: schedule
        });

    } catch (error) {
        console.error('[ERROR] Error fetching monthly schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching monthly schedule.',
            error: error.message
        });
    }
};


/**
 * @route   GET /api/schedule/:yearmonth/:empId
 * @desc    Fetches all shifts for a specific nurse during a month.
 * @access  Public
 */
const getNurseShifts = async (req, res) => {
    try {
        const { yearmonth, empId } = req.params;
        console.log(`[DEBUG] getNurseShifts called with yearmonth: ${yearmonth}, empId: ${empId}`);

        // Validate yearmonth format first
        if (!/^\d{4}-\d{2}$/.test(yearmonth)) {
            console.log(`[ERROR] Invalid yearmonth format: ${yearmonth}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid year-month format. Use YYYY-MM (e.g., 2025-07)'
            });
        }

        // Check if empId is provided
        if (!empId) {
            console.log(`[ERROR] empId is missing or empty`);
            return res.status(400).json({
                success: false,
                message: 'Nurse ID is required.'
            });
        }

        // Validate empId format - be more lenient and provide better error info
        if (!mongoose.Types.ObjectId.isValid(empId)) {
            console.log(`[ERROR] Invalid empId format: "${empId}" (length: ${empId.length})`);
            console.log(`[ERROR] Expected 24-character hex string ObjectId`);
            return res.status(400).json({
                success: false,
                message: `Invalid nurse ID format. Expected 24-character ObjectId, got: "${empId}"`
            });
        }

        console.log(`[DEBUG] Validated empId: ${empId}`);

        // Check if nurse exists
        const nurse = await Nurse.findById(empId);
        if (!nurse) {
            console.log(`[ERROR] Nurse not found with ID: ${empId}`);
            return res.status(404).json({
                success: false,
                message: 'Nurse not found.'
            });
        }

        console.log(`[DEBUG] Found nurse: ${nurse.name}`);

        // Find shifts for this nurse in the given month
        const shifts = await Assigned.aggregate([
            {
                $match: { empID: new mongoose.Types.ObjectId(empId) }
            },
            {
                $lookup: {
                    from: 'workdays',
                    localField: 'workID',
                    foreignField: '_id',     // FIXED: Look up by _id instead of workID
                    as: 'workdayInfo'
                }
            },
            {
                $unwind: '$workdayInfo'
            },
            {
                $match: {
                    'workdayInfo.scheduleMonth': yearmonth  // Use scheduleMonth field
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$workdayInfo.date',
                    shiftType: '$workdayInfo.shiftType',
                    isWeekend: '$workdayInfo.isWeekend',
                    isHoliday: '$workdayInfo.isHoliday'
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        console.log(`[DEBUG] Found ${shifts.length} shifts for nurse ${nurse.name} in ${yearmonth}`);

        res.status(200).json({
            success: true,
            message: `Found ${shifts.length} shifts for nurse ${nurse.name} in ${yearmonth}.`,
            data: shifts
        });

    } catch (error) {
        console.error('[ERROR] Error fetching nurse shifts:', error);
        console.error('[ERROR] Stack trace:', error.stack);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid nurse ID format: ${error.message}`, 
                error: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching nurse shifts.', 
            error: error.message 
        });
    }
};

module.exports = { getMonthlySchedule, getNurseShifts }