import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Clock,
  AlertTriangle,
  ArrowRight,
  Flame,
  Target,
  Shield,
} from 'lucide-react';
import { predictHeat, type HeatPrediction } from '@/services/aiMock';

/**
 * HeatPreloader - 热点预埋雷达
 *
 * 核心功能：
 * - 输入关注话题
 * - AI预测72小时热点
 * - 展示3个预测热点卡片：话题名/预测热度/距爆发时间/置信度/行动建议/竞争人数
 * - 行动倒计时动画
 * - 置信度进度条
 * - 竞争人数预警（红色=竞争激烈）
 * - "立即制作内容"按钮→跳转到创作工坊并带入话题
 */

interface HeatPreloaderProps {
  topic?: string;
  onCreateContent?: (topic: string) => void;
}

function getHeatColor(heat: number): string {
  if (heat >= 90) return '#FF2A6D';
  if (heat >= 80) return '#FF6B35';
  if (heat >= 70) return '#FFD700';
  return '#00F0FF';
}

function getConfidenceColor(conf: number): string {
  if (conf >= 80) return '#39FF14';
  if (conf >= 60) return '#FFD700';
  return '#FF2A6D';
}

function getCompetitionLevel(count: number): { label: string; color: string; intense: boolean } {
  if (count <= 3) return { label: '竞争温和', color: '#39FF14', intense: false };
  if (count <= 8) return { label: '竞争中等', color: '#FFD700', intense: false };
  return { label: '竞争激烈', color: '#FF2A6D', intense: true };
}

