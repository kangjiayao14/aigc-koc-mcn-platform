import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Check, Smartphone, Users, TrendingUp, Rocket } from 'lucide-react';

/**
 * Landing Page - Cinematic single-page scroll narrative
 *
 * Sections:
 * 1. Hero (100vh) - Planet background + glitch title + CTA
 * 2. Pain Point 1 (100vh) - Creation barrier + MCN broker solution
 * 3. Pain Point 2 (100vh) - Social integration + ecosystem
 * 4. Pain Point 3 (100vh) - Growth confusion + data metrics
 * 5. CTA (80vh) - Final call to action + footer
 *
 * Features:
 * - Scroll-triggered animations via IntersectionObserver
 * - Glitch text effects on titles
 * - Parallax-like scroll effects
 * - Data counter animations
 * - Responsive layout
 *
 * TODO: Replace hero background with Three.js particle planet (HeroPlanet.tsx)
 * TODO: Add warp tunnel transition on CTA click
 * TODO: Integrate Lenis smooth scrolling
 */

/* ===== Scroll reveal hook ===== */
function useScrollReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ===== GlitchTitle Component ===== */
function GlitchTitle({
  text,
  className = '',
  as: Tag = 'h2',
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tag
      className={`glitch-auto ${className}`}
      data-text={text}
      style={glitching ? { animation: 'periodicGlitch 0.4s ease-in-out' } : {}}
    >
      {text}
    </Tag>
  );
}

