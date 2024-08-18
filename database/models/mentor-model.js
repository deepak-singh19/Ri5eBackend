const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  areaOfExpertise: {
    type: [String], // Array of strings for areas of expertise
  //  required: true,
  },
  industryExperience: {
    type: [String], // Array of strings for industry experience
  },
  yearsOfExperience: {
    type: Number,
  },
  companyAssociatedWith: {
    type: String,
  },
  keyAchievements: {
    type: [String], 
  },
  education: {
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
  },
  designation:{
    type:String
  } 
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;
