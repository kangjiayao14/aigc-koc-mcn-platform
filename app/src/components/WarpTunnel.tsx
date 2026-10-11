import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WarpTunnel - 时空漩涡穿越动画
 *
 * Features:
 * - Full-screen CSS conic-gradient vortex with rotate + scale animation
 * - Canvas particle system: particles flying outward from center with trails
 * - Speed lines radiating from center
 * - White flash burst transition
 * - Gender selection buttons appearing mid-transition
 * - Typewriter text effect for "穿越星际隧道..."
 *
 * Animation Sequence:
 * T+0.0s - Vortex starts spinning (speed: 1x)
 * T+0.5s - Typewriter text appears
 * T+1.5s - Gender selection buttons slide in
 * T+2.0s - User makes selection
 * T+2.5s - Vortex accelerates (speed: 3x)
 * T+3.5s - White flash burst
 * T+3.9s - Transition complete callback
 */

interface WarpTunnelProps {
  onComplete: (gender: 'male' | 'female') => void;
}

// Particle type for canvas
interface Particle {
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

// Speed line type
interface SpeedLine {
  angle: number;
  length: number;
  speed: number;
  alpha: number;
  width: number;
}

export default function WarpTunnel({ onComplete }: WarpTunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const speedLinesRef = useRef<SpeedLine[]>([]);
  const rafRef = useRef<number>(0);
  const [phase, setPhase] = useState<'entering' | 'selecting' | 'accelerating' | 'flashing' | 'done'>('entering');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [displayText, setDisplayText] = useState('');
  const fullText = '正在穿越星际隧道...';
  const speedMultiplierRef = useRef(1);

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'entering' && phase !== 'selecting') return;
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [phase]);

  // Phase timing
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('selecting'), 1500));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSelect = useCallback((gender: 'male' | 'female') => {
    if (selectedGender) return;
    setSelectedGender(gender);
    setPhase('accelerating');
    speedMultiplierRef.current = 3;

    // Accelerate for 1s then flash
    setTimeout(() => {
      setPhase('flashing');
      setTimeout(() => {
        setPhase('done');
        onComplete(gender);
      }, 600);
    }, 1200);
  }, [selectedGender, onComplete]);

  // Canvas particle + speed line animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = () => canvas.width / 2;
    const cy = () => canvas.height / 2;

    // Initialize particles
    const createParticle = (): Particle => {
      const colors = ['#00F0FF', '#BD00FF', '#FF2A6D', '#00D4FF', '#FF6B9D', '#39FF14'];
      const angle = Math.random() * Math.PI * 2;
      return {
        x: cx(),
        y: cy(),
        angle,
        speed: 0.5 + Math.random() * 2,
        size: 1 + Math.random() * 3,
        alpha: 0.6 + Math.random() * 0.4,
        decay: 0.005 + Math.random() * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    // Initialize speed lines
    const createSpeedLine = (): SpeedLine => ({
      angle: Math.random() * Math.PI * 2,
      length: 20 + Math.random() * 80,
      speed: 2 + Math.random() * 4,
      alpha: 0.2 + Math.random() * 0.4,
      width: 0.5 + Math.random() * 1.5,
    });

    // Spawn initial pool
    for (let i = 0; i < 80; i++) {
      const p = createParticle();
      // Pre-scatter some particles
      const dist = Math.random() * Math.max(canvas.width, canvas.height) * 0.5;
      p.x = cx() + Math.cos(p.angle) * dist;
      p.y = cy() + Math.sin(p.angle) * dist;
      particlesRef.current.push(p);
    }
    for (let i = 0; i < 30; i++) {
      speedLinesRef.current.push(createSpeedLine());
    }

    const animate = () => {
      const speedMult = speedMultiplierRef.current;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * speedMult})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        p.speed += 0.02 * speedMult;
        p.x += Math.cos(p.angle) * p.speed * speedMult;
        p.y += Math.sin(p.angle) * p.speed * speedMult;
        p.alpha -= p.decay * speedMult;

        if (p.alpha <= 0 || p.x < -100 || p.x > canvas.width + 100 || p.y < -100 || p.y > canvas.height + 100) {
          particlesRef.current[i] = createParticle();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();

          // Trail
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(
            p.x - Math.cos(p.angle) * p.speed * 4,
            p.y - Math.sin(p.angle) * p.speed * 4
          );
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.3;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Update and draw speed lines
      speedLinesRef.current.forEach((line) => {
        const startDist = 30;
        const endDist = startDist + line.length * speedMult;
        const x1 = cx() + Math.cos(line.angle) * startDist;
        const y1 = cy() + Math.sin(line.angle) * startDist;
        const x2 = cx() + Math.cos(line.angle) * endDist;
        const y2 = cy() + Math.sin(line.angle) * endDist;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${line.alpha})`;
        ctx.lineWidth = line.width;
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
      speedLinesRef.current = [];
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      {/* Canvas for particles and speed lines */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Vortex core - conic-gradient spinning rings */}
      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none">
        {/* Outer ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '120vw',
            height: '120vw',
            background: 'conic-gradient(from 0deg, #00F0FF, #BD00FF, #FF2A6D, #00F0FF)',
            filter: 'blur(40px)',
            opacity: 0.15,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8 / speedMultiplierRef.current, repeat: Infinity, ease: 'linear' }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '80vw',
            height: '80vw',
            background: 'conic-gradient(from 90deg, #00F0FF, #BD00FF, #FF2A6D, #00F0FF)',
            filter: 'blur(20px)',
            opacity: 0.2,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 5 / speedMultiplierRef.current, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner bright ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '40vw',
            height: '40vw',
            maxWidth: '400px',
            maxHeight: '400px',
            background: 'conic-gradient(from 180deg, #00F0FF, #BD00FF, #FF2A6D, #00F0FF)',
            filter: 'blur(8px)',
            opacity: 0.35,
          }}
          animate={{ rotate: 360, scale: phase === 'accelerating' ? [1, 1.5, 1] : 1 }}
          transition={{
            rotate: { duration: 3 / speedMultiplierRef.current, repeat: Infinity, ease: 'linear' },
            scale: { duration: 0.5, repeat: Infinity },
          }}
        />
        {/* Core glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: '20vw',
            height: '20vw',
            maxWidth: '200px',
            maxHeight: '200px',
            background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, rgba(189,0,255,0.2) 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        {/* Inward spiral overlay using CSS animation */}
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw',
            height: '60vw',
            maxWidth: '600px',
            maxHeight: '600px',
            background: 'repeating-conic-gradient(from 0deg, transparent 0deg, rgba(0,240,255,0.03) 5deg, transparent 10deg)',
            animation: `warpSpin ${4 / speedMultiplierRef.current}s linear infinite`,
          }}
        />
      </div>

      {/* Typewriter text */}
      <motion.div
        className="absolute bottom-[20%] left-0 right-0 text-center z-[3] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span className="font-orbitron text-xl md:text-2xl text-neon-cyan tracking-widest text-glow-cyan">
          {displayText}
          <span className="animate-pulse">|</span>
        </span>
      </motion.div>

      {/* Gender selection buttons */}
      <AnimatePresence>
        {(phase === 'selecting' || (phase === 'accelerating' && !selectedGender)) && (
          <motion.div
            className="absolute inset-0 flex flex-col md:flex-row items-center justify-center z-[4] gap-6 md:gap-12 px-4 md:px-12 py-8 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <motion.h2
              className="absolute top-[12%] left-0 right-0 text-center text-xl md:text-2xl font-bold tracking-wider"
              style={{ color: '#F0F0FF', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              选择你的专属MCN经纪人
            </motion.h2>

            {/* Male broker card */}
            <motion.button
              className="group relative flex flex-col items-center gap-3 w-[42%] max-w-[320px] pointer-events-auto"
              style={{ background: 'transparent', border: 'none' }}
              initial={{ opacity: 0, x: -80 }}
              animate={{
                opacity: selectedGender === 'female' ? 0.3 : 1,
                x: 0,
                scale: selectedGender === 'male' ? 1.05 : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              whileHover={{ scale: selectedGender ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect('male')}
            >
              <div
                className="relative w-full overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,212,255,0.08) 0%, rgba(0,0,0,0.4) 100%)',
                  border: selectedGender === 'male' ? '2px solid rgba(0,212,255,0.8)' : '1px solid rgba(0,212,255,0.25)',
                  clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
                }}
              >
                {selectedGender === 'male' && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0,212,255,0.25) 0%, transparent 60%)' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <div className="relative w-full h-[32vh] md:h-[40vh] max-h-[400px] flex items-end justify-center z-10">
                  <img
                    src="/broker-male.png"
                    alt="凌霄"
                    className="h-full w-auto object-contain object-bottom"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.3))' }}
                  />
                </div>
                <div className="relative z-10 px-4 pb-4 pt-2 w-full text-left">
                  <h3 className="text-xl md:text-2xl font-bold tracking-wider" style={{ color: '#00D4FF', textShadow: '0 0 12px rgba(0,212,255,0.5)' }}>
                    凌霄
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,255,0.5)' }}>
                    冷峻专业派 · 数据分析大师
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['科技', '商业', '职场', '数据分析'].map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'rgba(240,240,255,0.35)' }}>
                    擅长数据驱动的内容策略，为你打造硬核专业的KOC形象
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Female broker card */}
            <motion.button
              className="group relative flex flex-col items-center gap-3 w-[42%] max-w-[320px] pointer-events-auto"
              style={{ background: 'transparent', border: 'none' }}
              initial={{ opacity: 0, x: 80 }}
              animate={{
                opacity: selectedGender === 'male' ? 0.3 : 1,
                x: 0,
                scale: selectedGender === 'female' ? 1.05 : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              whileHover={{ scale: selectedGender ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect('female')}
            >
              <div
                className="relative w-full overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,107,157,0.08) 0%, rgba(0,0,0,0.4) 100%)',
                  border: selectedGender === 'female' ? '2px solid rgba(255,107,157,0.8)' : '1px solid rgba(255,107,157,0.25)',
                  clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
                }}
              >
                {selectedGender === 'female' && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,107,157,0.25) 0%, transparent 60%)' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <div className="relative w-full h-[32vh] md:h-[40vh] max-h-[400px] flex items-end justify-center z-10">
                  <img
                    src="/broker-female.png"
                    alt="梦璃"
                    className="h-full w-auto object-contain object-bottom"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(255,107,157,0.3))' }}
                  />
                </div>
                <div className="relative z-10 px-4 pb-4 pt-2 w-full text-left">
                  <h3 className="text-xl md:text-2xl font-bold tracking-wider" style={{ color: '#FF6B9D', textShadow: '0 0 12px rgba(255,107,157,0.5)' }}>
                    梦璃
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,255,0.5)' }}>
                    温暖创意派 · 视觉美学专家
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['时尚', '美食', '旅行', '视觉美学'].map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,107,157,0.12)', border: '1px solid rgba(255,107,157,0.3)', color: '#FF6B9D' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'rgba(240,240,255,0.35)' }}>
                    用温暖治愈的视角，帮你发现生活中的美好瞬间
                  </p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* White flash burst */}
      <AnimatePresence>
        {phase === 'flashing' && (
          <motion.div
            className="fixed inset-0 z-[200] bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.3, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
