import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  ShoppingBag,
  Shirt,
  Image,
  Award,
  MessageSquare,
  Check,
  Lock,
  Sparkles,
  Zap,
  Crown,
  Package,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'skin' | 'frame' | 'title' | 'bubble';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  preview?: string;
  equipped?: boolean;
}

interface TitleItem extends ShopItem {
  condition: string;
  unlocked: boolean;
}

interface Inventory {
  skins: string[];
  frames: string[];
  titles: string[];
  bubbles: string[];
}

interface Equipped {
  skin: string | null;
  frame: string | null;
  title: string | null;
  bubble: string | null;
}

// ---------------------------------------------------------------------------
// Constants & Data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { id: 'all', label: '全部', icon: <Package size={16} /> },
  { id: 'skin', label: '经纪人换肤', icon: <Shirt size={16} /> },
  { id: 'frame', label: '头像框', icon: <Image size={16} /> },
  { id: 'title', label: '称号', icon: <Award size={16} /> },
  { id: 'bubble', label: '聊天气泡', icon: <MessageSquare size={16} /> },
];

const RARITY_COLORS = {
  common: { border: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.05)', text: '#8A8AA0', label: '普通' },
  rare: { border: 'rgba(0,212,255,0.3)', bg: 'rgba(0,212,255,0.08)', text: '#00D4FF', label: '稀有' },
  epic: { border: 'rgba(189,0,255,0.3)', bg: 'rgba(189,0,255,0.08)', text: '#BD00FF', label: '史诗' },
  legendary: { border: 'rgba(255,215,0,0.4)', bg: 'rgba(255,215,0,0.08)', text: '#FFD700', label: '传说' },
};

// Broker Skins (6 skins as specified)
const SKINS: ShopItem[] = [
  {
    id: 'skin-street-male',
    name: '街头潮流',
    description: '霓虹棒球服+棒球帽，hip-hop潮流风尚',
    price: 500,
    category: 'skin',
    rarity: 'rare',
    preview: '/broker-male-alt1.png',
  },
  {
    id: 'skin-academy-female',
    name: '学院甜心',
    description: '格子裙+眼镜，书卷气可爱风',
    price: 500,
    category: 'skin',
    rarity: 'rare',
    preview: '/broker-female-alt1.png',
  },
  {
    id: 'skin-gentleman-male',
    name: '优雅绅士',
    description: '燕尾服+霓虹领结，举杯致意',
    price: 800,
    category: 'skin',
    rarity: 'epic',
    preview: '/broker-male.png',
  },
  {
    id: 'skin-warrior-female',
    name: '未来战士',
    description: '轻型机甲+光剑，战斗姿态',
    price: 800,
    category: 'skin',
    rarity: 'epic',
    preview: '/broker-female.png',
  },
  {
    id: 'skin-space-male',
    name: '太空漫游',
    description: '太空服+星光特效+悬浮',
    price: 1200,
    category: 'skin',
    rarity: 'legendary',
    preview: '/broker-male.png',
  },
  {
    id: 'skin-princess-female',
    name: '星际公主',
    description: '星际礼服+皇冠+虹彩光芒',
    price: 1200,
    category: 'skin',
    rarity: 'legendary',
    preview: '/broker-female.png',
  },
];

