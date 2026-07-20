const Project = require("../models/Project");

function getRecentActivityCount(projects) {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  return projects.filter((project) => {
    const updatedAt = project.updatedAt
      ? new Date(project.updatedAt).getTime()
      : null;
    const createdAt = project.createdAt
      ? new Date(project.createdAt).getTime()
      : null;
    const lastTouch = updatedAt || createdAt;

    return lastTouch && lastTouch >= twentyFourHoursAgo;
  }).length;
}

// Helper to determine if a dueDate string represents a past date
function isDatePast(dateStr) {
  if (!dateStr) return false;
  // Match e.g., "July 20" or "Jul 20" or "May 15"
  const match = dateStr.match(
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d+/i,
  );
  if (!match) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedDate = new Date(`${match[0]}, ${today.getFullYear()}`);
    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate < today;
  } catch (e) {
    return false;
  }
}

// Initial seed mock projects
const SEED_PROJECTS = [
  {
    id: "prj-1",
    code: "PRJ-0842",
    name: "NeuralNexus Redesign",
    priority: "high",
    tag: "HIGH PRIORITY",
    sprintStatus: "Sprint 03",
    sprint: {
      label: "Sprint 03",
      phase: "active",
      health: "healthy",
    },
    progress: 75,
    nextMilestone: {
      title: "AI Asset Generation Engine",
      statusText: "NEXT MILESTONE",
      dueText: "Due in 2 days",
    },
    milestones: [
      {
        name: "Phase 1: Discovery",
        status: "completed",
        dueDate: "Completed May 15",
        riskStatus: "on-track",
      },
      {
        name: "Phase 2: Core UX",
        status: "active",
        dueDate: "Due July 20",
        riskStatus: "on-track",
      },
      {
        name: "Phase 3: Beta",
        status: "upcoming",
        dueDate: "Due Aug 15",
        riskStatus: "on-track",
      },
      {
        name: "Launch",
        status: "upcoming",
        dueDate: "Due Sept 30",
        riskStatus: "on-track",
      },
    ],
    tasks: [
      {
        id: "t1-1",
        title: "Implement WebGL shader library",
        priority: "urgent",
        completed: true,
        assignee: "",
      },
      {
        id: "t1-2",
        title: "Optimize asset loader pipeline",
        priority: "high",
        completed: true,
        assignee: "",
      },
      {
        id: "t1-3",
        title: "Refine vector search dashboard",
        priority: "medium",
        completed: false,
        assignee: "",
      },
      {
        id: "t1-4",
        title: "Conduct user validation feedback",
        priority: "low",
        completed: false,
        assignee: "",
      },
    ],
    comments: [],
    members: ["JD", "MC", "SR"],
    memberCount: 3,
    team: [
      { name: "John Doe", email: "john.doe@example.com", initials: "JD" },
      { name: "Marcus Chen", email: "marcus.chen@example.com", initials: "MC" },
      {
        name: "Sarah Rogers",
        email: "sarah.rogers@example.com",
        initials: "SR",
      },
    ],
    lastActive: "Last active 2h ago",
  },
  {
    id: "prj-2",
    code: "PRJ-2210",
    name: "Quantum CRM Shell",
    priority: "internal",
    tag: "INTERNAL",
    sprintStatus: "Sprint 01",
    sprint: {
      label: "Sprint 01",
      phase: "planning",
      health: "healthy",
    },
    progress: 20,
    nextMilestone: {
      title: "User Flow Archetypes",
      statusText: "UPCOMING",
      dueText: "Starts Monday",
    },
    milestones: [
      {
        name: "Phase 1: Planning",
        status: "active",
        dueDate: "Due July 22",
        riskStatus: "on-track",
      },
      {
        name: "Phase 2: Prototyping",
        status: "upcoming",
        dueDate: "Due Aug 20",
        riskStatus: "on-track",
      },
      {
        name: "Phase 3: QA",
        status: "upcoming",
        dueDate: "Due Sept 15",
        riskStatus: "on-track",
      },
      {
        name: "Relay",
        status: "upcoming",
        dueDate: "Due Oct 10",
        riskStatus: "on-track",
      },
    ],
    tasks: [
      {
        id: "t2-1",
        title: "Establish global design tokens",
        priority: "medium",
        completed: true,
        assignee: "",
      },
      {
        id: "t2-2",
        title: "Draft CRM shell user journey",
        priority: "high",
        completed: false,
        assignee: "",
      },
      {
        id: "t2-3",
        title: "Configure telemetry logger pipeline",
        priority: "low",
        completed: false,
        assignee: "",
      },
    ],
    comments: [],
    members: ["MC", "JD", "SO"],
    memberCount: 3,
    team: [
      { name: "Marcus Chen", email: "marcus.chen@example.com", initials: "MC" },
      { name: "John Doe", email: "john.doe@example.com", initials: "JD" },
      {
        name: "Sophia Ortega",
        email: "sophia.ortega@example.com",
        initials: "SO",
      },
    ],
    lastActive: "Last active 4h ago",
  },
];

