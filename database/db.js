// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {

    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  }
};

module.exports = connectDB;
