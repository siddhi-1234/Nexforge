/* global THREE */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const ROLE_REDIRECTS = {
    student: '/dashboard/student',
    mentor: '/dashboard/mentor',
    recruiter: '/dashboard/recruiter',
    admin: '/dashboard/admin',
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const particleCanvasRef = useRef(null);
    const shaderCanvasRef = useRef(null);
    const threejsContainerRef = useRef(null);
    const navigate = useNavigate();

    // Particle Animation
    useEffect(() => {
        const canvas = particleCanvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.life = 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 0.02;
            }

            draw() {
                ctx.fillStyle = `rgba(56, 222, 187, ${this.life})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const handleMouseMove = (e) => {
            for (let i = 0; i < 2; i++) {
                particles.push(new Particle(e.clientX, e.clientY));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // WebGL Shader Animation
    useEffect(() => {
        const canvas = shaderCanvasRef.current;
        if (!canvas) return;

        const w = canvas.clientWidth || 1280;
        const h = canvas.clientHeight || 720;
        canvas.width = w;
        canvas.height = h;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;

        const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

        const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    vec3 finalColor = vec3(0.0);
    
    float t = u_time * 1.5;
    float angle = atan(uv.y, uv.x);
    float dist = length(uv);
    
    for(float i = 0.0; i < 3.0; i++) {
        float layerDist = fract(dist * (1.0 + i * 0.2) - t * 0.5);
        float fade = smoothstep(1.0, 0.4, layerDist) * smoothstep(0.0, 0.2, layerDist);
        
        float stars = pow(hash(vec2(floor(angle * 20.0), floor(dist * 5.0 - t))), 20.0);
        
        vec3 color = mix(vec3(0.39, 1.0, 0.85), vec3(1.0, 0.42, 0.42), layerDist);
        finalColor += color * stars * fade * (1.0 / dist);
    }
    
    float core = 0.02 / dist;
    finalColor += vec3(0.39, 1.0, 0.85) * core;
    
    vec3 bg = mix(vec3(0.039, 0.098, 0.184), vec3(0.01, 0.02, 0.05), dist);
    
    gl_FragColor = vec4(bg + finalColor, 1.0);
}`;

        function cs(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const pos = gl.getAttribLocation(prog, 'a_position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(prog, 'u_time');
        const uRes = gl.getUniformLocation(prog, 'u_resolution');
        const uMouse = gl.getUniformLocation(prog, 'u_mouse');

        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

        window.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width && rect.height) {
                mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
                mouse.y = (rect.height - (event.clientY - rect.top)) * (canvas.height / rect.height);
            }
        });

        function render(t) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            if (uTime) gl.uniform1f(uTime, t * 0.001);
            if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
            if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        }

        render(0);

        return () => {
            window.removeEventListener('mousemove', () => { });
        };
    }, []);

    // ThreeJS Animation
    useEffect(() => {
        const container = threejsContainerRef.current;
        if (!container || !window.THREE) return;

        const devicePixelRatio = window.devicePixelRatio || 1;
        const scene = new THREE.Scene();
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x64FFDA, 2, 10);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        const group = new THREE.Group();
        scene.add(group);

        // Shared glow material — teal "forge energy" look, matches existing palette
        const glowMaterial = new THREE.MeshPhongMaterial({
            color: 0x64FFDA,
            transparent: true,
            opacity: 0.55,
            shininess: 100,
            emissive: 0x64FFDA,
            emissiveIntensity: 0.5,
            wireframe: true
        });

        // ── ANVIL — low-poly wireframe, rotates slowly center-left ──
        const anvilGroup = new THREE.Group();
        const anvilBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.8), glowMaterial);
        const anvilHorn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 8), glowMaterial);
        anvilHorn.rotation.z = Math.PI / 2;
        anvilHorn.position.set(0.95, 0, 0);
        const anvilBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.6, 8), glowMaterial);
        anvilBase.position.set(0, -0.55, 0);
        anvilGroup.add(anvilBody, anvilHorn, anvilBase);
        anvilGroup.position.set(-2.2, -0.6, -0.5);
        anvilGroup.scale.setScalar(0.85);
        group.add(anvilGroup);

        // ── HAMMER — orbits/swings above the anvil, like a forging strike ──
        const hammerGroup = new THREE.Group();
        const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.35), glowMaterial);
        const hammerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), glowMaterial);
        hammerHandle.position.set(0, -0.7, 0);
        hammerGroup.add(hammerHead, hammerHandle);
        hammerGroup.position.set(2.4, 1, -0.3);
        hammerGroup.rotation.z = -0.5;
        group.add(hammerGroup);

        // ── WIREFRAME HEX SHIELD — subtle brand nod, floats top right ──
        const hexMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 6), hexMat);
        hex.position.set(1.8, -1.6, -1);
        hex.rotation.x = Math.PI / 2.3;
        group.add(hex);

        // ── EMBER PARTICLES — rise upward like sparks from the forge ──
        const emberGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const emberMat = new THREE.MeshPhongMaterial({
            color: 0xFF8A50,
            transparent: true,
            opacity: 0.85,
            emissive: 0xFF6A30,
            emissiveIntensity: 0.9
        });
        const embers = [];
        for (let i = 0; i < 40; i++) {
            const ember = new THREE.Mesh(emberGeo, emberMat.clone());
            ember.position.set(
                -2.2 + (Math.random() - 0.5) * 1.6,
                -1 + Math.random() * 0.4,
                -0.5 + (Math.random() - 0.5) * 1.2
            );
            ember.userData.riseSpeed = 0.004 + Math.random() * 0.008;
            ember.userData.driftX = (Math.random() - 0.5) * 0.0015;
            ember.userData.startY = ember.position.y;
            ember.userData.resetY = ember.position.y - 0.4;
            ember.userData.topY = ember.position.y + 3.2;
            embers.push(ember);
            group.add(ember);
        }

        camera.position.z = 5;
        camera.position.y = 0.3;

        function animate(t) {
            requestAnimationFrame(animate);

            // Whole scene drifts gently, like it's breathing
            group.rotation.y = Math.sin(t * 0.00015) * 0.15;
            group.rotation.x = Math.sin(t * 0.0001) * 0.06;

            // Anvil rotates slowly on its own axis
            anvilGroup.rotation.y += 0.0025;

            // Hammer swings down toward anvil and back up — forging motion
            const swing = Math.sin(t * 0.0012);
            hammerGroup.rotation.z = -0.5 + swing * 0.35;
            hammerGroup.position.y = 1 + Math.abs(swing) * 0.15;

            // Hex shield slowly spins
            hex.rotation.z += 0.0015;

            // Embers rise and fade, reset to bottom when they reach the top
            embers.forEach(ember => {
                ember.position.y += ember.userData.riseSpeed;
                ember.position.x += ember.userData.driftX;
                ember.material.opacity = 0.85 * (1 - (ember.position.y - ember.userData.startY) / 3.2);
                if (ember.position.y > ember.userData.topY) {
                    ember.position.y = ember.userData.resetY;
                    ember.material.opacity = 0.85;
                }
            });

            renderer.render(scene, camera);
        }

        animate(0);

        window.addEventListener('resize', () => {
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        return () => {
            if (renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // TODO: replace with real API call — POST /api/auth/login { email, password }
        // The backend returns { token, user: { role, ... } }
        console.log('Login:', { email, password });

        // TODO: store the real token + user from the API response
        // localStorage.setItem('token', token);
        // localStorage.setItem('user', JSON.stringify(user));

        // TODO: replace this stub role with user.role from the API response
        const role = 'student';

        navigate(ROLE_REDIRECTS[role] || '/dashboard/student');
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center overflow-x-hidden overflow-y-auto font-body-md selection:bg-surface-tint selection:text-surface-container-lowest px-4 py-8 sm:py-6">
            {/* WebGL Shader Background */}
            <div className="absolute inset-0 w-full h-full opacity-60" style={{ display: 'block' }}>
                <canvas ref={shaderCanvasRef} className="shader-canvas" style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>

            {/* ThreeJS Background */}
            <div className="absolute inset-0 w-full h-full mix-blend-screen opacity-40" style={{ display: 'block' }}>
                <div ref={threejsContainerRef} className="threejs-container" style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Particle Canvas */}
            <canvas ref={particleCanvasRef} id="particle-canvas" />

            {/* Main Login Container */}
            <main className="relative z-10 w-full max-w-[380px] my-auto">
                <div className="glass-card rounded-xl p-6 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 login-card-enter">
                    <div className="grain-texture absolute inset-0" />

                    {/* Branding */}
                    <div className="text-center mb-6">
                        <h1 className="font-display-sm text-[34px] sm:text-[38px] three-d-text text-primary tracking-tighter mb-1 leading-[1.1]">
                            Nexforge
                        </h1>
                        <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest leading-[14px]">
                            Build Skills. Forge Futures.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="space-y-1.5 relative group field-enter" style={{ animationDelay: '0.05s' }}>
                            <label className="font-label-caps text-[11px] text-surface-tint ml-1 leading-[14px]">
                                Email or Username
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-surface-tint opacity-70 group-focus-within:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                                <input
                                    className="input-field w-full pl-11 pr-4 py-3.5 rounded-lg border border-white/10 input-recessed text-on-surface placeholder:text-outline-variant focus:outline-none font-body-md"
                                    placeholder="you@nexforge.io"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5 relative group field-enter" style={{ animationDelay: '0.1s' }}>
                            <div className="flex justify-between items-center px-1">
                                <label className="font-label-caps text-[11px] text-surface-tint leading-[14px]">
                                    Password
                                </label>
                                <Link className="font-label-caps text-[10px] text-outline hover:text-surface-tint transition-colors duration-200" to="/forgot-password">
                                    FORGOT?
                                </Link>
                            </div>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-surface-tint opacity-70 group-focus-within:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    className="input-field w-full pl-11 pr-4 py-3.5 rounded-lg border border-white/10 input-recessed text-on-surface placeholder:text-outline-variant focus:outline-none font-body-md"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Primary Action */}
                        <button
                            className="submit-btn w-full py-3.5 rounded-lg bg-surface-tint text-on-primary-fixed font-headline-md text-[15px] font-bold holographic-glow transition-all active:scale-95 group overflow-hidden relative field-enter"
                            style={{ animationDelay: '0.15s' }}
                            type="submit"
                        >
                            <span className="relative z-10">Login</span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6 field-enter" style={{ animationDelay: '0.2s' }}>
                        <div className="h-[1px] flex-1 bg-white/10" />
                        <span className="font-label-caps text-[10px] text-outline-variant uppercase">or</span>
                        <div className="h-[1px] flex-1 bg-white/10" />
                    </div>

                    {/* Bento Social Grid */}
                    <div className="bento-social field-enter" style={{ animationDelay: '0.25s' }}>
                        <button className="social-btn col-span-2 flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="font-label-caps text-[11px]">Google</span>
                        </button>

                    </div>

                    {/* Secondary Navigation */}
                    <div className="mt-6 text-center field-enter" style={{ animationDelay: '0.3s' }}>
                        <Link className="inline-block font-body-md text-[13px] text-on-surface-variant hover:text-surface-tint transition-colors duration-200" to="/signup">
                            New here? <span className="text-surface-tint font-bold">Create account</span>
                        </Link>
                    </div>
                </div>

                {/* System Footer */}
                <footer className="mt-5 text-center">
                    <p className="font-label-caps text-[9px] text-outline-variant uppercase tracking-widest opacity-60">
                        Nexforge Security Protocol v2.4.0 active
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default LoginPage;