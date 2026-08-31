import React, { useRef, useState } from "react";
import "./CSS/login.css";

const LogoMark = ({ className = "" }) => (
    <span className={`nf-logo-mark ${className}`} aria-hidden="true">
        <img src="/assets/logo.png" alt="" />
    </span>
);

const EyeIcon = ({ hidden }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {hidden ? (
            <>
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c5 0 8.7 3.2 10 8a11.9 11.9 0 0 1-3.1 5.2" />
                <path d="M6.6 6.6A12.1 12.1 0 0 0 2 12c1.3 4.8 5 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
            </>
        ) : (
            <>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="2.8" />
            </>
        )}
    </svg>
);

const MailIcon = () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </svg>
);

const LockIcon = () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
);

export default function Login({ onLogin, onCreateAccount, onForgotPassword, onLoginSuccess }) {
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const cardRef = useRef(null);

    const handleCardPointerMove = (event) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        card.style.setProperty("--nf-mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--nf-my", `${event.clientY - rect.top}px`);
        card.style.setProperty("--nf-sheen-opacity", "1");
    };

    const handleCardPointerLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.setProperty("--nf-sheen-opacity", "0");
        }
    };

    const handleChange = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.email || !form.password) return;

        setIsLoading(true);

        try {
            // Connect your existing login API here.
            // Example:
            // await axios.post("http://localhost:5000/api/auth/login", form);

            if (onLogin) {
                await onLogin({ ...form, remember });
            } else {
                await new Promise((resolve) => setTimeout(resolve, 900));
            }
            
            // Trigger visual success sequence
            setLoginSuccess(true);
            
            setTimeout(() => {
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            }, 1200);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="nf-login min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#020d19] text-white">
            {/* Desktop Ambient background effects */}
            <div className="hidden lg:block nf-ambient nf-ambient-one" />
            <div className="hidden lg:block nf-ambient nf-ambient-two" />
            <div className="hidden lg:block nf-grid" />
            <div className="hidden lg:block nf-noise" />

            {/* Mobile-only Ambient background effects */}
            <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-[#020c1b] via-[#010710] to-[#000205] z-0 pointer-events-none overflow-hidden">
                {/* Large blurred cyan, blue, and violet drifting glows behind the authentication card */}
                <div className="absolute top-[20%] left-[10%] w-[280px] h-[280px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none nf-mob-glow-1" />
                <div className="absolute bottom-[20%] right-[5%] w-[320px] h-[320px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none nf-mob-glow-2" />
                <div className="absolute top-[45%] left-[30%] w-[240px] h-[240px] bg-blue-500/8 rounded-full blur-[90px] pointer-events-none nf-mob-glow-3" />
                
                {/* Subtle technical grid */}
                <div className="nf-mobile-grid" />

                {/* Faint network lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Network Lines */}
                    <line x1="20%" y1="25%" x2="75%" y2="30%" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" />
                    <line x1="75%" y1="30%" x2="48%" y2="72%" stroke="rgba(139, 92, 246, 0.12)" strokeWidth="1" />
                    <line x1="48%" y1="72%" x2="20%" y2="25%" stroke="rgba(34, 211, 238, 0.12)" strokeWidth="1" />
                    
                    {/* Traveling Particle on Line 1 */}
                    <line x1="20%" y1="25%" x2="75%" y2="30%" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="8 60" className="nf-network-line-particle-1" />
                    
                    {/* Traveling Particle on Line 2 */}
                    <line x1="75%" y1="30%" x2="48%" y2="72%" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="8 50" className="nf-network-line-particle-2" />
                </svg>

                {/* Softly pulsing 3D-looking nodes representing projects and collaborators */}
                {/* Node 1: Project Node (Cyan) - Top Left */}
                <div className="absolute left-[20%] top-[25%] flex items-center justify-center pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-cyan-400/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                </div>

                {/* Node 2: Collaborator Node (Violet) - Top Right */}
                <div className="absolute left-[75%] top-[30%] flex items-center justify-center pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-violet-400/40 opacity-75" style={{ animationDelay: "0.8s" }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400 shadow-[0_0_10px_#8b5cf6]"></span>
                </div>

                {/* Node 3: Center Hub (Blue) - Bottom Center */}
                <div className="absolute left-[48%] top-[72%] flex items-center justify-center pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-blue-400/35 opacity-75" style={{ animationDelay: "1.4s" }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400 shadow-[0_0_10px_#3b82f6]"></span>
                </div>

                {/* Floating Glass Task Card (Real Projects / Readiness) - Top Left */}
                <div className="absolute left-4 top-[10%] p-2.5 rounded-lg border border-white/5 bg-white/2 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] pointer-events-none nf-mob-float z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold">API Gateway</span>
                    </div>
                    <p className="text-[10px] text-white font-semibold">Deploy Auth Node</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-[7px] text-slate-300 font-bold">JD</div>
                        <span className="text-[8px] text-slate-400">Assigned</span>
                    </div>
                </div>

                {/* Floating Glass Contribution Chart (Contribution Tracking) - Bottom Left */}
                <div className="absolute left-4 bottom-[15%] p-2.5 rounded-lg border border-white/5 bg-white/2 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] pointer-events-none nf-mob-float-delayed z-10">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 block">Commit Activity</span>
                    <div className="grid grid-cols-4 gap-1">
                        <div className="w-3.5 h-3.5 rounded bg-violet-500/20"></div>
                        <div className="w-3.5 h-3.5 rounded bg-cyan-500/40"></div>
                        <div className="w-3.5 h-3.5 rounded bg-cyan-500/80"></div>
                        <div className="w-3.5 h-3.5 rounded bg-violet-500/60"></div>
                        
                        <div className="w-3.5 h-3.5 rounded bg-cyan-500/60"></div>
                        <div className="w-3.5 h-3.5 rounded bg-violet-500/20"></div>
                        <div className="w-3.5 h-3.5 rounded bg-cyan-500/30"></div>
                        <div className="w-3.5 h-3.5 rounded bg-cyan-500/90 animate-pulse"></div>
                    </div>
                </div>

                {/* Floating Glass Verified Skills Badge (Verified Experience) - Top Right */}
                <div className="absolute right-4 top-[15%] p-2.5 rounded-lg border border-white/5 bg-white/2 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] pointer-events-none nf-mob-float-delayed z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] text-white font-bold">React verified</p>
                            <p className="text-[8px] text-cyan-400">Score: 94%</p>
                        </div>
                    </div>
                </div>

                {/* Floating Glass Team Cluster (Real Teams) - Bottom Right */}
                <div className="absolute right-4 bottom-[20%] p-2.5 rounded-lg border border-white/5 bg-white/2 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] pointer-events-none nf-mob-float z-10">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Active Team</span>
                    <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                        <div className="inline-block h-4 w-4 rounded-full bg-cyan-500 border border-slate-900 flex items-center justify-center text-[7px] text-white font-bold">A</div>
                        <div className="inline-block h-4 w-4 rounded-full bg-violet-500 border border-slate-900 flex items-center justify-center text-[7px] text-white font-bold">B</div>
                        <div className="inline-block h-4 w-4 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[7px] text-white font-bold">C</div>
                        <div className="inline-block h-4 w-4 rounded-full bg-cyan-400 border border-slate-900 flex items-center justify-center text-[7px] text-white font-bold">+3</div>
                    </div>
                    <span className="text-[7px] text-cyan-400 font-semibold block mt-1">4 Open PRs</span>
                </div>
            </div>

            <div className="relative z-10 flex min-h-screen w-full">
                {/* LEFT SIDE */}
                <section className="fixed top-0 left-0 hidden h-screen w-1/2 overflow-hidden lg:flex">
                    <div
                        className="absolute inset-0 nf-reference-bg"
                        style={{ backgroundImage: "url('/assets/login-bg.png')" }}
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,14,25,.10),rgba(1,14,25,.35))]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_45%,rgba(0,255,255,.13),transparent_34%),linear-gradient(180deg,rgba(1,14,25,.05),rgba(1,14,25,.55))]" />

                    {/* Animated particles */}
                    <div className="nf-particles" aria-hidden="true">
                        {Array.from({ length: 24 }).map((_, index) => (
                            <span
                                key={index}
                                className="nf-particle"
                                style={{
                                    left: `${8 + ((index * 37) % 84)}%`,
                                    top: `${5 + ((index * 53) % 90)}%`,
                                    animationDelay: `${(index % 8) * 0.7}s`,
                                    animationDuration: `${4 + (index % 5)}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Top-left Nexforge brand */}
                    <div className="absolute left-10 top-7 flex items-center gap-3">
                        <LogoMark className="nf-logo-mark-small" />
                        <span className="nf-brand-word">NexForge</span>
                    </div>

                    {/* Decorative cyan beam */}
                    <div className="nf-beam nf-beam-one" />
                    <div className="nf-beam nf-beam-two" />

                    <div className="absolute bottom-12 left-10 max-w-xl">
                        <div className="nf-reveal-wrapper mb-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80 nf-reveal-item nf-reveal-tagline">
                                Real projects. Real teams. Real experience.
                            </p>
                        </div>
                        <h1 className="max-w-lg text-4xl font-semibold leading-tight xl:text-5xl">
                            <div className="nf-reveal-wrapper">
                                <span className="nf-forge-text block nf-reveal-item nf-reveal-headline-1">Forge the experience</span>
                            </div>
                            <div className="nf-reveal-wrapper">
                                <span className="nf-gradient-text block nf-reveal-item nf-reveal-headline-2">your future needs.</span>
                            </div>
                        </h1>
                    </div>
                </section>

                {/* RIGHT SIDE */}
                <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-8 lg:w-1/2 lg:ml-auto">
                    <div className="nf-form-glow" />

                    <div
                        ref={cardRef}
                        className="nf-login-card w-full max-w-[500px] rounded-2xl border border-white/10 px-5 py-7 sm:px-11 sm:py-10 shadow-2xl"
                        onPointerMove={handleCardPointerMove}
                        onPointerLeave={handleCardPointerLeave}
                    >
                        <span className="nf-card-sheen" aria-hidden="true" />
                        <span className="nf-card-perimeter" aria-hidden="true" />

                        {/* Desktop Header (unchanged on desktop) */}
                        <div className="hidden lg:block">
                            <div className="mb-5 flex justify-center nf-animate-logo">
                                <LogoMark className="nf-card-logo" />
                            </div>

                            <div className="mb-9 text-center">
                                <h2 className="nf-title text-3xl font-semibold tracking-tight sm:text-[34px] nf-animate-heading">
                                    Welcome back
                                </h2>
                                <p className="mt-3 text-[15px] text-slate-300/90 nf-animate-subtext">
                                    Enter your details to continue to NexForge
                                </p>
                            </div>
                        </div>

                        {/* Mobile-only Brand Header */}
                        <div className="lg:hidden flex flex-col items-center text-center mb-6 nf-animate-logo relative">
                            {/* Subtle cyan-violet glow behind the logo */}
                            <div className="absolute -top-4 w-32 h-32 bg-gradient-to-br from-cyan-500/15 to-violet-500/15 rounded-full blur-xl pointer-events-none z-0" />
                            
                            <div className="relative z-10 flex items-center gap-2.5 mb-2">
                                <LogoMark className="nf-mobile-logo" />
                                <span className="text-xl font-bold tracking-tight text-white">NexForge</span>
                            </div>
                            
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                                REAL PROJECTS - REAL TEAMS
                            </p>
                            
                            <p className="mt-1 text-xs text-slate-300/90 font-medium max-w-xs">
                                Build experience that speaks for you.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div className="nf-animate-email">
                                <label
                                    htmlFor="email"
                                    className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.13em] text-slate-200"
                                >
                                    E-mail
                                </label>

                                <div className="nf-input-wrap">
                                    <span className="nf-input-icon">
                                        <MailIcon />
                                    </span>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        onFocus={() => setIsInteracting(true)}
                                        onBlur={() => setIsInteracting(false)}
                                        placeholder="Enter your e-mail"
                                        className="nf-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="nf-animate-password">
                                <label
                                    htmlFor="password"
                                    className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.13em] text-slate-200"
                                >
                                    Password
                                </label>

                                <div className="nf-input-wrap">
                                    <span className="nf-input-icon">
                                        <LockIcon />
                                    </span>

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={form.password}
                                        onChange={handleChange}
                                        onFocus={() => setIsInteracting(true)}
                                        onBlur={() => setIsInteracting(false)}
                                        placeholder="Enter your password"
                                        className="nf-input nf-password-input"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="nf-eye"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <EyeIcon hidden={!showPassword} />
                                    </button>
                                </div>
                            </div>

                            {/* Remember + Forgot */}
                            <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:items-center min-[440px]:justify-between min-[440px]:gap-4 nf-animate-remember">
                                <label className="nf-check-label flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(event) => setRemember(event.target.checked)}
                                        onFocus={() => setIsInteracting(true)}
                                        onBlur={() => setIsInteracting(false)}
                                        className="nf-checkbox"
                                    />
                                    <span>Remember me</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="nf-link text-sm font-semibold text-left min-[440px]:text-right"
                                >
                                    Forgot your password?
                                </button>
                            </div>

                            {/* Login */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                onMouseEnter={() => setIsInteracting(true)}
                                onMouseLeave={() => setIsInteracting(false)}
                                className="nf-login-button group relative flex h-[54px] w-full items-center justify-center overflow-hidden rounded-lg border border-cyan-300/80 text-sm font-bold uppercase tracking-[0.17em] text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 nf-animate-login-btn"
                            >
                                <span className="nf-button-shine" />
                                <span className="relative z-10">
                                    {isLoading ? "LOGGING IN..." : "LOG IN"}
                                </span>
                            </button>
                        </form>

                        <div className="nf-animate-signup">
                            <div className="my-8 flex items-center gap-4">
                                <span className="h-px flex-1 bg-white/10" />
                                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                    or
                                </span>
                                <span className="h-px flex-1 bg-white/10" />
                            </div>

                            <p className="text-center text-sm text-slate-300">
                                Don't have an account?
                                <button
                                    type="button"
                                    onClick={onCreateAccount}
                                    className="nf-link ml-2 font-semibold"
                                >
                                    Create an account
                                </button>
                            </p>

                            {/* Desktop Footer (unchanged on desktop) */}
                            <div className="hidden lg:flex mt-8 items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white">
                                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                                Secure NexForge workspace
                                <span className="h-1 w-1 rounded-full bg-violet-400" />
                            </div>

                            {/* Mobile-only Footer with Animated status dot */}
                            <div className="lg:hidden mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400/80 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                </span>
                                NexForge workspace online
                            </div>
                        </div>

                        {loginSuccess && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1e2e]/98 backdrop-blur-md rounded-2xl p-5 sm:p-8 text-center z-30 nf-entering-overlay">
                                <div className="mb-6 relative">
                                    <LogoMark className="nf-card-logo nf-glow-intensified" />
                                    {/* Forge Spark Burst */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        {Array.from({ length: 20 }).map((_, index) => {
                                            const angle = (index * 360) / 20;
                                            const distance = 45 + Math.random() * 75;
                                            const duration = 0.5 + Math.random() * 0.7;
                                            return (
                                                <span
                                                    key={index}
                                                    className="nf-spark"
                                                    style={{
                                                        "--nf-spark-x": `${Math.cos((angle * Math.PI) / 180) * distance}px`,
                                                        "--nf-spark-y": `${Math.sin((angle * Math.PI) / 180) * distance}px`,
                                                        animationDuration: `${duration}s`,
                                                        animationDelay: `${Math.random() * 0.15}s`,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold tracking-[0.22em] text-white nf-entering-text">
                                    ENTERING NEXFORGE
                                </h3>
                                <p className="text-xs text-cyan-400/90 mt-2 tracking-[0.1em] font-medium uppercase">
                                    Forging secure workspace nodes...
                                </p>
                                <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden relative">
                                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full nf-entering-progress" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}