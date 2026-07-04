import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Bell, 
  SlidersHorizontal, 
  Settings, 
  Layers, 
  CheckSquare, 
  Compass, 
  Briefcase, 
  Users, 
  LogOut, 
  Cloud, 
  User, 
  Calendar,
  X,
  PlusCircle,
  Clock,
  Check
} from 'lucide-react';
import nexforgeLogo from './logo.png';
import { Link, useNavigate } from 'react-router-dom';

/* ────────────────────────────────────────────────────────
   1. CUSTOM TILT & SPOTLIGHT CARD COMPONENT (Animation #2)
   ──────────────────────────────────────────────────────── */
function TiltSpotlightCard({ children, className = "", style = {} }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 3D tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 15; // smooth rotation factor
    const rotateY = (x - centerX) / 15;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-300 ease-out border border-[#1E293B]/60 rounded-2xl bg-[#11141D] ${className}`}
      style={{ 
        transformStyle: "preserve-3d", 
        ...style 
      }}
    >
      {/* Soft spotlight overlay */}
      {isHovered && (
        <div
          className="absolute pointer-events-none inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(56, 222, 187, 0.12), transparent 80%)`,
            zIndex: 1
          }}
        />
      )}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   2. PROGRESS RING COMPONENT (Animation #3)
   ──────────────────────────────────────────────────────── */
function ProgressRing({ percent, size = 68, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Set percentage to state on mount to trigger draw animation
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const progress = percent / 100;
      setAnimatedOffset(circumference - progress * circumference);
    }, 150);
    return () => clearTimeout(timer);
  }, [percent, circumference]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Track circle */}
        <circle
          className="text-slate-800/40"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Draw progress circle */}
        <circle
          className="text-[#38debb] transition-all duration-1000 ease-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white font-display">{percent}%</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   3. TASK ACCORDION COMPONENT (Animation #5)
   ──────────────────────────────────────────────────────── */
function TaskAccordion({ tasks, isOpen, onToggle, onToggleTask }) {
  return (
    <div className="mt-6 border-t border-[#1e293b]/60 pt-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-slate-400 hover:text-white transition-colors"
      >
        <div className="flex items-center space-x-2 text-sm font-medium">
          <span className="text-[#38debb] text-lg">✓</span>
          <span className="font-semibold text-slate-200">Task Management</span>
          <span className="bg-[#1e293b]/80 border border-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-semibold">
            {tasks.length} Total
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 pl-2 pr-1 pb-1">
              {tasks.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">No tasks added to this project yet.</div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-[#181F2E]/60 border border-slate-800/80 text-xs hover:border-slate-700/60 hover:bg-[#1E293B]/40 transition-all cursor-pointer"
                    onClick={() => onToggleTask(task.id)}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        task.completed 
                          ? 'bg-[#38debb] border-[#38debb] text-[#05070A]' 
                          : 'border-slate-600 bg-slate-900/60'
                      }`}>
                        {task.completed && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span className={`transition-all ${task.completed ? "line-through text-slate-500" : "text-slate-300"}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.priority === 'urgent' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-red" />
                      )}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                        task.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        task.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   4. PROJECTS PAGE MAIN COMPONENT
   ──────────────────────────────────────────────────────── */
const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Standard Mock Projects
  const [projects, setProjects] = useState([
    {
      id: 'prj-1',
      code: 'PRJ-0842',
      name: 'NeuralNexus Redesign',
      priority: 'high',
      tag: 'HIGH PRIORITY',
      sprintStatus: 'Sprint 03',
      progress: 75,
      nextMilestone: {
        title: 'AI Asset Generation Engine',
        statusText: 'NEXT MILESTONE',
        dueText: 'Due in 2 days'
      },
      milestones: [
        { name: 'Phase 1: Discovery', status: 'completed' },
        { name: 'Phase 2: Core UX', status: 'active' },
        { name: 'Phase 3: Beta', status: 'upcoming' },
        { name: 'Launch', status: 'upcoming' }
      ],
      tasks: [
        { id: 't1-1', title: 'Implement WebGL shader library', priority: 'urgent', completed: true },
        { id: 't1-2', title: 'Optimize asset loader pipeline', priority: 'high', completed: true },
        { id: 't1-3', title: 'Refine vector search dashboard', priority: 'medium', completed: false },
        { id: 't1-4', title: 'Conduct user validation feedback', priority: 'low', completed: false }
      ],
      members: ['JD', 'MC', 'SR'],
      memberCount: 7,
      lastActive: 'Last active 2h ago'
    },
    {
      id: 'prj-2',
      code: 'PRJ-2210',
      name: 'Quantum CRM Shell',
      priority: 'internal',
      tag: 'INTERNAL',
      sprintStatus: 'Sprint 01',
      progress: 20,
      nextMilestone: {
        title: 'User Flow Archetypes',
        statusText: 'UPCOMING',
        dueText: 'Starts Monday'
      },
      milestones: [
        { name: 'Phase 1: Planning', status: 'active' },
        { name: 'Phase 2: Prototyping', status: 'upcoming' },
        { name: 'Phase 3: QA', status: 'upcoming' },
        { name: 'Relay', status: 'upcoming' }
      ],
      tasks: [
        { id: 't2-1', title: 'Establish global design tokens', priority: 'medium', completed: true },
        { id: 't2-2', title: 'Draft CRM shell user journey', priority: 'high', completed: false },
        { id: 't2-3', title: 'Configure telemetry logger pipeline', priority: 'low', completed: false }
      ],
      members: ['MC', 'JD', 'SO'],
      memberCount: 7,
      lastActive: 'Last active 4h ago'
    }
  ]);

  // Live activity timeline data
  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      type: 'system',
      message: 'System automatically synchronized 14 assets for ',
      highlightProject: 'NeuralNexus',
      meta: 'Deployment successful • Build #429',
      time: 'JUST NOW'
    },
    {
      id: 'act-2',
      type: 'user',
      userAvatar: 'MC',
      userName: 'Marcus Chen',
      message: ' pushed 4 new style definitions to the ',
      highlightProject: 'Forge Vault',
      meta: 'Updated global design tokens for Enterprise clients',
      time: '2H AGO'
    }
  ]);

  // UI State management
  const [openAccordionId, setOpenAccordionId] = useState('prj-1');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  // Form states
  const [newProject, setNewProject] = useState({
    name: '',
    priority: 'high',
    sprintStatus: 'Sprint 01',
    progress: 0,
    nextMilestoneTitle: '',
    nextMilestoneStatus: 'UPCOMING',
    nextMilestoneDue: '',
    activePhaseIndex: 0,
    tasksText: '',
    membersText: 'JD, MC'
  });

  const [editProjectData, setEditProjectData] = useState(null);

  // Notifications State
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Trigger local project animations on create/delete
  const handleToggleAccordion = (id) => {
    setOpenAccordionId(openAccordionId === id ? null : id);
  };

  const handleToggleTaskCompleted = (projId, taskId) => {
    setProjects(projects.map(proj => {
      if (proj.id === projId) {
        const updatedTasks = proj.tasks.map(t => {
          if (t.id === taskId) {
            return { ...t, completed: !t.completed };
          }
          return t;
        });
        
        // Recalculate progress based on task completion
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const totalCount = updatedTasks.length;
        const computedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return { 
          ...proj, 
          tasks: updatedTasks,
          progress: computedProgress
        };
      }
      return proj;
    }));
  };

  // Add Project CRUD triggers
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const milestones = [
      { name: 'Phase 1: Planning', status: newProject.activePhaseIndex === 0 ? 'active' : (newProject.activePhaseIndex > 0 ? 'completed' : 'upcoming') },
      { name: 'Phase 2: Development', status: newProject.activePhaseIndex === 1 ? 'active' : (newProject.activePhaseIndex > 1 ? 'completed' : 'upcoming') },
      { name: 'Phase 3: QA', status: newProject.activePhaseIndex === 2 ? 'active' : (newProject.activePhaseIndex > 2 ? 'completed' : 'upcoming') },
      { name: 'Release', status: newProject.activePhaseIndex === 3 ? 'active' : 'upcoming' }
    ];

    const tasksList = newProject.tasksText.split('\n')
      .filter(t => t.trim() !== '')
      .map((t, idx) => ({
        id: `t-new-${Date.now()}-${idx}`,
        title: t.trim(),
        priority: 'high',
        completed: false
      }));

    const prjId = `prj-${Date.now()}`;
    const formattedProject = {
      id: prjId,
      code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProject.name,
      priority: newProject.priority,
      tag: newProject.priority.toUpperCase(),
      sprintStatus: newProject.sprintStatus,
      progress: parseInt(newProject.progress) || 0,
      nextMilestone: {
        title: newProject.nextMilestoneTitle || 'Kickoff Workshop',
        statusText: newProject.nextMilestoneStatus,
        dueText: newProject.nextMilestoneDue || 'Due in 5 days'
      },
      milestones,
      tasks: tasksList,
      members: newProject.membersText.split(',').map(m => m.trim().toUpperCase()),
      memberCount: newProject.membersText.split(',').length + 3,
      lastActive: 'Just now'
    };

    setProjects([formattedProject, ...projects]);
    
    // Add activity log
    const newAct = {
      id: `act-new-${Date.now()}`,
      type: 'system',
      message: `Project ${formattedProject.name} was created by team administrator. `,
      highlightProject: formattedProject.code,
      meta: 'Database record initialized successfully',
      time: 'JUST NOW'
    };
    setActivities([newAct, ...activities]);

    // Reset create fields
    setNewProject({
      name: '',
      priority: 'high',
      sprintStatus: 'Sprint 01',
      progress: 0,
      nextMilestoneTitle: '',
      nextMilestoneStatus: 'UPCOMING',
      nextMilestoneDue: '',
      activePhaseIndex: 0,
      tasksText: '',
      membersText: 'JD, MC'
    });
    setShowCreateModal(false);
  };

  const handleEditClick = (proj, e) => {
    e.stopPropagation();
    setEditProjectData({
      ...proj,
      nextMilestoneTitle: proj.nextMilestone.title,
      nextMilestoneStatus: proj.nextMilestone.statusText,
      nextMilestoneDue: proj.nextMilestone.dueText,
      tasksText: proj.tasks.map(t => t.title).join('\n'),
      activePhaseIndex: proj.milestones.findIndex(m => m.status === 'active') === -1 ? 0 : proj.milestones.findIndex(m => m.status === 'active')
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = (e) => {
    e.preventDefault();
    if (!editProjectData.name.trim()) return;

    const milestones = [
      { name: 'Phase 1: Planning', status: editProjectData.activePhaseIndex === 0 ? 'active' : (editProjectData.activePhaseIndex > 0 ? 'completed' : 'upcoming') },
      { name: 'Phase 2: Development', status: editProjectData.activePhaseIndex === 1 ? 'active' : (editProjectData.activePhaseIndex > 1 ? 'completed' : 'upcoming') },
      { name: 'Phase 3: QA', status: editProjectData.activePhaseIndex === 2 ? 'active' : (editProjectData.activePhaseIndex > 2 ? 'completed' : 'upcoming') },
      { name: 'Release', status: editProjectData.activePhaseIndex === 3 ? 'active' : 'upcoming' }
    ];

    const currentTasks = editProjectData.tasks;
    const lines = editProjectData.tasksText.split('\n').filter(t => t.trim() !== '');
    
    // Map new tasks while retaining completed states if names match
    const updatedTasks = lines.map((line, idx) => {
      const match = currentTasks.find(t => t.title.toLowerCase() === line.trim().toLowerCase());
      return {
        id: match ? match.id : `t-edit-${Date.now()}-${idx}`,
        title: line.trim(),
        priority: match ? match.priority : 'high',
        completed: match ? match.completed : false
      };
    });

    const updatedProjects = projects.map(proj => {
      if (proj.id === editProjectData.id) {
        return {
          ...proj,
          name: editProjectData.name,
          priority: editProjectData.priority,
          tag: editProjectData.priority.toUpperCase(),
          sprintStatus: editProjectData.sprintStatus,
          progress: parseInt(editProjectData.progress) || 0,
          nextMilestone: {
            title: editProjectData.nextMilestoneTitle,
            statusText: editProjectData.nextMilestoneStatus,
            dueText: editProjectData.nextMilestoneDue
          },
          milestones,
          tasks: updatedTasks,
          lastActive: 'Just modified'
        };
      }
      return proj;
    });

    setProjects(updatedProjects);
    setShowEditModal(false);

    // Add activity log
    const editAct = {
      id: `act-edit-${Date.now()}`,
      type: 'user',
      userAvatar: 'AR',
      userName: 'Alex Rivest',
      message: ' updated details and roadmap milestones for ',
      highlightProject: editProjectData.name,
      meta: 'Project settings and sprints updated',
      time: 'JUST NOW'
    };
    setActivities([editAct, ...activities]);
  };

  const handleDeleteClick = (proj, e) => {
    e.stopPropagation();
    setActiveProject(proj);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!activeProject) return;

    setProjects(projects.filter(p => p.id !== activeProject.id));
    setShowDeleteModal(false);

    // Add activity log
    const delAct = {
      id: `act-del-${Date.now()}`,
      type: 'system',
      message: `Project ${activeProject.name} was marked deleted and archived. `,
      highlightProject: activeProject.code,
      meta: 'Resource files cleaned and stored in archive storage',
      time: 'JUST NOW'
    };
    setActivities([delAct, ...activities]);
    setActiveProject(null);
  };

  // Filter projects based on query
  const filteredProjects = projects.filter(proj => 
    proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    proj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proj.sprintStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#05070A] text-slate-100 overflow-x-hidden font-sans select-none pb-12">
      {/* ────────────────────────────────────────────────────────
         STYLE TAG FOR CUSTOM MICRO-PULSES (Animation #7 & general glows)
         ──────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes gentle-pulse-teal {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
            box-shadow: 0 0 0 0 rgba(56, 222, 187, 0.4);
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 10px 4px rgba(56, 222, 187, 0.55);
          }
        }
        @keyframes gentle-pulse-red {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
            box-shadow: 0 0 10px 4px rgba(239, 68, 68, 0.55);
          }
        }
        @keyframes gentle-pulse-blue {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
            box-shadow: 0 0 0 0 rgba(0, 176, 255, 0.4);
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 10px 4px rgba(0, 176, 255, 0.55);
          }
        }
        .animate-pulse-teal {
          animation: gentle-pulse-teal 2s infinite ease-in-out;
        }
        .animate-pulse-red {
          animation: gentle-pulse-red 2s infinite ease-in-out;
        }
        .animate-pulse-blue {
          animation: gentle-pulse-blue 2s infinite ease-in-out;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #05070A;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      <div className="flex min-h-screen">
        
        {/* ── SIDEBAR ── */}
        <aside className="w-[245px] shrink-0 border-r border-[#1E293B]/60 bg-[#07090F] flex flex-col justify-between p-5 z-20">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={nexforgeLogo} alt="NexForge" className="w-9 h-9 object-contain" />
              <div>
                <h1 className="text-lg font-bold font-display text-white tracking-wide leading-none">NexForge</h1>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider font-display uppercase block mt-1">V3.0 Enterprise</span>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1">
              <Link 
                to="/dashboard/student" 
                className="flex items-center space-x-3 px-3.5 py-3 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-[#11141D]/60 transition-all font-medium text-sm group"
              >
                <Compass className="w-[18px] h-[18px] text-slate-500 group-hover:text-slate-300 transition-colors" />
                <span>Dashboard</span>
              </Link>

              <Link 
                to="/dashboard/projects" 
                className="flex items-center space-x-3 px-3.5 py-3 text-[#38debb] rounded-xl bg-[#11141D]/80 border border-[#38debb]/10 shadow-[0_0_15px_rgba(56,222,187,0.06)] font-semibold text-sm transition-all relative overflow-hidden"
              >
                {/* Active sidebar highlight border */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#38debb]" />
                <Layers className="w-[18px] h-[18px]" />
                <span>Projects</span>
              </Link>

              <a 
                href="#/" 
                className="flex items-center space-x-3 px-3.5 py-3 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-[#11141D]/60 transition-all font-medium text-sm group"
              >
                <CheckSquare className="w-[18px] h-[18px] text-slate-500 group-hover:text-slate-300 transition-colors" />
                <span>My Tasks</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse-red" />
              </a>

              <a 
                href="#/" 
                className="flex items-center space-x-3 px-3.5 py-3 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-[#11141D]/60 transition-all font-medium text-sm group"
              >
                <Users className="w-[18px] h-[18px] text-slate-500 group-hover:text-slate-300 transition-colors" />
                <span>Workspaces</span>
              </a>
            </nav>
          </div>

          {/* Bottom Sidebar */}
          <div className="space-y-4 pt-6 border-t border-[#1E293B]/40">
            <a 
              href="#/" 
              className="flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-slate-200 transition-all text-xs font-semibold"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </a>

            {/* Profile widget */}
            <div className="relative p-3.5 rounded-xl bg-gradient-to-b from-[#11141D] to-[#0A0D14] border border-[#1E293B]/40 flex items-center space-x-3 overflow-hidden">
              {/* Subtle background grid pattern */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat" 
                style={{ 
                  backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, 
                  backgroundSize: '8px 8px' 
                }} 
              />
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center font-display font-bold text-xs text-[#38debb]">
                AR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate font-display tracking-wide">Alex Rivest</p>
                <span className="text-[10px] font-semibold text-slate-500 block">Pro Plan</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 flex flex-col p-8 overflow-y-auto max-w-[1280px] mx-auto w-full">
          
          {/* TOP BAR */}
          <header className="flex items-center justify-between pb-6 border-b border-[#1E293B]/60 mb-8">
            <div className="flex items-center space-x-6">
              <h2 className="text-xl font-bold font-display text-white tracking-wide">Projects</h2>
              
              {/* Grid / List toggle */}
              <div className="bg-[#11141D]/90 border border-[#1E293B]/60 p-1 rounded-xl flex items-center space-x-1 select-none">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-[#1E293B] text-[#38debb]' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'list' 
                      ? 'bg-[#1E293B] text-[#38debb]' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search bar */}
              <div className="relative w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, tasks, or files..." 
                  className="w-full bg-[#11141D]/90 border border-[#1E293B]/60 focus:border-[#38debb]/50 text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:ring-0 focus:outline-none transition-all"
                />
              </div>

              {/* Notification bell dropdown toggle */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setUnreadNotifications(0);
                  }}
                  className="relative p-2 rounded-xl bg-[#11141D]/80 border border-[#1E293B]/60 text-slate-400 hover:text-[#38debb] hover:border-[#38debb]/30 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#11141D] animate-pulse-red" />
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#11141D] border border-slate-800 rounded-2xl p-4 shadow-2xl z-30">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                      <span className="text-xs font-bold text-slate-200">Recent Notifications</span>
                      <button className="text-[10px] text-[#38debb] hover:underline" onClick={() => setUnreadNotifications(0)}>Clear</button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      <div className="text-xs p-2 bg-[#181F2E]/40 border border-slate-800/80 rounded-lg">
                        <span className="text-[#38debb] font-semibold">Alex</span> updated milestones for Quantum CRM Shell.
                        <span className="block text-[10px] text-slate-500 mt-1">Just now</span>
                      </div>
                      <div className="text-xs p-2 bg-[#181F2E]/40 border border-slate-800/80 rounded-lg">
                        <span className="text-[#38debb] font-semibold">System</span> built successfully #429 for NeuralNexus.
                        <span className="block text-[10px] text-slate-500 mt-1">5m ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 rounded-xl bg-[#11141D]/80 border border-[#1E293B]/60 text-slate-400 hover:text-slate-200 transition-all">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* WORKSPACE OVERVIEW HEADER */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold text-[#38debb] tracking-wider uppercase block font-display mb-1.5">
                WORKSPACE OVERVIEW
              </span>
              <h1 className="text-3xl font-extrabold font-display text-white tracking-tight leading-none mb-2">
                Engineering Forge
              </h1>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                <span>Active sprints:</span>
                <span className="text-white font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38debb] animate-pulse-teal" />
                  <span>03</span>
                </span>
                <span className="text-slate-600">•</span>
                <span>Completion:</span>
                <span className="text-white font-bold">68%</span>
              </div>
            </div>

            {/* Create Project Button with Radial Pulse Shadow */}
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="relative group overflow-hidden bg-gradient-to-r from-[#38debb] to-[#00b0ff] text-[#05070A] font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center space-x-2.5 shadow-[0_0_20px_rgba(56,222,187,0.25)] hover:shadow-[0_0_30px_rgba(56,222,187,0.45)] transition-all font-display tracking-wide"
            >
              <PlusCircle className="w-4 h-4" strokeWidth={2.5} />
              <span>CREATE PROJECT</span>
            </motion.button>
          </section>

          {/* GRID OF PROJECTS (Animation #1: Staggered Entrance) */}
          <motion.section 
            variants={viewMode === 'grid' ? {
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            } : {}}
            initial="hidden"
            animate="show"
            className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12" : "space-y-4 mb-12"}
          >
            {filteredProjects.map((proj) => {
              const isAccordionOpen = openAccordionId === proj.id;
              
              if (viewMode === 'grid') {
                return (
                  /* 1) Staggered entrance variant */
                  <motion.div 
                    key={proj.id}
                    variants={{
                      hidden: { opacity: 0, y: 25, scale: 0.97 },
                      show: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 120,
                          damping: 18
                        }
                      }
                    }}
                    layoutId={proj.id}
                  >
                    {/* 2) Tilt & Spotlight Card wrapper */}
                    <TiltSpotlightCard className="p-6">
                      
                      {/* Top Metadata Header inside card */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                          proj.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          proj.priority === 'internal' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {proj.tag}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500 font-bold font-display">{proj.code}</span>
                          <div className="flex items-center space-x-1 border border-[#1E293B]/60 bg-[#1e293b]/30 rounded-lg p-0.5">
                            <button 
                              onClick={(e) => handleEditClick(proj, e)}
                              className="p-1.5 text-slate-400 hover:text-[#38debb] rounded-md hover:bg-slate-800 transition-colors"
                              title="Edit Project"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(proj, e)}
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-xl font-bold font-display text-white mb-6 group-hover:text-[#38debb] transition-colors truncate">
                        {proj.name}
                      </h3>

                      {/* 4) Milestone Pulse Chain */}
                      <div className="mb-6 relative">
                        <div className="absolute left-2.5 right-2.5 top-[9px] h-0.5 bg-slate-800/80 z-0" />
                        <div className="flex justify-between items-center relative z-10">
                          {proj.milestones.map((ms, index) => {
                            const isActive = ms.status === 'active';
                            const isCompleted = ms.status === 'completed';

                            return (
                              <div key={index} className="flex flex-col items-center">
                                {/* Pulse Chain Dot */}
                                <div className="relative flex items-center justify-center h-5 w-5">
                                  {isActive ? (
                                    <>
                                      {/* Glowing outward rings */}
                                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#38debb]/30 animate-ping" />
                                      <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-[#38debb]/50 animate-pulse-teal" />
                                      <span className="relative h-2 w-2 rounded-full bg-[#38debb]" />
                                    </>
                                  ) : isCompleted ? (
                                    <span className="h-2 w-2 rounded-full bg-[#38debb]/80 border border-[#38debb]/20 shadow-[0_0_6px_rgba(56,222,187,0.3)]" />
                                  ) : (
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-800 border border-slate-700/80" />
                                  )}
                                </div>
                                <span className={`text-[8px] mt-1.5 font-semibold tracking-wider font-display uppercase ${
                                  isActive ? 'text-[#38debb] font-bold' : 'text-slate-500'
                                }`}>
                                  {ms.name.split(': ')[1] || ms.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Next Milestone Sub-card with 3) Progress Ring Draw */}
                      <div className="flex items-center justify-between bg-[#161A26]/80 border border-slate-800/80 p-4 rounded-xl mb-6">
                        <div className="flex-1 min-w-0 pr-4">
                          <span className="text-[9px] font-bold text-slate-500 font-display tracking-widest block uppercase mb-1">
                            {proj.nextMilestone.statusText}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100 truncate mb-1 leading-snug">
                            {proj.nextMilestone.title}
                          </h4>
                          <span className="flex items-center text-[10px] text-[#00b0ff] font-semibold">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {proj.nextMilestone.dueText}
                          </span>
                        </div>

                        {/* Progress ring drawn in stroke-draw animation */}
                        <div className="shrink-0">
                          <ProgressRing percent={proj.progress} size={64} strokeWidth={5} />
                        </div>
                      </div>

                      {/* Project Footer: Member stack & Activity timestamp */}
                      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/50 pt-4">
                        <div className="flex items-center space-x-1.5">
                          <div className="flex -space-x-2 select-none">
                            {proj.members.map((initial, i) => (
                              <div 
                                key={i} 
                                className="w-6 h-6 rounded-full border border-slate-900 bg-slate-800 text-[10px] font-bold text-white flex items-center justify-center hover:translate-y-[-2px] transition-transform cursor-pointer"
                              >
                                {initial}
                              </div>
                            ))}
                            {proj.memberCount > proj.members.length && (
                              <div className="w-6 h-6 rounded-full border border-slate-900 bg-[#1e293b] text-[9px] font-bold text-slate-300 flex items-center justify-center">
                                +{proj.memberCount - proj.members.length}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 font-display">{proj.lastActive}</span>
                      </div>

                      {/* 5) Accordion expand with spring height */}
                      <TaskAccordion 
                        tasks={proj.tasks}
                        isOpen={isAccordionOpen}
                        onToggle={() => handleToggleAccordion(proj.id)}
                        onToggleTask={(taskId) => handleToggleTaskCompleted(proj.id, taskId)}
                      />
                    </TiltSpotlightCard>
                  </motion.div>
                );
              } else {
                // LIST VIEW IMPLEMENTATION
                return (
                  <motion.div
                    key={proj.id}
                    layoutId={proj.id}
                    className="flex items-center justify-between p-4 bg-[#11141D] border border-slate-800/80 rounded-xl hover:border-slate-700/60 transition-all group"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="shrink-0">
                        <ProgressRing percent={proj.progress} size={48} strokeWidth={4} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2.5">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#38debb] transition-colors truncate">
                            {proj.name}
                          </h4>
                          <span className="text-[9px] text-slate-500 font-bold">{proj.code}</span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold border ${
                            proj.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            proj.priority === 'internal' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {proj.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          Next: <span className="font-semibold text-slate-300">{proj.nextMilestone.title}</span> • {proj.nextMilestone.dueText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-300 font-bold">{proj.sprintStatus}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{proj.lastActive}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={(e) => handleEditClick(proj, e)}
                          className="p-2 text-slate-400 hover:text-[#38debb] hover:bg-slate-800 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(proj, e)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            })}

            {filteredProjects.length === 0 && (
              <div className="col-span-full border border-dashed border-slate-800/80 rounded-2xl p-12 text-center bg-[#11141D]/30">
                <Layers className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No active projects found matching "{searchQuery}"</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="text-[#38debb] text-xs font-bold hover:underline mt-2 inline-block"
                >
                  Create a new project now
                </button>
              </div>
            )}
          </motion.section>

          {/* LIVE ACTIVITY FEED HEADER */}
          <section className="mt-8 border-t border-[#1E293B]/60 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38debb] animate-pulse-teal inline-block" />
                <span>Live Activity Feed</span>
              </h2>
              <button className="text-xs font-bold text-[#38debb] hover:text-[#38debb]/80 hover:underline flex items-center space-x-1.5 transition-all">
                <span>VIEW ALL LOGS</span>
                <span className="text-sm font-semibold">→</span>
              </button>
            </div>

            {/* 6) Live Timeline slide-in container */}
            <motion.div 
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
              initial="hidden"
              animate="show"
              className="space-y-4 relative pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800/80"
            >
              {activities.map((act) => (
                /* Slide-in item with blur animation */
                <motion.div
                  key={act.id}
                  variants={{
                    hidden: { opacity: 0, x: 80, filter: "blur(6px)" },
                    show: { 
                      opacity: 1, 
                      x: 0, 
                      filter: "blur(0px)",
                      transition: {
                        type: "spring",
                        stiffness: 85,
                        damping: 14
                      }
                    }
                  }}
                  className="relative group"
                >
                  {/* Timeline icon node */}
                  <div className="absolute left-[-32px] top-4 w-7 h-7 rounded-full bg-[#11141D] border border-slate-800 flex items-center justify-center z-10 text-xs">
                    {act.type === 'system' ? (
                      <Cloud className="w-3.5 h-3.5 text-[#38debb]" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#00b0ff]" />
                    )}
                  </div>

                  {/* Activity box */}
                  <div className="bg-[#11141D]/60 border border-slate-800/80 hover:border-slate-700/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#1E293B]/20 transition-all">
                    <div className="text-xs text-slate-300 leading-relaxed min-w-0 flex-1">
                      {act.type === 'user' && (
                        <span className="inline-flex items-center mr-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[8px] font-bold text-[#38debb] border border-slate-700 flex items-center justify-center mr-1.5 uppercase">{act.userAvatar}</span>
                          <strong className="text-white font-bold">{act.userName}</strong>
                        </span>
                      )}
                      {act.type === 'system' && (
                        <strong className="text-[#38debb] mr-1.5">System</strong>
                      )}
                      <span>{act.message}</span>
                      <strong className="text-[#38debb]">{act.highlightProject}</strong>.
                      <span className="block text-[10px] text-slate-500 mt-1 font-medium">{act.meta}</span>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      {/* Micro pulse dot for live items */}
                      {act.time === 'JUST NOW' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38debb] animate-pulse-teal" />
                      )}
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-800/40 border border-slate-800/80 px-2 py-0.5 rounded font-display tracking-wide uppercase">
                        {act.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────
         8. CREATE PROJECT MODAL (Soft Scale-in + Backdrop blur)
         ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 25 }}
              className="relative w-full max-w-lg overflow-hidden border border-slate-800/80 rounded-2xl bg-[#11141D] text-white shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-lg font-bold font-display text-white">Create New Project</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. Hyperion Storage Layer"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Priority</label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="high">High Priority</option>
                      <option value="internal">Internal</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Active Sprint</label>
                    <input
                      type="text"
                      value={newProject.sprintStatus}
                      onChange={(e) => setNewProject({ ...newProject, sprintStatus: e.target.value })}
                      placeholder="e.g. Sprint 01"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Next Milestone Title</label>
                    <input
                      type="text"
                      required
                      value={newProject.nextMilestoneTitle}
                      onChange={(e) => setNewProject({ ...newProject, nextMilestoneTitle: e.target.value })}
                      placeholder="e.g. API Gateway Integration"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Milestone Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newProject.progress}
                      onChange={(e) => setNewProject({ ...newProject, progress: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Next Milestone Label</label>
                    <select
                      value={newProject.nextMilestoneStatus}
                      onChange={(e) => setNewProject({ ...newProject, nextMilestoneStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="NEXT MILESTONE">NEXT MILESTONE</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Due date text</label>
                    <input
                      type="text"
                      value={newProject.nextMilestoneDue}
                      onChange={(e) => setNewProject({ ...newProject, nextMilestoneDue: e.target.value })}
                      placeholder="e.g. Due in 5 days"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Roadmap Active Phase</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].map((ph, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setNewProject({ ...newProject, activePhaseIndex: idx })}
                        className={`py-2 text-[10px] font-bold border rounded-lg transition-all ${
                          newProject.activePhaseIndex === idx 
                            ? 'bg-[#38debb]/10 border-[#38debb] text-[#38debb]' 
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Initial tasks (One per line)</label>
                  <textarea
                    rows="3"
                    value={newProject.tasksText}
                    onChange={(e) => setNewProject({ ...newProject, tasksText: e.target.value })}
                    placeholder="Implement auth logic&#10;Write unit tests"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/40 hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-semibold text-[#05070A] bg-[#38debb] hover:bg-[#38debb]/90 rounded-lg transition-all shadow-lg shadow-teal-500/20"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────
         EDIT PROJECT MODAL (Soft Scale-in + Backdrop blur)
         ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && editProjectData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 25 }}
              className="relative w-full max-w-lg overflow-hidden border border-slate-800/80 rounded-2xl bg-[#11141D] text-white shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-lg font-bold font-display text-white">Edit Project Details</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editProjectData.name}
                    onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Priority</label>
                    <select
                      value={editProjectData.priority}
                      onChange={(e) => setEditProjectData({ ...editProjectData, priority: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="high">High Priority</option>
                      <option value="internal">Internal</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Active Sprint</label>
                    <input
                      type="text"
                      value={editProjectData.sprintStatus}
                      onChange={(e) => setEditProjectData({ ...editProjectData, sprintStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Next Milestone Title</label>
                    <input
                      type="text"
                      required
                      value={editProjectData.nextMilestoneTitle}
                      onChange={(e) => setEditProjectData({ ...editProjectData, nextMilestoneTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editProjectData.progress}
                      onChange={(e) => setEditProjectData({ ...editProjectData, progress: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Next Milestone Label</label>
                    <select
                      value={editProjectData.nextMilestoneStatus}
                      onChange={(e) => setEditProjectData({ ...editProjectData, nextMilestoneStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="NEXT MILESTONE">NEXT MILESTONE</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Due date text</label>
                    <input
                      type="text"
                      value={editProjectData.nextMilestoneDue}
                      onChange={(e) => setEditProjectData({ ...editProjectData, nextMilestoneDue: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Roadmap Active Phase</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].map((ph, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setEditProjectData({ ...editProjectData, activePhaseIndex: idx })}
                        className={`py-2 text-[10px] font-bold border rounded-lg transition-all ${
                          editProjectData.activePhaseIndex === idx 
                            ? 'bg-[#38debb]/10 border-[#38debb] text-[#38debb]' 
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Project tasks (One per line)</label>
                  <textarea
                    rows="3"
                    value={editProjectData.tasksText}
                    onChange={(e) => setEditProjectData({ ...editProjectData, tasksText: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-[#38debb]/50 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:ring-0 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/40 hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-semibold text-[#05070A] bg-[#38debb] hover:bg-[#38debb]/90 rounded-lg transition-all shadow-lg shadow-teal-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────
         DELETE MODAL (Animation #8: Scale-in + Backdrop blur)
         ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md overflow-hidden border border-slate-800/80 rounded-2xl bg-[#11141D] text-white shadow-2xl p-6"
            >
              <h3 className="text-base font-bold font-display text-slate-100 flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span>Delete Project Permanently</span>
              </h3>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete project <strong className="text-white font-semibold">{activeProject.name}</strong> ({activeProject.code})? 
                This action is irreversible. The project's milestones, tasks, and repository attachments will be permanently scrubbed.
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/40 hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all shadow-lg shadow-red-500/20"
                >
                  Delete Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
