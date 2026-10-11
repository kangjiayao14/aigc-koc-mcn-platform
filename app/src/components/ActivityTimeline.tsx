import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Users, TrendingUp, LogIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Activity } from '@/hooks/useGameState';

interface TypeConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  content: { icon: FileText, color: '#00F0FF', bg: '#00F0FF15' },
  quest: { icon: CheckCircle2, color: '#39FF14', bg: '#39FF1415' },
  social: { icon: Users, color: '#BD00FF', bg: '#BD00FF15' },
  level: { icon: TrendingUp, color: '#FFD700', bg: '#FFD70015' },
  login: { icon: LogIn, color: '#8A8AA0', bg: '#8A8AA015' },
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline = memo(function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="rounded-2xl border border-white/5 bg-[#12121A]/80 backdrop-blur-sm p-5"
    >
      <h2 className="text-base font-medium text-[#F0F0FF] mb-4">最近活动</h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-white/5" />

        <div className="space-y-4">
          {activities.slice(0, 6).map((activity, index) => {
            const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.login;
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                className="relative flex items-start gap-3 pl-1"
              >
                {/* Icon dot */}
                <div
                  className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: config.bg }}
                >
                  <Icon size={14} color={config.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs text-[#F0F0FF]">{activity.title}</p>
                  <p className="text-[11px] text-[#8A8AA0] mt-0.5 truncate">
                    {activity.description}
                  </p>
                  <p className="text-[10px] text-[#4A4A60] mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-6 text-[#4A4A60] text-xs">
          暂无活动记录
        </div>
      )}
    </motion.div>
  );
});

export default ActivityTimeline;
