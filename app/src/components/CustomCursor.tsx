import { useEffect, useRef, useCallback } from 'react';

/**
 * CustomCursor - Cyberpunk styled custom cursor
 *
 * Default: 8px cyan dot with mix-blend-mode: difference
 * Hover on links/buttons: scales to 24px + ring appears
 *
 * TODO: Add magnetic attraction effect for buttons (80px range, 4-8px offset)
 * TODO: Add drag gesture cursor state
 * TODO: Add text input I-beam cursor state
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    // Smooth lerp follow
    posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.15;
    posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.15;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${posRef.current.x - 4}px, ${posRef.current.y - 4}px)`;
    }
    if (ringRef.current) {
      const ringSize = isHoveringRef.current ? 24 : 0;
      const ringOffset = ringSize / 2;
      ringRef.current.style.transform = `translate(${posRef.current.x - ringOffset}px, ${posRef.current.y - ringOffset}px) scale(${isHoveringRef.current ? 1 : 0})`;
      ringRef.current.style.opacity = isHoveringRef.current ? '1' : '0';
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const handleMouseEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const handleHoverStart = (_e: Event) => {
      isHoveringRef.current = true;
      if (dotRef.current) {
        dotRef.current.style.width = '24px';
        dotRef.current.style.height = '24px';
        dotRef.current.style.transform = `translate(${targetRef.current.x - 12}px, ${targetRef.current.y - 12}px)`;
      }
    };

    const handleHoverEnd = () => {
      isHoveringRef.current = false;
      if (dotRef.current) {
        dotRef.current.style.width = '8px';
        dotRef.current.style.height = '8px';
      }
    };

    // Add listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Add hover detection for interactive elements
    const interactiveSelectors = 'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]';
    const addHoverListeners = () => {
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });
    addHoverListeners();

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      {/* Main dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-neon-cyan transition-[width,height] duration-200 ease-cyber"
        style={{
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      {/* Ring on hover */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-neon-cyan transition-all duration-200 ease-cyber"
        style={{
          opacity: 0,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
