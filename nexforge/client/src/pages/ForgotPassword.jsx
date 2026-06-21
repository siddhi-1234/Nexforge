import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { auth } from '../config/firebaseConfig';
import '../index.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            // Tells Firebase to fire a secure localized recovery email link layout out of your dashboard template configurations
            await sendPasswordResetEmail(auth, email);
            setMessage('Recovery protocol initialized. Check your inbox for reset instructions.');
            setEmail('');
        } catch (err) {
            setError(err.message.replace("Firebase:", ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen-viewport">
            {/* Smooth Ambient Cinematic Backdrop Canvas orbs layout mapping */}
            <div className="lucid-canvas">
                <div className="orbital-orb orb-1" />
                <div className="orbital-orb orb-2" />
            </div>

            <nav className="brand-navbar">
                <div className="nav-brand-group">
                    <span className="logo-main-text">NEX<span>FORGE</span></span>
                </div>
            </nav>

            {/* Micro Graphic Silhouette Badge Icon Overlap */}
            <section className="forge-character-anchor" style={{ marginBottom: '-30px' }}>
                <div className="logo-fallback-icon" style={{ width: '80px', height: '80px', borderRadius: '50%', fontSize: '2rem' }}>
                    <KeyRound size={32} color="#00B0FF" />
                </div>
            </section>

            <main className="login-card-wrapper">
                <div className="glass-pro-card" style={{ paddingTop: '3.5rem' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold tracking-tight mb-1">Recover Access Key</h2>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                            Enter your verified builder transmission channel
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono text-center">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleResetSubmit}>
                        <div className="interactive-field-group">
                            <input
                                type="email"
                                placeholder="Transmission Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <Mail className="decor-icon-left" size={18} />
                        </div>

                        <button type="submit" className="submit-forge-btn" disabled={loading || message}>
                            {loading ? 'Transmitting Request...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link className="inline-flex items-center gap-2 font-body-md text-[13px] text-on-surface-variant hover:text-surface-tint style-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} to="/">
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;