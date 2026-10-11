import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Image, Upload, Copy, Check, Sparkles,
  Send, Palette, Shirt, Scissors, Download,
  Grid3X3, MessageCircle, Heart, Bookmark, Share2,
  MoreHorizontal, MessageSquare,
  ThumbsUp, Repeat2, X,
  Loader2, Zap,
  ScissorsLineDashed,
  Film, Camera, Aperture, Sun, Moon, Flame,
  Briefcase, Crown, Sparkle, CheckCircle2,
  RefreshCw, Rocket, Music, User, Search,
  Plus, Minus,
  PenLine, Plane, Laptop, UtensilsCrossed,
} from 'lucide-react';
import ViralitySimulator from '@/components/ViralitySimulator';
import TitleFactory from '@/components/TitleFactory';
import CommentRehearsal from '@/components/CommentRehearsal';
import { glmChat } from '@/services/glmClient';
import { generateImage as generateGLMImage } from '@/services/imageGen';
import type { DNAProfile } from '@/services/aiMock';
import { useLocation } from 'react-router';

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface ChatMessage {
  id: string;
  role: 'user' | 'broker' | 'system';
  content: string;
  options?: string[];
  quickActions?: string[];
}

interface GeneratedPost {
  text: string;
  images: string[];
  style: PlatformStyle;
  title?: string;
  tags: string[];
  location?: string;
}

type PlatformStyle = 'xiaohongshu' | 'wechat' | 'douyin' | 'linkedin';
type BeautyTab = 'filters' | 'clothes' | 'hairstyle';
type WorkItem = { id: string; title: string; date: string; platform: PlatformStyle; image: string; text: string };

/* ═══════════════════════════════════════════
   Constants & Mock Data
   ═══════════════════════════════════════════ */

const STYLE_LABELS: Record<PlatformStyle, string> = {
  xiaohongshu: '小红书',
  wechat: '朋友圈',
  douyin: '抖音',
  linkedin: '领英',
};

const PLATFORM_COLORS: Record<PlatformStyle, string> = {
  xiaohongshu: '#FF2442',
  wechat: '#07C160',
  douyin: '#161823',
  linkedin: '#0A66C2',
};

const PLATFORM_BG: Record<PlatformStyle, string> = {
  xiaohongshu: 'from-[#FF2442]/20 to-transparent',
  wechat: 'from-[#07C160]/20 to-transparent',
  douyin: 'from-[#FE2C55]/20 to-transparent',
  linkedin: 'from-[#0A66C2]/20 to-transparent',
};

const FILTER_PRESETS = [
  { name: '原图', icon: Camera, filter: 'none', color: '#8A8AA0' },
  { name: '日系清新', icon: Sun, filter: 'brightness(1.08) saturate(1.15) contrast(0.95)', color: '#39FF14' },
  { name: '复古胶片', icon: Film, filter: 'sepia(0.35) contrast(1.15) brightness(0.95) saturate(0.85)', color: '#FFD700' },
  { name: '赛博朋克', icon: Zap, filter: 'hue-rotate(180deg) saturate(1.5) contrast(1.2) brightness(1.05)', color: '#00F0FF' },
  { name: '胶片感', icon: Aperture, filter: 'contrast(1.25) saturate(0.8) brightness(1.02) sepia(0.1)', color: '#FF2A6D' },
  { name: '电影感', icon: Moon, filter: 'contrast(1.1) brightness(0.9) saturate(0.75) sepia(0.08)', color: '#BD00FF' },
];

const CLOTHES_STYLES = [
  { name: '休闲', icon: Shirt, desc: '舒适随性的日常穿搭' },
  { name: '商务', icon: Briefcase, desc: '正式干练的职场风格' },
  { name: '街头', icon: Flame, desc: '潮流个性的街头风尚' },
  { name: '礼服', icon: Crown, desc: '优雅高贵的正式场合' },
  { name: '国风', icon: Sparkle, desc: '古典雅致的中式美学' },
];

const HAIRSTYLES = [
  { name: '短发', desc: '清爽利落的短造型' },
  { name: '长发', desc: '飘逸柔美的长发' },
  { name: '卷发', desc: '浪漫迷人的波浪卷' },
  { name: '染发', desc: '潮流个性的发色' },
  { name: '编发', desc: '精致优雅的编发' },
];

const MY_WORKS: WorkItem[] = [
  { id: '1', title: '藏在巷子里的时光机', date: '2024-01-15', platform: 'xiaohongshu', image: '/sample-post-cover-1.jpg', text: '今天误打误撞走进了一家复古咖啡馆...' },
  { id: '2', title: 'iPhone 15 Pro 深度测评', date: '2024-01-12', platform: 'wechat', image: '/sample-post-cover-2.jpg', text: '用了两周，说说真实感受...' },
  { id: '3', title: '川西自驾攻略', date: '2024-01-08', platform: 'douyin', image: '/sample-post-cover-3.jpg', text: '三天两夜，人均2000...' },
  { id: '4', title: '职场新人穿搭指南', date: '2024-01-05', platform: 'linkedin', image: '/sample-post-cover-4.jpg', text: '从学生到职场人的穿搭转型...' },
];

const CATEGORIES = ['全部', '推文生成', '图像美妆', 'AI配图'];

/* Preset demo scenarios */
const PRESETS = [
  { id: 'food', label: '🍜 帮我写美食探店推文', icon: UtensilsCrossed, topic: '美食探店', greeting: '美食探店可是小红书的流量密码！今天想分享哪家店呢？' },
  { id: 'tech', label: '📱 帮我写科技测评', icon: Laptop, topic: '科技测评', greeting: '科技测评内容超受欢迎！你想测评哪款数码产品？' },
  { id: 'travel', label: '✈️ 帮我写旅行Vlog', icon: Plane, topic: '旅行Vlog', greeting: '旅行内容最容易出爆款！去哪里玩了呀？' },
  { id: 'fashion', label: '👗 帮我写穿搭分享', icon: Shirt, topic: '穿搭分享', greeting: '穿搭分享互动率超高！今天的OOTD是什么风格？' },
  { id: 'free', label: '✏️ 自由创作', icon: PenLine, topic: '自由创作', greeting: '自由创作最有趣了！你想写什么主题？' },
];

const STYLE_OPTIONS = ['幽默风趣', '专业种草', '温暖治愈'];

const PLATFORM_GUIDE: Record<PlatformStyle, string> = {
  xiaohongshu: '小红书：闺蜜式分享，多用emoji，标题可带｜，结尾引导收藏。',
  douyin: '抖音：前3秒钩子，短句口语化，结尾提问引导评论。',
  wechat: '朋友圈：生活化，真情实感，少标签。',
  linkedin: '领英：专业严谨，数据支撑，结构化表达。',
};

