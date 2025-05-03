const mongoose = require("mongoose");

const vcSchema = new mongoose.Schema({
  '@context': {
    type: [String],
    required: true
  },
  type: {
    type: [String],
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  issuanceDate: {
    type: String,
    required: true
  },
  credentialSubject: {
    id: {
      type: String,
      required: true
    },
    procedure: {
      name: {
        type: String,
        required: true
      },
      timestamp: {
        type: Number,
        required: true
      }
    }
  },
  policyholderAddress: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("VC", vcSchema);
