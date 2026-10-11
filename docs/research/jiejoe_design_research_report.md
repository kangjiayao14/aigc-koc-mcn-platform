# JIEJOE 个人网站设计深度研究报告

## 一、网站概述

**网站地址**: https://www.jiejoe.com/home  
**网站类型**: 视觉设计师个人作品集网站  
**技术栈**: Vue.js SPA + 自定义CSS动画  
**设计风格**: 暗黑极客风 + 酸性设计元素 + 新粗野主义排版

---

## 二、视觉风格深度分析

### 2.1 色彩系统

| 色彩角色 | 色值 | 用途 |
|---------|------|------|
| **主背景色** | `#171717` | 页面主背景、卡片背景 |
| **强调色** | `#17f700` | 标题高亮、交互反馈、光晕效果、进度条 |
| **主文字色** | `#f7f7f7` | 大标题、正文、白色元素 |
| **辅助色** | `#ddd` | 网格线、分隔线 |

**色彩运用特点**:
- 极度克制的三色系统，绿色仅作为"点睛之笔"使用
- 大面积深色背景配合荧光绿，营造科技感和视觉冲击力
- 绿色光晕使用径向渐变，从中心向外扩散

### 2.2 字体与排版

**字体栈**:
- **英文字体**: 自定义字体 (Webfont, Impact/Anton 风格，压缩比例宽体)
- **中文字体**: `思源黑体 → 阿里巴巴普惠体 → Microsoft YaHei → PingFang SC → sans-serif`

**排版特征**:
- **基础字号**: `2vmin` (桌面端) / `1vmax` (移动端 ≤3:2 宽高比)
- **大标题**: 使用 `transform: scaleX(1.1)` 进行横向拉伸，增强视觉张力
- **描边文字**: `-webkit-text-stroke` 创建空心/描边效果
- **竖排文字**: `writing-mode: vertical-lr` 用于中文辅助标签
- **字间距**: 英文 `letter-spacing: 0.08rem`，中文 `letter-spacing: 0.1~0.2rem`

### 2.3 间距与布局

- 全局使用 **rem 单位**，基于 vmin/vmax 动态缩放
- **缩放变量系统**: `--scale_nums` 根据屏幕比例动态调整(0.6~1.5)
- **响应式断点**: 基于宽高比 `@media screen and (max-aspect-ratio: X/Y)` 而非传统像素
- 固定导航距顶部 `3.5rem`，左右各 `4rem`
- 大间距留白，内容区域呼吸感极强

---

## 三、交互设计分析

### 3.1 页面加载动画

- **双层幕布**: 绿色背景块 + 黑色背景块覆盖全屏
- **中心图标**: SVG 插图图标配合 "LOADING" 文字
- **消失方式**: 幕布向上/向下滑出，露出主页

### 3.2 平滑滚动系统

- 自定义滚动条: 左侧 `0.3rem` 宽绿色细线，基于 `--p` CSS变量控制进度
- 滚动条公式: `transform: translateY(calc((1 - var(--p)) * -100%))`
- 提示文字: "- Scroll carefully, it's smooth -" / "小心地滑"

### 3.3 导航交互

**固定导航栏**:
- 左上角: Logo (SVG, `mix-blend-mode: difference` 确保任何背景上都可见)
- 右上角: 绿色圆形菜单按钮 + CONTACT胶囊按钮

**菜单按钮动画** (SVG stroke-dasharray 技巧):
```css
/* 汉堡状态 */
line:first-of-type { stroke-dasharray: 13 12 25; transform: translateY(-13%); }
line:nth-of-type(2) { stroke-dasharray: 12.5 0 12.5; transform: translateY(13%); }

/* 关闭状态 */
line:first-of-type { transform: rotate(45deg); stroke-dashoffset: 25; }
line:nth-of-type(2) { transform: rotate(-45deg); stroke-dasharray: 2 21 2; }
```

