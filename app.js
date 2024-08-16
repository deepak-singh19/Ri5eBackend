// Import the express module
const express = require('express');
const connectDB = require('./database/db');
require('dotenv').config(); 

const app = express();

const PORT = process.env.PORT || 3005;
const mentorsRoute= require("./routers/mentor");
const verifyRoute= require("./routers/verify")

//middlewares
app.use(express.json());

// Connect to the database
connectDB();

app.use("/mentor",mentorsRoute);
app.use("/verify",verifyRoute);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