// Avatar Frames (8 frames with CSS/SVG designs)
const FRAMES: ShopItem[] = [
  {
    id: 'frame-simple',
    name: '简约圆环',
    description: '单色霓虹圆环，低调优雅',
    price: 50,
    category: 'frame',
    rarity: 'common',
  },
  {
    id: 'frame-stars',
    name: '星空环绕',
    description: '小星星围绕旋转，梦幻氛围',
    price: 100,
    category: 'frame',
    rarity: 'common',
  },
  {
    id: 'frame-circuit',
    name: '电路脉动',
    description: '电路纹理+脉冲光效，科技风',
    price: 150,
    category: 'frame',
    rarity: 'rare',
  },
  {
    id: 'frame-fire',
    name: '火焰光环',
    description: '火焰粒子环绕，热情燃烧',
    price: 200,
    category: 'frame',
    rarity: 'rare',
  },
  {
    id: 'frame-ice',
    name: '冰霜结晶',
    description: '冰晶生长动画，冷酷美感',
    price: 250,
    category: 'frame',
    rarity: 'epic',
  },
  {
    id: 'frame-sakura',
    name: '樱花飘落',
    description: '花瓣飘落特效，浪漫唯美',
    price: 250,
    category: 'frame',
    rarity: 'epic',
  },
  {
    id: 'frame-rainbow',
    name: '彩虹流光',
    description: '七色渐变流动，绚丽夺目',
    price: 400,
    category: 'frame',
    rarity: 'legendary',
  },
  {
    id: 'frame-genesis',
    name: '创世之光',
    description: '复杂光效组合，至高荣耀',
    price: 600,
    category: 'frame',
    rarity: 'legendary',
  },
];

// Titles (10 titles as specified)
const TITLES: TitleItem[] = [
  {
    id: 'title-newbie',
    name: '初来乍到',
    description: '刚刚踏上星际旅程的新人',
    price: 0,
    category: 'title',
    rarity: 'common',
    condition: '注册获得',
    unlocked: true,
  },
  {
    id: 'title-traveler',
    name: '星际旅者',
    description: '在星际间自由穿梭的旅行者',
    price: 0,
    category: 'title',
    rarity: 'common',
    condition: '达到2级',
    unlocked: false,
  },
  {
    id: 'title-apprentice',
    name: '内容学徒',
    description: '勤奋学习的内容创作者',
    price: 0,
    category: 'title',
    rarity: 'common',
    condition: '完成首次发文',
    unlocked: false,
  },
  {
    id: 'title-social',
    name: '社交达人',
    description: '广交好友的人气之星',
    price: 0,
    category: 'title',
    rarity: 'rare',
    condition: '加5个好友',
    unlocked: false,
  },
  {
    id: 'title-nightowl',
    name: '夜猫子',
    description: '深夜仍在探索的熬夜冠军',
    price: 0,
    category: 'title',
    rarity: 'rare',
    condition: '凌晨2点在线',
    unlocked: false,
  },
  {
    id: 'title-scriptking',
    name: '剧本之王',
    description: '剧本杀中的王者，推理无敌',
    price: 0,
    category: 'title',
    rarity: 'epic',
    condition: '赢5次剧本杀',
    unlocked: false,
  },
  {
    id: 'title-viral',
    name: '爆款制造机',
    description: '每条内容都能引爆全网',
    price: 0,
    category: 'title',
    rarity: 'epic',
    condition: '生成10条内容',
    unlocked: false,
  },
  {
    id: 'title-tycoon',
    name: '金币大亨',
    description: '拥有巨额财富的收藏家',
    price: 0,
    category: 'title',
    rarity: 'legendary',
    condition: '拥有5000金币',
    unlocked: false,
  },
  {
    id: 'title-checkin',
    name: '七日签到',
    description: '坚持不懈的签到达人',
    price: 0,
    category: 'title',
    rarity: 'legendary',
    condition: '连续签到7天',
    unlocked: false,
  },
  {
    id: 'title-explorer',
    name: '隐藏探索者',
    description: '发现彩蛋的神秘探索者',
    price: 0,
    category: 'title',
    rarity: 'legendary',
    condition: '发现彩蛋',
    unlocked: false,
  },
];

