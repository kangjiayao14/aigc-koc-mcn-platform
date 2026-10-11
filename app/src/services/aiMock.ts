/**
 * aiMock.ts — AI Mock API Service Layer
 * 
 * 所有AI功能的标准Mock接口，使用setTimeout模拟真实LLM延迟。
 * 后续接入真实API时，只需替换这里的实现即可。
 * 
 * 包含：
 * - 人设DNA分析
 * - A/B爆款测试
 * - 商单匹配
 * - 内容生成
 * - 情绪分析
 * - 竞品解构
 */

import { extractJSON, glmChat } from './glmClient';

export interface DNAProfile {
  tone: string;
  keywords: string[];
  emojiDensity: number;
  dimensions: {
    humor: number;       // 0-100
    emotionValue: number; // 0-100
    professionalism: number; // 0-100
    affinity: number;    // 0-100
    aggressiveness: number; // 0-100
  };
  writingStyle: string;
  targetAudience: string;
  contentPillar: string; // 内容支柱
}

export interface ABTestResult {
  versionA: {
    ctr: string;
    virality: string;
    exposure: number;
    interaction: number;
    advice: string;
  };
  versionB: {
    ctr: string;
    virality: string;
    exposure: number;
    interaction: number;
    advice: string;
  };
  winner: 'A' | 'B';
  improvement: string;
  combinedSuggestion: string;
}

export interface BrandDeal {
  id: string;
  brandName: string;
  brandLogo: string;
  matchScore: number;
  matchReason: string;
  dealType: string;
  budgetRange: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface GeneratedContent {
  title: string;
  body: string;
  hashtags: string[];
  coverPrompt: string;
  tone: string;
}

// ===================== DNA提取引擎 =====================

/**
 * 分析用户文案，提取人设DNA
 * TODO: 接入真实LLM API时，将prompt传入GPT-4o/Claude
 */
export const analyzeDNA = async (samples: string[]): Promise<DNAProfile> => {
  const system =
    '你是人设分析师。从样本中提取 JSON：{tone, keywords, emojiDensity, dimensions{humor,emotionValue,professionalism,affinity,aggressiveness}, writingStyle, targetAudience, contentPillar}。数值维度为0-100。';
  const user = `分析：\n\n${samples.join('\n\n---\n\n')}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.3, max_tokens: 2048, jsonMode: true });
    return extractJSON<DNAProfile>(res);
  } catch (err) {
    console.warn('[analyzeDNA] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const combined = samples.join(' ');
        const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(combined);
        const hasSlang = /绝绝子|yyds|打工人|种草|拔草|真香/.test(combined);
        const isProfessional = /数据|分析|测评|体验|报告/.test(combined);
        const isHumorous = /哈哈|笑死|绝了|离谱|整活/.test(combined);

        resolve({
          tone: isHumorous ? '自黑幽默' : isProfessional ? '理性专业' : '温暖亲和',
          keywords: hasSlang ? ['绝绝子', '打工人', '种草'] : ['分享', '体验', '推荐'],
          emojiDensity: hasEmoji ? 0.75 : 0.3,
          dimensions: {
            humor: isHumorous ? 78 : 45,
            emotionValue: hasEmoji ? 82 : 60,
            professionalism: isProfessional ? 85 : 50,
            affinity: 72,
            aggressiveness: 25,
          },
          writingStyle: isProfessional
            ? '结构化叙述，数据支撑，客观理性'
            : '口语化表达，情感共鸣，场景代入',
          targetAudience: '18-30岁一二线城市年轻白领',
          contentPillar: isProfessional ? '专业测评' : '生活分享',
        });
      }, 2500);
    });
  }
};

/**
 * 根据DNA强制上下文生成内容
 * TODO: 接入LLM时，将DNA作为system prompt的一部分
 */
export const generateWithDNA = async (
  topic: string,
  platform: string,
  dna: DNAProfile
): Promise<GeneratedContent> => {
  const platformGuide: Record<string, string> = {
    小红书: '小红书：闺蜜式分享，多用emoji，标题可带｜，结尾引导收藏/关注。',
    抖音: '抖音：前3秒钩子，短句口语化，结尾提问引导评论。',
    朋友圈: '朋友圈：生活化，真情实感，少标签。',
    领英: '领英：专业严谨，数据支撑，结构化表达。',
  };

  const system = `你是社交媒体内容创作者。根据人设DNA和平台风格输出 JSON：{title, body, hashtags, coverPrompt, tone}。hashtags 为字符串数组。${platformGuide[platform] || platformGuide['小红书']}`;
  const user = `主题：${topic}\n平台：${platform}\nDNA：${JSON.stringify(dna)}`;

  try {
    const res = await glmChat(system, user, { temperature: 0.8, max_tokens: 2048, jsonMode: true });
    return extractJSON<GeneratedContent>(res);
  } catch (err) {
    console.warn('[generateWithDNA] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const toneMap: Record<string, string> = {
          自黑幽默: `家人们谁懂啊！这个${topic}我真的...`,
          理性专业: `经过两周深度体验，我来客观分析一下${topic}...`,
          温暖亲和: `今天想和大家分享一个很治愈的${topic}...`,
        };

        const titles: Record<string, string[]> = {
          小红书: [`关于${topic}，说点大实话`, `${topic}｜保姆级攻略`],
          抖音: [`${topic}的真相，99%的人不知道`, `别再被${topic}骗了`],
          朋友圈: [`${topic}记录`, `分享一下${topic}的心得`],
          领英: [`深度解析：${topic}的行业趋势`, `${topic}方法论`],
        };

        const platformTitles = titles[platform] || titles['小红书'];
        const selectedTitle = platformTitles[Math.floor(Math.random() * platformTitles.length)];

        resolve({
          title: selectedTitle,
          body: toneMap[dna.tone] || `来聊聊${topic}...`,
          hashtags: dna.keywords.map((k) => `#${k}`).concat([`#${topic}`, '#分享']),
          coverPrompt: `${topic}, ${dna.contentPillar}, ${dna.writingStyle}`,
          tone: dna.tone,
        });
      }, 2000);
    });
  }
};