function parseGeneratedContent(text: string) {
  const raw = String(text || '').trim();
  const titleMatch = raw.match(/标题[:：]\s*(.+)/);
  const bodyMatch = raw.match(/正文[:：]\s*([\s\S]*?)(?:\n\s*标签[:：]|$)/);
  const tagsMatch = raw.match(/标签[:：]\s*([\s\S]*)$/);
  const title = titleMatch?.[1]?.trim() || '';
  const body = bodyMatch?.[1]?.trim() || raw;
  const tagsRaw = tagsMatch?.[1]?.trim() || '';
  const tags = tagsRaw
    .replace(/[#＃]/g, ' ')
    .split(/[\s,，]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
  return { title, body, tags };
}

async function generatePostViaLLM(topic: string, tone: string, style: PlatformStyle) {
  const platform = STYLE_LABELS[style];
  let dnaHint = '';
  try {
    const raw = localStorage.getItem('koc_dna_profile');
    if (raw) {
      const dna = JSON.parse(raw);
      const keywords = Array.isArray(dna?.keywords) ? dna.keywords.filter(Boolean).slice(0, 8) : [];
      dnaHint =
        `\n\n用户个人风格DNA：语气=${String(dna?.tone || '')}；内容支柱=${String(dna?.contentPillar || '')}；写作风格=${String(dna?.writingStyle || '')}；emoji密度=${String(dna?.emojiDensity ?? '')}；关键词=${keywords.join('、')}。` +
        `\n生成内容必须体现该DNA风格。`;
    }
  } catch {}
  const system = `你是${platform}创作者。${PLATFORM_GUIDE[style]}${dnaHint}\n\n输出格式：标题：XXX\n正文：XXX\n标签：#标签`;
  const res = await glmChat(system, `主题：${topic}\n风格：${tone}`, { temperature: 0.85, max_tokens: 1024 });
  const parsed = parseGeneratedContent(res);
  const post: GeneratedPost = {
    text: parsed.body,
    images: [],
    style,
    title: parsed.title,
    tags: parsed.tags,
    location: style === 'xiaohongshu' ? '上海' : undefined,
  };
  return post;
}

/* ═══════════════════════════════════════════
   Utility
   ═══════════════════════════════════════════ */

const easeCyber = [0.16, 1, 0.3, 1] as [number, number, number, number];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getBrokerName(): string {
  try {
    const choice = localStorage.getItem('pcg_broker_choice');
    return choice === 'male' ? '凌霄' : '梦璃';
  } catch {
    return '梦璃';
  }
}

function getBrokerImage(): string {
  try {
    const choice = localStorage.getItem('pcg_broker_choice');
    return choice === 'male' ? '/broker-male.png' : '/broker-female.png';
  } catch {
    return '/broker-female.png';
  }
}

/* ═══════════════════════════════════════════
   Components
   ═══════════════════════════════════════════ */

/** Platform selector card with real UI mini-preview inside */
function PlatformCard({
  style,
  label,
  isSelected,
  onClick,
}: {
  style: PlatformStyle;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = PLATFORM_COLORS[style];

  const miniPreview = () => {
    switch (style) {
      case 'xiaohongshu':
        return (
          <div className="w-full h-full bg-white rounded-md overflow-hidden flex flex-col">
            <div className="h-3 bg-[#FF2442] w-full" />
            <div className="flex-1 p-1 space-y-1">
              <div className="flex items-center gap-1">
                <Search size={8} className="text-gray-400" />
                <div className="h-2 bg-gray-100 rounded-full flex-1" />
              </div>
              <div className="grid grid-cols-2 gap-0.5">
                <div className="aspect-square bg-pink-50 rounded" />
                <div className="aspect-square bg-pink-50 rounded" />
              </div>
              <div className="flex gap-1 mt-0.5">
                <Heart size={8} className="text-gray-300" />
                <MessageSquare size={8} className="text-gray-300" />
                <Bookmark size={8} className="text-gray-300" />
              </div>
            </div>
          </div>
        );
      case 'wechat':
        return (
          <div className="w-full h-full bg-[#EDEDED] rounded-md overflow-hidden flex flex-col">
            <div className="h-3 bg-[#07C160] w-full" />
            <div className="flex-1 p-1 space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-[#07C160]" />
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-300 rounded w-3/4" />
                  <div className="h-1 bg-gray-200 rounded w-1/2 mt-0.5" />
                </div>
              </div>
              <div className="bg-white rounded p-1">
                <div className="h-1.5 bg-gray-200 rounded w-full" />
                <div className="h-1 bg-gray-100 rounded w-2/3 mt-0.5" />
              </div>
            </div>
          </div>
        );
      case 'douyin':
        return (
          <div className="w-full h-full bg-[#161823] rounded-md overflow-hidden flex flex-col">
            <div className="flex-1 relative">
              <div className="absolute bottom-0 left-0 right-0 p-1">
                <div className="h-1 bg-white/20 rounded w-3/4" />
                <div className="flex gap-1 mt-0.5">
                  <div className="h-1 bg-white/10 rounded w-4" />
                  <div className="h-1 bg-white/10 rounded w-6" />
                </div>
              </div>
              <div className="absolute right-1 top-1/3 space-y-1">
                <Heart size={8} className="text-white/60" />
                <MessageCircle size={8} className="text-white/60" />
                <Share2 size={8} className="text-white/60" />
              </div>
            </div>
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-full h-full bg-white rounded-md overflow-hidden flex flex-col border border-gray-100">
            <div className="h-3 bg-[#0A66C2] w-full" />
            <div className="flex-1 p-1 space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-100" />
                <div>
                  <div className="h-1.5 bg-gray-700 rounded w-12" />
                  <div className="h-1 bg-gray-300 rounded w-8 mt-0.5" />
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded w-full" />
              <div className="h-1 bg-gray-100 rounded w-3/4" />
              <div className="flex gap-2 mt-0.5">
                <ThumbsUp size={7} className="text-gray-400" />
                <MessageCircle size={7} className="text-gray-400" />
                <Repeat2 size={7} className="text-gray-400" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-[220px] h-[140px] rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all duration-300',
        isSelected
          ? 'scale-105'
          : 'border-white/10 hover:border-white/25',
        isSelected ? 'border-current' : ''
      )}
      style={isSelected ? { borderColor: color, boxShadow: `0 0 20px ${color}66` } : undefined}
    >
      {/* Background gradient */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', PLATFORM_BG[style])} />
      <div className="absolute inset-0 bg-void-light/80" />

      {/* Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Check size={14} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
        {/* Mini UI preview */}
        <div className="w-24 h-16 scale-75 origin-center">
          {miniPreview()}
        </div>
        <span
          className="text-sm font-bold"
          style={{ color: isSelected ? color : '#8A8AA0' }}
        >
          {label}
        </span>
      </div>
    </motion.button>
  );
}

/** Broker avatar with breathing animation and glow */
function BrokerAvatar({ large = false }: { large?: boolean }) {
  const brokerImg = getBrokerImage();
  const brokerName = getBrokerName();
  const isMale = brokerName === '凌霄';
  const glowColor = isMale ? '#00D4FF' : '#FF6B9D';

  return (
    <div className={cn('relative flex flex-col items-center', large ? 'w-full' : '')}>
      {/* Glow halo */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-4 rounded-full blur-xl opacity-60"
        style={{
          backgroundColor: glowColor,
          animation: 'broker-glow 3s ease-in-out infinite',
        }}
      />
      {/* Avatar image */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'relative rounded-2xl overflow-hidden border-2',
          large ? 'w-full max-w-[360px] h-[380px]' : 'w-10 h-10 rounded-full'
        )}
        style={{ borderColor: `${glowColor}40` }}
      >
        <img src={brokerImg} alt={brokerName} className="w-full h-full object-cover object-top" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 80%, ${glowColor}60, transparent 60%)`,
          }}
        />
      </motion.div>
      {large && (
        <div className="mt-3 text-center">
          <p className="text-lg font-bold text-text-primary">{brokerName}</p>
          <p className="text-xs text-text-muted">你的专属创作经纪人</p>
        </div>
      )}
    </div>


  );
}

/** Broker thinking animation (large) */
function BrokerThinkingLarge({ text = '正在构思精彩内容...' }: { text?: string }) {
  const brokerImg = getBrokerImage();
  const brokerName = getBrokerName();
  const isMale = brokerName === '凌霄';
  const glowColor = isMale ? '#00D4FF' : '#FF6B9D';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-8"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-32 h-32 rounded-2xl overflow-hidden border-2"
        style={{ borderColor: `${glowColor}60`, boxShadow: `0 0 40px ${glowColor}40` }}
      >
        <img src={brokerImg} alt={brokerName} className="w-full h-full object-cover object-top" />
      </motion.div>
      <div className="text-center">
        <p className="text-sm text-text-secondary mb-2">{text}</p>
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: glowColor }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Small broker thinking indicator for chat */
function BrokerThinkingSmall({ text = '正在构思精彩内容...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[rgba(189,0,255,0.08)] border border-dashed border-[rgba(189,0,255,0.3)]">
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-neon-cyan/40">
        <img src={getBrokerImage()} alt="经纪人" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary">{text}</p>
        <div className="flex items-center gap-1 mt-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-neon-cyan"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>


  );
}


/** Chat Panel Component */
function ChatPanel({
  messages,
  onSendMessage,
  onSelectOption,
  isGenerating,
  onQuickAction,
}: {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSelectOption: (option: string) => void;
  isGenerating: boolean;
  onPresetClick: (presetId: string) => void;
  onQuickAction: (action: string) => void;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  }, [input, onSendMessage]);

  return (
    <div className="flex flex-col h-full bg-void-light/50 border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neon-cyan/40">
          <img src={getBrokerImage()} alt="经纪人" className="w-full h-full object-cover" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-void-light" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{getBrokerName()}</p>
          <p className="text-xs text-text-muted">你的内容创作助手</p>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/20">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
          <span className="text-[10px] text-neon-green">在线</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeCyber }}
            className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
          >
            {/* Avatar */}
            <div className={cn(
              'w-8 h-8 rounded-full overflow-hidden flex-shrink-0',
              msg.role === 'broker' ? 'border border-neon-cyan/40' : 'border border-neon-magenta/40'
            )}>
              <img
                src={msg.role === 'broker' ? getBrokerImage() : '/avatar-default.png'}
                alt={msg.role === 'broker' ? '经纪人' : '我'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bubble */}
            <div className={cn(
              'max-w-[80%]',
              msg.role === 'user'
                ? 'bg-[rgba(0,240,255,0.12)] border border-[rgba(0,240,255,0.3)] rounded-2xl rounded-br-sm'
                : 'bg-void-light border border-white/8 rounded-2xl rounded-bl-sm'
            )}>
              <p className="px-4 py-2.5 text-sm text-text-primary whitespace-pre-line leading-relaxed">
                {msg.content}
              </p>

              {/* Quick Options */}
              {msg.options && msg.options.length > 0 && (
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                  {msg.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => onSelectOption(opt)}
                      className="px-3 py-1.5 rounded-full text-xs border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                  {msg.quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => onQuickAction(action)}
                      className="px-3 py-1.5 rounded-full text-xs border border-neon-violet/30 text-neon-violet hover:bg-neon-violet/10 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking indicator */}
        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BrokerThinkingSmall />
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入你的需求..."
            className="flex-1 bg-void border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-cyan text-void hover:brightness-110 transition-all disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>


  );
}

/** Realistic platform tweet preview */
function TweetPreview({ post, style }: { post: GeneratedPost; style: PlatformStyle }) {
  const [liked, setLiked] = useState(false);
  const textWithEmojis = injectEmojis(post.text, style);

  const renderContent = () => {
    switch (style) {
      case 'xiaohongshu':
        return (
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl max-w-[420px] mx-auto">
            {/* Red header bar */}
            <div className="bg-[#FF2442] h-1 w-full" />
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Search size={14} className="text-gray-400" />
              <div className="h-5 bg-gray-100 rounded-full flex-1" />
              <div className="w-6 h-6 rounded-full bg-gray-200" />
            </div>
            {/* User info */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <img src="/avatar-default.png" alt="avatar" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">创客小助手</p>
                <p className="text-xs text-gray-400">刚刚 上海</p>
              </div>
              <button className="px-4 py-1 rounded-full border border-[#FF2442] text-[#FF2442] text-xs font-medium">
                关注
              </button>
            </div>
            {/* Content */}
            <div className="px-4 py-3">
              {post.title && <h3 className="text-base font-bold mb-2 text-gray-900">{post.title}</h3>}
              <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">{textWithEmojis}</p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs text-[#3B82F6]">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Images */}
            {post.images.length > 0 && (
              <div className={cn(
                'grid gap-1 px-4 pb-3',
                post.images.length === 1 ? 'grid-cols-1' :
                post.images.length === 2 ? 'grid-cols-2' :
                post.images.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
              )}>
                {post.images.map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {/* Actions */}
            <div className="flex items-center justify-around px-4 py-3 border-t border-gray-100">
              <button className="flex items-center gap-1 text-gray-500" onClick={() => setLiked(!liked)}>
                <Heart size={18} className={cn(liked && 'fill-[#FF2442] text-[#FF2442]')} />
                <span className="text-xs">{liked ? '1' : '0'}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500">
                <MessageSquare size={18} /><span className="text-xs">0</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500">
                <Bookmark size={18} />
              </button>
              <button className="flex items-center gap-1 text-gray-500">
                <Share2 size={18} />
              </button>
            </div>
            {/* Bottom tab bar */}
            <div className="flex items-center justify-around py-2 border-t border-gray-100">
              <HomeIcon active /><SearchIcon /><AddIcon /><MessageIcon /><ProfileIcon />
            </div>
          </div>
        );

      case 'wechat':
        return (
          <div className="bg-[#EDEDED] rounded-none max-w-[400px] mx-auto overflow-hidden shadow-xl">
            {/* WeChat green header */}
            <div className="bg-[#07C160] h-1 w-full" />
            <div className="px-4 pt-4 space-y-3">
              {/* User info */}
              <div className="flex items-center gap-3">
                <img src="/avatar-default.png" alt="avatar" className="w-10 h-10 rounded bg-gray-300 object-cover" />
                <div>
                  <p className="text-sm font-bold text-[#576B95]">创客小助手</p>
                  <p className="text-xs text-gray-400">1分钟前</p>
                </div>
              </div>
              {/* Text bubble */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{textWithEmojis}</p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs text-[#576B95]">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Images */}
              {post.images.length > 0 && (
                <div className={cn(
                  'grid gap-1',
                  post.images.length === 1 ? 'grid-cols-1' :
                  post.images.length === 2 ? 'grid-cols-2' :
                  post.images.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
                )}>
                  {post.images.map((img, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden bg-white">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {/* Like/Comment bubbles */}
              <div className="bg-white rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                  <Heart size={12} className="text-[#FF2442]" />
                  <span className="text-xs text-[#576B95]">小明、小红等8人觉得很赞</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-700"><span className="text-[#576B95]">小红:</span> 写得太好了！</p>
                  <p className="text-xs text-gray-700"><span className="text-[#576B95]">小明:</span> 收藏了</p>
                </div>
              </div>
            </div>
            <div className="h-4" />
          </div>
        );

      case 'douyin':
        return (
          <div className="bg-[#161823] rounded-xl overflow-hidden shadow-xl max-w-[375px] mx-auto relative">
            {/* Full screen video/image area */}
            <div className="relative aspect-[9/16] max-h-[420px]">
              <img src={post.images[0] || '/sample-post-cover-1.jpg'} alt="" className="w-full h-full object-cover" />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-1 mb-1">
                  <Music size={12} className="text-white/80" />
                  <span className="text-xs text-white/80">原声 - 创客小助手</span>
                </div>
                <p className="text-sm text-white font-medium leading-relaxed whitespace-pre-line">{textWithEmojis}</p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs text-neon-cyan">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Right interaction buttons */}
              <div className="absolute right-2 top-1/3 space-y-4">
                <div className="flex flex-col items-center gap-1">
                  <img src="/avatar-default.png" alt="" className="w-8 h-8 rounded-full border border-white/30" />
                </div>
                <div className="flex flex-col items-center gap-0.5 text-white/90">
                  <Heart size={24} />
                  <span className="text-[10px]">1.2w</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-white/90">
                  <MessageCircle size={24} />
                  <span className="text-[10px]">342</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-white/90">
                  <Share2 size={24} />
                  <span className="text-[10px]">分享</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-white/90">
                  <Bookmark size={24} />
                  <span className="text-[10px]">收藏</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'linkedin':
        return (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xl max-w-[500px] mx-auto">
            {/* Blue header */}
            <div className="bg-[#0A66C2] h-1 w-full" />
            {/* Post card */}
            <div className="p-4">
              {/* User info */}
              <div className="flex items-start gap-3">
                <img src="/avatar-default.png" alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">创客小助手</p>
                  <p className="text-xs text-gray-500">内容创作者 · PCG创客星球</p>
                  <p className="text-xs text-gray-400">刚刚 · <span className="inline-block"><EarthIcon /></span></p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              {/* Content */}
              <div className="mt-3">
                <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{textWithEmojis}</p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs text-[#0A66C2] font-medium">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Images */}
              {post.images.length > 0 && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                  <img src={post.images[0]} alt="" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>
            {/* Reaction bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#0A66C2] transition-colors">
                <ThumbsUp size={16} /><span className="text-xs">赞</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#0A66C2] transition-colors">
                <MessageCircle size={16} /><span className="text-xs">评论</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#0A66C2] transition-colors">
                <Repeat2 size={16} /><span className="text-xs">转发</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#0A66C2] transition-colors">
                <Send size={16} /><span className="text-xs">发送</span>
              </button>
            </div>
            {/* Comment input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
              <img src="/avatar-default.png" alt="" className="w-8 h-8 rounded-full" />
              <div className="flex-1 bg-white rounded-full px-3 py-1.5 border border-gray-200">
                <span className="text-xs text-gray-400">添加评论...</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto overflow-hidden">
      {renderContent()}
    </div>


  );
}

/* Inline SVG icons for platform previews */
function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF2442' : '#999'} strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function SearchIcon() {
  return <Search size={20} className="text-gray-400" />;
}
function AddIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF2442">
      <rect x="2" y="2" width="20" height="20" rx="6" />
      <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2" />
    </svg>
  );
}
function MessageIcon() {
  return <MessageCircle size={20} className="text-gray-400" />;
}
function ProfileIcon() {
  return <User size={20} className="text-gray-400" />;
}
function EarthIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/** Inject emojis and highlight hashtags in text */
function injectEmojis(text: string, _style: PlatformStyle): React.ReactNode {
  // Split by hashtags
  const parts = text.split(/(#[^\s#]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('#')) {
          return <span key={i} className="text-[#3B82F6] font-medium">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}


/* ────────────────────────────────────────────
   Before/After Comparison Slider
   ──────────────────────────────────────────── */

function BeforeAfterSlider({
  beforeImage,
  afterImage,
  filterStyle,
}: {
  beforeImage: string;
  afterImage: string;
  filterStyle?: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, pos)));
  }, []);

  const handleMouseDown = useCallback(() => { isDragging.current = true; }, []);
  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => { if (e.touches[0]) handleMove(e.touches[0].clientX); };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-xl overflow-hidden select-none border border-white/10"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After image (full, with filter applied) */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: filterStyle || 'none' }}
      />
      {/* Before image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
        <img
          src={beforeImage}
          alt="Before"
          className="absolute top-0 left-0 h-full object-cover"
          style={{ width: `${containerRef.current?.offsetWidth || 0}px` }}
        />
      </div>
      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-neon-cyan z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center shadow-glow-cyan">
          <ScissorsLineDashed size={14} className="text-void" />
        </div>
      </div>
      {/* Labels */}
      <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white text-xs font-medium z-10">原图</span>
      <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-neon-cyan/80 text-void text-xs font-medium z-10">效果</span>
    </div>


  );
}

/* ═══════════════════════════════════════════
   Mock Content Generators
   ═══════════════════════════════════════════ */

function generateMockPost(style: PlatformStyle, topic: string = 'general'): GeneratedPost {
  const basePosts: Record<string, Record<PlatformStyle, GeneratedPost>> = {
    general: {
      xiaohongshu: {
        text: '推开门的那一刻，仿佛穿越到了80年代\n\n老式唱片机、暖黄灯光、满墙的黑白照片\n点了一杯招牌拿铁，奶泡绵密得不像话\n店主是个温柔的阿姨，说店里每样东西都是她从世界各地淘回来的\n\n有时候幸福就是这么简单\n一杯好咖啡，一个安静的下午',
        images: ['/sample-post-cover-1.jpg'],
        style: 'xiaohongshu',
        title: '藏在巷子里的时光机',
        tags: ['咖啡探店', '复古风', '生活碎片', '小确幸'],
        location: '上海 · 徐汇区',
      },
      wechat: {
        text: '今天去了一家新开的复古咖啡馆，推开门仿佛穿越到了80年代。\n\n老式唱片机、暖黄灯光、满墙的黑白照片，点了一杯招牌拿铁，奶泡绵密得不像话。店主是个温柔的阿姨，说每样东西都是她从世界各地淘回来的。\n\n有时候幸福就是这么简单，一杯好咖啡，一个安静的下午。',
        images: ['/sample-post-cover-1.jpg'],
        style: 'wechat',
        title: '',
        tags: ['咖啡探店', '复古风'],
      },
      douyin: {
        text: '藏在巷子里的时光机！这家复古咖啡馆太绝了\n#咖啡探店 #复古风 #小确幸',
        images: ['/sample-post-cover-1.jpg'],
        style: 'douyin',
        title: '',
        tags: ['咖啡探店', '复古风', '小确幸'],
      },
      linkedin: {
        text: '\u2615 在快节奏的都市生活中，找到属于自己的"慢时光"\n\n今天探访了一家隐藏在老巷子里的复古咖啡馆。店主用十年时间，从世界各地收集每一件摆设，打造出一个让人驻足的空间。\n\n这让我想到：\n1. 细节决定体验——每一个用心的细节都在传递品牌温度\n2. 慢即是快——在喧嚣中创造宁静，本身就是一种竞争力\n3. 故事的力量——每件物品背后都有一个故事，这才是真正的差异化\n\n无论是创业还是职场，用心打磨每一个细节，时间会给你答案。',
        images: ['/sample-post-cover-1.jpg'],
        style: 'linkedin',
        title: '慢时光背后的商业逻辑',
        tags: ['职场思考', '创业心得', '品牌策略'],
      },
    },
    food: {
      xiaohongshu: {
        text: '本地人带路才找到的宝藏面馆！\n\n店面不大，藏在老居民区里\n招牌红烧牛肉面，汤底熬了整整12小时\n牛肉炖得软烂入味，面条筋道弹牙\n\n老板是个50岁的大叔，做了30年面\n他说："面要好吃，心先要静"\n\n这一碗面，吃出了匠人的坚持\n\n💰 人均：35元\n📍 地址：老城区民生路128号',
        images: ['/sample-post-cover-1.jpg'],
        style: 'xiaohongshu',
        title: '30年老字号！这碗面让我破防了',
        tags: ['美食探店', '面食控', '老字号', '烟火气'],
        location: '老城区民生路',
      },
      wechat: {
        text: '朋友带我去了一家开了30年的老面馆，藏在老居民区的巷子里。\n\n招牌红烧牛肉面，汤底是老板每天凌晨3点开始熬的，整整12个小时。牛肉炖得软烂入味，面条是自己手擀的，筋道弹牙。\n\n老板说："面要好吃，心先要静。"这句话让我想了很久。\n\n有时候最打动人心的，不是华丽的装修，而是一碗用心的面。',
        images: ['/sample-post-cover-1.jpg'],
        style: 'wechat',
        title: '',
        tags: ['美食探店', '老字号'],
      },
      douyin: {
        text: '30年老字号面馆！藏在巷子里的宝藏！\n牛肉炖了12小时，面条手擀筋道\n这一口直接封神！\n#美食探店 #老字号 #面食控 #烟火气',
        images: ['/sample-post-cover-1.jpg'],
        style: 'douyin',
        title: '',
        tags: ['美食探店', '老字号', '面食控'],
      },
      linkedin: {
        text: '从一碗面学到的商业哲学\n\n今天探访了一家开了30年的老面馆，被老板的"面要好吃，心先要静"深深触动。\n\n在商业竞争日益激烈的今天，我们总是在追逐风口、追逐流量，却忘记了最基本的道理：\n\n1. 匠心精神——30年只做一件事，把一碗面做到极致\n2. 长期主义——不追求快速扩张，而是口碑的慢慢积累\n3. 产品为王——再华丽的营销，最终都要回归产品力\n\n这碗面让我明白：慢，有时候是最快的路。',
        images: ['/sample-post-cover-1.jpg'],
        style: 'linkedin',
        title: '从一碗面学到的商业哲学',
        tags: ['职场思考', '创业心得', '长期主义'],
      },
    },
    tech: {
      xiaohongshu: {
        text: '用了两周iPhone 15 Pro，说说真实感受\n\n✅ 优点：\n钛金属机身真的轻了！长时间手持不累\nAction Button自定义太方便了\n5倍长焦拍人像简直绝了\n\n❌ 缺点：\n发热问题还是存在\n充电速度还是不够快\n\n总结：值得升级，但不是必升\n适合手持12/13系列想换机的用户',
        images: ['/sample-post-cover-2.jpg'],
        style: 'xiaohongshu',
        title: 'iPhone 15 Pro 两周真实体验',
        tags: ['数码测评', 'iPhone', '科技'],
      },
      wechat: {
        text: '用了两周iPhone 15 Pro，说说真实感受。\n\n钛金属机身确实轻了不少，Action Button自定义后一键打开相机很方便。5倍长焦拍人像效果超出预期。\n\n但发热问题在玩游戏时还是能感觉到，充电速度如果能再快点就更好了。\n\n总的来说，12/13系列用户可以升，14系列可以再等等。',
        images: ['/sample-post-cover-2.jpg'],
        style: 'wechat',
        title: '',
        tags: ['数码测评', 'iPhone'],
      },
      douyin: {
        text: 'iPhone 15 Pro两周真实测评！\n钛金属真的轻了！5倍长焦封神！\n但发热还是老问题...\n#数码测评 #iPhone15Pro #科技',
        images: ['/sample-post-cover-2.jpg'],
        style: 'douyin',
        title: '',
        tags: ['数码测评', 'iPhone15Pro', '科技'],
      },
      linkedin: {
        text: '从iPhone 15 Pro看苹果的产品哲学\n\n深度使用两周后，有几个观察：\n\n1. 用户体验优先——钛金属减重不是为了炫技，而是解决真实痛点\n2. 渐进式创新——每年不是颠覆，而是持续优化，这是苹果的长期策略\n3. 生态锁定——Action Button的生态整合度越来越高\n\n苹果告诉我们：伟大的产品不是一蹴而就的，而是持续迭代的结果。',
        images: ['/sample-post-cover-2.jpg'],
        style: 'linkedin',
        title: '从iPhone 15 Pro看苹果的产品哲学',
        tags: ['产品思维', '科技洞察', '商业分析'],
      },
    },
    travel: {
      xiaohongshu: {
        text: '川西三天两夜自驾攻略｜人均2000\n\nDay1：成都→康定→新都桥\n沿途风景绝美，折多山垭口必停\n\nDay2：新都桥→塔公草原→墨石公园\n塔公草原骑马体验超棒\n墨石公园拍照分分钟出大片\n\nDay3：返程，路过泸定桥\n\n⚠️ 注意事项：\n高原反应提前准备红景天\n紫外线很强，防晒必须做好\n\n这趟旅程让我重新认识了四川的美',
        images: ['/sample-post-cover-3.jpg'],
        style: 'xiaohongshu',
        title: '川西自驾攻略｜三天两夜人均2000',
        tags: ['川西自驾', '旅行攻略', '小众旅行地'],
        location: '川西',
      },
      wechat: {
        text: '刚结束了川西三天两夜的自驾，整理了一份攻略分享给朋友们。\n\n从成都出发，经康定到新都桥，沿途的风景让人不断停车拍照。折多山垭口的海拔很高，但景色值得。\n\n塔公草原骑马体验很棒，墨石公园的地质奇观拍照超出片。\n\n提醒要去的朋友：提前准备红景天预防高反，紫外线很强一定要做好防晒。',
        images: ['/sample-post-cover-3.jpg'],
        style: 'wechat',
        title: '',
        tags: ['川西自驾', '旅行攻略'],
      },
      douyin: {
        text: '川西三天两夜自驾！人均2000！\n折多山垭口绝美！墨石公园拍照封神！\n这趟旅行太值了\n#川西自驾 #旅行攻略 #小众旅行地',
        images: ['/sample-post-cover-3.jpg'],
        style: 'douyin',
        title: '',
        tags: ['川西自驾', '旅行攻略', '小众旅行地'],
      },
      linkedin: {
        text: '旅行中的领导力思考\n\n这次川西自驾让我对工作有了新的感悟：\n\n1. 规划的重要性——行程顺利源于充分准备\n2. 应变能力——高海拔、恶劣天气都需要快速调整\n3. 团队协作——自驾中分工明确才能高效\n4. 目标导向——美景在险峰，坚持才能看到最美的风景\n\n有时候，跳出日常工作，反而能获得最宝贵的洞察。',
        images: ['/sample-post-cover-3.jpg'],
        style: 'linkedin',
        title: '旅行中的领导力思考',
        tags: ['领导力', '职场感悟', '自我成长'],
      },
    },
    fashion: {
      xiaohongshu: {
        text: '通勤穿搭｜早八人的一周OOTD\n\n周一：白衬衫+西装裤+乐福鞋\n清爽干练，开会也hold住\n\n周二：针织衫+A字裙+小白鞋\n温柔知性，同事都说好看\n\n周三：条纹衬衫+阔腿裤+穆勒鞋\n法式慵懒，舒适又时髦\n\n周四：西装外套+连衣裙+短靴\n层次丰富，下班直接约会\n\n周五：卫衣+牛仔裤+老爹鞋\n轻松休闲，迎接周末\n\n💡 小tip：基础款+配饰=高级感',
        images: ['/sample-post-cover-4.jpg'],
        style: 'xiaohongshu',
        title: '通勤穿搭｜早八人的一周OOTD',
        tags: ['OOTD', '通勤穿搭', '职场穿搭'],
      },
      wechat: {
        text: '分享我的一周通勤穿搭，希望能给早八人一些灵感。\n\n我的搭配原则是：基础款+精致配饰=高级感。不需要买很多衣服，关键是学会搭配。\n\n最实用的是周三的法式慵懒风，条纹衬衫和阔腿裤都是百搭单品，配一双穆勒鞋就能出门。\n\n周五最喜欢，卫衣牛仔裤怎么舒服怎么来，毕竟要迎接周末了嘛。',
        images: ['/sample-post-cover-4.jpg'],
        style: 'wechat',
        title: '',
        tags: ['OOTD', '通勤穿搭'],
      },
      douyin: {
        text: '早八人一周通勤OOTD！\n每天不重样，同事追着问链接\n基础款+配饰=高级感\n#OOTD #通勤穿搭 #职场穿搭',
        images: ['/sample-post-cover-4.jpg'],
        style: 'douyin',
        title: '',
        tags: ['OOTD', '通勤穿搭', '职场穿搭'],
      },
      linkedin: {
        text: '职场穿搭背后的个人品牌塑造\n\n一个人的穿着，是专业形象的重要组成部分。我坚持"得体而有风格"的穿搭理念：\n\n1. 建立信任——整洁得体的着装让对方感到被尊重\n2. 个人品牌——你的穿着就是你的无声名片\n3. 自信加持——穿对了衣服，状态会不一样\n4. 场合适配——不同场合需要不同的着装语言\n\n投资自己的形象，是最值得的投资之一。',
        images: ['/sample-post-cover-4.jpg'],
        style: 'linkedin',
        title: '职场穿搭背后的个人品牌塑造',
        tags: ['个人品牌', '职场形象', '职业发展'],
      },
    },
  };

  return basePosts[topic]?.[style] || basePosts.general[style];
}



/* ═══════════════════════════════════════════
   MAIN ContentLab Page
   ═══════════════════════════════════════════ */

export default function ContentLab() {
  const location = useLocation();
  /* ── State ── */
  const [activeTab, setActiveTab] = useState<'generator' | 'beauty' | 'works'>('generator');

  // Tweet Generator State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<PlatformStyle>('xiaohongshu');
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [_showFreeInput, setShowFreeInput] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentTone, setCurrentTone] = useState<string>('专业种草');
  const [lastGenerateArgs, setLastGenerateArgs] = useState<{ topic: string; tone: string; style: PlatformStyle } | null>(null);
  const [dnaProfile, setDnaProfile] = useState<DNAProfile | null>(null);
  const [pendingAttachImage, setPendingAttachImage] = useState<string | null>(null);

  // Beauty Studio State
  const [beautyTab, setBeautyTab] = useState<BeautyTab>('filters');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('原图');
  const [currentFilter, setCurrentFilter] = useState('none');
  const [selectedClothes, setSelectedClothes] = useState('');
  const [selectedHairstyle, setSelectedHairstyle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [processedBaked, setProcessedBaked] = useState(false);
  const [idPhotoBg, setIdPhotoBg] = useState<'none' | 'white' | 'blue' | 'red'>('none');
  const [nlEditText, setNlEditText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Beauty sliders
  const [beautyParams, setBeautyParams] = useState({ smooth: 50, whiten: 50, slim: 50, enlarge: 50 });

  // Works State
  const [worksFilter, setWorksFilter] = useState('全部');
  const [myWorks, setMyWorks] = useState<WorkItem[]>(MY_WORKS);
  const [viewingWork, setViewingWork] = useState<WorkItem | null>(null);

  const draftKey = 'pcg_contentlab_draft_v2';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d?.currentStyle && ['xiaohongshu', 'wechat', 'douyin', 'linkedin'].includes(d.currentStyle)) {
        setCurrentStyle(d.currentStyle);
      }
      if (typeof d?.currentTopic === 'string') setCurrentTopic(d.currentTopic);
      if (typeof d?.currentTone === 'string') setCurrentTone(d.currentTone);
      if (Array.isArray(d?.messages)) setMessages(d.messages);
      if (d?.generatedPost) setGeneratedPost(d.generatedPost);
      if (Array.isArray(d?.generatedImages)) setGeneratedImages(d.generatedImages);
      if (typeof d?.imagePrompt === 'string') setImagePrompt(d.imagePrompt);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const payload = {
          currentStyle,
          currentTopic,
          currentTone,
          messages,
          generatedPost,
          generatedImages,
          imagePrompt,
          savedAt: Date.now(),
        };
        sessionStorage.setItem(draftKey, JSON.stringify(payload));
      } catch {}
    }, 260);
    return () => window.clearTimeout(t);
  }, [currentStyle, currentTopic, currentTone, draftKey, generatedImages, generatedPost, imagePrompt, messages]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('koc_dna_profile');
      if (raw) setDnaProfile(JSON.parse(raw));
    } catch {
      setDnaProfile(null);
    }

    const params = new URLSearchParams(location.search);
    const topic = params.get('topic') || '';
    const autogen = params.get('autogen') === '1';
    const platform = params.get('platform') as PlatformStyle | null;
    const repurposeTitle = params.get('title') || '';
    const repurposeSuggestion = params.get('suggestion') || '';

    if (platform && ['xiaohongshu', 'wechat', 'douyin', 'linkedin'].includes(platform)) {
      setCurrentStyle(platform);
    }

    if (topic) {
      setActiveTab('generator');
      setCurrentTopic(topic);
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setMessages((prev) => [
          ...prev,
          { id: `auto_${Date.now()}`, role: 'broker', content: `收到！我来帮你围绕「${topic}」生成一篇推文。`, quickActions: ['立即生成'] },
        ]);
      }, 200);
    }

    if (repurposeTitle || repurposeSuggestion) {
      setActiveTab('generator');
      const t = repurposeTitle || '内容复用';
      setCurrentTopic(t);
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `rep_${Date.now()}`,
            role: 'broker',
            content: `我会基于「${t}」按建议进行复用：${repurposeSuggestion || '（未指定建议）'}。\n请选择文案风格：`,
            options: STYLE_OPTIONS,
          },
        ]);
      }, 300);
    }

    if (autogen && topic) {
      setTimeout(async () => {
        setIsThinking(true);
        setLastGenerateArgs({ topic, tone: currentTone, style: platform && ['xiaohongshu', 'wechat', 'douyin', 'linkedin'].includes(platform) ? platform : 'xiaohongshu' });
        try {
          const targetStyle = platform && ['xiaohongshu', 'wechat', 'douyin', 'linkedin'].includes(platform) ? platform : 'xiaohongshu';
          const post = await generatePostViaLLM(topic, currentTone, targetStyle);
          setGeneratedPost(post);
          setGeneratedImages(post.images);
          setMessages((prev) => [
            ...prev,
            {
              id: `auto_done_${Date.now()}`,
              role: 'broker',
              content: '已生成！你可以继续让我调整语气、换平台风格，或直接发布到个人主页。',
              quickActions: ['调整语气', '换个风格', '添加配图', '直接发布'],
            },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            { id: `auto_fail_${Date.now()}`, role: 'broker', content: '生成失败了，我可以马上重试一次。', quickActions: ['重试生成'] },
          ]);
        } finally {
          setIsThinking(false);
        }
      }, 450);
    }
  }, [currentTone, location.search]);

  /* ── Init broker greeting ── */
  useEffect(() => {
    if (messages.length === 0) {
  const brokerName = getBrokerName();
      setMessages([{
        id: 'intro',
        role: 'broker',
        content: `欢迎来到创作工坊！我是你的专属经纪人${brokerName}。今天想发布什么内容呢？点击下方按钮选择主题，或者直接告诉我你的想法~`,
      }]);
    }
  }, []);

  /* ── Preset button handlers ── */
  const handlePresetClick = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (presetId === 'free') {
      setShowFreeInput(true);
      return;
    }

    setShowFreeInput(false);
    setCurrentTopic(preset.topic);

    // Step 1: Add user intent
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: preset.label,
    };
    setMessages(prev => [...prev, userMsg]);

    // Step 2: Broker auto-reply with greeting
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const greetingBroker = getBrokerName();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'broker',
        content: `${preset.greeting.replace('{broker}', greetingBroker)}\n\n请选择你想要的文案风格：`,
        options: STYLE_OPTIONS,
      }]);
    }, 800);
  }, []);

  /* ── Style selection handler ── */
  const handleSelectOption = useCallback((option: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: option,
    };
    setMessages(prev => [...prev, userMsg]);
    setCurrentTone(option);

    // Broker confirms
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
  const brokerName = getBrokerName();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'broker',
        content: `好的！${brokerName}已经 get 到你的风格偏好：「${option}」。现在开始为你构思精彩内容...`,
      }]);

      // Show thinking animation
      setIsThinking(true);
      setTimeout(async () => {
        const topic = currentTopic || 'general';
        setLastGenerateArgs({ topic, tone: option, style: currentStyle });
        try {
          const post = await generatePostViaLLM(topic, option, currentStyle);
          setGeneratedPost(post);
          setGeneratedImages(post.images);
        } catch {
          setMessages((prev) => [
            ...prev,
            { id: `gen_fail_${Date.now()}`, role: 'broker', content: '这次生成失败了，我可以马上重试一次。', quickActions: ['重试生成'] },
          ]);
        } finally {
          setIsThinking(false);
        }

  const brokerName2 = getBrokerName();
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'broker',
          content: `内容已生成！${brokerName2}为你创作了一个${STYLE_LABELS[currentStyle]}风格的版本，看看怎么样？\n\n不满意的话我可以帮你调整，或者换个平台风格试试~`,
          quickActions: ['调整语气', '换个风格', '添加配图', '直接发布'],
        }]);
      }, 2000);
    }, 600);
  }, [currentStyle, currentTopic]);

  /* ── Send free message ── */
  const handleSendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages(prev => [...prev, userMsg]);
    setCurrentTopic(text);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'broker',
        content: '收到！请选择一个文案风格，我马上为你生成：',
        options: STYLE_OPTIONS,
      }]);
    }, 800);
  }, []);

  /* ── Re-generate tweet ── */
  const handleRegenerate = useCallback(() => {
    setIsThinking(true);
    setTimeout(async () => {
      try {
        const topic = currentTopic || generatedPost?.title || 'general';
        const tone = currentTone || '专业种草';
        setLastGenerateArgs({ topic, tone, style: currentStyle });
        const post = await generatePostViaLLM(topic, tone, currentStyle);
        post.images = generatedPost?.images?.length ? generatedPost.images : [];
        setGeneratedPost(post);
        setGeneratedImages(post.images);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `regen_fail_${Date.now()}`, role: 'broker', content: '重新生成失败了，我可以马上重试一次。', quickActions: ['重试生成'] },
        ]);
      } finally {
        setIsThinking(false);
      }
    }, 2000);
  }, [currentStyle, generatedPost]);

  /* ── Copy text ── */
  const handleCopyText = useCallback(() => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedPost]);

  const attachImageToTweet = useCallback((img: string) => {
    if (!img) return;
    if (!generatedPost) {
      setPendingAttachImage(img);
      setMessages((prev) => [
        ...prev,
        { id: `attach_${Date.now()}`, role: 'broker', content: '已收到图片。你先生成一条推文，我会自动把这张图放进预览里。', quickActions: ['立即生成'] },
      ]);
      return;
    }
    setGeneratedPost((prev) => {
      if (!prev) return prev;
      const merged = [...(prev.images || []), img].filter(Boolean);
      const dedup = merged.filter((v, i) => merged.indexOf(v) === i).slice(0, 4);
      return { ...prev, images: dedup };
    });
  }, [generatedPost]);

  const downloadImage = useCallback(async (url: string, filename: string) => {
    if (!url) return;
    try {
      const res = await fetch(url, { method: 'GET' });
      const blob = await res.blob();
      const a = document.createElement('a');
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 30000);
    } catch {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener,noreferrer';
      a.click();
    }
  }, []);

  useEffect(() => {
    if (!generatedPost) return;
    if (!pendingAttachImage) return;
    attachImageToTweet(pendingAttachImage);
    setPendingAttachImage(null);
  }, [attachImageToTweet, generatedPost, pendingAttachImage]);

  /* ── Publish to PCG ── */
  const handlePublish = useCallback(() => {
    if (!generatedPost) return;
    // TODO: Integrate with PCG publish API (src/services/publish.ts)
    // Call publishPost({ post, platform: currentStyle }) to publish to PCG platform

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('pcg_posts') || '[]');
      const platformLabel = STYLE_LABELS[currentStyle] || currentStyle;
      const newPost = {
        id: Date.now().toString(),
        title: generatedPost.title || generatedPost.text.slice(0, 30) + '...',
        content: generatedPost.text,
        platform: platformLabel,
        cover: generatedPost.images[0] || '/sample-post-cover-1.jpg',
        images: generatedPost.images || [],
        tags: generatedPost.tags || [],
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
      };
      const arr = Array.isArray(existing) ? existing : existing ? [existing] : [];
      localStorage.setItem('pcg_posts', JSON.stringify([newPost, ...arr].slice(0, 50)));
    } catch {
      // localStorage not available
    }

    try {
      sessionStorage.removeItem(draftKey);
    } catch {}

    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
    setTimeout(() => {
      window.location.hash = '/hub';
    }, 500);
  }, [currentStyle, draftKey, generatedPost]);

  /* ── Image Generation ── */
  const handleGenerateImage = useCallback(async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const url = await generateGLMImage(imagePrompt, {
        defaultParams: { width: 1024, height: 1024 },
      });
      setGeneratedImages((prev) => {
        const next = [...prev, url].slice(0, 4);
        return next;
      });
      if (generatedPost) {
        setGeneratedPost((prev) => {
          if (!prev) return prev;
          const nextImages = [...(prev.images || []), url].slice(0, 4);
          return { ...prev, images: nextImages };
        });
      }
    } catch {
      setGeneratedImages((prev) => (prev.length ? prev : ['/sample-post-cover-1.jpg', '/sample-post-cover-2.jpg']));
    } finally {
      setIsGeneratingImage(false);
    }
  }, [generatedPost, imagePrompt]);

  const handleQuickAction = useCallback((action: string) => {
    if (action === '添加配图') {
      handleGenerateImage();
      return;
    }
    if (action === '直接发布') {
      handlePublish();
      return;
    }
    if (action === '调整语气') {
      setMessages((prev) => [
        ...prev,
        { id: `tone_${Date.now()}`, role: 'broker', content: '想调整成哪种语气？', options: STYLE_OPTIONS },
      ]);
      return;
    }
    if (action === '换个风格') {
      const order: PlatformStyle[] = ['xiaohongshu', 'douyin', 'wechat', 'linkedin'];
      const idx = order.indexOf(currentStyle);
      const next = order[(idx + 1) % order.length];
      setCurrentStyle(next);
      setMessages((prev) => [
        ...prev,
        { id: `style_${Date.now()}`, role: 'broker', content: `好的，切换到${STYLE_LABELS[next]}风格。需要我重新生成吗？`, quickActions: ['重试生成'] },
      ]);
      return;
    }
    if (action === '重试生成') {
      const args = lastGenerateArgs || { topic: currentTopic || 'general', tone: currentTone || '专业种草', style: currentStyle };
      setIsThinking(true);
      setTimeout(async () => {
        try {
          const post = await generatePostViaLLM(args.topic, args.tone, args.style);
          setGeneratedPost(post);
          setGeneratedImages(post.images);
          setMessages((prev) => [
            ...prev,
            { id: `retry_ok_${Date.now()}`, role: 'broker', content: '重试成功！', quickActions: ['添加配图', '直接发布'] },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            { id: `retry_fail_${Date.now()}`, role: 'broker', content: '重试还是失败了。你可以稍后再试，或换个平台风格。', quickActions: ['换个风格'] },
          ]);
        } finally {
          setIsThinking(false);
        }
      }, 300);
    }
  }, [currentStyle, currentTone, currentTopic, handleGenerateImage, handlePublish, lastGenerateArgs]);

  /* ── Beauty Studio Handlers ── */
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setProcessedImage(url);
    setComparisonMode(false);
    setProcessedBaked(false);
    setIdPhotoBg('none');
    setSelectedFilter('原图');
    setCurrentFilter('none');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setProcessedImage(url);
    setComparisonMode(false);
    setProcessedBaked(false);
    setIdPhotoBg('none');
  }, []);

  const bakeBeauty = useCallback(async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = uploadedImage;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('load failed'));
      });

      const bg = idPhotoBg;
      const outW = bg === 'none' ? 1024 : 600;
      const outH = bg === 'none' ? 1024 : 800;

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');

      if (bg !== 'none') {
        const color = bg === 'blue' ? '#2F6BFF' : bg === 'red' ? '#E11D48' : '#FFFFFF';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, outW, outH);
      }

      const whiten = 1 + ((beautyParams.whiten - 50) / 50) * 0.18;
      const contrast = 1 + ((beautyParams.enlarge - 50) / 50) * 0.12;
      const saturate = 1 + ((beautyParams.enlarge - 50) / 50) * 0.18;
      const blur = Math.max(0, ((beautyParams.smooth - 50) / 50) * 1.4);

      const filter = `${currentFilter} brightness(${whiten}) contrast(${contrast}) saturate(${saturate}) blur(${blur.toFixed(2)}px)`;
      ctx.filter = filter.trim() === '' ? 'none' : filter;

      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;
      const targetRatio = outW / outH;
      const srcRatio = srcW / srcH;
      let cropW = srcW;
      let cropH = srcH;
      if (srcRatio > targetRatio) {
        cropW = Math.round(srcH * targetRatio);
        cropH = srcH;
      } else {
        cropW = srcW;
        cropH = Math.round(srcW / targetRatio);
      }
      const cropX = Math.round((srcW - cropW) / 2);
      const cropY = Math.round((srcH - cropH) / 2);

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

      const slimK = (beautyParams.slim - 50) / 50;
      if (Math.abs(slimK) > 0.06) {
        const src = ctx.getImageData(0, 0, outW, outH);
        const dst = ctx.createImageData(outW, outH);
        const s = src.data;
        const d = dst.data;
        const cx = outW / 2;
        const cy = outH * 0.44;
        const rx = outW * 0.46;
        const ry = outH * 0.42;
        const intensity = Math.max(-0.22, Math.min(0.22, slimK * 0.22));

        const idx = (x: number, y: number) => (y * outW + x) * 4;
        for (let y = 0; y < outH; y++) {
          const dy = (y - cy) / ry;
          const gy = 1 - Math.min(1, dy * dy);
          for (let x = 0; x < outW; x++) {
            const dx = (x - cx) / rx;
            const gx = 1 - Math.min(1, dx * dx);
            const g = Math.max(0, Math.min(1, gx * gy));
            const scale = 1 - intensity * g;
            const xs = Math.round(cx + (x - cx) / Math.max(0.62, scale));
            const ys = y;
            const sx = Math.max(0, Math.min(outW - 1, xs));
            const si = idx(sx, ys);
            const di = idx(x, y);
            d[di] = s[si];
            d[di + 1] = s[si + 1];
            d[di + 2] = s[si + 2];
            d[di + 3] = s[si + 3];
          }
        }
        ctx.putImageData(dst, 0, 0);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setProcessedImage(dataUrl);
      setComparisonMode(true);
      setProcessedBaked(true);
    } catch {
      setProcessedImage(uploadedImage);
      setComparisonMode(true);
      setProcessedBaked(false);
    } finally {
      setIsProcessing(false);
    }
  }, [beautyParams.enlarge, beautyParams.slim, beautyParams.smooth, beautyParams.whiten, currentFilter, idPhotoBg, uploadedImage]);

  const applyFilter = useCallback((filterName: string) => {
    const preset = FILTER_PRESETS.find(f => f.name === filterName);
    if (!preset) return;
    setSelectedFilter(filterName);
    setCurrentFilter(preset.filter);
    setProcessedBaked(false);
    void bakeBeauty();
  }, [bakeBeauty]);

  const applyClothes = useCallback((style: string) => {
    if (!uploadedImage) return;
    setSelectedClothes(style);
    setIdPhotoBg('none');
    const map: Record<string, string> = {
      休闲: 'brightness(1.06) saturate(1.12) contrast(0.98)',
      商务: 'contrast(1.18) saturate(0.92) brightness(1.02)',
      街头: 'contrast(1.26) saturate(1.45) brightness(1.00)',
      礼服: 'contrast(1.12) brightness(0.97) saturate(1.05)',
      国风: 'sepia(0.18) saturate(1.08) contrast(1.06)',
    };
    setSelectedFilter('原图');
    setCurrentFilter(map[style] || 'none');
    setProcessedBaked(false);
    void bakeBeauty();
  }, [bakeBeauty, uploadedImage]);

  const applyHairstyle = useCallback((style: string) => {
    if (!uploadedImage) return;
    setSelectedHairstyle(style);
    setIdPhotoBg('none');
    const map: Record<string, string> = {
      短发: 'contrast(1.14) saturate(1.06)',
      长发: 'brightness(1.05) contrast(1.06)',
      卷发: 'saturate(1.22) contrast(1.06)',
      染发: 'hue-rotate(55deg) saturate(1.42) contrast(1.06)',
      编发: 'contrast(1.10) saturate(1.08)',
    };
    setSelectedFilter('原图');
    setCurrentFilter(map[style] || 'none');
    setProcessedBaked(false);
    void bakeBeauty();
  }, [bakeBeauty, uploadedImage]);

  useEffect(() => {
    if (activeTab !== 'beauty') return;
    if (!uploadedImage) return;
    const t = window.setTimeout(() => {
      void bakeBeauty();
    }, 220);
    return () => window.clearTimeout(t);
  }, [activeTab, bakeBeauty, beautyParams.enlarge, beautyParams.slim, beautyParams.smooth, beautyParams.whiten, currentFilter, idPhotoBg, uploadedImage]);

  const handleNlApply = useCallback(async () => {
    if (!uploadedImage) return;
    const text = String(nlEditText || '').trim();
    if (!text) return;

    const clampNum = (n: any, min: number, max: number) => Math.max(min, Math.min(max, Number(n)));

    let cmd: any = null;
    try {
      const system =
        '你是图片编辑指令解析器。把用户自然语言需求转成 JSON。只输出 JSON 对象，字段可选：idPhotoBg("none"|"white"|"blue"|"red")、whiten(0-100)、smooth(0-100)、contrast(0-100)、saturate(0-100)、preset("原图"|"日系清新"|"复古胶片"|"赛博朋克"|"胶片感"|"电影感")。';
      const res = await glmChat(system, text, { temperature: 0.1, max_tokens: 300, jsonMode: true });
      cmd = extractJSON<any>(res);
    } catch {
      cmd = null;
    }

    if (!cmd) {
      const lower = text.toLowerCase();
      const next: any = {};
      if (lower.includes('蓝底')) next.idPhotoBg = 'blue';
      if (lower.includes('红底')) next.idPhotoBg = 'red';
      if (lower.includes('白底')) next.idPhotoBg = 'white';
      if (lower.includes('证件照')) next.idPhotoBg = next.idPhotoBg || 'blue';
      if (lower.includes('赛博')) next.preset = '赛博朋克';
      if (lower.includes('复古') || lower.includes('胶片')) next.preset = '复古胶片';
      if (lower.includes('电影')) next.preset = '电影感';
      if (lower.includes('提亮') || lower.includes('更亮')) next.whiten = 70;
      if (lower.includes('更白') || lower.includes('美白')) next.whiten = 75;
      if (lower.includes('更清晰') || lower.includes('锐化')) next.contrast = 70;
      if (lower.includes('更鲜艳') || lower.includes('饱和')) next.saturate = 70;
      if (lower.includes('磨皮') || lower.includes('更柔和')) next.smooth = 70;
      cmd = next;
    }

    if (cmd?.idPhotoBg) {
      const v = String(cmd.idPhotoBg);
      if (v === 'none' || v === 'white' || v === 'blue' || v === 'red') setIdPhotoBg(v);
    }

    if (cmd?.preset) {
      const p = String(cmd.preset);
      const preset = FILTER_PRESETS.find((x) => x.name === p);
      if (preset) {
        setSelectedFilter(p);
        setCurrentFilter(preset.filter);
      }
    }

    setBeautyParams((prev) => {
      const next = { ...prev };
      if (cmd?.whiten != null) next.whiten = clampNum(cmd.whiten, 0, 100);
      if (cmd?.smooth != null) next.smooth = clampNum(cmd.smooth, 0, 100);
      if (cmd?.contrast != null) next.slim = clampNum(cmd.contrast, 0, 100);
      if (cmd?.saturate != null) next.enlarge = clampNum(cmd.saturate, 0, 100);
      return next;
    });

    setProcessedBaked(false);
    window.setTimeout(() => void bakeBeauty(), 0);
  }, [bakeBeauty, nlEditText, uploadedImage]);

  /* ── Filtered Works ── */
  const filteredWorks = worksFilter === '全部'
    ? myWorks
    : myWorks.filter(() => {
        if (worksFilter === '推文生成') return true;
        if (worksFilter === '图像美妆') return false;
        if (worksFilter === 'AI配图') return true;
        return true;
      });

  /* ══════ RENDER ══════ */
  return (
    <div className="min-h-[100dvh] pt-[72px] bg-void">
      {/* ===== HERO ===== */}
      <div className="relative h-[280px] md:h-[360px] overflow-hidden">
        <img
          src="/content-lab-hero.jpg"
          alt="创作工坊"
          className="w-full h-full object-cover opacity-50"
        />
        {/* Cyan/Magenta gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/30 via-transparent to-[#FF2A6D]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1440px] mx-auto px-6 w-full pb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeCyber }}
              className="font-orbitron text-3xl md:text-5xl font-bold text-neon-cyan mb-2"
            >
              创作工坊
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeCyber }}
              className="text-text-secondary text-base md:text-lg mb-6"
            >
              一站式AI内容创作引擎 — 从灵感到发布只需3分钟
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeCyber }}
              className="flex flex-wrap gap-3"
            >
              {[
                { key: 'generator' as const, label: '生成推文', icon: Wand2 },
                { key: 'beauty' as const, label: '图像美妆室', icon: Sparkles },
                { key: 'works' as const, label: '我的作品', icon: Grid3X3 },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setActiveTab(btn.key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                    activeTab === btn.key
                      ? 'bg-neon-cyan text-void shadow-glow-cyan'
                      : 'bg-white/5 text-text-primary hover:bg-white/10 border border-white/10'
                  )}
                >
                  <btn.icon size={16} />
                  {btn.label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {/* ── TAB: Tweet Generator ── */}
          {activeTab === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: easeCyber }}
            >
              {/* === Platform Selector Cards === */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-neon-cyan" />
                  选择发布平台
                </h2>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {(Object.entries(STYLE_LABELS) as [PlatformStyle, string][]).map(([key, label]) => (
                    <PlatformCard
                      key={key}
                      style={key}
                      label={label}
                      isSelected={currentStyle === key}
                      onClick={() => {
                        setCurrentStyle(key);
                        if (generatedPost) {
                          setGeneratedPost({ ...generatedPost, style: key });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div
                  className="rounded-2xl p-5 border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.14), rgba(189,0,255,0.08), rgba(255,42,109,0.10))',
                    borderColor: 'rgba(0,240,255,0.28)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 0 24px rgba(0,240,255,0.08)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,240,255,0.16)', border: '1px solid rgba(0,240,255,0.25)' }}
                    >
                      <Sparkles size={18} className="text-neon-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-bold text-text-primary">DNA 驱动生成</div>
                        <div className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(57,255,20,0.10)', border: '1px solid rgba(57,255,20,0.25)', color: '#39FF14' }}>
                          {dnaProfile ? '已锁定你的个人风格' : '未检测到DNA'}
                        </div>
                      </div>
                      {dnaProfile ? (
                        <div className="mt-2 text-xs text-text-secondary leading-relaxed">
                          语气：<span className="text-neon-cyan">{dnaProfile.tone}</span> · 内容支柱：<span className="text-neon-magenta">{dnaProfile.contentPillar}</span> · 关键词：<span className="text-neon-gold">{(dnaProfile.keywords || []).slice(0, 6).join('、') || '—'}</span>
                          <div className="mt-1 text-[11px] text-text-muted">
                            你生成的推文会强制贴合这套DNA风格，确保像“你本人”在写。
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-text-secondary leading-relaxed">
                          还没有你的风格DNA，所以目前只能用“通用写作模板”。建议先去个人主页提取DNA，再回来生成内容会更像你。
                        </div>
                      )}
                    </div>
                    {!dnaProfile && (
                      <button
                        onClick={() => { window.location.hash = '/hub'; }}
                        className="px-4 py-2 rounded-xl text-xs font-bold"
                        style={{ background: '#00F0FF', color: '#0A0A0F' }}
                      >
                        去提取DNA
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* === Broker Dialog Area === */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* Left: Broker Image */}
                <div className="lg:col-span-4 flex flex-col">
                  <div className="bg-void-light/50 border border-white/5 rounded-xl p-4 flex-1 flex flex-col items-center justify-center min-h-[400px]">
                    <BrokerAvatar large />
                    <p className="mt-4 text-xs text-text-muted text-center max-w-[200px]">
                      你的专属经纪人，随时为你提供创作灵感
                    </p>
                  </div>
                </div>

                {/* Right: Chat Panel */}
                <div className="lg:col-span-8 h-[500px] lg:h-[600px]">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onSelectOption={handleSelectOption}
                    isGenerating={isGenerating}
                    onPresetClick={handlePresetClick}
                    onQuickAction={handleQuickAction}
                  />
                </div>
              </div>

              {/* === Preset Buttons (below chat) === */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-neon-magenta" />
                  快速创作通道
                </h2>
                <div className="flex flex-wrap gap-3">
                  {PRESETS.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handlePresetClick(preset.id)}
                      className="flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neon-cyan/30 transition-all text-text-primary min-w-[200px]"
                    >
                      <preset.icon size={20} className="text-neon-cyan" />
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* === Thinking Animation Area === */}
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <div className="bg-void-light/50 border border-white/5 rounded-xl p-6">
                      <BrokerThinkingLarge text="正在构思精彩内容..." />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === Generated Result & Preview === */}
              <AnimatePresence>
                {generatedPost && !isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: easeCyber }}
                    className="mb-8"
                  >
                    <div className="bg-void-light/50 border border-white/5 rounded-xl p-6">
                      <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-neon-green" />
                        生成结果预览
                        <span className="text-xs font-normal text-text-muted ml-2">({STYLE_LABELS[currentStyle]}风格)</span>
                      </h2>

                      {/* 智能标题工厂 */}
                      <div className="mt-2 mb-4">
                        <TitleFactory onSelectTitle={(title) => {
                          setGeneratedPost(prev => prev ? { ...prev, title } : prev);
                        }} />
                      </div>

                      <div className="bg-gradient-to-b from-transparent to-void/30 p-4 rounded-xl">
                        <TweetPreview post={generatedPost} style={currentStyle} />
                      </div>

                      {/* Action Bar */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/5"
                      >
                        <button
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border border-white/10 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors"
                        >
                          <RefreshCw size={14} className={cn(isGenerating && 'animate-spin')} />
                          重新生成
                        </button>
                        <button
                          onClick={() => {
                            setCurrentStyle(prev => {
                              const styles: PlatformStyle[] = ['xiaohongshu', 'wechat', 'douyin', 'linkedin'];
                              const idx = styles.indexOf(prev);
                              const next = styles[(idx + 1) % styles.length];
                              setGeneratedPost(post => post ? { ...post, style: next } : null);
                              return next;
                            });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border border-white/10 text-text-secondary hover:text-neon-violet hover:border-neon-violet/30 transition-colors"
                        >
                          <Palette size={14} />
                          换平台风格
                        </button>
                        <button
                          onClick={handleCopyText}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border border-white/10 text-text-secondary hover:text-neon-gold hover:border-neon-gold/30 transition-colors"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? '已复制' : '复制文案'}
                        </button>
                        <button
                          onClick={() => {
                            const url = generatedPost?.images?.[0];
                            if (url) void downloadImage(url, `pcg_post_${Date.now()}.png`);
                          }}
                          disabled={!generatedPost?.images?.[0]}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border border-white/10 text-text-secondary hover:text-neon-green hover:border-neon-green/30 transition-colors disabled:opacity-40"
                        >
                          <Download size={14} />
                          保存图片
                        </button>

                        {/* Publish button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePublish}
                          className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-neon-cyan text-void hover:brightness-110 transition-all shadow-glow-cyan"
                        >
                          <Rocket size={16} />
                          一键发布到PCG创客星球
                        </motion.button>
                      </motion.div>

                      {/* Publish success message */}
                      <AnimatePresence>
                        {published && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center gap-2"
                          >
                            <CheckCircle2 size={18} className="text-neon-green" />
                            <span className="text-sm text-neon-green">已发布！可在你的个人主页和内容大厅查看</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 评论区预演 */}
                      {generatedPost?.text && (
                        <div className="mt-6">
                          <CommentRehearsal content={generatedPost.text} />
                        </div>
                      )}

                      {/* === Virality Simulator === */}
                      {generatedPost && (
                        <ViralitySimulator
                          content={{
                            title: generatedPost.title || generatedPost.text.slice(0, 40),
                            body: generatedPost.text,
                            platform: currentStyle,
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === AI Image Gen Section === */}
              <div className="bg-void-light/50 border border-white/5 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Image size={18} className="text-neon-magenta" />
                  AI 配图生成
                </h2>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="描述你想要的配图..."
                    className="flex-1 bg-void border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  />
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-neon-cyan text-void hover:brightness-110 transition-all disabled:opacity-30"
                  >
                    {isGeneratingImage ? (
                      <><Loader2 size={16} className="animate-spin" /> 生成中...</>
                    ) : (
                      <><Sparkles size={16} /> 生成配图</>
                    )}
                  </button>
                </div>
                {/* TODO: Integrate with image generation API (src/services/imageGen.ts)
                    Options: DALL-E 3 / Midjourney API / Stable Diffusion / Tongyi Wanxiang
                    Call generateImage(prompt, { style: currentStyle, ratio: '1:1' }) */}

                {/* Generated / Sample Images */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['/sample-post-cover-1.jpg', '/sample-post-cover-2.jpg', '/sample-post-cover-3.jpg', '/sample-post-cover-4.jpg'].map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => attachImageToTweet(img)}
                            disabled={!generatedPost}
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-neon-cyan text-void disabled:opacity-40"
                          >
                            添加到推文
                          </button>
                          <button
                            onClick={() => void downloadImage(img, `pcg_preset_${i + 1}.jpg`)}
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/15"
                          >
                            下载
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {generatedImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {generatedImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-neon-cyan/30 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-neon-cyan/80 text-void text-[10px] font-bold">AI生成</div>
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => attachImageToTweet(img)}
                              disabled={!generatedPost}
                              className="px-3 py-2 rounded-lg text-xs font-bold bg-neon-cyan text-void disabled:opacity-40"
                            >
                              添加到推文
                            </button>
                            <button
                              onClick={() => void downloadImage(img, `pcg_ai_${Date.now()}_${i + 1}.png`)}
                              className="px-3 py-2 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/15"
                            >
                              下载
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}


          {/* ── TAB: Image Beauty Studio ── */}
          {activeTab === 'beauty' && (
            <motion.div
              key="beauty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: easeCyber }}
            >
              {/* Pre-loaded default image */}
              {!uploadedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 flex items-center gap-3"
                >
                  <button
                    onClick={() => {
                      setUploadedImage('/sample-post-cover-4.jpg');
                      setProcessedImage('/sample-post-cover-4.jpg');
                      setProcessedBaked(false);
                      setIdPhotoBg('none');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                  >
                    <Image size={14} />
                    使用示例图片
                  </button>
                  <span className="text-xs text-text-muted">或拖拽图片到下方区域</span>
                </motion.div>
              )}

              {/* Upload Area */}
              {!uploadedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onDragOver={(e: React.DragEvent) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-neon-cyan/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
                    <Upload size={28} className="text-neon-cyan" />
                  </div>
                  <p className="text-text-primary font-medium mb-2">拖拽图片到此处，或点击上传</p>
                  <p className="text-text-muted text-sm mb-4">支持 JPG、PNG、WebP，最大 10MB</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 rounded-xl bg-neon-cyan text-void text-sm font-medium hover:brightness-110 transition-all"
                  >
                    选择文件
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </motion.div>
              )}

              {/* Editor */}
              {uploadedImage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Image Display (45%) */}
                  <div className="lg:col-span-5">
                    <div className="bg-void-light/50 border border-white/5 rounded-xl overflow-hidden p-4">
                      {comparisonMode && processedImage ? (
                        <BeforeAfterSlider beforeImage={uploadedImage} afterImage={processedImage} filterStyle={processedBaked ? 'none' : currentFilter} />
                      ) : (
                        <div className="relative aspect-square max-w-lg mx-auto rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={(processedBaked && processedImage) ? processedImage : uploadedImage}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                            style={{ filter: processedBaked ? 'none' : currentFilter }}
                          />
                          {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <BrokerThinkingSmall text="AI正在处理图片，请稍候..." />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tool Tabs */}
                    <div className="flex items-center gap-2 mt-4">
                      {[
                        { key: 'filters' as BeautyTab, label: '风格滤镜', icon: Palette },
                        { key: 'clothes' as BeautyTab, label: 'AI换衣', icon: Shirt },
                        { key: 'hairstyle' as BeautyTab, label: '换发型', icon: Scissors },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setBeautyTab(tab.key)}
                          className={cn(
                            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                            beautyTab === tab.key
                              ? 'bg-neon-cyan text-void'
                              : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                          )}
                        >
                          <tab.icon size={15} />
                          {tab.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setProcessedImage(null);
                          setComparisonMode(false);
                          setSelectedFilter('原图');
                          setCurrentFilter('none');
                        }}
                        className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-text-muted hover:text-neon-magenta transition-colors"
                      >
                        <X size={15} />
                        清除
                      </button>
                    </div>

                    {/* Filter Presets (6) */}
                    {beautyTab === 'filters' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {FILTER_PRESETS.map((filter) => (
                          <button
                            key={filter.name}
                            onClick={() => applyFilter(filter.name)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                              selectedFilter === filter.name
                                ? 'border-neon-cyan bg-neon-cyan/10'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                            )}
                          >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${filter.color}20` }}>
                              <filter.icon size={18} style={{ color: filter.color }} />
                            </div>
                            <span className="text-xs text-text-primary">{filter.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {/* Clothes Swap (5 styles) */}
                    {beautyTab === 'clothes' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {CLOTHES_STYLES.map((style) => (
                          <button
                            key={style.name}
                            onClick={() => applyClothes(style.name)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                              selectedClothes === style.name
                                ? 'border-neon-magenta bg-neon-magenta/10'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                            )}
                          >
                            <div className="w-12 h-12 rounded-full bg-neon-magenta/10 flex items-center justify-center">
                              <style.icon size={22} className="text-neon-magenta" />
                            </div>
                            <span className="text-sm font-medium text-text-primary">{style.name}</span>
                            <span className="text-[10px] text-text-muted">{style.desc}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {/* Hairstyle Swap (5 styles) */}
                    {beautyTab === 'hairstyle' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {HAIRSTYLES.map((style) => (
                          <button
                            key={style.name}
                            onClick={() => applyHairstyle(style.name)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                              selectedHairstyle === style.name
                                ? 'border-neon-violet bg-neon-violet/10'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                            )}
                          >
                            <div className="w-12 h-12 rounded-full bg-neon-violet/10 flex items-center justify-center">
                              <Scissors size={22} className="text-neon-violet" />
                            </div>
                            <span className="text-sm font-medium text-text-primary">{style.name}</span>
                            <span className="text-[10px] text-text-muted">{style.desc}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Right: Info & Controls Panel */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-void-light/50 border border-white/5 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                        <Sparkles size={14} className="text-neon-cyan" />
                        证件照 / 自然语言P图
                      </h3>

                      <div className="flex flex-wrap items-center gap-2">
                        {([
                          { key: 'none', label: '自由裁剪' },
                          { key: 'blue', label: '证件照·蓝底' },
                          { key: 'white', label: '证件照·白底' },
                          { key: 'red', label: '证件照·红底' },
                        ] as const).map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setIdPhotoBg(opt.key);
                              setProcessedBaked(false);
                              void bakeBeauty();
                            }}
                            className={cn(
                              'px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                              idPhotoBg === opt.key
                                ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                                : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          value={nlEditText}
                          onChange={(e) => setNlEditText(e.target.value)}
                          placeholder="比如：提亮一点、磨皮、证件照蓝底、赛博风、更清晰…"
                          className="flex-1 bg-void border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50 transition-colors"
                        />
                        <button
                          onClick={() => void handleNlApply()}
                          disabled={!nlEditText.trim() || !uploadedImage || isProcessing}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-neon-cyan text-void hover:brightness-110 transition-all disabled:opacity-30"
                        >
                          应用
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            const img = processedImage || uploadedImage;
                            if (!img) return;
                            if (generatedPost) {
                              attachImageToTweet(img);
                              setActiveTab('generator');
                              return;
                            }
                            setPendingAttachImage(img);
                            setActiveTab('generator');
                            setMessages((prev) => [
                              ...prev,
                              { id: `attach_${Date.now()}`, role: 'broker', content: '图片已加入待添加队列。你生成一条推文后，我会自动把这张图放进预览里。', quickActions: ['立即生成'] },
                            ]);
                          }}
                          disabled={!processedImage && !uploadedImage}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-neon-magenta text-white hover:brightness-110 transition-all disabled:opacity-30"
                        >
                          <Plus size={16} />
                          一键添加到推文
                        </button>
                        <button
                          onClick={() => {
                            const img = processedImage || uploadedImage;
                            if (img) void downloadImage(img, `pcg_beauty_${Date.now()}.jpg`);
                          }}
                          disabled={!processedImage && !uploadedImage}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-text-primary hover:border-neon-cyan/30 hover:text-neon-cyan transition-all disabled:opacity-30"
                        >
                          <Download size={16} />
                          下载图片
                        </button>
                      </div>
                    </div>

                    {/* AI Beauty Parameter Sliders */}
                    {beautyTab === 'filters' && (
                      <div className="bg-void-light/50 border border-white/5 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                          <Sparkles size={14} className="text-neon-cyan" />
                          AI美颜参数
                        </h3>
                        {[
                          { label: '磨皮', key: 'smooth' as const, color: '#FF6B9D' },
                          { label: '美白', key: 'whiten' as const, color: '#00F0FF' },
                          { label: '瘦脸', key: 'slim' as const, color: '#39FF14' },
                          { label: '大眼', key: 'enlarge' as const, color: '#FFD700' },
                        ].map((param) => (
                          <div key={param.key} className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-text-secondary">{param.label}</span>
                              <span className="text-xs font-mono" style={{ color: param.color }}>{beautyParams[param.key]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setBeautyParams(p => ({ ...p, [param.key]: Math.max(0, p[param.key] - 10) }))}
                                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-text-primary"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={beautyParams[param.key]}
                                onChange={(e) => setBeautyParams(p => ({ ...p, [param.key]: parseInt(e.target.value) }))}
                                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                style={{ accentColor: param.color }}
                              />
                              <button
                                onClick={() => setBeautyParams(p => ({ ...p, [param.key]: Math.min(100, p[param.key] + 10) }))}
                                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-text-primary"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-text-muted mt-2">调整参数后会自动生成可下载的效果图（本地Canvas处理）</p>
                      </div>
                    )}

                    {/* Operation Guide */}
                    <div className="bg-void-light/50 border border-white/5 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-neon-green" />
                        操作指南
                      </h3>
                      <ul className="space-y-2 text-xs text-text-secondary">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                          上传人像照片，AI将自动识别面部和姿态
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                          选择滤镜风格或换装/换发型选项
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                          使用滑块对比前后效果
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                          满意后下载高清图片
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        const img = processedImage || uploadedImage;
                        if (img) void downloadImage(img, `pcg_beauty_${Date.now()}.jpg`);
                      }}
                      disabled={!processedImage && !uploadedImage}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-neon-cyan text-void hover:brightness-110 transition-all disabled:opacity-30"
                    >
                      <Download size={16} />
                      下载处理后的图片
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── TAB: My Works ── */}
          {activeTab === 'works' && (
            <motion.div
              key="works"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: easeCyber }}
            >
              {/* Category Filter */}
              <div className="flex items-center gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setWorksFilter(cat)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      worksFilter === cat
                        ? 'bg-neon-cyan text-void'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Works Grid (4 items) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredWorks.map((work, index) => (
                  <motion.div
                    key={work.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08, ease: easeCyber }}
                    className="group bg-void-light/50 border border-white/5 rounded-xl overflow-hidden hover:border-neon-cyan/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => setViewingWork(work)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square overflow-hidden">
                      <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium">
                        {STYLE_LABELS[work.platform]}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-text-primary truncate mb-1">{work.title}</h3>
                      <p className="text-xs text-text-muted mb-2 line-clamp-2">{work.text}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted">{work.date}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(work.text).catch(() => {});
                            }}
                            className="text-text-muted hover:text-neon-cyan transition-colors"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Delete work
                              setMyWorks(prev => prev.filter(w => w.id !== work.id));
                            }}
                            className="text-text-muted hover:text-neon-magenta transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View/Edit modal */}
              <AnimatePresence>
                {viewingWork && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setViewingWork(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-void-light border border-white/10 rounded-2xl max-w-md w-full overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img src={viewingWork.image} alt={viewingWork.title} className="w-full h-48 object-cover" />
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: PLATFORM_COLORS[viewingWork.platform] + '30', color: PLATFORM_COLORS[viewingWork.platform] }}>
                            {STYLE_LABELS[viewingWork.platform]}
                          </span>
                          <span className="text-xs text-text-muted">{viewingWork.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">{viewingWork.title}</h3>
                        <p className="text-sm text-text-secondary whitespace-pre-line">{viewingWork.text}</p>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(viewingWork.text).catch(() => {});
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-white/10 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors"
                          >
                            <Copy size={14} />
                            复制文案
                          </button>
                          <button
                            onClick={() => setViewingWork(null)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm bg-neon-cyan text-void hover:brightness-110 transition-all"
                          >
                            <Check size={14} />
                            关闭
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Broker breathing glow animation keyframes (inline style tag) */}
      <style>{`
        @keyframes broker-glow {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.2); }
        }
      `}</style>
    </div>



  );
}
