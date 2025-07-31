// database/models/OnCallPool.js - New model for managing on-call nurses
const mongoose = require('mongoose');

const OnCallPoolSchema = new mongoose.Schema({
    date: {
        type: String, // Format: "2025-07-15"
        required: true
    },
    shiftType: {
        type: String,
        enum: ['day', 'night'],
        required: true
    },
    
    // On-call nurses for this shift
    onCallNurses: [{
        nurseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Nurse',
            required: true
        },
        priority: {
            type: Number,
            required: true,
            default: 1 // 1 = first call, 2 = second call, etc.
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        lastCalled: {
            type: Date,
            default: null
        },
        callCount: {
            type: Number,
            default: 0 // Track how many times called this month
        }
    }],
    
    // Staffing requirements
    targetStaffing: {
        type: Number,
        required: true,
        default: 3
    },
    minimumStaffing: {
        type: Number,
        required: true,
        default: 2
    },
    currentStaffing: {
        type: Number,
        default: 0
    },
    
    // Emergency response tracking
    emergencyActivated: {
        type: Boolean,
        default: false
    },
    activatedAt: {
        type: Date,
        default: null
    },
    activatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    
    // Auto-generation metadata
    generatedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient lookups
OnCallPoolSchema.index({ date: 1, shiftType: 1 }, { unique: true });

// Pre-save middleware to update timestamp
OnCallPoolSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Instance method to get next available on-call nurse
OnCallPoolSchema.methods.getNextAvailableNurse = function() {
    const availableNurses = this.onCallNurses
        .filter(nurse => nurse.isAvailable)
        .sort((a, b) => {
            // Sort by priority first, then by call count (fairness)
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.callCount - b.callCount;
        });
    
    return availableNurses.length > 0 ? availableNurses[0] : null;
};

// Instance method to activate emergency staffing
OnCallPoolSchema.methods.activateEmergency = function(adminId) {
    this.emergencyActivated = true;
    this.activatedAt = new Date();
    this.activatedBy = adminId;
    return this.save();
};

// Static method to find or create on-call pool for a date/shift
OnCallPoolSchema.statics.findOrCreate = async function(date, shiftType) {
    let pool = await this.findOne({ date, shiftType });
    
    if (!pool) {
        // Auto-generate on-call pool based on available nurses
        const Nurse = require('./nurse');
        const availableNurses = await Nurse.find({
            isActive: true,
            shiftPreference: shiftType,
            // Add logic to exclude nurses already scheduled
        }).limit(5); // Limit to 5 on-call nurses per shift
        
        const onCallNurses = availableNurses.map((nurse, index) => ({
            nurseId: nurse._id,
            priority: index + 1,
            isAvailable: true
        }));
        
        pool = new this({
            date,
            shiftType,
            onCallNurses
        });
        
        await pool.save();
    }
    
    return pool;
};

module.exports = mongoose.model('OnCallPool', OnCallPoolSchema);