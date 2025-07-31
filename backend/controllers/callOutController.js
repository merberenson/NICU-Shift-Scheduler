
const Nurse = require('../database/models/nurse');
const Work = require('../database/models/workDay');
const Assignment = require('../database/models/workAssignment');


async function unscheduleNurse(date, shiftType, empID) {
  try {
    // 1. Find the workday
    const workday = await Work.findOne({ date, shiftType });
    if (!workday) {
      throw new Error(`No workday found for date ${date} and shift ${shiftType}`);
    }

    // 2. Remove the nurse's assignment for that day/shift
    const assignment = await Assignment.findOneAndDelete({
      workID: workday._id,
      empID
    });

    if (!assignment) {
      throw new Error('No assignment found for this nurse on this date/shift');
    }

    // 3. Reduce the nurse's current weekly hours
    const shiftHours = getShiftHours(shiftType);
    await Nurse.findByIdAndUpdate(empID, {
      $inc: { currentWeeklyHours: -shiftHours }
    });

    return { message: `Nurse ${empID} unscheduled for ${date} (${shiftType})` };
  } catch (error) {
    console.error('Error in unscheduleNurse:', error);
    throw error;
  }
}

// helper 
function getShiftHours(shiftType) {
  return shiftType === 12;
}

module.exports = {
  unscheduleNurse
};