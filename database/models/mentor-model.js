const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  areaOfExpertise: {
    type: [String], // Array of strings for areas of expertise
    required: true,
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
  designation: {
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
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;
