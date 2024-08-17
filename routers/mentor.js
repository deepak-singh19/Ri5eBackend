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

router.patch("/profile/:mentorId", async (req, res, next) => {
  try {
    const mentorId = req.params.mentorId;
    const updateData = req.body;

    const updatedMentor = await Mentor.findByIdAndUpdate(
      mentorId,
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedMentor) {
      return res.status(404).send({ message: "Mentor not found" });
    }

    res.status(200).send({ 
      message: "Mentor profile updated successfully",
      mentor: updatedMentor 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

router.put("/update-mentor/:mentorId", async (req, res) => {
  try {
    const mentorId = req.params.mentorId;
    const newData = req.body;

    // Ensure the body contains data for the full update
    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).send({ message: "Full update requires complete data" });
    }

    // Find the existing mentor to preserve sensitive fields
    const existingMentor = await Mentor.findById(mentorId);
    if (!existingMentor) {
      return res.status(404).send({ message: "Mentor not found" });
    }

    // Preserve sensitive fields
    newData.password = existingMentor.password;
    newData.email= existingMentor.email;
    newData.isVerified= existingMentor.isVerified;
    newData.verificationCode= existingMentor.verificationCode;

    // Replace the document with the new data but preserve the password
    const updatedMentor = await Mentor.findOneAndReplace(
      { _id: mentorId },
      newData, // Replace the document with the new data but keep sensitive fields
      { new: true, overwrite: true, runValidators: true }
    );

    res.status(200).send({
      message: "Mentor profile fully replaced successfully",
      mentor: updatedMentor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error. Please try again." });
  }
});
router.get("/all-mentors",async(req,res)=>{
  try{
      const mentors= await Mentor.find();
      res.status(200).send({
          message:"All mentors",
          mentors:mentors
      })
  }catch(error){
      console.error(error);
      res.send(500).send({error:"Server error. Please try again."});
  }
})

router.get("/mentor-profile/:mentorId",async(req,res)=>{
  try{
      const mentorId = req.params.mentorId;
      const existingMentor = await Mentor.findById(mentorId);
      if (!existingMentor) {
    return res.status(404).send({ message: "Mentor not found" });
      } 
      res.status(200).send({
          message:"Mentor",
          product:existingMentor
      })
  }catch(error){
      console.error(error);
      res.send(500).send({error:"Server error. Please try again."});
  }
})


module.exports = router;
