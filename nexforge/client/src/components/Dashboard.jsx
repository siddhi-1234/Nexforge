import React from "react";
import "./CSS/dashboard.css";

const LogoMark = ({ className = "" }) => (
    <span className={`nf-logo-mark ${className}`} aria-hidden="true">
        <img src="/assets/logo.png" alt="" />
    </span>
);

export default function Dashboard() {
    // Premium projects mock data
    const projects = [
        {
            id: 1,
            name: "ForgeEngine Core",
            desc: "System monitoring console for real-time engine metrics and workflows.",
            progress: 84,
            status: "active",
            color: "#22d3ee",
            glow: "rgba(34, 211, 238, 0.4)",
            team: ["/assets/avatars/user1.jpg", "/assets/avatars/user2.jpg", "/assets/avatars/user3.jpg"],
        },
        {
            id: 2,
            name: "Nova UI Components",
            desc: "Creating premium components with glassmorphism and modern micro-interactions.",
            progress: 92,
            status: "review",
            color: "#818cf8",
            glow: "rgba(129, 140, 248, 0.4)",
            team: ["/assets/avatars/user2.jpg", "/assets/avatars/user4.jpg"],
        },
        {
            id: 3,
            name: "Synapse AI Integration",
            desc: "Embedding AI agents for automatic repository diagnostics and test generation.",
            progress: 45,
            status: "planning",
            color: "#a78bfa",
            glow: "rgba(167, 139, 250, 0.4)",
            team: ["/assets/avatars/user1.jpg", "/assets/avatars/user3.jpg", "/assets/avatars/user4.jpg", "/assets/avatars/user5.jpg"],
        },
    ];

    const activities = [
        { id: 1, text: "Alex committed 4 updates to ForgeEngine Core", time: "12m ago" },
        { id: 2, text: "Synapse AI pipeline build finished successfully", time: "45m ago" },
        { id: 3, text: "Sarah requested a review for Nova UI Components", time: "2h ago" },
        { id: 4, text: "New workspace node integrated successfully", time: "1d ago" },
    ];

    return (
        <div className="nf-dashboard min-h-screen flex text-slate-100 overflow-hidden">
            {/* Background glowing atmospheres */}
            <div className="nf-dash-glow nf-dash-glow-1" />
            <div className="nf-dash-glow nf-dash-glow-2" />

            {/* SIDEBAR */}
            <aside className="nf-sidebar w-64 hidden md:flex flex-col z-10 relative">
                {/* Brand Logo header */}
                <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
                    <LogoMark className="nf-logo-mark-small" />
                    <span className="font-semibold text-lg tracking-wider text-white">NexForge</span>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 py-8 px-4 space-y-2">
                    <a href="#dashboard" className="nf-sidebar-item active flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                        </svg>
                        Workspace
                    </a>
                    <a href="#projects" className="nf-sidebar-item flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Projects
                    </a>
                    <a href="#teams" className="nf-sidebar-item flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Teams
                    </a>
                    <a href="#analytics" className="nf-sidebar-item flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9 0v-8a2 2 0 00-2-2h-2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2z" />
                        </svg>
                        Analytics
                    </a>
                    <a href="#settings" className="nf-sidebar-item flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </a>
                </nav>

                {/* Sidebar Footer / Profile info */}
                <div className="p-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
                        NF
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">NexForge Team</p>
                        <p className="text-[10px] text-slate-400">admin@nexforge.dev</p>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col z-10 relative overflow-y-auto">
                {/* TOP HEADER */}
                <header className="nf-topbar h-20 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-white">Dashboard Workspace</h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <span className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 nf-status-dot" style={{ color: "#34d399" }} />
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Node Connected</span>
                        </div>
                    </div>
                </header>

                {/* MAIN INNER AREA */}
                <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
                    {/* Welcome Banner */}
                    <div className="nf-glass-panel rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 nf-dash-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, Developer!</h1>
                            <p className="text-sm text-slate-400 mt-2">
                                Your projects are running smoothly. Click on any workspace block below to manage workflows.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center px-5 py-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="block text-2xl font-bold text-white">03</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Projects</span>
                            </div>
                            <div className="text-center px-5 py-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="block text-2xl font-bold text-cyan-400">12</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Members</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Projects column (takes 2 cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white tracking-wide">Active Workspaces</h3>
                                <button className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition">
                                    Create Workspace +
                                </button>
                            </div>

                            <div className="space-y-4">
                                {projects.map((project, index) => (
                                    <div 
                                        key={project.id} 
                                        className="nf-glass-panel rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 nf-dash-fade-in"
                                        style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-base font-semibold text-white">{project.name}</h4>
                                                <p className="text-xs text-slate-400 mt-1 max-w-md">{project.desc}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/10 ${
                                                project.status === "active" ? "text-cyan-400 border-cyan-500/20" :
                                                project.status === "review" ? "text-indigo-400 border-indigo-500/20" :
                                                "text-purple-400 border-purple-500/20"
                                            }`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-semibold">
                                                    <span>WORKFLOW PROGRESS</span>
                                                    <span>{project.progress}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden nf-dash-progress-bar">
                                                    <div 
                                                        className="nf-dash-progress-fill rounded-full"
                                                        style={{ 
                                                            width: `${project.progress}%`, 
                                                            backgroundColor: project.color,
                                                            "--progress-glow": project.glow
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {project.team.map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className="w-7 h-7 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                                                    >
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activities column (takes 1 col) */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white tracking-wide">Console Feed</h3>

                            <div className="nf-glass-panel rounded-xl p-6 space-y-4">
                                {activities.map((activity, index) => (
                                    <div 
                                        key={activity.id} 
                                        className="flex items-start gap-3 text-xs nf-dash-fade-in"
                                        style={{ animationDelay: `${(index + 3) * 0.15}s` }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                        <div className="flex-1">
                                            <p className="text-slate-200 font-medium">{activity.text}</p>
                                            <span className="text-[10px] text-slate-500 mt-1 block">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
