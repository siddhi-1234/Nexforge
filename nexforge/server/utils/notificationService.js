import Notification from "../models/Notification.js";

export async function getUnreadCount(userId) {

    return await Notification.countDocuments({
        userId,
        read: false
    });

}

export async function emitUnreadCount(io, userId) {

    const unreadCount = await getUnreadCount(userId);

    io.to(userId).emit(
        "notification-unread-count",
        unreadCount
    );

}