import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, CalendarCheck, Egg } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Quest } from '@/hooks/useGameState';
import QuestCard from './QuestCard';

interface QuestSystemProps {
  quests: Quest[];
  onClaim: (questId: string) => void;
  onComplete: (questId: string) => void;
}

type TabType = 'all' | 'main' | 'daily' | 'easter';

interface TabDef {
  key: TabType;
  label: string;
  color: string;
  icon: LucideIcon;
}

const TABS: TabDef[] = [
  { key: 'all', label: '全部', color: '#F0F0FF', icon: ScrollText },
  { key: 'main', label: '主线', color: '#FF2A6D', icon: ScrollText },
  { key: 'daily', label: '每日', color: '#00F0FF', icon: CalendarCheck },
  { key: 'easter', label: '彩蛋', color: '#FFD700', icon: Egg },
];

const QuestSystem = memo(function QuestSystem({ quests, onClaim, onComplete }: QuestSystemProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredQuests = activeTab === 'all'
    ? quests
    : quests.filter((q) => q.type === activeTab);

  const unclaimedCount = quests.filter((q) => q.completed && !q.claimed).length;

  return (
    <div className="w-full">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[#F0F0FF] flex items-center gap-2">
          <ScrollText size={18} className="text-[#00F0FF]" />
          任务中心
          {unclaimedCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FF2A6D] text-[10px] font-bold text-white animate-badge-pulse">
              {unclaimedCount}
            </span>
          )}
        </h2>
      </div>

      {/* Tab buttons */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0A0A0F]/60 border border-white/5 mb-4">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const count = tab.key === 'all'
            ? quests.length
            : quests.filter((q) => q.type === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex-1 justify-center ${
                activeTab === tab.key
                  ? 'text-[#0A0A0F]'
                  : 'text-[#8A8AA0] hover:text-[#F0F0FF]'
              }`}
              data-cursor="pointer"
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="questTabIndicator"
                  className="absolute inset-0 rounded-md"
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

      {/* Quest list */}
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
              onClaim={onClaim}
              onComplete={onComplete}
            />
          ))}
          {filteredQuests.length === 0 && (
            <div className="text-center py-8 text-[#4A4A60] text-sm">
              暂无此类任务
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default QuestSystem;
