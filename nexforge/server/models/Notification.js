const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: "general",
        },
        read: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
        },
        projectCode: {
            type: String,
        },
        projectName: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;