function CountdownTimer({ hours }: { hours: number }) {
  const [remaining, setRemaining] = useState(hours * 3600); // seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  return (
    <div className="flex items-center gap-1 text-sm font-mono font-black" style={{ color: '#FF2A6D' }}>
      <Clock size={14} />
      <span>
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function HeatPreloader({ topic: initialTopic = '', onCreateContent }: HeatPreloaderProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [isScanning, setIsScanning] = useState(false);
  const [predictions, setPredictions] = useState<HeatPrediction[]>([]);
  const [scanTimestamp, setScanTimestamp] = useState<number>(0);

  const handleScan = useCallback(async () => {
    if (!topic.trim()) {
      alert('请输入关注话题');
      return;
    }
    setIsScanning(true);
    setPredictions([]);

    const result = await predictHeat(topic);
    setPredictions(result);
    setScanTimestamp(Date.now());
    setIsScanning(false);
  }, [topic]);

  const handleCreateContent = useCallback((targetTopic: string) => {
    if (onCreateContent) {
      onCreateContent(targetTopic);
    } else {
      // Fallback: store in sessionStorage for workshop to pick up
      sessionStorage.setItem('heat_preloader_topic', targetTopic);
      alert(`已保存话题「${targetTopic}」，请前往创作工坊查看`);
    }
  }, [onCreateContent]);

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#0A0A0F', border: '1px solid rgba(0,240,255,0.15)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.1)' }}>
          <Radar size={20} style={{ color: '#00F0FF' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#00F0FF' }}>热点预埋雷达</h2>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>72小时热点预测，提前布局抢占先机</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 py-5">
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
          关注话题
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入你关注的话题，如：AI绘画、减脂餐、职场穿搭..."
            className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{
              background: '#12121A',
              border: '1px solid rgba(0,240,255,0.15)',
              color: '#fff',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all flex-shrink-0"
            style={{
              background: isScanning ? 'rgba(0,240,255,0.1)' : '#00F0FF',
              color: isScanning ? 'rgba(0,240,255,0.5)' : '#0A0A0F',
              cursor: isScanning ? 'not-allowed' : 'pointer',
            }}
          >
            {isScanning ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Sparkles size={16} />
                </motion.div>
                扫描中...
              </>
            ) : (
              <>
                <Radar size={16} />
                扫描热点
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Scanning Animation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-6"
          >
            <div className="p-4 rounded-xl" style={{ background: '#12121A', border: '1px solid rgba(0,240,255,0.15)' }}>
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ border: '2px solid rgba(0,240,255,0.3)' }}
                >
                  <Radar size={16} style={{ color: '#00F0FF' }} />
                </motion.div>
                <div>
                  <div className="text-sm font-medium" style={{ color: '#00F0FF' }}>正在扫描全网热点...</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>分析社交平台、搜索引擎、新闻趋势</div>
                </div>
              </div>
              {/* Progress bars simulation */}
              <div className="space-y-2">
                {['微博热搜趋势', '抖音话题指数', '小红书搜索热度', '百度指数波动'].map((label, i) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <span>{label}</span>
                      <span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.4 }}
                        >
                          分析中...
                        </motion.span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, delay: i * 0.3, ease: 'easeInOut' }}
                        className="h-full rounded-full"
                        style={{ background: '#00F0FF' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prediction Cards */}
      <AnimatePresence>
        {predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 pb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <Flame size={14} className="inline mr-1" />
                发现 {predictions.length} 个潜在热点
              </h3>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                扫描时间: {new Date(scanTimestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-4">
              {predictions.map((prediction, index) => {
                const heatColor = getHeatColor(prediction.predictedHeat);
                const confColor = getConfidenceColor(prediction.confidence);
                const comp = getCompetitionLevel(prediction.competition);

                return (
                  <motion.div
                    key={prediction.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: '#12121A',
                      border: `1px solid ${heatColor}30`,
                    }}
                  >
                    {/* Card Header */}
                    <div className="p-4 flex items-start gap-4">
                      {/* Heat Score Circle */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center relative"
                          style={{
                            background: `${heatColor}15`,
                            border: `2px solid ${heatColor}`,
                          }}
                        >
                          <span className="text-xl font-black" style={{ color: heatColor }}>
                            {prediction.predictedHeat}
                          </span>
                        </div>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>预测热度</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold truncate" style={{ color: '#F0F0FF' }}>
                            {prediction.topic}
                          </h4>
                          {index === 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#FF2A6D', color: '#fff' }}>
                              最高热度
                            </span>
                          )}
                        </div>

                        {/* Countdown */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>距爆发:</span>
                          <CountdownTimer hours={prediction.hoursUntilPeak} />
                        </div>

                        {/* Confidence Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>AI置信度</span>
                            <span style={{ color: confColor }}>{prediction.confidence}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${prediction.confidence}%` }}
                              transition={{ duration: 1.2, delay: index * 0.2, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: confColor }}
                            />
                          </div>
                        </div>

                        {/* Competition Warning */}
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={12} style={{ color: comp.color }} />
                          <span className="text-xs" style={{ color: comp.color }}>
                            {prediction.competition}人正在布局
                          </span>
                          {comp.intense && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,42,109,0.15)', color: '#FF2A6D' }}>
                              <AlertTriangle size={10} />
                              竞争激烈
                            </span>
                          )}
                        </div>

                        {/* Action Advice */}
                        <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(0,240,255,0.05)' }}>
                          <Target size={12} className="text-neon-cyan flex-shrink-0 mt-0.5" />
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {prediction.action}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-4 pb-4">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleCreateContent(prediction.topic)}
                        className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: comp.intense ? 'rgba(255,42,109,0.15)' : 'rgba(0,240,255,0.15)',
                          color: comp.intense ? '#FF2A6D' : '#00F0FF',
                          border: `1px solid ${comp.intense ? 'rgba(255,42,109,0.3)' : 'rgba(0,240,255,0.3)'}`,
                        }}
                      >
                        {comp.intense ? <Shield size={14} /> : <Zap size={14} />}
                        立即制作内容
                        <ArrowRight size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}>
                <TrendingUp size={18} className="mx-auto mb-1 text-neon-magenta" />
                <div className="text-lg font-black" style={{ color: '#FF2A6D' }}>
                  {Math.max(...predictions.map((p) => p.predictedHeat))}
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>最高预测热度</div>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Clock size={18} className="mx-auto mb-1 text-neon-cyan" />
                <div className="text-lg font-black" style={{ color: '#00F0FF' }}>
                  {Math.min(...predictions.map((p) => p.hoursUntilPeak))}h
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>最快爆发时间</div>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Users size={18} className="mx-auto mb-1 text-neon-gold" />
                <div className="text-lg font-black" style={{ color: '#FFD700' }}>
                  {Math.max(...predictions.map((p) => p.competition))}
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>最高竞争人数</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
