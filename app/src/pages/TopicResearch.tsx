import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Radar, TrendingUp, Users, Clock,
  Send, Flame, Play, ExternalLink, ThumbsUp, MessageCircle,
  ChevronDown, Loader2, Zap,
  Target, Hash, Link2, Star,
  Sparkles, X, CheckCircle2,
  Lightbulb, ArrowUpRight, ArrowDownRight,
  Minus, Volume2, Wand2,
  Camera
} from 'lucide-react';
import HeatPreloader from '@/components/HeatPreloader';
import { extractJSON, glmChat } from '@/services/glmClient';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: 'user' | 'broker' | 'system';
  content: string;
  options?: string[];
}

type DataView = 'heatmap' | 'trend' | 'competitor';

interface HeatmapNode {
  id: string;
  topic: string;
  category: string;
  heat: number;
  competition: number;
  trend: number;
  x: number;
  y: number;
  size: number;
}

interface TrendPoint {
  date: string;
  value: number;
}

interface TrendLine {
  topic: string;
  color: string;
  data: TrendPoint[];
}

interface CompetitorItem {
  title: string;
  platform: string;
  likes: string;
  comments: string;
  shares: string;
  date: string;
}

interface ViralContent {
  id: string;
  title: string;
  platform: 'bilibili' | 'zhihu';
  cover: string;
  link: string;
  likes: string;
  comments: string;
  plays: string;
}

interface VideoAnalysis {
  meta: {
    bvid: string;
    title: string;
    category: string;
    author: string;
    tags: string[];
    durationSec: number;
  };
  metrics: {
    view: number;
    like: number;
    coin: number;
    favorite: number;
    share: number;
    reply: number;
    danmaku: number;
  };
  summary: string;
  positioning: string;
  audience: string;
  structure: string[];
  hooks: string[];
  techniques: string[];
  commentInsights: string[];
  actionPlan: string[];
  dna: {
    tone: string;
    writingStyle: string;
    contentPillar: string;
    targetAudience: string;
    keywords: string[];
    emojiDensity: number;
    dimensions?: Partial<{
      humor: number;
      emotionValue: number;
      professionalism: number;
      affinity: number;
      aggressiveness: number;
    }>;
  };
}

/* ────────────────────────────────────────────
   Mock Data
   ──────────────────────────────────────────── */

const CATEGORIES = ['生活方式', '美妆', '美食', '旅行', '科技', '游戏', '穿搭', '知识', '健身', '宠物', '母婴', '财经'];

const HEATMAP_DATA: HeatmapNode[] = [
  { id: '1', topic: '咖啡探店', category: '美食', heat: 72, competition: 0.45, trend: 18, x: 20, y: 30, size: 72 },
  { id: '2', topic: '平价美食', category: '美食', heat: 85, competition: 0.55, trend: 34, x: 45, y: 25, size: 85 },
  { id: '3', topic: '家庭料理', category: '美食', heat: 60, competition: 0.35, trend: 8, x: 70, y: 35, size: 60 },
  { id: '4', topic: '护肤分享', category: '美妆', heat: 90, competition: 0.78, trend: 12, x: 15, y: 65, size: 90 },
  { id: '5', topic: '彩妆教程', category: '美妆', heat: 68, competition: 0.82, trend: -5, x: 40, y: 70, size: 68 },
  { id: '6', topic: '极简护肤', category: '美妆', heat: 55, competition: 0.28, trend: 22, x: 65, y: 65, size: 55 },
  { id: '7', topic: '旅行Vlog', category: '旅行', heat: 78, competition: 0.62, trend: 15, x: 25, y: 15, size: 78 },
  { id: '8', topic: '周边游', category: '旅行', heat: 45, competition: 0.25, trend: 30, x: 55, y: 10, size: 45 },
  { id: '9', topic: '数码测评', category: '科技', heat: 88, competition: 0.7, trend: 20, x: 80, y: 50, size: 88 },
  { id: '10', topic: 'AI工具', category: '科技', heat: 95, competition: 0.6, trend: 45, x: 85, y: 25, size: 95 },
  { id: '11', topic: '健身打卡', category: '健身', heat: 52, competition: 0.5, trend: 10, x: 10, y: 45, size: 52 },
  { id: '12', topic: '穿搭分享', category: '穿搭', heat: 80, competition: 0.75, trend: 5, x: 50, y: 50, size: 80 },
  { id: '13', topic: '宠物日常', category: '宠物', heat: 65, competition: 0.4, trend: 25, x: 30, y: 80, size: 65 },
  { id: '14', topic: '理财入门', category: '财经', heat: 58, competition: 0.38, trend: 28, x: 75, y: 80, size: 58 },
  { id: '15', topic: '游戏攻略', category: '游戏', heat: 75, competition: 0.68, trend: -2, x: 90, y: 70, size: 75 },
];

const TREND_DATA: TrendLine[] = [
  {
    topic: '咖啡探店',
    color: '#00F0FF',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `1/${i + 1}`,
      value: 45 + Math.sin(i * 0.3) * 15 + i * 0.8 + Math.random() * 8,
    })),
  },
  {
    topic: '平价美食',
    color: '#FF2A6D',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `1/${i + 1}`,
      value: 55 + Math.cos(i * 0.25) * 12 + i * 1.2 + Math.random() * 6,
    })),
  },
  {
    topic: 'AI工具',
    color: '#BD00FF',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `1/${i + 1}`,
      value: 60 + Math.sin(i * 0.2) * 10 + i * 1.5 + Math.random() * 10,
    })),
  },
];

const COMPETITOR_DATA: CompetitorItem[] = [
  { title: '10家宝藏咖啡馆探店合集，人均不到30！', platform: '小红书', likes: '12.5万', comments: '3421', shares: '1.2万', date: '2024-01-10' },
  { title: '月薪3000也能天天吃的平价美食地图', platform: '抖音', likes: '28.6万', comments: '8921', shares: '3.5万', date: '2024-01-08' },
  { title: '家庭版米其林：5道菜成本不到50元', platform: 'B站', likes: '8.9万', comments: '2156', shares: '8900', date: '2024-01-05' },
  { title: '2024年最值得去的10个咖啡店', platform: '小红书', likes: '6.7万', comments: '1876', shares: '5600', date: '2024-01-03' },
  { title: '咖啡师的一天：从选豆到拉花', platform: '抖音', likes: '15.2万', comments: '4532', shares: '2.1万', date: '2024-01-01' },
];