// Chat Bubbles
const BUBBLES: ShopItem[] = [
  {
    id: 'bubble-default',
    name: '默认气泡',
    description: '标准设计，简洁大方',
    price: 0,
    category: 'bubble',
    rarity: 'common',
  },
  {
    id: 'bubble-neon',
    name: '霓虹方块',
    description: '方形切角+霓虹边框',
    price: 80,
    category: 'bubble',
    rarity: 'common',
  },
  {
    id: 'bubble-cloud',
    name: '软萌云朵',
    description: '云朵形状+柔和色彩',
    price: 100,
    category: 'bubble',
    rarity: 'rare',
  },
  {
    id: 'bubble-tech',
    name: '科技面板',
    description: '全息投影风格',
    price: 150,
    category: 'bubble',
    rarity: 'epic',
  },
  {
    id: 'bubble-heart',
    name: '爱心泡泡',
    description: '爱心形状+粉色光效',
    price: 120,
    category: 'bubble',
    rarity: 'rare',
  },
  {
    id: 'bubble-dragon',
    name: '龙息火焰',
    description: '火焰边缘+烟雾粒子',
    price: 300,
    category: 'bubble',
    rarity: 'legendary',
  },
];

// ---------------------------------------------------------------------------
// localStorage Helpers
// ---------------------------------------------------------------------------

function loadCoins(): number {
  try {
    const stored = localStorage.getItem('pcg_coins');
    if (stored) return parseInt(stored, 10);
  } catch { /* ignore */ }
  return 5000; // Default starting coins
}

function saveCoins(coins: number) {
  localStorage.setItem('pcg_coins', String(coins));
}

function loadInventory(): Inventory {
  try {
    const stored = localStorage.getItem('pcg_inventory');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { skins: [], frames: [], titles: ['title-newbie'], bubbles: ['bubble-default'] };
}

function saveInventory(inv: Inventory) {
  localStorage.setItem('pcg_inventory', JSON.stringify(inv));
}

function loadEquipped(): Equipped {
  try {
    const stored = localStorage.getItem('pcg_equipped');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { skin: null, frame: null, title: 'title-newbie', bubble: 'bubble-default' };
}

function saveEquipped(eq: Equipped) {
  localStorage.setItem('pcg_equipped', JSON.stringify(eq));
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

/** AvatarFrameSVG - Renders avatar frame preview as SVG */
function AvatarFrameSVG({ frameId, size = 80 }: { frameId: string; size?: number }) {
  const frameSvgs: Record<string, React.ReactNode> = {
    'frame-simple': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0.8" />
        <circle cx="40" cy="40" r="32" fill="none" stroke="#00F0FF" strokeWidth="0.5" opacity="0.4" />
      </svg>
    ),
    'frame-stars': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#FFD700" strokeWidth="1.5" />
        <circle cx="12" cy="28" r="3" fill="#FFD700" opacity="0.9">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="68" cy="28" r="2.5" fill="#FFD700" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="8" r="2" fill="#FFF5B0" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <path d="M20,62 L22,67 L27,67 L23,70 L24,75 L20,72 L16,75 L17,70 L13,67 L18,67 Z" fill="#FFD700" opacity="0.8" />
        <path d="M58,58 L59,61 L62,61 L60,63 L61,66 L58,64 L55,66 L56,63 L54,61 L57,61 Z" fill="#FFD700" opacity="0.6" />
      </svg>
    ),
    'frame-circuit': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="8" y="8" width="64" height="64" rx="8" fill="none" stroke="#00F0FF" strokeWidth="1.5" />
        <line x1="8" y1="24" x2="24" y2="24" stroke="#00F0FF" strokeWidth="1" opacity="0.6" />
        <line x1="56" y1="24" x2="72" y2="24" stroke="#00F0FF" strokeWidth="1" opacity="0.6" />
        <line x1="8" y1="56" x2="24" y2="56" stroke="#00F0FF" strokeWidth="1" opacity="0.6" />
        <line x1="56" y1="56" x2="72" y2="56" stroke="#00F0FF" strokeWidth="1" opacity="0.6" />
        <circle cx="24" cy="24" r="3" fill="#00F0FF" opacity="0.8">
          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="56" cy="56" r="3" fill="#00F0FF" opacity="0.6">
          <animate attributeName="r" values="3;5;3" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <rect x="36" y="4" width="8" height="4" rx="2" fill="#00F0FF" opacity="0.5" />
      </svg>
    ),
    'frame-fire': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#FF4500" strokeWidth="2">
          <animate attributeName="r" values="35;37;35" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <path d="M40,6 Q44,16 40,22 Q36,16 40,6" fill="#FF4500" opacity="0.8">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
        </path>
        <path d="M72,36 Q62,40 56,36 Q62,32 72,36" fill="#FF6B00" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.2s" repeatCount="indefinite" />
        </path>
        <path d="M8,44 Q18,40 24,44 Q18,48 8,44" fill="#FF4500" opacity="0.6">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
    'frame-ice': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <polygon points="40,4 48,18 64,14 56,28 72,38 56,44 64,60 48,54 40,70 32,54 16,60 24,44 8,38 24,28 16,14 32,18" fill="none" stroke="#00D4FF" strokeWidth="1.5" opacity="0.8">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
        </polygon>
        <polygon points="40,16 44,24 52,22 48,30 54,36 46,38 48,46 40,42 32,46 34,38 26,36 32,30 28,22 36,24" fill="#00D4FF" opacity="0.15" />
      </svg>
    ),
    'frame-sakura': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#FF6B9D" strokeWidth="1.5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <ellipse cx={20 + Math.random() * 40} cy={10 + Math.random() * 60} rx="3" ry="2" fill="#FFB0C8" opacity="0.7">
              <animateTransform attributeName="transform" type="translate" values={`0,0; 0,${10 + Math.random() * 15}; 0,0`} dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
            </ellipse>
          </g>
        ))}
        <path d="M40,6 Q42,10 40,14 Q38,10 40,6" fill="#FF6B9D" opacity="0.8" />
      </svg>
    ),
    'frame-rainbow': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2A6D" />
            <stop offset="25%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#39FF14" />
            <stop offset="75%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#BD00FF" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="none" stroke="url(#rainbow)" strokeWidth="3">
          <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="40" r="30" fill="none" stroke="url(#rainbow)" strokeWidth="1" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="360 40 40" to="0 40 40" dur="6s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    'frame-genesis': (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="genesis" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700">
              <animate attributeName="stop-color" values="#FFD700;#FFF5B0;#FFD700" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FF2A6D">
              <animate attributeName="stop-color" values="#FF2A6D;#FFD700;#FF2A6D" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <polygon points="40,4 48,18 64,16 56,30 72,40 56,50 64,64 48,62 40,76 32,62 16,64 24,50 8,40 24,30 16,16 32,18" fill="none" stroke="url(#genesis)" strokeWidth="2">
          <animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite" />
        </polygon>
        <circle cx="40" cy="40" r="20" fill="none" stroke="url(#genesis)" strokeWidth="1" opacity="0.6" />
        <circle cx="40" cy="40" r="12" fill="url(#genesis)" opacity="0.2">
          <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-center">
      {frameSvgs[frameId] || frameSvgs['frame-simple']}
    </div>
  );
}

