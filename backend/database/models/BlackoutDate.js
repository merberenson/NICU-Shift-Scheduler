// database/models/BlackoutDate.js - New model for managing training and blackout periods
const mongoose = require('mongoose');

const BlackoutDateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 200
    },
    description: {
        type: String,
        maxLength: 1000
    },
    
    // Date range
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    
    // Blackout type and scope
    blackoutType: {
        type: String,
        enum: [
            'mandatory_training',
            'compliance_meeting', 
            'system_maintenance',
            'department_meeting',
            'emergency_drill',
            'continuing_education',
            'certification_renewal',
            'other'
        ],
        required: true
    },
    
    // Who is affected
    affectedRoles: [{
        type: String,
        enum: ['all_nurses', 'day_shift', 'night_shift', 'senior_nurses', 'new_hires', 'specific_nurses']
    }],
    affectedNurses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nurse'
    }],
    
    // Scheduling impact
    blockScheduling: {
        type: Boolean,
        default: true // Prevent scheduling during this period
    },
    allowEmergencyOverride: {
        type: Boolean,
        default: false // Can admins override for emergencies
    },
    minimumStaffingRequired: {
        type: Number,
        default: 0 // Minimum nurses who must remain on duty
    },
    
    // Time specifics
    allDay: {
        type: Boolean,
        default: true
    },
    startTime: {
        type: String, // Format: "14:00" (24-hour)
        default: null
    },
    endTime: {
        type: String, // Format: "16:00" (24-hour)
        default: null
    },
    
    // Recurrence (for regular training)
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        default: null
    },
    recurrenceEnd: {
        type: Date,
        default: null
    },
    
    // Administrative
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'approved', 'active', 'completed', 'cancelled'],
        default: 'draft'
    },
    
    // Impact tracking
    schedulingConflicts: [{
        conflictDate: String,
        conflictType: String,
        affectedShifts: Number,
        resolvedAt: Date
    }],
    
    // Notifications
    notifyInAdvance: {
        type: Number,
        default: 7 // Days before to notify nurses
    },
    notificationsSent: {
        type: Boolean,
        default: false
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient queries
BlackoutDateSchema.index({ startDate: 1, endDate: 1 });
BlackoutDateSchema.index({ blackoutType: 1, status: 1 });
BlackoutDateSchema.index({ affectedNurses: 1 });

// Pre-save middleware
BlackoutDateSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Validate date range
    if (this.endDate < this.startDate) {
        return next(new Error('End date cannot be before start date'));
    }
    
    // Validate time range if not all day
    if (!this.allDay && this.startTime && this.endTime) {
        if (this.endTime <= this.startTime) {
            return next(new Error('End time must be after start time'));
        }
    }
    
    next();
});

// Instance method to check if a nurse is affected on a specific date
BlackoutDateSchema.methods.isNurseAffected = function(nurseId, checkDate) {
    // Check if date is within blackout period
    const date = new Date(checkDate);
    if (date < this.startDate || date > this.endDate) {
        return false;
    }
    
    // Check if nurse is specifically affected
    if (this.affectedRoles.includes('all_nurses')) {
        return true;
    }
    
    if (this.affectedNurses.includes(nurseId)) {
        return true;
    }
    
    // Additional role-based checking would require nurse data
    return false;
};

// Instance method to generate recurring instances
BlackoutDateSchema.methods.generateRecurringInstances = async function() {
    if (!this.isRecurring || !this.recurrencePattern) {
        return [];
    }
    
    const instances = [];
    let currentDate = new Date(this.startDate);
    const endRecurrence = this.recurrenceEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default
    
    while (currentDate <= endRecurrence) {
        // Create instance for current date
        const instanceEndDate = new Date(currentDate);
        instanceEndDate.setTime(instanceEndDate.getTime() + (this.endDate - this.startDate));
        
        instances.push({
            ...this.toObject(),
            _id: undefined,
            startDate: new Date(currentDate),
            endDate: instanceEndDate,
            isRecurring: false, // Instances are not recurring themselves
            parentRecurrence: this._id
        });
        
        // Advance to next occurrence
        switch (this.recurrencePattern) {
            case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            case 'quarterly':
                currentDate.setMonth(currentDate.getMonth() + 3);
                break;
            case 'yearly':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
        }
    }
    
    return instances;
};

// Static method to find active blackouts for a date range
BlackoutDateSchema.statics.findActiveBlackouts = async function(startDate, endDate, nurseId = null) {
    const query = {
        status: { $in: ['approved', 'active'] },
        $or: [
            { startDate: { $lte: endDate, $gte: startDate } },
            { endDate: { $lte: endDate, $gte: startDate } },
            { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
        ]
    };
    
    const blackouts = await this.find(query)
        .populate('affectedNurses', 'name username')
        .populate('createdBy', 'name username');
    
    // Filter by nurse if specified
    if (nurseId) {
        return blackouts.filter(blackout => 
            blackout.isNurseAffected(nurseId, startDate)
        );
    }
    
    return blackouts;
};

// Static method to check scheduling conflicts
BlackoutDateSchema.statics.checkSchedulingConflicts = async function(date, shiftType, nurseIds) {
    const conflicts = [];
    const blackouts = await this.findActiveBlackouts(date, date);
    
    for (const blackout of blackouts) {
        for (const nurseId of nurseIds) {
            if (blackout.isNurseAffected(nurseId, date)) {
                conflicts.push({
                    blackoutId: blackout._id,
                    blackoutTitle: blackout.title,
                    nurseId: nurseId,
                    date: date,
                    shiftType: shiftType,
                    canOverride: blackout.allowEmergencyOverride
                });
            }
        }
    }
    
    return conflicts;
};

module.exports = mongoose.model('BlackoutDate', BlackoutDateSchema);