**CONTACT 按钮悬停效果**:
- 白色层先滑入 (translateX 从 -100% 到 0, 0s delay)
- 绿色层后滑入 (translateX 从 -100% 到 0, 0.1s delay)
- 文字颜色从白变黑，向右位移
- 箭头图标向右飞出并重新出现

### 3.4 全屏菜单面板

- **入场**: 从底部 `translateY(100%)` 滑入，圆角顶部 `10rem`
- **背景**: 白色 + 网格图案 `linear-gradient` 创建 3rem 间隔的细线
- **菜单项**: 从左侧 `translateX(-100%)` 依次滑入
- **悬停**: 中文竖排标签变绿，英文标题显示绿色描边阴影层并向右偏移

### 3.5 滚动触发动画

基于滚动位置（CSS变量 `--p` 从 0 到 1）驱动的动画:
- 肖像扫描线效果
- 灯泡阵列水平移动
- 技能区域插画入场
- 作品集图片的视差倾斜

---

## 四、动效实现方式分析

### 4.1 CSS 动画技术

| 技术 | 用途 | 出现位置 |
|------|------|---------|
| `transition` | 悬停反馈、颜色变化 | 全局 |
| `@keyframes` | 循环动画 | 旋转徽章、无限滚动文字、扫描线 |
| `transform` | 位移/旋转/缩放 | 全站 |
| `stroke-dasharray/offset` | SVG路径描边动画 | 菜单图标、装饰线条 |
| `-webkit-text-stroke` | 文字描边效果 | 标题、菜单项 |
| `mix-blend-mode: difference` | 混合模式 | Logo |
| `writing-mode: vertical-lr` | 竖排文字 | 中文标签 |
| `background: linear-gradient()` | 光晕、网格背景 | Hero区域、菜单面板 |

### 4.2 关键动画定义

```css
/* 无限滚动文字 */
@keyframes vision_scrollline_mov {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } /* 假设 */
}

/* 旋转圆形文字 */
@keyframes hwv_circle {
  to { transform: rotate(1turn); }
}

/* 扫描线移动 */
@keyframes move_line {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 图片波浪效果 */
@keyframes pictures_wave {
  0% { transform: translateY(-120%); }
  100% { transform: translateY(0); }
}

/* 电视故障晃动 */
@keyframes feeter_tv_g {
  0% { transform: translateY(0) rotate(3deg); }
}
```

### 4.3 技术架构推测

- **框架**: Vue.js (从 chunk-vendors.js 和 app.js 判断)
- **路由**: Vue Router (SPA 页面切换)
- **滚动库**: 可能使用 Locomotive Scroll 或自定义 ScrollTrigger
- **动画**: 原生 CSS + 可能配合 GSAP
- **无 WebGL/Three.js**: 3D效果均为CSS 3D transform或SVG实现
- **无粒子系统**: 视觉效果通过CSS/SVG完成

---

## 五、页面结构拆解

### 5.1 Home 页面

| 区域 | 描述 | 关键设计元素 |
|------|------|-------------|
| **Loading** | 全屏加载 | SVG图标 + 绿色文字 + 双层幕布 |
| **Hero** | 首屏主视觉 | 超大标题(白+绿+描边) + 3D线框三角 + 旋转徽章 + 绿色光晕 |
| **About** | 个人介绍 | 绿色"ABOUT ME" + "whoami"手写体 + 简介文字 |
| **Portrait** | 肖像展示 | 绿色扫描线覆盖 + 两侧PORTFOLIO标记 |
| **Skills** | 技能展示 | 编号01/02/03 + 技能名称 + 中文描述 + 场景插画 |
| **Visual** | 视觉理念 | "FIRST VISUAL"无限滚动文字 + 灯泡阵列 + 眼睛插画 |
| **Portfolio** | 作品集列表 | 大号编号 + 项目标题 + 斜向预览图 + 日期 |
| **Photos** | 设计作品 | 卡片网格 + 悬停效果 |
| **Contact** | 联系区域 | "CONTACT ME"大标题 + 图标装饰 |
| **Footer** | 页脚 | 二维码 + 联系方式 + 导航链接 + 社交媒体 |

