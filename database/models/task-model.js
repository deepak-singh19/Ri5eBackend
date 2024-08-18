const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task: {
    type: String,
  },
  status:{
    type:String,
  },
  time:{
    type:String,
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;