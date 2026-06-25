const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
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
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  photoUrl: String,
  contactNumber: String,
  address: String,
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Intern'] },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  dateOfJoining: { type: Date, required: true },
  profilePhoto: {
    type: String, // URL or file path to the uploaded image
    default: '',
  },
  status: { type: String, enum: ['Active', 'On Probation', 'Exited'], default: 'Active' },
  exitDate: { type: Date },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
  },
  delegationDelegateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  delegationStartDate: { type: Date },
  delegationEndDate: { type: Date },
}, { timestamps: true });

employeeSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);
