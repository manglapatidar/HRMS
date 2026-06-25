const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true, // e.g. Casual, Sick, Earned, LOP
    trim: true,
  },
  isPaid: {
    type: Boolean,
    default: true,
  },
  requiresBalance: {
    type: Boolean,
    default: true,
  },
  colorTag: {
    type: String,
    default: '#3B82F6',
  },
}, { timestamps: true });

leaveTypeSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
