const express = require('express');
const router = express.Router();

const Mentor = require("../database/models/mentor-model");
const bcrypt = require('bcrypt');
const { generateVerificationCode, sendVerificationEmail } = require("../lib/common");

const SALT = 10;

router.post("/sign-up", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log(fullName);
    const hashedPassword = await bcrypt.hash(password, SALT);
    console.log(hashedPassword);
    const existingMentor = await Mentor.findOne({ email });

    const code = generateVerificationCode();
    if (existingMentor) {
      return res.status(401).send({ message: "User already exists" });
    }
    
    const newMentor = new Mentor({
      email: email,
      password: hashedPassword,
      fullName: fullName,
      verificationCode: code,
      isVerified: false
    });

    await newMentor.save();
    await sendVerificationEmail(email, code);
    return res.status(200).send({ message: "Verification code sent to your email id" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err.message });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Both fields are required" });
    }

    const existingMentor = await Mentor.findOne({ email });
    if (!existingMentor) {
      return res.status(401).send({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, existingMentor.password);
    if (!isMatch) {
      return res.status(409).send({ message: "Password does not match" });
    }

    if (!existingMentor.isVerified) {
      const code = generateVerificationCode();
      existingMentor.verificationCode = code;
      await existingMentor.save();
      await sendVerificationEmail(email, code);
      return res.status(200).send({ message: "Verification code sent to your email id" });
    }

    // If the user is verified, proceed with sign-in logic here
    res.status(200).send({ message: "Sign-in successful" });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

module.exports = router;