// ===================== 爆款沙盘模拟器 =====================

/**
 * A/B测试爆款预测
 * TODO: 接入LLM + 数据模型
 */
export const simulateABTesting = async (postContent: any): Promise<ABTestResult> => {
  const system =
    '你是A/B爆款预测分析师。输出 JSON：{versionA:{ctr,virality,exposure,interaction,advice}, versionB:{ctr,virality,exposure,interaction,advice}, winner:"A"|"B", improvement, combinedSuggestion}。ctr/virality为百分比字符串如"4.2%"；exposure/interaction为数字。';
  const user = `输入内容：\n${JSON.stringify(postContent)}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.4, max_tokens: 2048, jsonMode: true });
    return extractJSON<ABTestResult>(res);
  } catch (err) {
    console.warn('[simulateABTesting] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuspenseTitle = /秘密|真相|揭秘|99%/.test(postContent.title || '');
        const hasVisualHook = postContent.hasImage || postContent.hasVideo;

        const ctrA = (Math.random() * 3 + 3).toFixed(1);
        const ctrB = isSuspenseTitle ? (parseFloat(ctrA) + 2.5).toFixed(1) : (parseFloat(ctrA) + 1.2).toFixed(1);

        const viralityA = (Math.random() * 20 + 10).toFixed(0);
        const viralityB = hasVisualHook ? (parseFloat(viralityA) * 1.8).toFixed(0) : (parseFloat(viralityA) * 1.3).toFixed(0);

        const winner = parseFloat(ctrB) > parseFloat(ctrA) ? 'B' : 'A';
        const improvement = winner === 'B' ? `${(parseFloat(viralityB) - parseFloat(viralityA)).toFixed(0)}%` : '0%';

        resolve({
          versionA: {
            ctr: `${ctrA}%`,
            virality: `${viralityA}%`,
            exposure: Math.floor(Math.random() * 5000 + 3000),
            interaction: Math.floor(Math.random() * 200 + 100),
            advice: isSuspenseTitle ? '标题缺乏悬念，点击率一般' : '封面视觉吸引力不足',
          },
          versionB: {
            ctr: `${ctrB}%`,
            virality: `${viralityB}%`,
            exposure: Math.floor(Math.random() * 8000 + 6000),
            interaction: Math.floor(Math.random() * 500 + 300),
            advice: isSuspenseTitle ? '悬念式标题极具吸引力' : '封面视觉冲击力显著提升',
          },
          winner,
          improvement,
          combinedSuggestion:
            winner === 'B'
              ? `🔥 AI建议：采用B版标题 + A版封面，综合爆款率提升 ${improvement}`
              : '🔥 AI建议：优化标题悬念度可进一步提升点击率',
        });
      }, 2500);
    });
  }
};

/**
 * 内容变异生成（生成优化版本）
 */
export const generateVariant = async (original: any): Promise<any> => {
  const system = '你是内容变异优化师。输入原内容 JSON，输出优化后的同结构 JSON（保留原字段，允许新增 hasStrongHook）。';
  const user = `原内容：\n${JSON.stringify(original)}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.9, max_tokens: 2048, jsonMode: true });
    return extractJSON<any>(res);
  } catch (err) {
    console.warn('[generateVariant] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const titleVariants = [
          original.title?.replace(/关于|来聊聊/, '揭秘'),
          `99%的人不知道的${original.topic || '秘密'}`,
          `家人们！这个${original.topic || ''}真的绝了`,
        ].filter(Boolean);

        resolve({
          ...original,
          title: titleVariants[Math.floor(Math.random() * titleVariants.length)] || original.title,
          hasStrongHook: true,
        });
      }, 1500);
    });
  }
};

