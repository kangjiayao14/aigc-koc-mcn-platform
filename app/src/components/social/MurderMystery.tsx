import { useState, useCallback, useRef, useEffect } from 'react';
import type { Script, ChatMessage, MMPhase, Clue } from './types';
import { MOCK_SCRIPTS, MOCK_MM_MESSAGES } from './data';
import { ArrowLeft, Clock, Users, Send, Mic, MicOff, Eye, Vote, Sparkles, BookOpen, UserPlus, ChevronRight, Swords, Shield, ScrollText } from 'lucide-react';

type MysteryView = 'lobby' | 'room';

// ===== Flip Clue Card =====
function FlipClueCard({ clue, onReveal }: { clue: Clue; onReveal?: () => void }) {
  const [revealed, setRevealed] = useState(clue.revealed || false);
  const [flipping, setFlipping] = useState(false);

  const handleReveal = () => {
    if (!revealed && onReveal) {
      setFlipping(true);
      setTimeout(() => {
        setRevealed(true);
        setFlipping(false);
        onReveal();
      }, 300);
    }
  };

  const typeColors: Record<string, string> = {
    physical: '#FF2A6D',
    testimony: '#39FF14',
    document: '#FFD700',
    digital: '#00F0FF',
  };

  const typeLabels: Record<string, string> = {
    physical: '物证',
    testimony: '证词',
    document: '文件',
    digital: '数字',
  };

  const clueType = clue.type || 'physical';
  const typeColor = typeColors[clueType] || '#FF2A6D';

  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        className="w-full aspect-[4/3] rounded-xl relative overflow-hidden cursor-pointer group"
        style={{ perspective: '600px' }}
      >
        <div 
          className={`w-full h-full rounded-xl border border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
            flipping ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
          style={{ 
            backgroundColor: typeColor + '10', 
            borderColor: typeColor + '40',
          }}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: typeColor + '20' }}
          >
            <Eye size={18} style={{ color: typeColor }} />
          </div>
          <span style={{ color: typeColor }} className="text-xs font-medium">{clue.title}</span>
          <span className="text-[10px] text-text-muted">点击揭示</span>
        </div>
      </button>
    );
  }

  return (
    <div 
      className="w-full p-3 rounded-xl border text-left transition-all"
      style={{ 
        backgroundColor: typeColor + '08', 
        borderColor: typeColor + '30',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: typeColor + '20' }}
        >
          <BookOpen size={12} style={{ color: typeColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-text-primary block">{clue.title}</span>
        </div>
        <span 
          className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: typeColor + '15', color: typeColor }}
        >
          {typeLabels[clueType]}
        </span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{clue.content}</p>
    </div>
  );
}

// ===== Full Role Card Modal =====
function RoleCard({ role, onClose }: { role: { id: string; name: string; description: string; background: string; skill: string; avatar?: string }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-void-light border border-neon-cyan/30 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-text-primary text-center mb-1">你的角色</h3>
        
        {/* Role avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-neon-cyan/10 border-2 border-neon-cyan/30 flex items-center justify-center overflow-hidden">
              {role.avatar ? (
                <img src={role.avatar} alt={role.name} className="w-full h-full object-cover" />
              ) : (
                <Shield size={32} className="text-neon-cyan" />
              )}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan text-xs font-bold">
              {role.name}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <h4 className="text-xs font-medium text-neon-cyan mb-1.5 flex items-center gap-1">
              <ScrollText size={12} />
              角色简介
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">{role.description}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <h4 className="text-xs font-medium text-neon-gold mb-1.5 flex items-center gap-1">
              <Sparkles size={12} />
              背景故事
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">{role.background}</p>
          </div>

          <div className="bg-neon-violet/5 rounded-xl p-4 border border-neon-violet/20">
            <h4 className="text-xs font-medium text-neon-violet mb-1.5 flex items-center gap-1">
              <Swords size={12} />
              专属技能
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">{role.skill}</p>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-4">请记住你的角色信息，不要告诉其他人</p>
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-neon-cyan text-void font-medium hover:brightness-110 transition-all"
        >
          我记住了
        </button>
      </div>
    </div>
  );
}

// ===== Voting Modal =====
function VotingModal({ roles, onVote, onClose }: { roles: { id: string; name: string; description: string; background: string; skill: string; avatar?: string }[]; onVote: (roleId: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-void-light border border-neon-magenta/30 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-text-primary text-center mb-1">投票指凶</h3>
        <p className="text-sm text-text-secondary text-center mb-4">你认为谁是凶手？</p>
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                onVote(role.id);
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-neon-magenta/10 hover:border-neon-magenta/30 transition-all flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-neon-magenta/15 flex items-center justify-center flex-shrink-0">
                <Swords size={14} className="text-neon-magenta" />
              </div>
              <span className="text-sm text-text-primary font-medium">{role.name}</span>
              <ChevronRight size={14} className="text-text-muted ml-auto" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Truth Reveal Modal =====
function TruthModal({ script, onClose }: { script: Script; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-void-light border border-neon-gold/30 rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-neon-gold text-center mb-2">真相揭晓</h3>
        <div className="bg-neon-gold/5 rounded-xl p-4 border border-neon-gold/20 mb-4">
          <p className="text-sm text-text-primary leading-relaxed">{script.truth}</p>
        </div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">线索回顾</h4>
        <div className="space-y-2 mb-4">
          {script.clues.map((clue) => (
            <div key={clue.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
              <p className="text-xs font-medium text-neon-gold">{clue.title}</p>
              <p className="text-xs text-text-secondary mt-1">{clue.content}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neon-cyan text-void font-medium hover:brightness-110 transition-all"
        >
          结束游戏
        </button>
      </div>
    </div>
  );
}

// ===== Writer Application Modal =====
function WriterModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-void-light border border-neon-violet/30 rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-text-primary mb-2">剧本杀写手入驻</h3>
        <p className="text-sm text-text-secondary mb-4">提交你的原创剧本，经审核上线后可获得丰厚金币奖励！</p>

        {!submitted ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">剧本名称</label>
              <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-neon-violet/50" placeholder="给你的剧本起个名字" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1.5">类型</label>
                <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-neon-violet/50">
                  <option>科幻悬疑</option>
                  <option>现代推理</option>
                  <option>古装探案</option>
                  <option>恐怖惊悚</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1.5">人数 (4-8)</label>
                <input type="number" min={4} max={8} defaultValue={5} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-neon-violet/50" />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">故事背景</label>
              <textarea className="w-full h-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary resize-none focus:outline-none focus:border-neon-violet/50" placeholder="描述故事发生的背景..." />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">角色设定</label>
              <textarea className="w-full h-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary resize-none focus:outline-none focus:border-neon-violet/50" placeholder="每个角色的名称和简要描述..." />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">真相与结局</label>
              <textarea className="w-full h-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary resize-none focus:outline-none focus:border-neon-violet/50" placeholder="事件的真相和结局..." />
            </div>

            <div className="p-3 rounded-xl bg-neon-gold/5 border border-neon-gold/20">
              <h4 className="text-xs font-medium text-neon-gold mb-1">激励说明</h4>
              <ul className="text-[11px] text-text-secondary space-y-1">
                <li>审核通过奖励: 500 金币</li>
                <li>剧本被使用 10 次: 额外 300 金币</li>
                <li>月度最佳剧本: 2000 金币 + 限定称号</li>
                <li>优秀写手可签约为官方剧本提供者</li>
              </ul>
            </div>

            <button
              onClick={() => setSubmitted(true)}
              className="w-full py-2.5 rounded-xl bg-neon-violet text-white font-medium hover:brightness-110 transition-all"
            >
              提交审核
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles size={40} className="mx-auto text-neon-gold mb-3" />
            <h4 className="text-lg font-bold text-text-primary mb-2">提交成功！</h4>
            <p className="text-sm text-text-secondary">你的剧本已进入审核队列，审核结果将在3个工作日内通知你。</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 rounded-xl bg-neon-cyan text-void text-sm font-medium hover:brightness-110 transition-all">
              知道了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Game Room =====
function GameRoom({
  script,
  onBack,
}: {
  script: Script;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<MMPhase>('role');
  const [showRole, setShowRole] = useState(true);
  const [myRole] = useState(() => script.roles[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MM_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set());
  const [phaseCountdown, setPhaseCountdown] = useState(120);
  const [showVoting, setShowVoting] = useState(false);
  const [showTruth, setShowTruth] = useState(false);
  const [, setVotes] = useState<Record<string, number>>({});
  const [skillUsed, setSkillUsed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const phases: { phase: MMPhase; label: string; duration: number }[] = [
    { phase: 'role', label: '角色分配', duration: 120 },
    { phase: 'reading', label: '剧本阅读', duration: 300 },
    { phase: 'discussion1', label: '第一轮讨论', duration: 900 },
    { phase: 'search1', label: '第一轮搜证', duration: 300 },
    { phase: 'discussion2', label: '第二轮讨论', duration: 600 },
    { phase: 'final', label: '最终讨论', duration: 300 },
    { phase: 'voting', label: '投票', duration: 180 },
    { phase: 'ending', label: '结局', duration: 180 },
  ];

  const currentPhaseIndex = phases.findIndex((p) => p.phase === phase);

  // Phase countdown
  useEffect(() => {
    if (phase === 'ending') return;
    const timer = setInterval(() => {
      setPhaseCountdown((prev) => {
        if (prev <= 1) {
          setPhase((curr) => {
            const idx = phases.findIndex((p) => p.phase === curr);
            if (idx < phases.length - 1) {
              const nextPhase = phases[idx + 1];
              const phaseNames: Record<MMPhase, string> = {
                role: '角色分配', reading: '剧本阅读', discussion1: '第一轮讨论',
                search1: '搜证', discussion2: '第二轮讨论', search2: '搜证',
                final: '最终讨论', voting: '投票', ending: '结局揭晓',
              };
              setMessages((msgs) => [
                ...msgs,
                {
                  id: `sys_${Date.now()}`,
                  userId: 'dm',
                  username: 'AI DM',
                  avatar: '',
                  content: `【阶段切换】${phaseNames[nextPhase.phase]}开始！`,
                  type: 'system',
                  timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
              return nextPhase.phase;
            }
            return curr;
          });
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, phases]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI DM smart guidance messages
  useEffect(() => {
    const guidanceMessages: Record<string, string[]> = {
      discussion1: [
        '请大家依次介绍一下，案发时自己在哪里、在做什么。',
        '注意到有人提到了不在场证明，其他人对此有什么看法？',
        '根据目前的线索，谁最有机会接触到作案工具？',
        '有人提到XX时间点不在现场，有没有人可以证实或反驳？',
      ],
      search1: [
        '搜证阶段开始！每位玩家可以选择一条线索进行搜证。建议优先关注作案工具和关键物证。',
        '新线索出现了！这条线索似乎指向了某个特定的人...',
      ],
      discussion2: [
        '第二轮讨论开始。结合搜证结果，请大家重新审视各自的观点。',
        '注意！有人刚才的陈述和线索有矛盾之处，请解释清楚。',
        '根据新发现的线索，之前的推理可能需要调整方向了。',
      ],
      final: [
        '最终讨论！请大家整理所有线索，做出最后的推理。',
        '时间紧迫，每个人用一句话说出你认为的凶手和动机。',
      ],
      voting: [
        '投票时刻到了！请投出你认为的凶手。慎重，错误的投票会导致凶手逃脱！',
      ],
    };

    const msgs = guidanceMessages[phase];
    if (msgs && messages.length < 8) {
      const timer = setTimeout(() => {
        const msg = msgs[Math.min(Math.floor(Math.random() * msgs.length), msgs.length - 1)];
        setMessages((prev) => [
          ...prev,
          {
            id: `dm_${Date.now()}`,
            userId: 'dm',
            username: 'AI DM',
            avatar: '',
            content: msg,
            type: 'system',
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, messages.length]);

  const handleSend = useCallback(() => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: `u${Date.now()}`,
      userId: 'me',
      username: `我(${myRole.name})`,
      avatar: '',
      content: inputMsg.trim(),
      type: 'normal',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  }, [inputMsg, myRole]);

  const handleRevealClue = useCallback((clueId: string) => {
    setRevealedClues((prev) => new Set(prev).add(clueId));
  }, []);

  const handleVote = useCallback((roleId: string) => {
    setVotes((prev) => ({ ...prev, [roleId]: (prev[roleId] || 0) + 1 }));
    setPhase('ending');
    setShowTruth(true);
  }, []);

  const handleUseSkill = useCallback(() => {
    if (skillUsed) return;
    setSkillUsed(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `skill_${Date.now()}`,
        userId: 'dm',
        username: 'AI DM',
        avatar: '',
        content: `【技能发动】${myRole.name}使用了技能！${myRole.skill}`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    // Auto reveal a random clue
    const unrevealed = script.clues.filter((c) => !revealedClues.has(c.id));
    if (unrevealed.length > 0) {
      handleRevealClue(unrevealed[0].id);
    }
  }, [skillUsed, myRole, handleRevealClue, script.clues, revealedClues]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const phaseColors: Record<MMPhase, string> = {
    role: 'text-neon-cyan', reading: 'text-neon-cyan', discussion1: 'text-neon-gold',
    search1: 'text-neon-violet', discussion2: 'text-neon-gold', search2: 'text-neon-violet',
    final: 'text-neon-magenta', voting: 'text-neon-magenta', ending: 'text-neon-green',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-neon-cyan hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-text-primary">《{script.title}》</h3>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className={`font-medium ${phaseColors[phase]}`}>
                {phases.find((p) => p.phase === phase)?.label}
              </span>
              {phase !== 'ending' && (
                <>
                  <Clock size={10} />
                  <span>{formatTime(phaseCountdown)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRole(true)}
            className="px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-xs text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
          >
            查看角色
          </button>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Users size={12} />
            {script.players}/{script.players}
          </div>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="flex gap-1 mb-4">
        {phases.map((p, i) => (
          <div
            key={p.phase}
            className={`flex-1 h-1 rounded-full transition-all ${
              i < currentPhaseIndex ? 'bg-neon-cyan' : i === currentPhaseIndex ? 'bg-neon-cyan animate-pulse' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left: Player list */}
        <div className="w-full lg:w-48 flex-shrink-0 space-y-2 overflow-y-auto">
          <h4 className="text-xs font-medium text-text-muted mb-2">角色列表</h4>
          {script.roles.map((role) => (
            <div
              key={role.id}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                role.id === myRole.id
                  ? 'bg-neon-cyan/10 border-neon-cyan/30'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden ${
                  role.id === myRole.id ? 'bg-neon-cyan text-void' : 'bg-white/10 text-text-secondary'
                }`}>
                  {role.avatar ? (
                    <img src={role.avatar} alt={role.name} className="w-full h-full object-cover" />
                  ) : (
                    role.name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${role.id === myRole.id ? 'text-neon-cyan' : 'text-text-primary'}`}>
                    {role.name} {role.id === myRole.id && '(你)'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Skill button */}
          {!skillUsed && (phase === 'discussion1' || phase === 'discussion2' || phase === 'final') && (
            <button
              onClick={handleUseSkill}
              className="w-full mt-3 p-2.5 rounded-xl bg-neon-violet/10 border border-neon-violet/30 text-left hover:bg-neon-violet/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-neon-violet" />
                <span className="text-xs text-neon-violet font-medium">使用技能</span>
              </div>
              <p className="text-[10px] text-text-muted mt-1">每人每局限用一次</p>
            </button>
          )}
          {skillUsed && (
            <div className="w-full mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 text-left opacity-50">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-text-muted" />
                <span className="text-xs text-text-muted">技能已使用</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Chat / Discussion */}
        <div className="flex-1 flex flex-col bg-void rounded-2xl border border-white/5 overflow-hidden min-h-[200px]">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <h4 className="text-sm font-medium text-text-primary">
              {phase.includes('search') ? '搜证区域' : '讨论区'}
            </h4>
            {(phase === 'search1' || phase === 'search2') && (
              <span className="text-xs text-neon-violet">点击右侧线索卡进行搜证</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.userId === 'me' ? 'flex-row-reverse' : ''}`}>
                {msg.type === 'system' || msg.userId === 'dm' ? (
                  <div className="w-full text-center py-1">
                    <span className="inline-block px-3 py-1.5 rounded-xl bg-neon-violet/10 border border-dashed border-neon-violet/40 text-[11px] text-neon-violet max-w-[90%]">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <>
                    {msg.avatar ? (
                      <img src={msg.avatar} alt={msg.username} className="w-7 h-7 rounded-full self-start flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] text-neon-cyan flex-shrink-0 self-start">
                        {msg.username[0]}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.userId === 'me' ? 'items-end' : 'items-start'}`}>
                      {msg.userId !== 'me' && (
                        <span className="text-[10px] text-text-muted mb-0.5 block">{msg.username}</span>
                      )}
                      <div
                        className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                          msg.userId === 'me'
                            ? 'bg-neon-cyan/15 border border-neon-cyan/30 text-text-primary rounded-tr-sm'
                            : 'bg-white/5 border border-white/10 text-text-primary rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-text-muted mt-0.5 block">{msg.timestamp}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  micOn ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-text-muted hover:text-text-primary'
                }`}
              >
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={phase.includes('search') ? '搜证中...' : '参与讨论...'}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/30"
              />
              <button
                onClick={handleSend}
                className="w-9 h-9 rounded-lg bg-neon-cyan text-void flex items-center justify-center hover:brightness-110 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Clue board with flip cards */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <h4 className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1">
            <Eye size={12} />
            线索板 ({revealedClues.size}/{script.clues.length})
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {script.clues.map((clue) => (
              <FlipClueCard
                key={clue.id}
                clue={{ ...clue, revealed: revealedClues.has(clue.id) }}
                onReveal={() => handleRevealClue(clue.id)}
              />
            ))}
          </div>

          {/* Voting button in final phase */}
          {(phase === 'final' || phase === 'voting') && (
            <button
              onClick={() => setShowVoting(true)}
              className="w-full mt-4 py-3 rounded-xl bg-neon-magenta text-white font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 animate-pulse"
            >
              <Vote size={16} />
              投票指凶
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRole && <RoleCard role={myRole} onClose={() => setShowRole(false)} />}
      {showVoting && <VotingModal roles={script.roles} onVote={handleVote} onClose={() => setShowVoting(false)} />}
      {showTruth && <TruthModal script={script} onClose={() => { setShowTruth(false); onBack(); }} />}
    </div>
  );
}

// ===== Murder Mystery Lobby =====
export default function MurderMystery({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<MysteryView>('lobby');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showWriter, setShowWriter] = useState(false);
  const [hoveredScript, setHoveredScript] = useState<string | null>(null);

  if (view === 'room' && selectedScript) {
    return <GameRoom script={selectedScript} onBack={() => setView('lobby')} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-neon-cyan hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">剧本推理社</h2>
            <p className="text-sm text-text-secondary">AI DM 带队，沉浸式推理体验</p>
          </div>
        </div>
        <button
          onClick={() => setShowWriter(true)}
          className="px-4 py-2 rounded-xl bg-neon-violet/10 border border-neon-violet/20 text-sm text-neon-violet hover:bg-neon-violet/20 transition-colors flex items-center gap-2"
        >
          <UserPlus size={16} />
          写手入驻
        </button>
      </div>

      {/* Script list */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">可选剧本</h3>
        {MOCK_SCRIPTS.map((script) => (
          <div
            key={script.id}
            className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-violet/30 transition-all"
            onMouseEnter={() => setHoveredScript(script.id)}
            onMouseLeave={() => setHoveredScript(null)}
          >
            <div className="relative w-full sm:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={script.cover}
                alt={script.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {hoveredScript === script.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-all">
                  <span className="text-xs text-white font-medium">查看详情</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-lg font-bold text-text-primary">《{script.title}》</h4>
                <span className="px-2 py-0.5 rounded-full bg-neon-violet/10 text-neon-violet text-[10px] border border-neon-violet/20">
                  {script.type}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                  script.difficulty === '新手'
                    ? 'bg-neon-green/10 text-neon-green border-neon-green/20'
                    : 'bg-neon-gold/10 text-neon-gold border-neon-gold/20'
                }`}>
                  {script.difficulty}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-2 line-clamp-2">{script.description}</p>
              
              {/* Role preview */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-text-muted">角色:</span>
                <div className="flex -space-x-1.5">
                  {script.roles.slice(0, 5).map((role) => (
                    <div 
                      key={role.id} 
                      className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden"
                      title={role.name}
                    >
                      {role.avatar ? (
                        <img src={role.avatar} alt={role.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-text-secondary">{role.name[0]}</span>
                      )}
                    </div>
                  ))}
                  {script.roles.length > 5 && (
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-[8px] text-text-muted">+{script.roles.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {script.players}人
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {script.duration}
                </span>
                <span>{script.roles.length} 个角色</span>
                <span>{script.clues.length} 条线索</span>
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedScript(script);
                  setView('room');
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-neon-cyan text-void text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-1"
              >
                创建房间
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  setSelectedScript(script);
                  setView('room');
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-text-primary text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-1"
              >
                快速加入
              </button>
            </div>
          </div>
        ))}

        {/* Writer recruitment card */}
        <div
          onClick={() => setShowWriter(true)}
          className="p-6 rounded-xl border border-dashed border-neon-violet/30 bg-neon-violet/5 text-center cursor-pointer hover:bg-neon-violet/10 transition-all"
        >
          <UserPlus size={24} className="mx-auto text-neon-violet mb-2" />
          <h4 className="text-base font-medium text-text-primary">诚邀剧本杀写手入驻</h4>
          <p className="text-sm text-text-secondary mt-1">有原创剧本？提交审核，获得丰厚金币奖励</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-text-muted">
            <span>审核通过: 500金币</span>
            <span>月度最佳: 2000金币</span>
          </div>
        </div>
      </div>

      {showWriter && <WriterModal onClose={() => setShowWriter(false)} />}
    </div>
  );
}
