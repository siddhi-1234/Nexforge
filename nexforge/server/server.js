import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { createRequire } from "module";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import Project from "./models/Project.js";
import User from "./models/User.js";

const require = createRequire(import.meta.url);
const { broadcastTeamActivity } = require("./utils/teamMetricsService.js");

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
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available globally
global.io = io;

// Active presence map tracking: email.toLowerCase() -> { name, email, role, task, active, socketId }
const activePresence = new Map();
global.activePresence = activePresence;

async function initializePresence() {
  try {
    const users = await User.find({});
    users.forEach(user => {
      const email = user.email.toLowerCase();
      activePresence.set(email, {
        name: user.name,
        email: email,
        role: user.role || 'student',
        task: "Away",
        active: false,
        socketId: null
      });
    });

  } catch (err) {
    console.error("Error initializing presence:", err.message);
  }
}

// Socket Events
io.on("connection", (socket) => {
  console.log("Connected to server...");

  socket.on("join-user-room", (userId) => {
    if (userId) {
      const lowerId = userId.toLowerCase();
      socket.join(lowerId);
    }
  });

  socket.on(
    "update-project-sprint",
    async ({ projectId, sprint, initiatorEmail }) => {
      try {
        const project = await Project.findOne({ id: projectId });
        if (project) {
          const oldPhase = project.sprint ? project.sprint.phase : null;
          project.sprint = sprint;
          project.sprintStatus = sprint.label;
          if (sprint && sprint.phase === "completed") {
            project.progress = 100;
            project.milestones.forEach((m) => {
              m.status = "completed";
            });
          }
          const updatedProject = await project.save();
          io.emit("sprint-changed", {
            projectId,
            sprint: updatedProject.sprint,
          });
          io.emit("project-updated", updatedProject);
          broadcastTeamActivity();

          if (oldPhase !== sprint.phase) {
            const { notifyProjectMembers } =
              await import("./utils/notificationService.js");
            await notifyProjectMembers(io, {
              project: updatedProject,
              initiatorEmail,
              message: `Sprint phase for project '${updatedProject.name}' was changed to '${sprint.phase}'`,
              type: "sprint-change",
            });
          }
        }
      } catch (err) {
        console.error("Error updating sprint via socket:", err.message);
      }
    },
  );

  socket.on("join-presence", (userData) => {
    if (userData && userData.email) {
      const email = userData.email.toLowerCase();
      socket.userEmail = email;

      activePresence.set(email, {
        name: userData.name,
        email: email,
        role: userData.role || 'student',
        task: "System - Active",
        active: true,
        socketId: socket.id
      });

      io.emit("presence-update", {
        email: email,
        task: "System - Active",
        active: true
      });

      socket.emit("presence-list", Array.from(activePresence.values()));
      broadcastTeamActivity();
    }
  });

  socket.on("update-task-status", ({ email, task }) => {
    if (email) {
      const lowerEmail = email.toLowerCase();
      const userPres = activePresence.get(lowerEmail);
      if (userPres) {
        userPres.task = task;
        userPres.active = task !== "Away";
        activePresence.set(lowerEmail, userPres);

        io.emit("presence-update", {
          email: lowerEmail,
          task: task,
          active: userPres.active
        });
        broadcastTeamActivity();
      }
    }
  });

  socket.on("disconnect", () => {
    if (socket.userEmail) {
      const email = socket.userEmail;
      const sockets = Array.from(io.sockets.sockets.values());
      const hasOtherSocket = sockets.some(s => s.id !== socket.id && s.userEmail === email);

      if (!hasOtherSocket) {
        const userPres = activePresence.get(email);
        if (userPres) {
          userPres.active = false;
          userPres.task = "Away";
          userPres.socketId = null;
          activePresence.set(email, userPres);

          io.emit("presence-update", {
            email: email,
            task: "Away",
            active: false
          });
          broadcastTeamActivity();
        }
      }
    }
  });
});

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// Simple Request Logger
app.use((req, res, next) => {
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);

// Environment variables
const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to server...");
    await initializePresence();

    // IMPORTANT: use server.listen(), not app.listen()
    server.listen(PORT, () => {
      console.log("Server running...");
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });
