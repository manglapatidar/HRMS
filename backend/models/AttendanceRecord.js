const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
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
  date: {
    type: Date, // Store just the date (YYYY-MM-DD format at 00:00:00Z)
    required: true,
  },
  punchInTime: Date,
  punchOutTime: Date,
  status: {
    type: String,
    enum: ['Present', 'Late', 'Half-day', 'Absent', 'On Leave'],
    default: 'Absent',
  },
  shiftStartTime: String, // e.g. "09:00"
  shiftEndTime: String,   // e.g. "18:00"
}, { timestamps: true });

// Ensure only one attendance record per employee per day
attendanceRecordSchema.index({ tenantId: 1, employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