exports.getProjectMetrics = async (req, res) => {
  try {
    const projects = await Project.find();
    const teamMembers = new Set();
    const onlineMembers = new Set();

    projects.forEach((project) => {
      (project.team || []).forEach((member) => {
        if (member.email) {
          teamMembers.add(member.email.toLowerCase());
        }
      });

      if (getRecentActivityCount([project]) > 0) {
        (project.team || []).forEach((member) => {
          if (member.email) {
            onlineMembers.add(member.email.toLowerCase());
          }
        });
      }
    });

    const activeProjects = projects.filter((project) => {
      const phase = project.sprint?.phase;
      return (
        project.progress < 100 && (phase === "active" || phase === "planning")
      );
    }).length;

    const commitsToday = projects.reduce((total, project) => {
      const projectUpdatedAt = project.updatedAt
        ? new Date(project.updatedAt)
        : null;
      const isToday =
        projectUpdatedAt &&
        projectUpdatedAt.getDate() === new Date().getDate() &&
        projectUpdatedAt.getMonth() === new Date().getMonth() &&
        projectUpdatedAt.getFullYear() === new Date().getFullYear();

      if (!isToday) {
        return total;
      }

      const completedTasks = (project.tasks || []).filter(
        (task) => task.completed,
      ).length;
      return total + completedTasks;
    }, 0);

    res.status(200).json({
      metrics: {
        teamMembers: teamMembers.size,
        onlineNow: onlineMembers.size,
        activeProjects,
        commitsToday,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving project metrics",
      error: err.message,
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let projects = await Project.find();

    if (projects.length === 0) {
      projects = await Project.insertMany(SEED_PROJECTS);
      console.log("Seeded projects into MongoDB successfully");
    }

    // Filter by email if query parameter is provided
    const { email } = req.query;
    if (email) {
      const normalizedEmail = email.toLowerCase();
      projects = projects.filter((proj) => {
        const matchesTeam =
          proj.team &&
          proj.team.some(
            (member) =>
              member.email && member.email.toLowerCase() === normalizedEmail,
          );
        const matchesCreator =
          (proj.createdByEmail || "").toLowerCase() === normalizedEmail;
        return matchesTeam || matchesCreator;
      });
    }

    res.status(200).json({ projects });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving projects", error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      createdByEmail: req.body.createdByEmail || "",
      team: Array.isArray(req.body.team)
        ? req.body.team.map((member) => ({
            name: member.name || "",
            email: member.email || "",
            initials: member.initials || "",
          }))
        : [],
      members: Array.isArray(req.body.members) ? req.body.members : [],
      memberCount: Array.isArray(req.body.team) ? req.body.team.length : 0,
    };
    const newProject = new Project(projectData);
    await newProject.save();
    if (global.io) {
      global.io.emit("project-created", newProject);
    }

    const creatorEmail =
      req.body.createdByEmail || req.body.initiatorEmail || "";
    const creatorName =
      req.body.createdByName ||
      req.body.creatorName ||
      creatorEmail ||
      "a team member";

    if (global.io && creatorEmail) {
      const { notifyProjectMembers } = require("../utils/notificationService");
      await notifyProjectMembers(global.io, {
        project: newProject,
        initiatorEmail: creatorEmail,
        message: `Project '${newProject.name}' was created by ${creatorName}`,
        type: "project-created",
      });
    }

    res.status(201).json({
      message: "Project successfully created in MongoDB",
      project: newProject,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating project", error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const initiatorEmail = updateData.initiatorEmail;

    const oldProject = await Project.findOne({ id });
    if (!oldProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (updateData.sprint && updateData.sprint.phase === "completed") {
      updateData.progress = 100;
      if (updateData.milestones && updateData.milestones.length > 0) {
        updateData.milestones = updateData.milestones.map((m) => ({
          ...m,
          status: "completed",
        }));
      }
    }
    const updatedProject = await Project.findOneAndUpdate({ id }, updateData, {
      new: true,
    });
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (global.io) {
      console.log(
        `[Socket] Broadcasting project-updated for project ID: ${id}`,
      );
      global.io.emit("project-updated", updatedProject);
    }

    // Notify only for meaningful live project activity
    const { notifyProjectMembers } = require("../utils/notificationService");

    const oldTeamEmails = (oldProject.team || []).map((member) =>
      (member.email || "").toLowerCase(),
    );
    const newTeamEmails = (updatedProject.team || []).map((member) =>
      (member.email || "").toLowerCase(),
    );
    const addedTeamMembers = (updatedProject.team || []).filter(
      (member) =>
        member.email && !oldTeamEmails.includes(member.email.toLowerCase()),
    );
    if (addedTeamMembers.length > 0) {
      const addedNames = addedTeamMembers
        .map((member) => member.name)
        .join(", ");
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Team member${addedTeamMembers.length > 1 ? "s" : ""} ${addedNames} was added to project '${updatedProject.name}'`,
        type: "team-member-added",
      });
    }

    if (
      oldProject.sprint &&
      updatedProject.sprint &&
      oldProject.sprint.health !== updatedProject.sprint.health &&
      updatedProject.sprint.health !== "healthy"
    ) {
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Sprint health for project '${updatedProject.name}' is now ${updatedProject.sprint.health.toUpperCase()}`,
        type: "sprint-health-risk",
      });
    }

    const oldCommentsCount = (oldProject.comments || []).length;
    const newCommentsCount = (updatedProject.comments || []).length;
    if (newCommentsCount > oldCommentsCount) {
      const latestComment = updatedProject.comments[newCommentsCount - 1];
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail: initiatorEmail || latestComment.email,
        message: `New update from ${latestComment.author} in project '${updatedProject.name}'`,
        type: "comment",
      });
    }

    const oldMilestones = oldProject.milestones || [];
    const newMilestones = updatedProject.milestones || [];
    for (const newMs of newMilestones) {
      const oldMs = oldMilestones.find((m) => m.name === newMs.name);
      if (oldMs?.status !== "completed" && newMs.status === "completed") {
        await notifyProjectMembers(global.io, {
          project: updatedProject,
          initiatorEmail,
          message: `Milestone '${newMs.name}' in project '${updatedProject.name}' has been completed`,
          type: "milestone-completed",
        });
      }
    }

    if (
      oldProject.sprint &&
      updatedProject.sprint &&
      oldProject.sprint.phase !== updatedProject.sprint.phase &&
      updatedProject.sprint.phase === "completed"
    ) {
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Phase completed for project '${updatedProject.name}'`,
        type: "phase-completed",
      });
    }

    if (oldProject.progress !== 100 && updatedProject.progress === 100) {
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Project '${updatedProject.name}' has been completed`,
        type: "project-completed",
      });
    }

    res.status(200).json({
      message: "Project successfully updated in MongoDB",
      project: updatedProject,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating project", error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const initiatorEmail = req.query.initiatorEmail;

    const project = await Project.findOne({ id });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Notify members BEFORE deleting
    const { notifyProjectMembers } = require("../utils/notificationService");
    await notifyProjectMembers(global.io, {
      project,
      initiatorEmail,
      message: `Project '${project.name}' (${project.code}) was deleted`,
      type: "project-deleted",
    });

    await Project.deleteOne({ id });

    if (global.io) {
      global.io.emit("project-deleted", id);
      global.io.emit("project-archived", id);
    }
    res
      .status(200)
      .json({ message: "Project successfully deleted from MongoDB" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting project", error: err.message });
  }
};

exports.updateProjectSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { sprint } = req.body;
    const initiatorEmail = req.body.initiatorEmail;

    const project = await Project.findOne({ id });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const oldPhase = project.sprint ? project.sprint.phase : null;
    const oldHealth = project.sprint ? project.sprint.health : null;
    project.sprint = sprint;
    project.sprintStatus = sprint.label;
    if (sprint && sprint.phase === "completed") {
      project.progress = 100;
      project.milestones.forEach((m) => {
        m.status = "completed";
      });
    }

    const updatedProject = await project.save();

    if (global.io) {
      console.log(
        `[Socket] Broadcasting sprint-changed and project-updated for project ID: ${id}`,
      );
      global.io.emit("sprint-changed", {
        projectId: id,
        sprint: updatedProject.sprint,
      });
      global.io.emit("project-updated", updatedProject);
    }

    if (oldPhase !== sprint.phase && sprint.phase === "completed") {
      const { notifyProjectMembers } = require("../utils/notificationService");
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Phase completed for project '${updatedProject.name}'`,
        type: "phase-completed",
      });
    }

    if (
      oldHealth !== sprint.health &&
      sprint.health &&
      sprint.health !== "healthy"
    ) {
      const { notifyProjectMembers } = require("../utils/notificationService");
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Sprint health for project '${updatedProject.name}' is now ${sprint.health.toUpperCase()}`,
        type: "sprint-health-risk",
      });
    }

    res.status(200).json({
      message: "Sprint successfully updated",
      project: updatedProject,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating sprint", error: err.message });
  }
};
