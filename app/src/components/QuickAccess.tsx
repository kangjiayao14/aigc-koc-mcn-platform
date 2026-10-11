import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { FlaskConical, Radar, Gamepad2, Brain } from 'lucide-react';

const ITEMS = [
  {
    label: '内容实验室',
    desc: 'AI生成推文与配图',
    icon: FlaskConical,
    color: '#00F0FF',
    path: '/content-lab',
  },
  {
    label: '选题雷达',
    desc: '发现爆款选题趋势',
    icon: Radar,
    color: '#FF2A6D',
    path: '/topic-research',
  },
  {
    label: '社交星球',
    desc: '社交聚会与游戏',
    icon: Gamepad2,
    color: '#BD00FF',
    path: '/social',
  },
  {
    label: '专家工坊',
    desc: 'AI专家深度讨论',
    icon: Brain,
    color: '#FFD700',
    path: '/workshop',
  },
];

const QuickAccess = memo(function QuickAccess() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="rounded-2xl border border-white/5 bg-[#12121A]/80 backdrop-blur-sm p-5"
    >
      <h2 className="text-base font-medium text-[#F0F0FF] mb-4">快捷入口</h2>
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            >
              <Link
                to={item.path}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0A0A0F]/40 border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
                data-cursor="pointer"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-[#F0F0FF] group-hover:text-[#00F0FF] transition-colors">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-[#8A8AA0] mt-0.5">{item.desc}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

export default QuickAccess;