// ===================== 商业变现反向匹配器 =====================

/**
 * 匹配商单
 * TODO: 接入品牌数据库 + 粉丝画像分析
 */
export const matchBrandDeals = async (_content: any, dna?: DNAProfile): Promise<BrandDeal[]> => {
  const system =
    '你是商单匹配助手。输出 JSON 数组：[{id, brandName, brandLogo, matchScore, matchReason, dealType, budgetRange, urgency}]。brandLogo 使用站内占位图路径如 "/sample-post-cover-1.jpg"。matchScore 0-100，urgency 为 high/medium/low。';
  const user = `内容：${JSON.stringify(_content)}\nDNA：${dna ? JSON.stringify(dna) : 'null'}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.6, max_tokens: 2048, jsonMode: true });
    return extractJSON<BrandDeal[]>(res);
  } catch (err) {
    console.warn('[matchBrandDeals] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const deals: BrandDeal[] = [
          {
            id: '1',
            brandName: '花西子',
            brandLogo: '/sample-post-cover-1.jpg',
            matchScore: 96,
            matchReason: '你的粉丝画像（18-28岁女性）及本次内容调性与该品牌目标客群高度重合',
            dealType: '产品置换 + 佣金',
            budgetRange: '¥3,000-8,000',
            urgency: 'high',
          },
          {
            id: '2',
            brandName: '喜茶',
            brandLogo: '/sample-post-cover-2.jpg',
            matchScore: 88,
            matchReason: '你的美食探店类内容历史数据表现优异，适合茶饮品牌推广',
            dealType: '探店体验 + 探店费',
            budgetRange: '¥2,000-5,000',
            urgency: 'medium',
          },
          {
            id: '3',
            brandName: '完美日记',
            brandLogo: '/sample-post-cover-3.jpg',
            matchScore: 82,
            matchReason: '你的妆容教程类粉丝互动率高，适合美妆品牌新品推广',
            dealType: '新品试用 + 长期合作',
            budgetRange: '¥5,000-15,000',
            urgency: 'low',
          },
        ];

        if (dna?.contentPillar === '专业测评') {
          deals.push({
            id: '4',
            brandName: '小米',
            brandLogo: '/sample-post-cover-4.jpg',
            matchScore: 91,
            matchReason: '你的科技测评专业度高，适合数码品牌深度合作',
            dealType: '产品体验 + 专属折扣码',
            budgetRange: '¥8,000-20,000',
            urgency: 'high',
          });
        }

        resolve(deals.slice(0, 3));
      }, 2000);
    });
  }
};

/**
 * 生成自荐信
 * TODO: 接入LLM生成个性化自荐信
 */
export const generatePitchLetter = async (deal: BrandDeal, dna: DNAProfile): Promise<string> => {
  const system = '你是品牌合作自荐信写作助手。直接输出中文信件正文，300-500字，语气专业但不生硬。';
  const user = `品牌：${deal.brandName}\ndeal：${JSON.stringify(deal)}\nDNA：${JSON.stringify(dna)}`;
  try {
    return await glmChat(system, user, { temperature: 0.7, max_tokens: 1024 });
  } catch (err) {
    console.warn('[generatePitchLetter] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const letter = `尊敬的${deal.brandName}品牌方：

您好！我是PCG创客星球的内容创作者，专注于${dna.contentPillar}领域。

我的内容风格：${dna.writingStyle}
核心受众：${dna.targetAudience}
历史互动数据：平均互动率${(Math.random() * 5 + 3).toFixed(1)}%，粉丝粘性高。

我注意到贵品牌正在寻找${deal.dealType.includes('美妆') ? '美妆' : deal.dealType.includes('数码') ? '数码' : '生活'}领域的KOC合作。基于我过往的内容表现和粉丝画像，我相信可以为贵品牌带来精准的曝光和高质量的转化。

期待与贵品牌建立长期合作关系！

此致
敬礼`;
        resolve(letter);
      }, 1500);
    });
  }
};

// ===================== 智能标题工厂 =====================

export interface TitleOption {
  title: string;
  score: number;
  type: string;
  hook: string;
}

export const generateTitles = async (content: string, count: number = 20): Promise<TitleOption[]> => {
  const system =
    '你是智能标题工厂。输出 JSON 数组：[{title, score, type, hook}]，按 score 从高到低排序。score 0-100。';
  const user = `为以下内容生成${count}个标题候选：\n${content}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.95, max_tokens: 2048, jsonMode: true });
    return extractJSON<TitleOption[]>(res);
  } catch (err) {
    console.warn('[generateTitles] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const types = ['悬念型', '数字型', '痛点型', '反常识型', '对比型', '疑问型', '情绪型', '权威型'];
        const titles = Array.from({ length: count }, (_, i) => ({
          title: `${types[i % types.length]}标题示例 ${i + 1}：关于${content.slice(0, 10)}...`,
          score: Math.floor(Math.random() * 30 + 70),
          type: types[i % types.length],
          hook: `前3秒吸引点：${['制造悬念', '直击痛点', '反常识', '数据冲击', '情感共鸣'][i % 5]}`,
        }));
        resolve(titles.sort((a, b) => b.score - a.score));
      }, 2000);
    });
  }
};

