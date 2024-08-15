const express = require('express');
const router= express.Router();

const Mentor= require("../database/models/mentor-model");
const bcrypt = require('bcrypt');
const SALT=10;
router.post("/sign-up",async(req,res)=>{
    //fname,lname,email,password
    try{
        const {fullName,email,password}=req.body;
        console.log(fullName);
        const hashedPassword= await bcrypt.hash(password, SALT);
        console.log(hashedPassword);
        const ExistingMentor= await Mentor.findOne({email});
        if(ExistingMentor){
            res.send({message:"User already exists"}).status(401);
        }
        const newMentor=new Mentor({
            email:email,
            password:hashedPassword,
            fullName:fullName
        })
        await newMentor.save();
        res.send({email,fullName}).status(200);
    }
    catch(err){
        console.log(err);
        res.send(err).status(401);
    }
})
module.exports=router;