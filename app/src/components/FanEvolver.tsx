import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Heart,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Target,
  Activity,
  PieChart,
  Zap,
} from 'lucide-react';
import {
  type FanSegment,
} from '@/services/aiMock';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

/**
 * FanEvolver - 粉丝画像进化器
 *
 * 核心功能：
 * - 点击"分析粉丝画像"→调用 analyzeFanEvolution()
 * - 展示4个粉丝群体（饼图或卡片）
 * - 每个群体：标签/占比/兴趣标签/活跃时间/互动率
 * - 时间轴：显示粉丝群体变化趋势（过去30天）
 * - 洞察卡片："你的粉丝最近对XX话题更感兴趣"
 * - 预警："XX群体互动率下降15%，建议增加相关内容"
 * - 反向优化建议：基于粉丝变化推荐内容方向
 */

const SEGMENT_COLORS = ['#00F0FF', '#FF2A6D', '#39FF14', '#FFD700'];

// Generate mock 30-day trend data for each segment
const generateTrendData = (segments: FanSegment[]) => {
  const days = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);
  return days.map((day, idx) => {
    const point: Record<string, number | string> = { day };
    segments.forEach((seg, sIdx) => {
      // Simulate slight fluctuations around the base percentage
      const base = seg.percentage;
      const fluctuation = Math.sin(idx * 0.3 + sIdx * 1.5) * 4 + (Math.random() - 0.5) * 3;
      point[seg.label] = Math.max(5, Math.min(60, base + fluctuation));
    });
    return point;
  });
};

// Generate insight and warnings based on segments
const generateInsights = (segments: FanSegment[]) => {
  const insights: { type: 'insight' | 'warning'; text: string; color: string }[] = [];

  // Find segment with highest engagement
  const topEngaged = segments.reduce((max, s) => (s.engagementRate > max.engagementRate ? s : max), segments[0]);
  if (topEngaged) {
    insights.push({
      type: 'insight',
      text: `你的「${topEngaged.label}」粉丝互动率最高（${topEngaged.engagementRate}%），建议多发布${topEngaged.interests[0]}相关内容`,
      color: '#00F0FF',
    });
  }

  // Find segment with lowest engagement
  const lowEngaged = segments.reduce((min, s) => (s.engagementRate < min.engagementRate ? s : min), segments[0]);
  if (lowEngaged && lowEngaged.engagementRate < 7) {
    const dropRate = (Math.random() * 10 + 10).toFixed(0);
    insights.push({
      type: 'warning',
      text: `「${lowEngaged.label}」互动率下降${dropRate}%，建议增加${lowEngaged.interests[0]}和${lowEngaged.interests[1]}相关内容`,
      color: '#FF2A6D',
    });
  }

  // Find largest segment
  const largest = segments.reduce((max, s) => (s.percentage > max.percentage ? s : max), segments[0]);
  if (largest) {
    insights.push({
      type: 'insight',
      text: `「${largest.label}」是你的核心粉丝群体（${largest.percentage}%），活跃时间为${largest.activeTime}，建议在此时间段发布`,
      color: '#39FF14',
    });
  }

  return insights;
};

// Generate reverse optimization suggestions
const generateOptimizationSuggestions = (segments: FanSegment[]) => {
  const suggestions: string[] = [];

  const allInterests = segments.flatMap((s) => s.interests);
  const uniqueInterests = [...new Set(allInterests)].slice(0, 5);

  suggestions.push(`增加「${uniqueInterests[0]}」类内容产出，契合${segments[0]?.label || ''}粉丝兴趣`);
  suggestions.push(`在${segments[1]?.activeTime || '20:00-22:00'}时段发布${uniqueInterests[1]}相关内容，触达${segments[1]?.label || ''}群体`);
  suggestions.push(`尝试${uniqueInterests[2]}选题，有望吸引新粉丝并激活${segments[2]?.label || ''}群体`);
  suggestions.push(`制作系列化${uniqueInterests[3]}内容，提升${segments[3]?.label || ''}粉丝的长期粘性`);
  suggestions.push(`结合${uniqueInterests[0]}和${uniqueInterests[1]}做跨界选题，覆盖更多粉丝兴趣交集`);

  return suggestions;
};

