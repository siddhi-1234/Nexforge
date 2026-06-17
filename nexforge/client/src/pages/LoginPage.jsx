/* global THREE */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const particleCanvasRef = useRef(null);
    const shaderCanvasRef = useRef(null);
    const threejsContainerRef = useRef(null);

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

        const material = new THREE.MeshPhongMaterial({
            color: 0x64FFDA,
            transparent: true,
            opacity: 0.6,
            shininess: 100,
            emissive: 0x64FFDA,
            emissiveIntensity: 0.5
        });

        const bracketGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const leftBracket = new THREE.Mesh(bracketGeo, material);
        leftBracket.position.set(-2, 1, 0);
        leftBracket.rotation.z = Math.PI / 4;
        group.add(leftBracket);

        const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
        const cubeMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        cube.position.set(2.5, -1, 0);
        group.add(cube);

        const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
        for (let i = 0; i < 15; i++) {
            const orb = new THREE.Mesh(sphereGeo, material);
            orb.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            );
            orb.userData.speed = Math.random() * 0.02;
            group.add(orb);
        }

        camera.position.z = 5;

        function animate(t) {
            requestAnimationFrame(animate);

            group.rotation.y = t * 0.0002;
            group.rotation.x = Math.sin(t * 0.0001) * 0.1;

            cube.rotation.y += 0.01;
            cube.rotation.x += 0.005;

            group.children.forEach(child => {
                if (child.geometry.type === 'SphereGeometry') {
                    child.position.y += Math.sin(t * 0.001 + child.position.x) * 0.005;
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
        console.log('Login:', { email, password });
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center overflow-hidden font-body-md selection:bg-surface-tint selection:text-surface-container-lowest">
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
            <main className="relative z-10 w-full max-w-[400px] px-[20px] md:px-0">
                <div className="glass-card rounded-xl p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="grain-texture absolute inset-0" />

                    {/* Branding */}
                    <div className="text-center mb-10">
                        <h1 className="font-display-xl text-[48px] md:text-[72px] three-d-text text-primary tracking-tighter mb-2 leading-[56px] md:leading-[80px]">
                            Nexforge
                        </h1>
                        <p className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-widest leading-[16px]">
                            Transcend Localhost
                        </p>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="space-y-2 relative group">
                            <label className="font-label-caps text-[12px] text-surface-tint ml-1 leading-[16px]">
                                Identity Key (Email)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-tint text-[20px] opacity-70 group-focus-within:opacity-100 transition-opacity">
                                    mail
                                </span>
                                <input
                                    className="w-full pl-12 pr-4 py-4 rounded-lg border border-white/10 input-recessed text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-surface-tint font-body-md transition-all"
                                    placeholder="architect@nexforge.io"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2 relative group">
                            <div className="flex justify-between items-center px-1">
                                <label className="font-label-caps text-[12px] text-surface-tint leading-[16px]">
                                    Access Code
                                </label>
                                <Link className="font-label-caps text-[10px] text-outline hover:text-surface-tint transition-colors" to="/forgot-password">
                                    LOST CODE?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-tint text-[20px] opacity-70 group-focus-within:opacity-100 transition-opacity">
                                    lock
                                </span>
                                <input
                                    className="w-full pl-12 pr-4 py-4 rounded-lg border border-white/10 input-recessed text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-surface-tint font-body-md transition-all"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Primary Action */}
                        <button className="w-full py-5 rounded-lg bg-surface-tint text-on-primary-fixed font-headline-md text-[16px] font-bold holographic-glow transition-all active:scale-95 group overflow-hidden relative">
                            <span className="relative z-10">Start Building Your Future</span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="h-[1px] flex-1 bg-white/10" />
                        <span className="font-label-caps text-[10px] text-outline-variant uppercase">Neural Link</span>
                        <div className="h-[1px] flex-1 bg-white/10" />
                    </div>

                    {/* Bento Social Grid */}
                    <div className="bento-social">
                        <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                            <img
                                className="w-5 h-5 opacity-80 group-hover:opacity-100"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrMdsRGJaqcZU1TQ4MZipi38f_UHgCMW2CJHRT5k52x28SNtPbrlI3KaqGhhVa2vwgJ1dDfOcE7z6rf8WW5XRmJxyDmyibdIJi7BQo7TFlV42ZxGcl278isIGG4Ofj5NX2RmCcMXWub_tOuMUkLao4on7nva8k5XWHANerdKIjtCrIh2TSIPkVsQ0C6RyGv9GG47m0MFojbzSHr2LguADZIb0RY-5H64cJoosJXN-mls0Z4EPbKbh4ql_R5E-0aDUJp-6dS0mk1gE"
                                alt="Google"
                            />
                            <span className="font-label-caps text-[12px]">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                            <span className="text-[20px] text-white opacity-80 group-hover:opacity-100">terminal</span>
                            <span className="font-label-caps text-[12px]">GitHub</span>
                        </button>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="mt-10 text-center">
                        <Link className="flip-hint inline-block font-body-md text-[16px] text-on-surface-variant hover:text-surface-tint transition-all duration-300" to="/register">
                            New here? <span className="text-surface-tint font-bold">Create account</span>
                        </Link>
                    </div>
                </div>

                {/* System Footer */}
                <footer className="mt-8 text-center">
                    <p className="font-label-caps text-[10px] text-outline-variant uppercase tracking-widest opacity-60">
                        Nexus Security Protocol v2.4.0 active
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default LoginPage;