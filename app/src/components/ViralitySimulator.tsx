import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, TrendingUp, AlertTriangle, CheckCircle2, ChevronUp, Zap, Copy, Sparkles } from 'lucide-react';
import { simulateABTesting, generateVariant, type ABTestResult } from '@/services/aiMock';

/**
 * ViralitySimulator - 爆款沙盘模拟器
 * 
 * 核心创新：
 * - 终端风格控制台（黑客帝国打字机输出）
 * - A/B版横向对比（原稿 vs AI变异版）
 * - 进度条：曝光量/互动率/爆款概率
 * - 结论高亮：AI优化建议（如"采用B版标题+A版封面，综合爆款率提升42%"）
 * 
 * 挂载位置：创作工坊生成结果下方
 */

interface SimulatorProps {
  content: {
    title: string;
    body: string;
    platform: string;
    cover?: string;
  };
}

const TERMINAL_LINES = [
  '> 正在挂载 PCG 流量预估模型 v3.2...',
  '> 模型加载完成 ✓',
  '> 提取标题特征: 悬念度分析中...',
  '> 标题情感倾向: 积极/好奇/期待',
  '> 测算流量池转化率...',
  '> 封面视觉吸引力评分: 78/100',
  '> 竞品横向对比完成',
  '> 生成A/B测试变异版本...',
  '> 变异版本已生成 ✓',
  '> 运行10000次蒙特卡洛模拟...',
  '> 预测收敛完成',
  '> 正在输出最终报告...',
];

