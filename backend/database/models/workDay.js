const mongoose = require('mongoose');

const WorkDaySchema = new mongoose.Schema({
    workID: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true
    },
    date: {
        type: String, 
        required: true // Format: "2025-07-15"
    },
    dayOfWeek: {
        type: String,
        required: true
    },
    shiftType: {
        type: String,
        enum: ['day', 'night'],
        required: true
    },
    requiredEmployees: {
        type: Number,
        required: true,
        default: 3
    },
    minimumEmployees: {
        type: Number,
        required: true,
        default: 2
    },
    isWeekend: {
        type: Boolean,
        default: false
    },
    isHoliday: {
        type: Boolean,
        default: false
    },
    holidayName: {
        type: String,
        default: null
    },
    
    // Schedule generation metadata
    scheduleMonth: { type: String, required: true }, // Format: "2025-07"
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to set weekend and day of week
WorkDaySchema.pre('save', function(next) {
    const date = new Date(this.date + 'T00:00:00.000Z');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    this.dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    this.isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    this.scheduleMonth = this.date.substring(0, 7); // Extract "2025-07" from "2025-07-15"
    this.updatedAt = new Date();
    
    next();
});

module.exports = mongoose.model('Work', WorkDaySchema, 'workdays');
