const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // JWT package
const Product = require("../database/models/product-model");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Add your secret key

// Verification Route with JWT
router.post("/", async (req, res) => {
  try {
    const { email, code } = req.body;

    // Check if email and code are provided
    if (!email || !code) {
      return res.status(400).send({ message: "Email and code are required" });
    }

    // Find the user by email
    const existingProduct = await Product.findOne({ email });

    if (!existingProduct) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the code matches
    if (existingProduct.verificationCode !== code) {
      return res.status(401).send({ message: "Invalid verification code" });
    }

    // Mark user as verified if the code matches
    existingProduct.isVerified = false;
    existingProduct.verificationCode = null; // Optional: clear the code after verification
    await existingProduct.save();

    // Generate JWT token with user information
    const token = jwt.sign(
      { id: existingProduct._id, email: existingProduct.email },
      JWT_SECRET, // Use JWT_SECRET from the top
      { expiresIn: "1h" } // Set the token to expire in 1 hour
    );

    return res.status(200).send({
      message: "User verified successfully",
      token: token // Send the JWT token in the response
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});

module.exports = router;
