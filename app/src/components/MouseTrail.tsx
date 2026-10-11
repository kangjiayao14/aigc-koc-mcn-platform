import { useEffect, useRef, useCallback } from 'react';

/**
 * MouseTrail - Canvas-based neon light trail effect
 *
 * Multi-color neon trail (cyan, magenta, violet alternating)
 * 2-second fade out with globalCompositeOperation: 'lighter'
 * Stores last 20 position points, renders as shrinking circles
 *
 * TODO: Adjust trail length and fade duration per page
 * TODO: Add velocity-based trail width (faster = wider)
 */
interface TrailPoint {
  x: number;
  y: number;
  time: number;
  color: string;
  size: number;
}

const TRAIL_COLORS = ['#00F0FF', '#FF2A6D', '#BD00FF'];
const MAX_POINTS = 30;
const TRAIL_DURATION = 2000; // 2 seconds

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const rafRef = useRef<number>(0);
  const colorIndexRef = useRef(0);
  const lastTimeRef = useRef(0);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = time;
    // const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Remove expired points
    pointsRef.current = pointsRef.current.filter(
      (p) => now - p.time < TRAIL_DURATION
    );

    // Add new point if mouse moved
    const mouse = mouseRef.current;
    const dist = Math.hypot(mouse.x - mouse.prevX, mouse.y - mouse.prevY);

    if (dist > 2 && pointsRef.current.length < MAX_POINTS) {
      // Cycle colors based on position in trail
      colorIndexRef.current = (colorIndexRef.current + 1) % TRAIL_COLORS.length;

      pointsRef.current.push({
        x: mouse.x,
        y: mouse.y,
        time: now,
        color: TRAIL_COLORS[colorIndexRef.current],
        size: Math.min(6 + dist * 0.3, 10),
      });

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    }

    // Draw trail
    ctx.globalCompositeOperation = 'lighter';

    pointsRef.current.forEach((point) => {
      const age = (now - point.time) / TRAIL_DURATION;
      const opacity = 1 - age;
      const size = point.size * (1 - age * 0.5);

      if (opacity <= 0) return;

      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.globalAlpha = opacity * 0.4;
      ctx.fill();

      // Inner glow
      ctx.beginPath();
      ctx.arc(point.x, point.y, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = opacity * 0.3;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 15 }}
    />
  );
}
