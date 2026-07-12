import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import Project from './models/Project.js';

const app = express();

// Create HTTP server from Express app
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ],
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

    socket.on("update-project-sprint", async ({ projectId, sprint }) => {
        try {
            const project = await Project.findOne({ id: projectId });
            if (project) {
                project.sprint = sprint;
                project.sprintStatus = sprint.label;
                if (sprint && sprint.phase === 'completed') {
                    project.progress = 100;
                    project.milestones.forEach(m => {
                        m.status = 'completed';
                    });
                }
                const updatedProject = await project.save();
                io.emit("sprint-changed", { projectId, sprint: updatedProject.sprint });
                io.emit("project-updated", updatedProject);
            }
        } catch (err) {
            console.error("Error updating sprint via socket:", err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
});

// Middlewares
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    credentials: true
}));

app.use(express.json());

// Simple Request Logger
app.use((req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

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

import notificationRoutes from "./routes/notificationRoutes.js";

app.use("/api/notifications", notificationRoutes);