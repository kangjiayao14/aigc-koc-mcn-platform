import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Sparkles, ArrowRight, Rocket, Star, Trophy, Coins, FileText } from 'lucide-react';
import WarpTunnel from '../components/WarpTunnel';
import ProgressIndicator from '../components/ProgressIndicator';
import InfoBubble from '../components/InfoBubble';
import type { InfoBubbleData } from '../components/InfoBubble';
import ProfilePreview from '../components/ProfilePreview';

/**
 * Onboarding - 完整的入驻引导流程
 *
 * 4步流程：
 * 1. warp-tunnel: 时空漩涡穿越 + 经纪人性别选择
 * 2. broker-intro: 经纪人初见 + 开场白对话
 * 3. info-collection: 信息泡泡对话收集 (10个问题)
 * 4. confirmation: 入驻确认书 + 个人主页预览 + 庆祝动画
 *
 * Data Storage:
 * - localStorage key: pcg_user_profile (用户全部信息)
 * - localStorage key: pcg_broker_choice (经纪人选择 male/female)
 *
 * TODO: Connect to LLM API for dynamic broker dialogue
 *   - File: src/services/onboardingLLM.ts
 *   - generateOpening(gender): 生成经纪人开场白
 *   - generateSummary(profile): 根据用户信息生成个性化入驻宣言
 *   - generateAvatar(profile): 调用图像生成API生成头像
 *
 * TODO: Connect to ImageGen API for avatar generation
 *   - File: src/services/imageGen.ts
 *   - generateAvatar(userProfile): 基于用户信息生成动漫风格头像
 */

// =============================================================================
// Types
// =============================================================================
type OnboardingPhase = 'warp' | 'broker-intro' | 'info-collection' | 'confirmation';

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  mbti: string;
  zodiac: string;
  interests: string[];
  field: string[];
  platforms: string[];
  games: string;
  goals: string[];
}

// =============================================================================
// Constants
// =============================================================================
const STORAGE_KEYS = {
  profile: 'pcg_user_profile',
  broker: 'pcg_broker_choice',
};

const BROKER_NAME = { male: '凌霄', female: '梦璃' };
const BROKER_AVATAR = { male: '/broker-male.png', female: '/broker-female.png' };
const BROKER_COLOR = { male: '#00D4FF', female: '#FF6B9D' };

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: '',
  gender: '',
  mbti: '',
  zodiac: '',
  interests: [],
  field: [],
  platforms: [],
  games: '',
  goals: [],
};