export default function FanEvolver() {
  const [segments, setSegments] = useState<FanSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setTimeout(() => {
      setSegments([
        { label: '职场新人', percentage: 35, interests: ['面试技巧', '职场穿搭', '沟通话术'], activeTime: '20:00-22:00', engagementRate: 8.5 },
        { label: '学生党', percentage: 28, interests: ['学习方法', '省钱攻略', '平价好物'], activeTime: '12:00-14:00', engagementRate: 12.3 },
        { label: '宝妈群体', percentage: 20, interests: ['育儿经验', '家居整理', '快手菜'], activeTime: '10:00-12:00', engagementRate: 6.8 },
        { label: '精致白领', percentage: 17, interests: ['效率工具', '轻奢好物', '健身打卡'], activeTime: '07:30-09:00', engagementRate: 5.2 },
      ]);
      setIsLoading(false);
    }, 900);
  }, []);

  const pieData = useMemo(
    () =>
      segments.map((s, i) => ({
        name: s.label,
        value: s.percentage,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        ...s,
      })),
    [segments]
  );

  const trendData = useMemo(() => {
    if (segments.length === 0) return [];
    return generateTrendData(segments);
  }, [segments]);

  const insights = useMemo(() => {
    if (segments.length === 0) return [];
    return generateInsights(segments);
  }, [segments]);

  const suggestions = useMemo(() => {
    if (segments.length === 0) return [];
    return generateOptimizationSuggestions(segments);
  }, [segments]);

  const avgEngagement = useMemo(() => {
    if (segments.length === 0) return 0;
    return segments.reduce((sum, s) => sum + s.engagementRate, 0) / segments.length;
  }, [segments]);

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,42,109,0.12)', border: '1px solid rgba(255,42,109,0.3)' }}
        >
          <Users size={20} style={{ color: '#FF2A6D' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">粉丝画像进化器</h2>
          <p className="text-xs text-text-muted">分析互动数据 → 动态更新 → 反向优化</p>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, rgba(255,42,109,0.12), rgba(189,0,255,0.08))',
          border: '1px solid rgba(255,42,109,0.3)',
        }}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={20} style={{ color: '#FF2A6D' }} />
          </motion.div>
        ) : (
          <Sparkles size={20} style={{ color: '#FF2A6D' }} />
        )}
        <span style={{ color: '#FF2A6D' }}>
          {isLoading ? 'AI正在分析粉丝画像...' : '分析粉丝画像'}
        </span>
        {!isLoading && (
          <span className="text-xs text-text-muted">基于过去30天互动数据深度分析</span>
        )}
      </button>

      {segments.length > 0 && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-lg p-3 text-center"
              style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)' }}
            >
              <Users size={16} className="mx-auto mb-1" style={{ color: '#00F0FF' }} />
              <div className="text-lg font-bold font-orbitron" style={{ color: '#00F0FF' }}>
                4
              </div>
              <div className="text-[10px] text-text-muted">核心群体</div>
            </div>
            <div
              className="rounded-lg p-3 text-center"
              style={{ background: 'rgba(255,42,109,0.05)', border: '1px solid rgba(255,42,109,0.1)' }}
            >
              <Activity size={16} className="mx-auto mb-1" style={{ color: '#FF2A6D' }} />
              <div className="text-lg font-bold font-orbitron" style={{ color: '#FF2A6D' }}>
                {avgEngagement.toFixed(1)}%
              </div>
              <div className="text-[10px] text-text-muted">平均互动率</div>
            </div>
            <div
              className="rounded-lg p-3 text-center"
              style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.1)' }}
            >
              <Target size={16} className="mx-auto mb-1" style={{ color: '#39FF14' }} />
              <div className="text-lg font-bold font-orbitron" style={{ color: '#39FF14' }}>
                {segments.reduce((sum, s) => sum + s.interests.length, 0)}
              </div>
              <div className="text-[10px] text-text-muted">兴趣标签</div>
            </div>
          </div>

          {/* Pie Chart + Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <PieChart size={14} style={{ color: '#00F0FF' }} />
                <span className="text-xs font-bold text-text-secondary">粉丝群体分布</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                      onClick={(_, index) => setActiveSegment(segments[index]?.label || null)}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={activeSegment === null || activeSegment === entry.name ? 1 : 0.3}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#12121A',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      itemStyle={{ color: '#F0F0FF' }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {pieData.map((entry) => (
                  <button
                    key={entry.name}
                    onClick={() =>
                      setActiveSegment(activeSegment === entry.name ? null : entry.name)
                    }
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-all"
                    style={{
                      background:
                        activeSegment === entry.name
                          ? `${entry.color}20`
                          : 'rgba(255,255,255,0.04)',
                      border:
                        activeSegment === entry.name
                          ? `1px solid ${entry.color}50`
                          : '1px solid rgba(255,255,255,0.06)',
                      color: entry.color,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    {entry.name} {entry.value}%
                  </button>
                ))}
              </div>
            </div>

            {/* Segment Cards */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {segments.map((seg, idx) => {
                const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
                const isActive = activeSegment === null || activeSegment === seg.label;

                return (
                  <motion.div
                    key={seg.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="rounded-lg p-3"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}40` }}
                        />
                        <span className="text-xs font-bold text-text-primary">{seg.label}</span>
                      </div>
                      <span className="text-xs font-bold font-orbitron" style={{ color }}>
                        {seg.percentage}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Heart size={10} style={{ color: '#FF2A6D' }} />
                        <span className="text-text-muted">互动率:</span>
                        <span className="text-text-primary">{seg.engagementRate}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} style={{ color: '#FFD700' }} />
                        <span className="text-text-muted">活跃:</span>
                        <span className="text-text-primary">{seg.activeTime}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {seg.interests.map((interest) => (
                        <span
                          key={interest}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: `${color}15`, color }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Trend Chart Toggle */}
          <button
            onClick={() => setShowTrend(!showTrend)}
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.2)',
              color: '#00F0FF',
            }}
          >
            <TrendingUp size={14} />
            {showTrend ? '收起趋势图' : '查看30天变化趋势'}
            {showTrend ? (
              <TrendingDown size={14} />
            ) : (
              <ArrowRight size={14} />
            )}
          </button>

          {/* Trend Chart */}
          <AnimatePresence>
            {showTrend && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={14} style={{ color: '#00F0FF' }} />
                    <span className="text-xs font-bold text-text-secondary">30天粉丝群体变化趋势</span>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="day"
                          stroke="#4A4A60"
                          tick={{ fontSize: 10 }}
                          interval={4}
                        />
                        <YAxis stroke="#4A4A60" tick={{ fontSize: 10 }} domain={[0, 60]} />
                        <Tooltip
                          contentStyle={{
                            background: '#12121A',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                          itemStyle={{ color: '#F0F0FF' }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`]}
                        />
                        {segments.map((seg, idx) => (
                          <Line
                            key={seg.label}
                            type="monotone"
                            dataKey={seg.label}
                            stroke={SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            opacity={activeSegment === null || activeSegment === seg.label ? 1 : 0.2}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insights & Warnings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} style={{ color: '#FFD700' }} />
              <span className="text-xs font-bold text-text-secondary">AI洞察与预警</span>
            </div>
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-lg p-3 flex items-start gap-2.5"
                style={{
                  background:
                    insight.type === 'warning'
                      ? 'rgba(255,42,109,0.05)'
                      : 'rgba(0,240,255,0.05)',
                  border:
                    insight.type === 'warning'
                      ? '1px solid rgba(255,42,109,0.15)'
                      : '1px solid rgba(0,240,255,0.15)',
                }}
              >
                {insight.type === 'warning' ? (
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#FF2A6D' }} />
                ) : (
                  <Lightbulb size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#00F0FF' }} />
                )}
                <span className="text-[11px] text-text-secondary leading-relaxed">
                  {insight.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Reverse Optimization Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: '#39FF14' }} />
              <span className="text-xs font-bold text-text-secondary">反向优化建议</span>
            </div>
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: 'rgba(57,255,20,0.03)',
                border: '1px solid rgba(57,255,20,0.12)',
              }}
            >
              <p className="text-[11px] text-text-muted">
                基于粉丝画像变化，AI推荐以下内容方向调整：
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-2"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: 'rgba(57,255,20,0.12)',
                        color: '#39FF14',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-[11px] text-text-secondary leading-relaxed">
                      {suggestion}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && segments.length === 0 && (
        <div className="py-12 text-center rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Users size={32} className="mx-auto mb-3" style={{ color: '#4A4A60' }} />
          <p className="text-sm text-text-muted">点击上方按钮分析粉丝画像</p>
          <p className="text-xs text-text-muted mt-1">AI将深度解析你的粉丝群体结构与兴趣变迁</p>
        </div>
      )}
    </div>
  );
}
