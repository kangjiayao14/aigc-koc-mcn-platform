import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText, CalendarCheck, Egg, Star, Check, Loader2,
  Trophy, Target, Zap, Gift, X, ChevronRight, TrendingUp,
  Award, Flame, Clock, Sparkles, Coins,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================
interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'daily' | 'easter';
  xpReward: number;
  coinReward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

type TabType = 'all' | 'main' | 'daily' | 'easter';

interface TabDef {
  key: TabType;
  label: string;
  color: string;
  icon: LucideIcon;
}

// =============================================================================
// Constants
// =============================================================================
const TABS: TabDef[] = [
  { key: 'all', label: '全部', color: '#F0F0FF', icon: ScrollText },
  { key: 'main', label: '主线', color: '#FF2A6D', icon: Target },
  { key: 'daily', label: '每日', color: '#00F0FF', icon: CalendarCheck },
  { key: 'easter', label: '彩蛋', color: '#FFD700', icon: Egg },
];

const ICON_MAP: Record<string, LucideIcon> = {
  FileText: ScrollText, Users: Star, PartyPopper: Sparkles, CalendarCheck,
  Sparkles, Compass: Target, Moon: Clock, Flame, Search: Target, Star,
};

const TYPE_CONFIG = {
  main: {
    label: '主线', color: '#FF2A6D', bgColor: 'bg-[#FF2A6D]/10', borderColor: 'border-[#FF2A6D]/30',
    barGradient: 'from-[#FF2A6D] to-[#FF6B9D]' as const,
  },
  daily: {
    label: '每日', color: '#00F0FF', bgColor: 'bg-[#00F0FF]/10', borderColor: 'border-[#00F0FF]/30',
    barGradient: 'from-[#00F0FF] to-[#00D4FF]' as const,
  },
  easter: {
    label: '彩蛋', color: '#FFD700', bgColor: 'bg-[#FFD700]/10', borderColor: 'border-[#FFD700]/30',
    barGradient: 'from-[#FFD700] to-[#FFF5B0]' as const,
  },
};

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'mq1', title: '完成自我介绍', description: '生成你的第一条内容并发布，开启创客之旅',
    type: 'main', xpReward: 50, coinReward: 30, progress: 0, maxProgress: 1,
    completed: false, claimed: false, icon: 'FileText',
  },
  {
    id: 'mq2', title: '达到100粉丝', description: '积累100个真实粉丝，建立自己的粉丝基础',
    type: 'main', xpReward: 100, coinReward: 80, progress: 23, maxProgress: 100,
    completed: false, claimed: false, icon: 'Users',
  },
  {
    id: 'mq3', title: '参加首次社交活动', description: '加入一次线上社交聚会，结识更多创客朋友',
    type: 'main', xpReward: 80, coinReward: 50, progress: 0, maxProgress: 1,
    completed: false, claimed: false, icon: 'PartyPopper',
  },
  {
    id: 'mq4', title: '打造爆款内容', description: '单篇内容获得超过1000个点赞',
    type: 'main', xpReward: 150, coinReward: 100, progress: 678, maxProgress: 1000,
    completed: false, claimed: false, icon: 'Flame',
  },
  {
    id: 'mq5', title: '完成5次内容发布', description: '持续创作，累计发布5篇内容',
    type: 'main', xpReward: 120, coinReward: 70, progress: 3, maxProgress: 5,
    completed: false, claimed: false, icon: 'ScrollText',
  },
  {
    id: 'dq1', title: '登录签到', description: '欢迎回来！每日登录领取奖励',
    type: 'daily', xpReward: 20, coinReward: 10, progress: 1, maxProgress: 1,
    completed: true, claimed: false, icon: 'CalendarCheck',
  },
  {
    id: 'dq2', title: '生成1条内容', description: '使用内容实验室生成至少1条内容',
    type: 'daily', xpReward: 30, coinReward: 20, progress: 0, maxProgress: 1,
    completed: false, claimed: false, icon: 'Sparkles',
  },
  {
    id: 'dq3', title: '浏览5个选题推荐', description: '查看选题雷达中的推荐内容',
    type: 'daily', xpReward: 30, coinReward: 15, progress: 2, maxProgress: 5,
    completed: false, claimed: false, icon: 'Compass',
  },
  {
    id: 'dq4', title: '点赞10篇内容', description: '在大厅中为喜欢的内容点赞',
    type: 'daily', xpReward: 25, coinReward: 15, progress: 4, maxProgress: 10,
    completed: false, claimed: false, icon: 'Star',
  },
  {
    id: 'dq5', title: '完成3个每日任务', description: '积极完成每日目标',
    type: 'daily', xpReward: 40, coinReward: 25, progress: 1, maxProgress: 3,
    completed: false, claimed: false, icon: 'CalendarCheck',
  },
  {
    id: 'eq1', title: '深夜2点访问', description: '在凌晨2点访问创客星球',
    type: 'easter', xpReward: 100, coinReward: 50, progress: 0, maxProgress: 1,
    completed: false, claimed: false, icon: 'Moon',
  },
  {
    id: 'eq2', title: '连续7天签到', description: '累计7天不间断登录',
    type: 'easter', xpReward: 200, coinReward: 100, progress: 3, maxProgress: 7,
    completed: false, claimed: false, icon: 'Flame',
  },
  {
    id: 'eq3', title: '发现隐藏按钮', description: '找到页面上的秘密按钮',
    type: 'easter', xpReward: 100, coinReward: 50, progress: 0, maxProgress: 1,
    completed: false, claimed: false, icon: 'Compass',
  },
  {
    id: 'eq4', title: '和经纪人对话50次', description: '与你的专属经纪人深入交流',
    type: 'easter', xpReward: 150, coinReward: 80, progress: 12, maxProgress: 50,
    completed: false, claimed: false, icon: 'Star',
  },
];

