import { useEffect, useRef } from 'react';

interface Particle {
    x: number; y: number; vx: number; vy: number;
    r: number; alpha: number; pulse: number; pulseSpeed: number;
}

interface Props {
    accentColor?: string;
    secondaryColor?: string;
    particleCount?: number;
    glitch?: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

export default function ErrorParticles({ accentColor = '#ef4444', secondaryColor = '#1d6fef', particleCount = 60, glitch = false }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const glitchRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let w = 0, h = 0;
        let particles: Particle[] = [];
        const [ar, ag, ab] = hexToRgb(accentColor);
        const [sr, sg, sb] = hexToRgb(secondaryColor);

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            const count = Math.min(particleCount, Math.floor((w * h) / 12000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 0.5, alpha: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.02 + 0.005,
            }));
        };

        resize();
        window.addEventListener('resize', resize);

        const handleMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', handleMouse);

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // Radial gradient background glow
            const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
            grd.addColorStop(0, `rgba(${ar},${ag},${ab},0.03)`);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, w, h);

            // Scan line
            glitchRef.current += 0.3;
            const scanY = (glitchRef.current % (h + 100)) - 50;
            ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.04)`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();

            // Glitch effect
            if (glitch && Math.random() < 0.02) {
                const gy = Math.random() * h;
                const gh = Math.random() * 8 + 2;
                ctx.fillStyle = `rgba(${ar},${ag},${ab},0.06)`;
                ctx.fillRect(0, gy, w, gh);
                if (Math.random() < 0.5) {
                    ctx.fillStyle = `rgba(${sr},${sg},${sb},0.04)`;
                    ctx.fillRect(Math.random() * w * 0.3, gy + gh, w * 0.7, 1);
                }
            }

            // Grid lines
            ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.015)`;
            ctx.lineWidth = 0.5;
            for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            // Particles
            for (const p of particles) {
                p.x += p.vx; p.y += p.vy;
                p.pulse += p.pulseSpeed;
                if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

                // Mouse repulsion
                const dx = p.x - mx, dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120 * 0.8;
                    p.vx += (dx / dist) * force * 0.3;
                    p.vy += (dy / dist) * force * 0.3;
                }
                p.vx *= 0.99; p.vy *= 0.99;

                const a = (p.alpha + Math.sin(p.pulse) * 0.15);
                const useAccent = Math.random() > 0.3;
                ctx.fillStyle = useAccent ? `rgba(${ar},${ag},${ab},${a})` : `rgba(${sr},${sg},${sb},${a * 0.6})`;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            }

            // Connection lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 120) {
                        const a = (1 - d / 120) * 0.12;
                        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${a})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                    }
                }
            }

            // Center warning rings (pulsing)
            const ringAlpha = 0.02 + Math.sin(Date.now() / 1500) * 0.01;
            for (let r = 80; r < 300; r += 60) {
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${ringAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke();
            }

            animRef.current = requestAnimationFrame(draw);
        };

        draw();
        return () => { window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouse); cancelAnimationFrame(animRef.current); };
    }, [accentColor, secondaryColor, particleCount, glitch]);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}
