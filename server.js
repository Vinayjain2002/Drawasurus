const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./db/mongoDB.js');
const socketHandler = require('./scoketIo/socketIO.js');
const {initBloomFilter}= require('./config/bloom.js');
const authRoutes= require('./routes/auth.js');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();
// Intialize the Bloom Filter after the database connection
initBloomFilter();

// Middleware
app.use(express.json());
app.use(cors());


// Definning the Routes
app.use('/api/auth', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // adjust if deployed
        methods: ["GET", "POST"],
    }
});

// Use the external socket handler
socketHandler(io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});