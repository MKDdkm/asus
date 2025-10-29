const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payment_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  application_id: {
    type: String,
    required: true,
    index: true
  },
  citizen_id: {
    type: String,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'],
    required: true
  },
  transaction_id: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  service_type: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  remarks: {
    type: String
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
paymentSchema.index({ payment_date: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ citizen_id: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
