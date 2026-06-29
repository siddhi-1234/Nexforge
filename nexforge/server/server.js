// MUST BE THE VERY FIRST LINE RUN ON YOUR SERVER APPLICATION CONTEXT
require('dotenv').config();
import { Server } from "socket.io";

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

global.io = io;

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("join-user-room", (userId) => {
        socket.join(userId);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Standard System Configuration Pipeline Utilities
app.use(cors({ origin: 'http://localhost:3000' })); // Explicit security binding
app.use(express.json());

// Routes Mount point Mapping
app.use('/api/auth', authRoutes);

// MongoDB URI reads straight from server/.env securely
const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to Nexforge MongoDB Core Schema System Matrix");
        app.listen(PORT, () => console.log(`Server executing safely on port ${PORT}`));
    })
    .catch((err) => {
        console.error("Database connection fault protocol tripped:", err.message);
    });