// =============================================================================
// Question Definitions
// =============================================================================
const INFO_BUBBLES: InfoBubbleData[] = [
  {
    id: 'name',
    question: '首先，该怎么称呼你呢？',
    type: 'text',
    placeholder: '输入你的昵称...',
    required: true,
  },
  {
    id: 'age',
    question: '方便告诉我你的年龄段吗？',
    subtext: '这会影响内容风格建议哦~',
    type: 'single-select',
    options: [
      { label: '18 以下', value: '18以下' },
      { label: '18-24', value: '18-24' },
      { label: '25-30', value: '25-30' },
      { label: '31-40', value: '31-40' },
      { label: '40+', value: '40+' },
    ],
    required: true,
  },
  {
    id: 'gender',
    question: '你的性别是？',
    type: 'single-select',
    options: [
      { label: '♂ 男', value: '男' },
      { label: '♀ 女', value: '女' },
      { label: '不愿透露', value: '不愿透露' },
    ],
    required: false,
  },
  {
    id: 'mbti',
    question: '你的 MBTI 是什么？',
    subtext: '不知道的话也可以跳过~',
    type: 'grid-select',
    gridCols: 4,
    options: [
      { label: 'INTJ', value: 'INTJ', description: '建筑师' },
      { label: 'INTP', value: 'INTP', description: '逻辑学家' },
      { label: 'ENTJ', value: 'ENTJ', description: '指挥官' },
      { label: 'ENTP', value: 'ENTP', description: '辩论家' },
      { label: 'INFJ', value: 'INFJ', description: '提倡者' },
      { label: 'INFP', value: 'INFP', description: '调停者' },
      { label: 'ENFJ', value: 'ENFJ', description: '主人公' },
      { label: 'ENFP', value: 'ENFP', description: '竞选者' },
      { label: 'ISTJ', value: 'ISTJ', description: '检查员' },
      { label: 'ISFJ', value: 'ISFJ', description: '守卫者' },
      { label: 'ESTJ', value: 'ESTJ', description: '总经理' },
      { label: 'ESFJ', value: 'ESFJ', description: '执政官' },
      { label: 'ISTP', value: 'ISTP', description: '鉴赏家' },
      { label: 'ISFP', value: 'ISFP', description: '探险家' },
      { label: 'ESTP', value: 'ESTP', description: '企业家' },
      { label: 'ESFP', value: 'ESFP', description: '表演者' },
    ],
    required: false,
  },
  {
    id: 'zodiac',
    question: '你的星座是？',
    type: 'grid-select',
    gridCols: 4,
    options: [
      { label: '白羊座', value: '白羊座', icon: '♈', description: '3.21-4.19' },
      { label: '金牛座', value: '金牛座', icon: '♉', description: '4.20-5.20' },
      { label: '双子座', value: '双子座', icon: '♊', description: '5.21-6.21' },
      { label: '巨蟹座', value: '巨蟹座', icon: '♋', description: '6.22-7.22' },
      { label: '狮子座', value: '狮子座', icon: '♌', description: '7.23-8.22' },
      { label: '处女座', value: '处女座', icon: '♍', description: '8.23-9.22' },
      { label: '天秤座', value: '天秤座', icon: '♎', description: '9.23-10.23' },
      { label: '天蝎座', value: '天蝎座', icon: '♏', description: '10.24-11.22' },
      { label: '射手座', value: '射手座', icon: '♐', description: '11.23-12.21' },
      { label: '摩羯座', value: '摩羯座', icon: '♑', description: '12.22-1.19' },
      { label: '水瓶座', value: '水瓶座', icon: '♒', description: '1.20-2.18' },
      { label: '双鱼座', value: '双鱼座', icon: '♓', description: '2.19-3.20' },
    ],
    required: false,
  },
  {
    id: 'interests',
    question: '你平时最喜欢做什么？可以多选哦！',
    type: 'multi-select',
    options: [
      { label: '游戏电竞', value: '游戏电竞', icon: '\uD83C\uDFAE' },
      { label: '美食探店', value: '美食探店', icon: '\uD83C\uDF54' },
      { label: '旅行出游', value: '旅行出游', icon: '\u2708\uFE0F' },
      { label: '穿搭时尚', value: '穿搭时尚', icon: '\uD83D\uDC57' },
      { label: '美妆护肤', value: '美妆护肤', icon: '\uD83D\uDC84' },
      { label: '数码科技', value: '数码科技', icon: '\uD83D\uDCF1' },
      { label: '读书学习', value: '读书学习', icon: '\uD83D\uDCDA' },
      { label: '影视娱乐', value: '影视娱乐', icon: '\uD83C\uDFAC' },
      { label: '音乐舞蹈', value: '音乐舞蹈', icon: '\uD83C\uDFB5' },
      { label: '健身运动', value: '健身运动', icon: '\uD83D\uDCAA' },
      { label: '萌宠动物', value: '萌宠动物', icon: '\uD83D\uDC31' },
      { label: '手工艺术', value: '手工艺术', icon: '\uD83C\uDFA8' },
      { label: '理财投资', value: '理财投资', icon: '\uD83D\uDCB0' },
      { label: '家居生活', value: '家居生活', icon: '\uD83C\uDFE0' },
      { label: '职场成长', value: '职场成长', icon: '\uD83D\uDCDD' },
      { label: '体育赛事', value: '体育赛事', icon: '\u26BD' },
    ],
    required: true,
  },
  {
    id: 'field',
    question: '如果要成为 KOC，你更想在哪个领域发光发热？',
    type: 'multi-select',
    options: [
      { label: '生活方式', value: '生活方式' },
      { label: '美妆护肤', value: '美妆护肤' },
      { label: '时尚穿搭', value: '时尚穿搭' },
      { label: '美食探店', value: '美食探店' },
      { label: '数码科技', value: '数码科技' },
      { label: '游戏电竞', value: '游戏电竞' },
      { label: '旅行出游', value: '旅行出游' },
      { label: '知识分享', value: '知识分享' },
      { label: '健身运动', value: '健身运动' },
      { label: '母婴育儿', value: '母婴育儿' },
      { label: '宠物领域', value: '宠物领域' },
      { label: '投资理财', value: '投资理财' },
    ],
    required: true,
  },
  {
    id: 'platforms',
    question: '你目前在哪些平台活跃？',
    type: 'multi-select',
    options: [
      { label: '小红书', value: '小红书' },
      { label: '抖音', value: '抖音' },
      { label: '视频号', value: '视频号' },
      { label: '微博', value: '微博' },
      { label: 'B站', value: 'B站' },
      { label: '快手', value: '快手' },
      { label: 'Instagram', value: 'Instagram' },
      { label: 'Twitter/X', value: 'Twitter' },
      { label: '还没有开始', value: '还没有开始' },
    ],
    required: false,
  },
  {
    id: 'games',
    question: '平时喜欢玩什么游戏？',
    subtext: '这可能会成为你的内容方向之一哦！',
    type: 'text',
    placeholder: '输入游戏名称，多个用逗号分隔...',
    required: false,
  },
  {
    id: 'goals',
    question: '最后，你希望通过 KOC 实现什么目标？',
    type: 'multi-select',
    options: [
      { label: '记录生活，表达自己', value: '记录生活' },
      { label: '涨粉，成为小网红', value: '涨粉成名' },
      { label: '副业变现，接广告', value: '副业变现' },
      { label: '认识志同道合的朋友', value: '交友扩圈' },
      { label: '提升个人品牌影响力', value: '品牌建设' },
      { label: '还没想好，先试试', value: '先试试' },
    ],
    required: true,
  },
];

