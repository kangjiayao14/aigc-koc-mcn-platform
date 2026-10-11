import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Music, Music2, Coins, Sparkles } from 'lucide-react';

/**
 * Navbar - Fixed top navigation bar with glassmorphism
 *
 * Features:
 * - Glassmorphism background with blur
 * - Logo: "PCG-创客星球" with neon glow
 * - Navigation items: 内容大厅, 创作工坊, 选题智库, 社交星球, 大V研讨室, 个人主页, 任务中心
 * - Right side: coins display, level badge, avatar, music toggle
 * - Full-screen mobile menu panel
 * - Scroll-aware background opacity
 * - Glitch effect on logo hover
 *
 * TODO: Connect actual user data (coins, level, avatar)
 * TODO: Implement music toggle with actual audio
 * TODO: Animate coin changes when rewards are earned
 */
const NAV_ITEMS = [
  { label: '内容大厅', path: '/feed' },
  { label: '创作工坊', path: '/content-lab' },
  { label: '选题智库', path: '/topic-research' },
  { label: '社交星球', path: '/social' },
  { label: '好友', path: '/friends' },
  { label: '大V研讨室', path: '/workshop' },
  { label: '个人主页', path: '/hub' },
  { label: '任务中心', path: '/quests' },
  { label: '商城', path: '/marketplace' },
];

interface NavbarProps {
  coins?: number;
  level?: number;
  avatar?: string;
  musicEnabled?: boolean;
  onMusicToggle?: () => void;
}

export default function Navbar({
  coins = 1280,
  level = 3,
  avatar = '/avatar-default.png',
  musicEnabled = false,
  onMusicToggle,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoGlitch, setLogoGlitch] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Track scroll position for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger logo glitch periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoGlitch(true);
      setTimeout(() => setLogoGlitch(false), 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoHover = useCallback(() => {
    setLogoGlitch(true);
    setTimeout(() => setLogoGlitch(false), 400);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const isLanding = location.pathname === '/';

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-cyber ${
          scrolled || !isLanding
            ? 'glass-panel border-b border-white/5'
            : 'bg-transparent'
        }`}
        style={{
          height: '72px',
        }}
      >
        <div className="max-w-[1440px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onMouseEnter={handleLogoHover}
            data-cursor="pointer"
          >
            <span
              className={`font-orbitron font-bold text-xl tracking-tight text-neon-cyan transition-all duration-300 ${
                logoGlitch ? 'animate-glitch' : ''
              }`}
              data-text="PCG"
            >
              PCG
            </span>
            {/* Animated divider */}
            <span className="w-px h-5 bg-neon-cyan/50 animate-neon-pulse" />
            <span className="font-sans font-medium text-base text-text-primary tracking-wide">
              创客星球
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link text-sm font-medium transition-colors duration-300 ${
                  location.pathname === item.path
                    ? 'text-neon-cyan'
                    : 'text-text-secondary hover:text-neon-cyan'
                }`}
                data-cursor="pointer"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Coins Display */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void-light/80 border border-neon-gold/20">
              <Coins size={14} className="text-neon-gold" />
              <span className="text-sm font-mono font-medium text-neon-gold">{coins.toLocaleString()}</span>
            </div>

            {/* Level Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void-light/80 border border-neon-green/20">
              <Sparkles size={14} className="text-neon-green" />
              <span className="text-xs font-mono font-medium text-neon-green">Lv.{level}</span>
            </div>

            {/* Avatar */}
            <Link to="/hub" className="hidden sm:block" data-cursor="pointer">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-neon-cyan/40 hover:border-neon-cyan transition-colors">
                <img src={avatar} alt="User" className="w-full h-full object-cover" />
              </div>
            </Link>

            {/* Music Toggle */}
            <button
              onClick={onMusicToggle}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full border border-neon-cyan/30 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan transition-all duration-300"
              aria-label={musicEnabled ? '关闭音乐' : '开启音乐'}
              data-cursor="pointer"
            >
              {musicEnabled ? <Music size={16} /> : <Music2 size={16} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
              aria-label="菜单"
              data-cursor="pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-screen Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-void flex flex-col pt-20 animate-slide-in">
          <div className="flex flex-col items-center gap-6 py-12">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-medium text-text-primary hover:text-neon-cyan transition-colors duration-300"
                style={{
                  animationDelay: `${index * 0.08}s`,
                }}
                data-cursor="pointer"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/hub"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-text-primary hover:text-neon-cyan transition-colors duration-300"
              data-cursor="pointer"
            >
              个人中心
            </Link>
          </div>

          {/* Mobile stats */}
          <div className="mt-auto p-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-neon-gold" />
              <span className="text-sm font-mono text-neon-gold">{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-neon-green" />
              <span className="text-sm font-mono text-neon-green">Lv.{level}</span>
            </div>
            <button
              onClick={() => {
                onMusicToggle?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-text-secondary"
              data-cursor="pointer"
            >
              {musicEnabled ? <Music size={16} /> : <Music2 size={16} />}
              <span>音乐</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
