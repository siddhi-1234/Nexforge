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

export default function Login({ onLogin, onGoogleLogin, onCreateAccount, onForgotPassword, onLoginSuccess }) {
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
            if (onLogin) {
                await onLogin({ ...form, remember });
            } else {
                await new Promise((resolve) => setTimeout(resolve, 900));
            }

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

            {/* Mobile Header Artwork & Background (Matching Desktop Asset) */}
            <div className="lg:hidden nf-mob-hero-container">
                <div
                    className="nf-mob-hero-bg"
                    style={{ backgroundImage: "url('/assets/login-bg.png')" }}
                />
                <div className="nf-mob-hero-overlay" />
            </div>

            <div className="relative z-10 flex min-h-screen w-full">
                {/* LEFT SIDE (Desktop Unchanged) */}
                <section className="fixed top-0 left-0 hidden h-screen w-1/2 overflow-hidden lg:flex">
                    <div
                        className="absolute inset-0 nf-reference-bg"
                        style={{ backgroundImage: "url('/assets/login-bg.png')" }}
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,14,25,.10),rgba(1,14,25,.35))]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_45%,rgba(0,255,255,.13),transparent_34%),linear-gradient(180deg,rgba(1,14,25,.05),rgba(1,14,25,.55))]" />

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

                    <div className="absolute left-10 top-7 flex items-center gap-3">
                        <LogoMark className="nf-logo-mark-small" />
                        <span className="nf-brand-word">NexForge</span>
                    </div>

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

                {/* RIGHT SIDE / MOBILE FULL CONTAINER */}
                <section className="relative flex min-h-screen w-full items-center justify-center px-5 py-6 sm:px-8 lg:w-1/2 lg:ml-auto">
                    <div className="hidden lg:block nf-form-glow" />

                    <div
                        ref={cardRef}
                        className="nf-login-card w-full max-w-[500px] rounded-2xl border border-white/10 px-5 py-7 sm:px-11 sm:py-10 shadow-2xl"
                        onPointerMove={handleCardPointerMove}
                        onPointerLeave={handleCardPointerLeave}
                    >
                        <span className="nf-card-sheen hidden lg:block" aria-hidden="true" />
                        <span className="nf-card-perimeter hidden lg:block" aria-hidden="true" />

                        {/* Desktop Header */}
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

                        {/* Mobile Header Style matching Reference 1 */}
                        <div className="lg:hidden text-left mb-6 mt-36">
                            <h2 className="text-3xl font-extrabold uppercase tracking-wide text-white">
                                Login
                            </h2>
                            <p className="mt-1.5 text-xs text-slate-400 font-medium">
                                Login in with email address
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div className="nf-animate-email">
                                <label
                                    htmlFor="email"
                                    className="hidden lg:block mb-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-slate-200"
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
                                        placeholder="Yourname@gmail.com"
                                        className="nf-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="nf-animate-password">
                                <label
                                    htmlFor="password"
                                    className="hidden lg:block mb-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-slate-200"
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

                            {/* Remember & Forgot Password */}
                            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 pt-1 nf-animate-remember">


                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="nf-link text-xs font-medium text-slate-400 hover:text-cyan-400"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    onMouseEnter={() => setIsInteracting(true)}
                                    onMouseLeave={() => setIsInteracting(false)}
                                    className="nf-login-button group relative flex h-[50px] w-full items-center justify-center overflow-hidden rounded-xl border border-cyan-400/40 text-sm font-semibold tracking-wider text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <span className="nf-button-shine" />
                                    <span className="relative z-10 font-bold">
                                        {isLoading ? "LOGGING IN..." : "Login"}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Alternate Actions / Social Login */}
                        <div className="nf-animate-signup mt-6">
                            <div className="relative flex py-2 items-center justify-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink mx-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                    Or continue with
                                </span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            {/* Google Button */}
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={onGoogleLogin || (() => {
                                        if (onLoginSuccess) {
                                            setIsLoading(true);
                                            setTimeout(() => {
                                                setIsLoading(false);
                                                setLoginSuccess(true);
                                                setTimeout(() => {
                                                    onLoginSuccess();
                                                }, 1200);
                                            }, 600);
                                        }
                                    })}
                                    className="nf-google-button flex w-full items-center justify-center gap-3 h-[48px] sm:h-[50px] rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/35 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] active:scale-[0.99]"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                                        <path fill="#EA4335" d="M12 5c1.5 0 2.9.5 4 1.5l3-3C17.1 1.7 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.8C6.5 7.3 9 5 12 5z" />
                                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                                        <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.7s.7 5 1.9 7.4l3.7-2.8z" />
                                        <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.1L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
                                    </svg>
                                    <span>Google</span>
                                </button>
                            </div>

                            <p className="mt-5 text-center text-xs text-slate-400">
                                Don't have an account?
                                <button
                                    type="button"
                                    onClick={onCreateAccount}
                                    className="nf-link ml-1.5 font-semibold text-cyan-400"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>

                        {loginSuccess && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1e2e]/98 backdrop-blur-md rounded-2xl p-5 sm:p-8 text-center z-30 nf-entering-overlay">
                                <div className="mb-6 relative">
                                    <LogoMark className="nf-card-logo nf-glow-intensified" />
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