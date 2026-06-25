const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
}, { timestamps: true });

designationSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Designation', designationSchema);
