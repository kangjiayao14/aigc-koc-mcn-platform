import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gamepad2, Users, ArrowLeft, Sparkles, Ticket, Clapperboard, Flame, Compass } from 'lucide-react';
import { FriendSystem, Cinema, MurderMystery, GameLobby } from '@/components/social';

/**
 * SocialHub - Social Planet for creators
 * Title: 社交星球 · 连接创作者
 */

type ActiveView = 'main' | 'cinema' | 'murder' | 'games';
type SceneCard = {
  id: ActiveView;
  title: string;
  subtitle: string;
  status: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  accentColor: string;
  decorations: React.ReactNode;
};

const SCENE_CARDS: SceneCard[] = [
  {
    id: 'cinema',
    title: 'PCG × 腾讯视频 放映厅',
    subtitle: 'VIP联动放映，8人同观影边看边聊',
    icon: <Clapperboard size={24} />,
    status: '6场排片中 · VIP专享',
    bgGradient: 'from-[#0a0a1a] via-[#0d0d2a] to-[#1a0a2e]',
    borderColor: 'hover:border-[#FFD700]/40',
    glowColor: 'hover:shadow-[0_0_40px_rgba(255,215,0,0.15),0_0_80px_rgba(255,215,0,0.05)]',
    accentColor: '#FFD700',
    decorations: (
      <>
        {/* Film reel decorations */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-full border-2 border-[#FFD700]/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#FFD700]/30" />
        </div>
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-[#FFD700]/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#FFD700]/30" />
        </div>
        {/* Film strip lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-[#FFD700]/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-[#FFD700]/10" />
      </>
    ),
  },
  {
    id: 'murder',
    title: '剧本推理社',
    subtitle: 'AI DM带队，沉浸式推理体验',
    icon: <Search size={24} />,
    status: '2个完整剧本 · 6人/5人局',
    bgGradient: 'from-[#0a0a1a] via-[#150a2e] to-[#1e0a3a]',
    borderColor: 'hover:border-[#BD00FF]/40',
    glowColor: 'hover:shadow-[0_0_40px_rgba(189,0,255,0.15),0_0_80px_rgba(189,0,255,0.05)]',
    accentColor: '#BD00FF',
    decorations: (
      <>
        {/* Mist particles */}
        <div className="absolute top-4 right-8 w-1 h-1 rounded-full bg-[#BD00FF]/40 animate-pulse" />
        <div className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full bg-[#BD00FF]/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-8 right-24 w-1 h-1 rounded-full bg-[#BD00FF]/30 animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Mystery crosshair */}
        <div className="absolute top-4 left-4 opacity-20">
          <Compass size={16} className="text-[#BD00FF]" />
        </div>
      </>
    ),
  },
  {
    id: 'games',
    title: '派对游戏馆',
    subtitle: '海龟汤、谁是卧底、飞行棋',
    icon: <Gamepad2 size={24} />,
    status: '26人在线 · 随时开局',
    bgGradient: 'from-[#0a0a1a] via-[#0a1a1a] to-[#0a2e1a]',
    borderColor: 'hover:border-[#39FF14]/40',
    glowColor: 'hover:shadow-[0_0_40px_rgba(57,255,20,0.15),0_0_80px_rgba(57,255,20,0.05)]',
    accentColor: '#39FF14',
    decorations: (
      <>
        {/* Neon arcade dots */}
        <div className="absolute top-3 left-4 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF2A6D]/40" />
        </div>
        <div className="absolute bottom-3 right-4 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF2A6D]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]/40" />
        </div>
        {/* Flame */}
        <div className="absolute top-4 right-8 opacity-20">
          <Flame size={14} className="text-[#39FF14]" />
        </div>
      </>
    ),
  },
];

const easeCyber = [0.16, 1, 0.3, 1] as [number, number, number, number];

// 3D Tilt Card Component
function TiltCard({ card, index, onEnterScene }: { card: SceneCard; index: number; onEnterScene: (scene: ActiveView) => void }) {
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -12;
    const rotateY = (x - 0.5) * 12;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <motion.button
      key={card.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: easeCyber }}
      onClick={() => onEnterScene(card.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
      className={`relative h-[220px] rounded-2xl overflow-hidden border border-white/5 bg-white/5 ${card.borderColor} ${card.glowColor} transition-all duration-300 group text-left cursor-pointer`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-60`} />
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${card.accentColor}20 1px, transparent 1px), linear-gradient(90deg, ${card.accentColor}20 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Decorative elements */}
      {card.decorations}

      {/* Glow orb */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ backgroundColor: card.accentColor }}
      />
      <div 
        className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ backgroundColor: card.accentColor }}
      />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="p-2 rounded-xl bg-white/10 border border-white/10 group-hover:scale-110 transition-transform duration-300"
            style={{ color: card.accentColor }}
          >
            {card.icon}
          </span>
          <span 
            className="px-2.5 py-1 rounded-full text-[10px] font-medium border"
            style={{ 
              backgroundColor: card.accentColor + '15', 
              color: card.accentColor,
              borderColor: card.accentColor + '30',
            }}
          >
            {card.status}
          </span>
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-1.5 group-hover:text-white transition-colors duration-300">
          {card.title}
        </h3>
        <p className="text-sm text-text-secondary">{card.subtitle}</p>
        
        {/* Hover arrow */}
        <div 
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
          style={{ backgroundColor: card.accentColor + '20', color: card.accentColor }}
        >
          <ArrowLeft size={14} className="rotate-180" />
        </div>

        {/* Bottom glow line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${card.accentColor}, transparent)`,
          }}
        />
      </div>
    </motion.button>
  );
}

// ===== Main View with Scene Cards =====
function MainView({ onEnterScene }: { onEnterScene: (scene: ActiveView) => void }) {
  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeCyber }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 rounded-full bg-[#BD00FF]" />
          <h1 className="font-orbitron text-3xl font-bold text-text-primary">
            社交星球
            <span className="text-[#BD00FF] ml-2">·</span>
            <span className="text-neon-cyan ml-2">连接创作者</span>
          </h1>
        </div>
        <p className="text-text-secondary pl-5">创作者的家园，连接志同道合的伙伴</p>
      </motion.div>

      {/* Scene Entry Cards with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {SCENE_CARDS.map((card, index) => (
          <TiltCard key={card.id} card={card} index={index} onEnterScene={onEnterScene} />
        ))}
      </div>

      {/* Tencent Video VIP Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: easeCyber }}
        className="mb-6 p-4 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20">
            <Ticket size={20} className="text-[#FFD700]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#FFD700]">腾讯视频VIP联动福利</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              腾讯VIP会员可直接观看付费影片，非会员每周限免2场 · 每周2张电影票（VIP额外获得2张）
            </p>
          </div>
          <button 
            onClick={() => onEnterScene('cinema')}
            className="px-4 py-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-medium hover:bg-[#FFD700]/20 transition-all flex-shrink-0"
          >
            去观影
          </button>
        </div>
      </motion.div>

      {/* Recent activity / Quick info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: easeCyber }}
        className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/5"
      >
        <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-neon-gold" />
          社交动态
        </h3>
        <div className="space-y-3">
          {[
            { text: '像素诗人 加入了《星际穿越》观影房间', time: '2分钟前', color: 'text-neon-cyan' },
            { text: '星际旅者 完成了一局海龟汤', time: '5分钟前', color: 'text-neon-green' },
            { text: '新的剧本《古堡惊魂夜》已上线', time: '30分钟前', color: 'text-neon-violet' },
            { text: '霓虹甜心 邀请了 3 位好友参加观影', time: '1小时前', color: 'text-neon-magenta' },
            { text: '云端漫步 在《古堡惊魂夜》中成功指凶', time: '2小时前', color: 'text-neon-gold' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.color.replace('text-', 'bg-')}`} />
              <span className="text-text-primary flex-1">{item.text}</span>
              <span className="text-text-muted text-xs flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/10">
          <p className="text-xs text-text-secondary leading-relaxed">
            <span className="text-neon-cyan font-medium">提示：</span>
            每周有2张免费电影票，VIP会员额外获得2张。参加社交活动可以获得经验和金币奖励。邀请好友一起观影可获得双倍奖励！
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ===== Main Social Hub Component =====
export default function SocialHub() {
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const [prevView, setPrevView] = useState<ActiveView | null>(null);

  const handleEnterScene = useCallback((scene: ActiveView) => {
    setPrevView(activeView);
    setActiveView(scene);
  }, [activeView]);

  const handleBack = useCallback(() => {
    setActiveView('main');
    setPrevView(null);
  }, []);

  // Scene views map
  const sceneViews: Record<string, React.ReactNode> = {
    cinema: <Cinema onBack={handleBack} />,
    murder: <MurderMystery onBack={handleBack} />,
    games: <GameLobby onBack={handleBack} />,
  };

  return (
    <div className="min-h-[100dvh] pt-[72px] pb-0 bg-void">
      <div className="max-w-[1440px] mx-auto px-6 py-8 h-[calc(100dvh-72px)]">
        <div className="flex gap-6 h-full">
          {/* Main content area */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <AnimatePresence mode="wait">
              {activeView === 'main' ? (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: prevView ? -30 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.4, ease: easeCyber }}
                  className="h-full overflow-y-auto pr-2"
                >
                  <MainView onEnterScene={handleEnterScene} />
                </motion.div>
              ) : (
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: easeCyber }}
                  className="h-full overflow-hidden"
                >
                  {sceneViews[activeView]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right sidebar - Friend System (always visible on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: easeCyber }}
            className="hidden lg:block w-80 flex-shrink-0 h-full overflow-hidden"
          >
            <div className="h-full p-5 rounded-2xl bg-white/5 border border-white/5 overflow-y-auto">
              <FriendSystem />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile: Friend system button (only visible on main view) */}
      {activeView === 'main' && (
        <button
          onClick={() => setActiveView('main')}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-neon-cyan text-void flex items-center justify-center shadow-lg shadow-neon-cyan/20 hover:brightness-110 transition-all"
          title="好友列表"
        >
          <Users size={22} />
        </button>
      )}
    </div>
  );
}
