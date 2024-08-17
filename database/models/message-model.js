const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
  },
  sederId:{
    type:String,
  },
  message:{
    type:String,
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
