const express = require('express');
const router = express.Router();
const ProductOwner = require("../database/models/product-model");
const bcrypt = require('bcrypt');
const { generateVerificationCode, sendVerificationEmail } = require("../lib/common");

const SALT = 10;

// Product Owner Sign-up
router.post("/sign-up", async (req, res) => {
  try {
    const { companyName, fullName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT);
    const existingProductOwner = await ProductOwner.findOne({ email });

    const code = generateVerificationCode();
    if (existingProductOwner) {
      return res.status(401).send({ message: "User already exists" });
    }

    const newProductOwner = new ProductOwner({
      companyName,
      fullName,
      email,
      password: hashedPassword,
      verificationCode: code,
      isVerified: false,
    });

    await newProductOwner.save();
    await sendVerificationEmail(email, code);
    return res.status(200).send({ message: "Verification code sent to your email" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err.message });
  }
});

// Product Owner Sign-in
router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Both fields are required" });
    }

    const existingProductOwner = await ProductOwner.findOne({ email });
    if (!existingProductOwner) {
      return res.status(401).send({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, existingProductOwner.password);
    if (!isMatch) {
      return res.status(409).send({ message: "Password does not match" });
    }

    if (!existingProductOwner.isVerified) {
      const code = generateVerificationCode();
      existingProductOwner.verificationCode = code;
      await existingProductOwner.save();
      await sendVerificationEmail(email, code);
      return res.status(200).send({ message: "Verification code sent to your email" });
    }

    res.status(200).send({ message: "Sign-in successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

// Update Product Owner profile (PATCH)
router.patch("/product-profile/:productOwnerId", async (req, res) => {
  try {
    const productOwnerId = req.params.productOwnerId;
    const updateData = req.body;

    const updatedProductOwner = await ProductOwner.findByIdAndUpdate(
      productOwnerId,
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedProductOwner) {
      return res.status(404).send({ message: "Product Owner not found" });
    }

    res.status(200).send({
      message: "Product Owner profile updated successfully",
      productOwner: updatedProductOwner,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

// Full Update Product Owner (PUT)
router.put("/update-product-owner/:productOwnerId", async (req, res) => {
  try {
    const productOwnerId = req.params.productOwnerId;
    const newData = req.body;

    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).send({ message: "Full update requires complete data" });
    }

    const existingProductOwner = await ProductOwner.findById(productOwnerId);
    if (!existingProductOwner) {
      return res.status(404).send({ message: "Product Owner not found" });
    }

    // Preserve sensitive fields
    newData.password = existingProductOwner.password;
    newData.email = existingProductOwner.email;
    newData.isVerified = existingProductOwner.isVerified;
    newData.verificationCode = existingProductOwner.verificationCode;

    const updatedProductOwner = await ProductOwner.findOneAndReplace(
      { _id: productOwnerId },
      newData,
      { new: true, overwrite: true, runValidators: true }
    );

    res.status(200).send({
      message: "Product Owner profile fully replaced successfully",
      productOwner: updatedProductOwner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error. Please try again." });
  }
});

router.get("/all-products",async(req,res)=>{
    try{
        const products= await ProductOwner.find();
        res.status(200).send({
            message:"All Product Owners",
            products:products
        })
    }catch(error){
        console.error(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

router.get("/product-profile/:productOwnerId",async(req,res)=>{
    try{
        const productOwnerId = req.params.productOwnerId;
        const existingProductOwner = await ProductOwner.findById(productOwnerId);
        if (!existingProductOwner) {
      return res.status(404).send({ message: "Product Owner not found" });
        } 
        res.status(200).send({
            message:"Product Owner",
            product:existingProductOwner
        })
    }catch(error){
        console.error(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

module.exports = router;
