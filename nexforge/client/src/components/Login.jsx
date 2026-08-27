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

export default function Login({ onLogin, onCreateAccount, onForgotPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="nf-login min-h-screen w-full overflow-hidden bg-[#020d19] text-white">
            {/* Ambient background effects */}
            <div className="nf-ambient nf-ambient-one" />
            <div className="nf-ambient nf-ambient-two" />
            <div className="nf-grid" />
            <div className="nf-noise" />

            <div className="relative z-10 flex min-h-screen w-full">
                {/* LEFT SIDE */}
                <section className="relative hidden min-h-screen w-1/2 overflow-hidden lg:flex">
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
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
                            Real projects. Real teams. Real experience.
                        </p>
                        <h1 className="max-w-lg text-4xl font-semibold leading-tight text-white/95 xl:text-5xl">
                            Forge the experience
                            <span className="nf-gradient-text block">your future needs.</span>
                        </h1>
                    </div>
                </section>

                {/* RIGHT SIDE */}
                <section className="relative flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
                    <div className="nf-form-glow" />

                    <div
                        ref={cardRef}
                        className="nf-login-card w-full max-w-[500px] rounded-2xl border border-white/10 px-7 py-8 shadow-2xl sm:px-11 sm:py-10"
                        onPointerMove={handleCardPointerMove}
                        onPointerLeave={handleCardPointerLeave}
                    >
                        <span className="nf-card-sheen" aria-hidden="true" />
                        <span className="nf-card-perimeter" aria-hidden="true" />

                        {/* Logo */}
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
                            <div className="flex items-center justify-between gap-4 nf-animate-remember">
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
                                    className="nf-link text-sm font-semibold"
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

                            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-600">
                                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                                Secure NexForge workspace
                                <span className="h-1 w-1 rounded-full bg-violet-400" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}