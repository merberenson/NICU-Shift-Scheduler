const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PTORequestSchema = new Schema({
    nurseId: { type: Schema.Types.ObjectId, ref: 'Nurse', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'denied', 'cancelled'], 
        default: 'pending' 
    },
    
    // Approval workflow
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNotes: { type: String, default: null },
    
    // Impact on scheduling
    affectedShifts: [{ type: Schema.Types.ObjectId, ref: 'Work' }],
    replacementNeeded: { type: Boolean, default: true },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamp
PTORequestSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('PTORequest', PTORequestSchema);