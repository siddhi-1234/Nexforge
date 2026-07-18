import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Activity,
  GitCommit,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Zap,
  Award,
  Flame,
  BarChart3,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import nexforgeLogo from "./logo.png";
import socket from "../socket/socket";
import "./dashboard.css";
import "./TeamActivity.css";

/* ─────────────────────────────────────
   COUNT-UP ANIMATION
   ───────────────────────────────────── */
function CountUp({ target, duration = 1200 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      setValue(Math.ceil(easeOutExpo * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <>{value.toLocaleString()}</>;
}

/* ────────────────────────────────────────────────────────
   PULSING STATUS DOT (Live pulsing status for online members)
   ──────────────────────────────────────────────────────── */
function PulsingDot({ isOnline }) {
  return (
    <div className={`pulsing-dot ${isOnline ? "online" : "offline"}`}>
      <div className="dot-inner" />
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN TEAM ACTIVITY PAGE
   ───────────────────────────────────── */
const TeamActivity = () => {
  const user = useMemo(() => {
    const userStr = localStorage.getItem("user");
    const defaultUser = {
      name: "Developer",
      email: "dev@nexforge.io",
      role: "student",
      firebaseUid: "dev123",
    };
    return userStr ? JSON.parse(userStr) : defaultUser;
  }, []);

  const userInitials = useMemo(() => {
    return user.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "SD";
  }, [user]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState({});

  const toggleProject = (id) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* Sample Data */
  const stats = [
    { label: "Team Members", value: 24, icon: Users },
    { label: "Online Now", value: 12, icon: Activity },
    { label: "Active Projects", value: 8, icon: BarChart3 },
    { label: "Commits Today", value: 142, icon: GitCommit },
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Kumar",
      role: "Lead Dev",
      online: true,
      avatar: "SK",
    },
    { id: 2, name: "Alex Mercer", role: "Backend", online: true, avatar: "AM" },
    {
      id: 3,
      name: "Julian Vane",
      role: "UI Designer",
      online: false,
      avatar: "JV",
    },
    {
      id: 4,
      name: "Maya Patel",
      role: "QA Engineer",
      online: true,
      avatar: "MP",
    },
  ];

  const topContributors = [
    { rank: 1, name: "Sarah Kumar", commits: 287, avatar: "SK", flame: true },
    { rank: 2, name: "Alex Mercer", commits: 256, avatar: "AM", flame: true },
    { rank: 3, name: "Maya Patel", commits: 189, avatar: "MP", flame: false },
  ];

  const projectStreams = [
    {
      id: 1,
      name: "NeuralNexus Redesign",
      status: "In Progress",
      progress: 65,
      activities: [
        {
          author: "Sarah K.",
          message: "Pushed vector mesh shader logic",
          time: "2m ago",
        },
        {
          author: "Alex M.",
          message: "Fixed memory leak in worker thread",
          time: "15m ago",
        },
      ],
    },
    {
      id: 2,
      name: "Quantum CRM",
      status: "Review",
      progress: 85,
      activities: [
        {
          author: "Julian V.",
          message: "Redesigned dashboard theme engine",
          time: "45m ago",
        },
      ],
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Background Glows */}
      <div className="dash-bg-glow dash-bg-glow-1" />
      <div className="dash-bg-glow dash-bg-glow-2" />
      <div className="dash-bg-glow dash-bg-glow-3" />

      <div className="dash-layout">
        {/* ────── SIDEBAR ────── */}
        <motion.aside
          className={`dash-sidebar ${isSidebarOpen ? "open" : ""}`}
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="dash-sidebar-header">
            <div className="dash-logo">
              <img
                src={nexforgeLogo}
                alt="NexForge"
                className="dash-logo-img"
              />
              <div>
                <h1>NEXFORGE</h1>
                <p>Team Command</p>
              </div>
            </div>
            <button
              className="dash-sidebar-close"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="dash-nav">
            <NavLink icon={Activity} label="Overview" to="/dashboard/student" />
            <NavLink
              icon={GitCommit}
              label="Activity"
              to="/dashboard/team-activity"
              active
            />
            <NavLink
              icon={BarChart3}
              label="Analytics"
              to="/dashboard/projects"
            />
            <NavLink icon={Users} label="Team" to="/dashboard/projects" />
          </nav>

          <div className="dash-nav-bottom">
            <NavLink icon={MessageSquare} label="Support" />
            <NavLink icon={X} label="Logout" />
          </div>
        </motion.aside>

        {/* ────── MAIN CONTENT ────── */}
        <main className="dash-main" style={{ marginLeft: "250px" }}>
          {/* Top Header */}
          <header className="dash-header">
            <button
              className="dash-menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h1>Team Activity</h1>
            <div className="dash-header-right">
              <button className="dash-btn-icon">
                <Zap size={18} />
              </button>
              <div className="dash-user-avatar">{userInitials}</div>
            </div>
          </header>

          <div className="dash-content">
            {/* ────── STATS ROW ────── */}
            <motion.div
              className="team-stats-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    className="dash-card stat-card-team"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="stat-header">
                      <Icon size={20} className="stat-icon" />
                      <span className="stat-label">{stat.label}</span>
                    </div>
                    <div className="stat-value-large">
                      <CountUp target={stat.value} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ────── MAIN GRID ────── */}
            <div className="team-grid">
              {/* Team Members */}
              <motion.div
                className="dash-card team-members-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="card-header">
                  <h2>Team Members</h2>
                  <span className="member-badge">{teamMembers.length}</span>
                </div>
                <div className="members-grid">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="member-item">
                      <div className="member-avatar-large">
                        {member.avatar}
                        <PulsingDot isOnline={member.online} />
                      </div>
                      <div className="member-details">
                        <p className="member-name">{member.name}</p>
                        <p className="member-role">{member.role}</p>
                      </div>
                      <div
                        className={`status-badge ${member.online ? "online" : "offline"}`}
                      >
                        {member.online ? "Online" : "Offline"}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Contributors */}
              <motion.div
                className="dash-card top-contributors-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="card-header">
                  <h2>Top Contributors</h2>
                  <Award size={18} />
                </div>
                <div className="contributors-list">
                  {topContributors.map((contrib) => (
                    <div key={contrib.rank} className="contributor-item">
                      <div className="contributor-rank">
                        {contrib.rank}
                        {contrib.flame && (
                          <Flame size={12} className="flame-icon" />
                        )}
                      </div>
                      <span className="contributor-name">{contrib.name}</span>
                      <span className="contributor-commits">
                        <CountUp target={contrib.commits} duration={1500} />
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ────── PROJECT STREAMS ────── */}
            <motion.div
              className="dash-card project-streams-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="card-header">
                <h2>Project Streams</h2>
              </div>
              <div className="streams-list">
                {projectStreams.map((project) => (
                  <div key={project.id} className="stream-item">
                    <button
                      className="stream-header"
                      onClick={() => toggleProject(project.id)}
                    >
                      <div className="stream-info">
                        <h3>{project.name}</h3>
                        <div className="stream-meta">
                          <span className="status-badge">{project.status}</span>
                          <div className="progress-bar-mini">
                            <div
                              className="progress-fill"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="progress-text">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                      <motion.div
                        animate={{
                          rotate: expandedProjects[project.id] ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    {/* Expand Activity */}
                    <AnimatePresence>
                      {expandedProjects[project.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 22,
                          }}
                          className="stream-activities"
                        >
                          {project.activities.map((activity, idx) => (
                            <motion.div
                              key={idx}
                              className="activity-item"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <div className="activity-marker" />
                              <div className="activity-content">
                                <p className="activity-author">
                                  {activity.author}
                                </p>
                                <p className="activity-message">
                                  {activity.message}
                                </p>
                                <span className="activity-time">
                                  {activity.time}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ────── PULSE PANEL (Right Side) ────── */}
            <motion.div
              className="pulse-panel"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="pulse-card">
                <h3>Pulse</h3>
                <p className="pulse-subtitle">Live team updates</p>
                <div className="pulse-members">
                  {teamMembers.slice(0, 3).map((m) => (
                    <div key={m.id} className="pulse-member">
                      <div className="pulse-avatar">{m.avatar}</div>
                      <div>
                        <p className="pulse-name">{m.name}</p>
                        <p className="pulse-role">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pulse-card insights-card">
                <h3>AI Insights</h3>
                <div className="insight-item">
                  <span className="insight-icon">⚠️</span>
                  <p>Build success rate at 95%</p>
                </div>
                <div className="insight-item">
                  <span className="insight-icon">✅</span>
                  <p>Code quality improved 12%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   NAV LINK COMPONENT
   ───────────────────────────────────── */
function NavLink({ icon: Icon, label, to, active, onClick }) {
  const content = (
    <>
      <Icon size={18} />
      <span>{label}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`dash-nav-link ${active ? "active" : ""}`}>
        {content}
      </Link>
    );
  }

  return (
    <button className="dash-nav-link" onClick={onClick}>
      {content}
    </button>
  );
}

export default TeamActivity;
