// Import the necessary modules
const express = require('express');
const connectDB = require('./database/db');
const cors = require('cors'); // Import cors module
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3005;
const mentorsRoute = require("./routers/mentor");
const productRoute = require("./routers/product");
const verifyRoute = require("./routers/verify");
const verifyProductRoute = require("./routers/verify-product");

//middlewares
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Connect to the database
connectDB();

// Define routes
app.use("/mentor", mentorsRoute);
app.use("/product", productRoute);
app.use("/verify", verifyRoute);
app.use("/verify-product", verifyProductRoute);

// Default route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
