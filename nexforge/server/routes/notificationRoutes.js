const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Fetch notifications for a user (and optionally by their email)
router.get("/:userId", async (req, res) => {
    try {
        const ids = [req.params.userId.toLowerCase()];
        if (req.query.email) {
            ids.push(req.query.email.toLowerCase());
        }
        const notifications = await Notification.find({
            userId: { $in: ids },
        }).sort({ createdAt: -1 });

        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark single notification as read
router.put("/:id/read", async (req, res) => {
    try {
        const notif = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ message: "Notification not found" });
        
        if (global.io) {
            const { emitUnreadCount } = require("../utils/notificationService");
            await emitUnreadCount(global.io, notif.userId);
        }
        
        res.json({ notification: notif });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark all notifications as read for a user
router.put("/user/:userId/read", async (req, res) => {
    try {
        const ids = [req.params.userId.toLowerCase()];
        if (req.query.email) {
            ids.push(req.query.email.toLowerCase());
        }
        await Notification.updateMany(
            { userId: { $in: ids } },
            { read: true }
        );
        
        if (global.io) {
            const { emitUnreadCount } = require("../utils/notificationService");
            await emitUnreadCount(global.io, req.params.userId, req.query.email);
        }
        
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete/Clear all notifications for a user
router.delete("/user/:userId", async (req, res) => {
    try {
        const ids = [req.params.userId.toLowerCase()];
        if (req.query.email) {
            ids.push(req.query.email.toLowerCase());
        }
        await Notification.deleteMany({ userId: { $in: ids } });
        
        if (global.io) {
            const { emitUnreadCount } = require("../utils/notificationService");
            await emitUnreadCount(global.io, req.params.userId, req.query.email);
        }
        
        res.json({ message: "All notifications cleared" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;