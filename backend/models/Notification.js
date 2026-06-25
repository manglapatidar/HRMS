const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String, // e.g. 'LeaveApproved', 'LeaveRejected', 'NewApprovalRequest'
  },
  link: String, // Optional URL to redirect to
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
