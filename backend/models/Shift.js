const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  startTime: {
    type: String, // format "HH:MM", e.g., "09:00"
    required: true,
  },
  endTime: {
    type: String, // format "HH:MM", e.g., "18:00"
    required: true,
  },
  gracePeriod: {
    type: Number, // in minutes, e.g., 15
    default: 15,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// A tenant can have only one default shift
shiftSchema.index({ tenantId: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true } 
});

module.exports = mongoose.model('Shift', shiftSchema);
