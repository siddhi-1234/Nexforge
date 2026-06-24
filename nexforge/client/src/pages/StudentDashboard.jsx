import React, { useEffect, useState, useRef } from 'react';
import './dashboard.css';

/* ────────────────────────────────────────────
   Small reusable bits
──────────────────────────────────────────── */

// Animated count-up number, plain React state + interval, no extra libs
function CountUp({ target, duration = 1200 }) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let frame;
        const start = performance.now();
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.ceil(progress * target));
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return <>{value}</>;
}

// Simple circular progress ring using conic-gradient (no SVG needed)
function ProgressRing({ percent, size = 160, label, sublabel, color = '#38debb' }) {
    return (
        <div
            className="progress-ring"
            style={{
                width: size,
                height: size,
                background: `conic-gradient(${color} ${percent * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            }}
        >
            <div className="progress-ring-inner">
                <span className="progress-ring-value">{label ?? percent}</span>
                {sublabel && <span className="progress-ring-sublabel">{sublabel}</span>}
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────
   Main Dashboard
──────────────────────────────────────────── */

const StudentDashboard = () => {
    const [visibleSections, setVisibleSections] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sectionRefs = useRef([]);

    // Simple scroll-reveal using IntersectionObserver — no animation libs
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => ({ ...prev, [entry.target.dataset.section]: true }));
                    }
                });
            },
            { threshold: 0.1 }
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
            {/* Ambient background glow blobs — pure CSS, no canvas/WebGL */}
            <div className="dash-bg-glow dash-bg-glow-1" />
            <div className="dash-bg-glow dash-bg-glow-2" />

            <div className="dash-layout">
                {/* Mobile Sidebar Overlay - Now inside layout to control z-index better */}
                {isSidebarOpen && <div className="dash-sidebar-overlay" onClick={toggleSidebar} />}

                {/* ── SIDEBAR ── */}
                <aside className={`dash-sidebar ${isSidebarOpen ? 'dash-sidebar-open' : ''}`}>
                    <div className="dash-sidebar-header">
                        <div className="dash-logo">
                            <h1>NexForge</h1>
                            <p>V3.0 Beta</p>
                        </div>
                        <button className="dash-sidebar-close" onClick={toggleSidebar}>✕</button>
                    </div>

                    <nav className="dash-nav">
                        <a href="#" className="dash-nav-item dash-nav-active">
                            <span className="dash-nav-icon">🧭</span>
                            <span>Dashboard</span>
                        </a>
                        <a href="#" className="dash-nav-item">
                            <span className="dash-nav-icon">🚀</span>
                            <span>My Projects</span>
                        </a>
                        <a href="#" className="dash-nav-item">
                            <span className="dash-nav-icon">🌐</span>
                            <span>Team Activity</span>
                        </a>
                        <a href="#" className="dash-nav-item">
                            <span className="dash-nav-icon">⚡</span>
                            <span>Recommendations</span>
                        </a>
                        <a href="#" className="dash-nav-item">
                            <span className="dash-nav-icon">🎓</span>
                            <span>Skills</span>
                        </a>
                        <a href="#" className="dash-nav-item">
                            <span className="dash-nav-icon">💻</span>
                            <span>Internship Prep</span>
                        </a>
                    </nav>

                    <div className="dash-nav-bottom">
                        <a href="#" className="dash-nav-item">
                            <span className="dash-nav-icon">⚙️</span>
                            <span>Settings</span>
                        </a>
                        <a href="#" className="dash-nav-item">
                            <span className="dash-nav-icon">💬</span>
                            <span>Support</span>
                        </a>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="dash-main">
                    {/* Top bar */}
                    <header className="dash-topbar">
                        <div className="dash-topbar-left">
                            <button className="dash-menu-btn" onClick={toggleSidebar}>☰</button>
                            <div className="dash-search">
                                <span>🔎</span>
                                <input type="text" placeholder="Search..." />
                            </div>
                        </div>

                        <div className="dash-topbar-right">
                            <div className="dash-icon-group">
                                <button className="dash-icon-btn">
                                    🔔<span className="dash-notif-dot" />
                                </button>
                                <button className="dash-icon-btn">💬</button>
                            </div>

                            <div className="dash-profile">
                                <div className="dash-profile-text">
                                    <p>Student Developer</p>
                                    <span>LEVEL 42</span>
                                </div>
                                <div className="dash-avatar">SD</div>
                            </div>
                        </div>
                    </header>

                    <div className="dash-content">

                        {/* ── HERO OVERVIEW ── */}
                        <section ref={setRef('hero')} className={sectionClass('hero')}>
                            <div className="dash-card dash-hero">
                                <div className="dash-hero-stats">
                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">Contribution Score</p>
                                        <h3 className="dash-stat-value dash-stat-teal">
                                            <CountUp target={847} />
                                        </h3>
                                        <div className="dash-stat-bar">
                                            <div className="dash-stat-bar-fill" style={{ width: '70%' }} />
                                        </div>
                                    </div>

                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">Active Projects</p>
                                        <h3 className="dash-stat-value dash-stat-coral">
                                            <CountUp target={3} />
                                        </h3>
                                    </div>

                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">Tasks Pending</p>
                                        <h3 className="dash-stat-value dash-stat-error">
                                            <CountUp target={12} />
                                        </h3>
                                        <span className="dash-pulse-dot" />
                                    </div>

                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">Skill Growth</p>
                                        <h3 className="dash-stat-value dash-stat-teal">+28%</h3>
                                        <div className="dash-mini-bars">
                                            <span style={{ height: '8px' }} />
                                            <span style={{ height: '16px' }} />
                                            <span style={{ height: '24px' }} />
                                            <span style={{ height: '20px' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="dash-readiness-mini">
                                    <p className="dash-stat-label">Internship Readiness</p>
                                    <ProgressRing percent={87} size={150} label="87" sublabel="/ 100" />
                                </div>
                            </div>
                        </section>

                        {/* ── MY PROJECTS ── */}
                        <section ref={setRef('projects')} className={sectionClass('projects')}>
                            <div className="dash-section-header">
                                <h2>🚀 Current Projects</h2>
                                <button className="dash-link-btn">View All Archives</button>
                            </div>

                            <div className="dash-project-scroll">
                                <div className="dash-card dash-project-card">
                                    <div className="dash-project-top">
                                        <div>
                                            <h4>E-Commerce Platform</h4>
                                            <p>Full-stack Marketplace Deployment</p>
                                        </div>
                                        <div className="dash-avatar-stack">
                                            <div className="dash-mini-avatar">JK</div>
                                            <div className="dash-mini-avatar">RS</div>
                                            <div className="dash-mini-avatar dash-mini-avatar-more">+2</div>
                                        </div>
                                    </div>

                                    <div className="dash-sprint-box">
                                        <div className="dash-sprint-top">
                                            <span>CURRENT SPRINT</span>
                                            <span className="dash-sprint-pct dash-stat-teal">65% DONE</span>
                                        </div>
                                        <div className="dash-stat-bar">
                                            <div className="dash-stat-bar-fill dash-gradient-fill" style={{ width: '65%' }} />
                                        </div>
                                    </div>

                                    <div className="dash-project-footer">
                                        <span>⏱ 4 Days left</span>
                                        <span className="dash-pill dash-pill-teal">STABLE</span>
                                    </div>
                                </div>

                                <div className="dash-card dash-project-card">
                                    <div className="dash-project-top">
                                        <div>
                                            <h4>Neural Task Manager</h4>
                                            <p>AI-driven Productivity Engine</p>
                                        </div>
                                        <div className="dash-avatar-stack">
                                            <div className="dash-mini-avatar">ML</div>
                                            <div className="dash-mini-avatar dash-mini-avatar-more">+1</div>
                                        </div>
                                    </div>

                                    <div className="dash-sprint-box">
                                        <div className="dash-sprint-top">
                                            <span>CURRENT SPRINT</span>
                                            <span className="dash-sprint-pct dash-stat-coral">12% DONE</span>
                                        </div>
                                        <div className="dash-stat-bar">
                                            <div className="dash-stat-bar-fill dash-gradient-fill-rev" style={{ width: '12%' }} />
                                        </div>
                                    </div>

                                    <div className="dash-project-footer">
                                        <span>⏱ 12 Days left</span>
                                        <span className="dash-pill dash-pill-coral">BETA</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── GITHUB ACTIVITY + LIVE CHANGES ── */}
                        <section
                            ref={setRef('activity')}
                            className={`dash-two-col ${sectionClass('activity')}`}
                        >
                            <div>
                                <h2 className="dash-col-heading">💻 GitHub Activity</h2>
                                <div className="dash-card dash-activity-list">
                                    <div className="dash-activity-item">
                                        <div className="dash-activity-icon">⚡</div>
                                        <div className="dash-activity-text">
                                            <p>feat: implemented auth provider</p>
                                            <span>COMMIT #f29a01 • 2m ago</span>
                                        </div>
                                        <span className="dash-arrow">→</span>
                                    </div>
                                    <div className="dash-activity-item">
                                        <div className="dash-activity-icon">🔧</div>
                                        <div className="dash-activity-text">
                                            <p>fix: resolved hydration error in layout</p>
                                            <span>COMMIT #a102bc • 45m ago</span>
                                        </div>
                                        <span className="dash-arrow">→</span>
                                    </div>
                                    <div className="dash-activity-item">
                                        <div className="dash-activity-icon">📦</div>
                                        <div className="dash-activity-text">
                                            <p>build: updated dependencies</p>
                                            <span>COMMIT #d83e21 • 3h ago</span>
                                        </div>
                                        <span className="dash-arrow">→</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="dash-col-heading dash-col-heading-error">🔥 Live Changes</h2>
                                <div className="dash-card dash-live-card">
                                    <div className="dash-live-item">
                                        <div className="dash-live-avatar-wrap">
                                            <div className="dash-avatar dash-avatar-error">JD</div>
                                            <span className="dash-pulse-dot dash-pulse-dot-corner" />
                                        </div>
                                        <div className="dash-live-text">
                                            <div className="dash-live-row">
                                                <p>John Doe <span>editing</span></p>
                                                <span className="dash-live-badge dash-live-badge-error">LIVE</span>
                                            </div>
                                            <p className="dash-live-file">/src/components/Header.tsx</p>
                                        </div>
                                    </div>

                                    <div className="dash-live-item">
                                        <div className="dash-live-avatar-wrap">
                                            <div className="dash-avatar dash-avatar-teal">AS</div>
                                            <span className="dash-status-dot" />
                                        </div>
                                        <div className="dash-live-text">
                                            <div className="dash-live-row">
                                                <p>Alice Smith <span>reviewing</span></p>
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
                                <h2>✨ AI Smart Matches</h2>
                                <button className="dash-link-btn">Refresh AI Scan</button>
                            </div>

                            <div className="dash-match-grid">
                                <div className="dash-card dash-match-card">
                                    <span className="dash-match-pct">98% MATCH</span>
                                    <div className="dash-match-avatar">🚀</div>
                                    <h4>Senior React Dev</h4>
                                    <p>Stripe • Remote • Full-time</p>
                                    <div className="dash-tag-row">
                                        <span className="dash-tag">React</span>
                                        <span className="dash-tag">Node.js</span>
                                        <span className="dash-tag">AWS</span>
                                    </div>
                                    <button className="dash-btn-primary">Apply with AI</button>
                                </div>

                                <div className="dash-card dash-match-card">
                                    <span className="dash-match-pct">92% MATCH</span>
                                    <div className="dash-match-avatar">🎨</div>
                                    <h4>UI/UX Designer</h4>
                                    <p>Figma • London • Hybrid</p>
                                    <div className="dash-tag-row">
                                        <span className="dash-tag">Figma</span>
                                        <span className="dash-tag">Design Systems</span>
                                    </div>
                                    <button className="dash-btn-primary">Apply with AI</button>
                                </div>

                                <div className="dash-card dash-match-empty">
                                    <div className="dash-match-empty-icon">➕</div>
                                    <p>More matches loading based on your recent skill growth...</p>
                                </div>
                            </div>
                        </section>

                        {/* ── VERIFIED PROFICIENCIES ── */}
                        <section ref={setRef('skills')} className={sectionClass('skills')}>
                            <div className="dash-section-header">
                                <h2>✅ Verified Proficiencies</h2>
                                <button className="dash-link-btn">Take Assessment</button>
                            </div>

                            <div className="dash-skills-grid">
                                <div className="dash-card dash-skill-card">
                                    <div className="dash-skill-top">
                                        <div className="dash-skill-icon dash-skill-icon-blue">⚛️</div>
                                        <span className="dash-badge dash-badge-verified">VERIFIED</span>
                                    </div>
                                    <h4>React.js</h4>
                                    <div className="dash-skill-stats">
                                        <div><span>Expertise</span><span>Advanced</span></div>
                                        <div><span>Score</span><span>942 / 1000</span></div>
                                    </div>
                                </div>

                                <div className="dash-card dash-skill-card">
                                    <div className="dash-skill-top">
                                        <div className="dash-skill-icon dash-skill-icon-green">🐍</div>
                                        <span className="dash-badge dash-badge-verified">VERIFIED</span>
                                    </div>
                                    <h4>Python</h4>
                                    <div className="dash-skill-stats">
                                        <div><span>Expertise</span><span>Intermediate</span></div>
                                        <div><span>Score</span><span>720 / 1000</span></div>
                                    </div>
                                </div>

                                <div className="dash-card dash-skill-card">
                                    <div className="dash-skill-top">
                                        <div className="dash-skill-icon dash-skill-icon-orange">🛠️</div>
                                        <span className="dash-badge dash-badge-level">L3</span>
                                    </div>
                                    <h4>System Design</h4>
                                    <div className="dash-skill-stats">
                                        <div><span>Expertise</span><span>Intermediate</span></div>
                                        <div><span>Score</span><span>610 / 1000</span></div>
                                    </div>
                                </div>

                                <div className="dash-card dash-skill-card">
                                    <div className="dash-skill-top">
                                        <div className="dash-skill-icon dash-skill-icon-purple">☁️</div>
                                        <span className="dash-badge dash-badge-level">L2</span>
                                    </div>
                                    <h4>Cloud Ops</h4>
                                    <div className="dash-skill-stats">
                                        <div><span>Expertise</span><span>Beginner</span></div>
                                        <div><span>Score</span><span>420 / 1000</span></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── READINESS DETAIL ── */}
                        <section ref={setRef('readiness')} className={sectionClass('readiness')}>
                            <div className="dash-card dash-readiness-detail">
                                <div className="dash-readiness-ring-wrap">
                                    <ProgressRing percent={87} size={180} label="87" sublabel="READY" />
                                </div>
                                <div className="dash-readiness-breakdown">
                                    <h2>Internship Readiness Analysis</h2>
                                    <div className="dash-breakdown-item">
                                        <div className="dash-breakdown-row">
                                            <span>Technical Skillset</span>
                                            <span>92%</span>
                                        </div>
                                        <div className="dash-stat-bar">
                                            <div className="dash-stat-bar-fill" style={{ width: '92%' }} />
                                        </div>
                                    </div>
                                    <div className="dash-breakdown-item">
                                        <div className="dash-breakdown-row">
                                            <span>Project Experience</span>
                                            <span>78%</span>
                                        </div>
                                        <div className="dash-stat-bar">
                                            <div className="dash-stat-bar-fill" style={{ width: '78%' }} />
                                        </div>
                                    </div>
                                    <div className="dash-breakdown-item">
                                        <div className="dash-breakdown-row">
                                            <span>Collaboration History</span>
                                            <span>85%</span>
                                        </div>
                                        <div className="dash-stat-bar">
                                            <div className="dash-stat-bar-fill" style={{ width: '85%' }} />
                                        </div>
                                    </div>
                                    <button className="dash-btn-report">
                                        <span>Download Full AI Readiness Report</span>
                                        <span>📄</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                    </div>
                </main>
            </div>

            {/* Floating Action Button */}
            <button className="dash-fab">
                <span>+</span>
                <div className="dash-fab-tooltip">New Project</div>
            </button>
        </div>
    );
};

export default StudentDashboard;
