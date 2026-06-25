const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true, // e.g. 'LOGIN', 'CREATE_EMPLOYEE', 'UPDATE_LEAVE_BALANCE'
  },
  details: {
    type: String,
  },
  ipAddress: String,
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
