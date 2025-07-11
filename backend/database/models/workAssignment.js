const mongoose = require('mongoose');

const WorkAssignmentSchema = new mongoose.Schema({
    workID : {type: mongoose.Schema.Types.ObjectId, ref: 'workDay', required: true},
    empID : {type: mongoose.Schema.Types.ObjectId, ref: 'nurse', required: true},
    assignedby : {type: String},
    timestamp : {type : Date, default: Date.now}  
})