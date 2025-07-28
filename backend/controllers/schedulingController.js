const Nurse = require('../database/models/nurse');
const Work = require('../database/models/workDay');
const Assigned = require('../database/models/workAssignment');
const mongoose = require('mongoose');

/**
 * @route   GET /api/nurses/all/:yearmonth
 * @desc    Fetches full schedule for a given year-month (e.g., 2025-07)
 * @access  Public
 */

const getMonthlySchedule = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`Fetching schedule for: ${yearmonth}`);

        const schedule = await Work.aggregate([
            {
                $match: {
                    date: new RegExp('^' + yearmonth)
                }
            },
            {
                $lookup: {
                    from: 'assignments',
                    localField: 'workID',
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
                    _id: '$workID',
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
                                '$$REMOVE'
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    workID: '$_id',
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
        console.error('Error fetching monthly schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching monthly schedule.',
            error: error.message
        });
    }
};


/**
 * @route   GET /api/nurse/:yearmonth/:empId
 * @desc    Fetches all shifts for a specific nurse during a month.
 * @access  Public
 */

const getNurseShifts = async (req, res) => {
    try {
        const { yearmonth, empId } = req.params;
        console.log(`Received request for nurse shifts for year/month: ${yearmonth} and empId: ${empId}`);


        const nurse = await Nurse.findById(empId);
        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found.'
            });
        }

        const shifts = await Assigned.aggregate([
            {
                $match: { empID: new mongoose.Types.ObjectId(empId) }
            },
            {
                $lookup: {
                    from: 'workdays',
                    localField: 'workID',
                    foreignField: 'workID',
                    as: 'workdayInfo'
                }
            },
            {
                $unwind: '$workdayInfo'
            },
            {
                $match: {
                    'workdayInfo.date': new RegExp('^' + yearmonth)
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$workdayInfo.date',
                    shiftType: '$workdayInfo.shiftType'
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        if (!nurseShifts) {
            return res.status(404).json({ success: false, message: 'Shift collection is not defined for this Nurse.' });
        }

        res.status(200).json({
            success: true,
            message: `Found ${shifts.length} shifts for nurse ${empId} in ${yearmonth}.`,
            data: shifts
        });

    } catch (error) {
        console.error('Error fetching nurse shifts:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid nurse ID.', error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error fetching nurse shifts.', error: error.message });
    }
};

module.exports = { getMonthlySchedule, getNurseShifts }