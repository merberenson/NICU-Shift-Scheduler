const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NurseSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'Name is required.']
    },
    username : {
        type: String,
        required: [true, 'Username is required.'],
        unique: true
    },
    password : {
        type: String,
        required: [true, 'Password is required.'],
        unique: true
    },
    email : {
        type: String,
        required: [true, 'Email is required.']
    },
    phone : {
        type: Number,
        required: [true, 'Phone number is required.']
    },
    availablity: [{
        dayOfWeek : {type: String, enum : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']},
        timeOfDay : {type: String, enum: ['day', 'night', 'unavailable']}
    }],
    maxWeeklyHours : { type: Number },
    currentWeeklyHours: {type: Number, default: 0}
});

NurseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Nurse', NurseSchema, 'nurses');