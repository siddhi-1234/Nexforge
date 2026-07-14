const Notification = require("../models/Notification");
const User = require("../models/User");

async function getUnreadCount(userIds) {
    // userIds can be a single ID or an array of IDs (e.g. [firebaseUid, email])
    const queryIds = Array.isArray(userIds) ? userIds : [userIds];
    return await Notification.countDocuments({
        userId: { $in: queryIds },
        read: false
    });
}

async function emitUnreadCount(io, userId, userEmail) {
    const ids = [userId];
    if (userEmail) ids.push(userEmail.toLowerCase());
    
    const unreadCount = await getUnreadCount(ids);
    
    // Emit to both rooms
    io.to(userId).emit("notification-unread-count", unreadCount);
    if (userEmail) {
        io.to(userEmail.toLowerCase()).emit("notification-unread-count", unreadCount);
    }
}

async function sendNotification(io, { userId, userEmail, message, type, projectId, projectCode, projectName }) {
    try {
        const notif = new Notification({
            userId: userId.toLowerCase(),
            message,
            type,
            projectId,
            projectCode,
            projectName,
            read: false
        });
        await notif.save();
        
        if (io) {
            io.to(userId.toLowerCase()).emit("new-notification", notif);
            if (userEmail) {
                io.to(userEmail.toLowerCase()).emit("new-notification", notif);
            }
            await emitUnreadCount(io, userId, userEmail);
        }
        return notif;
    } catch (err) {
        console.error("Error sending notification:", err);
    }
}

async function notifyProjectMembers(io, { project, initiatorEmail, message, type, targetEmail }) {
    try {
        if (!project || !project.team) return;
        
        let emailsToNotify = [];
        if (targetEmail) {
            emailsToNotify = [targetEmail];
        } else {
            emailsToNotify = project.team
                .map(m => m.email)
                .filter(email => email.toLowerCase() !== (initiatorEmail || '').toLowerCase());
        }
        
        for (const email of emailsToNotify) {
            const emailLower = email.toLowerCase();
            // Find user in DB to see if they have firebaseUid
            const user = await User.findOne({ email: emailLower });
            
            // If user exists, notify their firebaseUid and fallback to their email.
            // If user doesn't exist yet, notify using email as the userId.
            const targetId = user ? user.firebaseUid : emailLower;
            
            await sendNotification(io, {
                userId: targetId,
                userEmail: emailLower,
                message,
                type,
                projectId: project.id,
                projectCode: project.code,
                projectName: project.name
            });
        }
    } catch (err) {
        console.error("Error notifying project members:", err);
    }
}

module.exports = {
    getUnreadCount,
    emitUnreadCount,
    sendNotification,
    notifyProjectMembers
};