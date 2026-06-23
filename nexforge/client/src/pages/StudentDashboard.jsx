import React, { useEffect, useState, useRef } from 'react';
import { Menu, X, Search, Bell, MessageSquare, Compass, Rocket, Globe, Zap, GraduationCap, Laptop, Settings, HelpCircle, Plus, FileText } from 'lucide-react';
import './dashboard.css';

/* ────────────────────────────────────────────
   Micro-Interactive Utilities
──────────────────────────────────────────── */

function CountUp({ target, duration = 1200 }) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let frame;
        const start = performance.now();
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // Easing function for organic velocity drop-off
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            setValue(Math.ceil(easeOutQuad * target));
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return <>{value}</>;
}

function ProgressRing({ percent, size = 160, label, sublabel, color = '#38debb' }) {
    return (
        <div
            className="progress-ring-interactive"
            style={{
                width: size,
                height: size,
                '--target-gradient': `conic-gradient(${color} ${percent * 3.6}deg, rgba(255,255,255,0.04) 0deg)`,
            }}
        >
            <div className="progress-ring-inner">
                <span className="progress-ring-value"><CountUp target={percent} /></span>
                {sublabel && <span className="progress-ring-sublabel">{sublabel}</span>}
            </div>
        </div>
    );
}

/* ── Interactive 3D Perspective Tilt Card Card Component ── */
function InteractiveTiltCard({ children, className = "" }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();

        // Calculate relative coordinates normalized from -1 to 1
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Expose dynamic offsets directly to CSS layout layer variables
        card.style.setProperty('--tilt-x', `${x * 12}deg`);
        card.style.setProperty('--tilt-y', `${-y * 12}deg`);
        card.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
    };

    return (
        <div
            ref={cardRef}
            className={`perspective-tilt-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="card-spotlight-overlay" />
            {children}
        </div>
    );
}

/* ────────────────────────────────────────────
   Main Dashboard
──────────────────────────────────────────── */
const StudentDashboard = () => {
    const [visibleSections, setVisibleSections] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => ({ ...prev, [entry.target.dataset.section]: true }));
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

    return (
        <div className="dashboard-page animate-fade-in">
            <div className="dash-bg-glow dash-bg-glow-1" />
            <div className="dash-bg-glow dash-bg-glow-2" />

            <div className="dash-layout">
                <aside className={`dash-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <div className="sidebar-header-wrapper">
                        <div className="dash-logo">
                            <h1 className="logo-spark-effect">NexForge</h1>
                            <p>V3.0 Beta</p>
                        </div>
                        <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="dash-nav">
                        <a href="#" className="dash-nav-item dash-nav-active">
                            <Compass size={18} className="dash-nav-icon" />
                            <span>Dashboard</span>
                        </a>
                        <a href="#" className="dash-nav-item magnetic-trigger">
                            <Rocket size={18} className="dash-nav-icon" />
                            <span>My Projects</span>
                        </a>
                        <a href="#" className="dash-nav-item magnetic-trigger">
                            <Globe size={18} className="dash-nav-icon" />
                            <span>Team Activity</span>
                        </a>
                        <a href="#" className="dash-nav-item magnetic-trigger">
                            <Zap size={18} className="dash-nav-icon" />
                            <span>Recommendations</span>
                        </a>
                        <a href="#" className="dash-nav-item magnetic-trigger">
                            <GraduationCap size={18} className="dash-nav-icon" />
                            <span>Skills</span>
                        </a>
                        <a href="#" className="dash-nav-item magnetic-trigger">
                            <Laptop size={18} className="dash-nav-icon" />
                            <span>Internship Prep</span>
                        </a>
                    </nav>

                    <div className="dash-nav-bottom">
                        <a href="#" className="dash-nav-item magnetic-trigger">
                            <Settings size={18} className="dash-nav-icon" />
                            <span>Settings</span>
                        </a>
                        <a href="#" className="dash-nav-item magnetic-trigger">
                            <HelpCircle size={18} className="dash-nav-icon" />
                            <span>Support</span>
                        </a>
                    </div>
                </aside>

                {mobileMenuOpen && <div className="sidebar-scrim-overlay" onClick={() => setMobileMenuOpen(false)} />}

                <main className="dash-main">
                    <header className="dash-topbar">
                        <div className="topbar-left-cluster">
                            <button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen(true)}>
                                <Menu size={22} />
                            </button>
                            <div className="dash-search focus-glow-annulus">
                                <Search size={16} className="search-icon-decor" />
                                <input type="text" placeholder="Search resources..." />
                            </div>
                        </div>

                        <div className="dash-topbar-right">
                            <div className="dash-icon-group">
                                <button className="dash-icon-btn spring-bounce">
                                    <Bell size={18} /><span className="dash-notif-dot animate-ping-pulse" />
                                </button>
                                <button className="dash-icon-btn spring-bounce">
                                    <MessageSquare size={18} />
                                </button>
                            </div>

                            <div className="dash-profile interactive-profile">
                                <div className="dash-profile-text">
                                    <p>Student Developer</p>
                                    <span>LEVEL 42</span>
                                </div>
                                <div className="dash-avatar">SD</div>
                            </div>
                        </div>
                    </header>

                    <div className="dash-content">
                        {/* ── HERO STATS (Staggered Animation Items) ── */}
                        <section ref={setRef('hero')} className={`dash-section ${visibleSections['hero'] ? 'dash-section-visible' : ''}`}>
                            <div className="dash-card dash-hero reveal-stagger-parent">
                                <div className="dash-hero-stats">
                                    <div className="dash-stat-box reveal-item">
                                        <p className="dash-stat-label">Contribution Score</p>
                                        <h3 className="dash-stat-value dash-stat-teal"><CountUp target={847} /></h3>
                                        <div className="dash-stat-bar"><div className="dash-stat-bar-fill progress-fill-spring" style={{ '--fill-width': '70%' }} /></div>
                                    </div>
                                    <div className="dash-stat-box reveal-item">
                                        <p className="dash-stat-label">Active Projects</p>
                                        <h3 className="dash-stat-value dash-stat-coral"><CountUp target={3} /></h3>
                                    </div>
                                    <div className="dash-stat-box reveal-item">
                                        <p className="dash-stat-label">Tasks Pending</p>
                                        <h3 className="dash-stat-value dash-stat-error"><CountUp target={12} /></h3>
                                        <span className="dash-pulse-dot" />
                                    </div>
                                    <div className="dash-stat-box reveal-item">
                                        <p className="dash-stat-label">Skill Growth</p>
                                        <h3 className="dash-stat-value dash-stat-teal">+28%</h3>
                                        <div className="dash-mini-bars">
                                            <span style={{ '--bar-h': '8px' }} />
                                            <span style={{ '--bar-h': '16px' }} />
                                            <span style={{ '--bar-h': '24px' }} />
                                            <span style={{ '--bar-h': '20px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="dash-readiness-mini reveal-item">
                                    <p className="dash-stat-label">Internship Readiness</p>
                                    <ProgressRing percent={87} size={120} label="87" sublabel="/ 100" />
                                </div>
                            </div>
                        </section>

                        {/* ── CURRENT PROJECTS (Perspective Cards) ── */}
                        <section ref={setRef('projects')} className={`dash-section ${visibleSections['projects'] ? 'dash-section-visible' : ''}`}>
                            <div className="dash-section-header">
                                <h2>🚀 Current Projects</h2>
                                <button className="dash-link-btn line-slide-hover">View All Archives</button>
                            </div>
                            <div className="dash-project-scroll">
                                <InteractiveTiltCard className="dash-project-card">
                                    <div className="dash-project-top">
                                        <div>
                                            <h4>E-Commerce Platform</h4>
                                            <p>Full-stack Marketplace Deployment</p>
                                        </div>
                                        <div className="dash-avatar-stack">
                                            <div className="dash-mini-avatar avatar-orbit-hover">JK</div>
                                            <div className="dash-mini-avatar avatar-orbit-hover">RS</div>
                                            <div className="dash-mini-avatar dash-mini-avatar-more">+2</div>
                                        </div>
                                    </div>
                                    <div className="dash-sprint-box">
                                        <div className="dash-sprint-top"><span>CURRENT SPRINT</span><span className="dash-stat-teal">65% DONE</span></div>
                                        <div className="dash-stat-bar"><div className="dash-stat-bar-fill dash-gradient-fill progress-fill-spring" style={{ '--fill-width': '65%' }} /></div>
                                    </div>
                                    <div className="dash-project-footer"><span>⏱ 4 Days left</span><span className="dash-pill dash-pill-teal">STABLE</span></div>
                                </InteractiveTiltCard>

                                <InteractiveTiltCard className="dash-project-card">
                                    <div className="dash-project-top">
                                        <div>
                                            <h4>Neural Task Manager</h4>
                                            <p>AI-driven Productivity Engine</p>
                                        </div>
                                        <div className="dash-avatar-stack">
                                            <div className="dash-mini-avatar avatar-orbit-hover">ML</div>
                                            <div className="dash-mini-avatar dash-mini-avatar-more">+1</div>
                                        </div>
                                    </div>
                                    <div className="dash-sprint-box">
                                        <div className="dash-sprint-top"><span>CURRENT SPRINT</span><span className="dash-stat-coral">12% DONE</span></div>
                                        <div className="dash-stat-bar"><div className="dash-stat-bar-fill dash-gradient-fill-rev progress-fill-spring" style={{ '--fill-width': '12%' }} /></div>
                                    </div>
                                    <div className="dash-project-footer"><span>⏱ 12 Days left</span><span className="dash-pill dash-pill-coral">BETA</span></div>
                                </InteractiveTiltCard>
                            </div>
                        </section>

                        {/* ── GIT ACTIVITY & LIVE HUD ── */}
                        <section ref={setRef('activity')} className={`dash-two-col ${visibleSections['activity'] ? 'dash-section-visible' : ''}`}>
                            <div className="dash-card-container">
                                <h2 className="dash-col-heading">💻 GitHub Activity</h2>
                                <div className="dash-card dash-activity-list list-stagger-parent">
                                    <div className="dash-activity-item row-slide-reveal">
                                        <div className="dash-activity-icon rotate-spin-hover">⚡</div>
                                        <div className="dash-activity-text"><p>feat: implemented auth provider</p><span>COMMIT #f29a01 • 2m ago</span></div>
                                        <span className="dash-arrow arrow-shuttle-kick">→</span>
                                    </div>
                                    <div className="dash-activity-item row-slide-reveal">
                                        <div className="dash-activity-icon rotate-spin-hover">🛠</div>
                                        <div className="dash-activity-text"><p>fix: resolved memory leak in dashboard</p><span>COMMIT #b11e92 • 14m ago</span></div>
                                        <span className="dash-arrow arrow-shuttle-kick">→</span>
                                    </div>
                                    <div className="dash-activity-item row-slide-reveal">
                                        <div className="dash-activity-icon rotate-spin-hover">🎨</div>
                                        <div className="dash-activity-text"><p>style: updated glassmorphic borders</p><span>COMMIT #e3a9b1 • 1h ago</span></div>
                                        <span className="dash-arrow arrow-shuttle-kick">→</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dash-card-container">
                                <h2 className="dash-col-heading dash-col-heading-error">📡 Live Changes</h2>
                                <div className="dash-card dash-live-card">
                                    <div className="dash-live-item entry-breath-pulse">
                                        <div className="dash-live-avatar-wrap"><div className="dash-avatar dash-avatar-error">AC</div><span className="dash-pulse-dot dash-pulse-dot-corner" /></div>
                                        <div className="dash-live-text">
                                            <div className="dash-live-row"><p>Alex Chen <span>is editing</span></p><span className="dash-live-badge dash-live-badge-error live-flicker-badge">● LIVE</span></div>
                                            <p className="dash-live-file">src/components/Navigation.tsx</p>
                                        </div>
                                    </div>
                                    <div className="dash-live-item">
                                        <div className="dash-live-avatar-wrap"><div className="dash-avatar dash-avatar-teal">MS</div><span className="dash-status-dot" /></div>
                                        <div className="dash-live-text">
                                            <div className="dash-live-row"><p>Mia Sol <span>is reviewing</span></p><span className="dash-live-badge dash-live-badge-teal">ACTIVE</span></div>
                                            <p className="dash-live-file">PR #124 - Auth Flow Refactor</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── INTERNSHIP METRICS BREAKDOWN ── */}
                        <section ref={setRef('readiness')} className={`dash-section ${visibleSections['readiness'] ? 'dash-section-visible' : ''}`}>
                            <div className="dash-card dash-readiness-detail">
                                <div className="dash-readiness-ring-wrap">
                                    <ProgressRing percent={87} size={180} label="87" sublabel="READY SCORE" color="#5ffbd6" />
                                </div>
                                <div className="dash-readiness-breakdown">
                                    <h2>Industry Readiness Breakdown</h2>
                                    <div className="dash-breakdown-item">
                                        <div className="dash-breakdown-row"><span>Technical Prowess</span><span className="dash-stat-teal">92%</span></div>
                                        <div className="dash-stat-bar"><div className="dash-stat-bar-fill progress-fill-spring" style={{ '--fill-width': '92%' }} /></div>
                                    </div>
                                    <div className="dash-breakdown-item">
                                        <div className="dash-breakdown-row"><span>Team Collaboration</span><span className="dash-stat-teal">84%</span></div>
                                        <div className="dash-stat-bar"><div className="dash-stat-bar-fill progress-fill-spring" style={{ '--fill-width': '84%' }} /></div>
                                    </div>
                                    <button className="dash-btn-report glow-button-shimmer"><FileText size={16} /> Generate Readiness Report</button>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            <button className="dash-fab layout-fab-spring" aria-label="Create new development project">
                <Plus size={24} />
                <div className="dash-fab-tooltip">CREATE PROJECT</div>
            </button>
        </div>
    );
};

export default StudentDashboard;