// ===================== 热点预埋雷达 =====================

export interface SimulatedComment {
  type: 'positive' | 'question' | 'challenge' | 'joke';
  text: string;
  suggestedReply: string;
}

export const simulateComments = async (_content: string): Promise<SimulatedComment[]> => {
  const system =
    '你是评论区预演助手。输出 JSON 数组：[{type(positive/question/challenge/joke), text, suggestedReply}]，共10条。';
  const user = `内容：\n${_content}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.9, max_tokens: 2048, jsonMode: true });
    return extractJSON<SimulatedComment[]>(res);
  } catch (err) {
    console.warn('[simulateComments] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { type: 'positive', text: '太实用了！马上去试试', suggestedReply: '谢谢喜欢！试完记得来反馈效果哦~' },
          { type: 'question', text: '这个和XX有什么区别？', suggestedReply: '好问题！主要区别在...（详细解答+引导关注）' },
          { type: 'challenge', text: '感觉效果因人而异吧', suggestedReply: '确实！建议根据自身情况调整，可以看看我主页的进阶版' },
          { type: 'joke', text: '收藏从未停止，实践从未开始', suggestedReply: '哈哈哈哈太真实了！这次真的不难，5分钟就能搞定' },
          { type: 'positive', text: '已转发给闺蜜了', suggestedReply: '感谢传播！闺蜜用完记得让她来关注我哈哈哈' },
          { type: 'question', text: '能推荐一下具体产品吗？', suggestedReply: '可以！我整理了一份清单，私信"清单"发给你~' },
          { type: 'challenge', text: '这种方法过时了吧？', suggestedReply: '经典方法永不过时！我主页有2024最新升级版，去看看？' },
          { type: 'positive', text: '跟着做了，效果真的很明显！', suggestedReply: '太棒了！能帮到你就好，记得持续跟进哦' },
          { type: 'joke', text: '我是缺方法吗？我是缺手', suggestedReply: '手残党友好版教程在主页置顶！真的超简单' },
          { type: 'question', text: '新手小白能学会吗？', suggestedReply: '完全没问题！我就是从零开始的，跟着步骤一步步来' },
        ]);
      }, 1500);
    });
  }
};



export interface HeatPrediction {
  topic: string;
  predictedHeat: number;
  hoursUntilPeak: number;
  confidence: number;
  action: string;
  competition: number;
}

export const predictHeat = async (topic: string): Promise<HeatPrediction[]> => {
  const system =
    '你是热点预埋雷达。输出 JSON 数组：[{topic, predictedHeat, hoursUntilPeak, confidence, action, competition}]，返回3个候选。predictedHeat/confidence 0-100，competition 0-100。';
  const user = `关键词：${topic}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.6, max_tokens: 1024, jsonMode: true });
    return extractJSON<HeatPrediction[]>(res);
  } catch (err) {
    console.warn('[predictHeat] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { topic: `${topic}新趋势`, predictedHeat: 95, hoursUntilPeak: 12, confidence: 88, action: '立即制作内容，抢占先机', competition: 3 },
          { topic: `${topic}避坑指南`, predictedHeat: 82, hoursUntilPeak: 24, confidence: 75, action: '今天内完成，明天发布', competition: 8 },
          { topic: `${topic}省钱攻略`, predictedHeat: 78, hoursUntilPeak: 36, confidence: 70, action: '24小时内制作完成', competition: 12 },
        ]);
      }, 1800);
    });
  }
};



