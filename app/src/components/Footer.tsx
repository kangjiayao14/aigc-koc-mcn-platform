import { Link } from 'react-router';

/**
 * Footer - Minimal cyberpunk styled footer
 *
 * Features:
 * - Brand info with neon styling
 * - Quick navigation links
 * - Copyright text in mono font
 * - Decorative corner elements
 *
 * TODO: Add social media links
 * TODO: Add version info
 */
export default function Footer() {
  const navLinks = [
    { label: '商城', path: '/marketplace' },
    { label: '内容实验室', path: '/content-lab' },
    { label: '选题雷达', path: '/topic-research' },
    { label: '社交星球', path: '/social' },
    { label: '专家工坊', path: '/workshop' },
  ];

  return (
    <footer className="relative w-full border-t border-white/5 bg-void">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="flex items-center gap-2 group" data-cursor="pointer">
              <span className="font-orbitron font-bold text-lg text-neon-cyan">PCG</span>
              <span className="w-px h-4 bg-neon-cyan/50" />
              <span className="font-sans font-medium text-sm text-text-primary">创客星球</span>
            </Link>
            <p className="text-xs text-text-muted text-center md:text-left max-w-[240px]">
              你的专属 AI 合伙人，从零到一打造超级个体
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-text-secondary hover:text-neon-cyan transition-colors duration-300"
                data-cursor="pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Decorative Element */}
          <div className="hidden lg:block">
            <div className="w-16 h-16 border border-neon-cyan/10 rounded-lg rotate-45 flex items-center justify-center">
              <div className="w-8 h-8 border border-neon-magenta/10 rounded rotate-0" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-text-muted">
            PCG-创客星球 &copy; 2025 | 赛题⑤ PCG技术线-智能营销/AI小游戏方向
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-xs text-text-muted">系统正常运行中</span>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-neon-cyan/10" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-neon-cyan/10" />
    </footer>
  );
}
