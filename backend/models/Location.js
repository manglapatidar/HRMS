const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
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
  address: String,
  city: String,
  state: String,
  country: String,
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
