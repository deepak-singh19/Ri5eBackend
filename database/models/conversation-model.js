const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  member: [{ // Changed from `member` to `members` for clarity
    type: mongoose.Schema.Types.ObjectId, // Using ObjectId type
    //ref: 'User', // Optional, references the User model if needed
    required: true,
  }]
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