### 5.2 Contact 页面

- **分屏设计**: 左侧绿色表单 + 右侧黑色插画区
- **表单**: 圆角输入框 + 中英双语标签 + SUBMIT按钮
- **插画**: 线稿风格人物 + 电脑 + "NO MESSAGE"气泡 + 便利贴二维码

### 5.3 Videos 页面

- **扭曲标题**: "VIDEOS"文字带有抖动/扭曲效果 (可能是SVG滤镜 `feTurbulence`)
- **分类标签**: MASHUP / TRAILER / PROMOTIONAL VIDEO / TUTORIALS / CREATIVE VIDEO
- **视频卡片**: 双列布局 + "no signal"装饰 + 标题部分字母绿色高亮

---

## 六、10+ 可借鉴设计元素 & React+Tailwind 实现

### 元素 1: 自定义加载动画 + 页面过渡

**设计描述**: 全屏双层幕布（绿色+黑色），中心SVG图标+LOADING文字，加载完成后幕布滑出。

**React + Tailwind 实现**:

```tsx
import { useState, useEffect } from 'react';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'exit'>('loading');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('exit'), 2000);
    const complete = setTimeout(onComplete, 3000);
    return () => { clearTimeout(timer); clearTimeout(complete); };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 绿色背景 */}
      <div className={`absolute inset-0 bg-[#17f700] transition-transform duration-700 ease-in-out
        ${phase === 'exit' ? '-translate-y-full' : 'translate-y-0'}`} />
      
      {/* 黑色背景 */}
      <div className={`absolute inset-0 bg-[#171717] transition-transform duration-700 delay-150 ease-in-out
        ${phase === 'exit' ? 'translate-y-full' : 'translate-y-0'}`} />
      
      {/* 中心内容 */}
      <div className={`relative z-10 flex flex-col items-center transition-opacity duration-300
        ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
        <svg className="w-24 h-24 text-white animate-pulse" viewBox="0 0 100 100">
          {/* 自定义SVG图标 */}
          <rect x="20" y="20" width="60" height="50" rx="4" fill="none" stroke="white" strokeWidth="2"/>
          <line x1="25" y1="30" x2="75" y2="30" stroke="white" strokeWidth="2"/>
          <line x1="25" y1="40" x2="70" y2="40" stroke="white" strokeWidth="2"/>
          <line x1="25" y1="50" x2="60" y2="50" stroke="white" strokeWidth="2"/>
        </svg>
        <p className="mt-4 text-[#17f700] font-bold tracking-[0.3em] text-sm">
          LOADING
        </p>
      </div>
    </div>
  );
}
```

---

### 元素 2: 绿色光晕/径向渐变背景

**设计描述**: 从屏幕角落扩散的柔和绿色光晕，使用多层径向渐变叠加。

**React + Tailwind 实现**:

```tsx
export function GreenGlowBackground() {
  return (
    <div className="fixed inset-0 bg-[#171717] overflow-hidden pointer-events-none">
      {/* 左上角光晕 */}
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] 
        bg-[radial-gradient(circle,rgba(23,247,0,0.15)_0%,transparent_70%)] 
        blur-3xl" />
      
      {/* 右下角光晕 */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] 
        bg-[radial-gradient(circle,rgba(23,247,0,0.12)_0%,transparent_70%)] 
        blur-3xl" />
      
      {/* 中心微光 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[40%] h-[40%] 
        bg-[radial-gradient(circle,rgba(23,247,0,0.05)_0%,transparent_70%)] 
        blur-2xl" />
    </div>
  );
}
```

---

### 元素 3: 超大混合样式标题

**设计描述**: 同一标题中混合使用填充白、填充绿、描边绿三种文字样式，营造层次。

**React + Tailwind 实现**:

```tsx
export function MixedTitle() {
  return (
    <h1 className="font-['Anton',sans-serif] uppercase leading-none">
      <span className="block text-[#f7f7f7] text-[12vmin] tracking-tight">
        BE WILD!
      </span>
      <span className="block text-[#17f700] text-[12vmin] tracking-tight">
        CREATIVE!
      </span>
      <span className="block text-transparent text-[12vmin] tracking-tight 
        [-webkit-text-stroke:3px_#17f700]">
        AND
      </span>
      <span className="block text-[#f7f7f7] text-[12vmin] tracking-tight">
        COOL!
      </span>
    </h1>
  );
}
```

---

### 元素 4: 旋转圆形文字徽章

**设计描述**: "JUST A NOBODY" 文字沿圆形路径排列并持续旋转。

**React + Tailwind 实现**:

```tsx
export function RotatingCircleText({ text = "JUST A NOBODY • ", size = 120 }: 
  { text?: string; size?: number }) {
  const chars = text.split('');
  const radius = size / 2 - 20;

  return (
    <div className="relative animate-[spin_10s_linear_infinite]" 
      style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {chars.map((char, i) => {
          const angle = (i / chars.length) * 360 - 90;
          const radian = (angle * Math.PI) / 180;
          const x = size / 2 + radius * Math.cos(radian);
          const y = size / 2 + radius * Math.sin(radian);
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#17f700"
              fontSize="10"
              fontFamily="Anton, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${angle + 90}, ${x}, ${y})`}
            >
              {char}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
```

---

### 元素 5: 3D 线框几何体装饰

**设计描述**: 使用 CSS 3D transform 创建线框三角形/四面体，带彩色顶点。

**React + Tailwind 实现**:

```tsx
export function WireframePyramid() {
  return (
    <div className="relative w-40 h-40" style={{ perspective: '600px' }}>
      <div className="absolute inset-0 animate-[spin_8s_linear_infinite]" 
        style={{ transformStyle: 'preserve-3d' }}>
        
        {/* 前面 */}
        <div className="absolute inset-0 border-2 border-white/80 
          [transform:translateZ(40px)]" />
        
        {/* 后面 */}
        <div className="absolute inset-0 border-2 border-white/40 
          [transform:rotateY(180deg)_translateZ(40px)]" />
        
        {/* 左面 */}
        <div className="absolute inset-0 border-2 border-white/60 
          [transform:rotateY(-90deg)_translateZ(40px)]" />
        
        {/* 右面 */}
        <div className="absolute inset-0 border-2 border-white/60 
          [transform:rotateY(90deg)_translateZ(40px)]" />
        
        {/* 顶点装饰 */}
        <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 
          bg-[#17f700] rounded-full" />
        <div className="absolute bottom-0 left-0 w-2 h-2 
          bg-red-500 rounded-full" />
        <div className="absolute bottom-0 right-0 w-2 h-2 
          bg-blue-500 rounded-full" />
        <div className="absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 
          bg-yellow-500 rounded-full" />
      </div>
    </div>
  );
}
```

---

### 元素 6: 扫描线/故障效果覆盖

**设计描述**: 水平绿色扫描线在图片/肖像上移动，营造科技感。

**React + Tailwind 实现**:

```tsx
export function ScanlineOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      {children}
      
      {/* 扫描线 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-[2px] bg-[#17f700]/60 
          animate-[scan_3s_ease-in-out_infinite] shadow-[0_0_10px_#17f700]" />
      </div>
      
      {/* 绿色色调叠加 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#17f700]/20 
        via-transparent to-transparent mix-blend-overlay pointer-events-none" />
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
```

---

### 元素 7: 无限滚动文字横幅 (Marquee)

**设计描述**: "FIRST VISUAL FIRST VISUAL..." 文字无限水平滚动。

**React + Tailwind 实现**:

```tsx
export function InfiniteMarquee({ text = "FIRST VISUAL ", direction = 'left' }: 
  { text?: string; direction?: 'left' | 'right' }) {
  const repeatedText = text.repeat(10);
  
  return (
    <div className="overflow-hidden whitespace-nowrap bg-[#17f700] py-4">
      <div className={`inline-flex ${direction === 'left' ? 
        'animate-[marquee_20s_linear_infinite]' : 
        'animate-[marquee-reverse_20s_linear_infinite]'}`}>
        <span className="text-[#171717] font-['Anton',sans-serif] text-[8vmin] 
          uppercase tracking-tight mx-4">
          {repeatedText}
        </span>
        <span className="text-[#171717] font-['Anton',sans-serif] text-[8vmin] 
          uppercase tracking-tight mx-4">
          {repeatedText}
        </span>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
```

---

### 元素 8: 双层滑入悬停按钮

**设计描述**: 悬停时白色层和绿色层依次从左侧滑入，文字变色，箭头位移。

**React + Tailwind 实现**:

```tsx
export function SlideFillButton({ text = "CONTACT" }: { text?: string }) {
  return (
    <button className="group relative w-[8.5rem] h-[2.2rem] rounded-full 
      border-[0.12rem] border-[#f7f7f7] overflow-hidden cursor-pointer">
      
      {/* 白色层 */}
      <div className="absolute inset-0 bg-[#f7f7f7] rounded-full 
        -translate-x-full group-hover:translate-x-0 
        transition-transform duration-[400ms] ease-out" />
      
      {/* 绿色层 */}
      <div className="absolute inset-0 bg-[#17f700] rounded-full 
        -translate-x-full group-hover:translate-x-0 
        transition-transform duration-[400ms] delay-100 ease-out" />
      
      {/* 文字 */}
      <span className="relative z-10 text-[#f7f7f7] font-['Anton',sans-serif] 
        text-[1.3rem] tracking-[0.08rem] 
        group-hover:text-[#171717] group-hover:translate-x-0 
        translate-x-[-13%] transition-all duration-[400ms]">
        {text}
      </span>
      
      {/* 箭头 */}
      <svg className="absolute z-10 right-4 top-1/2 -translate-y-1/2 w-[0.9rem] h-[0.9rem] 
        translate-x-[320%] group-hover:translate-x-[550%] 
        transition-transform duration-[400ms]" 
        viewBox="0 0 24 24" fill="none" stroke="#17f700" strokeWidth="3" 
        strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}
