const Project = require('../models/Project');

// Initial seed mock projects
const SEED_PROJECTS = [
  {
    id: 'prj-1',
    code: 'PRJ-0842',
    name: 'NeuralNexus Redesign',
    priority: 'high',
    tag: 'HIGH PRIORITY',
    sprintStatus: 'Sprint 03',
    sprint: {
      label: 'Sprint 03',
      phase: 'active',
      health: 'healthy'
    },
    progress: 75,
    nextMilestone: {
      title: 'AI Asset Generation Engine',
      statusText: 'NEXT MILESTONE',
      dueText: 'Due in 2 days'
    },
    milestones: [
      { name: 'Phase 1: Discovery', status: 'completed', dueDate: 'Completed May 15', riskStatus: 'on-track' },
      { name: 'Phase 2: Core UX', status: 'active', dueDate: 'Due July 20', riskStatus: 'on-track' },
      { name: 'Phase 3: Beta', status: 'upcoming', dueDate: 'Due Aug 15', riskStatus: 'on-track' },
      { name: 'Launch', status: 'upcoming', dueDate: 'Due Sept 30', riskStatus: 'on-track' }
    ],
    tasks: [
      { id: 't1-1', title: 'Implement WebGL shader library', priority: 'urgent', completed: true },
      { id: 't1-2', title: 'Optimize asset loader pipeline', priority: 'high', completed: true },
      { id: 't1-3', title: 'Refine vector search dashboard', priority: 'medium', completed: false },
      { id: 't1-4', title: 'Conduct user validation feedback', priority: 'low', completed: false }
    ],
    members: ['JD', 'MC', 'SR'],
    memberCount: 3,
    team: [
      { name: 'John Doe', email: 'john.doe@example.com', initials: 'JD' },
      { name: 'Marcus Chen', email: 'marcus.chen@example.com', initials: 'MC' },
      { name: 'Sarah Rogers', email: 'sarah.rogers@example.com', initials: 'SR' }
    ],
    lastActive: 'Last active 2h ago'
  },
  {
    id: 'prj-2',
    code: 'PRJ-2210',
    name: 'Quantum CRM Shell',
    priority: 'internal',
    tag: 'INTERNAL',
    sprintStatus: 'Sprint 01',
    sprint: {
      label: 'Sprint 01',
      phase: 'planning',
      health: 'healthy'
    },
    progress: 20,
    nextMilestone: {
      title: 'User Flow Archetypes',
      statusText: 'UPCOMING',
      dueText: 'Starts Monday'
    },
    milestones: [
      { name: 'Phase 1: Planning', status: 'active', dueDate: 'Due July 22', riskStatus: 'on-track' },
      { name: 'Phase 2: Prototyping', status: 'upcoming', dueDate: 'Due Aug 20', riskStatus: 'on-track' },
      { name: 'Phase 3: QA', status: 'upcoming', dueDate: 'Due Sept 15', riskStatus: 'on-track' },
      { name: 'Relay', status: 'upcoming', dueDate: 'Due Oct 10', riskStatus: 'on-track' }
    ],
    tasks: [
      { id: 't2-1', title: 'Establish global design tokens', priority: 'medium', completed: true },
      { id: 't2-2', title: 'Draft CRM shell user journey', priority: 'high', completed: false },
      { id: 't2-3', title: 'Configure telemetry logger pipeline', priority: 'low', completed: false }
    ],
    members: ['MC', 'JD', 'SO'],
    memberCount: 3,
    team: [
      { name: 'Marcus Chen', email: 'marcus.chen@example.com', initials: 'MC' },
      { name: 'John Doe', email: 'john.doe@example.com', initials: 'JD' },
      { name: 'Sophia Ortega', email: 'sophia.ortega@example.com', initials: 'SO' }
    ],
    lastActive: 'Last active 4h ago'
  }
];

exports.getProjects = async (req, res) => {
  try {
    let projects = await Project.find();
    
    // Auto-reseed if the loaded milestones are missing the dueDate property (schema change)
    const needsReseed = projects.some(p => p.milestones && p.milestones.length > 0 && p.milestones[0].dueDate === undefined);
    
    if (projects.length === 0 || needsReseed) {
      if (needsReseed) {
        await Project.deleteMany({});
        console.log('Cleared out-of-date seed projects from MongoDB');
      }
      projects = await Project.insertMany(SEED_PROJECTS);
      console.log('Seeded projects into MongoDB successfully');
    }
    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving projects', error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const newProject = new Project(projectData);
    await newProject.save();
    if (global.io) {
      global.io.emit('project-created', newProject);
    }
    res.status(201).json({ message: 'Project successfully created in MongoDB', project: newProject });
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.sprint && updateData.sprint.phase === 'completed') {
      updateData.progress = 100;
      if (updateData.milestones && updateData.milestones.length > 0) {
        updateData.milestones = updateData.milestones.map(m => ({
          ...m,
          status: 'completed'
        }));
      }
    }
    const updatedProject = await Project.findOneAndUpdate({ id }, updateData, { new: true });
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (global.io) {
      console.log(`[Socket] Broadcasting project-updated for project ID: ${id}`);
      global.io.emit('project-updated', updatedProject);
    }
    res.status(200).json({ message: 'Project successfully updated in MongoDB', project: updatedProject });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findOneAndDelete({ id });
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (global.io) {
      global.io.emit('project-deleted', id);
      global.io.emit('project-archived', id);
    }
    res.status(200).json({ message: 'Project successfully deleted from MongoDB' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err.message });
  }
};

exports.updateProjectSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { sprint } = req.body;
    
    const project = await Project.findOne({ id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    project.sprint = sprint;
    project.sprintStatus = sprint.label;
    if (sprint && sprint.phase === 'completed') {
      project.progress = 100;
      project.milestones.forEach(m => {
        m.status = 'completed';
      });
    }
    
    const updatedProject = await project.save();
    
    if (global.io) {
      console.log(`[Socket] Broadcasting sprint-changed and project-updated for project ID: ${id}`);
      global.io.emit('sprint-changed', { projectId: id, sprint: updatedProject.sprint });
      global.io.emit('project-updated', updatedProject);
    }
    res.status(200).json({ message: 'Sprint successfully updated', project: updatedProject });
  } catch (err) {
    res.status(500).json({ message: 'Error updating sprint', error: err.message });
  }
};
