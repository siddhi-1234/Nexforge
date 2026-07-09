const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['completed', 'active', 'upcoming'], default: 'upcoming' }
});

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  completed: { type: Boolean, default: false }
});

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  initials: { type: String, required: true }
});

const ProjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['high', 'internal', 'medium', 'low'],
    default: 'medium'
  },
  tag: {
    type: String,
    required: true
  },
  sprintStatus: {
    type: String,
    default: 'Sprint 01'
  },
  sprint: {
    label: { type: String, default: 'Sprint 01' },
    phase: { type: String, enum: ['planning', 'active', 'completed', 'blocked'], default: 'planning' },
    health: { type: String, enum: ['healthy', 'at-risk', 'blocked'], default: 'healthy' }
  },
  progress: {
    type: Number,
    default: 0
  },
  nextMilestone: {
    title: { type: String, default: 'Kickoff Workshop' },
    statusText: { type: String, default: 'UPCOMING' },
    dueText: { type: String, default: 'Due in 5 days' }
  },
  milestones: [MilestoneSchema],
  tasks: [TaskSchema],
  members: [String], // Array of initials
  memberCount: {
    type: Number,
    default: 0
  },
  team: [TeamMemberSchema],
  lastActive: {
    type: String,
    default: 'Just now'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
