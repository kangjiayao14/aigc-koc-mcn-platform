/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn/ui base colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PCG Design System Colors
        void: {
          DEFAULT: '#0A0A0F',
          light: '#12121A',
        },
        'neon-cyan': '#00F0FF',
        'neon-magenta': '#FF2A6D',
        'neon-gold': '#FFD700',
        'neon-green': '#39FF14',
        'neon-violet': '#BD00FF',
        'text-primary': '#F0F0FF',
        'text-secondary': '#8A8AA0',
        'text-muted': '#4A4A60',
        surface: 'rgba(18,18,26,0.7)',
        'border-glow': 'rgba(0,240,255,0.25)',
        'male-broker': '#00D4FF',
        'female-broker': '#FF6B9D',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        zcool: ['"ZCOOL XiaoWei"', 'serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgba(0, 240, 255, 0.3)",
        'glow-lg': "0 0 40px rgba(0, 240, 255, 0.4)",
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
        'glow-magenta': '0 0 20px rgba(255, 42, 109, 0.4), 0 0 40px rgba(255, 42, 109, 0.2)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0,240,255,0.3), 0 0 10px rgba(0,240,255,0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(0,240,255,0.6), 0 0 40px rgba(0,240,255,0.3)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)", clipPath: "inset(0 0 0 0)" },
          "10%": { transform: "translate(-4px, 2px)", clipPath: "inset(10% 0 60% 0)" },
          "20%": { transform: "translate(4px, -2px)", clipPath: "inset(40% 0 20% 0)" },
          "30%": { transform: "translate(-2px, 4px)", clipPath: "inset(70% 0 5% 0)" },
          "40%": { transform: "translate(2px, -4px)", clipPath: "inset(20% 0 50% 0)" },
          "50%": { transform: "translate(0)", clipPath: "inset(0 0 0 0)" },
        },
        "glitch-text": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-3px, 1px)" },
          "40%": { transform: "translate(3px, -1px)" },
          "60%": { transform: "translate(-2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        "scan-line": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "reward-fly": {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "1" },
          "50%": { transform: "translate(-50%, -100px) scale(1.3)", opacity: "0.8" },
          "100%": { transform: "translate(-100px, -200px) scale(0.5)", opacity: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.5" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scroll-indicator": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.5" },
          "50%": { transform: "translateY(8px)", opacity: "1" },
        },
        "badge-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "glitch": "glitch 0.4s ease-in-out",
        "glitch-periodic": "glitch-text 0.3s ease-in-out",
        "scan-line": "scan-line 10s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "reward-fly": "reward-fly 1s ease-out forwards",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "marquee": "marquee 20s linear infinite",
        "fade-up": "fade-up 0.5s ease-out",
        "slide-in": "slide-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "scroll-indicator": "scroll-indicator 1.5s ease-in-out infinite",
        "badge-pulse": "badge-pulse 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        'cyber': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-custom': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'dramatic': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #0A0A0F 0%, #12121A 40%, #0D0D1A 100%)',
        'gradient-cyan-glow': 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)',
        'gradient-warp': 'conic-gradient(from 0deg, #00F0FF, #BD00FF, #FF2A6D, #00F0FF)',
        'gradient-gold-shimmer': 'linear-gradient(90deg, #FFD700, #FFF5B0, #FFD700)',
        'gradient-rank-up': 'linear-gradient(135deg, #39FF14, #00F0FF, #BD00FF)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
