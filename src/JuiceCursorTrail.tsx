/**
 * Creativity Juice — Custom Cursor & Click Splash
 * Clean, minimal glowing amber cursor with organic 'juice' droplet splash strictly on click
 */

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  life: number;
  maxLife: number;
  color: string;
  glowColor: string;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const JUICE_PALETTE = [
  { fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' },   // Amber
  { fill: '#F97316', glow: 'rgba(249, 115, 22, 0.6)' },   // Tangerine
  { fill: '#FBBF24', glow: 'rgba(251, 191, 36, 0.55)' },  // Warm Gold
  { fill: '#FB923C', glow: 'rgba(251, 146, 60, 0.55)' },  // Citrus Peach
  { fill: '#FDE047', glow: 'rgba(253, 224, 71, 0.5)' },   // Lemon Juice
];

export const JuiceCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    // Only enable on pointer-fine devices (desktop mice/trackpads)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates & lerped ring position
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let hasMoved = false;

    const particles: Particle[] = [];
    const ripples: ClickRipple[] = [];

    // Spawn splash droplets only on click
    const spawnClickSplash = (x: number, y: number) => {
      // 1. Splash droplets radiating outward with organic burst
      const count = 14 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const p = JUICE_PALETTE[Math.floor(Math.random() * JUICE_PALETTE.length)];
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const speed = 1.8 + Math.random() * 3.4;
        const size = 3 + Math.random() * 4.5;
        const life = 28 + Math.floor(Math.random() * 18);

        particles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.35, // slight liquid gravitational pull
          size,
          maxSize: size,
          life,
          maxLife: life,
          color: p.fill,
          glowColor: p.glow,
        });
      }

      // 2. Subtle expanding liquid wave ring on click
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius: 28,
        alpha: 0.6,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved) {
        ringX = mouseX;
        ringY = mouseY;
        hasMoved = true;
        setIsVisible(true);
      }

      // Check if mouse is over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('a, button, [role="button"], input, textarea, select, .cursor-pointer');
        setIsHovering(!!interactive);
      }

      // Update center cursor DOM directly with zero latency
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      // Spawn droplet splash strictly on click
      spawnClickSplash(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp for outer cursor ring
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      // 1. Draw expanding liquid ripples from clicks
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.18 + 0.6;
        r.alpha *= 0.88;

        if (r.alpha < 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${r.alpha * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw click juice splash droplets
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.93; // liquid friction
        p.vy *= 0.93;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife; // 1 -> 0
        const currentSize = p.maxSize * Math.max(0.2, progress);
        const alpha = Math.pow(progress, 1.2);

        ctx.save();
        // Glowing halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor.replace(/[\d\.]+\)$/, `${alpha * 0.4})`);
        ctx.fill();

        // Droplet body
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fill();

        // Glossy light reflection dot
        if (currentSize > 2.2) {
          ctx.beginPath();
          ctx.arc(p.x - currentSize * 0.32, p.y - currentSize * 0.32, currentSize * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = alpha * 0.8;
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <>
      {/* 60fps Click Splash Droplets Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998] select-none"
        style={{ willChange: 'contents' }}
      />

      {/* Floating Outer Juice Ring (Lerped) */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 will-change-transform ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: 0, top: 0 }}
      >
        <div
          className={`rounded-full transition-all duration-200 flex items-center justify-center ${
            isHovering
              ? 'w-9 h-9 -ml-4.5 -mt-4.5 bg-gradient-to-tr from-amber-500/25 to-orange-400/20 border-2 border-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.5)] backdrop-blur-[1px]'
              : isMouseDown
              ? 'w-5 h-5 -ml-2.5 -mt-2.5 scale-90 bg-amber-500/35 border border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
              : 'w-7 h-7 -ml-3.5 -mt-3.5 border border-amber-500/35 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          }`}
        />
      </div>

      {/* Instant Center Juice Droplet Core */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[100000] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 will-change-transform ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: 0, top: 0 }}
      >
        <div
          className={`rounded-full transition-transform duration-150 relative ${
            isHovering
              ? 'w-2.5 h-2.5 -ml-1.25 -mt-1.25 scale-125 bg-amber-400 shadow-[0_0_8px_#F59E0B]'
              : isMouseDown
              ? 'w-2.5 h-2.5 -ml-1.25 -mt-1.25 scale-75 bg-orange-500 shadow-[0_0_10px_#F97316]'
              : 'w-2 h-2 -ml-1 -mt-1 bg-amber-500 shadow-[0_0_6px_#FBBF24]'
          }`}
        >
          {/* Subtle juice glossy reflection on center droplet */}
          <span className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white/90" />
        </div>
      </div>
    </>
  );
};

export default JuiceCursorTrail;
