/**
 * Image Generation Service - AI Image creation
 *
 * TODO: 在 Trae 中配置图像生成 API
 * 推荐：DALL-E 3 / Midjourney / Stable Diffusion / 通义万相
 *
 * 触发点：
 * 1. 推文配图生成 (content-lab)
 * 2. 用户头像生成 (onboarding)
 * 3. 经纪人形象变装 (marketplace)
 * 4. P 图/风格迁移 (content-lab - 美妆工作室)
 */

import { glmImage } from './glmClient';

export interface ImageGenConfig {
  /** 推荐：dall-e-3 / midjourney / stable-diffusion / tongyi-wanxiang */
  provider: string;
  apiKey: string;
  defaultParams: {
    width: number;
    height: number;
    /** 默认数字艺术风格 */
    style?: string;
    /** 负面提示词 */
    negativePrompt?: string;
  };
}

/** Default image generation config */
const DEFAULT_CONFIG: Partial<ImageGenConfig> = {
  provider: 'dall-e-3',
  defaultParams: {
    width: 1024,
    height: 1024,
    style: 'digital-art',
    negativePrompt: 'blurry, low quality, text, watermark, distorted',
  },
};

/** Style presets for different content types */
export const IMAGE_STYLES = {
  xiaohongshu: '小红书风格，清新明亮，柔和色调，生活方式摄影',
  douyin: '抖音风格，高饱和度，动态感，年轻化视觉',
  tech: '科技风格，冷色调，未来感，简洁几何',
  food: '美食风格，暖色调，食欲感，精致摆盘',
  fashion: '时尚风格，高级感，杂志编辑风格，强烈视觉',
  minimal: '极简风格，留白，单色调，意境感',
};

function sizeFromConfig(config?: Partial<ImageGenConfig>) {
  const width = config?.defaultParams?.width ?? DEFAULT_CONFIG.defaultParams?.width ?? 1024;
  const height = config?.defaultParams?.height ?? DEFAULT_CONFIG.defaultParams?.height ?? 1024;
  return `${width}x${height}`;
}

/**
 * Generate an image from a text prompt
 * TODO: Implement actual API integration
 */
export async function generateImage(
  prompt: string,
  config?: Partial<ImageGenConfig>
): Promise<string> {
  try {
    return await glmImage(prompt, sizeFromConfig(config));
  } catch {
    return '/avatar-default.png';
  }
}

/**
 * Generate avatar from description
 * TODO: Implement avatar generation with face consistency
 */
export async function generateAvatar(
  description: string,
  config?: Partial<ImageGenConfig>
): Promise<string> {
  const avatarPrompt = `头像照片，${description}，高质量，正面照，简洁背景`;
  return generateImage(avatarPrompt, {
    ...config,
    defaultParams: { ...DEFAULT_CONFIG.defaultParams, width: 512, height: 512, ...(config?.defaultParams || {}) },
  });
}

/**
 * Generate post cover image
 * TODO: Implement with style-aware prompting
 */
export async function generatePostCover(
  topic: string,
  style: keyof typeof IMAGE_STYLES = 'xiaohongshu',
  config?: Partial<ImageGenConfig>
): Promise<string> {
  const stylePrompt = IMAGE_STYLES[style] || IMAGE_STYLES.xiaohongshu;
  const coverPrompt = `社交媒体封面图，${topic}，${stylePrompt}，高品质`;
  return generateImage(coverPrompt, config);
}

/** Get API key from environment */
export function getImageGenApiKey(): string {
  // TODO: Configure in Trae environment variables
  return import.meta.env.VITE_IMAGE_GEN_API_KEY || '';
}