/** ChatBubblePreview - Renders chat bubble preview */
function ChatBubblePreview({ bubbleId }: { bubbleId: string }) {
  const bubbleStyles: Record<string, React.ReactNode> = {
    'bubble-default': (
      <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-neon-cyan/15 border border-neon-cyan/30 max-w-[140px]">
        <span className="text-xs text-text-primary">默认气泡样式</span>
      </div>
    ),
    'bubble-neon': (
      <div className="px-3 py-2 bg-neon-cyan/10 border-2 border-neon-cyan/40 max-w-[140px]" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <span className="text-xs text-text-primary">霓虹方块气泡</span>
      </div>
    ),
    'bubble-cloud': (
      <div className="px-3 py-2 rounded-[20px] bg-pink-500/10 border border-pink-400/30 max-w-[140px]" style={{ borderRadius: '20px 20px 20px 4px' }}>
        <span className="text-xs text-text-primary">软萌云朵风格</span>
      </div>
    ),
    'bubble-tech': (
      <div className="px-3 py-2 bg-void-light border border-neon-cyan/30 max-w-[140px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-neon-cyan/50" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-neon-cyan/50" />
        <span className="text-xs text-text-primary relative z-10">科技面板风格</span>
      </div>
    ),
    'bubble-heart': (
      <div className="px-3 py-2 max-w-[140px] relative">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d="M50,8 C50,8 30,0 20,10 C10,20 20,35 50,38 C80,35 90,20 80,10 C70,0 50,8 50,8Z" fill="rgba(255,107,157,0.15)" stroke="rgba(255,107,157,0.4)" strokeWidth="1" />
        </svg>
        <span className="text-xs text-text-primary relative z-10">爱心泡泡风格</span>
      </div>
    ),
    'bubble-dragon': (
      <div className="px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 max-w-[140px]">
        <div className="flex items-center gap-1">
          <span className="text-xs">🔥</span>
          <span className="text-xs text-text-primary">龙息火焰风格</span>
        </div>
      </div>
    ),
  };

  return (
    <div className="flex items-center justify-center py-2">
      {bubbleStyles[bubbleId] || bubbleStyles['bubble-default']}
    </div>
  );
}

