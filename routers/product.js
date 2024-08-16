const express = require('express');
const router= express.Router();

const Product= require("../database/models/product-model");
const bcrypt = require('bcrypt');
const { generateVerificationCode, sendVerificationEmail } = require("../lib/common");
const SALT=10;
router.post("/sign-up",async(req,res)=>{
    //fname,lname,email,password
    try{
        const {companyName,fullName,email,password}=req.body;
        console.log(fullName);
        const hashedPassword= await bcrypt.hash(password, SALT);
        console.log(hashedPassword);
        const ExistingProduct= await Product.findOne({email});
        const code = generateVerificationCode();
        if(ExistingProduct){
            res.send({message:"User already exists"}).status(401);
        }
        const newProduct=new Product({
            companyName:companyName,
            email:email,
            password:hashedPassword,
            fullName:fullName,
            verificationCode: code,
            isVerified: false
        })
        await newProduct.save();
        await sendVerificationEmail(email, code);
        return res.status(200).send({ message: "Verification code sent to your email id" });
        }
    catch(err){
        console.log(err);
        res.send(err).status(401);
    }
})

router.post("/sign-in", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).send({ message: "Both fields are required" });
      }
  
      const existingProduct = await Product.findOne({ email });
      if (!existingProduct) {
        return res.status(401).send({ message: "User does not exist" });
      }
  
      const isMatch = await bcrypt.compare(password, existingProduct.password);
      if (!isMatch) {
        return res.status(409).send({ message: "Password does not match" });
      }
  
      if (!existingProduct.isVerified) {
        const code = generateVerificationCode();
        existingProduct.verificationCode = code;
        await existingProduct.save();
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
  
module.exports=router;