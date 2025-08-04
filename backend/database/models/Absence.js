// database/models/Absence.js - New model for tracking nurse absences
const mongoose = require('mongoose');

const AbsenceSchema = new mongoose.Schema({
    nurseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nurse',
        required: true
    },
    workId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work',
        required: true
    },
    
    // Absence details
    date: {
        type: String, // Format: "2025-07-15"
        required: true
    },
    shiftType: {
        type: String,
        enum: ['day', 'night'],
        required: true
    },
    
    // Absence type and reason
    absenceType: {
        type: String,
        enum: ['sick', 'emergency', 'personal', 'family_emergency', 'other'],
        required: true
    },
    reason: {
        type: String,
        maxLength: 500
    },
    
    // Timing information
    reportedAt: {
        type: Date,
        default: Date.now
    },
    shiftStartTime: {
        type: Date,
        required: true
    },
    isLastMinute: {
        type: Boolean,
        default: false // Set to true if reported < 2 hours before shift
    },
    
    // Replacement tracking
    replacementStatus: {
        type: String,
        enum: ['pending', 'assigned', 'unfilled', 'emergency_staffing'],
        default: 'pending'
    },
    replacementNurse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nurse',
        default: null
    },
    replacementSource: {
        type: String,
        enum: ['on_call', 'volunteer', 'mandatory', 'admin_override'],
        default: null
    },
    
    // Administrative handling
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    handledAt: {
        type: Date,
        default: null
    },
    adminNotes: {
        type: String,
        maxLength: 1000
    },
    
    // Impact assessment
    criticalityLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    patientSafetyImpact: {
        type: Boolean,
        default: false
    },
    
    // Follow-up tracking
    requiresFollowUp: {
        type: Boolean,
        default: false
    },
    followUpNotes: {
        type: String,
        maxLength: 1000
    },
    resolvedAt: {
        type: Date,
        default: null
    }
});

// Compound indexes for efficient queries
AbsenceSchema.index({ nurseId: 1, date: 1 });
AbsenceSchema.index({ date: 1, shiftType: 1 });
AbsenceSchema.index({ replacementStatus: 1, criticalityLevel: 1 });

// Pre-save middleware to calculate timing and criticality
AbsenceSchema.pre('save', function(next) {
    // Determine if this is last-minute (< 2 hours before shift)
    const hoursBeforeShift = (this.shiftStartTime - this.reportedAt) / (1000 * 60 * 60);
    this.isLastMinute = hoursBeforeShift < 2;
    
    // Auto-set criticality based on timing and shift type
    if (this.isLastMinute) {
        this.criticalityLevel = 'high';
    } else if (hoursBeforeShift < 8) {
        this.criticalityLevel = 'medium';
    }
    
    // Set patient safety impact for critical shifts
    if (this.criticalityLevel === 'high' || this.criticalityLevel === 'critical') {
        this.patientSafetyImpact = true;
    }
    
    next();
});

// Instance method to find replacement nurse
AbsenceSchema.methods.findReplacement = async function() {
    const OnCallPool = require('./OnCallPool');
    
    try {
        // Get on-call pool for this date/shift
        const pool = await OnCallPool.findOrCreate(this.date, this.shiftType);
        
        // Get next available on-call nurse
        const onCallNurse = pool.getNextAvailableNurse();
        
        if (onCallNurse) {
            // Update the on-call nurse's call count and last called time
            const nurseEntry = pool.onCallNurses.id(onCallNurse._id);
            nurseEntry.callCount += 1;
            nurseEntry.lastCalled = new Date();
            
            await pool.save();
            
            // Update this absence record
            this.replacementNurse = onCallNurse.nurseId;
            this.replacementSource = 'on_call';
            this.replacementStatus = 'assigned';
            
            return await this.save();
        } else {
            // No on-call nurses available - escalate to emergency staffing
            this.replacementStatus = 'emergency_staffing';
            this.criticalityLevel = 'critical';
            this.patientSafetyImpact = true;
            
            return await this.save();
        }
    } catch (error) {
        console.error('Error finding replacement:', error);
        this.replacementStatus = 'unfilled';
        return await this.save();
    }
};

// Static method to get absence statistics
AbsenceSchema.statics.getStats = async function(startDate, endDate) {
    const stats = await this.aggregate([
        {
            $match: {
                reportedAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: null,
                totalAbsences: { $sum: 1 },
                lastMinuteAbsences: {
                    $sum: { $cond: ['$isLastMinute', 1, 0] }
                },
                unfilledShifts: {
                    $sum: { $cond: [{ $eq: ['$replacementStatus', 'unfilled'] }, 1, 0] }
                },
                emergencyStaffing: {
                    $sum: { $cond: [{ $eq: ['$replacementStatus', 'emergency_staffing'] }, 1, 0] }
                },
                averageCriticality: { $avg: '$criticalityLevel' }
            }
        }
    ]);
    
    return stats[0] || {};
};

module.exports = mongoose.model('Absence', AbsenceSchema);