export default function ViralitySimulator({ content }: SimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [result, setResult] = useState<ABTestResult | null>(null);
  const [variantB, setVariantB] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  const runSimulation = useCallback(async () => {
    setIsOpen(true);
    setIsRunning(true);
    setTerminalLines([]);
    setResult(null);

    // Terminal typing animation
    for (let i = 0; i < TERMINAL_LINES.length; i++) {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, TERMINAL_LINES[i]]);
      }, i * 180);
    }

    // Generate variant B
    const vB = await generateVariant(content);
    setVariantB(vB);

    // Run A/B test
    const testResult = await simulateABTesting({ ...content, hasImage: !!content.cover });
    
    setTimeout(() => {
      setResult(testResult);
      setIsRunning(false);
    }, TERMINAL_LINES.length * 180 + 500);
  }, [content]);

  return (
    <div className="w-full mt-6">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={runSimulation}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,42,109,0.1))', border: '1px solid rgba(0,240,255,0.3)' }}
        >
          <Terminal size={20} className="text-neon-cyan" />
          <span className="text-sm font-bold text-text-primary">🎯 启动爆款沙盘模拟</span>
          <span className="text-xs text-text-muted">AI预测内容表现并生成优化建议</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl overflow-hidden mt-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Header with collapse */}
            <div 
              className="flex items-center justify-between px-5 py-3 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, rgba(0,240,255,0.08), transparent)' }}
              onClick={() => !isRunning && setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-neon-cyan" />
                <span className="text-sm font-bold text-text-primary">PCG 爆款沙盘模拟器</span>
                {result && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(57,255,20,0.15)', color: '#39FF14' }}>
                    分析完成
                  </span>
                )}
              </div>
              <button className="text-text-muted hover:text-text-primary">
                <ChevronUp size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* Terminal Output */}
              {isRunning && (
                <div 
                  className="rounded-xl p-4 mb-5 font-mono text-xs space-y-1 overflow-hidden"
                  style={{ background: '#050508', border: '1px solid rgba(57,255,20,0.2)' }}
                >
                  {terminalLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span style={{ color: '#39FF14' }}>{'>'}</span>
                      <span style={{ color: line.includes('✓') ? '#39FF14' : '#8A8AA0' }}>{line.replace('> ', '')}</span>
                      {line.includes('✓') && <CheckCircle2 size={12} className="text-neon-green" />}
                    </motion.div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center gap-2 mt-2">
                      <span style={{ color: '#39FF14' }}>{'>'}</span>
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ color: '#00F0FF' }}
                      >
                        _
                      </motion.span>
                    </div>
                  )}
                </div>
              )}

              {/* A/B Comparison */}
              {result && variantB && (
                <div className="space-y-5">
                  {/* Tab Switcher */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('A')}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: activeTab === 'A' ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: activeTab === 'A' ? '1px solid rgba(0,240,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        color: activeTab === 'A' ? '#00F0FF' : '#8A8AA0',
                      }}
                    >
                      A版（原稿）
                    </button>
                    <button
                      onClick={() => setActiveTab('B')}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: activeTab === 'B' ? 'rgba(255,42,109,0.15)' : 'rgba(255,255,255,0.04)',
                        border: activeTab === 'B' ? '1px solid rgba(255,42,109,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        color: activeTab === 'B' ? '#FF2A6D' : '#8A8AA0',
                      }}
                    >
                      B版（AI优化）
                    </button>
                  </div>

                  {/* Content Preview */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{ 
                      background: activeTab === 'A' ? 'rgba(0,240,255,0.05)' : 'rgba(255,42,109,0.05)',
                      border: activeTab === 'A' ? '1px solid rgba(0,240,255,0.15)' : '1px solid rgba(255,42,109,0.15)',
                    }}
                  >
                    <div className="text-[10px] mb-2" style={{ color: activeTab === 'A' ? '#00F0FF' : '#FF2A6D' }}>
                      {activeTab === 'A' ? 'A版 · 你的原始内容' : 'B版 · AI变异优化'}
                    </div>
                    <h4 className="text-sm font-bold text-text-primary mb-2">
                      {activeTab === 'A' ? content.title : variantB.title}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-3">
                      {activeTab === 'A' ? content.body : `${content.body}\n\n【AI优化点：标题悬念度提升，增加互动钩子】`}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* CTR */}
                    <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-[10px] text-text-muted mb-1">预计点击率</div>
                      <div className="flex items-center justify-center gap-3">
                        <div>
                          <div className="text-lg font-black" style={{ color: '#8A8AA0' }}>{result.versionA.ctr}</div>
                          <div className="text-[10px] text-text-muted">A版</div>
                        </div>
                        <TrendingUp size={16} className="text-neon-green" />
                        <div>
                          <div className="text-lg font-black" style={{ color: '#FF2A6D' }}>{result.versionB.ctr}</div>
                          <div className="text-[10px] text-text-muted">B版</div>
                        </div>
                      </div>
                    </div>

                    {/* Virality */}
                    <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-[10px] text-text-muted mb-1">爆款概率</div>
                      <div className="flex items-center justify-center gap-3">
                        <div>
                          <div className="text-lg font-black" style={{ color: '#8A8AA0' }}>{result.versionA.virality}</div>
                          <div className="text-[10px] text-text-muted">A版</div>
                        </div>
                        <Zap size={16} className="text-neon-gold" />
                        <div>
                          <div className="text-lg font-black" style={{ color: '#FF2A6D' }}>{result.versionB.virality}</div>
                          <div className="text-[10px] text-text-muted">B版</div>
                        </div>
                      </div>
                    </div>

                    {/* Exposure */}
                    <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-[10px] text-text-muted mb-1">预估曝光</div>
                      <div className="flex items-center justify-center gap-3">
                        <div>
                          <div className="text-lg font-black" style={{ color: '#8A8AA0' }}>{result.versionA.exposure.toLocaleString()}</div>
                          <div className="text-[10px] text-text-muted">A版</div>
                        </div>
                        <Sparkles size={16} className="text-neon-cyan" />
                        <div>
                          <div className="text-lg font-black" style={{ color: '#FF2A6D' }}>{result.versionB.exposure.toLocaleString()}</div>
                          <div className="text-[10px] text-text-muted">B版</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3">
                    {[
                      { label: 'A版曝光潜力', value: Math.min(result.versionA.exposure / 100, 100), color: '#00F0FF' },
                      { label: 'B版曝光潜力', value: Math.min(result.versionB.exposure / 100, 100), color: '#FF2A6D' },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span style={{ color: bar.color }}>{bar.label}</span>
                          <span style={{ color: bar.color }}>{bar.value.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.value}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: bar.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Conclusion */}
                  <div 
                    className="p-4 rounded-xl flex items-start gap-3"
                    style={{ background: 'linear-gradient(135deg, rgba(255,42,109,0.1), rgba(0,240,255,0.1))', border: '1px solid rgba(255,42,109,0.3)' }}
                  >
                    <AlertTriangle size={20} className="text-neon-magenta flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-text-primary mb-1">{result.combinedSuggestion}</div>
                      <div className="text-xs text-text-secondary">
                        A版建议：{result.versionA.advice} | B版建议：{result.versionB.advice}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: '#FF2A6D', color: '#fff' }}>
                      <Copy size={16} /> 采用B版优化方案
                    </button>
                    <button className="px-4 py-3 rounded-xl text-sm border border-white/15 text-text-secondary hover:text-text-primary transition-all">
                      重新模拟
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
