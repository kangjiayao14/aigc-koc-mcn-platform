import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Sunrise, Sunset, Moon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface WelcomeSectionProps {
  username: string;
  brokerName: string;
  brokerType: 'male' | 'female';
  energy: number;
  maxEnergy: number;
}

function getGreeting(hour: number): { text: string; icon: LucideIcon; color: string } {
  if (hour >= 5 && hour < 12) {
    return { text: '早上好', icon: Sunrise, color: '#FFD700' };
  }
  if (hour >= 12 && hour < 18) {
    return { text: '下午好', icon: Sunset, color: '#FF8C00' };
  }
  if (hour >= 18 && hour < 22) {
    return { text: '晚上好', icon: Moon, color: '#BD00FF' };
  }
  return { text: '夜深了', icon: Moon, color: '#4A4A60' };
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const day = days[date.getDay()];
  return `${day} ${h}:${m}`;
}

const WelcomeSection = memo(function WelcomeSection({
  username,
  brokerName,
  brokerType,
  energy,
  maxEnergy,
}: WelcomeSectionProps) {
  const [now, setNow] = useState(new Date());
  const greeting = getGreeting(now.getHours());
  const GreetingIcon = greeting.icon;
  const brokerAvatar = brokerType === 'male' ? '/broker-male.png' : '/broker-female.png';
  const brokerColor = brokerType === 'male' ? '#00D4FF' : '#FF6B9D';
  const energyPct = (energy / maxEnergy) * 100;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="relative rounded-2xl border border-white/5 bg-[#12121A]/80 backdrop-blur-sm overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${brokerColor} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="relative p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Greeting + Broker */}
          <div className="flex items-center gap-4">
            {/* Broker avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full overflow-hidden border-2 p-0.5"
                style={{ borderColor: brokerColor }}
              >
                <img
                  src={brokerAvatar}
                  alt={brokerName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {/* Status dot */}
              <div
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#12121A]"
                style={{ backgroundColor: '#39FF14' }}
              />
            </div>

            {/* Text */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <GreetingIcon size={14} style={{ color: greeting.color }} />
                <span className="text-xs text-[#8A8AA0]">{formatTime(now)}</span>
              </div>
              <h1 className="text-xl font-medium text-[#F0F0FF]">
                {greeting.text}，{username}
              </h1>
              <p className="text-xs text-[#8A8AA0] mt-0.5">
                你的经纪人 <span style={{ color: brokerColor }}>{brokerName}</span> 已就绪
              </p>
            </div>
          </div>

          {/* Right: Energy */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0A0A0F]/60 border border-white/5">
            <div className="flex items-center gap-1.5">
              <Zap size={16} className="text-[#39FF14]" />
              <span className="text-sm font-medium text-[#F0F0FF]">能量</span>
            </div>
            <div className="w-24 h-2 rounded-full bg-[#0A0A0F] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: energyPct > 50
                    ? 'linear-gradient(90deg, #39FF14, #00F0FF)'
                    : energyPct > 20
                      ? 'linear-gradient(90deg, #FFD700, #FF8C00)'
                      : 'linear-gradient(90deg, #FF2A6D, #FF6B9D)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${energyPct}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              />
            </div>
            <span className="text-xs font-mono text-[#8A8AA0]">
              {energy}/{maxEnergy}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default WelcomeSection;
