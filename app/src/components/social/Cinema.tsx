import { useState, useCallback, useRef, useEffect } from 'react';
import type { MovieSchedule, ChatMessage, SeatUser, MovieCategory } from './types';
import { MOCK_MOVIES, MOCK_SCHEDULES, MOCK_CINEMA_MESSAGES } from './data';
import { ArrowLeft, Clock, Users, Mic, MicOff, Send, Ticket, Star, ChevronRight, Volume2, Crown, Play, Sparkles, Zap, Monitor } from 'lucide-react';

type CinemaView = 'lobby' | 'room';
type RoomStatus = 'waiting' | 'playing' | 'ended';
type DateTab = 'today' | 'tomorrow' | 'after';

// Seat positions for semi-circle layout (percentage positions)
const SEAT_POSITIONS = [
  { top: '55%', left: '18%' },
  { top: '55%', left: '34%' },
  { top: '55%', left: '50%' },
  { top: '55%', left: '66%' },
  { top: '75%', left: '22%' },
  { top: '75%', left: '38%' },
  { top: '75%', left: '54%' },
  { top: '75%', left: '70%' },
];

// ===== Star Rating Component =====
function StarRating({ rating, onRate, size = 20 }: { rating: number; onRate?: (r: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onRate?.(s)}
          onMouseEnter={() => onRate && setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          disabled={!onRate}
        >
          <Star
            size={size}
            className={s <= (hover || rating)
              ? 'text-neon-gold fill-neon-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]'
              : 'text-text-muted'
            }
          />
        </button>
      ))}
    </div>
  );
}

