const Nurse = require('../database/models/nurse');
const Work = require('../database/models/workDay');
const Assigned = require('../database/models/workAssignment');
const mongoose = require('mongoose');

/**
 * @route   GET /api/nurses/all
 * @desc    Fetches all nurses from the schedule.
 * @access  Public
 */

const getMonthlySchedule = async (req, res) => {
    try {
        const { yearmonth } = req.params;
        console.log(`Attempting to fetch ${ yearmonth } data`);

        const schedule = await Work.aggregate([
            {
                $match: {
                    date: new RegExp('^' + yearmonth)
                }
            },
            {
                $lookup: {
                    from: 'assignments',
                    let: { work_id_as_string: { $toString: "$workID" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$workID", "$$work_id_as_string"]
                                }
                            }
                        }
                    ],
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
                $addFields: {
                    "assignedEmpIdObj": {
                        $cond: {
                           if: { $eq: [ { $type: "$assignedDocs.empID" }, "string" ] },
                           then: { $toObjectId: "$assignedDocs.empID" },
                           else: null
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'nurses',
                    localField: 'assignedEmpIdObj',
                    foreignField: 'empID',
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
                    _id: '$_id',
                    workID: { $first: '$workID' },
                    date: { $first: '$date' },
                    shiftType: { $first: '$shiftType' },
                    requiredEmployees: { $first: '$requiredEmployees' },
                    assigned: {
                        $push: {
                           $cond: {
                               if: '$nurseInfo.empID',
                               then: {
                                   empID: '$nurseInfo.empID',
                                   name: '$nurseInfo.name',
                                   phone: '$nurseInfo.phone'
                               },
                               else: '$$REMOVE'
                           }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0, 
                    workID: 1,
                    date: 1,
                    shiftType: 1,
                    requiredEmployees: 1,
                    assigned: 1
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);

        if (!schedule || schedule.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No schedule data found for ${yearmonth}.`
            });
        }

        res.status(200).json({
            success: true,
            message: `Successfully retrieved ${schedule.length} work shift records.`,
            data: schedule
        });

    } catch (error) {
        console.error(`Error in /api/schedule/:yearmonth endpoint:`, error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred while fetching the schedule.',
            error: error.message
        });
    }
}


/**
 * @route   GET /api/nurse/:yearmonth/:empId
 * @desc    Fetches all assigned shifts (date and shiftType) for a specific nurse in a given month.
 * @access  Public
 */

const getNurseShifts = async (req, res) => {
    try {
        const { yearmonth, empId } = req.params;
        console.log(`Received request for nurse shifts for year/month: ${yearmonth} and empId: ${empId}`);

        const nurseinfo = await Nurse.find({empID : empId});
        if (!nurseinfo || nurseinfo.length == 0) {
            return res.status(404).json({ success: false, message: 'Invalid Nurse id provided.' });
        }

        const nurseShifts = await Assigned.aggregate([
            {
                $match: {
                    empID: empId
                }
            },
            {
                $addFields: {
                    "workIdObj": {
                        $toObjectId: "$workID"
                    }
                }
            },
            {
                $lookup: {
                    from: 'workdays',
                    localField: 'workIdObj',
                    foreignField: 'workID',
                    as: 'workdayInfo'
                }
            },
            {
                $unwind: '$workdayInfo'
            },
            {
                $match: {
                    "workdayInfo.date": new RegExp('^' + yearmonth)
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
                $sort: {
                    date: 1
                }
            }
        ]);

        if (!nurseShifts) {
            return res.status(404).json({ success: false, message: 'Shift collection is not defined for this Nurse.' });
        }

        res.status(200).json({
            success: true,
            message: `Successfully found ${nurseShifts.length} shifts for nurse ${empId} in ${yearmonth}`,
            data: nurseShifts
        });

    } catch (error) {
        console.error('Error in /api/nurse/:yearmonth/:empId endpoint:', error);
        if (error.name === 'CastError') {
             return res.status(400).json({ success: false, message: 'Invalid Employee ID format.', error: error.message });
        }
        res.status(500).json({ success: false, message: 'An internal server error occurred.', error: error.message });
    }
}

module.exports = { getMonthlySchedule, getNurseShifts }