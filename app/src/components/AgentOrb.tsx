import { useState, useCallback, useEffect } from 'react';
import { MessageCircle, X, Sparkles, Search, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router';
import { glmChat } from '@/services/glmClient';

/**
 * AgentOrb - Floating AI Broker orb component
 *
 * Fixed bottom-right position, 64px circle
 * Shows broker avatar with rotating neon ring
 * Click to expand chat panel
 * Unread message badge with pulse animation
 *
 * Broker avatar/name synced from localStorage (pcg_broker_choice)
 */
const BROKER_CONFIG = {
  male: { avatar: '/broker-male.png', name: '凌霄', color: '#00D4FF' },
  female: { avatar: '/broker-female.png', name: '梦璃', color: '#FF6B9D' },
};

const BROKER_PROMPTS: Record<string, string> = {
  male: '你是凌霄，专业MCN男经纪人。说话直接高效，偶尔毒舌，擅长数据分析，常用“数据不会骗人”“听我的”。回复50-150字。',
  female: '你是梦璃，温柔MCN女经纪人。说话亲切有主见，像大姐姐，擅长情绪洞察，注重细节审美。常用“我觉得你可以...”“试试看”。回复50-150字。',
};

export default function AgentOrb({ unreadCount = 0 }: { unreadCount?: number }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [brokerKey, setBrokerKey] = useState<'male' | 'female'>('male');
  
  // Sync broker from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pcg_broker_choice');
    if (saved === 'female') setBrokerKey('female');
  }, []);

  const broker = BROKER_CONFIG[brokerKey];

  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([
    { role: 'agent', text: `你好！我是你的专属MCN经纪人${broker.name}，有什么可以帮你的吗？` },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleQuickNav = useCallback((path: string, label: string) => {
    setMessages((prev) => [...prev, 
      { role: 'user', text: `带我去${label}` },
      { role: 'agent', text: `好的，这就带你去${label}！` }
    ]);
    setTimeout(() => navigate(path), 400);
  }, [navigate]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }, { role: 'agent', text: '...' }]);
    setInputValue('');

    try {
      const reply = await glmChat(BROKER_PROMPTS[brokerKey] || BROKER_PROMPTS.male, userMsg, {
        temperature: 0.8,
        max_tokens: 512,
      });
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'agent' && last.text === '...') {
          next[next.length - 1] = { role: 'agent', text: reply };
          return next;
        }
        return [...next, { role: 'agent', text: reply }];
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        const fallback = { role: 'agent' as const, text: '网络波动，稍后再试~' };
        if (last?.role === 'agent' && last.text === '...') {
          next[next.length - 1] = fallback;
          return next;
        }
        return [...next, fallback];
      });
    }
  }, [brokerKey, inputValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  return (
    <>
      {/* Floating Orb Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-[60] group"
        aria-label={isOpen ? '关闭聊天' : '打开AI经纪人聊天'}
        data-cursor="pointer"
      >
        {/* Pulsing glow background */}
        <div className="absolute inset-0 rounded-full bg-neon-cyan/20 animate-pulse-dot" />

        {/* Rotating neon ring */}
        <div className="absolute -inset-1 rounded-full border-2 border-transparent bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta bg-clip-padding animate-spin-slow opacity-80" 
          style={{
            background: 'conic-gradient(from 0deg, #00F0FF, #BD00FF, #FF2A6D, #00F0FF)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '2px',
          }}
        />

        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 glass-panel">
          <img
            src={broker.avatar}
            alt={broker.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-neon-magenta text-white text-xs font-bold flex items-center justify-center animate-badge-pulse">
            {unreadCount}
          </div>
        )}

        {/* Hover tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-void-light border border-white/20 text-sm text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            我是{broker.name}，随时为你效劳~
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-void-light border-r border-t border-white/20 rotate-45" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-[400px] max-w-[calc(100vw-48px)] h-[520px] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden border border-white/20 glass-panel shadow-glow-lg animate-bounce-in">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ background: `linear-gradient(135deg, ${broker.color}15, transparent)` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: broker.color + '60' }}>
                <img src={broker.avatar} alt={broker.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">{broker.name}</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: broker.color }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: broker.color }} />
                  在线 · 你的专属MCN经纪人
                </div>
              </div>
            </div>
            <button onClick={handleToggle} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary">
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border self-end" style={{ borderColor: broker.color + '40' }}>
                    <img src={broker.avatar} alt="Agent" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-neon-cyan/15 border border-neon-cyan/30 rounded-2xl rounded-br-sm text-text-primary'
                    : 'bg-void-light border border-white/[0.08] rounded-2xl rounded-bl-sm text-text-primary'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Navigation Buttons */}
          <div className="px-3 py-2 border-t border-white/10">
            <div className="text-[10px] text-text-muted mb-1.5">快捷导航</div>
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => handleQuickNav('/content-lab', '创作工坊')} className="px-2 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/30 text-xs text-neon-cyan hover:bg-neon-cyan/20 transition-colors">
                <Sparkles size={12} className="inline mr-1"/>创作
              </button>
              <button onClick={() => handleQuickNav('/topic-research', '选题智库')} className="px-2 py-1 rounded-md bg-neon-magenta/10 border border-neon-magenta/30 text-xs text-neon-magenta hover:bg-neon-magenta/20 transition-colors">
                <Search size={12} className="inline mr-1"/>选题
              </button>
              <button onClick={() => handleQuickNav('/social', '社交星球')} className="px-2 py-1 rounded-md bg-neon-gold/10 border border-neon-gold/30 text-xs text-neon-gold hover:bg-neon-gold/20 transition-colors">
                <Users size={12} className="inline mr-1"/>社交
              </button>
              <button onClick={() => handleQuickNav('/feed', '内容大厅')} className="px-2 py-1 rounded-md bg-neon-violet/10 border border-neon-violet/30 text-xs text-neon-violet hover:bg-neon-violet/20 transition-colors">
                <FileText size={12} className="inline mr-1"/>大厅
              </button>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`和${broker.name}聊聊...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-void-light border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50 transition-colors"
              />
              <button onClick={handleSend} className="p-2.5 rounded-xl text-void hover:opacity-90 transition-colors" style={{ background: broker.color }}>
                <MessageCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
