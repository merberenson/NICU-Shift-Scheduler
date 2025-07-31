const mongoose = require('mongoose');

const TimeOffRequestSchema = new mongoose.Schema({
    requestId : {type: mongoose.Schema.Types.ObjectId, required: true},
    empId: {type: mongoose.Schema.Types.ObjectId, ref: 'nurse', required: true},
    date: {type: Date, required: true},
    reason: {type: String},
    status : {type: String, enum: ['Approved', 'Pending', 'Denied']}
})