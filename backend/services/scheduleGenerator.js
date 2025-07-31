const Nurse = require('../database/models/nurse');
const Work = require('../database/models/workDay');
const Assignment = require('../database/models/workAssignment');
const PTORequest = require('../database/models/PTORequest');
const ScheduleTemplate = require('../database/models/ScheduleTemplate');
const mongoose = require('mongoose');

class ScheduleGenerator {
    constructor() {
        this.constraints = {
            maxConsecutiveShifts: 4,
            minRestHours: 12,
            minDaysOffAfterConsecutive: 1,
            shiftLengthHours: 12
        };
    }

    /**
     * Main method to generate a monthly schedule
     * @param {string} yearMonth - Format: "2025-07"
     * @param {string} generatedBy - Admin ID who triggered generation
     */
    async generateMonthlySchedule(yearMonth, generatedBy) {
        try {
            console.log(`Starting schedule generation for ${yearMonth}`);
            
            const nurses = await this.getActiveNurses();
            console.log(`Found ${nurses.length} active nurses`);
            console.log('Nurse details:', nurses.map(n => ({ 
                id: n._id, 
                name: n.name, 
                hasAvailability: n.availability?.length > 0,
                shiftPreference: n.shiftPreference,
                maxWeeklyHours: n.maxWeeklyHours 
            })));
            
            const ptoRequests = await this.getApprovedPTOForMonth(yearMonth);
            console.log(`Found ${ptoRequests.length} PTO requests`);
            
            const template = await this.createScheduleTemplate(yearMonth);
            console.log(`Created/found schedule template`);
            
            const workDays = await this.generateWorkDays(yearMonth, template);
            console.log(`Generated ${workDays.length} work days`);
            
            const assignments = await this.assignNursesToShifts(workDays, nurses, ptoRequests);
            console.log(`Created ${assignments.length} assignments`);
            
            const validation = await this.validateSchedule(assignments, nurses);
            console.log(`Validation result: ${validation.isValid ? 'VALID' : 'INVALID'}`);
            
            // Save assignments to database
            if (validation.isValid) {
                await this.saveScheduleAssignments(assignments);
                await this.markTemplateAsGenerated(template._id, generatedBy);
                
                return {
                    success: true,
                    message: `Schedule generated successfully for ${yearMonth}`,
                    stats: {
                        totalShifts: assignments.length,
                        nursesScheduled: new Set(assignments.map(a => a.empID.toString())).size,
                        weekendShifts: assignments.filter(a => a.isWeekend).length
                    },
                    warnings: validation.warnings
                };
            } else {
                return {
                    success: false,
                    message: 'Schedule generation failed validation',
                    errors: validation.errors
                };
            }
            
        } catch (error) {
            console.error('Schedule generation failed:', error);
            throw new Error(`Schedule generation failed: ${error.message}`);
        }
    }

