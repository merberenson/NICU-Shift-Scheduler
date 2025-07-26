const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    workID: {
        type: String,
        required: true
    },
    empID: {
        type: String,
        required: true
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