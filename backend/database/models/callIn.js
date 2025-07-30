// models/callIn.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CallInSchema = new Schema({
  workID: {
    type: Schema.Types.ObjectId,
    ref: 'Work',
    required: true,
  },
  empID: {
    type: Schema.Types.ObjectId,
    ref: 'Nurse',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'called', 'declined', 'accepted'],
    default: 'available',
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CallIn', CallInSchema, 'callins');