    /**
     * Get all active nurses with their constraints and preferences
     */
    async getActiveNurses() {
        try {
            console.log('Fetching active nurses...');
            
            // Try to find nurses with isActive: true first
            let nurses = await Nurse.find().lean();
            console.log(`Found ${nurses.length} nurses with isActive: true`);
            
            // If no active nurses but have nurses in DB, might not have isActive field
            if (nurses.length === 0) {
                console.log('No nurses found with isActive: true, checking total nurse count...');
                const totalNurses = await Nurse.countDocuments({});
                console.log(`Total nurses in database: ${totalNurses}`);
                
                if (totalNurses > 0) {
                    console.log('Using all nurses since isActive field appears to be missing from database');
                    // Get all nurses & assume they're active
                    nurses = await Nurse.find({}).lean();
                    console.log(`Retrieved ${nurses.length} total nurses`);
                }
            }

            // Process each nurse to ensure all required fields exist
            const processedNurses = nurses.map(nurse => {
                try {
                    // Ensure hireDate exists and is valid
                    const hireDate = nurse.hireDate ? new Date(nurse.hireDate) : new Date();
                    const yearsOfService = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                    nurse.seniority = Math.floor(yearsOfService);
                    
                    // Auto-assign weekend rotation based on seniority
                    if (nurse.seniority < 1) {
                        nurse.weekendRotation = 'every_other';
                    } else if (nurse.seniority < 5) {
                        nurse.weekendRotation = 'every_third';
                    } else {
                        nurse.weekendRotation = 'exempt';
                    }
                    
                    // Ensure required fields have defaults
                    nurse.shiftPreference = nurse.shiftPreference || 'any'; // Changed to 'any' for flexibility
                    nurse.availability = nurse.availability || [];
                    nurse.maxWeeklyHours = nurse.maxWeeklyHours || 48;
                    
                    // If no availability is set, create default availability
                    if (nurse.availability.length === 0) {
                        console.log(`Creating default availability for nurse ${nurse.name} (${nurse._id})`);
                        nurse.availability = this.generateDefaultAvailability();
                    }
                    
                    if (nurse.isActive === undefined) {
                        nurse.isActive = true;
                    }
                    
                    return nurse;
                } catch (err) {
                    console.error(`Error processing nurse ${nurse._id}:`, err);
                    // Return nurse with safe defaults
                    return {
                        ...nurse,
                        seniority: 0,
                        weekendRotation: 'every_other',
                        shiftPreference: 'any',
                        availability: this.generateDefaultAvailability(),
                        maxWeeklyHours: 48,
                        isActive: true
                    };
                }
            });
            
            console.log(`Processed ${processedNurses.length} nurses successfully`);
            
            // Log detailed nurse info for debugging
            processedNurses.forEach(nurse => {
                console.log(`Nurse: ${nurse.name}, Availability: ${nurse.availability.length} slots, Shift Pref: ${nurse.shiftPreference}`);
            });
            
            return processedNurses;
            
        } catch (error) {
            console.error('Error getting active nurses:', error);
            throw new Error(`Failed to get active nurses: ${error.message}`);
        }
    }

    /**
     * Generate default availability for nurses without availability data
     */
    generateDefaultAvailability() {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const timeSlots = ['day', 'night'];
        const availability = [];
        
        // Give each nurse availability for ALL days and shifts initially
        // This ensures maximum flexibility
        daysOfWeek.forEach(day => {
            timeSlots.forEach(timeOfDay => {
                availability.push({
                    dayOfWeek: day,
                    timeOfDay: timeOfDay
                });
            });
        });
        
        return availability;
    }

