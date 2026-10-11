import { useState, useEffect, useCallback } from 'react';

// --- Types ---

export interface Quest {
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
  icon: string; // lucide icon name
}

export interface Activity {
  id: string;
  type: 'content' | 'quest' | 'social' | 'level' | 'login';
  title: string;
  description: string;
  timestamp: number;
}

export interface GameState {
  xp: number;
  coins: number;
  level: number;
  energy: number;
  maxEnergy: number;
  quests: Quest[];
  activities: Activity[];
  brokerType: 'male' | 'female';
  brokerName: string;
  username: string;
}

// --- Constants ---

const LEVELS = [
  { level: 1, title: '星际旅者', color: '#00F0FF', xpRequired: 0 },
  { level: 2, title: '内容学徒', color: '#39FF14', xpRequired: 100 },
  { level: 3, title: '创客新星', color: '#BD00FF', xpRequired: 300 },
  { level: 4, title: '流量猎手', color: '#FF2A6D', xpRequired: 600 },
  { level: 5, title: 'KOC 达人', color: '#FFD700', xpRequired: 1000 },
  { level: 6, title: '星球领主', color: 'linear-gradient(90deg, #FFD700, #FF2A6D)', xpRequired: 1500 },
];

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'mq1', title: '完成自我介绍', description: '生成你的第一条内容并发布',
    type: 'main', xpReward: 50, coinReward: 30, progress: 0, maxProgress: 1,
    completed: false, claimed: false, icon: 'FileText',
  },
  {
    id: 'mq2', title: '达到100粉丝', description: '积累100个真实粉丝',
    type: 'main', xpReward: 100, coinReward: 80, progress: 23, maxProgress: 100,
    completed: false, claimed: false, icon: 'Users',
  },
  {
    id: 'mq3', title: '参加首次社交活动', description: '加入一次线上社交聚会',
    type: 'main', xpReward: 80, coinReward: 50, progress: 0, maxProgress: 1,
    completed: false, claimed: false, icon: 'PartyPopper',
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
    completed: false, claimed: false, icon: 'Search',
  },
];

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'a1', type: 'login', title: '每日登录',
    description: '获得 20 XP + 10 金币', timestamp: Date.now() - 3600000,
  },
  {
    id: 'a2', type: 'content', title: '生成了推文',
    description: 'AI生成: "2024年最值得入手的10件数码好物"', timestamp: Date.now() - 7200000,
  },
  {
    id: 'a3', type: 'social', title: '加入话题讨论',
    description: '参与了 #秋冬穿搭 话题', timestamp: Date.now() - 86400000,
  },
  {
    id: 'a4', type: 'quest', title: '完成任务',
    description: '完成「首次登录」任务', timestamp: Date.now() - 172800000,
  },
];

const LS_KEYS = {
  XP: 'pcg_xp',
  COINS: 'pcg_coins',
  LEVEL: 'pcg_level',
  ENERGY: 'pcg_energy',
  QUESTS: 'pcg_quests',
  ACTIVITIES: 'pcg_activities',
  BROKER_TYPE: 'pcg_broker_type',
  BROKER_NAME: 'pcg_broker_name',
  USERNAME: 'pcg_username',
};

// --- Helper Functions ---

export function getLevelInfo(level: number) {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)] ?? LEVELS[0];
}

export function getNextLevelXp(level: number): number {
  const idx = Math.min(level - 1, LEVELS.length - 1);
  return LEVELS[idx]?.xpRequired ?? 0;
}

export function getCurrentLevelBaseXp(level: number): number {
  if (level <= 1) return 0;
  return LEVELS[Math.min(level - 2, LEVELS.length - 1)]?.xpRequired ?? 0;
}

export function checkLevelUp(currentLevel: number, totalXp: number): boolean {
  const nextThreshold = getNextLevelXp(currentLevel + 1);
  if (currentLevel >= LEVELS.length) return false;
  return totalXp >= nextThreshold;
}

