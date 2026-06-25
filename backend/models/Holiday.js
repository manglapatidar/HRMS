const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
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
  date: {
    type: Date, // YYYY-MM-DD format (00:00:00Z)
    required: true,
  },
}, { timestamps: true });

// Ensure unique holidays per tenant on a given date
holidaySchema.index({ tenantId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