```

---

### 元素 9: SVG 汉堡菜单变形动画

**设计描述**: 使用 SVG `stroke-dasharray` 技巧，汉堡图标变形为 X。

**React + Tailwind 实现**:

```tsx
import { useState } from 'react';

export function AnimatedMenuButton({ onClick }: { onClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button 
      onClick={() => { setIsOpen(!isOpen); onClick?.(); }}
      className="w-6 h-6 cursor-pointer"
    >
      <svg viewBox="0 0 36 36" className="w-full h-full overflow-visible">
        <circle cx="18" cy="18" r="18" fill="#17f700" />
        
        <line x1="8" y1="14" x2="28" y2="14" 
          stroke="#171717" strokeWidth="6" strokeLinecap="round"
          className={`origin-center transition-all duration-[400ms] ease-out
            ${isOpen 
              ? 'rotate-45 [stroke-dasharray:2_21_2]' 
              : 'translate-y-[-13%] [stroke-dasharray:13_12_25] hover:[stroke-dashoffset:25]'
            }`}
        />
        
        <line x1="8" y1="22" x2="28" y2="22" 
          stroke="#171717" strokeWidth="6" strokeLinecap="round"
          className={`origin-center transition-all duration-[400ms] ease-out
            ${isOpen 
              ? '-rotate-45 [stroke-dasharray:2_21_2]' 
              : 'translate-y-[13%] [stroke-dasharray:12.5_0_12.5] hover:[stroke-dasharray:12.5_0_12.5]'
            }`}
        />
      </svg>
    </button>
  );
}
```

---

### 元素 10: 文字选择高亮自定义

**设计描述**: 自定义选中文本的背景色和文字色。

**Tailwind / CSS 实现**:

```css
/* 全局CSS */
::selection {
  background-color: #17f700;
  color: #171717;
}

