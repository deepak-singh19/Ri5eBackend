const mongoose = require('mongoose');

const productOwnerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    // required: true
  },
  fullName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  coFounder: {
    type: String, 
  },
  companyVision: {
    type: String,
  },
  skills: {
    type: [String],
  },
  industry: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
  },
  companyLogo: {
    type: String, 
  },
  networth: {
    type: Number,
  },
  revenue: {
    type: Number,
  },
  dateOfOperations: {
    type: Date,
  },
  previousFunding: {
    type: Boolean,
  },
  profitOrLoss: {
    type: String, 
  },
  stageOfCompany: {
    type: String,
  },
  durationOfMentorship: {
    type: String, 
  },
  verificationCode:{
    type:String
  },
  isVerified:{
    type:Boolean
  }
});

const ProductOwner = mongoose.model('ProductOwner', productOwnerSchema);

module.exports = ProductOwner;

