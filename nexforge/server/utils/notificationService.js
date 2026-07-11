const Notification = require("../models/Notification");

async function getUnreadCount(userId) {
    return await Notification.countDocuments({
        userId,
        read: false
    });
}

async function emitUnreadCount(io, userId) {
    const unreadCount = await getUnreadCount(userId);
    io.to(userId).emit(
        "notification-unread-count",
        unreadCount
    );
}

module.exports = {
    getUnreadCount,
    emitUnreadCount
};