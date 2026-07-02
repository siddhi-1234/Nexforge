import mongoose from "mongoose";

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
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;