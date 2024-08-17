// Import the necessary modules
const express = require('express');
const connectDB = require('./database/db');
const cors = require('cors'); // Import cors module
const { createServer } = require('http'); // Import http for creating the server
const { Server } = require('socket.io'); // Import socket.io

require('dotenv').config();

const app = express();

// Create an HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins (you can restrict it to specific origins for security)
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3005;
const mentorsRoute = require("./routers/mentor");
const productRoute = require("./routers/product");
const verifyRoute = require("./routers/verify");
const verifyProductRoute = require("./routers/verify-product");
const messageRoute = require("./routers/message");

//middlewares
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Connect to the database
connectDB();

// Define routes
app.use("/mentor", mentorsRoute);
app.use("/product", productRoute);
app.use("/verify", verifyRoute);
app.use("/verify-product", verifyProductRoute);
app.use("/message", messageRoute);

// Default route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

let users=[];

// Start listening for WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on("addUser",(userId)=>{
    users.push({userId, socketId:socket.id});
    io.emit("users", users);
  });

  socket.on("sendMessage",({senderId, recieverId, message, conversationId})=>{
    const reciever= users.find((user)=>user.userId===recieverId);
    const sender= users.find((user)=>user.userId===senderId);
    if(reciever){
      io.to(reciever.socketId).to(sender.socketId).emit("getMessage",{senderId, message, recieverId, conversationId});
    }
  });

  socket.on("disconnect",()=>{
    users=users.filter((user)=>user.socketId!==socket.id);
    io.emit("users", users);
  });

  // Example: Listen for a custom event from the client
  socket.on('custom-event', (data) => {
    console.log('Received custom event data:', data);
    // Emit response back to all connected clients
    io.emit('server-response', { message: 'Hello from server' });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
