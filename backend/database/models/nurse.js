const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NurseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.']
    },
    username: {
        type: String,
        required: [true, 'Username is required.'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required.']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required.']
    },
    availability: [{
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        timeOfDay: {
            type: String,
            enum: ['day', 'night', 'unavailable'],
            default: 'unavailable'
        }
        }],
        lastAvailabilityUpdate: {
        type: Date,
        default: Date.now
        },
    hireDate: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    shiftPreference: { 
        type: String, 
        enum: ['day', 'night'], 
        required: true,
        default: 'day' 
    },
    weekendRotation: {
        type: String,
        enum: ['every_other', 'every_third', 'exempt'], // Based on seniority
        default: 'every_other'
    },
    lastWeekendWorked: { 
        type: Date, 
        default: null 
    },
    holidayRotation: {
        christmas: { type: Number, default: 0 }, // Year last worked Christmas
        newYear: { type: Number, default: 0 }    // Year last worked New Year
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    seniority: { 
        type: Number, 
        default: 0 // Years of experience, calculated from hireDate
    }
});

// Calculate seniority before saving
NurseSchema.pre('save', async function(next) {
    if (!this.isModified('password') && !this.isNew) {
        // Calculate seniority in years
        const yearsOfService = (Date.now() - this.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        this.seniority = Math.floor(yearsOfService);
        
        // Auto-assign weekend rotation based on seniority
        if (this.seniority < 1) {
            this.weekendRotation = 'every_other';
        } else if (this.seniority < 25) {
            this.weekendRotation = 'every_third';
        } else {
            this.weekendRotation = 'exempt';
        }
        
        return next();
    }
    
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('Nurse', NurseSchema, 'nurses');