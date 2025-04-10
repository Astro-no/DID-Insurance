const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyName: { type: String, required: true },
  policyDescription: { type: String, required: true },
  policyPrice: { 
    type: Number, 
    required: true,
    min: [0, 'Policy price must be a positive value'],
  },
  policyDuration: { 
    type: Number, 
    required: true,
    min: [1, 'Policy duration must be at least 1 month'],
  },
  insuranceCompany: { 
    type: String, 
    required: true, 
    enum: ['AIG', 'Jubilee', 'NHIF', 'AAR'] 
  },
  coveredHospital: { 
    type: String, 
    required: true, 
    enum: ['Agha Khan', 'Nairobi Hospital', 'Kenyatta Hospital', 'MP Shah Hospital'] 
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled'],
    default: 'active',
  },
  coverageDetails: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Policy', policySchema);
