import { useState, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText, Users, PartyPopper, CalendarCheck, Sparkles, Compass,
  Moon, Flame, Search, Star, Check, Loader2,
} from 'lucide-react';
import type { Quest } from '@/hooks/useGameState';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  FileText, Users, PartyPopper, CalendarCheck, Sparkles, Compass,
  Moon, Flame, Search, Star,
};

const TYPE_CONFIG = {
  main: { label: '主线', color: '#FF2A6D', bgColor: 'bg-[#FF2A6D]/10', borderColor: 'border-[#FF2A6D]/30', barGradient: 'from-[#FF2A6D] to-[#FF6B9D]' },
  daily: { label: '每日', color: '#00F0FF', bgColor: 'bg-[#00F0FF]/10', borderColor: 'border-[#00F0FF]/30', barGradient: 'from-[#00F0FF] to-[#00D4FF]' },
  easter: { label: '彩蛋', color: '#FFD700', bgColor: 'bg-[#FFD700]/10', borderColor: 'border-[#FFD700]/30', barGradient: 'from-[#FFD700] to-[#FFF5B0]' },
};

interface QuestCardProps {
  quest: Quest;
  onClaim: (questId: string) => void;
  onComplete: (questId: string) => void;
}

const QuestCard = memo(function QuestCard({ quest, onClaim, onComplete }: QuestCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const config = TYPE_CONFIG[quest.type];
  const IconComp = ICON_MAP[quest.icon] ?? Star;
  const progressPct = Math.min((quest.progress / quest.maxProgress) * 100, 100);
  const canClaim = quest.completed && !quest.claimed;
  const isDone = quest.claimed;

  const handleClaim = async () => {
    if (!canClaim || isClaiming) return;
    setIsClaiming(true);

    // Simulate processing
    await new Promise((r) => setTimeout(r, 500));

    setShowConfetti(true);
    onClaim(quest.id);

    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
      setIsClaiming(false);
    }, 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={`relative overflow-hidden rounded-xl border ${config.borderColor} bg-[#12121A]/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${isDone ? 'opacity-60' : ''}`}
    >
      {/* Completed overlay */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-[#0A0A0F]/40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/40"
            >
              <Check size={18} className="text-[#39FF14]" />
              <span className="text-sm font-medium text-[#39FF14]">已完成</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti particles */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200 - 50,
                  scale: 0,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full z-20 pointer-events-none"
                style={{
                  backgroundColor: [config.color, '#00F0FF', '#FFD700', '#39FF14'][i % 4],
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-11 h-11 rounded-lg ${config.bgColor} flex items-center justify-center`}
          >
            <IconComp size={20} className="text-current" style={{ color: config.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                {config.label}
              </span>
              <h4 className="text-sm font-medium text-[#F0F0FF] truncate">{quest.title}</h4>
            </div>
            <p className="text-xs text-[#8A8AA0] mb-2 line-clamp-1">{quest.description}</p>

            {/* Progress bar */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#8A8AA0]">
                  进度: {quest.progress}/{quest.maxProgress}
                </span>
                <span className="text-[10px] text-[#8A8AA0]">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#0A0A0F] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${config.barGradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                />
              </div>
            </div>

            {/* Footer: Rewards + Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-[#8A8AA0]">
                  <Sparkles size={10} className="text-[#BD00FF]" />
                  +{quest.xpReward} XP
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#8A8AA0]">
                  <Star size={10} className="text-[#FFD700]" />
                  +{quest.coinReward} 金币
                </span>
              </div>

              <AnimatePresence mode="wait">
                {canClaim && (
                  <motion.button
                    key="claim"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="btn-cyber px-3 py-1 text-xs font-medium bg-[#00F0FF] text-[#0A0A0F] hover:shadow-glow-cyan transition-shadow disabled:opacity-50"
                  >
                    {isClaiming ? <Loader2 size={12} className="animate-spin" /> : '领取'}
                  </motion.button>
                )}
                {!quest.completed && !isDone && (
                  <motion.button
                    key="do"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onComplete(quest.id)}
                    className="px-3 py-1 text-xs font-medium border border-[#00F0FF]/40 text-[#00F0FF] rounded hover:bg-[#00F0FF]/10 transition-colors"
                  >
                    去完成
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default QuestCard;
