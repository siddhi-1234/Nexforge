import React, { useEffect, useState, useRef } from 'react';
import './dashboard.css';
import nexforgeLogo from './logo.png';
import socket from "../socket/socket";

/* ────────────────────────────────────────────
Small reusable bits
──────────────────────────────────────────── */
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



function ProgressRing({ percent, size = 130, label, sublabel, color = '#38debb' }) {
    const [currentPercent, setCurrentPercent] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPercent(percent);
        }, 300);
        return () => clearTimeout(timer);
    }, [percent]);

    return (
        <div className="progress-ring-container" style={{ width: size, height: size }}>
            <div
                className="progress-ring"
                style={{
                    width: size,
                    height: size,
                    background: `conic-gradient(${color} ${currentPercent * 3.6}deg, rgba(255,255,255,0.04) 0deg)`,
                }}
            >
                <div className="progress-ring-inner">
                    <span className="progress-ring-value">{label ?? currentPercent}</span>
                    {sublabel && <span className="progress-ring-sublabel">{sublabel}</span>}
                </div>
            </div>
        </div>
    );
}

function useTilt(ref) {
    useEffect(() => {
        const el = ref.current;
        if (!el || window.innerWidth < 768) return; // Disable on mobile viewports for performance

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.02, 1.01)`;
        };

        const handleMouseLeave = () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        };

        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [ref]);
}

const TiltCard = ({ children, className = '', style = {} }) => {
    const ref = useRef(null);
    useTilt(ref);
    return (
        <div ref={ref} className={`dash-card tilt-card ${className}`} style={style}>
            {children}
        </div>
    );
};

/* ────────────────────────────────────────────
Main Dashboard Component
──────────────────────────────────────────── */
const StudentDashboard = () => {
    const [visibleSections, setVisibleSections] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [showNotifications, setShowNotifications] = useState(false);

    const sectionRefs = useRef([]);

    useEffect(() => {

        // Replace with logged in user ID later
        const userId = "student123";

        socket.emit("join-user-room", userId);

        socket.on("new-notification", (notification) => {

            setNotifications((prev) => [
                notification,
                ...prev
            ]);

            setUnreadCount((prev) => prev + 1);
        });

        // TEMPORARY TEST
        setTimeout(() => {

            setNotifications(prev => [
                {
                    _id: Date.now(),
                    message: "🚀 Welcome to NexForge!",
                    time: "Just now"
                },
                ...prev
            ]);

            setUnreadCount(prev => prev + 1);

        }, 3000);

        return () => {
            socket.off("new-notification");
        };

    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const section = entry.target.dataset.section;
                        if (section) {
                            setVisibleSections((prev) => ({ ...prev, [section]: true }));
                        }
                    }
                });
            },
            { threshold: 0.05 }
        );

        sectionRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const setRef = (key) => (el) => {
        if (el) {
            el.dataset.section = key;
            if (!sectionRefs.current.includes(el)) sectionRefs.current.push(el);
        }
    };

    const sectionClass = (key) =>
        `dash-section ${visibleSections[key] ? 'dash-section-visible' : ''}`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-page">
            {/* Ambient background glow blobs */}
            <div className="dash-bg-glow dash-bg-glow-1" />
            <div className="dash-bg-glow dash-bg-glow-2" />
            <div className="dash-bg-glow dash-bg-glow-3" />

            <div className="dash-layout">
                {isSidebarOpen && <div className="dash-sidebar-overlay" onClick={toggleSidebar} />}

                {/* ── SIDEBAR ── */}
                <aside className={`dash-sidebar ${isSidebarOpen ? 'dash-sidebar-open' : ''}`}>
                    <div className="dash-sidebar-header">
                        <div className="dash-logo">
                            <img src={nexforgeLogo} alt="NexForge" className="dash-logo-img" />
                            <h1 className="neon-text-teal">NexForge</h1>

                        </div>
                        <button className="dash-sidebar-close" onClick={toggleSidebar}>✕</button>
                    </div>

                    <nav className="dash-nav">
                        {[
                            { icon: '🧭', label: 'Dashboard', active: true },
                            { icon: '🚀', label: 'My Projects' },
                            { icon: '🌐', label: 'Team Activity' },
                            { icon: '⚡', label: 'Recommendations' },
                            { icon: '🎓', label: 'Skills' },
                            { icon: '💻', label: 'Internship Prep' },
                        ].map((item, i) => (
                            <a
                                key={item.label}
                                href="#/"
                                className={`dash-nav-item ${item.active ? 'dash-nav-active' : ''}`}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <span className="dash-nav-icon floating-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </nav>

                    <div className="dash-nav-bottom">
                        <a href="#/" className="dash-nav-item">
                            <span className="dash-nav-icon">⚙️</span>
                            <span>Settings</span>
                        </a>
                        <a href="#/" className="dash-nav-item">
                            <span className="dash-nav-icon">💬</span>
                            <span>Support</span>
                        </a>
                    </div>
                </aside>

                {/* ── MAIN AREA ── */}
                <main className="dash-main">
                    <header className="dash-topbar glassmorphism">
                        <div className="dash-topbar-left">
                            <button className="dash-menu-btn" onClick={toggleSidebar}>☰</button>
                            <div className="dash-search glass-input">
                                <span>🔎</span>
                                <input type="text" placeholder="Search projects, skills..." />
                            </div>
                        </div>

                        <div className="dash-topbar-right">
                            <div className="dash-icon-group">
                                <div className="dash-notif-container">
                                    <button
                                        className="dash-icon-btn pulse-hover"
                                        onClick={() => {
                                            setShowNotifications(!showNotifications);
                                            setUnreadCount(0);
                                        }}
                                    >
                                        🔔

                                        {unreadCount > 0 && (
                                            <span className="dash-notif-count">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {showNotifications && (
                                        <div className="dash-notification-panel glassmorphism">
                                            <div className="dash-notification-header">
                                                <h4>Notifications</h4>
                                                <button
                                                    className="dash-clear-btn"
                                                    onClick={() => setNotifications([])}
                                                >
                                                    Clear All
                                                </button>
                                            </div>

                                            {notifications.length === 0 ? (
                                                <div className="dash-empty-notification">
                                                    No notifications yet 🚀
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n._id}
                                                        className="dash-notification-item"
                                                    >
                                                        <div className="dash-notification-content">
                                                            <p>{n.message}</p>
                                                            <small>{n.time}</small>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button className="dash-icon-btn pulse-hover">💬</button>
                            </div>

                            <div className="dash-profile glass-profile">
                                <div className="dash-profile-text">
                                    <p>Student Developer</p>
                                </div>
                                <div className="dash-avatar">SD</div>
                            </div>
                        </div>
                    </header>

                    <div className="dash-content">
                        {/* ── HERO OVERVIEW ── */}
                        <section ref={setRef('hero')} className={sectionClass('hero')}>
                            <div className="dash-card dash-hero glassmorphism staggered-item shine-card float-card">
                                <div className="dash-hero-stats">
                                    {[
                                        { label: 'Contribution Score', value: 847, colorClass: 'dash-stat-teal', barWidth: '70%' },
                                        { label: 'Active Projects', value: 3, colorClass: 'dash-stat-coral' },
                                        { label: 'Tasks Pending', value: 12, colorClass: 'dash-stat-error', hasPulse: true },
                                        { label: 'Skill Growth', value: '+28%', colorClass: 'dash-stat-teal', isGrowth: true },
                                    ].map((stat, i) => (
                                        <div key={stat.label} className="dash-stat-box glass-inner staggered-item hover-lift glow-hover" style={{ animationDelay: `${i * 0.08}s` }}>
                                            <p className="dash-stat-label">{stat.label}</p>
                                            <h3 className={`dash-stat-value ${stat.colorClass}`}>
                                                {typeof stat.value === 'number' ? <CountUp target={stat.value} /> : stat.value}
                                            </h3>
                                            {stat.barWidth && (
                                                <div className="dash-stat-bar">
                                                    <div className="dash-stat-bar-fill progress-draw" style={{ width: stat.barWidth }} />
                                                </div>
                                            )}
                                            {stat.hasPulse && <span className="dash-pulse-dot pulse-animation" />}
                                            {stat.isGrowth && (
                                                <div className="dash-mini-bars">
                                                    {[8, 16, 24, 20].map((h, j) => (
                                                        <span key={j} style={{ '--bar-h': `${h}px`, animationDelay: `${j * 0.05}s` }} className="bar-grow" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="dash-readiness-mini staggered-item" style={{ animationDelay: '0.35s' }}>
                                    <p className="dash-stat-label">Internship Readiness</p>
                                    <ProgressRing percent={87} size={120} label="87" sublabel="/ 100" />
                                </div>
                            </div>
                        </section>

                        {/* ── MY PROJECTS ── */}
                        <section ref={setRef('projects')} className={sectionClass('projects')}>
                            <div className="dash-section-header">
                                <h2 className="staggered-item">🚀 Current Projects</h2>
                                <button className="dash-link-btn hover-glow staggered-item">View All Archives</button>
                            </div>

                            <div className="dash-project-scroll">
                                {[
                                    { title: 'E-Commerce Platform', desc: 'Full-stack Marketplace Deployment', progress: 65, avatars: ['JK', 'RS', '+2'], color: 'teal', time: '4 Days left', status: 'STABLE' },
                                    { title: 'Neural Task Manager', desc: 'AI-driven Productivity Engine', progress: 12, avatars: ['ML', '+1'], color: 'coral', time: '12 Days left', status: 'BETA' },
                                ].map((proj, i) => (
                                    <TiltCard key={proj.title} className="dash-project-card glassmorphism staggered-item" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className="dash-project-top">
                                            <div>
                                                <h4 className="neon-text-teal">{proj.title}</h4>
                                                <p>{proj.desc}</p>
                                            </div>
                                            <div className="dash-avatar-stack">
                                                {proj.avatars.map((av, j) => (
                                                    <div key={j} className={`dash-mini-avatar ${av.startsWith('+') ? 'dash-mini-avatar-more' : ''}`}>{av}</div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="dash-sprint-box glass-inner">
                                            <div className="dash-sprint-top">
                                                <span>CURRENT SPRINT</span>
                                                <span className={`dash-sprint-pct dash-stat-${proj.color}`}>{proj.progress}% DONE</span>
                                            </div>
                                            <div className="dash-stat-bar">
                                                <div className={`dash-stat-bar-fill ${proj.color === 'teal' ? 'dash-gradient-fill' : 'dash-gradient-fill-rev'} progress-draw`} style={{ width: `${proj.progress}%` }} />
                                            </div>
                                        </div>

                                        <div className="dash-project-footer">
                                            <span>⏱ {proj.time}</span>
                                            <span className={`dash-pill dash-pill-${proj.color} glow-pill`}>{proj.status}</span>
                                        </div>
                                    </TiltCard>
                                ))}
                            </div>
                        </section>

                        {/* ── GITHUB ACTIVITY + LIVE CHANGES ── */}
                        <section ref={setRef('activity')} className={`dash-two-col ${sectionClass('activity')}`}>
                            <div className="staggered-item">
                                <h2 className="dash-col-heading">💻 GitHub Activity</h2>
                                <div className="dash-card dash-activity-list glassmorphism">
                                    {[
                                        { icon: '⚡', title: 'feat: implemented auth provider', meta: 'COMMIT #f29a01 • 2m ago' },
                                        { icon: '🔧', title: 'fix: resolved hydration error in layout', meta: 'COMMIT #a102bc • 45m ago' },
                                        { icon: '📦', title: 'build: updated dependencies', meta: 'COMMIT #d83e21 • 3h ago' },
                                    ].map((act, i) => (
                                        <div key={i} className="dash-activity-item hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <div className="dash-activity-icon floating-icon">{act.icon}</div>
                                            <div className="dash-activity-text">
                                                <p>{act.title}</p>
                                                <span>{act.meta}</span>
                                            </div>
                                            <span className="dash-arrow">→</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="staggered-item" style={{ animationDelay: '0.15s' }}>
                                <h2 className="dash-col-heading dash-col-heading-error">🔥 Live Changes</h2>
                                <div className="dash-card dash-live-card glassmorphism">
                                    <div className="dash-live-item hover-lift">
                                        <div className="dash-live-avatar-wrap">
                                            <div className="dash-avatar dash-avatar-error">JD</div>
                                            <span className="dash-pulse-dot dash-pulse-dot-corner pulse-animation" />
                                        </div>
                                        <div className="dash-live-text">
                                            <div className="dash-live-row">
                                                <p>John Doe <span className="neon-text-coral">editing</span></p>
                                                <span className="dash-live-badge dash-live-badge-error">LIVE</span>
                                            </div>
                                            <p className="dash-live-file">/src/components/Header.tsx</p>
                                        </div>
                                    </div>

                                    <div className="dash-live-item hover-lift">
                                        <div className="dash-live-avatar-wrap">
                                            <div className="dash-avatar dash-avatar-teal">AS</div>
                                            <span className="dash-status-dot" />
                                        </div>
                                        <div className="dash-live-text">
                                            <div className="dash-live-row">
                                                <p>Alice Smith <span className="neon-text-teal">reviewing</span></p>
                                                <span className="dash-live-badge dash-live-badge-teal">ONLINE</span>
                                            </div>
                                            <p className="dash-live-file">/src/api/auth.ts</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── AI SMART MATCHES ── */}
                        <section ref={setRef('matches')} className={sectionClass('matches')}>
                            <div className="dash-section-header">
                                <h2 className="staggered-item">✨ AI Smart Matches</h2>
                                <button className="dash-link-btn hover-glow staggered-item">Refresh AI Scan</button>
                            </div>

                            <div className="dash-match-grid">
                                {[
                                    { pct: '98%', icon: '🚀', title: 'Senior React Dev', company: 'Stripe • Remote • Full-time', tags: ['React', 'Node.js', 'AWS'] },
                                    { pct: '92%', icon: '🎨', title: 'UI/UX Designer', company: 'Figma • London • Hybrid', tags: ['Figma', 'Design Systems'] },
                                ].map((match, i) => (
                                    <TiltCard key={match.title} className="dash-match-card glassmorphism staggered-item" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <span className="dash-match-pct neon-text-teal">{match.pct} MATCH</span>
                                        <div className="dash-match-avatar floating-icon">{match.icon}</div>
                                        <h4 className="neon-text-teal">{match.title}</h4>
                                        <p>{match.company}</p>
                                        <div className="dash-tag-row">
                                            {match.tags.map(tag => <span key={tag} className="dash-tag glass-tag">{tag}</span>)}
                                        </div>
                                        <button className="dash-btn-primary neon-btn-teal">Apply with AI</button>
                                    </TiltCard>
                                ))}

                                <div className="dash-card dash-match-empty glassmorphism staggered-item" style={{ animationDelay: '0.2s' }}>
                                    <div className="dash-match-empty-icon floating-icon">➕</div>
                                    <p>More matches loading based on your recent skill growth...</p>
                                </div>
                            </div>
                        </section>

                        {/* ── VERIFIED PROFICIENCIES ── */}
                        <section ref={setRef('skills')} className={sectionClass('skills')}>
                            <div className="dash-section-header">
                                <h2 className="staggered-item">✅ Verified Proficiencies</h2>
                                <button className="dash-link-btn hover-glow staggered-item">Take Assessment</button>
                            </div>

                            <div className="dash-skills-grid">
                                {[
                                    { icon: '⚛️', title: 'React.js', meta: 'Expertise: Advanced', score: '942 / 1000', color: 'blue', badge: 'VERIFIED' },
                                    { icon: '🐍', title: 'Python', meta: 'Expertise: Intermediate', score: '720 / 1000', color: 'green', badge: 'VERIFIED' },
                                    { icon: '🛠️', title: 'System Design', meta: 'Expertise: Intermediate', score: '610 / 1000', color: 'orange', badge: 'L3' },
                                    { icon: '☁️', title: 'Cloud Ops', meta: 'Expertise: Beginner', score: '420 / 1000', color: 'purple', badge: 'L2' },
                                ].map((skill, i) => (
                                    <TiltCard key={skill.title} className="dash-skill-card glassmorphism staggered-item" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="dash-skill-top">
                                            <div className={`dash-skill-icon dash-skill-icon-${skill.color} floating-icon`}>{skill.icon}</div>
                                            <span className={`dash-badge dash-badge-${skill.badge === 'VERIFIED' ? 'verified' : 'level'} neon-text-${skill.color === 'blue' ? 'teal' : 'coral'}`}>{skill.badge}</span>
                                        </div>
                                        <h4 className="neon-text-teal">{skill.title}</h4>
                                        <div className="dash-skill-stats">
                                            <div><span>Expertise</span><span>{skill.meta.split(': ')[1]}</span></div>
                                            <div><span>Score</span><span>{skill.score}</span></div>
                                        </div>
                                    </TiltCard>
                                ))}
                            </div>
                        </section>

                        {/* ── READINESS DETAIL ── */}
                        <section ref={setRef('readiness')} className={sectionClass('readiness')}>
                            <div className="dash-card dash-readiness-detail glassmorphism staggered-item">
                                <div className="dash-readiness-ring-wrap floating-icon">
                                    <ProgressRing percent={87} size={150} label="87" sublabel="READY" color="#38debb" />
                                </div>
                                <div className="dash-readiness-breakdown">
                                    <h2 className="neon-text-teal">Internship Readiness Analysis</h2>
                                    {[
                                        { label: 'Technical Skillset', val: '92%' },
                                        { label: 'Project Experience', val: '78%' },
                                        { label: 'Collaboration History', val: '85%' },
                                    ].map((item, i) => (
                                        <div key={item.label} className="dash-breakdown-item staggered-item" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <div className="dash-breakdown-row">
                                                <span>{item.label}</span>
                                                <span className="neon-text-teal">{item.val}</span>
                                            </div>
                                            <div className="dash-stat-bar">
                                                <div className="dash-stat-bar-fill progress-draw" style={{ width: item.val }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="dash-btn-report neon-btn-coral staggered-item" style={{ animationDelay: '0.2s' }}>
                                        <span>Download Full AI Readiness Report</span>
                                        <span className="floating-icon">📄</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Floating Action Button */}
            <button className="dash-fab layout-fab-spring" aria-label="Create Project">
                <span>+</span>
                <div className="dash-fab-tooltip glassmorphism">New Project</div>
            </button>
        </div>
    );
};

export default StudentDashboard;