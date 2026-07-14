const Project = require("../models/Project");

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
    };
    const newProject = new Project(projectData);
    await newProject.save();
    if (global.io) {
      global.io.emit("project-created", newProject);
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

    // Notifications triggering by comparing old and new states
    const { notifyProjectMembers } = require("../utils/notificationService");

    // 1. Sprint Phase changes
    if (
      oldProject.sprint &&
      updatedProject.sprint &&
      oldProject.sprint.phase !== updatedProject.sprint.phase
    ) {
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Sprint phase for project '${updatedProject.name}' was changed to '${updatedProject.sprint.phase}'`,
        type: "sprint-change",
      });
    }

    // 2. Comments added
    const oldCommentsCount = (oldProject.comments || []).length;
    const newCommentsCount = (updatedProject.comments || []).length;
    if (newCommentsCount > oldCommentsCount) {
      const latestComment = updatedProject.comments[newCommentsCount - 1];
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail: initiatorEmail || latestComment.email,
        message: `New comment by ${latestComment.author} in project '${updatedProject.name}': "${latestComment.text}"`,
        type: "comment",
      });
    }

    // 3. Task Assignments
    const oldTasks = oldProject.tasks || [];
    const newTasks = updatedProject.tasks || [];
    for (const newTask of newTasks) {
      const oldTask = oldTasks.find((t) => t.id === newTask.id);
      if (
        newTask.assignee &&
        (!oldTask || oldTask.assignee !== newTask.assignee)
      ) {
        const assignedMember = updatedProject.team.find(
          (m) => m.initials === newTask.assignee,
        );
        if (assignedMember) {
          await notifyProjectMembers(global.io, {
            project: updatedProject,
            initiatorEmail,
            message: `You have been assigned to task '${newTask.title}' in project '${updatedProject.name}'`,
            type: "task-assignment",
            targetEmail: assignedMember.email,
          });
        }
      }
    }

    // 4. Milestone Risk changes
    const oldMilestones = oldProject.milestones || [];
    const newMilestones = updatedProject.milestones || [];
    for (const newMs of newMilestones) {
      const oldMs = oldMilestones.find((m) => m.name === newMs.name);
      if (
        newMs.riskStatus &&
        newMs.riskStatus !== "on-track" &&
        (!oldMs || oldMs.riskStatus !== newMs.riskStatus)
      ) {
        await notifyProjectMembers(global.io, {
          project: updatedProject,
          initiatorEmail,
          message: `Milestone '${newMs.name}' in project '${updatedProject.name}' is now ${newMs.riskStatus.toUpperCase()}`,
          type: "milestone-risk",
        });
      }
    }

    // 5. Overdue Items check
    for (const newMs of newMilestones) {
      const oldMs = oldMilestones.find((m) => m.name === newMs.name);
      if (
        newMs.status !== "completed" &&
        newMs.dueDate &&
        isDatePast(newMs.dueDate)
      ) {
        if (
          !oldMs ||
          oldMs.status === "completed" ||
          !isDatePast(oldMs.dueDate) ||
          oldMs.riskStatus !== newMs.riskStatus
        ) {
          await notifyProjectMembers(global.io, {
            project: updatedProject,
            initiatorEmail,
            message: `OVERDUE: Milestone '${newMs.name}' in project '${updatedProject.name}' is past its due date (${newMs.dueDate})`,
            type: "overdue",
          });
        }
      }
    }

    // 6. Destructive Actions: Task deleted
    for (const oldTask of oldTasks) {
      if (!newTasks.some((t) => t.id === oldTask.id)) {
        await notifyProjectMembers(global.io, {
          project: updatedProject,
          initiatorEmail,
          message: `Task '${oldTask.title}' was deleted from project '${updatedProject.name}'`,
          type: "destructive-action",
        });
      }
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
      message: `DESTRUCTIVE ACTION: Project '${project.name}' (${project.code}) was deleted`,
      type: "destructive-action",
    });

    await Project.findOneAndDelete({ id });

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

    if (oldPhase !== sprint.phase) {
      const { notifyProjectMembers } = require("../utils/notificationService");
      await notifyProjectMembers(global.io, {
        project: updatedProject,
        initiatorEmail,
        message: `Sprint phase for project '${updatedProject.name}' was changed to '${sprint.phase}'`,
        type: "sprint-change",
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
