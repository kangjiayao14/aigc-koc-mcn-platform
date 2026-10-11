import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { glmChat } from '@/services/glmClient';
import {
  Brain,
  MessageCircle,
  Plus,
  X,
  Send,
  Sparkles,
  Users,
  Zap,
  ChevronLeft,
  Clock,
  Hash,
  Award,
  Flame,
  Star,
  Bookmark,
  TrendingUp,
  Gem,
  Lightbulb,
  Megaphone,
  Heart,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIPersonality {
  id: string;
  name: string;
  realName: string;
  tags: string[];
  expertise: string;
  description: string;
  color: string;
  borderColor: string;
  avatar: string;
  style: string;
  systemPrompt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  content: string;
  timestamp: number;
  type: 'user' | 'ai' | 'system';
  avatar: string;
}

interface DiscussionGroup {
  id: string;
  topic: string;
  messages: ChatMessage[];
  participants: string[];
  createdAt: number;
  summary?: string;
}

interface DistillForm {
  name: string;
  reference: string;
  style: string;
}

// ---------------------------------------------------------------------------
// Preset AI Personalities (10 personalities as specified in requirements)
// ---------------------------------------------------------------------------

const PRESET_PERSONAS: AIPersonality[] = [
  {
    id: 'lixiaolai',
    name: '李笑来思维',
    realName: '李笑来',
    tags: ['区块链', '投资'],
    expertise: '区块链/投资思维',
    description: '长期价值投资的坚定信仰者，擅长用简单语言解释复杂概念，强调思考能力的复利效应。',
    color: '#00F0FF',
    borderColor: 'rgba(0,240,255,0.4)',
    avatar: '李',
    style: '理性、直击本质、喜欢用类比',
    systemPrompt:
      '你是李笑来。语气冷静、坚定、略带“导师感”，擅长用类比把复杂问题讲到“可执行”。表达习惯：先下判断，再说原因，再给步骤。高频句式：“你要知道…/本质上…/别着急…”。你讨厌空话、鸡汤、情绪输出。回答必须围绕内容创作增长：给1个核心判断+3条可执行动作+1条长期主义提醒。字数120-220。',
  },
  {
    id: 'luozhenyu',
    name: '罗振宇表达',
    realName: '罗振宇',
    tags: ['知识付费', '跨年演讲'],
    expertise: '知识付费/跨年演讲风格',
    description: '知识服务创业者，跨年演讲四小时不间断，擅长把知识包装成故事，金句制造机。',
    color: '#FFD700',
    borderColor: 'rgba(255,215,0,0.4)',
    avatar: '罗',
    style: '故事驱动、金句频出、宏大叙事',
    systemPrompt:
      '你是罗振宇。节奏快、比喻多、金句密度高，擅长把知识装进“故事+场景”。表达结构：先抛一个故事钩子→提炼一个概念→给一个可复制的模板。高频句式：“我给你讲个故事…/关键在于…/你得把…”。回答围绕内容增长：给出一个“标题/开头/转折/结尾”的叙事模板，并附1句可直接复用的金句。字数140-240。',
  },
  {
    id: 'luoyonghao',
    name: '罗永浩辩论',
    realName: '罗永浩',
    tags: ['科技测评', '脱口秀'],
    expertise: '科技测评/脱口秀风格',
    description: '理想主义者的创业历程，犀利点评科技产品，相声式演讲风格，情怀与实力并存。',
    color: '#FF4500',
    borderColor: 'rgba(255,69,0,0.4)',
    avatar: '罗',
    style: '犀利、幽默、情怀满满、怼人精准',
    systemPrompt:
      '你是罗永浩。锋利、幽默、相声节奏，允许轻度嘲讽但不恶毒；你会把模糊建议讲成“能马上改”的改动。表达结构：先一句“说实话”式结论→列2-3个问题点→给出具体改法（最好带一句示例文案）。高频句式：“说实话…/我认真讲…/这事儿就得…”。字数140-240。',
  },
  {
    id: 'papajiang',
    name: 'papi酱幽默',
    realName: 'papi酱',
    tags: ['短视频', '搞笑'],
    expertise: '短视频/搞笑风格',
    description: '短视频女王，一人分饰多角的喜剧表演，精准吐槽日常生活，节奏感极强的剪辑风格。',
    color: '#FF2A6D',
    borderColor: 'rgba(255,42,109,0.4)',
    avatar: 'P',
    style: '快节奏吐槽、变声演绎、贴近生活',
    systemPrompt:
      '你是papi酱。快节奏吐槽+生活观察+反转（括号补充），像在对镜头说话。表达结构：先吐槽一个“大家都这样”的痛点→反转一下→给出3个能立刻拍/写的点子（包含镜头/台词/节奏）。高频句式：“你们懂吗…/我真的会谢…/（重点来了）”。字数140-240。',
  },
  {
    id: 'liziqi',
    name: '李子柒美学',
    realName: '李子柒',
    tags: ['田园', '治愈'],
    expertise: '田园/治愈/视觉风格',
    description: '田园生活美学的全球传播者，无声胜有声的视觉叙事，东方美学的极致呈现。',
    color: '#39FF14',
    borderColor: 'rgba(57,255,20,0.4)',
    avatar: '李',
    style: '静谧、治愈、视觉优先、少即是多',
    systemPrompt:
      '你是李子柒。语言克制、画面感强、情绪细腻，不喊口号。你会把内容建议讲成“镜头表+声音表+情绪曲线”。表达结构：一句氛围开场→给3个关键镜头（光/手部/质感）→给一条节奏建议→给一句收尾文案（短）。字数120-220。',
  },
  {
    id: 'hexuetong',
    name: '何同学科技',
    realName: '何同学',
    tags: ['科技测评', '视觉特效'],
    expertise: '科技测评/视觉特效风格',
    description: 'Z世代科技顶流，把枯燥的科技测评变成视觉盛宴，后期特效与内容完美融合。',
    color: '#00D4FF',
    borderColor: 'rgba(0,212,255,0.4)',
    avatar: '何',
    style: '年轻活力、视觉惊艳、真诚表达',
    systemPrompt:
      '你是何同学。真诚、不端着，用“实验/对比/镜头”讲清楚一个点。表达结构：先说“我们做个小实验”→给对比维度→解释为什么重要→给视频结构（分镜/字幕/数据呈现）。高频句式：“我们做个小实验…/我觉得最重要的是…”。字数140-240。',
  },
  {
    id: 'banfo',
    name: '半佛仙人分析',
    realName: '半佛仙人',
    tags: ['财经', '互联网'],
    expertise: '财经/互联网分析风格',
    description: '用段子的方式讲财经，表情包满屏飞，在幽默中完成认知升级，风险控制鼓吹者。',
    color: '#BD00FF',
    borderColor: 'rgba(189,0,255,0.4)',
    avatar: '半',
    style: '段子手、表情包叙事、反套路',
    systemPrompt:
      '你是半佛仙人。先结论后拆本质，段子化表达但逻辑很硬，带风险提示（狗头）。表达结构：一句结论→拆3层“为什么”→给2个可执行动作→最后来一句风险提示。语言可以插入“懂我意思吧/这事儿吧/别上头”。字数140-240。',
  },
  {
    id: 'xinhua',
    name: '新华社官方',
    realName: '新华社',
    tags: ['新闻', '权威'],
    expertise: '新闻/权威/简洁风格',
    description: '国家级通讯社风格，简洁有力的信息传递，权威信源背书，客观中立的叙事立场。',
    color: '#DC143C',
    borderColor: 'rgba(220,20,60,0.4)',
    avatar: '新',
    style: '简洁、权威、客观、信息密度高',
    systemPrompt:
      '你是新华社风格的编辑。客观、中立、信息密度高，避免夸张修辞与网络梗。表达结构：一句导语→3条要点→1条延展建议（可引用权威口径但不编造来源）。适合“公告/解读/科普/辟谣”式内容。字数120-220。',
  },
  {
    id: 'dongyuhui',
    name: '董宇辉带货',
    realName: '董宇辉',
    tags: ['直播带货', '文艺'],
    expertise: '直播带货/文艺风格',
    description: '知识型带货主播，从英语教学到农产品带货，出口成章的文案能力，文化人卖货。',
    color: '#9370DB',
    borderColor: 'rgba(147,112,219,0.4)',
    avatar: '董',
    style: '文艺、诗意、知识型带货、情感共鸣',
    systemPrompt:
      '你是董宇辉。文艺、有画面、会讲知识类比，但最后一定落到“这东西为什么值得”。表达结构：先抛一个生活场景→把卖点讲成情绪→补一段小知识/典故类比→给一句能直接用的带货式收尾。高频句式：“你想想…/这就是…”。字数140-240。',
  },
  {
    id: 'shougonggeng',
    name: '手工耿创意',
    realName: '手工耿',
    tags: ['脑洞', '手工'],
    expertise: '脑洞/手工/创意风格',
    description: '"无用发明家"，把奇思妙想变成现实，看似无用的发明背后是无尽的创造力。',
    color: '#FFA500',
    borderColor: 'rgba(255,165,0,0.4)',
    avatar: '耿',
    style: '脑洞大开、幽默自嘲、创意无限',
    systemPrompt:
      '你是手工耿。脑洞大、反差强、自嘲，能把想法落成“装置/流程/道具”。表达结构：先提出一个无用但好笑的“发明”→说清楚材料/步骤→指出拍摄看点（危险镜头/失败镜头/反转）→最后自嘲一句。高频句式：“我又发明了…/虽然没什么用…”。字数140-240。',
  },
];

// ---------------------------------------------------------------------------
// Mock discussion history
// ---------------------------------------------------------------------------

const MOCK_HISTORY: DiscussionGroup[] = [
  {
    id: 'hist-1',
    topic: '咖啡探店文案优化',
    participants: ['文案鬼才', '科技小V', '生活家阿雅'],
    createdAt: Date.now() - 86400000 * 2,
    summary: '1. 标题需更具吸引力 2. 增加数据支撑 3. 加入人情味元素 4. 添加变现引导',
    messages: [],
  },
  {
    id: 'hist-2',
    topic: '科技产品测评脚本',
    participants: ['何同学科技', '半佛仙人分析', '罗永浩辩论'],
    createdAt: Date.now() - 86400000,
    summary: '1. 开场3秒抓住注意力 2. 用对比实验增强说服力 3. 结尾加入互动提问',
    messages: [],
  },
  {
    id: 'hist-3',
    topic: '品牌小红书种草文案',
    participants: ['papi酱幽默', '李子柒美学', '董宇辉带货'],
    createdAt: Date.now() - 3600000 * 5,
    summary: '1. 视觉描述要具体 2. 情感共鸣比功能介绍更重要 3. 善用场景化表达',
    messages: [],
  },
];

// ---------------------------------------------------------------------------
// Mock AI responses for chat simulation
// ---------------------------------------------------------------------------

const MOCK_RESPONSES: Record<string, string[]> = {
  lixiaolai: [
    '从投资的角度看，你要关注这件事的长期价值，而不是短期热度。想清楚十年后它还重要吗？',
    '思考能力是有复利效应的。每天进步1%，一年后你会强大37倍。内容创作也是如此。',
    '很多人都追求捷径，但真正有价值的往往是那些看似简单却需要持续做的事。',
  ],
  luozhenyu: [
    '这个故事的角度很有意思。让我给你讲一个类比——你知道达尔文雀吗？不同岛屿上的雀鸟演化出了不同的喙...',
    '我有一个金句送给你：在变化的时代，唯一确定的就是变化本身。你的内容要传递这种确定性。',
    '知识的魅力在于连接。你把两个看似无关的领域连接起来，就是创新。',
  ],
  luoyonghao: [
    '说实话，这个切入点我不太认同。你要是真想做科技内容，就不能这么软，得有硬货。',
    '我给大家表演一个「相声贯口」式的参数对比...看，这样观众既乐了又记住了。',
    '情怀是加分项，但不是免死金牌。产品不好，情怀救不了你。内容同理。',
  ],
  papajiang: [
    '哈哈哈哈哈这个选题我笑死！你们知道我最烦什么吗？就是这种明明很普通却要装高级的内容！',
    '（变声）哦~我的上帝啊~这简直比我妈催婚还要让人窒息！',
    '我跟你们说，这种内容要是发出去，评论区肯定清一色的「哈哈哈」或者「真实了」。',
  ],
  liziqi: [
    '有时候，安静的力量比喧哗更动人。试着让画面自己说话。',
    '四季更迭，万物有灵。把这份感知融入你的内容，观众会感受到的。',
    '不需要太多语言，一盏灯、一缕烟、一个背影，就是最好的故事。',
  ],
  hexuetong: [
    '这个视觉效果我可以帮你实现！用After Effects的粒子系统，配合这个配色方案...',
    '作为一个科技博主，我觉得数据可视化是核心竞争力。让观众一眼看懂复杂概念。',
    '我试了一下你说的这个功能，实机体验是...（拿出设备开始演示）',
  ],
  banfo: [
    '朋友们，这件事的本质是什么？是韭菜不够用了啊！（表情包：狗头保命）',
    '我翻开历史一查，这历史没有年代，歪歪斜斜的每页上都写着「流量密码」几个字...',
    '风险提示：以上内容不构成任何投资建议。亏了别找我，赚了记得V我50。',
  ],
  xinhua: [
    '据本社记者从多方渠道了解到，当前内容创作领域呈现以下趋势...',
    '该数据显示，2024年优质内容创作者的平均收益同比增长23.6%，行业发展态势良好。',
    '本社评：内容创作应坚持正确的价值导向，传播正能量，弘扬主旋律。',
  ],
  dongyuhui: [
    '我没有带你去看过长白山皑皑的白雪，没有带你感受过十月田间吹过的微风...但我要把最好的内容带给你。',
    '知识就像烛光，不会因为分享而减少，反而会照亮更多的人。',
    '当你背单词时，阿拉斯加的鳕鱼正跃出水面。当你创作内容时，有人在屏幕前被你的文字治愈。',
  ],
  shougonggeng: [
    '我发明了一个「自动点赞机」，只要把它架在手机上，就能自动给好内容点赞！（虽然没什么用）',
    '这个创意不错！让我想想能不能做一个「脑暴辅助器」，把天马行空的想法变成现实...',
    ' usefulness is overrated! 有用的东西千篇一律，无用的发明万里挑一！',
  ],
};

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function generateId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (mins > 0) return `${mins}分钟前`;
  return '刚刚';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** PersonaAvatar - Renders a colored circle with initial */
function PersonaAvatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}88, ${color}44)`,
        border: `2px solid ${color}`,
        fontSize: size * 0.4,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

/** DistillModal - Custom personality creation modal */
function DistillModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: AIPersonality) => void }) {
  const [form, setForm] = useState<DistillForm>({ name: '', reference: '', style: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!form.name.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const newPersona: AIPersonality = {
        id: generateId(),
        name: form.name,
        realName: form.reference || form.name,
        tags: ['自定义'],
        expertise: form.reference || '自定义领域',
        description: form.style || `基于${form.reference || '用户输入'}蒸馏的AI人格`,
        color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`,
        borderColor: 'rgba(0,240,255,0.4)',
        avatar: form.name.charAt(0),
        style: form.style || '自定义风格',
        systemPrompt: `你是${form.reference || form.name}风格的专家。请严格遵循以下风格描述回复：${form.style || '自定义风格'}。回复50-150字。`,
      };
      onCreate(newPersona);
      setIsGenerating(false);
      onClose();
    }, 2000);
  }, [form, onCreate, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-xl border border-neon-cyan/30 bg-void-light p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-neon-cyan" />
            <h3 className="text-lg font-bold text-text-primary">蒸馏新人格</h3>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        {isGenerating ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-neon-cyan/20 border-t-neon-cyan"
            />
            <p className="text-text-secondary">AI正在分析风格特征...</p>
            <div className="flex gap-2 text-xs text-text-muted">
              <span>提取语言模式</span>
              <span>→</span>
              <span>构建思维框架</span>
              <span>→</span>
              <span>生成人格模型</span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">人格名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="例如：笑来思维"
                  className="w-full px-4 py-2.5 rounded-lg bg-void border border-white/10 text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">参考大V（可选）</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                  placeholder="例如：李笑来、罗永浩..."
                  className="w-full px-4 py-2.5 rounded-lg bg-void border border-white/10 text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">风格描述</label>
                <textarea
                  value={form.style}
                  onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                  placeholder="描述这个人的语言风格、思维特点..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-void border border-white/10 text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-colors"
              >
                取消
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!form.name.trim()}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-neon-cyan text-void disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-cyan transition-all"
              >
                开始蒸馏
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/** ChatRoom - QQ group style discussion interface */
function ChatRoom({
  persona,
  onBack,
}: {
  persona: AIPersonality;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [topic, setTopic] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [availablePosts, setAvailablePosts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestSeqRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize chat with system message and first AI response
  useEffect(() => {
    const systemMsg: ChatMessage = {
      id: generateId(),
      senderId: 'system',
      senderName: '系统',
      senderColor: '#8A8AA0',
      content: `欢迎进入「${persona.name}」研讨群！发送内容开始讨论，AI专家将围绕你的内容展开深入研讨。`,
      timestamp: Date.now(),
      type: 'system',
      avatar: '',
    };
    setMessages([systemMsg]);

    // Simulate first AI greeting
    const timer = setTimeout(() => {
      const responses = MOCK_RESPONSES[persona.id];
      if (responses) {
        const greeting: ChatMessage = {
          id: generateId(),
          senderId: persona.id,
          senderName: persona.name,
          senderColor: persona.color,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: Date.now(),
          type: 'ai',
          avatar: persona.avatar,
        };
        setMessages((prev) => [...prev, greeting]);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [persona]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pcg_posts');
      const parsed = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
      setAvailablePosts(arr.slice(0, 20));
    } catch {
      setAvailablePosts([]);
    }
  }, []);

  const usageKey = 'pcg_workshop_daily_calls';
  const dailyLimit = 30;

  const consumeCalls = useCallback((n: number) => {
    try {
      const raw = localStorage.getItem(usageKey);
      const parsed = raw ? (JSON.parse(raw) as { date?: string; count?: number }) : {};
      const date = parsed.date === todayISO() ? parsed.date : todayISO();
      const count = parsed.date === todayISO() ? (parsed.count ?? 0) : 0;
      const remaining = Math.max(0, dailyLimit - count);
      const take = Math.min(n, remaining);
      if (take > 0) {
        localStorage.setItem(usageKey, JSON.stringify({ date, count: count + take }));
      }
      return take;
    } catch {
      return 0;
    }
  }, []);

  const getFallbackReply = useCallback((personaId: string) => {
    const responses = MOCK_RESPONSES[personaId];
    if (responses?.length) return responses[Math.floor(Math.random() * responses.length)];
    return '我先给你一个方向：把结论提前、结构变短、用一个具体场景开头，会更抓人。';
  }, []);

  const addMessage = useCallback((content: string, type: 'user' | 'ai' | 'system', sender?: AIPersonality) => {
    const aiSender = sender || persona;
    const msg: ChatMessage = {
      id: generateId(),
      senderId: type === 'user' ? 'user' : type === 'system' ? 'system' : aiSender.id,
      senderName: type === 'user' ? '你' : type === 'system' ? '系统' : aiSender.name,
      senderColor: type === 'user' ? '#00F0FF' : type === 'system' ? '#8A8AA0' : aiSender.color,
      content,
      timestamp: Date.now(),
      type,
      avatar: type === 'user' ? '我' : type === 'system' ? '' : aiSender.avatar,
    };
    setMessages((prev) => [...prev, msg]);
  }, [persona]);

  const respondFromPersona = useCallback(async (userMessage: string, reqSeq: number) => {
    setIsTyping(true);
    const topicText = topic ? `讨论主题：${topic}` : '讨论主题：未指定';
    const post = availablePosts.find((p) => String(p?.id) === String(selectedPostId));
    const postText = post
      ? `\n\n讨论作品：\n标题：${String(post?.title || '').trim()}\n平台：${String(post?.platform || '').trim()}\n正文：${String(post?.content || post?.text || '').trim()}\n标签：${Array.isArray(post?.tags) ? post.tags.join(' ') : ''}`
      : '';

    const canCall = consumeCalls(1) === 1;
    if (!canCall) {
      if (reqSeq !== requestSeqRef.current) return;
      addMessage(getFallbackReply(persona.id), 'ai', persona);
      setIsTyping(false);
      return;
    }

    try {
      const reply = await glmChat(
        persona.systemPrompt,
        `${topicText}${postText}\n用户：${userMessage}\n\n要求：给出具体、可执行的建议，必要时给一句可直接复用的示例文案。`,
        { temperature: 0.85, max_tokens: 520 }
      );
      if (reqSeq !== requestSeqRef.current) return;
      addMessage(reply, 'ai', persona);
    } catch {
      if (reqSeq !== requestSeqRef.current) return;
      addMessage(getFallbackReply(persona.id), 'ai', persona);
    } finally {
      if (reqSeq === requestSeqRef.current) setIsTyping(false);
    }
  }, [addMessage, availablePosts, consumeCalls, getFallbackReply, persona, selectedPostId, topic]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    addMessage(text, 'user');
    setInput('');
    const seq = ++requestSeqRef.current;
    await respondFromPersona(text, seq);
  }, [addMessage, input, isTyping, respondFromPersona]);

  const handleQuickTopic = useCallback(async (t: string) => {
    setTopic(t);
    const msg = `我想和大家讨论一下：「${t}」，请各位专家给出建议。`;
    addMessage(msg, 'user');
    const seq = ++requestSeqRef.current;
    await respondFromPersona(msg, seq);
  }, [addMessage, respondFromPersona]);

  const handleGenerateSummary = useCallback(async () => {
    if (isSummarizing) return;
    setShowSummary(true);
    setIsSummarizing(true);
    setSummaryText('生成中…');

    const post = availablePosts.find((p) => String(p?.id) === String(selectedPostId));
    const postText = post
      ? `\n\n讨论作品：\n标题：${String(post?.title || '').trim()}\n平台：${String(post?.platform || '').trim()}\n正文：${String(post?.content || post?.text || '').trim()}\n标签：${Array.isArray(post?.tags) ? post.tags.join(' ') : ''}`
      : '';

    const transcript = messages
      .filter((m) => m.type !== 'system')
      .slice(-30)
      .map((m) => `${m.type === 'user' ? '用户' : m.senderName}：${m.content}`)
      .join('\n');

    try {
      const system =
        `你是资深内容策略师，同时保持以下人格风格：${persona.realName}（${persona.style}）。` +
        `请对这次研讨做“深度蒸馏”，输出结构化中文，不要空话。\n` +
        `输出包含：\n` +
        `1) 一句话结论\n` +
        `2) 诊断（3条）\n` +
        `3) 可执行动作（7天计划：Day1~Day7，每天1条）\n` +
        `4) 具体改稿（给出：一个更强标题 + 一个更强开头 + 3个可拍/可写的内容角度）\n` +
        `5) 风险与禁忌（3条）\n` +
        `字数 280-520。`;
      const user = `主题：${topic || '未指定'}${postText}\n\n对话记录：\n${transcript}`;
      const res = await glmChat(system, user, { temperature: 0.6, max_tokens: 900 });
      setSummaryText(res);
      addMessage(`📋 已生成蒸馏总结（可在下方查看）。`, 'system');
    } catch {
      setSummaryText('生成失败了，请稍后重试。');
    } finally {
      setIsSummarizing(false);
    }
  }, [addMessage, availablePosts, isSummarizing, messages, persona, selectedPostId, topic]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="flex flex-col h-[calc(100dvh-72px)] bg-void">
      {/* Chat Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-white/5 bg-void-light/50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-1 text-text-secondary hover:text-neon-cyan transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">返回</span>
        </motion.button>

        <PersonaAvatar name={persona.avatar} color={persona.color} size={36} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary text-sm">{persona.name}研讨群</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: `${persona.color}22`, color: persona.color, border: `1px solid ${persona.color}44` }}
            >
              研讨中
            </span>
          </div>
          <div className="text-xs text-text-muted truncate">
            {persona.expertise} · {persona.style}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateSummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-colors"
        >
          <Bookmark size={13} />
          <span className="hidden sm:inline">生成总结</span>
        </motion.button>
      </div>

      {availablePosts.length > 0 && (
        <div className="px-6 py-3 border-b border-white/5 bg-void/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-xs text-text-muted flex-shrink-0">讨论作品（可选）</div>
            <select
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-void border border-white/10 text-text-primary text-sm focus:outline-none focus:border-neon-cyan/40"
            >
              <option value="">不选择作品（仅对话）</option>
              {availablePosts.map((p) => (
                <option key={String(p?.id)} value={String(p?.id)}>
                  {String(p?.title || '未命名内容').slice(0, 30)} · {String(p?.platform || '')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Topic Input (shown when no topic set) */}
      {messages.length < 3 && !topic && (
        <div className="px-6 py-3 border-b border-white/5">
          <p className="text-xs text-text-muted mb-2">快速选择讨论主题：</p>
          <div className="flex flex-wrap gap-2">
            {['文案优化', '标题策划', '内容结构', '变现策略', '选题方向'].map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickTopic(t)}
                className="px-3 py-1.5 rounded-full text-xs bg-void-light border border-white/10 text-text-secondary hover:border-neon-cyan/30 hover:text-neon-cyan transition-colors"
              >
                <Hash size={11} className="inline mr-1" />
                {t}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className={msg.type === 'system' ? 'flex justify-center' : ''}
            >
              {msg.type === 'system' ? (
                <div className="px-4 py-2 rounded-full bg-neon-violet/10 border border-dashed border-neon-violet/30">
                  <span className="text-xs text-neon-violet">{msg.content}</span>
                </div>
              ) : msg.type === 'user' ? (
                <div className="flex justify-end gap-2">
                  <div className="max-w-[70%]">
                    <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-neon-cyan/15 border border-neon-cyan/30">
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-text-muted mt-1 block text-right">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan text-xs font-bold shrink-0 self-end">
                    我
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <PersonaAvatar name={msg.avatar} color={msg.senderColor} size={36} />
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium" style={{ color: msg.senderColor }}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-text-muted">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div
                      className="px-4 py-2.5 rounded-2xl rounded-tl-sm border"
                      style={{
                        background: `${msg.senderColor}11`,
                        borderColor: `${msg.senderColor}33`,
                      }}
                    >
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <PersonaAvatar name={persona.avatar} color={persona.color} size={36} />
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-void-light border border-white/10">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-neon-cyan/60"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Summary Panel */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-void-light/80 overflow-hidden"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neon-cyan">讨论总结</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(summaryText || '').catch(() => {});
                    }}
                    disabled={!summaryText || summaryText === '生成中…'}
                    className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors disabled:opacity-40"
                  >
                    复制
                  </button>
                  <button onClick={() => setShowSummary(false)} className="text-text-muted hover:text-text-primary">
                  <X size={14} />
                </button>
                </div>
              </div>
              <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                {summaryText || `本群围绕「${topic || '内容创作'}」进行了研讨。`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="px-4 sm:px-6 py-3 border-t border-white/5 bg-void-light/50">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入讨论内容，与AI专家互动..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-void border border-white/10 text-text-primary placeholder:text-text-muted text-sm focus:border-neon-cyan/50 focus:outline-none transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-neon-cyan text-void flex items-center justify-center disabled:opacity-30 hover:shadow-glow-cyan transition-all"
          >
            <Send size={16} />
          </motion.button>
        </div>
        <div className="flex items-center gap-4 mt-2 px-1">
          <span className="text-[10px] text-text-muted">按 Enter 发送</span>
          <span className="text-[10px] text-text-muted">|</span>
          <span className="text-[10px] text-text-muted">AI专家会模拟真实讨论风格</span>
        </div>
      </div>
    </div>
  );
}

function GroupChatRoom({
  participants,
  onBack,
  initialPostId,
}: {
  participants: AIPersonality[];
  onBack: () => void;
  initialPostId?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [topic, setTopic] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>(initialPostId || '');
  const [availablePosts, setAvailablePosts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestSeqRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pcg_posts');
      const parsed = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
      setAvailablePosts(arr.slice(0, 20));
    } catch {
      setAvailablePosts([]);
    }
  }, []);

  useEffect(() => {
    const systemMsg: ChatMessage = {
      id: generateId(),
      senderId: 'system',
      senderName: '系统',
      senderColor: '#8A8AA0',
      content: `已创建群聊研讨室：${participants.map((p) => p.name).join('、')}。发送内容开始讨论。`,
      timestamp: Date.now(),
      type: 'system',
      avatar: '',
    };
    setMessages([systemMsg]);
    const timer = setTimeout(() => {
      const first = participants[0];
      if (!first) return;
      const responses = MOCK_RESPONSES[first.id];
      const greeting: ChatMessage = {
        id: generateId(),
        senderId: first.id,
        senderName: first.name,
        senderColor: first.color,
        content: responses?.length ? responses[Math.floor(Math.random() * responses.length)] : '我先抛个问题：你想解决的是增长还是表达？我们可以从一个具体目标开始。',
        timestamp: Date.now(),
        type: 'ai',
        avatar: first.avatar,
      };
      setMessages((prev) => [...prev, greeting]);
    }, 1200);
    return () => clearTimeout(timer);
  }, [participants]);

  const usageKey = 'pcg_workshop_daily_calls';
  const dailyLimit = 40;

  const consumeCalls = useCallback((n: number) => {
    try {
      const raw = localStorage.getItem(usageKey);
      const parsed = raw ? (JSON.parse(raw) as { date?: string; count?: number }) : {};
      const date = parsed.date === todayISO() ? parsed.date : todayISO();
      const count = parsed.date === todayISO() ? (parsed.count ?? 0) : 0;
      const remaining = Math.max(0, dailyLimit - count);
      const take = Math.min(n, remaining);
      if (take > 0) {
        localStorage.setItem(usageKey, JSON.stringify({ date, count: count + take }));
      }
      return take;
    } catch {
      return 0;
    }
  }, []);

  const addMessage = useCallback((content: string, type: 'user' | 'ai' | 'system', sender?: AIPersonality) => {
    const msg: ChatMessage = {
      id: generateId(),
      senderId: type === 'user' ? 'user' : type === 'system' ? 'system' : sender?.id || 'ai',
      senderName: type === 'user' ? '你' : type === 'system' ? '系统' : sender?.name || 'AI',
      senderColor: type === 'user' ? '#00F0FF' : type === 'system' ? '#8A8AA0' : sender?.color || '#00F0FF',
      content,
      timestamp: Date.now(),
      type,
      avatar: type === 'user' ? '我' : type === 'system' ? '' : sender?.avatar || '',
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const getFallbackReply = useCallback((personaId: string) => {
    const responses = MOCK_RESPONSES[personaId];
    if (responses?.length) return responses[Math.floor(Math.random() * responses.length)];
    return '我先给你一个方向：把结论提前、结构变短、用一个具体场景开头，会更抓人。';
  }, []);

  const respondFromGroup = useCallback(async (userMessage: string, reqSeq: number) => {
    setIsTyping(true);
    const topicText = topic ? `讨论主题：${topic}` : '讨论主题：未指定';
    const post = availablePosts.find((p) => String(p?.id) === String(selectedPostId));
    const postText = post
      ? `\n\n讨论作品：\n标题：${String(post?.title || '').trim()}\n平台：${String(post?.platform || '').trim()}\n正文：${String(post?.content || post?.text || '').trim()}\n标签：${Array.isArray(post?.tags) ? post.tags.join(' ') : ''}`
      : '';

    for (const expert of participants) {
      if (reqSeq !== requestSeqRef.current) return;
      const canCall = consumeCalls(1) === 1;
      if (!canCall) {
        addMessage(getFallbackReply(expert.id), 'ai', expert);
        continue;
      }
      try {
        const reply = await glmChat(
          expert.systemPrompt,
          `${topicText}${postText}\n用户：${userMessage}\n\n要求：给出具体、可执行的建议，必要时给一句可直接复用的示例。`,
          { temperature: 0.85, max_tokens: 520 }
        );
        if (reqSeq !== requestSeqRef.current) return;
        addMessage(reply, 'ai', expert);
      } catch {
        if (reqSeq !== requestSeqRef.current) return;
        addMessage(getFallbackReply(expert.id), 'ai', expert);
      }
    }

    if (reqSeq === requestSeqRef.current) setIsTyping(false);
  }, [addMessage, availablePosts, consumeCalls, getFallbackReply, participants, selectedPostId, topic]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    addMessage(text, 'user');
    setInput('');
    const seq = ++requestSeqRef.current;
    await respondFromGroup(text, seq);
  }, [addMessage, input, isTyping, respondFromGroup]);

  const handleQuickTopic = useCallback(async (t: string) => {
    setTopic(t);
    const msg = `我们来群聊讨论一下：「${t}」。请各位从自己的视角给出建议。`;
    addMessage(msg, 'user');
    const seq = ++requestSeqRef.current;
    await respondFromGroup(msg, seq);
  }, [addMessage, respondFromGroup]);

  const handleGenerateSummary = useCallback(async () => {
    if (isSummarizing) return;
    setShowSummary(true);
    setIsSummarizing(true);
    setSummaryText('生成中…');

    const post = availablePosts.find((p) => String(p?.id) === String(selectedPostId));
    const postText = post
      ? `\n\n讨论作品：\n标题：${String(post?.title || '').trim()}\n平台：${String(post?.platform || '').trim()}\n正文：${String(post?.content || post?.text || '').trim()}\n标签：${Array.isArray(post?.tags) ? post.tags.join(' ') : ''}`
      : '';

    const transcript = messages
      .filter((m) => m.type !== 'system')
      .slice(-40)
      .map((m) => `${m.type === 'user' ? '用户' : m.senderName}：${m.content}`)
      .join('\n');

    try {
      const system =
        '你是会议纪要与内容策略总监。请把群聊研讨内容做“高级感”分析输出，结构化、专业、能直接执行。\n' +
        '输出包含：\n' +
        '1) 共识结论（2条）\n' +
        '2) 分歧点与取舍（3条）\n' +
        '3) 选题与受众洞察（3条）\n' +
        '4) 改稿方案：标题3个 + 开头2个 + 结构提纲1份\n' +
        '5) 发布策略：平台差异（小红书/抖音/朋友圈/领英各1条）\n' +
        '字数 420-700。';
      const user = `参与者：${participants.map((p) => p.realName).join('、')}\n主题：${topic || '未指定'}${postText}\n\n对话记录：\n${transcript}`;
      const res = await glmChat(system, user, { temperature: 0.6, max_tokens: 1100 });
      setSummaryText(res);
      addMessage(`📋 已生成群聊蒸馏总结（可在下方查看）。`, 'system');
    } catch {
      setSummaryText('生成失败了，请稍后重试。');
    } finally {
      setIsSummarizing(false);
    }
  }, [addMessage, availablePosts, isSummarizing, messages, participants, selectedPostId, topic]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const title = participants.length >= 4 ? `群聊研讨（${participants.length}人）` : participants.map((p) => p.name).join('、');

  return (
    <div className="flex flex-col h-[calc(100dvh-72px)] bg-void">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-white/5 bg-void-light/50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-1 text-text-secondary hover:text-neon-cyan transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">返回</span>
        </motion.button>

        <div className="flex -space-x-2">
          {participants.slice(0, 4).map((p) => (
            <div key={p.id} className="border border-void rounded-full">
              <PersonaAvatar name={p.avatar} color={p.color} size={34} />
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary text-sm truncate">{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
              群聊
            </span>
          </div>
          <div className="text-xs text-text-muted truncate">
            {participants.map((p) => p.expertise).slice(0, 3).join(' · ')}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateSummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-colors"
        >
          <Bookmark size={13} />
          <span className="hidden sm:inline">生成总结</span>
        </motion.button>
      </div>

      {availablePosts.length > 0 && (
        <div className="px-6 py-3 border-b border-white/5 bg-void/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-xs text-text-muted flex-shrink-0">讨论作品（可选）</div>
            <select
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-void border border-white/10 text-text-primary text-sm focus:outline-none focus:border-neon-cyan/40"
            >
              <option value="">不选择作品（仅对话）</option>
              {availablePosts.map((p) => (
                <option key={String(p?.id)} value={String(p?.id)}>
                  {String(p?.title || '未命名内容').slice(0, 30)} · {String(p?.platform || '')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {messages.length < 3 && !topic && (
        <div className="px-6 py-3 border-b border-white/5">
          <p className="text-xs text-text-muted mb-2">快速选择讨论主题：</p>
          <div className="flex flex-wrap gap-2">
            {['文案优化', '标题策划', '内容结构', '变现策略', '选题方向'].map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickTopic(t)}
                className="px-3 py-1.5 rounded-full text-xs bg-void-light border border-white/10 text-text-secondary hover:border-neon-cyan/30 hover:text-neon-cyan transition-colors"
              >
                <Hash size={11} className="inline mr-1" />
                {t}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className={msg.type === 'system' ? 'flex justify-center' : ''}
            >
              {msg.type === 'system' ? (
                <div className="px-4 py-2 rounded-full bg-neon-violet/10 border border-dashed border-neon-violet/30">
                  <span className="text-xs text-neon-violet">{msg.content}</span>
                </div>
              ) : msg.type === 'user' ? (
                <div className="flex justify-end gap-2">
                  <div className="max-w-[70%]">
                    <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-neon-cyan/15 border border-neon-cyan/30">
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-text-muted mt-1 block text-right">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan text-xs font-bold shrink-0 self-end">
                    我
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <PersonaAvatar name={msg.avatar} color={msg.senderColor} size={36} />
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium" style={{ color: msg.senderColor }}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-text-muted">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div
                      className="px-4 py-2.5 rounded-2xl rounded-tl-sm border"
                      style={{
                        background: `${msg.senderColor}11`,
                        borderColor: `${msg.senderColor}33`,
                      }}
                    >
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((p) => (
                <div key={p.id} className="border border-void rounded-full">
                  <PersonaAvatar name={p.avatar} color={p.color} size={32} />
                </div>
              ))}
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-void-light border border-white/10">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-neon-cyan/60"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-void-light/80 overflow-hidden"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neon-cyan">讨论总结</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(summaryText || '').catch(() => {});
                    }}
                    disabled={!summaryText || summaryText === '生成中…'}
                    className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors disabled:opacity-40"
                  >
                    复制
                  </button>
                  <button onClick={() => setShowSummary(false)} className="text-text-muted hover:text-text-primary">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                {summaryText || `本群围绕「${topic || '内容创作'}」进行了研讨。`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 sm:px-6 py-3 border-t border-white/5 bg-void-light/50">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入讨论内容，与多个大V同时研讨..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-void border border-white/10 text-text-primary placeholder:text-text-muted text-sm focus:border-neon-cyan/50 focus:outline-none transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-neon-cyan text-void flex items-center justify-center disabled:opacity-30 hover:shadow-glow-cyan transition-all"
          >
            <Send size={16} />
          </motion.button>
        </div>
        <div className="flex items-center gap-4 mt-2 px-1">
          <span className="text-[10px] text-text-muted">按 Enter 发送</span>
          <span className="text-[10px] text-text-muted">|</span>
          <span className="text-[10px] text-text-muted">群聊会按人格顺序依次给建议</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Workshop Component
// ---------------------------------------------------------------------------

export default function Workshop() {
  const [view, setView] = useState<'plaza' | 'chat' | 'history' | 'group_setup' | 'group_chat'>('plaza');
  const [selectedPersona, setSelectedPersona] = useState<AIPersonality | null>(null);
  const [showDistillModal, setShowDistillModal] = useState(false);
  const [personas, setPersonas] = useState<AIPersonality[]>(PRESET_PERSONAS);
  const [historyGroups] = useState<DiscussionGroup[]>(MOCK_HISTORY);
  const [groupSelectedIds, setGroupSelectedIds] = useState<string[]>([]);
  const [groupPostId, setGroupPostId] = useState<string>('');
  const [availablePosts, setAvailablePosts] = useState<any[]>([]);

  const handleEnterChat = useCallback((persona: AIPersonality) => {
    setSelectedPersona(persona);
    setView('chat');
  }, []);

  const handleBack = useCallback(() => {
    setView('plaza');
    setSelectedPersona(null);
    setGroupSelectedIds([]);
    setGroupPostId('');
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pcg_posts');
      const parsed = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
      setAvailablePosts(arr.slice(0, 20));
    } catch {
      setAvailablePosts([]);
    }
  }, []);

  const handleCreatePersona = useCallback((newPersona: AIPersonality) => {
    setPersonas((prev) => [...prev, newPersona]);
  }, []);

  // Icon mapping for personality cards
  const getPersonaIcon = (id: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      lixiaolai: <TrendingUp size={18} />,
      luozhenyu: <Megaphone size={18} />,
      luoyonghao: <Flame size={18} />,
      papajiang: <Star size={18} />,
      liziqi: <Heart size={18} />,
      hexuetong: <Zap size={18} />,
      banfo: <Gem size={18} />,
      xinhua: <Award size={18} />,
      dongyuhui: <Lightbulb size={18} />,
      shougonggeng: <Wrench size={18} />,
    };
    return iconMap[id] || <Sparkles size={18} />;
  };

  // ---- Chat Room View ----
  if (view === 'chat' && selectedPersona) {
    return <ChatRoom persona={selectedPersona} onBack={handleBack} />;
  }

  if (view === 'group_chat') {
    const participants = personas.filter((p) => groupSelectedIds.includes(p.id));
    return <GroupChatRoom participants={participants} onBack={() => setView('group_setup')} initialPostId={groupPostId || undefined} />;
  }

  if (view === 'group_setup') {
    const selectedCount = groupSelectedIds.length;
    const toggle = (id: string) => {
      setGroupSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };
    const start = () => {
      if (groupSelectedIds.length < 2) return;
      setView('group_chat');
    };
    return (
      <div className="min-h-[calc(100dvh-72px)] bg-void pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-1 text-text-secondary hover:text-neon-cyan transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">返回</span>
            </motion.button>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Users size={22} className="text-neon-cyan" />
              群聊研讨
              <span className="text-sm text-text-muted font-normal">（已选 {selectedCount} 人）</span>
            </h2>
          </motion.div>

          {availablePosts.length > 0 && (
            <div className="rounded-xl bg-void-light border border-white/5 p-5 mb-6">
              <div className="text-sm font-medium text-text-primary mb-3">选择要讨论的作品（可选）</div>
              <select
                value={groupPostId}
                onChange={(e) => setGroupPostId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-void border border-white/10 text-text-primary text-sm focus:outline-none focus:border-neon-cyan/40"
              >
                <option value="">不选择作品（自由讨论）</option>
                {availablePosts.map((p) => (
                  <option key={String(p?.id)} value={String(p?.id)}>
                    {String(p?.title || '未命名内容').slice(0, 40)} · {String(p?.platform || '')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.slice(0, 10).map((p, i) => {
              const active = groupSelectedIds.includes(p.id);
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggle(p.id)}
                  className="rounded-xl bg-void-light border p-4 text-left hover:-translate-y-0.5 transition-all"
                  style={{ borderColor: active ? `${p.color}66` : 'rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <PersonaAvatar name={p.avatar} color={p.color} size={42} />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text-primary truncate">{p.name}</div>
                        <div className="text-xs text-text-muted truncate">{p.expertise}</div>
                      </div>
                    </div>
                    <div
                      className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: active ? p.color : 'rgba(255,255,255,0.18)', background: active ? `${p.color}22` : 'transparent' }}
                    >
                      {active ? <CheckCircle2 size={14} style={{ color: p.color }} /> : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-secondary">
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => setGroupSelectedIds([])}
              className="px-4 py-2 rounded-xl text-sm border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              清空
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={start}
              disabled={groupSelectedIds.length < 2}
              className="px-6 py-2 rounded-xl text-sm font-bold bg-neon-cyan text-void disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-cyan transition-all"
            >
              开始群聊研讨
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ---- History View ----
  if (view === 'history') {
    return (
      <div className="min-h-[calc(100dvh-72px)] bg-void pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-1 text-text-secondary hover:text-neon-cyan transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">返回</span>
            </motion.button>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Clock size={22} className="text-neon-cyan" />
              研讨历史
            </h2>
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence>
              {historyGroups.map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl bg-void-light border border-white/5 p-5 hover:border-neon-cyan/20 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-medium text-text-primary group-hover:text-neon-cyan transition-colors">
                          {group.topic}
                        </h3>
                        <span className="text-xs text-text-muted">{getRelativeTime(group.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Users size={13} className="text-text-muted" />
                        <div className="flex -space-x-2">
                          {group.participants.map((p, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-neon-cyan/20 border border-void flex items-center justify-center text-[9px] text-neon-cyan"
                            >
                              {p.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-text-secondary ml-1">{group.participants.join('、')}</span>
                      </div>

                      {group.summary && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-void border border-white/5">
                          <CheckCircle2 size={14} className="text-neon-green shrink-0 mt-0.5" />
                          <p className="text-xs text-text-secondary leading-relaxed">{group.summary}</p>
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="ml-4 px-4 py-2 rounded-lg text-xs font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-colors"
                    >
                      查看记录
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ---- Persona Plaza View (Default) ----
  return (
    <div className="min-h-[calc(100dvh-72px)] bg-void pt-[72px]">
      {/* Hero Section */}
      <section className="relative w-full h-[340px] sm:h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/workshop-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-void/70 to-void" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/80 via-transparent to-void/80" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain size={28} className="text-neon-cyan" />
              <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-neon-gold">大V研讨室（蒸馏）</h1>
            </div>
            <p className="text-text-secondary text-sm sm:text-base max-w-lg mx-auto mb-6">
              与顶级大V的AI人格进行深度研讨，让专家智慧为你的创作赋能
            </p>
            <div className="flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDistillModal(true)}
                className="btn-cyber px-5 py-2.5 bg-neon-cyan text-void font-medium text-sm hover:shadow-glow-cyan transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                蒸馏新人格
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('history')}
                className="btn-cyber px-5 py-2.5 bg-transparent border border-neon-cyan text-neon-cyan font-medium text-sm hover:bg-neon-cyan/10 transition-all flex items-center gap-2"
              >
                <Clock size={16} />
                研讨历史
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('group_setup')}
                className="btn-cyber px-5 py-2.5 bg-transparent border border-neon-magenta text-neon-magenta font-medium text-sm hover:bg-neon-magenta/10 transition-all flex items-center gap-2"
              >
                <Users size={16} />
                群聊研讨
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Persona Plaza */}
      <section className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-neon-cyan" />
            <h2 className="text-xl font-bold text-text-primary">人格广场</h2>
            <span className="text-sm text-text-muted">({personas.length} 个人格)</span>
          </div>
          <span className="text-xs text-text-muted hidden sm:block">点击人格卡片进入研讨群</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {personas.map((persona, index) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                layout
                onClick={() => handleEnterChat(persona)}
                className="group relative rounded-xl bg-void-light border overflow-hidden hover:-translate-y-1 transition-all duration-300"
                style={{
                  borderColor: `${persona.color}22`,
                }}
              >
                {/* Top border glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${persona.color}, transparent)` }}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <PersonaAvatar name={persona.avatar} color={persona.color} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                          {persona.name}
                        </h3>
                        {getPersonaIcon(persona.id)}
                      </div>
                      <p className="text-xs text-text-muted truncate">{persona.expertise}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {persona.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: `${persona.color}33`,
                          color: persona.color,
                          background: `${persona.color}11`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">
                    {persona.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <MessageCircle size={12} />
                      <span>{persona.style}</span>
                    </div>
                    <motion.div
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: persona.color }}
                      whileHover={{ x: 3 }}
                    >
                      <span>进入研讨</span>
                      <ChevronLeft size={12} className="rotate-180" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add New Persona Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: personas.length * 0.06,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            onClick={() => setShowDistillModal(true)}
            className="group rounded-xl bg-void-light border border-dashed border-white/10 hover:border-neon-cyan/30 overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mb-3"
            >
              <Plus size={24} className="text-neon-cyan" />
            </motion.div>
            <span className="text-sm font-medium text-text-secondary group-hover:text-neon-cyan transition-colors">
              蒸馏新人格
            </span>
            <span className="text-xs text-text-muted mt-1">创建自定义AI专家</span>
          </motion.div>
        </div>

        {/* Feature Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {[
            {
              icon: <Brain size={20} className="text-neon-cyan" />,
              title: 'AI人格蒸馏',
              desc: '通过对话样本学习和复刻任意专家的语言风格和思维方式，创建可复用的AI人格模板',
            },
            {
              icon: <MessageCircle size={20} className="text-neon-magenta" />,
              title: '专家讨论室',
              desc: 'QQ群风格的多专家讨论场景，让不同领域的AI专家为你的内容出谋划策',
            },
            {
              icon: <Bookmark size={20} className="text-neon-violet" />,
              title: '研讨总结',
              desc: 'AI自动生成讨论总结和可执行的建议清单，让每次研讨都有实质性产出',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-void-light/50 border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <h4 className="text-sm font-medium text-text-primary">{item.title}</h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Distill Modal */}
      <AnimatePresence>
        {showDistillModal && (
          <DistillModal onClose={() => setShowDistillModal(false)} onCreate={handleCreatePersona} />
        )}
      </AnimatePresence>
    </div>
  );
}