const AUDIENCE_DATA = [
  { label: '18-24岁', value: 35, color: '#00F0FF' },
  { label: '25-30岁', value: 28, color: '#FF2A6D' },
  { label: '31-35岁', value: 18, color: '#BD00FF' },
  { label: '36-40岁', value: 12, color: '#FFD700' },
  { label: '40岁+', value: 7, color: '#39FF14' },
];

const TIME_HEATMAP = [
  [2, 3, 4, 3, 2, 5, 8, 12, 15, 18, 20, 22, 24, 23, 20, 18, 20, 25, 30, 35, 32, 28, 18, 8],
  [2, 2, 3, 2, 3, 6, 10, 14, 16, 18, 19, 20, 22, 21, 19, 17, 19, 24, 32, 38, 35, 30, 20, 10],
  [3, 3, 3, 4, 4, 7, 12, 16, 18, 20, 22, 23, 25, 24, 22, 20, 22, 28, 35, 40, 38, 32, 22, 12],
  [4, 4, 5, 4, 5, 8, 14, 18, 20, 22, 24, 25, 26, 25, 23, 22, 24, 30, 36, 42, 40, 34, 24, 14],
  [5, 5, 6, 5, 6, 10, 16, 20, 22, 24, 26, 28, 30, 28, 26, 24, 26, 32, 38, 45, 42, 36, 26, 16],
  [8, 8, 10, 8, 10, 14, 20, 25, 28, 30, 32, 34, 36, 34, 32, 30, 32, 36, 40, 48, 50, 42, 30, 18],
  [10, 10, 12, 10, 12, 16, 22, 28, 32, 35, 38, 40, 42, 40, 38, 35, 38, 42, 45, 52, 55, 45, 32, 20],
];

const VIRAL_CONTENT: ViralContent[] = [
  { id: 'seed_1', title: '热榜种子：今天有哪些值得跟进的话题？', platform: 'zhihu', cover: '/sample-post-cover-2.jpg', link: 'https://www.zhihu.com/hot', likes: '—', comments: '—', plays: '—' },
  { id: 'seed_2', title: '热门种子：B站今天什么内容在爆？', platform: 'bilibili', cover: '/sample-post-cover-3.jpg', link: 'https://www.bilibili.com/v/popular/all', likes: '—', comments: '—', plays: '—' },
];

const PLATFORM_COLORS: Record<string, string> = {
  bilibili: '#FB7299',
  zhihu: '#1772F6',
};

const PLATFORM_LABELS: Record<string, string> = {
  bilibili: 'B站',
  zhihu: '知乎',
};

/* ────────────────────────────────────────────
   Utility
   ──────────────────────────────────────────── */

const easeCyber = [0.16, 1, 0.3, 1] as [number, number, number, number];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getHeatColor(competition: number): string {
  if (competition < 0.3) return '#39FF14';
  if (competition < 0.55) return '#FFD700';
  return '#FF2A6D';
}

function getTrendIcon(trend: number) {
  if (trend > 10) return <ArrowUpRight size={14} className="text-neon-green" />;
  if (trend < 0) return <ArrowDownRight size={14} className="text-neon-magenta" />;
  return <Minus size={14} className="text-text-muted" />;
}

/* ────────────────────────────────────────────
   Chat Panel (for Topic Research)
   ──────────────────────────────────────────── */

