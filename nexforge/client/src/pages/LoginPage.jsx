import React from "react";

export default function LoginPage() {
    return (
        <div className="login-page">

            {/* Overlay */}
            <div className="overlay"></div>

            <div className="particles">
                {[...Array(15)].map((_, i) => (
                    <span
                        key={i}
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                        }}
                    />
                ))}
            </div>

            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                    <img src="/logo.png" alt="NexForge" />
                </div>

                <ul className="nav-links">
                    <li>Home</li>
                    <li>About</li>
                    <li>Services</li>
                    <li>Contact</li>
                </ul>

                <button className="nav-login-btn">
                    Login
                </button>
            </nav>

            {/* Login Card */}
            <div className="login-container">
                <div className="login-card">

                    <button className="close-btn">
                        ✕
                    </button>

                    <h1>Login</h1>

                    <form>

                        <div className="form-group">
                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter email"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter password"
                            />
                        </div>

                        <div className="form-options">
                            <label>
                                <input type="checkbox" />
                                Remember me
                            </label>

                            <a href="/">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                        >
                            Login
                        </button>

                        <p className="register-text">
                            Don't have an account?
                            <span> Register</span>
                        </p>

                    </form>

                </div>
            </div>

        </div>
    );
}