import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from './types';
import { MOCK_GAME_ROOMS, MOCK_TURTLE_SOUPS, MOCK_WEREWOLF_WORDS } from './data';
import { ArrowLeft, Send, HelpCircle, UserCheck, Vote, Dice5, ChevronRight, Play, Trophy, Sparkles, RefreshCw, Rocket, Star, Crown, Zap } from 'lucide-react';

type GameView = 'lobby' | 'turtle' | 'werewolf' | 'ludo';
type LudoPlayer = { id: string; name: string; color: string; position: number; avatar: string };

// ===== Turtle Soup Game =====
function TurtleSoup({ onBack }: { onBack: () => void }) {
  const [selectedSoup, setSelectedSoup] = useState(MOCK_TURTLE_SOUPS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'ts_sys1',
      userId: 'system',
      username: '系统',
      avatar: '',
      content: `欢迎来到海龟汤！题目：「${MOCK_TURTLE_SOUPS[0].title}」。你可以通过提问来推理真相，AI只能回答"是"、"否"或"无关"。`,
      type: 'system',
      timestamp: '14:00',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [guessMode, setGuessMode] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIAnswer = (question: string): string => {
    const q = question.toLowerCase();
    // Heuristic for each soup
    const soupAnswers: Record<string, Record<string, string>> = {
      '雨夜归人': {
        '怀孕|生|孩子|孕妇': '是',
        '医院|病人|医生': '是',
        '死|杀|凶手|谋杀': '否',
        '鬼|灵魂| supernatural': '否',
        '车|开车|司机': '是',
        '女人': '是',
        '男人': '是',
        '报警|警察': '是',
      },
      '完美的早餐': {
        '鸡蛋|蛋|煎蛋': '是',
        '失踪|绑架|被带走': '是',
        '死|杀': '否',
        '妻子|女人': '是',
        '习惯|细节|讲究': '是',
        '别人|外人|陌生人': '是',
      },
      '最后一通电话': {
        '死|空难|飞机失事': '是',
        '妻子|女人': '是',
        '机场|飞机|航班': '是',
        '遗体|尸体|找到': '是',
        '一年前|失踪': '是',
        '鬼|灵魂': '否',
      },
      '微笑的尸体': {
        '自杀|自己杀死': '是',
        '侦探|小说|作家': '是',
        '毒|药物': '是',
        '欣快|开心|笑|微笑': '是',
        '谋杀|他杀|凶手': '否',
        '咖啡': '是',
      },
      '音乐会上的死亡': {
        '毒|中毒|毒素': '是',
        '皮肤|接触': '是',
        '指挥家|指挥': '是',
        '嫉妒|竞争|才华': '是',
        '手套|护手': '是',
        '小提琴|琴': '是',
      },
    };

    const currentSoupAnswers = soupAnswers[selectedSoup.title] || {};
    for (const [pattern, answer] of Object.entries(currentSoupAnswers)) {
      const regex = new RegExp(pattern);
      if (regex.test(q)) return answer;
    }
    return '无关';
  };

  const handleSend = useCallback(() => {
    if (!inputMsg.trim()) return;
    const userMsg: ChatMessage = {
      id: `ts_${Date.now()}`,
      userId: 'me',
      username: '我',
      avatar: '',
      content: inputMsg.trim(),
      type: 'normal',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    const aiAnswer = getAIAnswer(inputMsg.trim());
    const aiMsg: ChatMessage = {
      id: `ts_ai_${Date.now()}`,
      userId: 'ai',
      username: 'AI 主持人',
      avatar: '',
      content: aiAnswer,
      type: 'normal',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputMsg('');
  }, [inputMsg, selectedSoup]);

  const handleGuess = () => {
    if (!guessInput.trim()) return;
    const resultMsg: ChatMessage = {
      id: `ts_guess_${Date.now()}`,
      userId: 'system',
      username: '系统',
      avatar: '',
      content: `猜测结果：${selectedSoup.answer}`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, resultMsg]);
    setShowAnswer(true);
    setGuessMode(false);
  };

  const handleNext = () => {
    const idx = MOCK_TURTLE_SOUPS.indexOf(selectedSoup);
    const next = MOCK_TURTLE_SOUPS[(idx + 1) % MOCK_TURTLE_SOUPS.length];
    setSelectedSoup(next);
    setShowAnswer(false);
    setMessages([{
      id: `ts_sys_${Date.now()}`,
      userId: 'system',
      username: '系统',
      avatar: '',
      content: `新题目：「${next.title}」。${next.scenario}`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-neon-cyan hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-text-primary">海龟汤</h3>
            <p className="text-xs text-text-muted">提问推理，找出真相 · 共 {MOCK_TURTLE_SOUPS.length} 题</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-[10px] border ${
            selectedSoup.difficulty === '简单' ? 'bg-neon-green/10 text-neon-green border-neon-green/20' :
            selectedSoup.difficulty === '中等' ? 'bg-neon-gold/10 text-neon-gold border-neon-gold/20' :
            'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/20'
          }`}>
            {selectedSoup.difficulty}
          </span>
          <button onClick={handleNext} className="px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary text-xs hover:bg-white/10 transition-colors flex items-center gap-1">
            <RefreshCw size={12} />
            换题
          </button>
        </div>
      </div>

      {/* Scenario display */}
      <div className="p-4 rounded-xl bg-neon-gold/5 border border-neon-gold/20 mb-4">
        <h4 className="text-sm font-bold text-neon-gold mb-2">题目：{selectedSoup.title}</h4>
        <p className="text-sm text-text-primary leading-relaxed">{selectedSoup.scenario}</p>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0 pr-1">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'system' ? (
              <div className="text-center py-1">
                <span className="inline-block px-3 py-1 rounded-full bg-neon-violet/10 border border-dashed border-neon-violet/30 text-[11px] text-neon-violet">
                  {msg.content}
                </span>
              </div>
            ) : (
              <div className={`flex items-start gap-2 ${msg.userId === 'me' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                  msg.userId === 'ai' ? 'bg-neon-violet/20 text-neon-violet' : 'bg-neon-cyan/20 text-neon-cyan'
                }`}>
                  {msg.username[0]}
                </div>
                <div className={`px-3 py-2 rounded-xl text-xs max-w-[70%] ${
                  msg.userId === 'me'
                    ? 'bg-neon-cyan/15 border border-neon-cyan/30 text-text-primary rounded-tr-sm'
                    : msg.userId === 'ai'
                      ? 'bg-neon-violet/10 border border-neon-violet/20 text-text-primary rounded-tl-sm'
                      : 'bg-white/5 border border-white/10 text-text-primary'
                }`}>
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Show answer section */}
      {showAnswer && (
        <div className="p-3 rounded-xl bg-neon-green/5 border border-neon-green/20 mb-3">
          <h5 className="text-xs font-medium text-neon-green mb-1">汤底（真相）</h5>
          <p className="text-xs text-text-secondary">{selectedSoup.answer}</p>
        </div>
      )}

      {/* Input area */}
      {guessMode ? (
        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-neon-magenta/20 mb-2">
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
            placeholder="输入你的猜测..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-magenta/50"
            autoFocus
          />
          <button onClick={handleGuess} className="px-4 py-2 rounded-lg bg-neon-magenta text-white text-sm hover:brightness-110 transition-all">
            确认
          </button>
          <button onClick={() => setGuessMode(false)} className="px-3 py-2 rounded-lg bg-white/5 text-text-secondary text-sm hover:bg-white/10 transition-colors">
            取消
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="提问（AI只会回答是/否/无关）..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/30"
          />
          <button onClick={handleSend} className="w-10 h-10 rounded-xl bg-neon-cyan text-void flex items-center justify-center hover:brightness-110 transition-all">
            <Send size={16} />
          </button>
          <button
            onClick={() => setGuessMode(true)}
            className="px-4 py-2.5 rounded-xl bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta text-sm hover:bg-neon-magenta/20 transition-colors flex items-center gap-1"
          >
            <HelpCircle size={14} />
            猜汤底
          </button>
        </div>
      )}
    </div>
  );
}

// ===== Werewolf (Who's the Spy) Game =====
function Werewolf({ onBack }: { onBack: () => void }) {
  const [wordPair] = useState(() => MOCK_WEREWOLF_WORDS[Math.floor(Math.random() * MOCK_WEREWOLF_WORDS.length)]);
  const [isSpy] = useState(() => Math.random() < 0.3);
  const [round, setRound] = useState(1);
  const [descriptions, setDescriptions] = useState<{ name: string; text: string }[]>([
    { name: '玩家A', text: '这是一种很常见的东西' },
    { name: '玩家B', text: '日常生活中经常接触到' },
  ]);
  const [myDesc, setMyDesc] = useState('');
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmitDesc = () => {
    if (!myDesc.trim()) return;
    setDescriptions((prev) => [...prev, { name: '我', text: myDesc.trim() }]);
    setMyDesc('');
    setTimeout(() => {
      const simulated = [
        { name: '玩家C', text: '颜色很鲜艳/清淡' },
        { name: '玩家D', text: '可以直接食用/使用' },
      ];
      const randomDesc = simulated[Math.floor(Math.random() * simulated.length)];
      setDescriptions((prev) => [...prev, randomDesc]);
      setVoting(true);
    }, 800);
  };

  const handleVote = (target: string) => {
    setVoted(true);
    const isSpyCaught = !isSpy && target !== '我';
    setResult(
      isSpy
        ? target === '我' ? '你被投票出局了！平民获胜！' : '你成功逃脱！卧底获胜！'
        : target === '我'
          ? '你投票给了自己...平民获胜！'
          : isSpyCaught ? '你投票正确！平民获胜！' : '卧底逃脱了！卧底获胜！'
    );
  };

  const handleNextRound = () => {
    setRound((r) => r + 1);
    setVoting(false);
    setVoted(false);
    setResult(null);
    setDescriptions([{ name: '系统', text: `--- 第${round + 1}轮开始 ---` }]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-neon-cyan hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-text-primary">谁是卧底</h3>
            <p className="text-xs text-text-muted">词库共 {MOCK_WEREWOLF_WORDS.length} 组 · 第 {round} 轮</p>
          </div>
        </div>
      </div>

      {/* Word display */}
      <div className="p-5 rounded-xl bg-neon-magenta/5 border border-neon-magenta/20 mb-4 text-center relative overflow-hidden">
        <div className="absolute top-2 right-2 opacity-10">
          <Crown size={40} className="text-neon-magenta" />
        </div>
        <p className="text-xs text-text-muted mb-1">你的词语</p>
        <h2 className="text-2xl font-bold text-neon-magenta">{isSpy ? wordPair.spy : wordPair.civilian}</h2>
        <p className="text-[10px] text-text-muted mt-2">
          {isSpy ? '你是卧底！不要让别人发现你的词语不同。' : '描述你的词语，但不要太过明显。找出卧底！'}
        </p>
      </div>

      {/* Descriptions */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0">
        <h4 className="text-xs text-text-muted mb-2">大家描述</h4>
        {descriptions.map((d, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs font-medium text-neon-cyan">{d.name}：</span>
            <span className="text-sm text-text-primary ml-1">{d.text}</span>
          </div>
        ))}
        {result && (
          <div className="p-3 rounded-xl bg-neon-gold/10 border border-neon-gold/20 text-center">
            <p className="text-sm text-neon-gold">{result}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!voting ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={myDesc}
            onChange={(e) => setMyDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitDesc()}
            placeholder="用一句话描述你的词语..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/30"
          />
          <button onClick={handleSubmitDesc} className="px-5 py-2.5 rounded-xl bg-neon-cyan text-void text-sm font-medium hover:brightness-110 transition-all">
            描述
          </button>
        </div>
      ) : !voted ? (
        <div>
          <p className="text-xs text-text-muted mb-2">投票指认卧底：</p>
          <div className="flex gap-2">
            {['玩家A', '玩家B', '玩家C'].map((p) => (
              <button
                key={p}
                onClick={() => handleVote(p)}
                className="flex-1 py-2.5 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20 text-neon-magenta text-sm hover:bg-neon-magenta/20 transition-all flex items-center justify-center gap-1"
              >
                <Vote size={14} />
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={handleNextRound} className="w-full py-2.5 rounded-xl bg-neon-cyan text-void text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-1">
          <ChevronRight size={14} />
          下一轮
        </button>
      )}
    </div>
  );
}

// ===== Ludo (Flight Chess) Game - Enhanced =====
function LudoGame({ onBack }: { onBack: () => void }) {
  const [players] = useState<LudoPlayer[]>([
    { id: 'p1', name: '我', color: '#00F0FF', position: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me' },
    { id: 'p2', name: '星际旅者', color: '#FF2A6D', position: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=star1' },
    { id: 'p3', name: '像素诗人', color: '#39FF14', position: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel2' },
    { id: 'p4', name: '霓虹甜心', color: '#FFD700', position: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon3' },
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0]);
  const [gameLog, setGameLog] = useState<string[]>(['🚀 游戏开始！大家轮流掷骰子吧~']);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const TOTAL_STEPS = 30;

  // Special step events with icons
  const stepEvents: Record<number, { icon: React.ReactNode; title: string; effect: string; delta: number }> = {
    5: { icon: <Rocket size={12} />, title: '内容起飞', effect: '你的视频上热门了！', delta: 2 },
    10: { icon: <Star size={12} />, title: '粉丝暴涨', effect: '收获一波新粉丝！', delta: 3 },
    15: { icon: <Crown size={12} />, title: '平台推荐', effect: '登上首页推荐！', delta: 2 },
    20: { icon: <Zap size={12} />, title: '灵感爆发', effect: '创作力MAX！', delta: 2 },
    25: { icon: <Trophy size={12} />, title: '爆款达成', effect: '百万播放达成！', delta: 1 },
  };

  const handleRoll = () => {
    if (rolling || currentPlayer !== 0) return;
    setRolling(true);
    setActiveEvent(null);
    let rollCount = 0;
    const interval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDice(finalDice);
        setPositions((prev) => {
          const newPos = [...prev];
          const newPosition = Math.min(newPos[currentPlayer] + finalDice, TOTAL_STEPS);
          newPos[currentPlayer] = newPosition;
          const playerName = players[currentPlayer].name;
          
          let logMsg = `${playerName} 掷出了 ${finalDice}，前进了 ${finalDice} 格！`;
          if (newPosition >= TOTAL_STEPS) {
            logMsg = `🏆 ${playerName} 掷出了 ${finalDice}，到达终点！恭喜获胜！`;
          }
          setGameLog((logs) => [...logs, logMsg]);

          // Special events
          const event = stepEvents[newPosition];
          if (event) {
            setTimeout(() => {
              setActiveEvent(`${event.title}：${event.effect}`);
              newPos[currentPlayer] = Math.min(newPos[currentPlayer] + event.delta, TOTAL_STEPS);
              setGameLog((logs) => [...logs, `✨ ${event.title}！${playerName} ${event.delta > 0 ? '额外前进' : '后退'}${Math.abs(event.delta)}格！`]);
            }, 800);
          }
          return newPos;
        });
        setRolling(false);
        setCurrentPlayer((p) => (p + 1) % players.length);
      }
    }, 50);
  };

  const getStepStyle = (stepNum: number) => {
    const isSpecial = stepEvents[stepNum];
    const isStart = stepNum === 1;
    const isEnd = stepNum === TOTAL_STEPS;
    
    if (isEnd) return 'bg-[#FFD700]/15 border-[#FFD700]/40 text-[#FFD700]';
    if (isSpecial) return 'bg-[#BD00FF]/10 border-[#BD00FF]/30 text-[#BD00FF]';
    if (isStart) return 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]';
    return 'bg-white/[0.03] border-white/[0.08] text-text-muted';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-neon-cyan hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-text-primary">飞行棋</h3>
            <p className="text-xs text-text-muted">星球探险版 · 最先到达终点获胜</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Game board - enhanced */}
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 bg-void rounded-2xl border border-white/5 p-4 overflow-hidden">
            {/* Background grid decoration */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }} />
            
            {/* Track grid - 6 columns x 5 rows = 30 steps */}
            <div className="grid grid-cols-6 grid-rows-5 gap-1.5 h-full relative z-10">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                const stepNum = i + 1;
                const playersHere = players.filter((_, pi) => positions[pi] === stepNum);
                const event = stepEvents[stepNum];
                
                return (
                  <div
                    key={stepNum}
                    className={`relative rounded-lg flex flex-col items-center justify-center text-[10px] font-mono transition-all border ${getStepStyle(stepNum)}`}
                  >
                    <span className="font-bold">{stepNum}</span>
                    
                    {/* Special event icon */}
                    {event && (
                      <div className="absolute top-0.5 right-0.5 opacity-60">
                        {event.icon}
                      </div>
                    )}
                    
                    {/* Start/End labels */}
                    {stepNum === 1 && (
                      <span className="absolute bottom-0.5 text-[8px] text-[#00F0FF]">起点</span>
                    )}
                    {stepNum === TOTAL_STEPS && (
                      <span className="absolute bottom-0.5 text-[8px] text-[#FFD700]">终点</span>
                    )}
                    
                    {/* Player tokens */}
                    {playersHere.map((p) => (
                      <div
                        key={p.id}
                        className="absolute inset-0.5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: p.color + '25', border: `1.5px solid ${p.color}` }}
                      >
                        <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full" />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active event display */}
          {activeEvent && (
            <div className="mt-3 p-3 rounded-xl bg-[#BD00FF]/10 border border-[#BD00FF]/20 flex items-center gap-2 animate-pulse">
              <Sparkles size={14} className="text-[#BD00FF]" />
              <span className="text-xs text-[#BD00FF]">{activeEvent}</span>
            </div>
          )}

          {/* Dice and controls */}
          <div className="flex items-center justify-between mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: players[currentPlayer].color }} />
                <span className="text-sm font-medium text-text-primary">
                  当前: {players[currentPlayer].name}
                </span>
              </div>
            </div>
            <button
              onClick={handleRoll}
              disabled={rolling || currentPlayer !== 0}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                currentPlayer === 0
                  ? 'bg-neon-cyan text-void hover:brightness-110'
                  : 'bg-white/5 text-text-muted cursor-not-allowed'
              }`}
            >
              <Dice5 size={18} />
              {rolling ? '滚动中...' : currentPlayer === 0 ? '掷骰子' : '等待中...'}
            </button>
            {dice > 0 && !rolling && (
              <div className="w-10 h-10 rounded-lg bg-neon-gold/10 border border-neon-gold/30 flex items-center justify-center text-neon-gold font-bold text-lg">
                {dice}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Players + Log */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-3">
          {/* Player standings */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <h4 className="text-xs font-medium text-text-muted mb-2">玩家排名</h4>
            <div className="space-y-2">
              {[...players]
                .map((p, i) => ({ ...p, pos: positions[i], idx: i }))
                .sort((a, b) => b.pos - a.pos)
                .map((p, rank) => (
                  <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg ${p.idx === currentPlayer ? 'bg-white/5 border border-white/10' : ''}`}>
                    <span className="text-[10px] w-4 text-center font-bold text-text-muted">
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`}
                    </span>
                    <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full" />
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-xs text-text-primary flex-1">{p.name}</span>
                    <span className="text-[10px] text-text-muted">{p.pos}/{TOTAL_STEPS}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Game log */}
          <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 overflow-y-auto max-h-[200px]">
            <h4 className="text-xs font-medium text-text-muted mb-2">游戏记录</h4>
            <div className="space-y-1.5">
              {gameLog.map((log, i) => (
                <p key={i} className="text-[10px] text-text-secondary">{log}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Game Lobby =====
export default function GameLobby({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<GameView>('lobby');

  if (view === 'turtle') return <TurtleSoup onBack={() => setView('lobby')} />;
  if (view === 'werewolf') return <Werewolf onBack={() => setView('lobby')} />;
  if (view === 'ludo') return <LudoGame onBack={() => setView('lobby')} />;

  const games = [
    {
      id: 'turtle' as GameView,
      name: '海龟汤',
      desc: `推理提问，找出真相。AI只能回答"是""否""无关"。共 ${MOCK_TURTLE_SOUPS.length} 个谜题。`,
      icon: <HelpCircle size={28} className="text-neon-cyan" />,
      color: 'neon-cyan',
      players: '2-8人',
      online: 12,
    },
    {
      id: 'werewolf' as GameView,
      name: '谁是卧底',
      desc: ` majority拿到相同词语，卧底拿到相近词。词库共 ${MOCK_WEREWOLF_WORDS.length} 组。`,
      icon: <UserCheck size={28} className="text-neon-magenta" />,
      color: 'neon-magenta',
      players: '4-8人',
      online: 8,
    },
    {
      id: 'ludo' as GameView,
      name: '飞行棋',
      desc: '星球探险版飞行棋，特殊格子触发随机事件，最先到达终点获胜。',
      icon: <Dice5 size={28} className="text-neon-green" />,
      color: 'neon-green',
      players: '2-4人',
      online: 6,
    },
  ];

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
            <h2 className="text-2xl font-bold text-text-primary">派对游戏馆</h2>
            <p className="text-sm text-text-secondary">快速匹配，随时开局</p>
          </div>
        </div>
      </div>

      {/* Game selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setView(game.id)}
            className={`p-5 rounded-xl bg-white/5 border border-white/5 hover:border-${game.color}/40 transition-all text-left group hover:-translate-y-1`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl bg-${game.color}/10 border border-${game.color}/20`}>
                {game.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-neon-cyan transition-colors">{game.name}</h3>
                <span className="text-[10px] text-text-muted">{game.players}</span>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">{game.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">{game.online} 人在线</span>
              <span className={`text-xs text-${game.color} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <Play size={10} />
                快速开始
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-text-secondary mb-3">等待中的房间</h3>
        <div className="space-y-2">
          {MOCK_GAME_ROOMS.map((room) => (
            <div
              key={room.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-neon-cyan/20 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                <Trophy size={18} className="text-neon-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary">{room.host} 的房间</h4>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-violet/10 text-neon-violet border border-neon-violet/20">
                    {room.gameType}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {room.players}/{room.maxPlayers}人
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-neon-cyan text-void text-xs font-medium hover:brightness-110 transition-all flex-shrink-0">
                加入
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
