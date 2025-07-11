const mongoose = require('mongoose');

const WorkDaySchema = new mongoose.Schema({
    workID : {type: mongoose.Schema.Types.ObjectId, required: true},
    date: {type: Date, required: true},
    shiftType: {type: String, enum : ['day', 'night'], required: true},
    requiredEmployees: {type: Number, default: 20}  
})