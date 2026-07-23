const Project = require("../models/Project");
const User = require("../models/User");

function getPresenceMap() {
  return global.activePresence || new Map();
}

function countOnlineNow(presenceMap) {
  let count = 0;
  for (const entry of presenceMap.values()) {
    if (entry.active) count++;
  }
  return count;
}

function isSameDay(a, b) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

async function computeMetrics() {
  const presenceMap = getPresenceMap();
  const [teamMembers, projects] = await Promise.all([
    User.countDocuments(),
    Project.find(),
  ]);

  const activeProjects = projects.filter((project) => {
    const phase = project.sprint?.phase;
    return (
      project.progress < 100 && (phase === "active" || phase === "planning")
    );
  }).length;

  const today = new Date();
  const commitsToday = projects.reduce((total, project) => {
    const projectUpdatedAt = project.updatedAt
      ? new Date(project.updatedAt)
      : null;
    if (!projectUpdatedAt || !isSameDay(projectUpdatedAt, today)) {
      return total;
    }
    const completedTasks = (project.tasks || []).filter(
      (task) => task.completed,
    ).length;
    return total + completedTasks;
  }, 0);

  return {
    teamMembers,
    onlineNow: countOnlineNow(presenceMap),
    activeProjects,
    commitsToday,
  };
}

function computeVelocity(projects) {
  const now = new Date();
  const week7D = [0, 0, 0, 0, 0, 0, 0];
  const slots24H = [0, 0, 0, 0, 0, 0];

  const dayOfWeek = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - dayOfWeek);

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  projects.forEach((project) => {
    const updatedAt = project.updatedAt ? new Date(project.updatedAt) : null;
    if (!updatedAt) return;

    const completedTasks = (project.tasks || []).filter(
      (task) => task.completed,
    ).length;
    if (completedTasks === 0) return;

    if (updatedAt >= weekStart) {
      const idx = (updatedAt.getDay() + 6) % 7;
      week7D[idx] += completedTasks;
    }

    if (updatedAt >= dayStart) {
      const hourSlotIdx = Math.min(Math.floor(updatedAt.getHours() / 4), 5);
      slots24H[hourSlotIdx] += completedTasks;
    }
  });

  const normalize = (values) => {
    const max = Math.max(...values, 1);
    return values.map((v) => Math.round((v / max) * 100));
  };

  return {
    "7D": normalize(week7D),
    "24H": normalize(slots24H),
  };
}

async function broadcastTeamActivity() {
  if (!global.io) return;

  try {
    const [metrics, projects] = await Promise.all([
      computeMetrics(),
      Project.find(),
    ]);
    const velocity = computeVelocity(projects);

    global.io.emit("metrics-update", { metrics });
    global.io.emit("velocity-update", { velocity });
  } catch (err) {
    console.error("Failed to broadcast team activity:", err.message);
  }
}

module.exports = {
  computeMetrics,
  computeVelocity,
  broadcastTeamActivity,
};