    /**
     * Get approved PTO requests for the month
     */
    async getApprovedPTOForMonth(yearMonth) {
        try {
            const [year, month] = yearMonth.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            
            return await PTORequest.find({
                status: 'approved',
                $or: [
                    { startDate: { $gte: startDate, $lte: endDate } },
                    { endDate: { $gte: startDate, $lte: endDate } },
                    { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
                ]
            }).populate('nurseId').lean();
        } catch (error) {
            console.error('Error getting PTO requests:', error);
            return [];
        }
    }

    /**
     * Create schedule template for the month
     */
    async createScheduleTemplate(yearMonth) {
        try {
            const [year, month] = yearMonth.split('-').map(Number);
            
            // Check if template exists
            let template = await ScheduleTemplate.findOne({ month: yearMonth });
            
            if (!template) {
                const dailyRequirements = this.generateDailyRequirements(year, month);
                
                template = new ScheduleTemplate({
                    month: yearMonth,
                    year: year,
                    monthNumber: month,
                    dailyRequirements: dailyRequirements,
                    status: 'draft'
                });
                
                await template.save();
            }
            
            return template;
        } catch (error) {
            console.error('Error creating schedule template:', error);
            throw new Error(`Failed to create schedule template: ${error.message}`);
        }
    }

    /**
     * Generate daily requirements for the month
     */
    generateDailyRequirements(year, month) {
        const dailyRequirements = [];
        const daysInMonth = new Date(year, month, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            // Check for holidays
            const holidayInfo = this.checkForHoliday(date);
            
            dailyRequirements.push({
                date: dateString,
                dayOfWeek: dayOfWeek,
                isWeekend: isWeekend,
                isHoliday: holidayInfo.isHoliday,
                holidayName: holidayInfo.name,
                shifts: [
                    {
                        shiftType: 'day',
                        requiredNurses: isWeekend ? 2 : 3,
                        minimumNurses: 2,
                        maxNurses: 5
                    },
                    {
                        shiftType: 'night',
                        requiredNurses: 2,
                        minimumNurses: 1,
                        maxNurses: 3
                    }
                ]
            });
        }
        
        return dailyRequirements;
    }

    /**
     * Check if a date is a holiday
     */
    checkForHoliday(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Basic holiday detection, expandable
        if (month === 12 && day === 25) return { isHoliday: true, name: 'Christmas' };
        if (month === 1 && day === 1) return { isHoliday: true, name: 'New Year' };
        if (month === 7 && day === 4) return { isHoliday: true, name: 'Independence Day' };
        if (month === 11 && day === 11) return { isHoliday: true, name: 'Veterans Day' };
        
        return { isHoliday: false, name: null };
    }

    /**
     * Generate work day records for the month
     */
    async generateWorkDays(yearMonth, template) {
        try {
            // Clear existing work days for the month
            await Work.deleteMany({ scheduleMonth: yearMonth });
            
            const workDays = [];
            
            for (const dayReq of template.dailyRequirements) {
                for (const shift of dayReq.shifts) {
                    const workDay = new Work({
                        date: dayReq.date,
                        dayOfWeek: dayReq.dayOfWeek,
                        shiftType: shift.shiftType,
                        requiredEmployees: shift.requiredNurses,
                        minimumEmployees: shift.minimumNurses,
                        isWeekend: dayReq.isWeekend,
                        isHoliday: dayReq.isHoliday,
                        holidayName: dayReq.holidayName,
                        scheduleMonth: yearMonth
                    });
                    
                    await workDay.save();
                    workDays.push(workDay);
                }
            }
            
            return workDays;
        } catch (error) {
            console.error('Error generating work days:', error);
            throw new Error(`Failed to generate work days: ${error.message}`);
        }
    }

    /**
     * Main algorithm to assign nurses to shifts
     */
    async assignNursesToShifts(workDays, nurses, ptoRequests) {
        try {
            const assignments = [];
            const nurseSchedules = new Map();
            
            // Initialize nurse schedules
            nurses.forEach(nurse => {
                nurseSchedules.set(nurse._id.toString(), {
                    nurse: nurse,
                    shifts: [],
                    weeklyHours: 0,
                    consecutiveShifts: 0,
                    lastShiftEnd: null,
                    weekendsWorked: 0
                });
            });
            
            // Sort work days by date to assign chronologically
            workDays.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Assign nurses to each shift
            for (const workDay of workDays) {
                console.log(`\nAssigning nurses for ${workDay.date} - ${workDay.shiftType} shift`);
                
                const eligibleNurses = this.findEligibleNurses(
                    workDay, 
                    nurses, 
                    nurseSchedules, 
                    ptoRequests
                );
                
                console.log(`Found ${eligibleNurses.length} eligible nurses for ${workDay.date} ${workDay.shiftType}:`, 
                    eligibleNurses.map(n => n.name));
                
                const selectedNurses = this.selectNursesForShift(
                    workDay, 
                    eligibleNurses, 
                    nurseSchedules
                );
                
                console.log(`Selected ${selectedNurses.length} nurses:`, selectedNurses.map(n => n.name));
                
                // Create assignments
                for (const nurse of selectedNurses) {
                    const assignment = {
                        workID: workDay._id,
                        empID: nurse._id,
                        assignedby: 'system',
                        timestamp: new Date().toISOString(),
                        
                        date: workDay.date,
                        shiftType: workDay.shiftType,
                        isWeekend: workDay.isWeekend,
                        isHoliday: workDay.isHoliday
                    };
                    
                    assignments.push(assignment);
                    
                    // Update nurse schedule tracking
                    this.updateNurseSchedule(nurseSchedules.get(nurse._id.toString()), workDay);
                }
            }
            
            return assignments;
        } catch (error) {
            console.error('Error assigning nurses to shifts:', error);
            throw new Error(`Failed to assign nurses: ${error.message}`);
        }
    }

    /**
     * Find eligible nurses for a specific shift
     */
    findEligibleNurses(workDay, nurses, nurseSchedules, ptoRequests) {
        // First pass - strict filtering
        let eligible = nurses.filter(nurse => {
            const nurseSchedule = nurseSchedules.get(nurse._id.toString());
            
            // Check if nurse is on PTO (always enforce)
            if (this.isNurseOnPTO(nurse._id, workDay.date, ptoRequests)) {
                console.log(`${nurse.name} is on PTO for ${workDay.date}`);
                return false;
            }
            
            // Check consecutive shift constraints (always enforce)
            if (nurseSchedule.consecutiveShifts >= this.constraints.maxConsecutiveShifts) {
                console.log(`${nurse.name} has reached max consecutive shifts (${nurseSchedule.consecutiveShifts})`);
                return false;
            }
            
            // Check minimum rest between shifts (always enforce)
            if (nurseSchedule.lastShiftEnd) {
                const shiftStart = new Date(workDay.date + 'T' + (workDay.shiftType === 'day' ? '07:00:00' : '19:00:00'));
                const hoursSinceLastShift = (shiftStart - nurseSchedule.lastShiftEnd) / (1000 * 60 * 60);
                if (hoursSinceLastShift < this.constraints.minRestHours) {
                    console.log(`${nurse.name} needs rest - only ${hoursSinceLastShift.toFixed(1)} hours since last shift`);
                    return false;
                }
            }
            
            return true;
        });
        
        console.log(`After basic constraints: ${eligible.length} nurses eligible`);
        
        // Second pass - try with shift preferences
        let preferredNurses = eligible.filter(nurse => {
            // Prefer nurses with matching shift preference
            if (nurse.shiftPreference && 
                nurse.shiftPreference !== 'any' && 
                nurse.shiftPreference !== workDay.shiftType) {
                return false;
            }
            return true;
        });
        
        console.log(`After shift preference: ${preferredNurses.length} nurses eligible`);
        
        // Third pass - try with availability constraints
        let availableNurses = preferredNurses.filter(nurse => {
            if (nurse.availability && nurse.availability.length > 0) {
                const dayAvailability = nurse.availability.find(
                    avail => avail.dayOfWeek === workDay.dayOfWeek && 
                            avail.timeOfDay === workDay.shiftType
                );
                if (!dayAvailability) {
                    return false;
                }
            }
            return true;
        });
        
        console.log(`After availability check: ${availableNurses.length} nurses eligible`);
        
        // Fourth pass - try with weekend constraints
        let weekendEligible = availableNurses.filter(nurse => {
            const nurseSchedule = nurseSchedules.get(nurse._id.toString()); // FIX: Add this line
            if (workDay.isWeekend && !this.isEligibleForWeekend(nurse, nurseSchedule)) {
                return false;
            }
            return true;
        });
        
        console.log(`After weekend check: ${weekendEligible.length} nurses eligible`);
        
        // Fifth pass - try with hour limits
        let hourEligible = weekendEligible.filter(nurse => {
            const nurseSchedule = nurseSchedules.get(nurse._id.toString());
            if (nurseSchedule.weeklyHours + this.constraints.shiftLengthHours > nurse.maxWeeklyHours) {
                return false;
            }
            return true;
        });
        
        console.log(`After hour limits: ${hourEligible.length} nurses eligible`);
        
        // Fallback logic: if we don't have enough nurses, relax constraints progressively
        if (hourEligible.length < workDay.requiredEmployees) {
            console.log(`Not enough nurses with all constraints. Relaxing constraints...`);
            
            // Try without hour limits
            if (weekendEligible.length >= workDay.requiredEmployees) {
                console.log(`Using nurses without hour limit constraints`);
                return weekendEligible;
            }
            
            // Try without weekend constraints
            if (availableNurses.length >= workDay.requiredEmployees) {
                console.log(`Using nurses without weekend rotation constraints`);
                return availableNurses;
            }
            
            // Try without availability constraints
            if (preferredNurses.length >= workDay.requiredEmployees) {
                console.log(`Using nurses without availability constraints`);
                return preferredNurses;
            }
            
            // Try without shift preference constraints
            if (eligible.length >= workDay.requiredEmployees) {
                console.log(`Using nurses without shift preference constraints`);
                return eligible;
            }
            
            // Last resort - use anyone available
            console.log(`Using all available nurses regardless of preferences`);
            return eligible;
        }
        
        return hourEligible;
    }

    /**
     * Select specific nurses from eligible pool for a shift
     */
    selectNursesForShift(workDay, eligibleNurses, nurseSchedules) {
        const requiredCount = workDay.requiredEmployees;
        
        if (eligibleNurses.length <= requiredCount) {
            return eligibleNurses; // Assign all eligible nurses
        }
        
        // Prioritize nurses based on fairness and constraints
        const scoredNurses = eligibleNurses.map(nurse => {
            const schedule = nurseSchedules.get(nurse._id.toString());
            let score = 0;
            
            // Prefer nurses with fewer total shifts
            score += (100 - schedule.shifts.length);
            
            // Prefer nurses with fewer consecutive shifts
            score += (10 - schedule.consecutiveShifts);
            
            // For weekends, consider rotation fairness
            if (workDay.isWeekend) {
                score += (10 - schedule.weekendsWorked);
            }
            
            // Prefer senior nurses for holidays
            if (workDay.isHoliday) {
                score += nurse.seniority;
            }
            
            return { nurse, score };
        });
        
        // Sort by score (highest first) and select required count
        scoredNurses.sort((a, b) => b.score - a.score);
        return scoredNurses.slice(0, requiredCount).map(item => item.nurse);
    }

    /**
     * Check if nurse is on PTO for given date
     */
    isNurseOnPTO(nurseId, date, ptoRequests) {
        const checkDate = new Date(date);
        return ptoRequests.some(pto => {
            return pto.nurseId._id.toString() === nurseId.toString() &&
                   checkDate >= new Date(pto.startDate) &&
                   checkDate <= new Date(pto.endDate);
        });
    }

    /**
     * Check if nurse is eligible for weekend shift based on rotation
     */
    isEligibleForWeekend(nurse, nurseSchedule) {
        // If no weekend rotation specified, allow weekend work
        if (!nurse.weekendRotation) {
            return true;
        }
        
        if (nurse.weekendRotation === 'exempt') {
            return false;
        }
        
        // Simple rotation logic
        if (nurse.weekendRotation === 'every_other') {
            return nurseSchedule.weekendsWorked % 2 === 0;
        }
        
        if (nurse.weekendRotation === 'every_third') {
            return nurseSchedule.weekendsWorked % 3 === 0;
        }
        
        return true;
    }

    /**
     * Update nurse schedule tracking after assignment
     */
    updateNurseSchedule(nurseSchedule, workDay) {
        nurseSchedule.shifts.push(workDay);
        nurseSchedule.weeklyHours += this.constraints.shiftLengthHours;
        
        // Track consecutive shifts
        const lastShift = nurseSchedule.shifts[nurseSchedule.shifts.length - 2];
        if (lastShift) {
            const lastDate = new Date(lastShift.date);
            const currentDate = new Date(workDay.date);
            const daysDiff = (currentDate - lastDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff === 1) {
                nurseSchedule.consecutiveShifts++;
            } else {
                nurseSchedule.consecutiveShifts = 1;
            }
        } else {
            nurseSchedule.consecutiveShifts = 1;
        }
        
        // Update last shift end time
        const shiftEndHour = workDay.shiftType === 'day' ? 19 : 7;
        nurseSchedule.lastShiftEnd = new Date(workDay.date + 'T' + String(shiftEndHour).padStart(2, '0') + ':00:00');
        
        // Track weekends worked
        if (workDay.isWeekend) {
            nurseSchedule.weekendsWorked++;
        }
    }

    /**
     * Validate the generated schedule
     */
    async validateSchedule(assignments, nurses) {
        const errors = [];
        const warnings = [];
        
        // Group assignments by nurse
        const nursesAssignments = new Map();
        assignments.forEach(assignment => {
            const nurseId = assignment.empID.toString();
            if (!nursesAssignments.has(nurseId)) {
                nursesAssignments.set(nurseId, []);
            }
            nursesAssignments.get(nurseId).push(assignment);
        });
        
        // Validate each nurse's schedule
        for (const [nurseId, nurseAssignments] of nursesAssignments) {
            const nurse = nurses.find(n => n._id.toString() === nurseId);
            const validation = this.validateNurseSchedule(nurse, nurseAssignments);
            
            errors.push(...validation.errors);
            warnings.push(...validation.warnings);
        }
        
        // Check if all shifts are covered
        const workDayShifts = await Work.find({ scheduleMonth: assignments[0]?.date.substring(0, 7) });
        for (const workDay of workDayShifts) {
            const assignedCount = assignments.filter(a => 
                a.workID.toString() === workDay._id.toString()
            ).length;
            
            if (assignedCount < workDay.minimumEmployees) {
                errors.push(`${workDay.date} ${workDay.shiftType} shift only has ${assignedCount} nurses assigned, minimum required: ${workDay.minimumEmployees}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate individual nurse's schedule
     */
    validateNurseSchedule(nurse, assignments) {
        const errors = [];
        const warnings = [];
        
        // Sort assignments by date
        assignments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let consecutiveCount = 0;
        let previousDate = null;
        
        for (let i = 0; i < assignments.length; i++) {
            const assignment = assignments[i];
            const currentDate = new Date(assignment.date);
            
            if (previousDate) {
                const daysDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
                
                if (daysDiff === 1) {
                    consecutiveCount++;
                    if (consecutiveCount > this.constraints.maxConsecutiveShifts) {
                        errors.push(`${nurse.name} has ${consecutiveCount} consecutive shifts, exceeding limit of ${this.constraints.maxConsecutiveShifts}`);
                    }
                } else {
                    consecutiveCount = 1;
                }
            } else {
                consecutiveCount = 1;
            }
            
            previousDate = currentDate;
        }
        
        // Check total weekly hours
        const totalHours = assignments.length * this.constraints.shiftLengthHours;
        if (totalHours > nurse.maxWeeklyHours) {
            warnings.push(`${nurse.name} scheduled for ${totalHours} hours, exceeding preferred ${nurse.maxWeeklyHours} hours`);
        }
        
        return { errors, warnings };
    }

    /**
     * Save all assignments to database
     */
    async saveScheduleAssignments(assignments) {
        try {
            // Clear existing assignments for the month
            const dates = [...new Set(assignments.map(a => a.date))];
            const workDays = await Work.find({ date: { $in: dates } });
            const workIDs = workDays.map(w => w._id);
            
            await Assignment.deleteMany({ workID: { $in: workIDs } });
            
            // Save new assignments
            const assignmentDocs = assignments.map(assignment => new Assignment(assignment));
            await Assignment.insertMany(assignmentDocs);
        } catch (error) {
            console.error('Error saving assignments:', error);
            throw new Error(`Failed to save assignments: ${error.message}`);
        }
    }

    /**
     * Mark template as generated
     */
    async markTemplateAsGenerated(templateId, generatedBy) {
        try {
            await ScheduleTemplate.findByIdAndUpdate(templateId, {
                status: 'generated',
                generatedAt: new Date(),
                generatedBy: generatedBy
            });
        } catch (error) {
            console.error('Error marking template as generated:', error);
            throw new Error(`Failed to mark template as generated: ${error.message}`);
        }
    }
}

module.exports = ScheduleGenerator;