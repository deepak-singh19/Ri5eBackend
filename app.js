// Import the express module
const express = require('express');
const connectDB = require('./database/db');
require('dotenv').config(); 

const app = express();

const PORT = process.env.PORT || 3005;

// Connect to the database
connectDB();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