/* 或者 Tailwind 通过 arbitrary values */
/* 在 tailwind.config.js 中: */
module.exports = {
  theme: {
    extend: {
      // Tailwind 不原生支持 selection 伪元素样式
      // 需要在全局 CSS 中添加
    }
  }
}
```

```tsx
// 使用内联样式 + Tailwind
export function CustomSelectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="selection:bg-[#17f700] selection:text-[#171717]">
      {children}
    </div>
  );
}
```

*注: Tailwind v3.1+ 支持 `selection:` 变体*

---

### 元素 11: 分屏 Contact 表单页面

**设计描述**: 左侧鲜艳绿色表单区 + 右侧深色插画区，圆角过渡。

**React + Tailwind 实现**:

```tsx
export function SplitContactPage() {
  return (
    <div className="min-h-screen flex">
      {/* 左侧 - 绿色表单区 */}
      <div className="w-1/2 bg-[#17f700] rounded-r-[6rem] p-16 flex flex-col 
        justify-center">
        <h2 className="font-['Anton',sans-serif] text-[#171717] text-[4rem] 
          uppercase mb-4">
          GET IN TOUCH :)
        </h2>
        <p className="text-[#171717] text-sm mb-8 tracking-wider">
          交个朋友？谈场合作？联系我，或者我联系你
        </p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-[#171717] text-sm mb-2 
              tracking-wider">
              你的称呼 / YOUR NAME
            </label>
            <input type="text" 
              className="w-full px-6 py-3 rounded-full bg-[#f7f7f7] 
                border-2 border-[#171717] text-[#171717] 
                focus:outline-none focus:ring-2 focus:ring-[#171717]" />
          </div>
          {/* 更多表单字段... */}
          
          <button className="px-8 py-3 rounded-full bg-[#f7f7f7] 
            text-[#171717] font-bold border-2 border-[#171717]
            hover:bg-[#171717] hover:text-[#17f700] transition-colors">
            SUBMIT
          </button>
        </form>
      </div>
      
      {/* 右侧 - 深色插画区 */}
      <div className="w-1/2 bg-[#171717] flex items-center justify-center 
        relative overflow-hidden">
        {/* 线稿插画可用 SVG 或图片 */}
        <div className="text-white/80 text-center">
          <p className="text-[#17f700] font-bold text-xl mb-4">NO MESSAGE</p>
          {/* SVG 插画占位 */}
          <svg className="w-64 h-64" viewBox="0 0 200 200">
            <rect x="40" y="60" width="120" height="80" rx="8" 
              fill="none" stroke="white" strokeWidth="2"/>
            <line x1="50" y1="80" x2="150" y2="80" stroke="white" 
              strokeWidth="1"/>
            <line x1="50" y1="100" x2="130" y2="100" stroke="white" 
              strokeWidth="1"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
```

---

### 元素 12: 自定义滚动进度指示器

**设计描述**: 左侧细绿色线条，随滚动进度增长。

**React + Tailwind 实现**:

```tsx
import { useEffect, useState } from 'react';

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 w-[0.3rem] h-full z-[9999] 
      overflow-hidden">
      <div 
        className="w-full bg-[#17f700] rounded-full"
        style={{ 
          height: '100%',
          transformOrigin: 'top',
          transform: `scaleY(${progress})`,
          transition: 'transform 0.1s ease-out'
        }}
      />
    </div>
  );
}
```

---

### 元素 13: 作品集列表项 - 大号编号 + 斜向预览图

**设计描述**: 左侧大号空心编号，中间标题+描述，右侧日期，中间穿插倾斜的视频预览图。

**React + Tailwind 实现**:

```tsx
export function PortfolioItem({ 
  number, title, subtitle, date, imageUrl 
}: { 
  number: string; title: string; subtitle: string; date: string; imageUrl: string;
}) {
  return (
    <div className="relative border-t border-[#f7f7f7]/20 py-12 px-8 
      group cursor-pointer">
      <div className="flex items-center gap-8">
        {/* 编号 */}
        <span className="text-[6rem] font-['Anton',sans-serif] 
          text-transparent [-webkit-text-stroke:2px_#f7f7f7] 
          leading-none w-[8rem]">
          {number}
        </span>
        
        {/* 标题区域 */}
        <div className="flex-1">
          <h3 className="text-[#f7f7f7] text-[2.5rem] font-['Anton',sans-serif] 
            uppercase leading-tight">
            {title}
          </h3>
          <p className="text-[#f7f7f7]/60 text-sm mt-1 tracking-wider">
            + {subtitle} +
          </p>
        </div>
        
        {/* 日期 */}
        <span className="text-[#f7f7f7]/40 text-sm tracking-wider">
          {date}
        </span>
      </div>
      
      {/* 斜向预览图 - 悬停显示 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[300px] h-[180px] rounded-xl overflow-hidden 
        rotate-[-8deg] opacity-0 group-hover:opacity-100 
        transition-opacity duration-500 pointer-events-none z-10">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
```

---

### 元素 14: 文字扭曲/故障效果 (Videos页面)

**设计描述**: 大标题带有抖动/扭曲效果，疑似使用 SVG feTurbulence 滤镜。

**React + Tailwind + SVG Filter 实现**:

```tsx
export function GlitchText({ text = "VIDEOS" }: { text?: string }) {
  return (
    <div className="relative">
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="turbulence">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" 
              numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" 
              scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      
      <h1 
        className="font-['Anton',sans-serif] text-[15vmin] text-[#f7f7f7] 
          uppercase animate-[glitch_0.3s_infinite]"
        style={{ filter: 'url(#turbulence)' }}
      >
        {text}
      </h1>
      
      <style>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }
      `}</style>
    </div>
  );
}
```

---

### 元素 15: 菜单面板入场动画

**设计描述**: 全屏菜单从底部滑入，菜单项从左侧依次 stagger 进入。

**React + Tailwind 实现**:

```tsx
import { useState } from 'react';

export function FullscreenMenu({ isOpen, onClose }: { 
  isOpen: boolean; onClose: () => void;
}) {
  const menuItems = [
    { zh: '首页', en: 'HOME' },
    { zh: '视频', en: 'VIDEOS' },
    { zh: '照片', en: 'PHOTOS' },
    { zh: '联系', en: 'CONTACT' },
  ];

  return (
    <div className={`fixed inset-0 z-[9998] transition-transform duration-700 
      ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      
      {/* 白色背景 + 网格 */}
      <div className="absolute inset-0 bg-[#f7f7f7] rounded-t-[6rem] 
        [background-image:linear-gradient(0deg,transparent_2.9rem,#ddd_3rem),
          linear-gradient(90deg,transparent_2.9rem,#ddd_3rem)] 
        [background-size:3rem_3rem]" />
      
      {/* 菜单内容 */}
      <div className="relative z-10 flex flex-col justify-center 
        h-full pl-[15vw]">
        {menuItems.map((item, i) => (
          <div 
            key={item.en}
            className={`flex items-center gap-4 mb-6 cursor-pointer 
              transition-transform duration-500 ease-out
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ transitionDelay: `${150 + i * 100}ms` }}
            onClick={onClose}
          >
            <span className="text-[#171717] text-sm tracking-widest 
              [writing-mode:vertical-lr]">
              {item.zh}
            </span>
            <span className="font-['Anton',sans-serif] text-[#171717] 
              text-[4rem] uppercase tracking-tight 
              hover:text-transparent hover:[-webkit-text-stroke:2px_#17f700]
              transition-all duration-300">
              {item.en}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 七、设计手法总结

### 7.1 核心设计理念

1. **视觉至上 (Visual First)**: 一切设计服务于视觉冲击力和记忆点
2. **极客美学**: 暗黑主题 + 荧光绿 + 代码/技术元素隐喻
3. **新粗野主义 (Neo-Brutalism)**: 粗边框、高对比、无圆角装饰、raw感
4. **酸性设计 (Acid Graphics)**: 扭曲文字、故障效果、高饱和色彩碰撞

### 7.2 排版策略

- **超大字号冲击**: 标题使用 `8vmin~15vmin`，占据视觉中心
- **混合样式对比**: 同一层级内混合填充/描边/渐变文字，创造层次
- **双语 layering**: 中文竖排小标签 + 英文横排大标题的组合
- **数字作为装饰**: 编号不只是序号，而是视觉元素的一部分

### 7.3 交互策略

- **悬停即反馈**: 每个可交互元素都有明确且独特的悬停状态
- **动画叙事**: 页面加载、滚动、切换都伴随有目的的动画
- **SVG 即界面**: 大量使用 SVG 进行图标、按钮、装饰的实现
- **自定义一切**: 滚动条、选择色、光标等系统级元素全部自定义

---

## 八、技术实现建议

### 8.1 推荐技术栈 (React)

| 用途 | 推荐库 |
|------|--------|
| 框架 | React 18 + Vite |
| 路由 | React Router |
| 平滑滚动 | Lenis 或 Locomotive Scroll |
| 滚动动画 | GSAP ScrollTrigger |
| 页面过渡 | Framer Motion AnimatePresence |
| SVG 动画 | GSAP DrawSVG 或原生 CSS |
| 3D效果 | CSS 3D Transforms (无需 Three.js) |

### 8.2 Tailwind 配置建议

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'jiejoe-black': '#171717',
        'jiejoe-white': '#f7f7f7',
        'jiejoe-green': '#17f700',
      },
      fontFamily: {
        'display': ['Anton', 'Impact', 'sans-serif'],
        'zh': ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 20s linear infinite',
        'spin-slow': 'spin 10s linear infinite',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scan: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' },
        },
      },
    },
  },
};
```

### 8.3 性能注意事项

1. **字体加载**: 使用 `font-display: swap` 避免 FOIT，考虑使用可变字体
2. **SVG 优化**: 压缩 SVG，使用内联而非图片请求
3. **will-change**: 对频繁动画的元素谨慎使用 `will-change: transform`
4. **滚动性能**: 使用 `passive: true` 监听滚动事件，避免布局抖动
5. ** prefers-reduced-motion**: 尊重用户减少动画偏好

---

## 九、截图记录

以下为访问过程中截取的关键页面截图：

1. **加载动画** - 黑色背景 + SVG图标 + 绿色LOADING文字
2. **Hero区域** - BE WILD! CREATIVE! AND COOL! + 3D线框三角 + 绿色光晕
3. **About Me区域** - 绿色大标题 + whoami手写体
4. **肖像扫描** - 插画肖像 + 绿色扫描线 + 两侧PORTFOLIO标记
5. **Skills区域** - 编号 + 技能标题 + 场景插画
6. **First Visual区域** - 无限滚动文字 + 灯泡阵列
7. **Portfolio列表** - 大号编号 + 项目标题 + 斜向预览图
8. **Contact Me区域** - 大标题 + 图标装饰
9. **Footer** - 二维码 + 联系方式
10. **Contact页面** - 绿色表单 + 黑色插画分屏
11. **Videos页面** - 扭曲标题 + 分类标签 + 视频卡片

---

## 十、总结

JIEJOE的网站是一个**高完成度的个人品牌展示站**，它通过以下手法建立了强烈的视觉识别度：

1. **极致的色彩克制** — 仅用三色却营造出丰富层次
2. **大胆的排版尺度** — 超大字号与新粗野主义风格
3. **细腻的交互反馈** — 每个悬停、点击都有精心设计的状态
4. **SVG 全栈运用** — 从图标到按钮到装饰全部SVG化
5. **滚动叙事节奏** — 通过滚动触发动画引导用户浏览

这是一个非常优秀的**创意作品集网站范例**，其设计语言特别适合：设计师、开发者、创意工作者的个人品牌建设。

---

*报告生成时间: 2024*  
*分析工具: 浏览器自动化 + 源码分析 + 设计模式提取*
