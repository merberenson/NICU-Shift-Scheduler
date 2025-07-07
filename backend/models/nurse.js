const mongoose = require('mongoose');

const NurseSchema = new mongoose.Schema({
    empID : { 
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name : {
        type: String,
        required: true
    },
    username : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    phone : {
        type: Number,
        required: true
    },
    availablity: [{
        dayOfWeek : {type: String, enum : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']},
        timeOfDay : {type: String, enum: ['day', 'night']}
    }],
    maxWeeklyHours : { type: Number },
    currentWeeklyHours: {type: Number}
})