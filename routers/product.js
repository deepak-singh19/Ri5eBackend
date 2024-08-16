const express = require('express');
const router= express.Router();

const Product= require("../database/models/product-model");
const bcrypt = require('bcrypt');
const SALT=10;
router.post("/sign-up",async(req,res)=>{
    //fname,lname,email,password
    try{
        const {companyName,fullName,email,password}=req.body;
        console.log(fullName);
        const hashedPassword= await bcrypt.hash(password, SALT);
        console.log(hashedPassword);
        const ExistingProduct= await Product.findOne({email});
        if(ExistingProduct){
            res.send({message:"User already exists"}).status(401);
        }
        const newProduct=new Product({
            companyName:companyName,
            email:email,
            password:hashedPassword,
            fullName:fullName
        })
        await newProduct.save();
        res.send({email,fullName}).status(200);
    }
    catch(err){
        console.log(err);
        res.send(err).status(401);
    }
})
module.exports=router;