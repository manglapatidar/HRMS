const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['Employee', 'Manager', 'HR Admin', 'Leadership'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notificationPreferences: {
    type: {
      // Event-based notifications (can be toggled)
      LeaveApplied: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      LeaveApproved: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      LeaveRejected: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      RegularizationApplied: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      RegularizationApproved: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      RegularizationRejected: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      ApprovalEscalation: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      // Critical/security notifications (cannot be disabled)
      PasswordChanged: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      AccountLocked: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
    },
    default: {
      LeaveApplied: { email: true, inApp: true },
      LeaveApproved: { email: true, inApp: true },
      LeaveRejected: { email: true, inApp: true },
      RegularizationApplied: { email: true, inApp: true },
      RegularizationApproved: { email: true, inApp: true },
      RegularizationRejected: { email: true, inApp: true },
      ApprovalEscalation: { email: true, inApp: true },
      PasswordChanged: { email: true, inApp: true },
      AccountLocked: { email: true, inApp: true },
    },
  },
}, { timestamps: true });

// Compound index to ensure email is unique per tenant
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
