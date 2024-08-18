const express = require('express');
const router = express.Router();

const Conversation = require("../database/models/conversation-model");
const Mentor = require("../database/models/mentor-model");
const Product = require("../database/models/product-model");
const Message = require("../database/models/message-model");
const { default: mongoose } = require('mongoose');

router.post("/conversation", async (req, res) => {
    try {
        // Corrected the request body access
        // console.lo(req);
        const { senderId, recieverId } = req.body;
        // console.log("ids from frontend ", senderId, recieverId);

        // Check if the conversation exists
        const existingConversation = await Conversation.findOne({ member: [senderId, recieverId] });
        // console.log(existingConversation);

        if (!existingConversation) {
            // If not found, create a new conversation
            const newConversation = new Conversation({ member: [senderId, recieverId] });
            await newConversation.save();
            return res.status(200).send({ message: "Conversation created successfully" });
        }

        // If conversation exists, send conflict status
        return res.status(409).send({ message: "Conversation already exists" });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});

router.get("/mentor/conversation/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const conversations = await Conversation.find({ members: { $in: [userId] } });

        const conversationUserData = await Promise.all(conversations.map(async (conv) => {
            const recieverId = conv.members.find((mem) => mem !== userId);
            const mentor = await Mentor.findById(recieverId);
            return { mentor: { email: mentor.email, fullName: mentor.fullName }, conversationId: conv._id };
        }));

        res.status(200).send({ message: "All conversation", conversationData: conversationUserData });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});

router.post("/message", async (req, res) => {
    try {
        const { conversationId, senderId, message, recieverId = '' } = req.body;
        if (!senderId || !message) {
            return res.status(400).send({ error: "Please provide senderId and message" });
        }
        if (!conversationId) {
            const newConversation = new Conversation({ members: [senderId, recieverId] });
            await newConversation.save();
            const newMessage = new Message({ conversationId: newConversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send("Message sent successfully");
        }

        const newMessage = new Message({ conversationId, senderId, message });
        await newMessage.save();
        return res.status(200).send("Message sent successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});

router.get("/mentor/message/:conversationId", async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const messages = await Message.find({ conversationId });
        const messageData = await Promise.all(messages.map(async (msg) => {
            const mentor = await Mentor.findById(msg.senderId);
            return { mentor: { senderId: mentor._id, message: msg.message, fullName: mentor.fullName } };
        }));
        res.status(200).send({ message: "All messages", messageData });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});

router.get("/product/message/:conversationId", async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const messages = await Message.find({ conversationId });
        const messageData = await Promise.all(messages.map(async (msg) => {
            const product = await Product.findById(msg.senderId);
            return { product: { senderId: product._id, fullName: product.fullName }, message: msg.message };
        }));
        res.status(200).send({ message: "All messages", messageData });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});

router.get("/product/conversation/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;


        // ---------------
        // const conversations = await Conversation.find({ _id: (userId)})

        // ---------------
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log(userObjectId);

        const conversations = await Conversation.find({ member: { $in: [userObjectId] } });

        console.log("find conversation using user id", conversations);

        const conversationUserData = await Promise.all(conversations.map(async (conv) => {
            const recieverId = conv.member.find((mem) => mem !== userId);
            // const recieverObjectId = new mongoose.Types.ObjectId(recieverId);
            // console.log(recieverObjectId);
            const product = await Product.findOne({_id: recieverId});
            console.log("product from receiver", product);
            return { product: { email: product.email, fullName: product.fullName }, conversationId: conv._id };
        }));

        res.status(200).send({ message: "All conversations", conversationData: conversationUserData });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});

module.exports = router;
