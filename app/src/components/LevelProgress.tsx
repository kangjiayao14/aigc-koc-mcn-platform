import { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Check } from 'lucide-react';
import HexBadge from './HexBadge';
import { LEVELS } from '@/hooks/useGameState';

interface LevelProgressProps {
  level: number;
  xp: number;
  xpProgress: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
}

const PRIVILEGES = [
  '每日签到奖励 +10%',
  '内容生成次数 +2',
  '解锁经纪人换装功能',
  '解锁社交星球高级房间',
  '专家工坊深度分析模式',
  '星球领主专属称号展示',
];

const LevelProgress = memo(function LevelProgress({
  level,
  xp,
  xpProgress,
  currentLevelBaseXp: _currentLevelBaseXp,
  nextLevelXp,
}: LevelProgressProps) {
  const levelData = LEVELS[Math.min(level - 1, LEVELS.length - 1)] ?? LEVELS[0];
  const isMaxLevel = level >= LEVELS.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="rounded-2xl border border-white/5 bg-[#12121A]/80 backdrop-blur-sm p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[#39FF14]" />
        <h2 className="text-base font-medium text-[#F0F0FF]">等级与进度</h2>
      </div>

      {/* Badge + Info */}
      <div className="flex items-center gap-4 mb-4">
        <HexBadge level={level} size={52} />
        <div>
          <h3 className="text-sm font-medium" style={{ color: typeof levelData.color === 'string' && !levelData.color.startsWith('linear') ? levelData.color : '#FFD700' }}>
            {levelData.title}
          </h3>
          <p className="text-xs text-[#8A8AA0] mt-0.5">
            Lv.{level} {isMaxLevel ? '(已满级)' : `→ Lv.${level + 1}`}
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#8A8AA0]">经验值</span>
          <span className="text-[11px] font-mono text-[#8A8AA0]">
            {xp} / {isMaxLevel ? 'MAX' : nextLevelXp} XP
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#0A0A0F] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] via-[#BD00FF] to-[#FF2A6D]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(xpProgress, 100)}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          />
        </div>
        {!isMaxLevel && (
          <p className="text-[10px] text-[#4A4A60] mt-1">
            还需 {nextLevelXp - xp} XP 升级
          </p>
        )}
      </div>

      {/* Level privileges */}
      <div>
        <p className="text-[11px] text-[#8A8AA0] mb-2">等级特权</p>
        <div className="space-y-1.5">
          {PRIVILEGES.map((priv, i) => {
            const unlocked = i < level;
            return (
              <div
                key={priv}
                className={`flex items-center gap-2 text-xs ${unlocked ? 'text-[#F0F0FF]' : 'text-[#4A4A60]'}`}
              >
                {unlocked ? (
                  <Check size={12} className="text-[#39FF14] flex-shrink-0" />
                ) : (
                  <Lock size={12} className="flex-shrink-0" />
                )}
                <span>{priv}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});

export default LevelProgress;
