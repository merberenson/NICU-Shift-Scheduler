const Nurse = require('../database/models/nurse');
const workDay = require('../database/models/workDay');
const Assignment = require('../database/models/workAssignment');
const mongoose = require('mongoose');


const getNurseSchedule = async (req, res) => {
    try {
        const { nurseId, startDate } = req.params;
        
        console.log(nurseId, startDate)
        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(nurseId)) {
            return res.status(400).json({ success: false, message: 'Invalid nurse ID' });
        }

        // Calculate date range for the week (assuming startDate is in YYYY-MM-DD format)
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid start date' });
        }

        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Get the end of the week

        // Get all assignments for this nurse
        const assignments = await Assignment.find({ 
            empID: nurseId 
        }).populate({
            path: 'workID',
            match: { 
                date: { 
                    $gte: start.toISOString().split('T')[0], 
                    $lte: end.toISOString().split('T')[0] 
                } 
            }
        });

        // Filter out assignments without workdays, and format.
        const schedule = assignments
        .filter(a => a.workID !== null)
        .map(assignment => ({
                date: assignment.workID.date,
                dayOfWeek: new Date(assignment.workID.date).toLocaleDateString('en-US', { weekday: 'long' }),
                shiftType: assignment.workID.shiftType,
                startTime: assignment.workID.shiftType === 'day' ? '7:00 AM' : '7:00 PM',
                endTime: assignment.workID.shiftType === 'day' ? '7:00 PM' : '7:00 AM',
                duration: '12 hours'
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        

        res.status(200).json({ 
            success: true, 
            data: schedule 
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to retrieve nurse schedule' });
    }
};

const getMonthlySchedule = async (req, res) => {
    try {
        const { startDate } = req.params;
        
        console.log(startDate)
        // Calculate date range for the week (assuming startDate is in YYYY-MM-DD format)
        const start = new Date(startDate);
        console.log(start)
        if (isNaN(start.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid start date' });
        }


        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);

        const assignments = await Assignment.find({}).populate({
            path: 'workID',
            match: { 
                date: { 
                    $gte: start.toISOString().split('T')[0], 
                    $lte: end.toISOString().split('T')[0] 
                } 
            }
        });

        // Filter out assignments without workdays (due to the match condition)
        const filteredAssignments = assignments.filter(a => a.workID !== null);

        // Format the response
        const schedule = filteredAssignments.map(assignment => ({
            date: assignment.workID.date,
            shiftType: assignment.workID.shiftType,
            assignedBy: assignment.assignedby,
            assignmentTime: assignment.timestamp,
            nurseId: assignment.empID
        }));

        res.status(200).json({ 
            success: true, 
            data: schedule 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to retrieve monthly schedule '})
    }
};

module.exports = { getNurseSchedule, getMonthlySchedule };