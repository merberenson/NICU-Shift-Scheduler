const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    workID: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Nurse _id
        required: true,
        ref: 'Work'
    },
    empID: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Nurse _id
        required: true,
        ref: 'Nurse'
    },
    assignedby: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true,
        default: () => new Date().toISOString()
    }
})

module.exports = mongoose.model("Assignment", AssignmentSchema, "assignments");