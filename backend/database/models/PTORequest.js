const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PTORequestSchema = new Schema({
  nurseId: { type: Schema.Types.ObjectId, ref: 'Nurse', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Denied'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PTORequest', PTORequestSchema);