const LEVELS = [
  { level: 1, title: '星际旅者', color: '#00F0FF', xpRequired: 0 },
  { level: 2, title: '内容学徒', color: '#39FF14', xpRequired: 100 },
  { level: 3, title: '创客新星', color: '#BD00FF', xpRequired: 300 },
  { level: 4, title: '流量猎手', color: '#FF2A6D', xpRequired: 600 },
  { level: 5, title: 'KOC 达人', color: '#FFD700', xpRequired: 1000 },
  { level: 6, title: '星球领主', color: 'linear-gradient(90deg, #FFD700, #FF2A6D)', xpRequired: 1500 },
];

// =============================================================================
// QuestCard Component
// =============================================================================
function QuestCard({
  quest,
  onClaim,
  onComplete,
  onDetail,
}: {
  quest: Quest;
  onClaim: (id: string) => void;
  onComplete: (id: string) => void;
  onDetail: (quest: Quest) => void;
}) {
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
    await new Promise((r) => setTimeout(r, 500));
    setShowConfetti(true);
    onClaim(quest.id);
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
      onClick={() => onDetail(quest)}
      data-cursor="pointer"
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

      {/* Confetti */}
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
                  scale: 0, opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full z-20 pointer-events-none"
                style={{ backgroundColor: [config.color, '#00F0FF', '#FFD700', '#39FF14'][i % 4] }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-11 h-11 rounded-lg ${config.bgColor} flex items-center justify-center`}>
            <IconComp size={20} style={{ color: config.color }} />
          </div>
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
                <span className="text-[10px] text-[#8A8AA0]">进度: {quest.progress}/{quest.maxProgress}</span>
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

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-[#8A8AA0]">
                  <Zap size={10} className="text-[#BD00FF]" />
                  +{quest.xpReward} XP
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#8A8AA0]">
                  <Coins size={10} className="text-[#FFD700]" />
                  +{quest.coinReward}
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
                    onClick={(e) => { e.stopPropagation(); handleClaim(); }}
                    disabled={isClaiming}
                    className="btn-cyber px-3 py-1 text-xs font-medium bg-[#00F0FF] text-[#0A0A0F] hover:shadow-glow-cyan transition-shadow disabled:opacity-50 flex items-center gap-1"
                  >
                    {isClaiming ? <Loader2 size={12} className="animate-spin" /> : <Gift size={12} />}
                    {isClaiming ? '领取中' : '领取'}
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
                    onClick={(e) => { e.stopPropagation(); onComplete(quest.id); }}
                    className="px-3 py-1 text-xs font-medium border border-[#00F0FF]/40 text-[#00F0FF] rounded hover:bg-[#00F0FF]/10 transition-colors flex items-center gap-1"
                  >
                    <ChevronRight size={12} />
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
}

// =============================================================================
// Quest Detail Modal
// =============================================================================
function QuestDetailModal({ quest, onClose, onClaim, onComplete }: {
  quest: Quest;
  onClose: () => void;
  onClaim: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const config = TYPE_CONFIG[quest.type];
  const IconComp = ICON_MAP[quest.icon] ?? Star;
  const progressPct = Math.min((quest.progress / quest.maxProgress) * 100, 100);
  const canClaim = quest.completed && !quest.claimed;
  const isDone = quest.claimed;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'var(--void-light)',
          border: `1px solid ${config.color}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 40px ${config.color}15`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 text-center" style={{ background: `linear-gradient(135deg, ${config.color}15, transparent)` }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            data-cursor="pointer"
          >
            <X size={18} />
          </button>
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: `${config.color}20`, border: `1px solid ${config.color}40` }}
          >
            <IconComp size={32} style={{ color: config.color }} />
          </div>
          <span
            className="inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-2"
            style={{ background: `${config.color}20`, color: config.color }}
          >
            {config.label}任务
          </span>
          <h2 className="text-lg font-bold text-text-primary">{quest.title}</h2>
          <p className="text-sm text-text-secondary mt-1">{quest.description}</p>
        </div>

        {/* Progress */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">任务进度</span>
            <span className="text-sm font-medium" style={{ color: config.color }}>
              {quest.progress} / {quest.maxProgress}
            </span>
          </div>
          <div className="h-3 rounded-full bg-[#0A0A0F] overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${config.barGradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2 text-center">
            {isDone ? '任务已完成并领取奖励' : quest.completed ? '任务已完成，请点击领取奖励' : '继续完成任务以获取奖励'}
          </p>
        </div>

        {/* Rewards */}
        <div className="px-6 py-4 border-t border-white/5">
          <h3 className="text-xs font-medium text-text-secondary mb-3">任务奖励</h3>
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-10 h-10 rounded-lg bg-[#BD00FF]/10 flex items-center justify-center">
                <Zap size={18} className="text-[#BD00FF]" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">+{quest.xpReward} XP</p>
                <p className="text-[10px] text-text-muted">经验值</p>
              </div>
            </div>
            <div className="flex-1 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
                <Coins size={18} className="text-[#FFD700]" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">+{quest.coinReward}</p>
                <p className="text-[10px] text-text-muted">金币</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 pb-6">
          {canClaim && (
            <button
              onClick={() => { onClaim(quest.id); onClose(); }}
              className="w-full py-3 rounded-xl text-sm font-bold text-[#0A0A0F] bg-[#00F0FF] hover:shadow-glow-cyan transition-all flex items-center justify-center gap-2"
              data-cursor="pointer"
            >
              <Gift size={16} /> 领取奖励
            </button>
          )}
          {!quest.completed && !isDone && (
            <button
              onClick={() => { onComplete(quest.id); onClose(); }}
              className="w-full py-3 rounded-xl text-sm font-bold border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all"
              data-cursor="pointer"
            >
              去完成任务
            </button>
          )}
          {isDone && (
            <div className="w-full py-3 rounded-xl text-sm font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 flex items-center justify-center gap-2">
              <Check size={16} /> 已完成
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// Stats Panel
// =============================================================================
function StatsPanel({ quests, xp, level }: { quests: Quest[]; xp: number; level: number }) {
  const completed = quests.filter((q) => q.completed).length;
  const claimed = quests.filter((q) => q.claimed).length;
  const levelInfo = LEVELS[Math.min(level - 1, LEVELS.length - 1)] ?? LEVELS[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { label: '已完成任务', value: `${completed}/${quests.length}`, icon: Check, color: '#39FF14' },
        { label: '已领取奖励', value: claimed, icon: Gift, color: '#FFD700' },
        { label: '累计经验', value: `${xp} XP`, icon: TrendingUp, color: '#00F0FF' },
        { label: '当前等级', value: `Lv.${level}`, icon: Award, color: levelInfo.color },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-3 rounded-xl"
          style={{ background: 'rgba(18,18,26,0.8)', border: `1px solid ${stat.color}20` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon size={14} style={{ color: stat.color }} />
            <span className="text-[10px] text-text-muted">{stat.label}</span>
          </div>
          <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================
export default function QuestsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [quests, setQuests] = useState<Quest[]>(DEFAULT_QUESTS);
  const [detailQuest, setDetailQuest] = useState<Quest | null>(null);

  // Simulated user stats
  const [xp] = useState(245);
  const [level] = useState(2);

  const filteredQuests = useMemo(() => {
    if (activeTab === 'all') return quests;
    return quests.filter((q) => q.type === activeTab);
  }, [activeTab, quests]);

  const unclaimedCount = quests.filter((q) => q.completed && !q.claimed).length;

  const handleClaim = useCallback((questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
    );
  }, []);

  const handleComplete = useCallback((questId: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId ? { ...q, progress: q.maxProgress, completed: true } : q
      )
    );
  }, []);

  return (
    <div className="min-h-[100dvh] bg-void relative">
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative z-10 pt-[72px] px-4 py-8 max-w-[800px] mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 flex items-center justify-center border border-[#00F0FF]/20">
              <Trophy size={20} className="text-[#00F0FF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                任务中心
                {unclaimedCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FF2A6D] text-[10px] font-bold text-white animate-badge-pulse">
                    {unclaimedCount}
                  </span>
                )}
              </h1>
              <p className="text-xs text-text-secondary">完成任务，获取丰厚奖励，提升你的创客等级</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsPanel quests={quests} xp={xp} level={level} />

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0A0A0F]/60 border border-white/5 mb-6">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const count = tab.key === 'all'
              ? quests.length
              : quests.filter((q) => q.type === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex-1 justify-center ${
                  activeTab === tab.key ? 'text-[#0A0A0F]' : 'text-[#8A8AA0] hover:text-[#F0F0FF]'
                }`}
                data-cursor="pointer"
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="questPageTabIndicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: tab.color }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  <TabIcon size={12} />
                  {tab.label}
                  <span className={`text-[10px] ${activeTab === tab.key ? 'text-[#0A0A0F]/70' : 'text-[#4A4A60]'}`}>
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Quest List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="space-y-3"
          >
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={handleClaim}
                onComplete={handleComplete}
                onDetail={(q) => setDetailQuest(q)}
              />
            ))}
            {filteredQuests.length === 0 && (
              <div className="text-center py-16 text-[#4A4A60]">
                <Target size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无此类任务</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailQuest && (
          <QuestDetailModal
            quest={detailQuest}
            onClose={() => setDetailQuest(null)}
            onClaim={handleClaim}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
