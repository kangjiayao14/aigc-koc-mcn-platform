# PCG-创客星球 —— Trae GLM API 全面配置指南

> **项目背景**：PCG-创客星球是一个面向 KOC（关键意见消费者）的社交媒体 AI Agent 平台，参加腾讯 PCG 创客星球比赛（1000+ 人，前 10% 进复赛）。前端已完整开发（React 19 + TypeScript + Vite + Tailwind CSS），目前使用 `aiMock.ts` 中的 Mock 数据。现需接入**智谱 GLM4.7**（文字）和 **GLM-image**（图片）真实 API，替换全部 Mock。
>
> **配置目标**：让前端所有 AI 功能调用真实 GLM API，输出高质量、风格化的结果，不再返回"API 尚未配置"或硬编码 Mock。

---

## 一、项目技术栈与文件结构

```
项目根目录/
├── src/
│   ├── services/
│   │   ├── aiMock.ts          ← 核心！19个Mock接口，全部替换为GLM调用
│   │   ├── llm.ts             ← 已有LLM封装骨架，需实现chatCompletion
│   │   ├── imageGen.ts        ← 已有图像生成骨架，需实现generateImage
│   │   └── search.ts          ← 搜索服务（可选，先用LLM模拟）
│   ├── pages/
│   │   ├── ContentLab.tsx     ← 创作工坊，调用aiMock.ts生成内容
│   │   ├── TopicResearch.tsx  ← 选题智库，调用竞品解构/趋势分析
│   │   ├── AgentHub.tsx       ← 个人主页，调用人设DNA/商单匹配
│   │   ├── Workshop.tsx       ← 大V研讨室，调用专家人格对话
│   │   ├── ContentFeed.tsx    ← 内容大厅，调用热点预埋
│   │   └── ...
│   ├── components/
│   │   ├── AgentOrb.tsx       ← 右下角悬浮Agent，需同步经纪人
│   │   └── ...（35+组件）
│   └── App.tsx                ← HashRouter，11个路由
├── .env                       ← 环境变量（需创建）
└── package.json
```

**关键依赖**：
- React 19 + TypeScript + Vite 7
- Tailwind CSS v3.4.19
- Framer Motion + GSAP（动画）
- Recharts（图表）
- Three.js + R3F（3D效果）

---

## 二、环境变量配置（`.env` 文件）

在项目根目录创建 `.env` 文件，添加以下内容：

```env
# ============================================
# 智谱 GLM API 配置
# ============================================

# 主LLM API Key（文字生成）
# 获取地址：https://open.bigmodel.cn/
VITE_GLM_API_KEY=your-glm-api-key-here

# 文字模型配置
VITE_GLM_MODEL=glm-4.7
VITE_GLM_FALLBACK_MODEL=glm-4.7-flashx

# 图像生成 API Key（通常与LLM相同）
VITE_GLM_IMAGE_API_KEY=your-glm-api-key-here

# 图像生成模型
VITE_GLM_IMAGE_MODEL=glm-image

# API 基础地址
VITE_GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# 调试模式（开发时开启，生产关闭）
VITE_AI_DEBUG=false
```

> **重要**：`VITE_` 前缀确保 Vite 会将变量暴露到前端代码中（通过 `import.meta.env.VITE_*` 访问）。

---

## 三、核心 API 封装层（先实现基础设施）

### 3.1 创建 `src/services/glmClient.ts`

这是所有 GLM API 调用的统一封装，包含**重试机制、错误处理、超时控制**。所有后续接口都通过此文件调用 GLM。

```typescript
/**
 * GLM API 统一客户端
 * 封装智谱 GLM4.7 / GLM-image 的调用，包含重试、错误处理、降级策略
 */

const BASE_URL = import.meta.env.VITE_GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const API_KEY = import.meta.env.VITE_GLM_API_KEY || '';
const MODEL = import.meta.env.VITE_GLM_MODEL || 'glm-4.7';
const FALLBACK_MODEL = import.meta.env.VITE_GLM_FALLBACK_MODEL || 'glm-4.7-flashx';
const IMAGE_MODEL = import.meta.env.VITE_GLM_IMAGE_MODEL || 'glm-image';
const DEBUG = import.meta.env.VITE_AI_DEBUG === 'true';

/** 通用请求配置 */
interface GLMRequest {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  thinking?: { type: 'enabled' | 'disabled' };
}

/** 通用响应结构 */
interface GLMResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 发送GLM Chat Completion请求（带重试和降级）
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户提示词
 * @param options 可选参数（temperature、max_tokens等）
 * @returns AI生成的文本内容
 */
export async function glmChat(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    useThinking?: boolean;
  }
): Promise<string> {
  if (!API_KEY) {
    console.error('[GLM] API Key未配置，请检查.env文件');
    throw new Error('GLM API Key not configured');
  }

  const requestBody: GLMRequest = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 4096,
    top_p: 0.9,
  };

  if (options?.useThinking) {
    requestBody.thinking = { type: 'enabled' };
  }

  if (DEBUG) {
    console.log('[GLM] Request:', { system: systemPrompt.slice(0, 100) + '...', user: userPrompt.slice(0, 100) + '...' });
  }

  // 主请求 + 1次重试 + fallback模型降级
  let lastError: Error | null = null;
  const attempts = [
    { model: MODEL, isFallback: false },
    { model: MODEL, isFallback: false }, // 重试
    { model: FALLBACK_MODEL, isFallback: true }, // 降级到flash
  ];

  for (const attempt of attempts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ ...requestBody, model: attempt.model }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: GLMResponse = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('Empty response from GLM');
      }

      if (DEBUG) {
        console.log(`[GLM] Success${attempt.isFallback ? ' (fallback)' : ''}:`, content.slice(0, 100) + '...');
      }

      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (DEBUG) {
        console.warn(`[GLM] Attempt failed${attempt.isFallback ? ' (fallback)' : ''}:`, lastError.message);
      }
      // 如果不是最后一次尝试，等待1秒后重试
      if (attempt !== attempts[attempts.length - 1]) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw lastError || new Error('All GLM attempts failed');
}

/**
 * 调用GLM-image生成图片
 * @param prompt 图片描述（支持中文）
 * @param size 尺寸，默认1280x1280
 * @returns 生成的图片URL
 */
export async function glmImage(
  prompt: string,
  size: '1024x1024' | '1280x1280' | '1024x768' | '768x1024' = '1280x1280'
): Promise<string> {
  if (!API_KEY) {
    throw new Error('GLM API Key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 图片生成给60秒

  try {
    const response = await fetch(`${BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        size,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    // GLM-image返回格式: { data: [{ url: "..." }] }
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return imageUrl;
  } catch (err) {
    console.error('[GLM-Image] Error:', err);
    throw err;
  }
}

/**
 * 解析GLM返回的JSON（处理可能的markdown代码块包裹）
 * GLM有时会返回 ```json {...} ```，需要提取
 */
export function extractJSON<T>(text: string): T {
  // 先尝试直接解析
  try {
    return JSON.parse(text) as T;
  } catch {
    // 尝试提取 ```json ... ``` 或 ``` ... ``` 中的内容
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim()) as T;
    }
    // 尝试提取最外层的大括号
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      return JSON.parse(braceMatch[0]) as T;
    }
    throw new Error('Cannot extract JSON from response');
  }
}

/**
 * 健康检查：测试GLM API连通性
 */
