import React from "react";
import { motion } from "framer-motion";
import {
    User,
    Lock,
    ArrowRight,
    Menu,
} from "lucide-react";


export default function LoginPage() {
    const sparks = Array.from({ length: 20 });

    return (
        <div className="nexforge-bg">

            {/* Background */}
            <div className="bg-overlay" />

            {/* Logo */}
            <div className="logo-container">
                <img
                    src="/logo.png"
                    alt="NexForge"
                    className="logo"
                />
            </div>

            {/* Menu */}
            <div className="menu-btn">
                <Menu size={34} />
            </div>

            <div className="content-wrapper">

                {/* =========================
              FORGE BOT
        ========================== */}

                <div className="forge-area">

                    {/* Sparks */}

                    {sparks.map((_, i) => (
                        <span
                            key={i}
                            className="spark"
                            style={{
                                "--x": `${Math.random() * 250 - 125}px`,
                                "--y": `${-(Math.random() * 120)}px`,
                                animationDelay: `${Math.random()}s`,
                            }}
                        />
                    ))}

                    {/* Anvil */}

                    <motion.div
                        animate={{
                            y: [0, 3, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 0.35,
                        }}
                        className="anvil-wrapper"
                    >
                        <div className="anvil" />

                        <motion.div
                            animate={{
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1,
                            }}
                            className="hot-metal"
                        />
                    </motion.div>

                    {/* Robot */}

                    <motion.div
                        animate={{
                            y: [0, -6, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                        }}
                        className="robot"
                    >
                        {/* Hammer */}

                        <motion.div
                            className="hammer"
                            animate={{
                                rotate: [0, -80, 20, 0],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.7,
                                ease: "easeInOut",
                            }}
                        >
                            <div className="hammer-stick" />
                            <div className="hammer-head" />
                        </motion.div>

                        {/* Head */}

                        <div className="robot-head">
                            <motion.div
                                className="robot-eye"
                                animate={{
                                    opacity: [0.6, 1, 0.6],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                }}
                            />
                        </div>

                        {/* Body */}

                        <div className="robot-body">
                            <span className="text-orange-400 font-bold text-2xl">
                                N
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* =========================
              LOGIN CARD
        ========================== */}

                <div className="login-card">

                    {/* Email */}

                    <div className="input-wrapper active">

                        <User className="input-icon" />

                        <input
                            type="text"
                            placeholder="Email or Username"
                            className="input-field"
                        />
                    </div>

                    {/* Password */}

                    <div className="input-wrapper">

                        <Lock className="input-icon" />

                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                        />
                    </div>

                    {/* Remember */}

                    <div className="remember-row">

                        <label className="remember-me">
                            <input type="checkbox" />
                            Remember me
                        </label>

                        <button className="forgot-link">
                            Forgot password?
                        </button>
                    </div>

                    {/* Login */}

                    <button className="login-btn">
                        Login
                        <ArrowRight />
                    </button>

                    {/* Divider */}

                    <div className="divider">
                        <div />
                        <span>or</span>
                        <div />
                    </div>

                    {/* GitHub */}

                    <button className="github-btn">
                        <span className="text-2xl">⚡</span>
                        Continue with GitHub
                    </button>

                    <p className="signup-text">
                        New here? <span>Sign up</span>
                    </p>
                </div>
            </div>
        </div>
    );
}