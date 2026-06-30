// MUST BE FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';

const app = express();

// Create HTTP server from Express app
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io available globally
global.io = io;

// Socket Events
io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("join-user-room", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
});

// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Environment variables
const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => {

        console.log("Connected to Nexforge MongoDB");

        // IMPORTANT: use server.listen(), not app.listen()
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch((err) => {
        console.error("Database connection error:", err.message);
    });