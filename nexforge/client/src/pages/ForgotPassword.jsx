/* global THREE */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import '../index.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const particleCanvasRef = useRef(null);
    const shaderCanvasRef = useRef(null);
    const threejsContainerRef = useRef(null);

    // --- Synchronized Animations Engine Loops (Matches Login/Signup exactly) ---
    useEffect(() => {
        const canvas = particleCanvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize); resize();
        class Particle {
            constructor(x, y) { this.x = x; this.y = y; this.size = Math.random() * 2 + 1; this.speedX = Math.random() * 2 - 1; this.speedY = Math.random() * 2 - 1; this.life = 1; }
            update() { this.x += this.speedX; this.y += this.speedY; this.life -= 0.02; }
            draw() { ctx.fillStyle = `rgba(56, 222, 187, ${this.life})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
        }
        const handleMouseMove = (e) => { for (let i = 0; i < 2; i++) { particles.push(new Particle(e.clientX, e.clientY)); } };
        window.addEventListener('mousemove', handleMouseMove);
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(); particles[i].draw();
                if (particles[i].life <= 0) { particles.splice(i, 1); i--; }
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => { window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationId); };
    }, []);

    useEffect(() => {
        const canvas = shaderCanvasRef.current; if (!canvas) return;
        const w = canvas.clientWidth || 1280; const h = canvas.clientHeight || 720; canvas.width = w; canvas.height = h;
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'); if (!gl) return;
        const vs = `attribute vec2 a_position; varying vec2 v_texCoord; void main() { v_texCoord = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
        const fs = `precision highp float; uniform float u_time; uniform vec2 u_resolution; uniform vec2 u_mouse; varying vec2 v_texCoord; float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); } void main() { vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x); vec3 finalColor = vec3(0.0); float t = u_time * 1.5; float angle = atan(uv.y, uv.x); float dist = length(uv); for(float i = 0.0; i < 3.0; i++) { float layerDist = fract(dist * (1.0 + i * 0.2) - t * 0.5); float fade = smoothstep(1.0, 0.4, layerDist) * smoothstep(0.0, 0.2, layerDist); float stars = pow(hash(vec2(floor(angle * 20.0), floor(dist * 5.0 - t))), 20.0); vec3 color = mix(vec3(0.39, 1.0, 0.85), vec3(1.0, 0.42, 0.42), layerDist); finalColor += color * stars * fade * (1.0 / dist); } float core = 0.02 / dist; finalColor += vec3(0.39, 1.0, 0.85) * core; vec3 bg = mix(vec3(0.039, 0.098, 0.184), vec3(0.01, 0.02, 0.05), dist); gl_FragColor = vec4(bg + finalColor, 1.0); }`;
        function cs(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
        const prog = gl.createProgram(); gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(prog, 'a_position'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        const uTime = gl.getUniformLocation(prog, 'u_time'); const uRes = gl.getUniformLocation(prog, 'u_resolution'); const uMouse = gl.getUniformLocation(prog, 'u_mouse');
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        window.addEventListener('mousemove', (event) => { const rect = canvas.getBoundingClientRect(); if (rect.width && rect.height) { mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width); mouse.y = (rect.height - (event.clientY - rect.top)) * (canvas.height / rect.height); } });
        function render(t) { gl.viewport(0, 0, canvas.width, canvas.height); if (uTime) gl.uniform1f(uTime, t * 0.001); if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height); if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); requestAnimationFrame(render); }
        render(0); return () => { window.removeEventListener('mousemove', () => { }); };
    }, []);

    useEffect(() => {
        const container = threejsContainerRef.current; if (!container || !window.THREE) return;
        const devicePixelRatio = window.devicePixelRatio || 1; const scene = new THREE.Scene(); const width = container.clientWidth || window.innerWidth; const height = container.clientHeight || window.innerHeight; const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000); const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); container.appendChild(renderer.domElement);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0x64FFDA, 2, 10); pointLight.position.set(5, 5, 5); scene.add(pointLight);
        const group = new THREE.Group(); scene.add(group);
        const glowMaterial = new THREE.MeshPhongMaterial({ color: 0x64FFDA, transparent: true, opacity: 0.55, shininess: 100, emissive: 0x64FFDA, emissiveIntensity: 0.5, wireframe: true });
        const anvilGroup = new THREE.Group(); const anvilBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.8), glowMaterial); const anvilHorn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 8), glowMaterial); anvilHorn.rotation.z = Math.PI / 2; anvilHorn.position.set(0.95, 0, 0); const anvilBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.6, 8), glowMaterial); anvilBase.position.set(0, -0.55, 0); anvilGroup.add(anvilBody, anvilHorn, anvilBase); anvilGroup.position.set(-2.2, -0.6, -0.5); anvilGroup.scale.setScalar(0.85); group.add(anvilGroup);
        const hammerGroup = new THREE.Group(); const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.35), glowMaterial); const hammerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), glowMaterial); hammerHandle.position.set(0, -0.7, 0); hammerGroup.add(hammerHead, hammerHandle); hammerGroup.position.set(2.4, 1, -0.3); hammerGroup.rotation.z = -0.5; group.add(hammerGroup);
        const hexMat = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.15 }); const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 6), hexMat); hex.position.set(1.8, -1.6, -1); hex.rotation.x = Math.PI / 2.3; group.add(hex);
        const emberGeo = new THREE.SphereGeometry(0.045, 8, 8); const emberMat = new THREE.MeshPhongMaterial({ color: 0xFF8A50, transparent: true, opacity: 0.85, emissive: 0xFF6A30, emissiveIntensity: 0.9 }); const embers = [];
        for (let i = 0; i < 40; i++) {
            const ember = new THREE.Mesh(emberGeo, emberMat.clone()); ember.position.set(-2.2 + (Math.random() - 0.5) * 1.6, -1 + Math.random() * 0.4, -0.5 + (Math.random() - 0.5) * 1.2);
            ember.userData.riseSpeed = 0.004 + Math.random() * 0.008; ember.userData.driftX = (Math.random() - 0.5) * 0.0015; ember.userData.startY = ember.position.y; ember.userData.resetY = ember.position.y - 0.4; ember.userData.topY = ember.position.y + 3.2; embers.push(ember); group.add(ember);
        }
        camera.position.z = 5; camera.position.y = 0.3;
        function animate(t) {
            requestAnimationFrame(animate); group.rotation.y = Math.sin(t * 0.00015) * 0.15; group.rotation.x = Math.sin(t * 0.0001) * 0.06; anvilGroup.rotation.y += 0.0025;
            const swing = Math.sin(t * 0.0012); hammerGroup.rotation.z = -0.5 + swing * 0.35; hammerGroup.position.y = 1 + Math.abs(swing) * 0.15; hex.rotation.z += 0.0015;
            embers.forEach(ember => { ember.position.y += ember.userData.riseSpeed; ember.position.x += ember.userData.driftX; ember.material.opacity = 0.85 * (1 - (ember.position.y - ember.userData.startY) / 3.2); if (ember.position.y > ember.userData.topY) { ember.position.y = ember.userData.resetY; ember.material.opacity = 0.85; } });
            renderer.render(scene, camera);
        }
        animate(0);
        window.addEventListener('resize', () => { const w = container.clientWidth || window.innerWidth; const h = container.clientHeight || window.innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); });
        return () => { if (renderer.domElement && container.contains(renderer.domElement)) { container.removeChild(renderer.domElement); } };
    }, []);

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Recovery token initialized. Check your transmission email.');
            setEmail('');
        } catch (err) {
            setError(err.message.replace("Firebase:", ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center overflow-x-hidden overflow-y-auto font-body-md selection:bg-surface-tint selection:text-surface-container-lowest px-4 py-8 sm:py-6">
            {/* Animated Scene Backgrounds */}
            <canvas ref={shaderCanvasRef} className="shader-canvas absolute inset-0 w-full h-full opacity-60" style={{ pointerEvents: 'none' }} />
            <div ref={threejsContainerRef} className="threejs-container absolute inset-0 w-full h-full mix-blend-screen opacity-40" style={{ pointerEvents: 'none' }} />
            <canvas ref={particleCanvasRef} id="particle-canvas" className="absolute inset-0 pointer-events-none" />

            {/* Main Form Content */}
            <main className="relative z-10 w-full max-w-[380px] my-auto">
                <div className="glass-card rounded-xl p-6 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 login-card-enter">
                    <div className="grain-texture absolute inset-0" />

                    <div className="text-center mb-6">
                        <h1 className="font-display-sm text-[34px] sm:text-[38px] three-d-text text-primary tracking-tighter mb-1 leading-[1.1]">
                            Nexforge
                        </h1>
                        <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest leading-[14px]">
                            Recover Access Token
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono text-center">
                            {message}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleResetSubmit}>
                        <div className="space-y-1.5 relative group field-enter" style={{ animationDelay: '0.05s' }}>
                            <label className="font-label-caps text-[11px] text-surface-tint ml-1 leading-[14px]">
                                Transmission Email
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-surface-tint opacity-70 group-focus-within:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="M3 7l9 6 9-6" />
                                </svg>
                                <input
                                    className="input-field w-full pl-11 pr-4 py-3.5 rounded-lg border border-white/10 bg-transparent text-on-surface focus:outline-none font-body-md"
                                    placeholder="you@nexforge.io"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button className="submit-btn w-full py-3.5 rounded-lg bg-surface-tint text-on-primary-fixed font-headline-md text-[15px] font-bold holographic-glow relative overflow-hidden active:scale-95 transition-all" type="submit" disabled={loading}>
                            <span className="relative z-10">{loading ? 'Transmitting Request...' : 'Send Reset Link'}</span>
                        </button>
                    </form>

                    <div className="mt-6 text-center field-enter" style={{ animationDelay: '0.1s' }}>
                        <Link className="inline-block font-body-md text-[13px] text-on-surface-variant hover:text-surface-tint transition-colors duration-200" to="/">
                            Back to <span className="text-surface-tint font-bold">Login</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;