// --- Hook ---

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    // Load from localStorage or use defaults
    const xp = parseInt(localStorage.getItem(LS_KEYS.XP) ?? '45', 10);
    const coins = parseInt(localStorage.getItem(LS_KEYS.COINS) ?? '350', 10);
    const level = parseInt(localStorage.getItem(LS_KEYS.LEVEL) ?? '1', 10);
    const energy = parseInt(localStorage.getItem(LS_KEYS.ENERGY) ?? '100', 10);
    const quests = localStorage.getItem(LS_KEYS.QUESTS)
      ? JSON.parse(localStorage.getItem(LS_KEYS.QUESTS)!)
      : DEFAULT_QUESTS;
    const activities = localStorage.getItem(LS_KEYS.ACTIVITIES)
      ? JSON.parse(localStorage.getItem(LS_KEYS.ACTIVITIES)!)
      : DEFAULT_ACTIVITIES;
    const brokerType = (localStorage.getItem(LS_KEYS.BROKER_TYPE) ?? 'male') as 'male' | 'female';
    const brokerName = localStorage.getItem(LS_KEYS.BROKER_NAME) ?? '凌霄';
    const username = localStorage.getItem(LS_KEYS.USERNAME) ?? '创客';

    return { xp, coins, level, energy, maxEnergy: 100, quests, activities, brokerType, brokerName, username };
  });

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem(LS_KEYS.XP, String(state.xp));
    localStorage.setItem(LS_KEYS.COINS, String(state.coins));
    localStorage.setItem(LS_KEYS.LEVEL, String(state.level));
    localStorage.setItem(LS_KEYS.ENERGY, String(state.energy));
    localStorage.setItem(LS_KEYS.QUESTS, JSON.stringify(state.quests));
    localStorage.setItem(LS_KEYS.ACTIVITIES, JSON.stringify(state.activities));
  }, [state.xp, state.coins, state.level, state.energy, state.quests, state.activities]);

  // Claim a quest reward
  const claimQuest = useCallback((questId: string) => {
    setState((prev) => {
      const quest = prev.quests.find((q) => q.id === questId);
      if (!quest || quest.claimed) return prev;

      const newQuests = prev.quests.map((q) =>
        q.id === questId ? { ...q, claimed: true, completed: true } : q
      );

      const newXp = prev.xp + quest.xpReward;
      const newCoins = prev.coins + quest.coinReward;

      // Check level up
      let newLevel = prev.level;
      if (checkLevelUp(prev.level, newXp)) {
        newLevel = Math.min(prev.level + 1, LEVELS.length);
      }

      // Add activity
      const newActivity: Activity = {
        id: `a${Date.now()}`,
        type: 'quest',
        title: `完成任务: ${quest.title}`,
        description: `获得 ${quest.xpReward} XP + ${quest.coinReward} 金币`,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        quests: newQuests,
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        activities: [newActivity, ...prev.activities].slice(0, 50),
      };
    });
  }, []);

  // Complete a quest (for quests with progress)
  const completeQuest = useCallback((questId: string) => {
    setState((prev) => {
      const quest = prev.quests.find((q) => q.id === questId);
      if (!quest || quest.claimed || quest.completed) return prev;

      const newQuests = prev.quests.map((q) =>
        q.id === questId ? { ...q, progress: q.maxProgress, completed: true } : q
      );

      return { ...prev, quests: newQuests };
    });
  }, []);

  // Consume energy
  const consumeEnergy = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount),
    }));
  }, []);

  // Add coins
  const addCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  // Add XP
  const addXp = useCallback((amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      if (checkLevelUp(prev.level, newXp)) {
        newLevel = Math.min(prev.level + 1, LEVELS.length);
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  }, []);

  const levelInfo = getLevelInfo(state.level);
  const currentLevelBaseXp = getCurrentLevelBaseXp(state.level);
  const nextLevelXp = getNextLevelXp(state.level + 1);
  const xpProgress = nextLevelXp > currentLevelBaseXp
    ? ((state.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100
    : 100;

  return {
    ...state,
    levelInfo,
    xpProgress,
    currentLevelBaseXp,
    nextLevelXp,
    claimQuest,
    completeQuest,
    consumeEnergy,
    addCoins,
    addXp,
  };
}

export { LEVELS };
