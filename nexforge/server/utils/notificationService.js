const Notification = require("../models/Notification");
const User = require("../models/User");

const LIVE_NOTIFICATION_TYPES = new Set([
  "project-created",
  "team-member-added",
  "team-member-removed",
  "project-deleted",
  "sprint-health-risk",
  "milestone-completed",
  "phase-completed",
  "project-completed",
  "comment",
]);

function shouldCreateLiveNotification(type) {
  return LIVE_NOTIFICATION_TYPES.has((type || "").toLowerCase());
}

async function getUnreadCount(userIds) {
  // userIds can be a single ID or an array of IDs (e.g. [firebaseUid, email])
  const queryIds = Array.isArray(userIds) ? userIds : [userIds];
  return await Notification.countDocuments({
    userId: { $in: queryIds },
    read: false,
  });
}

async function emitUnreadCount(io, userId, userEmail) {
  const ids = [userId];
  if (userEmail) ids.push(userEmail.toLowerCase());

  const unreadCount = await getUnreadCount(ids);

  // Emit to both rooms
  io.to(userId).emit("notification-unread-count", unreadCount);
  if (userEmail) {
    io.to(userEmail.toLowerCase()).emit(
      "notification-unread-count",
      unreadCount,
    );
  }
}

async function sendNotification(
  io,
  { userId, userEmail, message, type, projectId, projectCode, projectName },
) {
  try {
    if (!shouldCreateLiveNotification(type)) {
      return null;
    }

    const notif = new Notification({
      userId: userId.toLowerCase(),
      message,
      type,
      projectId,
      projectCode,
      projectName,
      read: false,
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

async function notifyProjectMembers(
  io,
  { project, initiatorEmail, message, type, targetEmail },
) {
  try {
    if (!project || !project.team) return;

    let initiatorName = "";
    if (initiatorEmail) {
      const initiator = await User.findOne({
        email: initiatorEmail.toLowerCase(),
      });
      if (initiator) {
        initiatorName = initiator.name;
      }
    }

    let finalMessage = message;
    if (initiatorName) {
      if (message.includes("was changed to")) {
        finalMessage = message.replace(
          "Sprint phase for project",
          `${initiatorName} changed sprint phase for project`,
        );
      } else if (message.includes("was deleted")) {
        finalMessage = `${message} by ${initiatorName}`;
      } else if (message.includes("was deleted from")) {
        finalMessage = message.replace(
          "was deleted from",
          `was deleted by ${initiatorName} from`,
        );
      } else if (message.includes("is now")) {
        finalMessage = message.replace(
          "is now",
          `is now (updated by ${initiatorName})`,
        );
      }
    } else if (initiatorEmail) {
      if (message.includes("was changed to")) {
        finalMessage = message.replace(
          "Sprint phase for project",
          `${initiatorEmail} changed sprint phase for project`,
        );
      } else if (message.includes("was deleted")) {
        finalMessage = `${message} by ${initiatorEmail}`;
      }
    }

    let emailsToNotify = [];
    if (targetEmail) {
      emailsToNotify = [targetEmail];
    } else {
      emailsToNotify = project.team
        .map((m) => m.email)
        .filter(
          (email) =>
            email.toLowerCase() !== (initiatorEmail || "").toLowerCase(),
        );
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
        message: finalMessage,
        type,
        projectId: project.id,
        projectCode: project.code,
        projectName: project.name,
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
  notifyProjectMembers,
};