// ===== Rating Modal =====
function RatingModal({ movieTitle, onClose }: { movieTitle: string; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-void-light border border-neon-gold/30 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <h3 className="text-xl font-bold text-text-primary text-center mb-1">给影片评分</h3>
            <p className="text-sm text-text-secondary text-center mb-4">《{movieTitle}》</p>
            <div className="flex justify-center mb-4">
              <StarRating rating={rating} onRate={setRating} size={32} />
            </div>
            <textarea
              placeholder="写下你的观影感想...（可选）"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-neon-cyan/50"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-text-secondary text-sm hover:bg-white/5 transition-colors"
              >
                跳过
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="flex-1 py-2.5 rounded-xl bg-neon-gold text-void text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交评分
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">
              <Star className="inline text-neon-gold fill-neon-gold" size={48} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">评分已提交！</h3>
            <p className="text-sm text-text-secondary">感谢你的评价，已奖励 50 金币</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Cinema Room (Viewing Room) =====
function CinemaRoom({
  schedule,
  onBack,
}: {
  schedule: MovieSchedule;
  onBack: () => void;
}) {
  const [seats] = useState<(SeatUser | null)[]>(schedule.seats);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CINEMA_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 min
  const [showRating, setShowRating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const roomStatusRef = useRef(roomStatus);
  roomStatusRef.current = roomStatus;

  // Simulate room status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const currentStatus = roomStatusRef.current;
          if (currentStatus === 'waiting') {
            setRoomStatus('playing');
            return 7200; // 2hr playing
          }
          if (currentStatus === 'playing') {
            setRoomStatus('ended');
            setTimeout(() => setShowRating(true), 5000);
            return 300; // 5min ended chat
          }
          return prev - 1;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: `u${Date.now()}`,
      userId: 'me',
      username: '我',
      avatar: '',
      content: inputMsg.trim(),
      type: 'normal',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  }, [inputMsg]);

  const mySeatIndex = 2; // User sits in seat 3
  const occupiedCount = seats.filter(Boolean).length + (seats[mySeatIndex] ? 0 : 1);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const statusLabels: Record<RoomStatus, { text: string; color: string }> = {
    waiting: { text: '等待中', color: 'text-neon-gold' },
    playing: { text: '放映中', color: 'text-neon-cyan' },
    ended: { text: '已结束', color: 'text-neon-green' },
  };

  return (
    <div className="h-full flex flex-col">
      {/* Room Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-neon-cyan hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary">《{schedule.movie.title}》</h3>
              {schedule.movie.vipExclusive && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFD700]/15 text-[#FFD700] text-[10px] border border-[#FFD700]/30 font-medium flex items-center gap-1">
                  <Crown size={10} />
                  VIP专享
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted">{schedule.time} | {schedule.movie.duration}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Tencent Video branding badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20">
            <Monitor size={12} className="text-[#FFD700]" />
            <span className="text-[10px] text-[#FFD700] font-medium">腾讯视频联动放映</span>
          </div>
          <div className={`text-sm font-medium ${statusLabels[roomStatus].color}`}>
            {statusLabels[roomStatus].text}
            {roomStatus === 'waiting' && (
              <span className="text-text-muted ml-1">({formatTime(countdown)})</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Users size={14} />
            {occupiedCount}/8
          </div>
        </div>
      </div>

      {/* Theater View */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Seat layout area - cozy theater */}
        <div className="flex-1 relative bg-void rounded-2xl border border-white/5 overflow-hidden min-h-[280px]">
          {/* Ambient theater lighting */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-b-[100px] opacity-30"
            style={{
              background: roomStatus === 'playing'
                ? 'radial-gradient(ellipse at center top, rgba(0,240,255,0.2) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center top, rgba(255,215,0,0.1) 0%, transparent 70%)'
            }}
          />

          {/* Screen area */}
          <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 w-[70%] h-[35%] rounded-lg overflow-hidden"
            style={{
              boxShadow: roomStatus === 'playing'
                ? '0 0 60px rgba(0,240,255,0.3), 0 0 120px rgba(0,240,255,0.1), inset 0 0 40px rgba(0,240,255,0.1)'
                : '0 0 20px rgba(255,255,255,0.05)'
            }}
          >
            <div className="w-full h-full bg-black/60 flex items-center justify-center relative">
              {roomStatus === 'waiting' && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary mb-2">即将放映</div>
                  <p className="text-sm text-text-secondary">《{schedule.movie.title}》</p>
                  <p className="text-neon-gold text-lg font-mono mt-2">{formatTime(countdown)}</p>
                  <div className="mt-3 px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 inline-flex items-center gap-1">
                    <Monitor size={10} className="text-[#FFD700]" />
                    <span className="text-[10px] text-[#FFD700]">腾讯视频联动放映</span>
                  </div>
                </div>
              )}
              {roomStatus === 'playing' && (
                <div className="text-center relative w-full h-full">
                  <img
                    src={schedule.movie.poster}
                    alt={schedule.movie.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-neon-cyan/20 border-2 border-neon-cyan/40 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <Play size={28} className="text-neon-cyan ml-1" />
                      </div>
                      <p className="text-neon-cyan text-sm animate-pulse">正在放映中...</p>
                      <p className="text-[10px] text-text-muted mt-1">腾讯视频联动放映厅</p>
                    </div>
                  </div>
                </div>
              )}
              {roomStatus === 'ended' && (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-neon-green/20 border-2 border-neon-green/40 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={24} className="text-neon-green" />
                  </div>
                  <div className="text-xl font-bold text-neon-green mb-2">放映结束</div>
                  <p className="text-sm text-text-secondary mb-2">感谢使用腾讯视频联动放映厅</p>
                  <p className="text-xs text-text-muted">期待下次相聚</p>
                </div>
              )}
              <div className="absolute inset-0 border-2 border-white/10 rounded-lg pointer-events-none" />
            </div>
          </div>

          {/* Screen label */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-[10px] text-text-muted tracking-widest">SCREEN</div>

          {/* Cozy theater seats with breathing avatars */}
          {SEAT_POSITIONS.map((pos, i) => {
            const occupant = seats[i];
            const isMe = i === mySeatIndex;
            return (
              <div
                key={i}
                className="absolute flex flex-col items-center gap-1"
                style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
              >
                {/* Seat back glow */}
                <div 
                  className={`absolute w-14 h-14 rounded-full blur-xl transition-opacity ${
                    occupant || isMe ? 'opacity-30' : 'opacity-0'
                  }`}
                  style={{ backgroundColor: isMe ? '#00F0FF' : occupant ? '#BD00FF' : 'transparent' }}
                />
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isMe
                      ? 'bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : occupant
                        ? 'bg-white/10 border-2 border-white/20 text-text-primary'
                        : 'bg-white/5 border-2 border-dashed border-text-muted/30 text-text-muted'
                  }`}
                >
                  {occupant ? (
                    <img 
                      src={occupant.avatar} 
                      alt={occupant.username} 
                      className={`w-full h-full rounded-full object-cover ${isMe || occupant ? 'animate-breath' : ''}`} 
                    />
                  ) : (
                    <span className="text-[10px]">{i + 1}</span>
                  )}
                  {/* Breathing glow ring */}
                  {(isMe || occupant) && (
                    <div className="absolute inset-[-3px] rounded-full border border-white/10 animate-breath-ring pointer-events-none" />
                  )}
                </div>
                <span className={`text-[10px] ${isMe ? 'text-neon-cyan' : 'text-text-muted'}`}>
                  {isMe ? '你' : occupant?.username || '空'}
                </span>
                {/* Mic indicator */}
                {occupant && (
                  <div className="absolute -top-1 -right-1">
                    {micOn && isMe ? (
                      <Volume2 size={10} className="text-neon-green" />
                    ) : (
                      <MicOff size={10} className="text-text-muted/50" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chat area */}
        <div className="w-full lg:w-80 flex flex-col bg-void rounded-2xl border border-white/5 overflow-hidden flex-shrink-0">
          <div className="p-3 border-b border-white/5">
            <h4 className="text-sm font-medium text-text-primary">房间聊天</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.userId === 'me' ? 'flex-row-reverse' : ''}`}>
                {msg.type === 'system' ? (
                  <div className="w-full text-center py-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-neon-violet/10 border border-dashed border-neon-violet/30 text-[11px] text-neon-violet">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <>
                    {msg.avatar && (
                      <img src={msg.avatar} alt={msg.username} className="w-7 h-7 rounded-full self-start flex-shrink-0" />
                    )}
                    {!msg.avatar && msg.userId !== 'me' && (
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

          {/* Input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  micOn ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-text-muted hover:text-text-primary'
                }`}
                title={micOn ? '关闭麦克风' : '开启麦克风'}
              >
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="发消息..."
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
      </div>

      {showRating && <RatingModal movieTitle={schedule.movie.title} onClose={() => setShowRating(false)} />}
    </div>
  );
}

// ===== Category Badge =====
function CategoryBadge({ category }: { category: MovieCategory }) {
  const configs: Record<MovieCategory, { text: string; icon: React.ReactNode; bg: string; color: string; border: string }> = {
    free: {
      text: '免费影片',
      icon: <Play size={10} />,
      bg: 'bg-neon-green/10',
      color: 'text-neon-green',
      border: 'border-neon-green/20',
    },
    vip: {
      text: 'VIP专享',
      icon: <Crown size={10} />,
      bg: 'bg-[#FFD700]/10',
      color: 'text-[#FFD700]',
      border: 'border-[#FFD700]/20',
    },
    upcoming: {
      text: '即将上映',
      icon: <Zap size={10} />,
      bg: 'bg-neon-cyan/10',
      color: 'text-neon-cyan',
      border: 'border-neon-cyan/20',
    },
  };
  const c = configs[category];
  return (
    <span className={`px-2 py-0.5 rounded-full ${c.bg} ${c.color} text-[10px] border ${c.border} font-medium flex items-center gap-1`}>
      {c.icon}
      {c.text}
    </span>
  );
}

// ===== Cinema Lobby =====
export default function Cinema({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<CinemaView>('lobby');
  const [selectedSchedule, setSelectedSchedule] = useState<MovieSchedule | null>(null);
  const [dateTab, setDateTab] = useState<DateTab>('today');
  const [categoryFilter, setCategoryFilter] = useState<MovieCategory | 'all'>('all');
  const [isVip, setIsVip] = useState(() => {
    const saved = localStorage.getItem('cinema_vip');
    return saved === 'true';
  });
  const [ticketsLeft, setTicketsLeft] = useState(() => {
    const saved = localStorage.getItem('cinema_tickets');
    const base = saved ? parseInt(saved) : 2;
    return isVip ? base + 2 : base;
  });
  const [bookedSchedules, setBookedSchedules] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('cinema_booked');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Persist
  useEffect(() => {
    localStorage.setItem('cinema_tickets', String(ticketsLeft));
  }, [ticketsLeft]);

  useEffect(() => {
    localStorage.setItem('cinema_booked', JSON.stringify([...bookedSchedules]));
  }, [bookedSchedules]);

  const dateLabels: Record<DateTab, string> = {
    today: '今日',
    tomorrow: '明日',
    after: '后天',
  };

  const filteredSchedules = MOCK_SCHEDULES.filter((s) => {
    if (s.date !== dateTab) return false;
    if (categoryFilter === 'all') return true;
    return s.movie.category === categoryFilter;
  });

  const handleBook = useCallback((schedule: MovieSchedule) => {
    if (bookedSchedules.has(schedule.id)) {
      setSelectedSchedule(schedule);
      setView('room');
      return;
    }
    if (ticketsLeft <= 0) return;
    setTicketsLeft((prev) => prev - 1);
    setBookedSchedules((prev) => new Set(prev).add(schedule.id));
    setSelectedSchedule(schedule);
    setView('room');
  }, [ticketsLeft, bookedSchedules]);

  const toggleVip = () => {
    const newVip = !isVip;
    setIsVip(newVip);
    localStorage.setItem('cinema_vip', String(newVip));
    if (newVip) {
      setTicketsLeft((prev) => prev + 2);
    } else {
      setTicketsLeft((prev) => Math.max(2, prev - 2));
    }
  };

  if (view === 'room' && selectedSchedule) {
    return <CinemaRoom schedule={selectedSchedule} onBack={() => setView('lobby')} />;
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
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-text-primary">PCG × 腾讯视频 放映厅</h2>
            </div>
            <p className="text-sm text-text-secondary">VIP联动放映，8人同观影边看边聊</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* VIP toggle */}
          <button
            onClick={toggleVip}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              isVip
                ? 'bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700]'
                : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10'
            }`}
          >
            <Crown size={14} />
            {isVip ? 'VIP会员' : '普通用户'}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-gold/10 border border-neon-gold/20">
            <Ticket size={16} className="text-neon-gold" />
            <span className="text-sm font-medium text-neon-gold">本周电影票: {ticketsLeft}/{isVip ? 4 : 2}</span>
          </div>
        </div>
      </div>

      {/* VIP Info Banner */}
      <div className="mb-5 p-3.5 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/15 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#FFD700]/10">
          <Monitor size={16} className="text-[#FFD700]" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-text-secondary">
            <span className="text-[#FFD700] font-medium">腾讯视频VIP专享：</span>
            腾讯VIP会员可直接观看付费影片，非会员每周限免2场
            {isVip && <span className="text-neon-green ml-1">（你当前享有VIP权益）</span>}
          </p>
        </div>
      </div>

      {/* Movie posters horizontal scroll */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-text-secondary mb-3">影片库</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {MOCK_MOVIES.map((movie) => (
            <div
              key={movie.id}
              className={`flex-shrink-0 w-[160px] group ${movie.vipExclusive ? 'vip-card' : ''}`}
            >
              <div className={`relative aspect-[2/3] rounded-xl overflow-hidden border transition-all ${
                movie.vipExclusive 
                  ? 'border-[#FFD700]/30 group-hover:border-[#FFD700]/60' 
                  : 'border-white/10 group-hover:border-neon-cyan/40'
              }`}>
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* VIP badge on poster */}
                {movie.vipExclusive && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#FFD700]/80 text-[9px] text-void font-bold flex items-center gap-0.5">
                    <Crown size={8} />
                    VIP
                  </div>
                )}
                {movie.category === 'upcoming' && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-neon-cyan/80 text-[9px] text-void font-bold">
                    即将上映
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <h4 className="text-sm font-bold text-text-primary">{movie.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="text-neon-gold fill-neon-gold" size={10} />
                    <span className="text-[11px] text-neon-gold">{movie.rating}</span>
                    <span className="text-[10px] text-text-muted">{movie.genre}</span>
                  </div>
                </div>
                {/* VIP glow for VIP movies */}
                {movie.vipExclusive && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-[#FFD700]/0 group-hover:border-[#FFD700]/30 transition-all rounded-xl" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters: Date + Category */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          {(Object.keys(dateLabels) as DateTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setDateTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                dateTab === tab
                  ? 'bg-neon-cyan text-void'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
              }`}
            >
              {dateLabels[tab]}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-white/10" />
        <div className="flex gap-2">
          {([['all', '全部'], ['free', '免费'], ['vip', 'VIP'], ['upcoming', '即将']] as [MovieCategory | 'all', string][]).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-white/15 text-text-primary border border-white/20'
                  : 'bg-white/5 text-text-muted hover:bg-white/10 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredSchedules.map((schedule) => {
          const occupiedCount = schedule.seats.filter(Boolean).length;
          const isBooked = bookedSchedules.has(schedule.id);
          const canBook = ticketsLeft > 0 || isBooked;
          const isVipMovie = schedule.movie.vipExclusive;

          return (
            <div
              key={schedule.id}
              className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 border transition-all ${
                isVipMovie 
                  ? 'border-[#FFD700]/10 hover:border-[#FFD700]/30' 
                  : 'border-white/5 hover:border-neon-cyan/20'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={schedule.movie.poster}
                  alt={schedule.movie.title}
                  className="w-16 h-24 rounded-lg object-cover"
                />
                {isVipMovie && (
                  <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-[#FFD700]/80 text-[8px] text-void font-bold flex items-center gap-0.5">
                    <Crown size={7} />
                    VIP
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-text-primary">《{schedule.movie.title}》</h4>
                  <CategoryBadge category={schedule.movie.category} />
                  {isBooked && (
                    <span className="px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green text-[10px] border border-neon-green/20">
                      已预约
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {schedule.time}
                  </span>
                  <span>{schedule.movie.duration}</span>
                  <span className="flex items-center gap-1">
                    <Star className="text-neon-gold fill-neon-gold" size={10} />
                    {schedule.movie.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isVipMovie ? 'bg-[#FFD700]' : 'bg-neon-cyan'
                      }`}
                      style={{ width: `${(occupiedCount / 8) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted">{occupiedCount}/8</span>
                </div>
              </div>
              <button
                onClick={() => handleBook(schedule)}
                disabled={!canBook && !isBooked}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                  isBooked
                    ? 'bg-neon-cyan text-void hover:brightness-110'
                    : canBook
                      ? isVipMovie
                        ? 'bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 border border-[#FFD700]/30'
                        : 'bg-white/10 text-text-primary hover:bg-neon-cyan hover:text-void border border-white/10'
                      : 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                }`}
              >
                {isBooked ? (
                  <>
                    进入
                    <ChevronRight size={14} />
                  </>
                ) : canBook ? (
                  isVipMovie ? (
                    <>
                      <Crown size={12} />
                      预约VIP场
                    </>
                  ) : (
                    '预约'
                  )
                ) : (
                  '本周票数已用完'
                )}
              </button>
            </div>
          );
        })}
        {filteredSchedules.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">暂无符合条件的排片</div>
        )}
      </div>
    </div>
  );
}
