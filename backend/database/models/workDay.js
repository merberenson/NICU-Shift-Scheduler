const mongoose = require('mongoose');


const WorkDaySchema = new mongoose.Schema({
    date: {
        type: String, 
        required: true
    },
    shiftType: {
        type: String,
        required: true
    },
    requiredEmployees: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Work', WorkDaySchema, 'workdays');