// =============================================================================
// Utility: Generate user ID
// =============================================================================
function generateUserId(): string {
  const existing = localStorage.getItem('pcg_user_id');
  if (existing) return existing;
  const id = 'PCG' + Math.random().toString(36).substr(2, 6).toUpperCase();
  localStorage.setItem('pcg_user_id', id);
  return id;
}

// =============================================================================
// Main Component
// =============================================================================
export default function Onboarding() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<OnboardingPhase>('warp');
  const [brokerGender, setBrokerGender] = useState<'male' | 'female'>('male');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [userId] = useState(generateUserId);
  const [brokerExpression, setBrokerExpression] = useState<'neutral' | 'happy' | 'thinking' | 'surprise'>('neutral');
  const [showCompletionCert, setShowCompletionCert] = useState(false);
  const [dialogueText, setDialogueText] = useState('');
  const [showDialogue, setShowDialogue] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // Phase 1: Warp Tunnel Complete
  // =============================================================================
  const handleWarpComplete = useCallback((gender: 'male' | 'female') => {
    setBrokerGender(gender);
    localStorage.setItem(STORAGE_KEYS.broker, gender);
    setPhase('broker-intro');
  }, []);

  // =============================================================================
  // Phase 2: Broker Intro
  // =============================================================================
  // Typewriter effect for broker opening dialogue
  useEffect(() => {
    if (phase !== 'broker-intro') return;

    const brokerName = BROKER_NAME[brokerGender];
    const openingText = `尊敬的未来创客官，你好！\n\n我是${brokerName}，从今天起就是你的专属 MCN 经纪人。我会以专业角度陪你共同规划 KOC 打造之旅——包括人设定位、内容选题、发布策略、互动优化，以及各种好玩的社交活动！\n\n在正式开始之前，让我先了解一下你吧？这样我才能为你量身定制最适合的方案。`;

    setShowDialogue(true);
    let index = 0;
    const timer = setInterval(() => {
      if (index <= openingText.length) {
        setDialogueText(openingText.slice(0, index));
        index++;
        // Change expression at key points
        if (index === openingText.length * 0.3) setBrokerExpression('happy');
        if (index === openingText.length * 0.7) setBrokerExpression('thinking');
      } else {
        clearInterval(timer);
        setBrokerExpression('happy');
      }
    }, 25);

    return () => clearInterval(timer);
  }, [phase, brokerGender]);

  const handleStartInfoCollection = () => {
    setPhase('info-collection');
    setBrokerExpression('neutral');
  };

  // =============================================================================
  // Phase 3: Info Collection
  // =============================================================================
  const handleAnswer = useCallback((questionId: string, answer: string | string[]) => {
    setProfile((prev) => {
      const next = { ...prev };
      switch (questionId) {
        case 'name':
          next.name = answer as string;
          break;
        case 'age':
          next.age = answer as string;
          break;
        case 'gender':
          next.gender = answer as string;
          break;
        case 'mbti':
          next.mbti = answer as string;
          break;
        case 'zodiac':
          next.zodiac = answer as string;
          break;
        case 'interests':
          next.interests = answer as string[];
          break;
        case 'field':
          next.field = answer as string[];
          break;
        case 'platforms':
          next.platforms = answer as string[];
          break;
        case 'games':
          next.games = answer as string;
          break;
        case 'goals':
          next.goals = answer as string[];
          break;
      }
      return next;
    });

    // Move to next question after a short delay
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => {
        const next = prev + 1;
        if (next >= INFO_BUBBLES.length) {
          // All questions answered - transition to confirmation
          setBrokerExpression('happy');
          setTimeout(() => {
            // Save profile
            localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({ ...profile, [questionId]: answer }));
            setPhase('confirmation');
          }, 500);
        }
        return next;
      });

      // Cycle broker expressions
      const expressions: Array<'neutral' | 'happy' | 'thinking' | 'surprise'> = ['neutral', 'happy', 'thinking', 'surprise'];
      setBrokerExpression(expressions[Math.floor(Math.random() * expressions.length)]);
    }, 400);
  }, [profile]);

  const handleSkip = useCallback((_questionId: string) => {
    setCurrentQuestionIndex((prev) => {
      const next = prev + 1;
      if (next >= INFO_BUBBLES.length) {
        setTimeout(() => {
          localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
          setPhase('confirmation');
        }, 500);
      }
      return next;
    });
  }, [profile]);

  // =============================================================================
  // Phase 4: Confirmation
  // =============================================================================
  const handleEnterPlanet = () => {
    // Save final profile
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    // Navigate to hub
    navigate('/hub');
  };

  // Show profile preview after a delay in confirmation phase
  useEffect(() => {
    if (phase === 'confirmation') {
      const timer = setTimeout(() => setShowCompletionCert(true), 300);
      const profileTimer = setTimeout(() => setShowProfile(true), 1500);
      return () => {
        clearTimeout(timer);
        clearTimeout(profileTimer);
      };
    }
  }, [phase]);

  // =============================================================================
  // Broker expression CSS filters
  // =============================================================================
  const getBrokerFilter = () => {
    switch (brokerExpression) {
      case 'happy':
        return 'brightness(1.1) contrast(1.05) saturate(1.1)';
      case 'thinking':
        return 'brightness(0.95) contrast(1.02) hue-rotate(5deg)';
      case 'surprise':
        return 'brightness(1.15) contrast(1.1) saturate(1.2)';
      default:
        return 'brightness(1) contrast(1)';
    }
  };

  // =============================================================================
  // Determine current step number for progress indicator
  // =============================================================================
  const currentStepNumber =
    phase === 'warp' ? 1 :
    phase === 'broker-intro' ? 2 :
    phase === 'info-collection' ? 3 :
    4;

  // =============================================================================
  // Celebration particles (for confirmation phase)
  // =============================================================================
  const celebrationParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * 360 + Math.random() * 20,
    distance: 100 + Math.random() * 200,
    color: ['#00F0FF', '#FFD700', '#FF2A6D', '#39FF14', '#BD00FF'][i % 5],
    size: 2 + Math.random() * 4,
    delay: Math.random() * 0.5,
  }));

  // =============================================================================
  // Render
  // =============================================================================
  return (
    <div ref={containerRef} className="min-h-[100dvh] bg-void relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Subtle scanline overlay */}
      <div className="scanline-overlay" />

      {/* Phase 1: Warp Tunnel */}
      <AnimatePresence>
        {phase === 'warp' && (
          <WarpTunnel onComplete={handleWarpComplete} />
        )}
      </AnimatePresence>

      {/* Main content (phases 2-4) */}
      {phase !== 'warp' && (
        <div className="relative z-10 min-h-[100dvh] flex flex-col">
          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProgressIndicator currentStep={currentStepNumber} />
          </motion.div>

          {/* Phase 2: Broker Introduction */}
          <AnimatePresence mode="wait">
            {phase === 'broker-intro' && (
              <motion.div
                key="broker-intro"
                className="flex-1 flex flex-col items-center justify-center px-4 pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                {/* Broker standing illustration - large, centered */}
                <motion.div
                  className="relative flex-shrink-0"
                  initial={{ y: 100, scale: 0.9, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  {/* Background glow circle */}
                  <div
                    className="absolute inset-0 rounded-full opacity-30 animate-pulse"
                    style={{
                      background: `radial-gradient(circle, ${BROKER_COLOR[brokerGender]}40 0%, transparent 70%)`,
                      transform: 'scale(1.5)',
                      filter: 'blur(30px)',
                    }}
                  />

                  {/* Broker image */}
                  <motion.img
                    src={BROKER_AVATAR[brokerGender]}
                    alt={BROKER_NAME[brokerGender]}
                    className="relative z-10 h-[45vh] md:h-[55vh] w-auto object-contain drop-shadow-2xl"
                    style={{
                      filter: getBrokerFilter(),
                      // Using CSS drop-shadow-2xl class instead
                    }}
                    animate={{
                      y: brokerExpression === 'happy' ? [0, -5, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Floating particles around broker */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        background: BROKER_COLOR[brokerGender],
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -20 - Math.random() * 20, 0],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </motion.div>

                {/* Broker name */}
                <motion.div
                  className="text-center mt-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <h2
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: BROKER_COLOR[brokerGender] }}
                  >
                    {BROKER_NAME[brokerGender]}
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">你的专属 MCN 经纪人</p>
                </motion.div>

                {/* Dialogue bubble with typewriter */}
                <AnimatePresence>
                  {showDialogue && (
                    <motion.div
                      className="w-full max-w-[560px] mx-auto"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.2, type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <div className="flex justify-center mb-[-1px]">
                        <div
                          className="w-4 h-4 rotate-45"
                          style={{
                            background: 'var(--void-light)',
                            borderLeft: `1px solid ${BROKER_COLOR[brokerGender]}40`,
                            borderTop: `1px solid ${BROKER_COLOR[brokerGender]}40`,
                          }}
                        />
                      </div>
                      <div
                        className="rounded-2xl p-5 md:p-6"
                        style={{
                          background: 'var(--void-light)',
                          border: `1px solid ${BROKER_COLOR[brokerGender]}40`,
                          boxShadow: `0 0 20px ${BROKER_COLOR[brokerGender]}20`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={BROKER_AVATAR[brokerGender]}
                            alt="broker"
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 border"
                            style={{ borderColor: BROKER_COLOR[brokerGender] }}
                          />
                          <p className="text-text-primary text-sm md:text-base leading-relaxed whitespace-pre-line">
                            {dialogueText}
                            <span className="animate-pulse text-neon-cyan">|</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Start button appears after typewriter finishes */}
                <AnimatePresence>
                  {dialogueText.length > 80 && (
                    <motion.button
                      className="mt-6 px-8 py-3 text-void font-bold text-base btn-cyber btn-sweep flex items-center gap-2"
                      style={{ background: BROKER_COLOR[brokerGender] }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${BROKER_COLOR[brokerGender]}60` }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStartInfoCollection}
                    >
                      好的，开始吧！
                      <ArrowRight size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3: Info Collection */}
          <AnimatePresence mode="wait">
            {phase === 'info-collection' && (
              <motion.div
                key="info-collection"
                className="flex-1 flex flex-col md:flex-row items-stretch overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Left: Large broker illustration (desktop) / Top: smaller broker (mobile) */}
                <div className="hidden md:flex md:w-[45%] lg:w-[40%] items-end justify-center relative p-6">
                  {/* Background glow */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full opacity-20"
                    style={{
                      background: `radial-gradient(ellipse, ${BROKER_COLOR[brokerGender]}60 0%, transparent 70%)`,
                      filter: 'blur(40px)',
                    }}
                  />

                  <motion.img
                    src={BROKER_AVATAR[brokerGender]}
                    alt={BROKER_NAME[brokerGender]}
                    className="relative z-10 h-[70vh] w-auto object-contain"
                    style={{
                      filter: getBrokerFilter(),
                      maxHeight: '75vh',
                    }}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Floating particles */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        background: BROKER_COLOR[brokerGender],
                        left: `${10 + Math.random() * 80}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -15 - Math.random() * 15, 0],
                        opacity: [0.2, 0.6, 0.2],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Mobile broker image (small, top) */}
                <div className="md:hidden flex justify-center pt-4 pb-2 relative">
                  <motion.img
                    src={BROKER_AVATAR[brokerGender]}
                    alt={BROKER_NAME[brokerGender]}
                    className="h-[25vh] w-auto object-contain"
                    style={{ filter: getBrokerFilter() }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  />
                  {/* Small glow */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] rounded-full opacity-20"
                    style={{
                      background: `radial-gradient(ellipse, ${BROKER_COLOR[brokerGender]}60 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                    }}
                  />
                </div>

                {/* Right: Dialogue + Info Bubbles */}
                <div className="flex-1 flex flex-col justify-end p-4 md:p-6 md:pb-8 overflow-y-auto">
                  {/* Question counter */}
                  <div className="text-center mb-4">
                    <span
                      className="text-xs font-mono px-3 py-1 rounded-full"
                      style={{
                        background: `${BROKER_COLOR[brokerGender]}15`,
                        color: BROKER_COLOR[brokerGender],
                        border: `1px solid ${BROKER_COLOR[brokerGender]}30`,
                      }}
                    >
                      {currentQuestionIndex + 1} / {INFO_BUBBLES.length}
                    </span>
                  </div>

                  {/* Info Bubble */}
                  {currentQuestionIndex < INFO_BUBBLES.length && (
                    <InfoBubble
                      key={INFO_BUBBLES[currentQuestionIndex].id}
                      data={INFO_BUBBLES[currentQuestionIndex]}
                      brokerGender={brokerGender}
                      onAnswer={handleAnswer}
                      onSkip={handleSkip}
                      visible={true}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 4: Confirmation */}
          <AnimatePresence mode="wait">
            {phase === 'confirmation' && (
              <motion.div
                key="confirmation"
                className="flex-1 overflow-y-auto px-4 py-6 md:py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Celebration particles */}
                <div className="fixed inset-0 pointer-events-none z-0">
                  {celebrationParticles.map((p) => (
                    <motion.div
                      key={p.id}
                      className="absolute rounded-full"
                      style={{
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        left: '50%',
                        top: '40%',
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                        y: Math.sin((p.angle * Math.PI) / 180) * p.distance - 100,
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{
                        duration: 2,
                        delay: p.delay,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </div>

                <div className="max-w-[900px] mx-auto relative z-10">
                  {/* Completion Certificate */}
                  <AnimatePresence>
                    {showCompletionCert && (
                      <motion.div
                        className="max-w-[480px] mx-auto"
                        initial={{ scale: 0.5, rotate: -5, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      >
                        <div
                          className="relative rounded-2xl p-8 md:p-10 text-center overflow-hidden"
                          style={{
                            background: 'var(--void-light)',
                            border: '3px solid transparent',
                            backgroundClip: 'padding-box',
                            boxShadow: '0 0 30px rgba(255,215,0,0.2), inset 0 0 30px rgba(255,215,0,0.05)',
                          }}
                        >
                          {/* Gold shimmer border overlay */}
                          <div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                              background: 'linear-gradient(90deg, #FFD700, #FFF5B0, #FFD700, #FFF5B0, #FFD700)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 3s linear infinite',
                              padding: '3px',
                              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                              WebkitMaskComposite: 'xor',
                              maskComposite: 'exclude',
                            }}
                          />

                          {/* Corner decorations */}
                          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                            <div
                              key={i}
                              className={`absolute ${pos} w-6 h-6`}
                              style={{
                                border:
                                  i < 2
                                    ? `${pos.includes('left') ? '2px solid transparent transparent transparent #FFD700' : '2px solid transparent #FFD700 transparent transparent'}`
                                    : `${pos.includes('left') ? '2px solid transparent transparent transparent #FFD700' : '2px solid transparent #FFD700 transparent transparent'}`,
                              }}
                            />
                          ))}

                          {/* Title */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Star size={32} className="text-neon-gold mx-auto mb-3" />
                            <h2 className="text-xl md:text-2xl font-bold text-neon-gold mb-2">
                              创客星球入驻证书
                            </h2>
                          </motion.div>

                          {/* Divider */}
                          <motion.div
                            className="w-3/4 h-px mx-auto my-4"
                            style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          />

                          {/* Avatar */}
                          <motion.div
                            className="relative inline-block mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                          >
                            <div
                              className="w-20 h-20 rounded-full p-0.5 mx-auto"
                              style={{
                                background: 'linear-gradient(135deg, #FFD700, #FF2A6D, #00F0FF)',
                              }}
                            >
                              <div className="w-full h-full rounded-full overflow-hidden bg-void flex items-center justify-center">
                                <img
                                  src="/avatar-default.png"
                                  alt={profile.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <motion.div
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-neon-gold flex items-center justify-center"
                              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                            >
                              <Sparkles size={14} className="text-void" />
                            </motion.div>
                          </motion.div>

                          {/* User name */}
                          <motion.h3
                            className="text-lg font-bold text-text-primary mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                          >
                            {profile.name || '新创客'}
                          </motion.h3>

                          {/* Welcome message */}
                          <motion.p
                            className="text-sm text-text-secondary leading-relaxed mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                          >
                            欢迎 <span className="text-neon-cyan font-medium">{profile.name || '新创客'}</span> 正式成为
                            <br />
                            PCG-创客星球的第 <span className="text-neon-gold font-mono font-bold">{Math.floor(Math.random() * 9000) + 1000}</span> 位创客官！
                          </motion.p>

                          {/* Broker signature */}
                          <motion.div
                            className="flex items-center justify-center gap-2 text-xs text-text-secondary mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                          >
                            <img
                              src={BROKER_AVATAR[brokerGender]}
                              alt="broker"
                              className="w-5 h-5 rounded-full object-cover"
                              style={{ border: `1px solid ${BROKER_COLOR[brokerGender]}` }}
                            />
                            <span>
                              你的经纪人 <span style={{ color: BROKER_COLOR[brokerGender] }}>{BROKER_NAME[brokerGender]}</span>
                            </span>
                          </motion.div>

                          {/* Date */}
                          <motion.p
                            className="text-[10px] text-text-muted font-mono mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                          >
                            {new Date().toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </motion.p>
                        </div>

                        {/* Stats capsules */}
                        <motion.div
                          className="flex items-center justify-center gap-3 mt-4"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          {[
                            { icon: StatsFileText, label: '已完成信息', value: '10/10', color: '#00F0FF' },
                            { icon: StatsTrophy, label: '入驻奖励', value: '+100 XP', color: '#39FF14' },
                            { icon: StatsCoin, label: '获得金币', value: '+50', color: '#FFD700' },
                          ].map((stat, i) => (
                            <motion.div
                              key={i}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                              style={{
                                background: `${stat.color}15`,
                                border: `1px solid ${stat.color}30`,
                              }}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 1.3 + i * 0.1 }}
                            >
                              <stat.icon size={12} style={{ color: stat.color }} />
                              <span className="text-[10px]" style={{ color: stat.color }}>
                                {stat.value}
                              </span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Profile Preview */}
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        className="mt-8"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <p className="text-center text-text-secondary text-sm mb-4">
                          你的个人主页预览
                        </p>
                        <ProfilePreview
                          userProfile={profile}
                          brokerGender={brokerGender}
                          userId={userId}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enter Planet Button */}
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        className="flex justify-center mt-8 mb-8"
                        initial={{ y: 30, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <motion.button
                          className="px-10 py-4 text-void font-bold text-lg btn-cyber-lg btn-sweep flex items-center gap-3"
                          style={{
                            background: 'linear-gradient(90deg, #FFD700, #FFF5B0, #FFD700)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s linear infinite',
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: '0 0 40px rgba(255,215,0,0.5)',
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleEnterPlanet}
                        >
                          <Rocket size={20} />
                          进入创客星球
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Icon components used inline for stats
function StatsFileText({ size, style }: { size: number; style?: React.CSSProperties }) {
  return <FileText size={size} style={style} />;
}
function StatsTrophy({ size, style }: { size: number; style?: React.CSSProperties }) {
  return <Trophy size={size} style={style} />;
}
function StatsCoin({ size, style }: { size: number; style?: React.CSSProperties }) {
  return <Coins size={size} style={style} />;
}
