const mongoose = require('mongoose');

const ScheduleTemplateSchema = new mongoose.Schema({
    month: { type: String, required: true }, // Format: "2025-07"
    year: { type: Number, required: true },
    monthNumber: { type: Number, required: true }, // 1-12
    
    // Daily shift requirements
    dailyRequirements: [{
        date: { type: String, required: true }, // Format: "2025-07-15"
        dayOfWeek: { type: String, required: true },
        isWeekend: { type: Boolean, default: false },
        isHoliday: { type: Boolean, default: false },
        holidayName: { type: String, default: null },
        
        shifts: [{
            shiftType: { type: String, enum: ['day', 'night'], required: true },
            requiredNurses: { type: Number, required: true, default: 3 },
            minimumNurses: { type: Number, required: true, default: 2 },
            maxNurses: { type: Number, required: true, default: 5 }
        }]
    }],
    
    // Schedule generation metadata
    generatedAt: { type: Date, default: null },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    status: { 
        type: String, 
        enum: ['draft', 'generated', 'published', 'archived'], 
        default: 'draft' 
    },
    
    // Constraints and rules
    constraints: {
        maxConsecutiveShifts: { type: Number, default: 4 },
        minRestHours: { type: Number, default: 12 },
        minDaysOffAfterConsecutive: { type: Number, default: 1 }
    }
});

module.exports = mongoose.model('ScheduleTemplate', ScheduleTemplateSchema);
