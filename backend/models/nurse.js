const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NurseSchema = new mongoose.Schema({
    empID : { 
        type: String,
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
});

NurseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = NurseSchema;