/** PurchaseConfirmModal - Purchase confirmation dialog */
function PurchaseConfirmModal({
  item,
  coins,
  onConfirm,
  onCancel,
}: {
  item: ShopItem;
  coins: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const canAfford = coins >= item.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm rounded-xl bg-void-light border border-neon-gold/30 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">确认购买</h3>
          <button onClick={onCancel} className="text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-lg bg-void border border-white/5 p-4 mb-4">
          <div className="flex items-center gap-3">
            {item.preview ? (
              <img src={item.preview} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-void-light border border-white/10 flex items-center justify-center">
                {item.category === 'skin' && <Shirt size={24} className="text-neon-cyan" />}
                {item.category === 'frame' && <Image size={24} className="text-neon-violet" />}
                {item.category === 'title' && <Award size={24} className="text-neon-gold" />}
                {item.category === 'bubble' && <MessageSquare size={24} className="text-neon-magenta" />}
              </div>
            )}
            <div>
              <h4 className="font-medium text-text-primary">{item.name}</h4>
              <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-sm text-text-secondary">价格</span>
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-neon-gold" />
            <span className="font-mono font-medium text-neon-gold">{item.price}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-sm text-text-secondary">当前余额</span>
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-neon-gold" />
            <span className="font-mono font-medium text-neon-gold">{coins.toLocaleString()}</span>
          </div>
        </div>

        {!canAfford && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            金币不足，快去完成任务赚取金币吧！
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-sm text-text-secondary border border-white/10 hover:border-white/20 transition-colors"
          >
            取消
          </button>
          <motion.button
            whileHover={canAfford ? { scale: 1.02 } : {}}
            whileTap={canAfford ? { scale: 0.98 } : {}}
            onClick={canAfford ? onConfirm : undefined}
            disabled={!canAfford}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-neon-gold text-void disabled:opacity-30 hover:shadow-glow-gold transition-all"
          >
            确认购买
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Marketplace Component
// ---------------------------------------------------------------------------

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [coins, setCoins] = useState(loadCoins);
  const [inventory, setInventory] = useState<Inventory>(loadInventory);
  const [equipped, setEquipped] = useState<Equipped>(loadEquipped);
  const [purchasingItem, setPurchasingItem] = useState<ShopItem | null>(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [lastPurchased, setLastPurchased] = useState('');

  // Persist to localStorage
  useEffect(() => { saveCoins(coins); }, [coins]);
  useEffect(() => { saveInventory(inventory); }, [inventory]);
  useEffect(() => { saveEquipped(equipped); }, [equipped]);

  const allItems: ShopItem[] = [...SKINS, ...FRAMES, ...BUBBLES];
  const allTitleItems: TitleItem[] = TITLES;

  const filteredItems = activeCategory === 'all'
    ? allItems
    : activeCategory === 'title'
      ? []
      : allItems.filter((item) => item.category === activeCategory);

  const isOwned = useCallback((item: ShopItem) => {
    switch (item.category) {
      case 'skin': return inventory.skins.includes(item.id);
      case 'frame': return inventory.frames.includes(item.id);
      case 'bubble': return inventory.bubbles.includes(item.id);
      default: return false;
    }
  }, [inventory]);

  const isEquipped = useCallback((item: ShopItem) => {
    switch (item.category) {
      case 'skin': return equipped.skin === item.id;
      case 'frame': return equipped.frame === item.id;
      case 'bubble': return equipped.bubble === item.id;
      default: return false;
    }
  }, [equipped]);

  const handlePurchase = useCallback((item: ShopItem) => {
    if (coins < item.price) return;

    setCoins((c) => c - item.price);
    setInventory((inv) => {
      const next = { ...inv };
      switch (item.category) {
        case 'skin': next.skins = [...next.skins, item.id]; break;
        case 'frame': next.frames = [...next.frames, item.id]; break;
        case 'bubble': next.bubbles = [...next.bubbles, item.id]; break;
      }
      return next;
    });

    setPurchasingItem(null);
    setLastPurchased(item.name);
    setShowPurchaseSuccess(true);
    setTimeout(() => setShowPurchaseSuccess(false), 2500);
  }, [coins]);

  const handleEquip = useCallback((item: ShopItem) => {
    setEquipped((eq) => {
      const next = { ...eq };
      switch (item.category) {
        case 'skin': next.skin = item.id; break;
        case 'frame': next.frame = item.id; break;
        case 'bubble': next.bubble = item.id; break;
      }
      return next;
    });
  }, []);

  const handleEquipTitle = useCallback((titleId: string) => {
    setEquipped((eq) => ({ ...eq, title: titleId }));
  }, []);

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-void pt-[72px]">
      {/* Hero Section */}
      <section className="relative w-full py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/30 to-void" />
        <div className="absolute inset-0 bg-gradient-radial from-neon-gold/5 via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag size={26} className="text-neon-gold" />
                <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-neon-gold">星际商城</h1>
              </div>
              <p className="text-text-secondary text-sm sm:text-base">
                使用金币兑换专属装扮，打造独一无二的经纪人形象
              </p>
            </div>

            {/* Coins Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-void-light border border-neon-gold/20"
            >
              <motion.div
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              >
                <Coins size={28} className="text-neon-gold" />
              </motion.div>
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">我的金币</div>
                <div className="font-mono text-2xl font-bold text-neon-gold">{coins.toLocaleString()}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-neon-gold text-void shadow-glow-gold'
                  : 'bg-void-light border border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Items Grid */}
        {activeCategory !== 'title' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                const owned = isOwned(item);
                const equippedItem = isEquipped(item);
                const rarity = RARITY_COLORS[item.rarity];

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="group rounded-xl bg-void-light border overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
                    style={{
                      borderColor: owned ? 'rgba(57,255,20,0.3)' : rarity.border,
                    }}
                  >
                    {/* Preview Area */}
                    <div className="relative aspect-square bg-void flex items-center justify-center overflow-hidden">
                      {/* Background glow */}
                      <div
                        className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity"
                        style={{ background: `radial-gradient(circle, ${rarity.text}22, transparent 70%)` }}
                      />

                      {item.category === 'skin' && item.preview && (
                        <img
                          src={item.preview}
                          alt={item.name}
                          className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      )}

                      {item.category === 'frame' && (
                        <div className="group-hover:scale-110 transition-transform duration-500">
                          <AvatarFrameSVG frameId={item.id} size={100} />
                        </div>
                      )}

                      {item.category === 'bubble' && (
                        <div className="group-hover:scale-110 transition-transform duration-500">
                          <ChatBubblePreview bubbleId={item.id} />
                        </div>
                      )}

                      {/* Owned Badge */}
                      {owned && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-neon-green/20 border border-neon-green/40">
                          <span className="text-[10px] font-medium text-neon-green flex items-center gap-0.5">
                            <Check size={10} />
                            已拥有
                          </span>
                        </div>
                      )}

                      {/* Rarity Badge */}
                      <div
                        className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-medium"
                        style={{ background: rarity.bg, color: rarity.text, border: `1px solid ${rarity.border}` }}
                      >
                        {rarity.label}
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-text-primary mb-1">{item.name}</h3>
                      <p className="text-[11px] text-text-muted mb-3 line-clamp-1">{item.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {item.price > 0 ? (
                            <>
                              <Coins size={12} className="text-neon-gold" />
                              <span className="font-mono text-sm text-neon-gold">{item.price}</span>
                            </>
                          ) : (
                            <span className="text-xs text-neon-green">免费</span>
                          )}
                        </div>

                        {owned ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEquip(item)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                              equippedItem
                                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                                : 'bg-void border border-white/10 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30'
                            }`}
                          >
                            {equippedItem ? '已装备' : '装备'}
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPurchasingItem(item)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-neon-gold/10 text-neon-gold border border-neon-gold/20 hover:bg-neon-gold hover:text-void transition-all"
                          >
                            购买
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Titles Section */}
        {(activeCategory === 'all' || activeCategory === 'title') && (
          <>
            {activeCategory === 'all' && (
              <div className="flex items-center gap-2 mb-4 mt-8">
                <Award size={20} className="text-neon-gold" />
                <h2 className="text-lg font-bold text-text-primary">称号系统</h2>
                <span className="text-xs text-text-muted">完成条件解锁称号</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              <AnimatePresence>
                {allTitleItems.map((title, index) => {
                  const isUnlocked = title.unlocked;
                  const isEquippedTitle = equipped.title === title.id;
                  const rarity = RARITY_COLORS[title.rarity];

                  return (
                    <motion.div
                      key={title.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl bg-void-light border overflow-hidden"
                      style={{
                        borderColor: isEquippedTitle ? 'rgba(255,215,0,0.4)' : isUnlocked ? rarity.border : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="p-4 flex items-center gap-3">
                        {/* Title Icon */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: isUnlocked ? rarity.bg : 'rgba(255,255,255,0.03)' }}
                        >
                          {isUnlocked ? (
                            <Crown size={22} style={{ color: rarity.text }} />
                          ) : (
                            <Lock size={20} className="text-text-muted" />
                          )}
                        </div>

                        {/* Title Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-medium ${isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                              {title.name}
                            </h3>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{
                                background: isUnlocked ? rarity.bg : 'rgba(255,255,255,0.03)',
                                color: isUnlocked ? rarity.text : '#4A4A60',
                              }}
                            >
                              {rarity.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">{title.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Sparkles size={10} className={isUnlocked ? 'text-neon-gold' : 'text-text-muted'} />
                            <span className={`text-[10px] ${isUnlocked ? 'text-neon-gold' : 'text-text-muted'}`}>
                              {title.condition}
                            </span>
                          </div>
                        </div>

                        {/* Equip Button */}
                        {isUnlocked && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEquipTitle(title.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                              isEquippedTitle
                                ? 'bg-neon-gold/20 text-neon-gold border border-neon-gold/30'
                                : 'bg-void border border-white/10 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30'
                            }`}
                          >
                            {isEquippedTitle ? '已装备' : '装备'}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Coin earn hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 py-8 text-text-muted"
        >
          <Zap size={14} className="text-neon-cyan" />
          <span className="text-xs">完成任务可获得更多金币</span>
          <ChevronRight size={12} />
        </motion.div>
      </section>

      {/* Purchase Confirm Modal */}
      <AnimatePresence>
        {purchasingItem && (
          <PurchaseConfirmModal
            item={purchasingItem}
            coins={coins}
            onConfirm={() => handlePurchase(purchasingItem)}
            onCancel={() => setPurchasingItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Purchase Success Toast */}
      <AnimatePresence>
        {showPurchaseSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl bg-void-light border border-neon-green/30 shadow-lg"
          >
            <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-neon-green" />
            </div>
            <div>
              <span className="text-sm font-medium text-text-primary">购买成功！</span>
              <span className="text-sm text-neon-green ml-1">获得 {lastPurchased}</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-6 h-6 rounded-full bg-neon-gold/20 flex items-center justify-center"
            >
              <Sparkles size={14} className="text-neon-gold" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
