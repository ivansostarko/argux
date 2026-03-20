import { useEffect, useRef } from 'react';
import { theme } from '../../lib/theme';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    alpha: number;
    pulse: number;
    pulseSpeed: number;
}

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const scanRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let w = 0;
        let h = 0;
        let particles: Particle[] = [];

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            const count = Math.floor((w * h) / 12000);
            particles = Array.from({ length: Math.min(count, 160) }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.8 + 0.5,
                alpha: Math.random() * 0.5 + 0.15,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.015 + 0.005,
            }));
        };

        const handleMouse = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouse);

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // Base background
            ctx.fillStyle = theme.bg;
            ctx.fillRect(0, 0, w, h);

            // Subtle grid
            ctx.strokeStyle = 'rgba(29,111,239,0.025)';
            ctx.lineWidth = 0.5;
            const grid = 50;
            for (let x = 0; x < w; x += grid) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += grid) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Radar rings centered
            const cx = w / 2;
            const cy = h / 2;
            for (let r = 120; r < Math.max(w, h) * 0.55; r += 140) {
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(29,111,239,${0.022 * (1 - r / (Math.max(w, h) * 0.55))})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // Scan line
            scanRef.current = (scanRef.current + 0.25) % h;
            const grad = ctx.createLinearGradient(0, scanRef.current - 80, 0, scanRef.current + 80);
            grad.addColorStop(0, 'rgba(29,111,239,0)');
            grad.addColorStop(0.5, 'rgba(29,111,239,0.02)');
            grad.addColorStop(1, 'rgba(29,111,239,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, scanRef.current - 80, w, 160);

            // Update & draw particles
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += p.pulseSpeed;

                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;

                // Mouse repulsion
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120 * 0.015;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                // Damping
                p.vx *= 0.998;
                p.vy *= 0.998;

                const a = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(29,111,239,${a})`;
                ctx.fill();

                // Glow ring for larger particles
                if (p.r > 1.2) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(29,111,239,${a * 0.15})`;
                    ctx.fill();
                }
            }

            // Connection lines
            const connectionDist = 130;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(29,111,239,${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Mouse attraction lines
            if (mx > 0 && my > 0) {
                for (const p of particles) {
                    const dx = p.x - mx;
                    const dy = p.y - my;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 180) {
                        const alpha = (1 - dist / 180) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mx, my);
                        ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
                        ctx.lineWidth = 0.4;
                        ctx.stroke();
                    }
                }
            }

            // Corner brackets
            const cs = 18;
            ctx.strokeStyle = 'rgba(29,111,239,0.12)';
            ctx.lineWidth = 1;
            const corners: [number, number, number, number][] = [
                [24, 24, 1, 1],
                [w - 24, 24, -1, 1],
                [24, h - 24, 1, -1],
                [w - 24, h - 24, -1, -1],
            ];
            for (const [x, y, dx, dy] of corners) {
                ctx.beginPath();
                ctx.moveTo(x, y + cs * dy);
                ctx.lineTo(x, y);
                ctx.lineTo(x + cs * dx, y);
                ctx.stroke();
            }

            animRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
            cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
