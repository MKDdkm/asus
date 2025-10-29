const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  application_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  service_type: {
    type: String,
    required: true,
    index: true
  },
  applicant_name: {
    type: String,
    required: true
  },
  applicant_name_kannada: {
    type: String
  },
  aadhaar_number: {
    type: String,
    required: true,
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
  address: {
    type: String,
    required: true
  },
  address_kannada: {
    type: String
  },
  date_of_birth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  pincode: {
    type: String
  },
  district: {
    type: String
  },
  state: {
    type: String,
    default: 'Karnataka'
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  submitted_date: {
    type: Date,
    default: Date.now
  },
  reviewed_date: {
    type: Date
  },
  remarks: {
    type: String
  },
  documents: [{
    document_type: String,
    file_path: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  // Service-specific fields stored as flexible object
  service_data: {
    type: mongoose.Schema.Types.Mixed
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
applicationSchema.index({ submitted_date: -1 });
applicationSchema.index({ service_type: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