/* ===== Animated Counter ===== */
function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 1500,
  triggered,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  triggered: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    let startTime: number;
    let raf: number;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [triggered, target, duration]);

  return (
    <span>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ===== Scroll Indicator ===== */
function ScrollIndicator() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-indicator">
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/50 to-white/50" />
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-white/50">
        <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ===== Neon Button ===== */
function NeonButton({
  children,
  variant = 'cyan',
  size = 'md',
  to,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'cyan' | 'magenta' | 'gold';
  size?: 'md' | 'lg';
  to?: string;
  onClick?: () => void;
  className?: string;
}) {
  const baseClasses = `relative inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-300 btn-sweep ${
    size === 'lg' ? 'btn-cyber-lg h-16 px-14 text-xl' : 'btn-cyber h-14 px-10 text-lg'
  }`;

  const variantClasses = {
    cyan: 'bg-neon-cyan text-void hover:shadow-glow-cyan hover:scale-105',
    magenta: 'bg-neon-magenta text-white hover:shadow-glow-magenta hover:scale-108',
    gold: 'bg-gradient-gold-shimmer text-void hover:shadow-glow-gold hover:scale-105',
  };

  const content = (
    <>
      {children}
      <ArrowRight size={size === 'lg' ? 22 : 18} />
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        data-cursor="pointer"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      data-cursor="pointer"
    >
      {content}
    </button>
  );
}

/* ===== Feature List ===== */
function FeatureList({ items, color = 'neon-cyan' }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-${color}/10 flex items-center justify-center`}
          >
            <Check size={12} className={`text-${color}`} style={{ color: `var(--${color.replace('-', '-')})` }} />
          </div>
          <span className="text-text-secondary text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ================================================================== */
/* ========================= LANDING PAGE ============================ */
/* ================================================================== */

export default function Landing() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Staggered entrance animation
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Section refs for scroll reveal
  const pain1 = useScrollReveal(0.2);
  const pain2 = useScrollReveal(0.2);
  const pain3 = useScrollReveal(0.2);
  const ctaSection = useScrollReveal(0.3);

  return (
    <div className="relative bg-void">
      {/* ============================================================ */}
      {/* SECTION 1: HERO */}
      {/* ============================================================ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          {/* Deep space gradient */}
          <div className="absolute inset-0 bg-gradient-hero" />
          {/* Radial glow from center */}
          <div className="absolute inset-0 bg-gradient-cyan-glow opacity-30" />
          {/* Hero planet image */}
          <img
            src="/hero-planet.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            style={{
              transform: heroLoaded ? 'scale(1)' : 'scale(1.1)',
              transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-transparent to-void/80" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Line 1: PCG */}
          <div
            className={`transition-all duration-1000 ease-cyber ${
              heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h1 className="font-orbitron font-black text-[72px] sm:text-[96px] md:text-[120px] leading-none tracking-[-0.03em] gradient-text-cyan select-none">
              PCG
            </h1>
          </div>

          {/* Line 2: 创客星球 */}
          <div
            className={`transition-all duration-1000 ease-cyber ${
              heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <h2 className="font-sans font-bold text-[36px] sm:text-[48px] md:text-[56px] leading-tight tracking-[-0.02em] stroke-text mt-2 select-none hover:[-webkit-text-fill-color:var(--neon-cyan)] transition-all duration-300">
              创客星球
            </h2>
          </div>

          {/* Subtitle */}
          <div
            className={`mt-6 transition-all duration-1000 ease-cyber ${
              heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <p className="text-text-secondary text-lg sm:text-xl font-sans font-normal">
              你的专属 AI 合伙人，从零到一打造超级个体
            </p>
          </div>

          {/* Tagline labels */}
          <div
            className={`mt-4 transition-all duration-1000 ease-cyber ${
              heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '1000ms' }}
          >
            <p className="font-mono text-sm tracking-[0.1em] text-neon-cyan">
              AI AGENT &times; 内容创作 &times; 社交星球 &times; 游戏化成长
            </p>
          </div>

          {/* CTA Button */}
          <div
            className={`mt-12 transition-all duration-700 ease-bounce-custom ${
              heroLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
            }`}
            style={{ transitionDelay: '1300ms' }}
          >
            <NeonButton variant="cyan" size="md" to="/onboarding">
              开始旅程
            </NeonButton>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`transition-opacity duration-1000 ${
            heroLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '2s' }}
        >
          <ScrollIndicator />
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: PAIN POINT 1 — CREATION BARRIER */}
      {/* ============================================================ */}
      <section
        ref={pain1.ref}
        className="relative min-h-[100dvh] flex items-center bg-void overflow-hidden"
      >
        {/* Circuit decoration */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0v200h300v400H100v200" stroke="#00F0FF" strokeWidth="1" />
            <path d="M100 0v150h200v450H150v200" stroke="#00F0FF" strokeWidth="0.5" />
            <circle cx="50" cy="200" r="4" fill="#00F0FF" />
            <circle cx="350" cy="600" r="4" fill="#00F0FF" />
            <circle cx="100" cy="800" r="6" fill="#00F0FF" />
          </svg>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div
              className={`transition-all duration-700 ease-cyber ${
                pain1.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
              }`}
            >
              {/* Section label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-neon-magenta" />
                <span className="font-mono text-sm tracking-[0.15em] text-neon-magenta">
                  痛点 01
                </span>
              </div>

              {/* Title */}
              <GlitchTitle
                text="有想法，没兴致做"
                as="h2"
                className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-text-primary mb-6"
              />

              {/* Description */}
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                自媒体时代，人人都有潜力成为 KOC。但空有想法，却因选题困难、修图繁琐、文案卡壳而迟迟无法行动。创作不该如此沉重。
              </p>

              {/* Solution card */}
              <div
                className={`p-6 rounded-xl bg-surface border border-white/5 border-t-2 border-t-neon-cyan backdrop-blur-xl transition-all duration-700 ease-cyber ${
                  pain1.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                <h3 className="font-sans font-medium text-lg text-neon-cyan mb-2">
                  专属 MCN 经纪人 Agent
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  从选题到修图，从文案到发布——你的 AI 经纪人一键搞定。只需对话，即可完成内容创作全流程。
                </p>
                <FeatureList
                  items={[
                    'AI 智能选题 — 基于你的定位和热点数据推荐',
                    '一键推文生成 — 配图+排版全自动完成',
                    'AI P 图工作室 — 美白、磨皮、换衣、换发型',
                    '多平台一键发布 — 小红书/抖音/朋友圈/领英',
                  ]}
                />
              </div>
            </div>

            {/* Right: Visual demo */}
            <div
              className={`relative transition-all duration-1000 ease-cyber ${
                pain1.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              {/* Phone mockup */}
              <div
                className="relative mx-auto w-[280px] sm:w-[320px] animate-float"
                style={{ perspective: '800px' }}
              >
                <div
                  className="relative rounded-[32px] p-3 bg-void-light border border-neon-cyan/30 shadow-glow-cyan"
                  style={{ transform: 'rotateY(-5deg) rotateX(3deg)' }}
                >
                  {/* Phone screen */}
                  <div className="rounded-[24px] bg-void overflow-hidden">
                    {/* Chat header */}
                    <div className="px-4 py-3 bg-void-light border-b border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-neon-cyan/50">
                        <img src="/broker-male.png" alt="Broker" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-text-primary">星启</div>
                        <div className="text-[10px] text-neon-green flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-neon-green" />
                          在线
                        </div>
                      </div>
                    </div>
                    {/* Chat messages */}
                    <div className="p-4 space-y-3 min-h-[280px]">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                          <img src="/broker-male.png" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-void-light border border-white/[0.08] text-xs text-text-primary max-w-[80%]">
                          想发什么内容呢？我来帮你
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="px-3 py-2 rounded-2xl rounded-br-sm bg-neon-cyan/15 border border-neon-cyan/30 text-xs text-text-primary max-w-[80%]">
                          我想分享今天的咖啡探店
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                          <img src="/broker-male.png" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-neon-cyan/10 border border-neon-cyan/20 text-xs text-text-primary">
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-neon-cyan animate-bounce" />
                            <div className="w-1 h-1 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1 h-1 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glow behind */}
                <div className="absolute -inset-8 bg-neon-cyan/5 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Vertical decorative text */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:block">
          <span className="vertical-text font-sans font-bold text-sm text-text-muted opacity-20 tracking-widest">
            创作零门槛
          </span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: PAIN POINT 2 — SOCIAL INTEGRATION */}
      {/* ============================================================ */}
      <section
        ref={pain2.ref}
        className="relative min-h-[100dvh] flex items-center bg-void overflow-hidden"
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(189,0,255,0.08) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-[1440px] mx-auto px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Visual demo (fan cards) */}
            <div
              className={`relative order-2 lg:order-1 transition-all duration-1000 ease-cyber ${
                pain2.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              {/* Fan of social cards */}
              <div className="relative h-[360px] sm:h-[400px] flex items-center justify-center">
                {/* Card 1 - Profile */}
                <div
                  className="absolute w-[200px] sm:w-[240px] rounded-xl bg-surface border border-white/10 backdrop-blur-xl p-4 shadow-xl transition-all duration-700 ease-cyber"
                  style={{
                    transform: pain2.visible
                      ? 'translateX(-80px) translateY(20px) rotateZ(-8deg)'
                      : 'translateX(-80px) translateY(100px) rotateZ(-15deg)',
                    opacity: pain2.visible ? 1 : 0,
                    transitionDelay: '300ms',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                      <Users size={18} className="text-neon-cyan" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">个人主页</div>
                      <div className="text-xs text-text-muted">创作作品集</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-white/5 rounded-full w-full" />
                    <div className="h-2 bg-white/5 rounded-full w-3/4" />
                  </div>
                </div>

                {/* Card 2 - Cinema (center) */}
                <div
                  className="absolute w-[200px] sm:w-[240px] rounded-xl bg-surface border border-neon-magenta/30 backdrop-blur-xl p-4 shadow-xl z-10 transition-all duration-700 ease-cyber"
                  style={{
                    transform: pain2.visible
                      ? 'translateY(-20px) rotateZ(0deg)'
                      : 'translateY(80px) rotateZ(0deg)',
                    opacity: pain2.visible ? 1 : 0,
                    transitionDelay: '450ms',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-neon-magenta/20 flex items-center justify-center">
                      <Smartphone size={18} className="text-neon-magenta" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">线上电影院</div>
                      <div className="text-xs text-text-muted">8人同观影</div>
                    </div>
                  </div>
                  <div className="aspect-video rounded-lg bg-void border border-white/5 flex items-center justify-center">
                    <div className="text-2xl">🎬</div>
                  </div>
                </div>

                {/* Card 3 - Games */}
                <div
                  className="absolute w-[200px] sm:w-[240px] rounded-xl bg-surface border border-white/10 backdrop-blur-xl p-4 shadow-xl transition-all duration-700 ease-cyber"
                  style={{
                    transform: pain2.visible
                      ? 'translateX(80px) translateY(20px) rotateZ(8deg)'
                      : 'translateX(80px) translateY(100px) rotateZ(15deg)',
                    opacity: pain2.visible ? 1 : 0,
                    transitionDelay: '600ms',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-neon-violet/20 flex items-center justify-center">
                      <TrendingUp size={18} className="text-neon-violet" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">剧本杀</div>
                      <div className="text-xs text-text-muted">组队推理</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-white/5 rounded-lg flex items-center px-3">
                      <span className="text-xs text-text-muted">线索 1: 🔑</span>
                    </div>
                    <div className="h-8 bg-white/5 rounded-lg flex items-center px-3">
                      <span className="text-xs text-text-muted">线索 2: 🔍</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Text content */}
            <div
              className={`order-1 lg:order-2 transition-all duration-700 ease-cyber ${
                pain2.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
            >
              {/* Section label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-neon-violet" />
                <span className="font-mono text-sm tracking-[0.15em] text-neon-violet">
                  痛点 02
                </span>
              </div>

              {/* Title */}
              <GlitchTitle
                text="创作与社交，本该一体"
                as="h2"
                className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-text-primary mb-6"
              />

              {/* Description */}
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                王者荣耀有个人主页展示，抖音能加好友续火花。内容创作正在与社交深度融合。但现有的创作工具，没有任何社交基因。创作者在孤岛中前行。
              </p>

              {/* Solution card */}
              <div
                className={`p-6 rounded-xl bg-surface border border-white/5 border-t-2 border-t-neon-violet backdrop-blur-xl transition-all duration-700 ease-cyber ${
                  pain2.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                <h3 className="font-sans font-medium text-lg text-neon-violet mb-2">
                  创客星球社交生态
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  不只是创作工具，更是创作者的家园。发布内容、结识同好、一起观影、组队剧本杀——在这里，创作与社交无缝融合。
                </p>
                <FeatureList
                  color="neon-violet"
                  items={[
                    '个人主页展示 — 你的创作作品集，社交名片',
                    '加好友关注 — 发现志同道合的创作者',
                    '线上电影院 — 8 人同观影，边看边聊',
                    '剧本杀 & 游戏 — 组队娱乐，自然社交',
                    '内容研讨室 — 与 AI 专家大 V 人格讨论你的作品',
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: PAIN POINT 3 — GROWTH CONFUSION */}
      {/* ============================================================ */}
      <section
        ref={pain3.ref}
        className="relative min-h-[100dvh] flex items-center bg-void overflow-hidden"
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,240,255,0.03), transparent)',
          }}
        />

        <div className="max-w-[1440px] mx-auto px-6 py-24 w-full">
          <div className="text-center mb-16">
            {/* Section label */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-neon-gold" />
              <span className="font-mono text-sm tracking-[0.15em] text-neon-gold">
                痛点 03
              </span>
              <div className="w-8 h-px bg-neon-gold" />
            </div>

            {/* Title */}
            <div
              className={`transition-all duration-700 ease-cyber ${
                pain3.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <GlitchTitle
                text="定位模糊，成长无门"
                as="h2"
                className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-text-primary mb-6"
              />
            </div>

            {/* Description */}
            <div
              className={`transition-all duration-700 ease-cyber ${
                pain3.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                普通 KOC 面临内容定位模糊、选题低效、运营不专业等困境。市面上的工具要么太复杂，要么太单薄。你需要一个真正懂你的 AI 合伙人。
              </p>
            </div>
          </div>

          {/* Data metrics */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16 transition-all duration-700 ease-cyber ${
              pain3.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {/* Metric 1 */}
            <div className="text-center p-8 rounded-xl bg-surface border border-white/5 hover:border-neon-cyan/20 transition-all duration-300 hover:-translate-y-1">
              <div className="font-mono font-bold text-5xl sm:text-6xl text-neon-cyan mb-3">
                <AnimatedCounter target={87} suffix="%" triggered={pain3.visible} />
              </div>
              <p className="text-text-secondary text-sm">
                的 KOC 因选题困难而放弃创作
              </p>
            </div>

            {/* Metric 2 */}
            <div className="text-center p-8 rounded-xl bg-surface border border-white/5 hover:border-neon-magenta/20 transition-all duration-300 hover:-translate-y-1">
              <div className="font-mono font-bold text-5xl sm:text-6xl text-neon-magenta mb-3">
                <AnimatedCounter target={3} suffix="x" triggered={pain3.visible} />
              </div>
              <p className="text-text-secondary text-sm">
                使用 AI 辅助的 KOC 涨粉速度
              </p>
            </div>

            {/* Metric 3 */}
            <div className="text-center p-8 rounded-xl bg-surface border border-white/5 hover:border-neon-gold/20 transition-all duration-300 hover:-translate-y-1">
              <div className="font-mono font-bold text-4xl sm:text-5xl text-neon-gold mb-3 flex items-center justify-center gap-1">
                <AnimatedCounter target={60} suffix="" triggered={pain3.visible} />
                <span className="text-2xl">min→</span>
                <AnimatedCounter target={5} suffix="" triggered={pain3.visible} />
                <span className="text-2xl">min</span>
              </div>
              <p className="text-text-secondary text-sm">
                内容创作时间对比
              </p>
            </div>
          </div>

          {/* Solution summary */}
          <div
            className={`text-center transition-all duration-700 ease-cyber ${
              pain3.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <p className="font-mono text-sm sm:text-base tracking-[0.05em]">
              <span className="text-neon-cyan">AI 经纪人</span>
              <span className="text-text-muted mx-2">+</span>
              <span className="text-neon-magenta">内容实验室</span>
              <span className="text-text-muted mx-2">+</span>
              <span className="text-neon-violet">选题雷达</span>
              <span className="text-text-muted mx-2">+</span>
              <span className="text-neon-green">社交星球</span>
              <span className="text-text-muted mx-2">+</span>
              <span className="text-neon-gold">专家工坊</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: CTA */}
      {/* ============================================================ */}
      <section
        ref={ctaSection.ref}
        className="relative min-h-[80vh] flex flex-col items-center justify-center bg-void overflow-hidden"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,42,109,0.06) 0%, rgba(0,240,255,0.04) 40%, transparent 70%)',
          }}
        />

        <div className="relative z-10 text-center px-6">
          {/* Title */}
          <div
            className={`transition-all duration-700 ease-cyber ${
              ctaSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-text-primary mb-4">
              准备好开启你的创客之旅了吗？
            </h2>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-700 ease-cyber ${
              ctaSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <p className="text-text-secondary text-lg sm:text-xl mb-10">
              你的专属 MCN 经纪人正在星球上等候
            </p>
          </div>

          {/* CTA Button */}
          <div
            className={`transition-all duration-700 ease-bounce-custom ${
              ctaSection.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <NeonButton variant="magenta" size="lg" to="/onboarding">
              <Rocket size={22} />
              开始旅程
            </NeonButton>
          </div>

          {/* Mini footer */}
          <div className="mt-24">
            <p className="font-mono text-xs text-text-muted">
              PCG-创客星球 &copy; 2025 | 赛题⑤ PCG技术线-智能营销/AI小游戏方向
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