export interface FanSegment {
  label: string;
  percentage: number;
  interests: string[];
  activeTime: string;
  engagementRate: number;
}

export const analyzeFanEvolution = async (): Promise<FanSegment[]> => {
  const system =
    '你是粉丝画像分析师。输出 JSON 数组：[{label, percentage, interests, activeTime, engagementRate}]，4-5段；percentage 为数字（总和约100）；interests 为字符串数组；engagementRate 为数字。';
  const user = '生成一个KOC账号的粉丝画像分群。';
  try {
    const res = await glmChat(system, user, { temperature: 0.4, max_tokens: 1024, jsonMode: true });
    return extractJSON<FanSegment[]>(res);
  } catch (err) {
    console.warn('[analyzeFanEvolution] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '职场新人', percentage: 35, interests: ['面试技巧', '职场穿搭', '沟通话术'], activeTime: '20:00-22:00', engagementRate: 8.5 },
          { label: '学生党', percentage: 28, interests: ['学习方法', '省钱攻略', '平价好物'], activeTime: '12:00-14:00', engagementRate: 12.3 },
          { label: '宝妈群体', percentage: 20, interests: ['育儿经验', '家居整理', '快手菜'], activeTime: '10:00-12:00', engagementRate: 6.8 },
          { label: '精致白领', percentage: 17, interests: ['效率工具', '轻奢好物', '健身打卡'], activeTime: '07:30-09:00', engagementRate: 5.2 },
        ]);
      }, 1500);
    });
  }
};

// ===================== Task 15: 内容资产银行 =====================

export interface ContentAsset {
  id: string;
  title: string;
  platform: string;
  createdAt: string;
  tags: string[];
  performance: number;
  repurposedCount: number;
}

export const getContentBank = async (): Promise<ContentAsset[]> => {
  try {
    const cached = localStorage.getItem('pcg_content_bank');
    if (cached) return JSON.parse(cached) as ContentAsset[];
  } catch {}

  const system =
    '你是内容资产银行助手。输出 JSON 数组：[{id, title, platform, createdAt, tags, performance, repurposedCount}]，共5条。platform 为小红书/抖音/朋友圈/领英之一；createdAt 为 YYYY-MM-DD；tags 为字符串数组；performance/repurposedCount 为数字。';
  const user = '生成一组内容资产示例，用于KOC内容复用与管理。';

  try {
    const res = await glmChat(system, user, { temperature: 0.4, max_tokens: 1024, jsonMode: true });
    const assets = extractJSON<ContentAsset[]>(res);
    try {
      localStorage.setItem('pcg_content_bank', JSON.stringify(assets));
    } catch {}
    return assets;
  } catch (err) {
    console.warn('[getContentBank] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', title: '5个化妆小技巧', platform: '小红书', createdAt: '2024-01-15', tags: ['美妆', '技巧'], performance: 8900, repurposedCount: 3 },
          { id: '2', title: '打工人效率工具', platform: '抖音', createdAt: '2024-02-01', tags: ['职场', '工具'], performance: 12000, repurposedCount: 5 },
          { id: '3', title: '面试穿搭指南', platform: '小红书', createdAt: '2024-02-20', tags: ['职场', '穿搭'], performance: 5600, repurposedCount: 2 },
          { id: '4', title: '30天减脂计划', platform: '抖音', createdAt: '2024-03-05', tags: ['健身', '计划'], performance: 23000, repurposedCount: 8 },
          { id: '5', title: '独居好物分享', platform: '小红书', createdAt: '2024-03-15', tags: ['生活', '好物'], performance: 7800, repurposedCount: 4 },
        ]);
      }, 1200);
    });
  }
};

export const suggestRepurposing = async (_assetId: string): Promise<string[]> => {
  const system = '你是内容复用建议助手。直接输出 JSON 字符串数组（5条）。';
  const user = `资产ID：${_assetId}`;
  try {
    const res = await glmChat(system, user, { temperature: 0.8, max_tokens: 512, jsonMode: true });
    return extractJSON<string[]>(res);
  } catch (err) {
    console.warn('[suggestRepurposing] 降级Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          '改编为图文版，发布到小红书',
          '提取核心观点，制作15秒短视频',
          '扩展为系列内容的第2集',
          '改编为对比版（A vs B形式）',
          '制作为问答形式（Q&A）',
        ]);
      }, 1000);
    });
  }
};