export async function checkGLMHealth(): Promise<boolean> {
  try {
    const result = await glmChat(
      '你是一个测试助手，只回复"pong"',
      'ping',
      { temperature: 0, max_tokens: 10 }
    );
    return result.toLowerCase().includes('pong');
  } catch {
    return false;
  }
}
```

---

## 四、19 个 Mock 接口的 GLM 替换方案

> **核心原则**：每个接口保持原有的**函数签名和返回类型完全不变**，只替换内部 `setTimeout` 的实现为真实 GLM 调用。
>
> **降级策略**：如果 GLM 调用失败，静默降级到原有的 Mock 逻辑（保留旧代码作为 fallback），确保用户体验不中断。

---

### 接口 1：analyzeDNA —— 人设 DNA 分析

**功能**：分析用户提供的文案样本，提取人设特征（语气、关键词、emoji密度、五维评分、写作风格、目标受众、内容支柱）。

**文件位置**：`src/services/aiMock.ts` 第 77-106 行

**替换实现**：

```typescript
export const analyzeDNA = async (samples: string[]): Promise<DNAProfile> => {
  const combinedText = samples.join('\n\n---\n\n');

  const systemPrompt = `你是一位资深的社交媒体人设分析师，擅长从用户的文案样本中提取人设DNA。
你必须以JSON格式输出分析结果，不要输出任何其他文字。

输出JSON结构：
{
  "tone": "语气标签（如：温暖亲和/自黑幽默/理性专业/犀利毒舌/文艺治愈）",
  "keywords": ["高频关键词1", "高频关键词2", "高频关键词3", "高频关键词4"],
  "emojiDensity": 0.5, // 0-1之间，估算emoji使用频率
  "dimensions": {
    "humor": 70, // 幽默感 0-100
    "emotionValue": 65, // 情绪价值 0-100
    "professionalism": 55, // 专业度 0-100
    "affinity": 80, // 亲和力 0-100
    "aggressiveness": 30 // 攻击性 0-100
  },
  "writingStyle": "用一句话描述写作风格特征",
  "targetAudience": "目标受众画像（如：18-30岁一二线城市年轻白领）",
  "contentPillar": "内容支柱（如：生活分享/专业测评/职场成长/美妆教程）"
}

分析维度说明：
- humor：是否善用自嘲、段子、幽默表达
- emotionValue：能否引发读者情感共鸣
- professionalism：内容是否有专业深度、数据支撑
- affinity：语气是否亲切、像朋友聊天
- aggressiveness：观点是否激进、有争议性

所有评分要基于文本证据，不能随意给中间值。`;

  const userPrompt = `请分析以下内容创作者的文案样本，提取其人设DNA：

${combinedText}

请给出JSON格式的完整分析。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.3, // 分析任务低温度，确定性高
      max_tokens: 2048,
    });
    return extractJSON<DNAProfile>(response);
  } catch (err) {
    console.warn('[analyzeDNA] GLM失败，降级到Mock:', err);
    // 降级：保持原有Mock逻辑
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
```

---

### 接口 2：generateWithDNA —— 根据 DNA 生成内容

**功能**：根据提取的 DNA 档案，为指定平台生成贴合人设的内容（标题、正文、标签、封面提示词）。

**文件位置**：`src/services/aiMock.ts` 第 112-144 行

**替换实现**：

```typescript
export const generateWithDNA = async (
  topic: string,
  platform: string,
  dna: DNAProfile
): Promise<GeneratedContent> => {
  const platformGuidelines: Record<string, string> = {
    '小红书': '小红书风格：多用emoji，标题带｜分隔，语气像闺蜜分享，结尾引导收藏和评论，标签用#号',
    '抖音': '抖音风格：前3秒必须有钩子，多用短句和口语化表达，结尾提问引导评论，适合短视频脚本',
    '朋友圈': '朋友圈风格：生活化语气，配实拍图建议，少标签，像朋友日常分享',
    '领英': '领英风格：专业严谨，数据支撑，观点明确，结构化输出，适合职场干货',
  };

  const systemPrompt = `你是一位顶级社交媒体内容创作者，擅长根据创作者的人设DNA为其量身定制内容。
${platformGuidelines[platform] || platformGuidelines['小红书']}

你必须以JSON格式输出，不要输出其他文字：
{
  "title": "吸引人的标题",
  "body": "正文内容，带换行和排版",
  "hashtags": ["#标签1", "#标签2", "#标签3"],
  "coverPrompt": "用于AI生成封面的英文描述，20-50个词，描述画面构图、风格、色调",
  "tone": "使用的语气标签"
}`;

  const userPrompt = `请为以下创作者生成一篇关于"${topic}"的内容：

平台：${platform}
人设DNA：
- 语气：${dna.tone}
- 关键词：${dna.keywords.join('、')}
- emoji密度：${dna.emojiDensity}
- 五维评分：幽默${dna.dimensions.humor}、情绪价值${dna.dimensions.emotionValue}、专业度${dna.dimensions.professionalism}、亲和力${dna.dimensions.affinity}、攻击性${dna.dimensions.aggressiveness}
- 写作风格：${dna.writingStyle}
- 目标受众：${dna.targetAudience}
- 内容支柱：${dna.contentPillar}

要求：
1. 标题必须有吸引力（悬念/数字/痛点/反常识至少用一种）
2. 正文贴合人设DNA的写作风格
3. 标签要精准且热门
4. coverPrompt用英文描述，适合AI图像生成`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.8, // 创意任务高温度
      max_tokens: 4096,
    });
    return extractJSON<GeneratedContent>(response);
  } catch (err) {
    console.warn('[generateWithDNA] GLM失败，降级到Mock:', err);
    // 降级到原有Mock逻辑（略，保留原代码）
    return new Promise((resolve) => {
      setTimeout(() => {
        // ...原有Mock代码...
        const toneMap: Record<string, string> = {
          '自黑幽默': `家人们谁懂啊！这个${topic}我真的...`,
          '理性专业': `经过两周深度体验，我来客观分析一下${topic}...`,
          '温暖亲和': `今天想和大家分享一个很治愈的${topic}...`,
        };
        const titles: Record<string, string[]> = {
          '小红书': [`关于${topic}，说点大实话`, `${topic}｜保姆级攻略`],
          '抖音': [`${topic}的真相，99%的人不知道`, `别再被${topic}骗了`],
          '朋友圈': [`${topic}记录`, `分享一下${topic}的心得`],
          '领英': [`深度解析：${topic}的行业趋势`, `${topic}方法论`],
        };
        const platformTitles = titles[platform] || titles['小红书'];
        const selectedTitle = platformTitles[Math.floor(Math.random() * platformTitles.length)];

        resolve({
          title: selectedTitle,
          body: toneMap[dna.tone] || `来聊聊${topic}...`,
          hashtags: dna.keywords.map(k => `#${k}`).concat([`#${topic}`, '#分享']),
          coverPrompt: `${topic}, ${dna.contentPillar}, ${dna.writingStyle}`,
          tone: dna.tone,
        });
      }, 2000);
    });
  }
};
```

---

### 接口 3：simulateABTesting —— A/B 爆款测试

**功能**：分析一篇内容的两个版本，预测 CTR、爆款率、曝光量、互动量，给出优化建议。

**替换实现**：

```typescript
export const simulateABTesting = async (postContent: any): Promise<ABTestResult> => {
  const systemPrompt = `你是一位社交媒体数据分析师，擅长预测内容表现。
根据用户提供的内容信息，模拟A/B测试对比两个版本的表现。

你必须以JSON格式输出：
{
  "versionA": {
    "ctr": "3.5%", // 预估点击率
    "virality": "15%", // 预估爆款率
    "exposure": 3500, // 预估曝光量
    "interaction": 150, // 预估互动量
    "advice": "A版的优势和不足分析"
  },
  "versionB": {
    "ctr": "5.2%",
    "virality": "28%",
    "exposure": 6500,
    "interaction": 380,
    "advice": "B版的优势和不足分析"
  },
  "winner": "A或B",
  "improvement": "18%", // 提升幅度
  "combinedSuggestion": "综合优化建议，200字以内"
}

评分标准：
- 标题悬念度、封面视觉吸引力、内容信息密度、互动引导设计
- 结合平台算法偏好（小红书重收藏、抖音重完播、朋友圈重点赞）`;

  const userPrompt = `请分析以下内容的A/B测试表现：

标题：${postContent.title || '未提供'}
是否有图片：${postContent.hasImage ? '是' : '否'}
是否有视频：${postContent.hasVideo ? '是' : '否'}
内容主题：${postContent.topic || '未提供'}
目标平台：${postContent.platform || '小红书'}

A版：原始版本
B版：优化版本（假设标题增加了悬念词，封面增加了视觉钩子）

请给出JSON格式的完整分析。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.4,
      max_tokens: 2048,
    });
    return extractJSON<ABTestResult>(response);
  } catch (err) {
    console.warn('[simulateABTesting] GLM失败，降级到Mock:', err);
    // 保留原有Mock降级逻辑
    return new Promise((resolve) => {
      setTimeout(() => {
        // ...原有mock代码...
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
          combinedSuggestion: winner === 'B'
            ? `🔥 AI建议：采用B版标题 + A版封面，综合爆款率提升 ${improvement}`
            : '🔥 AI建议：优化标题悬念度可进一步提升点击率',
        });
      }, 2500);
    });
  }
};
```

---

### 接口 4：generateVariant —— 内容变异生成

**替换实现**：

```typescript
export const generateVariant = async (original: any): Promise<any> => {
  const systemPrompt = `你是一位爆款文案优化专家。根据用户提供的原始内容，生成一个优化版本。
优化方向：标题增加悬念/数字/痛点，开头增强钩子，结尾强化CTA。
直接返回优化后的完整内容对象JSON。`;

  const userPrompt = `原始内容：${JSON.stringify(original, null, 2)}

请生成一个优化版本，要求：
1. 标题更有吸引力
2. 增加前3秒钩子
3. 结尾增加明确的互动引导

返回JSON格式，保持与原始内容相同的结构。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.9,
      max_tokens: 4096,
    });
    return extractJSON(response);
  } catch (err) {
    console.warn('[generateVariant] GLM失败，降级到Mock:', err);
    // 原有Mock降级
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
```

---

### 接口 5：matchBrandDeals —— 商单匹配

**替换实现**：

```typescript
export const matchBrandDeals = async (_content: any, dna?: DNAProfile): Promise<BrandDeal[]> => {
  const systemPrompt = `你是一位MCN机构商务总监，擅长根据创作者人设匹配最合适的品牌合作。
根据创作者的内容支柱、受众画像、风格特征，推荐3个最合适的品牌合作机会。

以JSON数组格式输出：
[
  {
    "id": "1",
    "brandName": "品牌名",
    "brandLogo": "/sample-post-cover-1.jpg",
    "matchScore": 95, // 0-100匹配度
    "matchReason": "匹配原因，100字以内",
    "dealType": "合作形式（如：产品置换+佣金/探店体验+探店费）",
    "budgetRange": "¥3,000-8,000",
    "urgency": "high/medium/low"
  }
]`;

  const userPrompt = `请为以下创作者匹配品牌合作：
${dna ? `
内容支柱：${dna.contentPillar}
目标受众：${dna.targetAudience}
写作风格：${dna.writingStyle}
核心关键词：${dna.keywords.join('、')}
` : '创作者信息未提供，请基于通用KOC画像推荐'}

要求：
1. 匹配分数必须真实合理（60-98之间）
2. 品牌必须是真实存在的知名品牌
3. 匹配原因要具体，提到创作者特征
4. 合作形式和预算要符合行业常规`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.6,
      max_tokens: 2048,
    });
    return extractJSON<BrandDeal[]>(response);
  } catch (err) {
    console.warn('[matchBrandDeals] GLM失败，降级到Mock:', err);
    // 保留原有Mock硬编码品牌
    return new Promise((resolve) => {
      setTimeout(() => {
        const deals: BrandDeal[] = [
          {
            id: '1', brandName: '花西子', brandLogo: '/sample-post-cover-1.jpg',
            matchScore: 96, matchReason: '你的粉丝画像（18-28岁女性）及内容调性与品牌目标客群高度重合',
            dealType: '产品置换 + 佣金', budgetRange: '¥3,000-8,000', urgency: 'high',
          },
          {
            id: '2', brandName: '喜茶', brandLogo: '/sample-post-cover-2.jpg',
            matchScore: 88, matchReason: '你的美食探店类内容历史数据表现优异，适合茶饮品牌推广',
            dealType: '探店体验 + 探店费', budgetRange: '¥2,000-5,000', urgency: 'medium',
          },
          {
            id: '3', brandName: '完美日记', brandLogo: '/sample-post-cover-3.jpg',
            matchScore: 82, matchReason: '你的妆容教程类粉丝互动率高，适合美妆品牌新品推广',
            dealType: '新品试用 + 长期合作', budgetRange: '¥5,000-15,000', urgency: 'low',
          },
        ];
        if (dna?.contentPillar === '专业测评') {
          deals.push({
            id: '4', brandName: '小米', brandLogo: '/sample-post-cover-4.jpg',
            matchScore: 91, matchReason: '你的科技测评专业度高，适合数码品牌深度合作',
            dealType: '产品体验 + 专属折扣码', budgetRange: '¥8,000-20,000', urgency: 'high',
          });
        }
        resolve(deals.slice(0, 3));
      }, 2000);
    });
  }
};
```

---

### 接口 6：generatePitchLetter —— 自荐信生成

**替换实现**：

```typescript
export const generatePitchLetter = async (deal: BrandDeal, dna: DNAProfile): Promise<string> => {
  const systemPrompt = `你是一位资深的KOC商务合作专家，擅长撰写打动品牌方的合作自荐信。
语气专业但不生硬，有数据支撑，突出创作者价值，体现对品牌的了解和诚意。
直接输出信件正文，不要加"以下是信件"等前缀。`;

  const userPrompt = `请为创作者撰写一封给「${deal.brandName}」的品牌合作自荐信。

创作者信息：
- 内容领域：${dna.contentPillar}
- 写作风格：${dna.writingStyle}
- 核心受众：${dna.targetAudience}
- 历史互动率：${(Math.random() * 5 + 3).toFixed(1)}%

合作信息：
- 品牌：${deal.brandName}
- 合作形式：${deal.dealType}
- 匹配原因：${deal.matchReason}

要求：
1. 开头直接称呼品牌方
2. 第二段介绍自己和匹配点
3. 第三段给出合作价值主张
4. 第四段提出具体合作方案
5. 结尾礼貌收尾，留下联系方式占位符
6. 整体300-500字`;

  try {
    return await glmChat(systemPrompt, userPrompt, {
      temperature: 0.7,
      max_tokens: 2048,
    });
  } catch (err) {
    console.warn('[generatePitchLetter] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const letter = `尊敬的${deal.brandName}品牌方：\n\n您好！我是PCG创客星球的内容创作者，专注于${dna.contentPillar}领域。\n\n我的内容风格：${dna.writingStyle}\n核心受众：${dna.targetAudience}\n历史互动数据：平均互动率${(Math.random() * 5 + 3).toFixed(1)}%，粉丝粘性高。\n\n我注意到贵品牌正在寻找${deal.dealType}领域的KOC合作。基于我过往的内容表现和粉丝画像，我相信可以为贵品牌带来精准的曝光和高质量的转化。\n\n期待与贵品牌建立长期合作关系！\n\n此致\n敬礼`;
        resolve(letter);
      }, 1500);
    });
  }
};
```

---

### 接口 7：analyzeEmotionCurve —— 情绪曲线分析

**替换实现**：

```typescript
export const analyzeEmotionCurve = async (text: string): Promise<EmotionCurve> => {
  const systemPrompt = `你是一位内容情绪分析专家。分析文本的情绪波动，标注每个关键节点的情绪值和标签。
以JSON输出：
{
  "points": [
    {"time": 0, "emotion": 30, "label": "开篇"},
    {"time": 15, "emotion": 60, "label": "铺垫"},
    // ...至少6个点，time 0-100
  ],
  "peak": 90, // 最高情绪值
  "valley": 30 // 最低情绪值
}

情绪值0=冷静/低落，50=平稳，100=极度兴奋/愤怒/感动。
time表示内容进度百分比（0-100）。`;

  const userPrompt = `分析以下内容的情绪曲线：\n\n${text}\n\n返回JSON格式。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.3,
      max_tokens: 1024,
    });
    return extractJSON<EmotionCurve>(response);
  } catch (err) {
    console.warn('[analyzeEmotionCurve] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          points: [
            { time: 0, emotion: 30, label: '开篇' },
            { time: 15, emotion: 60, label: '铺垫' },
            { time: 30, emotion: 85, label: '高潮' },
            { time: 45, emotion: 40, label: '转折' },
            { time: 60, emotion: 90, label: '爆点' },
            { time: 75, emotion: 70, label: '收尾' },
          ],
          peak: 90,
          valley: 30,
        });
      }, 1800);
    });
  }
};
```

---

### 接口 8：deconstructCompetitor —— 竞品爆款解构

**替换实现**：

```typescript
export const deconstructCompetitor = async (urlOrText: string): Promise<CompetitorAnalysis> => {
  const systemPrompt = `你是一位社交媒体爆款解构专家。分析竞品内容的成功要素。
以JSON输出：
{
  "titleFormula": "标题公式，如：悬念词+数字+痛点+emoji",
  "coverComposition": "封面构图描述",
  "emotionRhythm": "情绪节奏描述",
  "interactionHook": "互动钩子设计",
  "keywordStrategy": ["关键词策略1", "关键词策略2", "关键词策略3"],
  "postingTime": "最佳发布时间建议"
}`;

  const userPrompt = `请解构以下竞品内容的爆款公式：\n\n${urlOrText}\n\n返回JSON格式。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.5,
      max_tokens: 2048,
    });
    return extractJSON<CompetitorAnalysis>(response);
  } catch (err) {
    console.warn('[deconstructCompetitor] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          titleFormula: '悬念词 + 数字 + 痛点 + emoji',
          coverComposition: '人物居中 + 大字标题覆盖 + 高饱和背景',
          emotionRhythm: '前3秒制造焦虑 → 中间展示解决方案 → 结尾情感升华',
          interactionHook: '结尾提问"你们觉得呢？" + 投票引导',
          keywordStrategy: ['热点词', '品类词', '场景词', '情绪词'],
          postingTime: '晚8-10点，周末流量高峰',
        });
      }, 2200);
    });
  }
};
```

---

### 接口 9：predictBestTiming —— 发布时机推荐

**替换实现**：

```typescript
export const predictBestTiming = async (topic: string): Promise<TimingRecommendation> => {
  const systemPrompt = `你是一位社交媒体发布策略专家。根据主题推荐最佳发布时机。
以JSON输出：
{
  "bestTime": "20:30-21:30",
  "bestDay": "周四/周五",
  "hotEvents": ["相关热点1", "相关热点2"],
  "competitorActivity": "竞品发布规律分析",
  "reasoning": "推荐理由，100字以内"
}`;

  const userPrompt = `主题为"${topic}"，请推荐最佳发布时机。考虑：\n1. 目标受众活跃时段\n2. 同类内容竞争情况\n3. 近期相关热点事件\n\n返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.4,
      max_tokens: 1024,
    });
    return extractJSON<TimingRecommendation>(response);
  } catch (err) {
    console.warn('[predictBestTiming] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          bestTime: '20:30-21:30',
          bestDay: '周四/周五',
          hotEvents: ['双十一预热', '国庆出游', '开学季'],
          competitorActivity: '同类内容集中在周末发布，错峰发布竞争更小',
          reasoning: `基于粉丝活跃数据和${topic}类目历史表现，工作日晚间+周四错峰发布的完播率比周末高23%`,
        });
      }, 1500);
    });
  }
};
```

---

### 接口 10：generateVideoScript —— AI 一键成片工坊

**替换实现**：

```typescript
export const generateVideoScript = async (content: string, platform: string): Promise<VideoScript> => {
  const systemPrompt = `你是一位短视频脚本策划专家。将内容主题转化为完整的分镜脚本。
以JSON输出：
{
  "scenes": [
    {
      "timestamp": "0:00",
      "duration": 3,
      "visual": "画面描述",
      "voiceover": "旁白/口播文案",
      "caption": "屏幕字幕",
      "bgm": "背景音乐风格"
    }
  ],
  "totalDuration": 23,
  "hook": "前3秒钩子文案",
  "cta": "结尾引导行动文案"
}

要求：
- 总时长15-60秒
- 前3秒必须有强钩子
- 每镜3-8秒
- 字幕要有网感`;

  const userPrompt = `请为"${content}"生成${platform}平台的短视频分镜脚本。\n\n返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.8,
      max_tokens: 4096,
    });
    return extractJSON<VideoScript>(response);
  } catch (err) {
    console.warn('[generateVideoScript] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          scenes: [
            { timestamp: '0:00', duration: 3, visual: '悬念特写镜头', voiceover: '你知道吗？90%的人做这个都错了...', caption: '🔥 震惊！原来我们都错了', bgm: '紧张悬疑' },
            { timestamp: '0:03', duration: 5, visual: '问题展示画面', voiceover: content.slice(0, 50), caption: '问题：' + content.slice(0, 30), bgm: '节奏渐强' },
            { timestamp: '0:08', duration: 8, visual: '解决方案演示', voiceover: '今天教你一招，轻松解决...', caption: '✅ 解决方案来了', bgm: '轻快明快' },
            { timestamp: '0:16', duration: 4, visual: '效果对比画面', voiceover: '看，效果立竿见影！', caption: '📈 效果对比', bgm: '高潮澎湃' },
            { timestamp: '0:20', duration: 3, visual: '引导关注画面', voiceover: '关注我，下期教你更多干货', caption: '➕ 关注不迷路', bgm: '温馨收尾' },
          ],
          totalDuration: 23,
          hook: '你知道吗？90%的人做这个都错了...',
          cta: '关注我，下期教你更多干货',
        });
      }, 2000);
    });
  }
};
```

---

### 接口 11：deconstructViral —— 爆款克隆器（解构）

**替换实现**：

```typescript
export const deconstructViral = async (urlOrText: string): Promise<ViralDeconstruction> => {
  const systemPrompt = `你是一位爆款内容拆解专家。深度解构一条爆款内容的底层逻辑。
以JSON输出：
{
  "titleFormula": "标题公式",
  "hookType": "钩子类型",
  "emotionArc": ["情绪1(0-3s)", "情绪2(3-8s)", ...],
  "interactionTriggers": ["互动设计1", "互动设计2"],
  "keywordStrategy": ["关键词策略1", ...],
  "coverStyle": "封面风格",
  "optimalLength": "最佳时长",
  "bestPostingTime": "最佳发布时间"
}`;

  const userPrompt = `深度解构以下爆款内容：\n${urlOrText}\n\n返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, { temperature: 0.5, max_tokens: 2048 });
    return extractJSON<ViralDeconstruction>(response);
  } catch (err) {
    console.warn('[deconstructViral] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          titleFormula: '悬念数字 + 痛点 + emoji',
          hookType: '反常识开头（挑战认知）',
          emotionArc: ['好奇(0-3s)', '焦虑(3-8s)', '希望(8-15s)', '兴奋(15-20s)', '满足(20-25s)'],
          interactionTriggers: ['结尾提问', '投票引导', '评论区挖坑', '制造争议点'],
          keywordStrategy: ['热搜词', '痛点词', '行业词', '情绪词'],
          coverStyle: '大字标题 + 人物表情 + 高饱和背景',
          optimalLength: '15-25秒',
          bestPostingTime: '晚8-10点',
        });
      }, 2500);
    });
  }
};
```

---

### 接口 12：generateClone —— 爆款克隆器（生成）

**替换实现**：

```typescript
export const generateClone = async (original: ViralDeconstruction, topic: string): Promise<any> => {
  const systemPrompt = `你是一位爆款复刻专家。根据已解构的爆款公式，为新主题创作一条遵循相同底层逻辑的内容。
直接返回JSON：
{
  "title": "爆款标题",
  "hook": "开头钩子",
  "body": "正文内容",
  "cta": "结尾引导"
}`;

  const userPrompt = `新主题：${topic}
参考的爆款公式：
- 标题公式：${original.titleFormula}
- 钩子类型：${original.hookType}
- 情绪弧线：${original.emotionArc.join(' → ')}
- 互动设计：${original.interactionTriggers.join('、')}
- 关键词策略：${original.keywordStrategy.join('、')}
- 封面风格：${original.coverStyle}

请创作一条新内容，严格遵循上述公式。返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, { temperature: 0.85, max_tokens: 2048 });
    return extractJSON(response);
  } catch (err) {
    console.warn('[generateClone] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: `关于${topic}，99%的人都不知道这3个秘密...`,
          hook: `你还在用老方法做${topic}？难怪没效果！`,
          body: `今天分享一个颠覆认知的${topic}方法...`,
          cta: '你觉得这个方法怎么样？评论区告诉我！',
        });
      }, 1500);
    });
  }
};
```

---

### 接口 13：generateByEmotionCurve —— 情绪节奏编辑器

**替换实现**：

```typescript
export const generateByEmotionCurve = async (points: EmotionPoint[], topic: string): Promise<string> => {
  const systemPrompt = `你是一位情绪编剧。根据指定的情绪节点，创作一段文字内容。
每个节点对应一个内容段落，情绪值决定语气和措辞强度。
直接输出内容文本，段落之间用换行分隔。`;

  const curveDesc = points.map(p => `[${p.label}] 情绪值${p.emotion}/100`).join('\n');
  const userPrompt = `主题：${topic}\n\n情绪节奏要求：\n${curveDesc}\n\n请创作内容，确保每个段落匹配对应的情绪值。`;

  try {
    return await glmChat(systemPrompt, userPrompt, { temperature: 0.8, max_tokens: 4096 });
  } catch (err) {
    console.warn('[generateByEmotionCurve] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const segments = points.map((p, i) => {
          const moods = ['平静铺垫', '制造悬念', '情绪升级', '高潮爆发', '情感回落', '温暖收尾'];
          return `[${p.label}] ${moods[i % moods.length]}：${topic}的${p.emotion > 70 ? '精彩' : p.emotion > 40 ? '关键' : '基础'}时刻`;
        });
        resolve(segments.join('\n'));
      }, 1800);
    });
  }
};
```

---

### 接口 14：generateTitles —— 智能标题工厂

**替换实现**：

```typescript
export const generateTitles = async (content: string, count: number = 20): Promise<TitleOption[]> => {
  const systemPrompt = `你是一位标题策划大师。为主题创作多个不同风格的爆款标题。
以JSON数组输出，每个标题包含评分和类型：
[
  {
    "title": "标题文案",
    "score": 85, // 0-100预估点击率
    "type": "悬念型/数字型/痛点型/反常识型/对比型/疑问型/情绪型/权威型",
    "hook": "前3秒吸引点说明"
  }
]

评分标准：悬念感、好奇心、痛点共鸣、数字冲击力、口语化程度。
必须返回${count}个标题。`;

  const userPrompt = `请为"${content}"创作${count}个爆款标题。\n\n返回JSON数组。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.95, // 高创意
      max_tokens: 4096,
    });
    const titles = extractJSON<TitleOption[]>(response);
    return titles.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.warn('[generateTitles] GLM失败，降级到Mock:', err);
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
```

---

### 接口 15：adaptToPlatforms —— 跨平台自动适配

**替换实现**：

```typescript
export const adaptToPlatforms = async (content: string, platforms: string[]): Promise<PlatformVersion[]> => {
  const systemPrompt = `你是一位跨平台内容适配专家。将同一主题适配为不同平台的风格。
以JSON数组输出：
[
  {
    "platform": "平台名",
    "title": "平台专属标题",
    "body": "平台专属正文",
    "hashtags": ["#标签1"],
    "tips": "该平台发布技巧提示"
  }
]`;

  const userPrompt = `请将以下内容适配到 ${platforms.join('、')} 平台：\n\n${content}\n\n返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.8,
      max_tokens: 4096,
    });
    return extractJSON<PlatformVersion[]>(response);
  } catch (err) {
    console.warn('[adaptToPlatforms] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        // 原有Mock降级逻辑保留...
        const adapters: Record<string, PlatformVersion> = {
          '小红书': { platform: '小红书', title: `关于${content.slice(0, 10)}...｜良心分享`, body: `姐妹们！今天必须和你们分享这个${content.slice(0, 20)}...\n\n✨ 亲测有效\n💡 操作简单\n📸 拍照绝美\n\n记得收藏！`, hashtags: ['#种草', '#干货分享', '#好物推荐', '#生活记录'], tips: '多用emoji，标题带｜分隔，结尾引导收藏' },
          '抖音': { platform: '抖音', title: `${content.slice(0, 10)}的真相，99%的人都不知道！`, body: `家人们！这个${content.slice(0, 15)}我真的要吐槽一下...\n\n你是不是也经常遇到这种情况？\n评论区告诉我！`, hashtags: ['#涨知识', '#内容过于真实', '#一定要看到最后'], tips: '前3秒必须有钩子，多用短句，结尾提问' },
          '朋友圈': { platform: '朋友圈', title: content.slice(0, 15), body: `今天想分享一个${content.slice(0, 20)}的心得...\n\n生活小感悟，觉得有用可以点赞👍`, hashtags: [], tips: '生活化语气，配实拍图，少标签' },
          '领英': { platform: '领英', title: `深度解析：${content.slice(0, 15)}的行业方法论`, body: `基于过去3个月的实践，我总结了${content.slice(0, 15)}的3个关键洞察：\n\n1. 数据驱动决策\n2. 用户体验优先\n3. 持续迭代优化\n\n欢迎在评论区交流观点。`, hashtags: ['#职场干货', '#行业洞察', '#方法论'], tips: '专业严谨，数据支撑，观点明确' },
        };
        resolve(platforms.map(p => adapters[p] || adapters['小红书']));
      }, 1800);
    });
  }
};
```

---

### 接口 16：generateCovers —— AI 封面实验室

**替换实现**：

```typescript
export const generateCovers = async (content: string): Promise<CoverDesign[]> => {
  const systemPrompt = `你是一位社交媒体视觉设计师。为内容主题设计3个不同风格的封面方案。
以JSON数组输出：
[
  {
    "description": "封面视觉描述，50字以内",
    "colors": ["#FF2A6D", "#FFD700", "#0A0A0F"],
    "layout": "布局说明",
    "score": 92, // 预估点击率 0-100
    "reason": "设计理由"
  }
]`;

  const userPrompt = `为"${content}"设计3个社交媒体封面方案。\n\n要求：\n1. 方案1：情绪冲击型（高饱和、强对比）\n2. 方案2：信息对比型（Before/After、清单式）\n3. 方案3：高级质感型（深色背景、精致排版）\n\n返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.7,
      max_tokens: 2048,
    });
    return extractJSON<CoverDesign[]>(response);
  } catch (err) {
    console.warn('[generateCovers] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            description: `大字标题"${content.slice(0, 10)}..." + 人物惊讶表情 + 红色高饱和背景`,
            colors: ['#FF2A6D', '#FFD700', '#0A0A0F'],
            layout: '标题居中大字 + 人物右侧半身 + 底部标签',
            score: 92,
            reason: '情绪冲击力强，红色触发点击欲望',
          },
          {
            description: `对比图左右排列 + "Before/After"标签 + 蓝白配色`,
            colors: ['#00F0FF', '#FFFFFF', '#12121A'],
            layout: '左右对比 + 中间大箭头 + 顶部标题',
            score: 88,
            reason: '对比直观，适合干货类内容',
          },
          {
            description: `产品特写 + 悬浮数字标签 + 深色高级质感背景`,
            colors: ['#BD00FF', '#FFD700', '#0A0A0F'],
            layout: '产品居中 + 环绕式标签 + 底部渐隐',
            score: 85,
            reason: '高级感强，适合种草类内容',
          },
        ]);
      }, 1500);
    });
  }
};
```

---

### 接口 17：simulateComments —— 评论区预演

**替换实现**：

```typescript
export const simulateComments = async (content: string): Promise<SimulatedComment[]> => {
  const systemPrompt = `你是一位社区运营专家。模拟一条内容发布后可能收到的10条评论。
包含：好评、提问、质疑、段子等真实评论类型。
对每条评论给出建议回复。

以JSON数组输出：
[
  {
    "type": "positive/question/challenge/joke",
    "text": "评论内容",
    "suggestedReply": "建议回复"
  }
]`;

  const userPrompt = `内容：\n${content}\n\n请模拟10条可能的评论及建议回复。返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.9, // 高多样性
      max_tokens: 4096,
    });
    return extractJSON<SimulatedComment[]>(response);
  } catch (err) {
    console.warn('[simulateComments] GLM失败，降级到Mock:', err);
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
```

---

### 接口 18：getOptimalTiming —— 发布时机预言家（详细时段）

**替换实现**：

```typescript
export const getOptimalTiming = async (topic: string, platform: string): Promise<TimeSlot[]> => {
  const systemPrompt = `你是一位发布时机策略师。分析主题和平台，推荐6个最佳发布时段。
以JSON数组输出：
[
  {
    "hour": "20:30",
    "score": 95, // 0-100匹配度
    "reason": "推荐理由",
    "competition": "低/中等/激烈"
  }
]`;

  const userPrompt = `主题：${topic}\n平台：${platform}\n\n请推荐6个发布时段并排序。返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.4,
      max_tokens: 1024,
    });
    const slots = extractJSON<TimeSlot[]>(response);
    return slots.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.warn('[getOptimalTiming] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { hour: '07:30', score: 75, reason: '早高峰通勤时间', competition: '中等' },
          { hour: '12:00', score: 82, reason: '午休刷机高峰', competition: '激烈' },
          { hour: '17:30', score: 78, reason: '下班通勤时段', competition: '中等' },
          { hour: '20:30', score: 95, reason: '黄金时段，用户最活跃', competition: '激烈' },
          { hour: '22:00', score: 88, reason: '睡前刷机时间', competition: '较低' },
          { hour: '00:30', score: 65, reason: '深夜党活跃', competition: '低' },
        ].sort((a, b) => b.score - a.score));
      }, 1200);
    });
  }
};
```

---

### 接口 19：predictHeat —— 热点预埋雷达

**替换实现**：

```typescript
export const predictHeat = async (topic: string): Promise<HeatPrediction[]> => {
  const systemPrompt = `你是一位热点预测专家。分析主题，预测3个可能爆发的相关话题。
以JSON数组输出：
[
  {
    "topic": "预测话题",
    "predictedHeat": 95, // 0-100热度预测
    "hoursUntilPeak": 12, // 距峰值小时数
    "confidence": 88, // 0-100置信度
    "action": "行动建议",
    "competition": 5 // 竞争程度 1-20
  }
]`;

  const userPrompt = `基础主题：${topic}\n\n请预测3个可能爆发的相关话题，给出行动建议。返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.6,
      max_tokens: 1024,
    });
    return extractJSON<HeatPrediction[]>(response);
  } catch (err) {
    console.warn('[predictHeat] GLM失败，降级到Mock:', err);
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
```

---

### 接口 20：getCompetitorUpdates —— 竞品监控站

**替换实现**：

```typescript
export const getCompetitorUpdates = async (competitors: string[]): Promise<CompetitorUpdate[]> => {
  const systemPrompt = `你是一位竞品情报分析师。根据提供的竞品账号名，模拟其最新爆款内容数据。
以JSON数组输出：
[
  {
    "author": "竞品名",
    "title": "爆款标题",
    "likes": 3500,
    "heatScore": 85, // 0-100
    "deconstruction": {
      "titleFormula": "公式",
      "hookType": "钩子",
      "emotionArc": ["情绪1", "情绪2"],
      "interactionTriggers": ["互动1"],
      "keywordStrategy": ["关键词1"],
      "coverStyle": "封面",
      "optimalLength": "时长",
      "bestPostingTime": "时间"
    },
    "timestamp": "2小时前"
  }
]`;

  const userPrompt = `请模拟以下竞品账号的最新爆款数据：\n${competitors.join('\n')}\n\n返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.7,
      max_tokens: 4096,
    });
    return extractJSON<CompetitorUpdate[]>(response);
  } catch (err) {
    console.warn('[getCompetitorUpdates] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(competitors.map((c, i) => ({
          author: c,
          title: `【今日爆款】${c}发布了关于${['美妆', '数码', '旅行', '美食', '职场'][i % 5]}的内容`,
          likes: Math.floor(Math.random() * 5000 + 1000),
          heatScore: Math.floor(Math.random() * 30 + 70),
          deconstruction: {
            titleFormula: '数字+痛点+emoji',
            hookType: '反常识',
            emotionArc: ['好奇', '焦虑', '希望', '满足'],
            interactionTriggers: ['结尾提问'],
            keywordStrategy: ['热搜词'],
            coverStyle: '大字标题',
            optimalLength: '15-20秒',
            bestPostingTime: '晚8-10点',
          },
          timestamp: '2小时前',
        })));
      }, 2000);
    });
  }
};
```

---

### 接口 21：generateTopicBank —— 选题素材库

**替换实现**：

```typescript
export const generateTopicBank = async (count: number = 100): Promise<TopicCard[]> => {
  const systemPrompt = `你是一位选题策划专家。为KOC创作者生成一批高质量选题。
以JSON数组输出：
[
  {
    "id": "topic_1",
    "title": "选题标题",
    "category": "季节/节日/热点/常青/职场/生活",
    "difficulty": "easy/medium/hard",
    "estimatedTraffic": 5000,
    "competitionLevel": "low/medium/high",
    "seasonality": "春季/夏季/秋季/冬季/全年"
  }
]`;

  const userPrompt = `请生成${count}个适合小红书/抖音KOC的选题。\n要求：\n1. 标题有吸引力\n2. 覆盖不同难度和竞争度\n3. 有季节属性\n\n返回JSON数组。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.85,
      max_tokens: 8192, // 100条需要较大token
    });
    return extractJSON<TopicCard[]>(response);
  } catch (err) {
    console.warn('[generateTopicBank] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const topics = [
          '5个你不知道的化妆小技巧', '打工人必备效率工具清单', '新手如何拍出氛围感照片',
          '30天减脂计划（附食谱）', '面试穿搭避雷指南', '独居生活幸福感好物',
          '职场沟通话术大全', '手机拍照构图技巧', '如何在30岁前存到第一个10万',
          '社恐人士社交破冰技巧',
        ];
        resolve(Array.from({ length: count }, (_, i) => ({
          id: `topic_${i}`,
          title: topics[i % topics.length] + (i >= topics.length ? ` ${Math.floor(i / topics.length) + 1}` : ''),
          category: ['季节', '节日', '热点', '常青', '职场', '生活'][i % 6],
          difficulty: ['easy', 'easy', 'medium', 'medium', 'hard'][i % 5] as 'easy' | 'medium' | 'hard',
          estimatedTraffic: Math.floor(Math.random() * 10000 + 1000),
          competitionLevel: ['low', 'low', 'medium', 'medium', 'high'][i % 5] as 'low' | 'medium' | 'high',
          seasonality: ['春季', '夏季', '秋季', '冬季', '全年'][i % 5],
        })));
      }, 2200);
    });
  }
};
```

---

### 接口 22：simulateAlgorithm —— 平台算法模拟器

**替换实现**：

```typescript
export const simulateAlgorithm = async (content: any, platform: string): Promise<AlgorithmPrediction> => {
  const systemPrompt = `你是一位平台算法分析师。根据内容特征和平台特性，预测算法推荐表现。
以JSON输出：
{
  "platform": "平台名",
  "trafficPool": "流量池层级（如：流量池C-大推荐）",
  "estimatedViews": 15000,
  "recommended": true,
  "reasons": ["进入流量池原因1", "原因2"],
  "optimizationTips": ["优化建议1", "优化建议2"]
}`;

  const userPrompt = `平台：${platform}\n内容：${JSON.stringify(content)}\n\n预测算法表现。返回JSON。`;

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.4,
      max_tokens: 1024,
    });
    return extractJSON<AlgorithmPrediction>(response);
  } catch (err) {
    console.warn('[simulateAlgorithm] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const score = Math.floor(Math.random() * 40 + 60);
        resolve({
          platform,
          trafficPool: score > 80 ? '流量池C（大推荐）' : score > 60 ? '流量池B（中推荐）' : '流量池A（小推荐）',
          estimatedViews: score > 80 ? Math.floor(Math.random() * 50000 + 10000) : score > 60 ? Math.floor(Math.random() * 10000 + 2000) : Math.floor(Math.random() * 2000 + 500),
          recommended: score > 60,
          reasons: score > 80 ? ['标题吸引力强', '封面视觉冲击', '互动率高'] : score > 60 ? ['内容质量不错', '标签精准'] : ['竞争激烈', '同类内容过多'],
          optimizationTips: score > 80 ? ['保持当前风格', '增加互动引导'] : score > 60 ? ['优化前3秒钩子', '增加emoji密度'] : ['更换标题角度', '调整发布时间', '增加差异化内容'],
        });
      }, 2000);
    });
  }
};
```

---

### 接口 23：generateWeeklyPlan —— AI 运营驾驶舱

**替换实现**：

```typescript
export const generateWeeklyPlan = async (dna?: DNAProfile): Promise<WeeklyPlan[]> => {
  const systemPrompt = `你是一位KOC运营规划师。根据创作者人设，制定一周内容发布计划。
以JSON数组输出7天的计划：
[
  {
    "day": "周一",
    "topic": "选题",
    "platform": "发布平台",
    "status": "planned",
    "predictedEngagement": 2500
  }
]`;

  const userPrompt = dna
    ? `请为以下人设制定一周发布计划：\n语气：${dna.tone}\n内容支柱：${dna.contentPillar}\n受众：${dna.targetAudience}\n风格：${dna.writingStyle}`
    : '请制定一份通用的KOC一周发布计划。';

  try {
    const response = await glmChat(systemPrompt, userPrompt, {
      temperature: 0.7,
      max_tokens: 2048,
    });
    return extractJSON<WeeklyPlan[]>(response);
  } catch (err) {
    console.warn('[generateWeeklyPlan] GLM失败，降级到Mock:', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        resolve(days.map((day, i) => ({
          day,
          topic: ['干货分享', '生活记录', '产品测评', '话题讨论', '教程教学', '周末Vlog', '复盘总结'][i],
          platform: ['小红书', '抖音', '小红书', '朋友圈', '抖音', '小红书', '领英'][i],
          status: 'planned' as const,
          predictedEngagement: Math.floor(Math.random() * 3000 + 500),
        })));
      }, 1800);
    });
  }
};
```

---

### 接口 24：analyzeFanEvolution —— 粉丝画像进化器

**替换实现**：

```typescript
export const analyzeFanEvolution = async (): Promise<FanSegment[]> => {
  const systemPrompt = `你是一位用户增长分析师。分析创作者的粉丝构成和进化趋势。
以JSON数组输出粉丝 segments：
[
  {
    "label": "粉丝群体名称",
    "percentage": 35,
    "interests": ["兴趣1", "兴趣2", "兴趣3"],
    "activeTime": "活跃时段",
    "engagementRate": 8.5
  }
]`;

  try {
    const response = await glmChat(systemPrompt, '请分析当前创作者的粉丝画像构成。', {
      temperature: 0.4,
      max_tokens: 1024,
    });
    return extractJSON<FanSegment[]>(response);
  } catch (err) {
    console.warn('[analyzeFanEvolution] GLM失败，降级到Mock:', err);
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
```

---

### 接口 25：getContentBank + suggestRepurposing —— 内容资产银行

**替换实现**：

```typescript
export const getContentBank = async (): Promise<ContentAsset[]> => {
  const systemPrompt = `你是一位内容资产管理专家。列出创作者的历史内容资产。
以JSON数组输出：
[
  {
    "id": "1",
    "title": "内容标题",
    "platform": "小红书",
    "createdAt": "2024-01-15",
    "tags": ["标签1", "标签2"],
    "performance": 8900,
    "repurposedCount": 3
  }
]`;

  try {
    const response = await glmChat(systemPrompt, '请列出5条历史内容资产数据。', {
      temperature: 0.4,
      max_tokens: 1024,
    });
    return extractJSON<ContentAsset[]>(response);
  } catch (err) {
    console.warn('[getContentBank] GLM失败，降级到Mock:', err);
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

export const suggestRepurposing = async (assetId: string): Promise<string[]> => {
  const systemPrompt = `你是一位内容复用专家。为指定内容资产推荐5种改编复用方案。直接返回JSON字符串数组。`;

  try {
    const response = await glmChat(systemPrompt, `内容ID：${assetId}\n请推荐5种复用改编方案。返回JSON字符串数组。`, {
      temperature: 0.8,
      max_tokens: 1024,
    });
    return extractJSON<string[]>(response);
  } catch (err) {
    console.warn('[suggestRepurposing] GLM失败，降级到Mock:', err);
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
```

---

## 五、GLM-image 图片生成场景配置

### 5.1 修改 `src/services/imageGen.ts`

将 `generateImage` 函数改为调用 `glmImage`：

```typescript
import { glmImage } from './glmClient';

export async function generateImage(
  prompt: string,
  _config?: Partial<ImageGenConfig>
): Promise<string> {
  // 自动加上风格前缀，提升生成质量
  const enhancedPrompt = `社交媒体配图，${prompt}，高品质，专业摄影风格，适合小红书/抖音`;
  try {
    return await glmImage(enhancedPrompt, '1280x1280');
  } catch (err) {
    console.warn('[generateImage] GLM-image失败，返回占位图:', err);
    return '/avatar-default.png';
  }
}

export async function generatePostCover(
  topic: string,
  style: keyof typeof IMAGE_STYLES = 'xiaohongshu',
  _config?: Partial<ImageGenConfig>
): Promise<string> {
  const stylePrompt = IMAGE_STYLES[style] || IMAGE_STYLES.xiaohongshu;
  const enhancedPrompt = `${stylePrompt}，${topic}主题封面图，高品质，吸引人的视觉设计`;
  try {
    return await glmImage(enhancedPrompt, '1024x1024');
  } catch (err) {
    console.warn('[generatePostCover] GLM-image失败:', err);
    return '/avatar-default.png';
  }
}
```

### 5.2 六大图片生成场景

| 场景 | 调用函数 | Prompt 模板 | 尺寸 |
|------|---------|------------|------|
| 推文配图 | `generatePostCover` | `小红书风格，{topic}，清新明亮，生活方式摄影` | 1024x1024 |
| 用户头像 | `generateAvatar` | `头像照片，{description}，高质量，正面照，简洁背景` | 1024x1024 |
| 封面设计 | `generateCovers` + `glmImage` | `社交媒体封面，{topic}，大字标题设计，高饱和度` | 1280x1280 |
| 电影海报 | `glmImage` | `电影院风格海报，{movieTitle}，赛博朋克美学，霓虹灯` | 1024x1536 |
| 商城皮肤 | `glmImage` | `未来科技感UI皮肤，青蓝色调，极简设计` | 1024x1024 |
| 经纪人形象 | `glmImage` | `二次元动漫角色，{brokerName}，赛博朋克风格，科技感服装` | 1024x1024 |

---

## 六、大 V 研讨室 10 人格 System Prompt（Workshop.tsx）

在 `src/pages/Workshop.tsx` 中，大V研讨室的每个专家需要有自己的 System Prompt。以下是 10 个真实风格的预设：

```typescript
export const EXPERT_PROMPTS: Record<string, string> = {
  '李笑来': `你是李笑来，区块链投资人、畅销书作家。你的语言风格：
- 善用类比，把复杂概念讲得通俗易懂
- 强调"长期主义"和"复利效应"
- 常用"你要知道..."、"本质上..."等表达
- 说话有哲学感，但接地气
- 会引用自己的投资经历和书籍观点`,

  '罗永浩': `你是罗永浩，科技测评博主、前脱口秀演员。你的语言风格：
- 幽默犀利，敢于吐槽
- 理想主义色彩浓厚，追求极致
- 常用"坦率地讲..."、"说实话..."
- 有"相声式"的节奏感，铺垫+包袱+升华
- 对科技产品评价一针见血`,

  'papi酱': `你是papi酱，短视频女王、搞笑博主。你的语言风格：
- 语速快、信息密度高、吐槽精准
- 模仿各种社会角色（宝妈、职场人、学生）
- 常用"朋友们！"、"我真的是..."
- 内容聚焦年轻人日常痛点
- 结尾常有反转或共鸣升华`,

  '李子柒': `你是李子柒，田园生活博主、文化传播者。你的语言风格：
- 几乎不说话，用画面和字幕表达
- 文字风格：诗意、宁静、留白感
- 常用"又是一年春来到..."等时令感表达
- 强调传统文化和手工技艺
- 语气温柔但有力，治愈系`,

  '何同学': `你是何同学，科技测评UP主、视觉创意人。你的语言风格：
- 少年感十足，有点害羞但真诚
- "我有一个想法..."式开头
- 擅长把枯燥科技变成浪漫故事
- 视觉表达优先，文字辅助画面
- 结尾常有升华，连接科技与人文`,

  '半佛仙人': `你是半佛仙人，互联网观察者、财经博主。你的语言风格：
- 理性毒舌，用数据和逻辑打脸
- "先说结论..."式结构化表达
- 善用商业分析框架（SWOT、PEST等）
- 幽默中带刺，刺中有理
- 结尾常有"这个世界就是这样"式总结`,

  '罗振宇': `你是罗振宇，知识IP创始人。你的语言风格：
- 跨年演讲式的大叙事
- 善用"时间的朋友"等概念包装
- "我今天要给你讲一个..."故事开头
- 知识密度高，但力求有趣
- 强调"终身学习"和"知识就是力量"`,

  '董宇辉': `你是董宇辉，东方甄选主播、文艺带货人。你的语言风格：
- 带货时讲人生哲理和诗词
- 从一颗玉米讲到童年、故乡、亲人
- 语言如诗，情感真挚
- "当你背单词时，阿拉斯加的鳕鱼正跃出水面..."
- 把商品变成情感载体`,

  '手工耿': `你是手工耿，脑洞发明家。你的语言风格：
- "自制XXX，包你满意！"
- 一本正经地展示"无用发明"
- 河北口音感的朴实表达
- 自嘲式幽默
- "虽然没什么用，但挺有意思的"`,

  '新华社': `你是新华社官方账号。你的语言风格：
- 新闻体：简洁、客观、权威
- 倒金字塔结构：结论先行
- 不用emoji，不用网络流行语
- 数据准确，来源可靠
- 标题直接点明事件，不加悬念`,
};
```

> 在 Workshop.tsx 中，当用户与某位专家研讨时，将该专家的 System Prompt 作为 `glmChat` 的 `systemPrompt` 参数传入，实现**真正的风格化对话**。

---

## 七、AgentOrb 右下角经纪人同步

在 `src/components/AgentOrb.tsx` 中，右下角悬浮 Agent 需要同步当前选中的经纪人（凌霄/梦璃），并使用对应的人格对话。

```typescript
const BROKER_PROMPTS: Record<string, string> = {
  '凌霄': `你是凌霄，一位专业的MCN男经纪人。你的特点：
- 说话直接、高效，偶尔毒舌但为你好
- 擅长数据分析和商业策略
- 常用"数据不会骗人"、"听我的"
- 对内容质量要求高，会一针见血指出问题
- 男生视角，偏理性`,

  '梦璃': `你是梦璃，一位温柔的MCN女经纪人。你的特点：
- 说话温柔但有主见，像大姐姐
- 擅长情绪洞察和用户心理
- 常用"我觉得你可以..."、"试试看"
- 注重细节和审美，对封面、配色很敏感
- 女生视角，偏感性`,
};

// 读取localStorage中的经纪人选择
const broker = localStorage.getItem('pcg_broker_choice') || '凌霄';
const systemPrompt = BROKER_PROMPTS[broker] || BROKER_PROMPTS['凌霄'];

// 调用GLM时传入对应的systemPrompt
const response = await glmChat(systemPrompt, userMessage, { temperature: 0.8 });
```

---

## 八、实施步骤（按此顺序执行）

### Step 1：环境准备
1. 在项目根目录创建 `.env` 文件，填入你的 GLM API Key
2. 确保 `VITE_GLM_API_KEY` 已配置

### Step 2：安装（无需额外依赖）
项目已使用原生 `fetch`，无需安装 axios 等 HTTP 库。

### Step 3：创建基础客户端
1. 创建 `src/services/glmClient.ts`（见第三节完整代码）
2. 导出 `glmChat`、`glmImage`、`extractJSON`、`checkGLMHealth`

### Step 4：替换 aiMock.ts（核心步骤）
1. 打开 `src/services/aiMock.ts`
2. 在文件顶部添加：`import { glmChat, extractJSON } from './glmClient';`
3. 逐个替换 19 个接口的内部实现（参考第四节的完整代码）
4. **保留原有 setTimeout Mock 代码作为 fallback**（放在 catch 块中）

### Step 5：替换 imageGen.ts
1. 修改 `generateImage` 和 `generatePostCover` 为调用 `glmImage`（见第五节）

### Step 6：替换 llm.ts
1. 将 `chatCompletion` 改为调用 `glmChat`
2. 将 `streamCompletion` 改为 SSE 调用（可选，后续迭代）

### Step 7：配置 Workshop.tsx 专家人格
1. 添加 `EXPERT_PROMPTS` 对象（见第六节）
2. 在研讨对话中传入对应专家的 System Prompt

### Step 8：配置 AgentOrb.tsx
1. 添加 `BROKER_PROMPTS` 对象（见第七节）
2. 读取 `localStorage.getItem('pcg_broker_choice')` 选择对应 Prompt

### Step 9：测试
1. 运行 `npm run dev`
2. 打开浏览器控制台，检查 GLM 调用日志
3. 测试各页面功能是否正常
4. 断网测试降级策略（Mock 是否正常 fallback）

---

## 九、错误处理与降级策略总结

| 层级 | 策略 | 实现 |
|------|------|------|
| L1 | 请求超时 | 30秒AbortController超时 |
| L2 | 首次失败 | 等待1秒后重试 |
| L3 | 二次失败 | 降级到 `glm-4.7-flashx` 模型 |
| L4 | 三次失败 | 降级到原有 Mock 数据 |
| L5 | API Key 缺失 | 直接返回 Mock，控制台提示 |

**关键原则**：用户永远能看到结果，即使 GLM 不可用。降级过程对用户透明（前端不报错）。

---

## 十、调试技巧

1. **开启调试模式**：在 `.env` 中设置 `VITE_AI_DEBUG=true`，控制台会打印所有请求和响应
2. **健康检查**：在 AgentHub 页面添加一个"测试 GLM 连接"按钮，调用 `checkGLMHealth()`
3. **Token 用量监控**：在 `glmChat` 返回的 `usage` 中记录每次调用的 token 消耗
4. **响应缓存**：对于不常变化的结果（如 DNA 分析），可添加 localStorage 缓存避免重复调用

---

## 十一、JSON 输出可靠性保证

GLM 有时会在 JSON 外包裹 markdown 代码块（```json ... ```），`extractJSON` 函数已处理以下情况：
1. 纯 JSON 直接解析
2. ` ```json {...} ``` ` 提取
3. ` ``` {...} ``` ` 提取
4. 从文本中提取最外层 `{}` 内容

如果仍然解析失败，会降级到 Mock。建议在所有 JSON 解析任务中使用 `temperature: 0.3-0.5` 降低随机性。

---

**以上是 PCG-创客星球项目接入智谱 GLM API 的完整配置指南。按第八节的步骤顺序执行即可完成全部 19 个接口 + 图片生成 + 专家人格 + 经纪人对话的真实 AI 能力接入。**
