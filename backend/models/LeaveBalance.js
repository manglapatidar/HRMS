const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  leaveTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  used: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

leaveBalanceSchema.index({ tenantId: 1, employeeId: 1, leaveTypeId: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
