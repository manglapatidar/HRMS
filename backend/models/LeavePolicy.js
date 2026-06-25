const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  leaveTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true,
  },
  annualAllowance: {
    type: Number,
    required: true,
  },
  carryForwardLimit: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

leavePolicySchema.index({ tenantId: 1, leaveTypeId: 1 }, { unique: true });

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);
