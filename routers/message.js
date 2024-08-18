const express = require('express');
const router = express.Router();


const Conversation= require("../database/models/conversation-model");
const Mentor= require("../database/models/mentor-model");
const Product= require("../database/models/product-model");
const Message= require("../database/models/message-model");


router.post("/conversation",async(req,res)=>{
    try{

        const {senderId, recieverId}= req.body;
        const existingConversation= await Conversation.findOne({member:[senderId,recieverId]});
        console.log(existingConversation);
        
        if(!existingConversation){
            
            const newConversation= new Conversation({member:[senderId,recieverId]});
            await Conversation.save();
            res.status(200).send({message:"Conversation created successfully"})
                 
        }
        return res.status(409).send({message:"Conversation already exists"})   
        // const newConversation= new Conversation({member:[senderId,recieverId]});
        // await Conversation.save();
        // res.status(200).send({message:"Conversation created successfully"})

    }catch(error){
        console.log(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

router.get("/mentor/conversation/:userId", async(req, res)=>{
    try{

        const userId= req.params.userId;

        const conversation= await Conversation({member:{$in:[userId]}})

        const converstionUserData= Promise.all(conversation.map(async(conv)=>{
            const recieverId= conv.member.find((mem)=> mem!==userId);
            const mentor= await Mentor.findById(recieverId);
            return { mentor: {email:mentor.email, fullName:mentor.fullName}, conversationId:conv._id}
        }));


        res.status(200).send({message:"All conversation", conversationData:converstionUserData})

    }catch(error){
        console.log(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

router.post ("/message", async(req, res)=>{
    try{
        const {conversationId, senderId, message, recieverId=''}= req.body;
        if(!senderId || !message){
            res.status(400).send({error:"Please provide senderId and message"})
        }
        if(!conversationId){
            const newConversation= new Conversation({member:[senderId,recieverId]});
            await newConversation.save();
            const newMessage= new Message({conversationId:newConversation._id, senderId, message});
            await newMessage.save();
            res.status(200).send("Message send successfully");
        }
        
        const newMessage= new Message({conversationId, senderId, message})
        await newMessage.save();
        res.status(200).send("Message send successfully")
    }catch(error){
        console.log(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

router.get("/mentor/message/:conversationId", async(req, res)=>{
    try{
        const conversationId= req.params.conversationId;
        const messages= await Message.find({conversationId});
        const messageData= Promise.all(messages.map(async(msg)=>{
            const mentor= await Mentor.findById(msg.senderId);
            return {mentor:{senderId:mentor.senderId, message:mentor.message, fullName:mentor.fullName},message:messages.message} 
        }
        ))
        res.status(200).send({message:"All messages", messageData})
    }catch(error){
        console.log(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

router.get("/product/message/:conversationId", async(req, res)=>{
    try{
        const conversationId= req.params.conversationId;
        const messages= await Message.find({conversationId});
        const messageData= Promise.all(messages.map(async(msg)=>{
            const product= await Product.findById(msg.senderId);
            return {product:{senderId:product.senderId, fullName:product.fullName},message:messages.message} 
        }
        ))
        res.status(200).send({message:"All messages", messageData})
    }catch(error){
        console.log(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

router.get("/product/conversation/:userId", async(req, res)=>{
    try{

        const userId= req.params.userId;

        const conversation= await Conversation({member:{$in:[userId]}})

        const converstionUserData= Promise.all(conversation.map(async(conv)=>{
            const recieverId= conv.member.find((mem)=> mem!==userId);
            const product= await Product.findById(recieverId);
            return { product: {email:product.email, fullName:product.fullName}, conversationId:conv._id}
        }));


        res.status(200).send({message:"All conversation", conversationData:converstionUserData})

    }catch(error){
        console.log(error);
        res.send(500).send({error:"Server error. Please try again."});
    }
})

module.exports = router;
