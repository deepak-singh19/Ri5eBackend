const express = require('express');
const router = express.Router();

const Conversation = require("../database/models/conversation-model");
const Mentor = require("../database/models/mentor-model");
const Product = require("../database/models/product-model");
const Message = require("../database/models/message-model");
const { default: mongoose } = require('mongoose');

//done
router.post("/conversation", async (req, res) => {
    try {
        // Corrected the request body access
        // console.lo(req);
        const { senderId, recieverId } = req.body;
        // // console.log("ids from frontend ", senderId, recieverId);

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

// not working
// router.get("/mentor/conversation/:userId", async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         console.log("params", userId);
//         // const userObjectId = new mongoose.Types.ObjectId(userId);
//         // console.log(userObjectId);

//         const conversations = await Conversation.find({ member: { $in: [userId] } });

//         console.log("find conversation using user id", conversations);

//         const conversationUserData = await Promise.all(conversations.map(async (conv) => {
//             const recieverId = conv.member.find((mem) => mem !== userId);
//             // const recieverObjectId = new mongoose.Types.ObjectId(recieverId);
//             console.log(recieverId);
//             const product = await Product.findById(recieverId);
//             console.log("product from receiver", product);
//             return { product: { email: product.email, fullName: product.fullName }, conversationId: conv._id };
//         }));

//         res.status(200).send({ message: "All conversations", conversationData: conversationUserData });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({ error: "Server error. Please try again." });
//     }
// })

//working
router.get("/mentor/conversation/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("params", userId);

        const conversations = await Conversation.find({ member: { $in: [userId] } });

        console.log("find conversation using user id", conversations);

        const conversationUserData = await Promise.all(conversations.map(async (conv) => {
            const recieverId = conv.member.find((mem) => mem.toString() !== userId);
            console.log("receiverId", recieverId);
            if (!recieverId) {
                return null;  // Return null if there's no valid receiver ID
            }

            const product = await Mentor.findById(recieverId);
            if (!product) {
                return null;  // Return null if no product is found for the receiver ID
            }

            console.log("product from receiver", product);
            return {
                details: {
                    email: product.email,
                    fullName: product.fullName
                },
                conversationId: conv._id
            };
        }));

        // Filter out any null values from the results
        const filteredConversationData = conversationUserData.filter(data => data !== null);

        res.status(200).send({
            message: "All conversations",
            conversationData: filteredConversationData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});





//done
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
        // console.log("Request", req);
        
        const conversationId = req.params.conversationId;
        console.log(conversationId);
        const messages = await Message.find({ conversationId });
        console.log("Messages found:", messages);
        
        
        const messageData = await Promise.all(messages.map(async (msg) => {
            const mentor = await Mentor.findById(msg.senderId);
            console.log("Mentor found:", mentor);
            
            return { details: { senderId: mentor._id, message: msg.message, fullName: mentor.fullName } };
        }));
        res.status(200).send({ message: "All messages", messageData });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});

router.get("/product/message/:conversationId", async (req, res) => {
    try {
        // console.log("Request", req);
        
        console.log("conversationId", req.params.conversationId);
        const conversationId = req.params.conversationId;
        if(!conversationId){
            return res.status(400).send({ error: "Please provide conversationId" });
        }

        const messages = await Message.find({ conversationId });
        console.log("Messages found:", messages);
        
        const messageData = await Promise.all(messages.map(async (msg) => {
            const product = await Mentor.findById(msg.senderId);
            console.log("Product found:", product);
            return { details: { senderId: product._id, fullName: product.fullName, message: msg.message }};
        }));
        res.status(200).send({ message: "All messages", messageData });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});


//done
router.get("/product/conversation/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        console.log("User ID (string):", userId);

        // Find conversations where userId is a member (using string comparison)
        const conversations = await Conversation.find({ member: { $in: [userId] } });

        console.log("Conversations found:", conversations);

        if (conversations.length === 0) {
            return res.status(404).send({ message: "No conversations found for this user." });
        }

        const conversationUserData = await Promise.all(conversations.map(async (conv) => {
            // Find the other member in the conversation
            const recieverId = conv.member.find((mem) => mem.toString() !== userId);
            console.log("RecieverId found:", recieverId);

            // Fetch product by receiver ID
            const product = await Product.findById(recieverId);
            if (!product) {
                console.log("No product found for recieverId:", recieverId);
                return null;
            }

            return { details: { email: product.email, fullName: product.fullName, recieverId:product._id }, conversationId: conv._id };
        }));

        const filteredConversationData = conversationUserData.filter(data => data !== null); // Filter out nulls
        res.status(200).send({ message: "All conversations", conversationData: filteredConversationData });

    } catch (error) {
        console.log("Error:", error);
        return res.status(500).send({ error: "Server error. Please try again." });
    }
});





module.exports = router;
