const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema({
  citizen_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  name_kannada: {
    type: String,
    trim: true
  },
  aadhaar_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone_number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  address_kannada: {
    type: String
  },
  pincode: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    default: 'Karnataka'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
citizenSchema.index({ name: 1 });
citizenSchema.index({ district: 1 });
citizenSchema.index({ pincode: 1 });

const Citizen = mongoose.model('Citizen', citizenSchema);

module.exports = Citizen;
