const Nurse = require('../database/models/nurse');
const Work = require('../database/models/workDay');
const Assignment = require('../database/models/workAssignment');
const CallIn = require('../database/models/callIn');

getCallInList = async (date, shiftType) => {
    try {
      
      const dateFormats = [
        date, // Original format (YYYY-MM-DD)
        new Date(date).toISOString(), // ISO format
        new Date(date).toISOString().split('T')[0] // Just date part
      ];

      // Normalize shiftType to lowercase
      shiftType = shiftType.toLowerCase();
      
      // Debug: Log the exact query being made
      console.log('Querying workday with:', { date, shiftType });

      //Find the workday for the given date
      const workday = await Work.findOne({ date: {$in: dateFormats}, shiftType }).lean();
      
      if (!workday) {
        // Get list of all workdays for debugging
        const allWorkdays = await Work.find({}).lean();
        console.log('All workdays in DB:', allWorkdays);
        
        throw new Error(`No workday found for date ${date} and shift ${shiftType}. `);
      }

      //Get all nurses assigned to this workday
      const assignedNurses = await Assignment.find({ workID: workday._id }).distinct('empID');

      //Find nurses not assigned to this workday
      const unassignedNurses = await Nurse.find({
        _id: { $nin: assignedNurses }
      });

      //Get day of week from the date
      const dayOfWeek = getDayOfWeek(date);

      //Filter nurses who are available for this day/shift
      const availableNurses = unassignedNurses.filter(nurse => {
        const availability = nurse.availability.find(avail => avail.dayOfWeek === dayOfWeek);
        
        //Check if nurse is available for this shift type and hasn't exceeded max hours
        return availability && 
               (availability.timeOfDay === shiftType || availability.timeOfDay === 'day') &&
               (nurse.maxWeeklyHours === undefined || 
                nurse.currentWeeklyHours + getShiftHours(shiftType) <= nurse.maxWeeklyHours);
      });

      // Get or create call-in records for these nurses
      const callIns = await Promise.all(
        availableNurses.map(async nurse => {
          let callIn = await CallIn.findOne({ 
            workID: workday._id, 
            empID: nurse._id 
          });
          
          if (!callIn) {
            callIn = new CallIn({
              workID: workday._id,
              empID: nurse._id,
              status: 'available'
            });
            await callIn.save();
          }
          
          return callIn;
        })
      );

      //Return nurses with their call-in status
      return availableNurses.map(nurse => {
        const callIn = callIns.find(ci => ci.empID.equals(nurse._id));
        return {
          nurse: {
            _id: nurse._id,
            name: nurse.name,
            phone: nurse.phone,
            email: nurse.email,
            currentWeeklyHours: nurse.currentWeeklyHours,
            maxWeeklyHours: nurse.maxWeeklyHours
          },
          callInStatus: callIn ? callIn.status : 'available',
          workdayId: workday._id
        };
    });

    } catch (error) {
      console.error('Error in getAvailableNurses:', error);
      throw error;
    }
}

updateCallInStatus = async (date, shiftType, empID, status) => {
    try {
      // Find the workday first
      const workday = await Work.findOne({ date, shiftType });
      if (!workday) {
        throw new Error(`No workday found for date ${date} and shift ${shiftType}`);
      }

      const callIn = await CallIn.findOneAndUpdate(
        { workID: workday._id, empID },
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!callIn) {
        throw new Error('Call-in record not found');
      }

      // If status is accepted, create an assignment
      if (status === 'accepted') {
        const assignment = new Assignment({
          workID: workday._id,
          empID,
          assignedby: 'call-in-system',
          timestamp: new Date().toISOString()
        });
        await assignment.save();

        // Update nurse's current weekly hours
        const shiftHours = getShiftHours(shiftType);
        await Nurse.findByIdAndUpdate(empID, {
          $inc: { currentWeeklyHours: shiftHours }
        });
      }

      return callIn;
    } catch (error) {
      console.error('Error in updateCallInStatus:', error);
      throw error;
    }
}


// Helper functions
function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function getShiftHours(shiftType) {
  // Assuming day shift is 8 hours and night shift is 12 hours
  return shiftType === 'day' ? 8 : 12;
}

module.exports = { getCallInList, updateCallInStatus, getDayOfWeek, getShiftHours };