import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  ChevronDown,
  MessageCircle,
  ArrowRight,
  X,
  Play,
  Share2,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import nexforgeLogo from "./logo.png";
import socket from "../socket/socket";
import "./TeamActivity.css";
import "./dashboard.css";

/* ────────────────────────────────────────────────────────
   ANIMATED UTILITIES & REUSABLE SUB-COMPONENTS
   ──────────────────────────────────────────────────────── */
function CountUp({ target, duration = 1000 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setValue(Math.ceil(easeOutQuad * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return <>{value.toLocaleString()}</>;
}

function SpotlightHoverCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`spotlight-hover-card ${className}`}
    >
      {isHovered && (
        <div
          className="spotlight-overlay"
          style={{
            background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(56, 222, 187, 0.08), transparent 85%)`,
          }}
        />
      )}
      <div className="card-content-inner">{children}</div>
    </div>
  );
}

function RevealWrapper({ children, delay = "0s", className = "" }) {
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.02 },
    );
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`spring-reveal-node ${visible ? "revealed" : ""} ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN TEAM ACTIVITY CONTROLLER
   ──────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:5000";

function mapPresenceToMember(presence) {
  return {
    name: presence.name,
    email: presence.email,
    role: presence.role,
    avatar: presence.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    task: presence.task,
    active: presence.active,
  };
}

const TeamActivity = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatGroupOpen, setChatGroupOpen] = useState(true);
  const [projectExpanded, setProjectExpanded] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isEditingSelfTask, setIsEditingSelfTask] = useState(false);
  const [chartFilter, setChartFilter] = useState("7D");
  const [velocityData, setVelocityData] = useState({
    "7D": [0, 0, 0, 0, 0, 0, 0],
    "24H": [0, 0, 0, 0, 0, 0],
  });
  const [metrics, setMetrics] = useState({
    teamMembers: 0,
    onlineNow: 0,
    activeProjects: 0,
    commitsToday: 0,
  });

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("join-presence", {
      name: user.name,
      email: user.email,
      role: user.role,
    });

    socket.on("presence-list", (list) => {
      setTeamMembers(list.map(mapPresenceToMember));
    });

    socket.on("presence-update", (update) => {
      setTeamMembers((prev) =>
        prev.map((member) => {
          if (member.email.toLowerCase() === update.email.toLowerCase()) {
            return {
              ...member,
              task: update.task,
              active: update.active,
            };
          }
          return member;
        }),
      );
    });

    return () => {
      socket.off("presence-list");
      socket.off("presence-update");
    };
  }, [user]);

  useEffect(() => {
    const refreshMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/projects/metrics`);
        const data = await response.json();
        if (data?.metrics) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error("Failed to load team activity metrics:", error);
      }
    };

    const refreshVelocity = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/projects/velocity`);
        const data = await response.json();
        if (data?.velocity) {
          setVelocityData(data.velocity);
        }
      } catch (error) {
        console.error("Failed to load velocity data:", error);
      }
    };

    const refreshTeamData = () => {
      refreshMetrics();
      refreshVelocity();
    };

    refreshTeamData();

    socket.on("metrics-update", ({ metrics: liveMetrics }) => {
      if (liveMetrics) setMetrics(liveMetrics);
    });
    socket.on("velocity-update", ({ velocity }) => {
      if (velocity) setVelocityData(velocity);
    });

    const handleProjectChange = () => refreshTeamData();
    socket.on("project-created", handleProjectChange);
    socket.on("project-updated", handleProjectChange);
    socket.on("project-deleted", handleProjectChange);
    socket.on("sprint-changed", handleProjectChange);

    return () => {
      socket.off("metrics-update");
      socket.off("velocity-update");
      socket.off("project-created", handleProjectChange);
      socket.off("project-updated", handleProjectChange);
      socket.off("project-deleted", handleProjectChange);
      socket.off("sprint-changed", handleProjectChange);
    };
  }, []);

  return (
    <div className="dashboard-page">
      {/* Background Layer Wells */}
      <div className="dash-bg-glow dash-bg-glow-1" />
      <div className="dash-bg-glow dash-bg-glow-2" />
      <div className="dash-bg-glow dash-bg-glow-3" />

      <div className="dash-layout">
        {isSidebarOpen && (
          <div
            className="dash-sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR FRAMEWORK ── */}
        <aside
          className={`dash-sidebar ${isSidebarOpen ? "dash-sidebar-open" : ""}`}
        >
          <div className="dash-sidebar-header">
            <div className="dash-logo">
              <img
                src={nexforgeLogo}
                alt="NexForge"
                className="dash-logo-img"
              />
              <h1 className="neon-text-teal">NexForge</h1>
            </div>
            <button
              className="dash-sidebar-close"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <nav className="dash-nav">
            {[
              { icon: "🧭", label: "Dashboard", path: "/dashboard/student" },
              { icon: "🚀", label: "My Projects", path: "/dashboard/projects" },
              {
                icon: "🌐",
                label: "Team Activity",
                path: "/dashboard/team-activity",
                active: true,
              },
              { icon: "⚡", label: "Recommendations", path: "#/" },
              { icon: "🎓", label: "Skills", path: "#/" },
              { icon: "💻", label: "Internship Prep", path: "#/" },
            ].map((item, index) => (
              <Link
                key={item.label}
                to={item.path}
                className={`dash-nav-item ${item.active ? "dash-nav-active" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="dash-nav-icon floating-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="dash-nav-bottom">
            <a href="#/" className="dash-nav-item">
              <span className="dash-nav-icon">⚙️</span>
              <span>Settings</span>
            </a>
            <div className="dash-sidebar-user">
              <div className="dash-sidebar-avatar">{userInitials}</div>
              <div className="dash-sidebar-user-info">
                <span className="dash-sidebar-user-name">{user.name}</span>
                <span className="dash-sidebar-user-role">{user.role}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <main className="dash-main">
          <header className="dash-topbar glassmorphism">
            <div className="dash-topbar-left">
              <button
                className="dash-menu-btn"
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰
              </button>
            </div>

            <div className="dash-topbar-right">
              <button className="dash-icon-btn">
                <Bell size={16} />
                <span className="dash-notif-dot" />
              </button>
              <div className="dash-avatar">{userInitials}</div>
            </div>
          </header>

          {/* Dashboard Contents Grid Layout */}
          <div className="dash-content activity-dashboard-matrix">
            {/* ── LEFT & CENTER SYSTEM COLUMN (66% Width) ── */}
            <div className="matrix-primary-space">
              {/* Analytics Counter Row */}
              <RevealWrapper
                id="counters"
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="dash-card metric-counter-tile">
                  <span className="tile-label">Team Members</span>
                  <h2 className="tile-metric">
                    <CountUp target={metrics.teamMembers} />
                  </h2>
                  <span className="tile-delta text-emerald-400">
                    ↗ +2 this week
                  </span>
                </div>
                <div className="dash-card metric-counter-tile">
                  <span className="tile-label">Online Now</span>
                  <h2 className="tile-metric flex items-center gap-2">
                    <CountUp target={metrics.onlineNow} />
                    <span className="live-pulsing-dot-teal shrink-0" />
                  </h2>
                  <span className="tile-delta text-slate-500">
                    {metrics.teamMembers > 0
                      ? Math.round(
                          (metrics.onlineNow / metrics.teamMembers) * 100,
                        )
                      : 0}
                    % capacity active
                  </span>
                </div>
                <div className="dash-card metric-counter-tile">
                  <span className="tile-label">Active Projects</span>
                  <h2 className="tile-metric">
                    <CountUp target={metrics.activeProjects} />
                  </h2>
                  <span className="tile-delta text-amber-400">
                    ⏱ 2 awaiting review
                  </span>
                </div>
                <div className="dash-card metric-counter-tile">
                  <span className="tile-label">Commits Today</span>
                  <h2 className="tile-metric text-[#38debb]">
                    <CountUp target={metrics.commitsToday} />
                  </h2>
                  <span className="tile-delta text-[#38debb]">
                    ⚡ Peak velocity reached
                  </span>
                </div>
              </RevealWrapper>

              {/* Center Analytics Chart Block */}
              <RevealWrapper id="chart" delay="0.04s">
                <SpotlightHoverCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="section-title-outfit flex items-center gap-2">
                      Velocity Trends
                    </h3>
                    <div className="chart-filter-toggle-pills">
                      <button
                        className={`pill-toggle ${chartFilter === "24H" ? "pill-toggle-active" : ""}`}
                        onClick={() => setChartFilter("24H")}
                      >
                        24H
                      </button>
                      <button
                        className={`pill-toggle ${chartFilter === "7D" ? "pill-toggle-active" : ""}`}
                        onClick={() => setChartFilter("7D")}
                      >
                        7D
                      </button>
                    </div>
                  </div>
                  {/* SVG Layout Architecture Vector Graph */}
                  <div className="chart-rendering-canvas flex items-end justify-between pt-4 h-48">
                    {velocityData[chartFilter].map((val, idx) => {
                      let isHighlighted = false;
                      let label = "";

                      if (chartFilter === "7D") {
                        const todayIdx = (new Date().getDay() + 6) % 7;
                        isHighlighted = idx === todayIdx;
                        label = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx];
                      } else {
                        const hourSlotIdx = Math.floor(new Date().getHours() / 4);
                        isHighlighted = idx === hourSlotIdx;
                        label = ["12am", "4am", "8am", "12pm", "4pm", "8pm"][idx];
                      }

                      return (
                        <div
                          key={idx}
                          className="chart-vertical-axis-bar-wrapper flex flex-col items-center flex-1 group"
                        >
                          <div
                            className={`chart-bar-drawn ${isHighlighted ? "highlighted-bar" : ""}`}
                            style={{ "--target-h": `${val}%` }}
                          />
                          <span className="chart-axis-label-font mt-2 text-[10px] text-slate-600 uppercase font-bold">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </SpotlightHoverCard>
              </RevealWrapper>

              {/* Expandable Project Activity Container */}
              <RevealWrapper
                id="streams"
                delay="0.08s"
                className="flex flex-col gap-4"
              >
                <h3 className="section-title-outfit flex items-center justify-between">
                  <span>Project Streams</span>
                  <span className="text-xs text-slate-500 font-normal normal-case font-sans">
                    Updated 2m ago
                  </span>
                </h3>

                <div className="dash-card tracking-stream-block">
                  <div
                    className="stream-summary-toggle-row flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.01]"
                    onClick={() => setProjectExpanded(!projectExpanded)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="stream-badge-avatar bg-emerald-500/10 text-emerald-400 font-sans">
                        🟢
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          NeuralNexus Redesign
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          3 PRs Open • 8 Tasks Remaining
                        </p>
                      </div>
                    </div>
                    <div
                      className={`transition-transform duration-300 ${projectExpanded ? "rotate-180" : ""}`}
                    >
                      <ChevronDown size={16} className="text-slate-400" />
                    </div>
                  </div>

                  {/* Expandable Sub-Section Accordion Drawer */}
                  <div
                    className={`stream-accordion-drawer-expandable ${projectExpanded ? "drawer-open" : ""}`}
                  >
                    <div className="p-5 pt-0 border-t border-white/[0.03] space-y-2.5 mt-4">
                      <div className="commit-shimmer-card flex items-center justify-between p-3 rounded-xl bg-black/20 text-xs border border-white/[0.02]">
                        <span className="text-slate-300 font-medium">
                          feat: Implement vector mesh shader logic
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-[#38debb]">
                          #402 merged
                        </span>
                      </div>
                      <div className="commit-shimmer-card flex items-center justify-between p-3 rounded-xl bg-black/20 text-xs border border-white/[0.02]">
                        <span className="text-slate-300 font-medium">
                          fix: Memory leak in worker thread
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400">
                          Critical
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dash-card tracking-stream-block p-5 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="stream-badge-avatar bg-blue-500/10 text-blue-400 font-sans">
                      🔷
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Quantum CRM
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        0 PRs Open • 14 Tasks Remaining
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-500" />
                </div>
              </RevealWrapper>

              {/* Kanban Grid Layout Wrapper */}
              <RevealWrapper
                id="kanban"
                delay="0.12s"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
              >
                <div className="kanban-column-wrapper">
                  <span className="kanban-column-indicator text-slate-500">
                    To Do [4]
                  </span>
                  <div className="dash-card kanban-board-item mt-3 p-4">
                    <h5 className="font-bold text-xs text-white">
                      Auth Module Refactor
                    </h5>
                    <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5">
                        v2.0.1
                      </span>
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    </div>
                  </div>
                </div>
                <div className="kanban-column-wrapper">
                  <span className="kanban-column-indicator text-emerald-400">
                    In Progress [2]
                  </span>
                  <div className="dash-card kanban-board-item item-active-glow mt-3 p-4">
                    <h5 className="font-bold text-xs text-white">
                      API Documentation
                    </h5>
                    <div className="flex items-center justify-between mt-4 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/5 text-[#38debb] border border-emerald-500/10">
                        Docs
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#38debb] animate-pulse-teal" />
                    </div>
                  </div>
                </div>
                <div className="kanban-column-wrapper">
                  <span className="kanban-column-indicator text-blue-400">
                    Review [5]
                  </span>
                  <div className="dash-card kanban-board-item mt-3 p-4">
                    <h5 className="font-bold text-xs text-white">
                      Theme Engine UI
                    </h5>
                    <div className="flex items-center justify-between mt-4 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10">
                        Style
                      </span>
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                  </div>
                </div>
                <div className="kanban-column-wrapper">
                  <span className="kanban-column-indicator text-slate-500">
                    Done [12]
                  </span>
                  <div className="dash-card kanban-board-item opacity-50 mt-3 p-4">
                    <h5 className="font-bold text-xs text-white line-through">
                      Landing Page Fix
                    </h5>
                    <div className="flex items-center justify-between mt-4 text-[10px] text-slate-600">
                      <span>Completed</span>
                      <CheckCircle size={10} />
                    </div>
                  </div>
                </div>
              </RevealWrapper>

              {/* Recent Code Streams */}
              <RevealWrapper
                id="code-streams"
                delay="0.16s"
                className="flex flex-col gap-3"
              >
                <h3 className="section-title-outfit">Recent Code Streams</h3>
                <div className="dash-card p-4 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-[9px] font-bold text-slate-300 flex items-center justify-center border border-white/5">
                        AL
                      </div>
                      <p className="text-slate-400">
                        <strong className="text-white font-bold">
                          Alex L.
                        </strong>{" "}
                        pushed to main
                      </p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">
                      +412 -12
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-white/[0.03] pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-[9px] font-bold text-slate-300 flex items-center justify-center border border-white/5">
                        SK
                      </div>
                      <p className="text-slate-400">
                        <strong className="text-white font-bold">
                          Sarah K.
                        </strong>{" "}
                        merged hotfix/prod-leak
                      </p>
                    </div>
                    <span className="text-red-400 font-mono font-bold">
                      +5 -92
                    </span>
                  </div>
                </div>
              </RevealWrapper>
            </div>

            {/* ── RIGHT DOCK COMPLEMENTARY COLUMN (33% Width) ── */}
            <div className="matrix-complementary-space">
              {/* Pulse State User Index */}
              <RevealWrapper
                id="pulse"
                delay="0.04s"
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="section-title-outfit">Pulse</h4>
                  <span className="text-[10px] font-bold text-[#38debb] bg-[#38debb]/10 border border-[#38debb]/15 px-2 py-0.5 rounded">
                    {metrics.onlineNow} ONLINE
                  </span>
                </div>
                <div className="dash-card p-4 space-y-3.5">
                  {teamMembers.map((member, idx) => {
                    const isSelf = member.email.toLowerCase() === user?.email?.toLowerCase();
                    return (
                      <div
                        key={member.email}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                              {member.avatar}
                            </div>
                            <span
                              className={
                                member.active
                                  ? "live-pulsing-dot-teal-corner"
                                  : "status-dot-away-corner"
                              }
                            />
                          </div>
                          <div>
                            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                              {member.name}
                              {isSelf && (
                                <span className="text-[9px] font-bold text-[#38debb] bg-[#38debb]/10 px-1 py-0.2 rounded font-sans uppercase shrink-0">
                                  You
                                </span>
                              )}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              {isSelf && isEditingSelfTask ? (
                                <input
                                  type="text"
                                  defaultValue={member.task}
                                  className="bg-black/40 border border-[#38debb]/30 rounded px-1.5 py-0.5 text-white text-[10px] outline-none w-32"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const val = e.target.value.trim();
                                      if (val) {
                                        socket.emit("update-task-status", { email: member.email, task: val });
                                      }
                                      setIsEditingSelfTask(false);
                                    } else if (e.key === "Escape") {
                                      setIsEditingSelfTask(false);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const val = e.target.value.trim();
                                    if (val) {
                                      socket.emit("update-task-status", { email: member.email, task: val });
                                    }
                                    setIsEditingSelfTask(false);
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <>
                                  {member.task}
                                  {isSelf && (
                                    <span
                                      className="text-[9px] text-[#38debb] hover:underline cursor-pointer font-semibold uppercase"
                                      onClick={() => setIsEditingSelfTask(true)}
                                    >
                                      (Change)
                                    </span>
                                  )}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <MessageCircle
                          size={12}
                          className="text-slate-600 hover:text-[#38debb] cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </RevealWrapper>

              {/* Command System Logs Exception Banner */}
              <RevealWrapper id="insights" delay="0.08s">
                <h4 className="section-title-outfit mb-3">
                  AI Command Insights
                </h4>
                <div className="dash-card p-4 border border-red-500/15 bg-gradient-to-br from-red-500/[0.01] to-transparent">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-red-400">
                    <span>Bottleneck Warning</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Resource exhaustion threshold imminent on cluster node core
                    arrays. Pipeline acceleration protocols advised.
                  </p>
                </div>
              </RevealWrapper>

              {/* Mission Controller Dropdown Chat Box */}
              <RevealWrapper id="chat-frame" delay="0.12s">
                <div className="dash-card chat-module-card">
                  <div
                    className="chat-header-bar flex items-center justify-between p-4 bg-white/[0.01] border-b border-white/[0.03] cursor-pointer"
                    onClick={() => setChatGroupOpen(!chatGroupOpen)}
                  >
                    <span className="text-xs font-bold text-[#38debb] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38debb] animate-pulse" />
                      MISSION CHAT
                    </span>
                    <div
                      className={`transition-transform duration-200 ${chatGroupOpen ? "" : "rotate-180"}`}
                    >
                      <ChevronDown size={14} className="text-slate-500" />
                    </div>
                  </div>

                  <div
                    className={`chat-messages-container-accordion ${chatGroupOpen ? "drawer-open" : ""}`}
                  >
                    <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                      <div className="chat-bubble-row">
                        <span className="text-[10px] font-bold text-blue-400">
                          Alex
                        </span>
                        <p className="text-[11px] bg-white/[0.02] border border-white/5 p-2 rounded-xl text-slate-300 mt-1">
                          Pushed the latest mesh shader updates. Please review
                          @Sarah
                        </p>
                      </div>
                      <div className="chat-bubble-row text-right">
                        <span className="text-[10px] font-bold text-[#38debb]">
                          Sarah
                        </span>
                        <p className="text-[11px] bg-[#38debb]/5 border border-[#38debb]/10 p-2 rounded-xl text-[#38debb] mt-1 inline-block text-left">
                          On it. Looks solid from the diffs.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 border-t border-white/[0.03]">
                      <input
                        type="text"
                        placeholder="Transmit message..."
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-300 placeholder-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </RevealWrapper>

              {/* Staggered Document List Stack */}
              <RevealWrapper
                id="timeline-stack"
                delay="0.16s"
                className="space-y-3"
              >
                {[
                  {
                    title: "Deployment Success",
                    meta: "Prod-V4 is now live on Cluster-7",
                    time: "Just Now",
                  },
                  {
                    title: "New Design Comment",
                    meta: "Julian: 'The mesh glow looks perfect'",
                    time: "4m ago",
                  },
                  {
                    title: "Documentation Updated",
                    meta: "Alex updated API Endpoints v2.0",
                    time: "1h ago",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="dash-card timeline-slide-row p-4 border-l-2 border-l-[#38debb]"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="font-bold text-xs text-white">
                        {item.title}
                      </h5>
                      <span className="text-[9px] text-slate-600 font-bold uppercase">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      {item.meta}
                    </p>
                  </div>
                ))}
              </RevealWrapper>

              {/* Core Shared Attachments */}
              <RevealWrapper id="shared-core" delay="0.2s">
                <h4 className="section-title-outfit mb-3">Shared Core</h4>
                <div className="dash-card p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">📄</span>
                      <div>
                        <p className="font-bold text-slate-300">
                          brand_guide_v2.pdf
                        </p>
                        <span className="text-[10px] text-slate-500">
                          2.4 MB • 2h ago
                        </span>
                      </div>
                    </div>
                    <Share2
                      size={12}
                      className="text-slate-500 hover:text-white cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-white/[0.03] pt-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">🎨</span>
                      <div>
                        <p className="font-bold text-slate-300">
                          hero_render_dark.png
                        </p>
                        <span className="text-[10px] text-slate-500">
                          12.1 MB • 5h ago
                        </span>
                      </div>
                    </div>
                    <Share2
                      size={12}
                      className="text-slate-500 hover:text-white cursor-pointer"
                    />
                  </div>
                </div>
              </RevealWrapper>

              {/* Meet Scheduling Link Drawer */}
              <RevealWrapper id="syncs" delay="0.24s">
                <div className="dash-card p-4 bg-gradient-to-br from-blue-500/[0.02] to-transparent">
                  <span className="text-[9px] font-bold text-blue-400 tracking-wider uppercase block">
                    Upcoming Syncs
                  </span>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <h5 className="font-bold text-xs text-white">
                        Sprint Retrospective
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Room: Virtual-Delta
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
                      14:00
                    </span>
                  </div>
                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-[#38debb] to-blue-500 text-black text-xs font-bold uppercase rounded-xl tracking-wide flex items-center justify-center gap-1.5">
                    <Play size={10} fill="black" /> Join Meeting
                  </button>
                </div>
              </RevealWrapper>

              {/* Leaderboard Stack */}
              <RevealWrapper id="contributors" delay="0.28s">
                <h4 className="section-title-outfit mb-3">Top Contributors</h4>
                <div className="dash-card p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-600 font-bold">
                        #1
                      </span>
                      <div>
                        <h5 className="font-bold text-white">Sarah Konor</h5>
                        <span className="text-[10px] text-slate-500">
                          <CountUp target={892} /> PTS
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-white/[0.03] pt-3.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-600 font-bold">
                        #2
                      </span>
                      <div>
                        <h5 className="font-bold text-white">Alex Mercer</h5>
                        <span className="text-[10px] text-slate-500">
                          <CountUp target={741} /> PTS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealWrapper>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamActivity;
