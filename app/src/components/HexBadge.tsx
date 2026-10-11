import { memo } from 'react';
import { LEVELS } from '@/hooks/useGameState';

interface HexBadgeProps {
  level: number;
  size?: number;
  showGlow?: boolean;
}

const HexBadge = memo(function HexBadge({ level, size = 56, showGlow = true }: HexBadgeProps) {
  const levelData = LEVELS[Math.min(level - 1, LEVELS.length - 1)] ?? LEVELS[0];
  const isGradient = typeof levelData.color === 'string' && levelData.color.startsWith('linear-gradient');

  // Hexagon points
  const w = size;
  const h = size * 1.1547; // hexagon height ratio
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 2;
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: w, height: h }}>
      {/* Glow effect */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full opacity-40 animate-neon-pulse"
          style={{
            background: isGradient ? levelData.color : `radial-gradient(circle, ${levelData.color}40 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
      )}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="relative z-10">
        {/* Outer hexagon border */}
        <polygon
          points={points}
          fill="none"
          stroke={isGradient ? '#FFD700' : levelData.color}
          strokeWidth="2"
          opacity="0.8"
        />
        {/* Inner hexagon fill */}
        <polygon
          points={points}
          fill={isGradient ? 'url(#hexGrad)' : `${levelData.color}20`}
        />
        {/* Level number */}
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill={isGradient ? '#FFD700' : levelData.color}
          fontSize={size * 0.4}
          fontWeight="700"
          fontFamily="Orbitron, sans-serif"
        >
          {level}
        </text>
        {/* Gradient definition for high levels */}
        {isGradient && (
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FF2A6D" />
            </linearGradient>
          </defs>
        )}
      </svg>
    </div>
  );
});

export default HexBadge;