function ResearchChatPanel({
  messages,
  onSendMessage,
  onSelectOption,
  isAnalyzing,
}: {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSelectOption: (option: string) => void;
  isAnalyzing: boolean;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isAnalyzing]);

  return (
    <div className="flex flex-col h-full bg-void-light/50 border border-white/5 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neon-magenta/40">
          <img src="/broker-female.png" alt="经纪人" className="w-full h-full object-cover" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-void-light" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">梦璃</p>
          <p className="text-xs text-text-muted">数据分析师</p>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-magenta/10 border border-neon-magenta/20">
          <Radar size={10} className="text-neon-magenta" />
          <span className="text-[10px] text-neon-magenta">分析模式</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeCyber }}
            className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
          >
            <div className={cn(
              'w-8 h-8 rounded-full overflow-hidden flex-shrink-0',
              msg.role === 'broker' ? 'border border-neon-magenta/40' : 'border border-neon-cyan/40'
            )}>
              <img
                src={msg.role === 'broker' ? '/broker-female.png' : '/avatar-default.png'}
                alt={msg.role}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={cn(
              'max-w-[80%]',
              msg.role === 'user'
                ? 'bg-[rgba(0,240,255,0.12)] border border-[rgba(0,240,255,0.3)] rounded-2xl rounded-br-sm'
                : 'bg-void-light border border-white/8 rounded-2xl rounded-bl-sm'
            )}>
              <p className="px-4 py-2.5 text-sm text-text-primary whitespace-pre-line leading-relaxed">{msg.content}</p>
              {msg.options && (
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                  {msg.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => onSelectOption(opt)}
                      className="px-3 py-1.5 rounded-full text-xs border border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[rgba(189,0,255,0.08)] border border-dashed border-[rgba(189,0,255,0.3)]">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-neon-cyan/40">
                <img src="/broker-female.png" alt="经纪人" className="w-full h-full object-cover" />
                <div className="absolute inset-0 animate-neon-pulse rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary">经纪人正在认真调研，请耐心等待哦~</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {['数据采集', '趋势计算', '竞品扫描', '报告生成'].map((step, i) => (
                    <div key={step} className="flex items-center gap-1">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-neon-cyan"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                      />
                      <span className="text-[9px] text-text-muted">{step}</span>
                      {i < 3 && <span className="text-text-muted">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                onSendMessage(input.trim());
                setInput('');
              }
            }}
            placeholder="描述你想研究的选题..."
            className="flex-1 bg-void border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-magenta/50 transition-colors"
          />
          <button
            onClick={() => {
              if (input.trim()) {
                onSendMessage(input.trim());
                setInput('');
              }
            }}
            disabled={!input.trim() || isAnalyzing}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-magenta text-white hover:brightness-110 transition-all disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Heatmap Chart Component
   ──────────────────────────────────────────── */

function HeatmapChart({ data, onNodeClick }: { data: HeatmapNode[]; onNodeClick: (node: HeatmapNode) => void }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const edges = useMemo(() => {
    const nodes = data.map((d) => ({ ...d }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const pairs: { a: string; b: string; w: number }[] = [];

    const dist = (a: HeatmapNode, b: HeatmapNode) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    for (const n of nodes) {
      const candidates = nodes
        .filter((m) => m.id !== n.id)
        .map((m) => {
          const d = dist(n, m);
          const near = 1 - Math.min(1, d / 65);
          const sameCat = n.category === m.category ? 1 : 0;
          const heatSim = 1 - Math.min(1, Math.abs(n.heat - m.heat) / 60);
          const w = 0.55 * near + 0.3 * sameCat + 0.15 * heatSim;
          return { id: m.id, w };
        })
        .sort((a, b) => b.w - a.w)
        .slice(0, 2);

      for (const c of candidates) {
        if (c.w < 0.48) continue;
        const a = String(n.id);
        const b = String(c.id);
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (pairs.some((p) => (p.a < p.b ? `${p.a}-${p.b}` : `${p.b}-${p.a}`) === key)) continue;
        pairs.push({ a, b, w: c.w });
      }
    }

    return pairs
      .map((p) => ({ ...p, na: byId.get(p.a), nb: byId.get(p.b) }))
      .filter((p) => p.na && p.nb) as Array<{ a: string; b: string; w: number; na: HeatmapNode; nb: HeatmapNode }>;
  }, [data]);

  return (
    <div className="relative w-full aspect-[4/3] bg-void-light/30 rounded-xl border border-white/5 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* SVG Chart */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="pcgGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -6"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {edges.map((e, idx) => {
          const a = e.na;
          const b = e.nb;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const ox = (b.y - a.y) * 0.06;
          const oy = (a.x - b.x) * 0.06;
          const d = `M ${a.x} ${a.y} Q ${mx + ox} ${my + oy} ${b.x} ${b.y}`;
          const w = 0.12 + e.w * 0.7;
          const c1 = getHeatColor(a.competition);
          const c2 = getHeatColor(b.competition);
          const gid = `edgeGrad_${idx}`;
          return (
            <g key={`${e.a}_${e.b}`}>
              <linearGradient id={gid} x1={a.x} y1={a.y} x2={b.x} y2={b.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={c1} stopOpacity="0.45" />
                <stop offset="100%" stopColor={c2} stopOpacity="0.45" />
              </linearGradient>
              <motion.path
                d={d}
                fill="none"
                stroke={`url(#${gid})`}
                strokeWidth={w}
                strokeLinecap="round"
                strokeDasharray="1.8 1.8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, strokeDashoffset: [0, 7] }}
                transition={{ duration: 5 + (1 - e.w) * 4, repeat: Infinity, ease: 'linear', delay: idx * 0.12 }}
              />
            </g>
          );
        })}

        {data.map((node) => {
          const isHovered = hoveredNode === node.id;
          const color = getHeatColor(node.competition);
          const float = (parseInt(node.id, 10) % 5) * 0.12;
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: parseInt(node.id) * 0.04, ease: easeCyber }}
              whileHover={{ scale: 1.06 }}
              onClick={() => onNodeClick(node)}
              onMouseEnter={() => {
                setHoveredNode(node.id);
              }}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.size / 14.5}
                fill={color}
                fillOpacity={0.12}
                stroke={color}
                strokeOpacity={isHovered ? 0.85 : 0.45}
                strokeWidth={isHovered ? 0.7 : 0.3}
                filter="url(#pcgGlow)"
                animate={{ r: [node.size / 14.5, node.size / 14.5 + 0.35, node.size / 14.5], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3.8 + float, repeat: Infinity, ease: 'easeInOut', delay: float }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size / 17}
                fill={color}
                fillOpacity={isHovered ? 0.75 : 0.45}
                stroke={isHovered ? '#00F0FF' : '#FFFFFF'}
                strokeWidth={isHovered ? 0.65 : 0.12}
                style={{ filter: isHovered ? 'drop-shadow(0 0 10px ' + color + ')' : 'none' }}
              />
              <text
                x={node.x}
                y={node.y + node.size / 35}
                textAnchor="middle"
                fill="white"
                fontSize="2.6"
                fontWeight="600"
                opacity={0.9}
              >
                {node.topic}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-void-light/80 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        <p className="text-[10px] text-text-muted mb-1">竞争密度</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-neon-green" /><span className="text-[9px] text-text-muted">低</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-neon-gold" /><span className="text-[9px] text-text-muted">中</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-neon-magenta" /><span className="text-[9px] text-text-muted">高</span></div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && (() => {
          const node = data.find((n) => n.id === hoveredNode);
          if (!node) return null;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-20 bg-void-light border border-neon-cyan/30 rounded-lg p-3 shadow-glow-cyan pointer-events-none"
              style={{
                left: `${Math.min(node.x + 5, 70)}%`,
                top: `${Math.max(node.y - 15, 5)}%`,
              }}
            >
              <p className="text-sm font-medium text-text-primary">{node.topic}</p>
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-text-secondary">热度: <span className="text-neon-cyan">{node.heat}/100</span></p>
                <p className="text-xs text-text-secondary">竞争: <span style={{ color: getHeatColor(node.competition) }}>{(node.competition * 100).toFixed(0)}%</span></p>
                <p className="text-xs text-text-secondary flex items-center gap-1">趋势: {getTrendIcon(node.trend)}<span className={node.trend > 0 ? 'text-neon-green' : 'text-neon-magenta'}>{node.trend > 0 ? '+' : ''}{node.trend}%</span></p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────
   Trend Line Chart Component
   ──────────────────────────────────────────── */

function TrendChart({ data }: { data: TrendLine[] }) {
  const svgWidth = 600;
  const svgHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => d.data.map((p) => p.value));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  const getX = (index: number) => padding.left + (index / (data[0].data.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[500px]" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding.top + (chartHeight / 4) * i;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#4A4A60" fontSize="10">{Math.round(maxValue - (valueRange / 4) * i)}</text>
            </g>
          );
        })}

        {/* X axis labels */}
        {[0, 7, 14, 21, 29].map((i) => (
          <text key={i} x={getX(i)} y={svgHeight - 10} textAnchor="middle" fill="#4A4A60" fontSize="10">
            1/{i + 1}
          </text>
        ))}

        {/* Trend lines */}
        {data.map((line) => {
          const pathD = line.data.map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(p.value)}`).join(' ');
          return (
            <g key={line.topic}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />
              {/* Data points */}
              {line.data.filter((_, i) => i % 5 === 0).map((p, i) => (
                <circle key={i} cx={getX(i * 5)} cy={getY(p.value)} r="4" fill={line.color} stroke="#0A0A0F" strokeWidth="2" />
              ))}
            </g>
          );
        })}

        {/* Legend */}
        {data.map((line, i) => (
          <g key={line.topic} transform={`translate(${padding.left + i * 100}, ${padding.top - 8})`}>
            <line x1="0" y1="0" x2="15" y2="0" stroke={line.color} strokeWidth="2" />
            <text x="20" y="4" fill={line.color} fontSize="10">{line.topic}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   Competitor Bar Chart
   ──────────────────────────────────────────── */

function CompetitorChart({ data }: { data: CompetitorItem[] }) {
  const maxLikes = 30; // in 万

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const likesNum = parseFloat(item.likes);
        const barWidth = (likesNum / maxLikes) * 100;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: easeCyber }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-text-muted w-6 text-right">{index + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-text-primary truncate pr-2">{item.title}</p>
                <span className="text-xs text-neon-cyan font-mono flex-shrink-0">{item.likes}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: index < 3
                      ? 'linear-gradient(90deg, #FF2A6D, #BD00FF)'
                      : 'linear-gradient(90deg, #00F0FF, #BD00FF)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, delay: index * 0.08, ease: easeCyber }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────
   Audience Pie Chart
   ──────────────────────────────────────────── */

function AudienceChart() {
  const total = AUDIENCE_DATA.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-28 h-28 flex-shrink-0">
        {AUDIENCE_DATA.map((segment) => {
          const angle = (segment.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          const endAngle = currentAngle;

          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;

          const x1 = 60 + 45 * Math.cos(startRad);
          const y1 = 60 + 45 * Math.sin(startRad);
          const x2 = 60 + 45 * Math.cos(endRad);
          const y2 = 60 + 45 * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={segment.label}
              d={`M 60 60 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={segment.color}
              fillOpacity={0.8}
              stroke="#0A0A0F"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="60" cy="60" r="20" fill="#0A0A0F" />
      </svg>
      <div className="space-y-1.5 flex-1">
        {AUDIENCE_DATA.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-text-secondary">{d.label}</span>
            </div>
            <span className="text-xs font-mono text-text-primary">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Best Time Heatmap
   ──────────────────────────────────────────── */

function BestTimeHeatmap() {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const hours = ['6', '9', '12', '15', '18', '21'];

  const getColor = (value: number) => {
    const intensity = value / 55;
    return `rgba(0, 240, 255, ${0.1 + intensity * 0.7})`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Hour labels */}
        <div className="flex items-center mb-1">
          <div className="w-10 flex-shrink-0" />
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-text-muted">{h}:00</div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-1">
          {TIME_HEATMAP.map((row, dayIndex) => (
            <div key={dayIndex} className="flex items-center gap-1">
              <div className="w-10 text-right pr-2 text-[10px] text-text-muted flex-shrink-0">{days[dayIndex]}</div>
              <div className="flex flex-1 gap-0.5">
                {row.filter((_, i) => i % 4 === 0 || i % 4 === 2).map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 h-6 rounded-sm flex items-center justify-center text-[9px] font-mono transition-all hover:scale-110"
                    style={{ backgroundColor: getColor(value), color: value > 30 ? '#0A0A0F' : '#8A8AA0' }}
                    title={`${days[dayIndex]} ${(i * 4 + (i >= 3 ? 2 : 0))}:00 - 热度${value}`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN TopicResearch Page
   ═══════════════════════════════════════════ */

export default function TopicResearch() {
  /* ── State ── */
  const [activeView, setActiveView] = useState<DataView>('heatmap');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'intro',
    role: 'broker',
    content: '选题雷达已启动！\n\n今天想研究什么方向？告诉我你感兴趣的话题，我来帮你做深度分析。\n\n比如:\n• 某个具体领域（如"咖啡探店"）\n• 近期的热点事件\n• 你想尝试但不确定的新方向',
    options: ['帮我找选题', '分析热门趋势', '研究竞品', '看看我的领域'],
  }]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<HeatmapNode | null>(null);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [agentExplanation, setAgentExplanation] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viralFilter, setViralFilter] = useState('all');
  const [viralContent, setViralContent] = useState<ViralContent[]>(VIRAL_CONTENT);
  const [trendInsights, setTrendInsights] = useState<string[] | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isParsingVideo, setIsParsingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoAnalysis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dnaImported, setDnaImported] = useState(false);

  useEffect(() => {
    if (activeView !== 'trend') return;
    if (trendInsights) return;
    let cancelled = false;
    (async () => {
      try {
        const system =
          '你是数据驱动的选题分析师。输出 JSON 字符串数组（3条），每条为一句可操作的趋势洞察，不要序号。';
        const user = `关键词：${searchKeyword || '未指定'}\n近30天趋势数据：${JSON.stringify(TREND_DATA)}`;
        const res = await glmChat(system, user, { temperature: 0.6, max_tokens: 512, jsonMode: true });
        const insights = extractJSON<string[]>(res).slice(0, 3);
        if (!cancelled) setTrendInsights(insights);
      } catch {
        if (!cancelled) setTrendInsights(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeView, searchKeyword, trendInsights]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/trending?source=all&limit=20`);
        const data = await res.json().catch(() => ({}));
        const items: any[] = Array.isArray(data?.items) ? data.items : [];
        const covers = ['/sample-post-cover-1.jpg', '/sample-post-cover-2.jpg', '/sample-post-cover-3.jpg', '/sample-post-cover-4.jpg'];
        const mapped: ViralContent[] = items
          .map((it, idx) => {
            const platform = String(it?.source || it?.platform || '').toLowerCase();
            const p = platform.includes('zhihu') || String(it?.platform).includes('知乎') ? 'zhihu' : 'bilibili';
            const heat = Number(it?.heat || 80);
            const plays = p === 'bilibili' ? `${Math.max(10, Math.round((heat / 100) * 120))}万` : '—';
            const likes = p === 'bilibili' ? `${Math.max(1, Math.round((heat / 100) * 18))}万` : '—';
            const comments = p === 'bilibili' ? `${Math.max(50, Math.round((heat / 100) * 2600))}` : '—';
            return {
              id: String(it?.id || `t_${idx}`),
              title: String(it?.title || '').trim(),
              platform: p as 'bilibili' | 'zhihu',
              cover: covers[idx % covers.length],
              link: String(it?.url || it?.link || ''),
              likes,
              comments,
              plays,
            };
          })
          .filter((x) => x.title);
        if (!cancelled && mapped.length) setViralContent(mapped);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Chat Handlers ── */
  const handleSendMessage = useCallback((text: string) => {
    setChatMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setChatMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'broker',
        content: `已为你完成"${text}"的选题分析！\n\n分析结果已在中央面板展示，包含:\n📊 选题热力图\n📈 热度趋势\n🏆 竞品对比\n\n点击任意数据点，我会为你详细解读！`,
      }]);
    }, 3000);
  }, []);

  const handleSelectOption = useCallback((option: string) => {
    setChatMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: option }]);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (option === '帮我找选题') {
        setChatMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'broker',
          content: '没问题！先告诉我，你更偏向哪个大方向？',
          options: CATEGORIES,
        }]);
      } else {
        setChatMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'broker',
          content: `好的！我来为你进行${option}分析...\n\n分析完成！中央面板已展示结果。点击任意数据点查看详细解读。`,
        }]);
      }
    }, 2000);
  }, []);

  /* ── Chart Click → Agent Explanation ── */
  const handleNodeClick = useCallback(async (node: HeatmapNode) => {
    setSelectedTopic(node);
    const explanation = `你选的「${node.topic}」这个话题很有意思！\n\n📊 数据看点:\n• 当前热度: ${node.heat}/100，属于${node.heat > 80 ? '高' : node.heat > 60 ? '中高' : '中等'}热度区间\n• 竞争密度: ${node.competition < 0.35 ? '较低（绿色）' : node.competition < 0.6 ? '中等（黄色）' : '较高（红色）'}\n• 近7天趋势: ${node.trend > 0 ? '↑' : '↓'} ${Math.abs(node.trend)}%\n\n💡 我的建议:\n避开红海赛道，试试"${node.topic} + 信息差"的角度，更容易突围。要我帮你生成一篇这个方向的推文吗？`;
    setShowAgentPanel(true);
    setAgentExplanation('...');
    try {
      const system =
        '你是数据驱动的选题分析师。根据给定数据用中文生成一段可执行的解读与建议（150-300字），包含：数据看点（热度/竞争/趋势）+ 选题角度 + 执行步骤。';
      const user = `数据：${JSON.stringify(node)}`;
      const res = await glmChat(system, user, { temperature: 0.6, max_tokens: 512 });
      setAgentExplanation(res);
    } catch {
      setAgentExplanation(explanation);
    }
  }, []);

  /* ── TTS Speak ── */
  const handleSpeak = useCallback(() => {
    if (!agentExplanation) return;
    // TODO: Configure TTS API (Web Speech API or ElevenLabs)
    // const utterance = new SpeechSynthesisUtterance(agentExplanation);
    // utterance.lang = 'zh-CN';
    // speechSynthesis.speak(utterance);
    setIsSpeaking(!isSpeaking);
    if (!isSpeaking) {
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  }, [agentExplanation, isSpeaking]);

  /* ── Video Analysis ── */
  const handleParseVideo = useCallback(async () => {
    const raw = videoUrl.trim();
    if (!raw) return;
    const bvidMatch = raw.match(/BV[0-9A-Za-z]{10,}/);
    if (!bvidMatch && !raw.includes('bilibili.com')) {
      setVideoResult({
        meta: { bvid: '—', title: '仅支持B站', category: '—', author: '—', tags: [], durationSec: 0 },
        metrics: { view: 0, like: 0, coin: 0, favorite: 0, share: 0, reply: 0, danmaku: 0 },
        summary: '目前视频智能解析仅支持 B站（bilibili）链接或 BV 号。',
        positioning: '请粘贴 B站 链接（含 BV 号），我会基于标题/简介/数据/评论生成高级分析。',
        audience: '—',
        structure: [],
        hooks: [],
        techniques: [],
        commentInsights: [],
        actionPlan: [],
        dna: { tone: '', writingStyle: '', contentPillar: '', targetAudience: '', keywords: [], emojiDensity: 0.2 },
      });
      return;
    }

    setIsParsingVideo(true);
    setVideoResult(null);
    try {
      const res = await fetch(`/api/bilibili/view?url=${encodeURIComponent(raw)}`, { method: 'GET' });
      const info = await res.json().catch(() => ({}));
      if (info?.error) {
        throw new Error(String(info.error));
      }

      const system =
        '你是顶级视频内容分析师与增长顾问，风格“专业、数据驱动、高级感”。' +
        '你将基于 B站视频的标题/简介/分区/标签/播放互动数据/热门评论，生成一份可直接执行的分析报告。' +
        '只输出可被 JSON.parse 解析的 JSON 对象，字段必须严格为：' +
        'summary, positioning, audience, structure, hooks, techniques, commentInsights, actionPlan, dna。' +
        '其中 structure/hooks/techniques/commentInsights/actionPlan 为字符串数组；' +
        'dna 为对象，字段：tone, writingStyle, contentPillar, targetAudience, keywords(数组), emojiDensity(0-1), dimensions(可选，包含 humor/emotionValue/professionalism/affinity/aggressiveness 0-100)。' +
        'summary 80-140字；positioning/audience 60-120字；每个数组 4-8 条。';
      const user =
        `视频信息：${JSON.stringify({
          title: info?.title,
          desc: info?.desc,
          category: info?.tname,
          tags: info?.tags,
          author: info?.owner?.name,
          duration: info?.duration,
          stat: info?.stat,
          topComments: info?.comments,
        })}`;

      const analysisRaw = await glmChat(system, user, { temperature: 0.45, max_tokens: 1600, jsonMode: true });
      const analysis = extractJSON<any>(analysisRaw);

      const v: VideoAnalysis = {
        meta: {
          bvid: String(info?.bvid || ''),
          title: String(info?.title || '').trim(),
          category: String(info?.tname || '').trim(),
          author: String(info?.owner?.name || '').trim(),
          tags: Array.isArray(info?.tags) ? info.tags : [],
          durationSec: Number(info?.duration || 0),
        },
        metrics: {
          view: Number(info?.stat?.view || 0),
          like: Number(info?.stat?.like || 0),
          coin: Number(info?.stat?.coin || 0),
          favorite: Number(info?.stat?.favorite || 0),
          share: Number(info?.stat?.share || 0),
          reply: Number(info?.stat?.reply || 0),
          danmaku: Number(info?.stat?.danmaku || 0),
        },
        summary: String(analysis?.summary || '').trim(),
        positioning: String(analysis?.positioning || '').trim(),
        audience: String(analysis?.audience || '').trim(),
        structure: Array.isArray(analysis?.structure) ? analysis.structure.map(String).filter(Boolean).slice(0, 10) : [],
        hooks: Array.isArray(analysis?.hooks) ? analysis.hooks.map(String).filter(Boolean).slice(0, 10) : [],
        techniques: Array.isArray(analysis?.techniques) ? analysis.techniques.map(String).filter(Boolean).slice(0, 10) : [],
        commentInsights: Array.isArray(analysis?.commentInsights) ? analysis.commentInsights.map(String).filter(Boolean).slice(0, 10) : [],
        actionPlan: Array.isArray(analysis?.actionPlan) ? analysis.actionPlan.map(String).filter(Boolean).slice(0, 10) : [],
        dna: {
          tone: String(analysis?.dna?.tone || '').trim(),
          writingStyle: String(analysis?.dna?.writingStyle || '').trim(),
          contentPillar: String(analysis?.dna?.contentPillar || '').trim(),
          targetAudience: String(analysis?.dna?.targetAudience || '').trim(),
          keywords: Array.isArray(analysis?.dna?.keywords) ? analysis.dna.keywords.map(String).filter(Boolean).slice(0, 24) : [],
          emojiDensity: Math.max(0, Math.min(1, Number(analysis?.dna?.emojiDensity ?? 0.2))),
          dimensions: analysis?.dna?.dimensions || undefined,
        },
      };

      setVideoResult(v);
    } catch (e: any) {
      setVideoResult({
        meta: { bvid: '—', title: '解析失败', category: '—', author: '—', tags: [], durationSec: 0 },
        metrics: { view: 0, like: 0, coin: 0, favorite: 0, share: 0, reply: 0, danmaku: 0 },
        summary: String(e?.message || '解析失败，请稍后再试。'),
        positioning: '',
        audience: '',
        structure: [],
        hooks: [],
        techniques: [],
        commentInsights: [],
        actionPlan: [],
        dna: { tone: '', writingStyle: '', contentPillar: '', targetAudience: '', keywords: [], emojiDensity: 0.2 },
      });
    } finally {
      setIsParsingVideo(false);
    }
  }, [videoUrl]);

  const handleImportVideoDNA = useCallback(() => {
    if (!videoResult?.dna) return;
    try {
      const raw = localStorage.getItem('koc_dna_profile');
      const existing = raw ? JSON.parse(raw) : null;
      const pickNum = (n: any, d: number) => (Number.isFinite(Number(n)) ? Number(n) : d);
      const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
      const uniq = (arr: string[]) => arr.filter((v, i) => arr.indexOf(v) === i);

      const base = existing || {};
      const dna = videoResult.dna;
      const mergedKeywords = uniq([...(Array.isArray(base?.keywords) ? base.keywords : []), ...(Array.isArray(dna.keywords) ? dna.keywords : [])])
        .map((s) => String(s).trim())
        .filter(Boolean)
        .slice(0, 30);

      const dims = base?.dimensions && typeof base.dimensions === 'object' ? base.dimensions : {};
      const hinted = dna.dimensions || {};
      const mergedDimensions = {
        humor: clamp100(pickNum(dims?.humor, pickNum(hinted?.humor, 45))),
        emotionValue: clamp100(pickNum(dims?.emotionValue, pickNum(hinted?.emotionValue, 55))),
        professionalism: clamp100(pickNum(dims?.professionalism, pickNum(hinted?.professionalism, 70))),
        affinity: clamp100(pickNum(dims?.affinity, pickNum(hinted?.affinity, 62))),
        aggressiveness: clamp100(pickNum(dims?.aggressiveness, pickNum(hinted?.aggressiveness, 35))),
      };

      const next = {
        tone: String(base?.tone || dna.tone || '中性').trim(),
        keywords: mergedKeywords,
        emojiDensity: Math.max(0, Math.min(1, pickNum(base?.emojiDensity, pickNum(dna.emojiDensity, 0.2)))),
        dimensions: mergedDimensions,
        writingStyle: String(base?.writingStyle || dna.writingStyle || '').trim(),
        targetAudience: String(base?.targetAudience || dna.targetAudience || '').trim(),
        contentPillar: String(base?.contentPillar || dna.contentPillar || '').trim(),
      };

      localStorage.setItem('koc_dna_profile', JSON.stringify(next));
      setDnaImported(true);
      setTimeout(() => setDnaImported(false), 2200);
    } catch {}
  }, [videoResult]);

  /* ── Filtered Viral Content ── */
  const filteredViral = viralFilter === 'all'
    ? viralContent
    : viralContent.filter((v) => v.platform === viralFilter);

  /* ══════ RENDER ══════ */
  return (
    <div className="min-h-[100dvh] pt-[72px] bg-void">
      {/* ===== HERO ===== */}
      <div className="relative h-[260px] md:h-[320px] overflow-hidden">
        <img
          src="/topic-research-hero.jpg"
          alt="选题雷达"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1440px] mx-auto px-6 w-full pb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeCyber }}
              className="font-orbitron text-3xl md:text-5xl font-bold text-neon-magenta mb-2"
            >
              选题雷达
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeCyber }}
              className="text-text-secondary text-base md:text-lg mb-5"
            >
              AI驱动的热点追踪与选题分析，让内容永远快人一步
            </motion.p>
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeCyber }}
              className="flex items-center gap-3 max-w-xl"
            >
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchKeyword.trim()) {
                      handleSendMessage(searchKeyword.trim());
                    }
                  }}
                  placeholder="输入选题关键词..."
                  className="w-full bg-void/80 backdrop-blur-sm border border-white/15 rounded-xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-magenta/50 transition-colors"
                />
              </div>
              <button
                onClick={() => searchKeyword.trim() && handleSendMessage(searchKeyword.trim())}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-neon-magenta text-white hover:brightness-110 transition-all flex-shrink-0"
              >
                <Radar size={18} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        {/* 热点预埋雷达 — 全宽 */}
        <div className="mb-6">
          <HeatPreloader
            topic={searchKeyword}
            onCreateContent={(topic) => {
              console.log('Creating content for:', topic);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Chat Panel */}
          <div className="lg:col-span-4 h-[500px] lg:h-[700px]">
            <ResearchChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onSelectOption={handleSelectOption}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Center: Data Visualization */}
          <div className="lg:col-span-8 space-y-6">
            {/* View Tabs */}
            <div className="flex items-center gap-2">
              {[
                { key: 'heatmap' as DataView, label: '选题热力图', icon: Flame },
                { key: 'trend' as DataView, label: '趋势分析', icon: TrendingUp },
                { key: 'competitor' as DataView, label: '竞品解构', icon: Target },
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setActiveView(view.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                    activeView === view.key
                      ? 'bg-neon-magenta text-white shadow-glow-magenta'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                  )}
                >
                  <view.icon size={15} />
                  {view.label}
                </button>
              ))}
            </div>

            {/* Data Views */}
            <AnimatePresence mode="wait">
              {/* Heatmap View */}
              {activeView === 'heatmap' && (
                <motion.div
                  key="heatmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 热点预埋雷达 */}
                  <div className="mb-6">
                    <HeatPreloader
                      topic={searchKeyword}
                      onCreateContent={(topic) => {
                        console.log('Creating content for:', topic);
                      }}
                    />
                  </div>

                  <HeatmapChart data={HEATMAP_DATA} onNodeClick={handleNodeClick} />

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {[
                      { label: '分析话题', value: '15个', icon: Hash, color: 'text-neon-cyan' },
                      { label: '平均热度', value: '72.4', icon: Flame, color: 'text-neon-magenta' },
                      { label: '上升话题', value: '11个', icon: TrendingUp, color: 'text-neon-green' },
                      { label: '蓝海机会', value: '5个', icon: Star, color: 'text-neon-gold' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-void-light/50 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <stat.icon size={18} className={stat.color} />
                        </div>
                        <div>
                          <p className="text-lg font-mono font-bold text-text-primary">{stat.value}</p>
                          <p className="text-[10px] text-text-muted">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Trend View */}
              {activeView === 'trend' && (
                <motion.div
                  key="trend"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-void-light/50 border border-white/5 rounded-xl p-6"
                >
                  <h3 className="text-sm font-medium text-text-primary mb-4">近30天热度趋势</h3>
                  <TrendChart data={TREND_DATA} />

                  {/* Trend Insights */}
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs text-text-muted font-medium uppercase tracking-wider">AI 趋势洞察</h4>
                    {(trendInsights ?? [
                      '「咖啡探店」近7天热度上升18%，预计下周达到峰值',
                      '「平价美食」搜索量近期上升34%，机会窗口打开中',
                      '「AI工具」是新兴高增长话题，竞争度适中，建议抢先布局',
                    ]).map((text, i) => {
                      const Icon = i < 2 ? ArrowUpRight : Lightbulb;
                      const color = i < 2 ? 'text-neon-green' : 'text-neon-gold';
                      return (
                      <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                        <Icon size={14} className={`mt-0.5 flex-shrink-0 ${color}`} />
                        <p className="text-xs text-text-secondary">{text}</p>
                      </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Competitor View */}
              {activeView === 'competitor' && (
                <motion.div
                  key="competitor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-void-light/50 border border-white/5 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-text-primary mb-4">竞品内容排行</h3>
                    <CompetitorChart data={COMPETITOR_DATA} />
                  </div>

                  {/* Audience + Best Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-void-light/50 border border-white/5 rounded-xl p-5">
                      <h4 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                        <Users size={14} className="text-neon-cyan" />
                        受众画像
                      </h4>
                      <AudienceChart />
                    </div>
                    <div className="bg-void-light/50 border border-white/5 rounded-xl p-5">
                      <h4 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                        <Clock size={14} className="text-neon-gold" />
                        最佳发布时间
                      </h4>
                      <BestTimeHeatmap />
                      <p className="text-[10px] text-text-muted mt-2">颜色越深表示该时段用户活跃度越高</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Viral Content Section */}
            <div className="bg-void-light/50 border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Flame size={15} className="text-neon-magenta" />
                  爆款内容搜索
                </h3>
                <div className="flex items-center gap-1">
                  {[
                    { key: 'all', label: '全部' },
                    { key: 'zhihu', label: '知乎' },
                    { key: 'bilibili', label: 'B站' },
                  ].map((pf) => (
                    <button
                      key={pf.key}
                      onClick={() => setViralFilter(pf.key)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
                        viralFilter === pf.key
                          ? 'bg-neon-magenta/20 text-neon-magenta'
                          : 'text-text-muted hover:text-text-secondary'
                      )}
                    >
                      {pf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TODO: Integrate with search API (src/services/search.ts) for real viral content
                  Use searchViralContent(platform, keyword) to fetch trending posts */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredViral.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05, ease: easeCyber }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors group"
                  >
                    <span className="text-xs text-text-muted w-5 text-center font-mono">{index + 1}</span>
                    <div className="w-14 h-10 rounded-md overflow-hidden bg-void flex-shrink-0">
                      <img src={item.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary truncate group-hover:text-neon-cyan transition-colors">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${PLATFORM_COLORS[item.platform]}20`,
                            color: PLATFORM_COLORS[item.platform],
                          }}
                        >
                          {PLATFORM_LABELS[item.platform]}
                        </span>
                        <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                          <ThumbsUp size={9} /> {item.likes}
                        </span>
                        <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                          <MessageCircle size={9} /> {item.comments}
                        </span>
                        <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                          <Play size={9} /> {item.plays}
                        </span>
                      </div>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-text-muted hover:text-neon-cyan transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Video Analysis Section */}
            <div className="bg-void-light/50 border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 mb-4">
                <Play size={15} className="text-neon-violet" />
                视频智能解析
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-violet/10 border border-neon-violet/20 text-neon-violet">仅支持B站</span>
              </h3>

              {/* URL Input */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="粘贴B站视频链接或BV号（例如：https://www.bilibili.com/video/BV...）"
                    className="w-full bg-void border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-violet/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleParseVideo}
                  disabled={isParsingVideo || !videoUrl.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-neon-violet text-white hover:brightness-110 transition-all disabled:opacity-30"
                >
                  {isParsingVideo ? (
                    <><Loader2 size={14} className="animate-spin" /> 解析中...</>
                  ) : (
                    <><Sparkles size={14} /> 开始解析</>
                  )}
                </button>
              </div>

              {/* TODO: Configure video parsing pipeline:
                  1. Backend downloads video / extracts frames
                  2. Audio → Whisper API → text transcript
                  3. Key frames → GPT-4V → visual analysis
                  4. Combined → LLM → comprehensive report
                  Files: src/services/search.ts + src/services/llm.ts */}

              {/* Analysis Result */}
              <AnimatePresence>
                {videoResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: easeCyber }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-text-primary truncate">{videoResult.meta.title}</div>
                          <div className="mt-1 text-[11px] text-text-muted flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{videoResult.meta.category || '未分区'}</span>
                            <span>UP主：{videoResult.meta.author || '—'}</span>
                            <span>BV：{videoResult.meta.bvid || '—'}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleImportVideoDNA}
                          disabled={!videoResult.dna?.keywords?.length}
                          className={cn(
                            'px-4 py-2 rounded-xl text-xs font-bold border transition-all',
                            dnaImported
                              ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
                              : 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20'
                          )}
                        >
                          {dnaImported ? '已导入DNA' : '一键导入到DNA'}
                        </button>
                      </div>

                      {videoResult.meta.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {videoResult.meta.tags.slice(0, 10).map((t) => (
                            <span key={t} className="px-2.5 py-1 rounded-full bg-neon-violet/10 border border-neon-violet/20 text-[11px] text-neon-violet">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { k: '播放', v: videoResult.metrics.view },
                          { k: '点赞', v: videoResult.metrics.like },
                          { k: '评论', v: videoResult.metrics.reply },
                          { k: '弹幕', v: videoResult.metrics.danmaku },
                          { k: '投币', v: videoResult.metrics.coin },
                          { k: '收藏', v: videoResult.metrics.favorite },
                          { k: '转发', v: videoResult.metrics.share },
                        ].map((m) => (
                          <div key={m.k} className="rounded-lg bg-void border border-white/5 p-3">
                            <div className="text-[10px] text-text-muted">{m.k}</div>
                            <div className="text-sm font-bold text-text-primary">{m.v || 0}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-xs font-medium text-neon-cyan mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> 核心摘要
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">{videoResult.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-xs font-medium text-neon-magenta mb-2 flex items-center gap-1.5">
                          <Target size={12} /> 定位与卖点
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{videoResult.positioning}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-xs font-medium text-neon-gold mb-2 flex items-center gap-1.5">
                          <Users size={12} /> 受众画像
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{videoResult.audience}</p>
                      </div>
                    </div>

                    {videoResult.structure.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-xs font-medium text-neon-violet mb-2 flex items-center gap-1.5">
                          <Clock size={12} /> 结构拆解
                        </h4>
                        <div className="space-y-1">
                          {videoResult.structure.slice(0, 8).map((s, i) => (
                            <div key={i} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-text-muted font-mono">{String(i + 1).padStart(2, '0')}</span>
                              <span className="flex-1 min-w-0">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {videoResult.hooks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-neon-cyan mb-2 flex items-center gap-1.5">
                          <Flame size={12} /> 可复用钩子
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {videoResult.hooks.slice(0, 10).map((h, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-[11px] text-neon-cyan">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {videoResult.techniques.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-neon-green mb-2 flex items-center gap-1.5">
                          <Zap size={12} /> 可借鉴技巧
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {videoResult.techniques.slice(0, 10).map((tech, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 text-[11px] text-neon-green">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {videoResult.commentInsights.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-xs font-medium text-neon-gold mb-2 flex items-center gap-1.5">
                          <MessageCircle size={12} /> 评论洞察
                        </h4>
                        <div className="space-y-1">
                          {videoResult.commentInsights.slice(0, 8).map((c, i) => (
                            <div key={i} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-text-muted font-mono">•</span>
                              <span className="flex-1 min-w-0">{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {videoResult.actionPlan.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-4 border border-neon-cyan/10">
                        <h4 className="text-xs font-medium text-neon-magenta mb-2 flex items-center gap-1.5">
                          <Wand2 size={12} /> 可执行改造清单
                        </h4>
                        <div className="space-y-1">
                          {videoResult.actionPlan.slice(0, 10).map((a, i) => (
                            <div key={i} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-text-muted font-mono">{String(i + 1).padStart(2, '0')}</span>
                              <span className="flex-1 min-w-0">{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ===== AGENT DATA EXPLANATION PANEL (Bottom) ===== */}
      <AnimatePresence>
        {showAgentPanel && selectedTopic && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: easeCyber }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-void-light/95 backdrop-blur-xl border-t border-neon-cyan/30 shadow-[0_-8px_32px_rgba(0,240,255,0.1)]"
          >
            <div className="max-w-[1440px] mx-auto px-6 py-4">
              {/* Toggle bar */}
              <button
                onClick={() => setShowAgentPanel(false)}
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-void-light border border-neon-cyan/30 rounded-full flex items-center justify-center"
              >
                <ChevronDown size={14} className="text-neon-cyan" />
              </button>

              <div className="flex items-start gap-4">
                {/* Broker Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neon-cyan/50">
                    <img src="/broker-female.png" alt="经纪人" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-cyan rounded-full flex items-center justify-center">
                    <Volume2 size={8} className="text-void" />
                  </div>
                </div>

                {/* Explanation Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-neon-cyan">梦璃 · 数据解读</span>
                    <span className="text-[10px] text-text-muted">刚刚</span>
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">
                    {agentExplanation}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      const t = selectedTopic?.topic || '';
                      if (!t) return;
                      const params = new URLSearchParams();
                      params.set('autogen', '1');
                      params.set('topic', t);
                      params.set('platform', 'xiaohongshu');
                      window.location.hash = `/content-lab?${params.toString()}`;
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-neon-cyan text-void hover:brightness-110 transition-all"
                  >
                    <Wand2 size={12} />
                    生成推文
                  </button>
                  <button
                    onClick={handleSpeak}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                      isSpeaking
                        ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                        : 'border-white/10 text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <Volume2 size={12} />
                    {isSpeaking ? '播放中...' : '朗读'}
                  </button>
                  <button
                    onClick={() => setShowAgentPanel(false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <X size={12} />
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
