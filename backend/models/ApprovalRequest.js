const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['Leave', 'AttendanceRegularization', 'ProfileChange'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Manager Approved — Pending HR'],
    default: 'Pending',
  },
  escalated: {
    type: Boolean,
    default: false,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  }, // Typically the manager
  comments: String, // Reason for applying or reason for rejection
  actionHistory: {
    type: [
      {
        action: { type: String },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        comments: String,
        date: { type: Date, default: Date.now },
      }
    ],
    default: [],
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    // For Leave: { leaveTypeId, startDate, endDate, isHalfDay }
    // For Regularization: { attendanceRecordId, newPunchInTime, newPunchOutTime }
    // For ProfileChange: { fieldToUpdate, newValue }
  },
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
