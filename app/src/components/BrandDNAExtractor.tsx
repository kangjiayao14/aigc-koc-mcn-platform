import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, ScanLine, Sparkles, Save, RotateCcw, Zap } from 'lucide-react';
import { analyzeDNA, type DNAProfile } from '@/services/aiMock';

/**
 * BrandDNAExtractor - 人设DNA提取引擎
 * 
 * 核心创新：
 * - 用户粘贴3段过往文案 → AI分析提取人设特征
 * - 全屏扫描动画（CSS扫描线）
 * - 5维雷达图展示（幽默/情绪/专业/亲和/攻击）
 * - 结果持久化到 localStorage('koc_dna_profile')
 * - 后续生成内容时强制带入DNA上下文
 */

const SCAN_LINES = 12;

export default function BrandDNAExtractor() {
  const [samples, setSamples] = useState<string[]>(['', '', '']);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DNAProfile | null>(null);
  const [scanLines, setScanLines] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSampleChange = useCallback((index: number, value: string) => {
    setSamples(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const startScan = useCallback(async () => {
    const validSamples = samples.filter(s => s.trim().length > 10);
    if (validSamples.length < 2) {
      alert('请至少粘贴2段有效文案（每段10字以上）');
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setResult(null);
    
    // Scanning animation
    for (let i = 0; i <= SCAN_LINES; i++) {
      setTimeout(() => {
        setScanLines(prev => [...prev, i]);
        setProgress(Math.floor((i / SCAN_LINES) * 100));
      }, i * 200);
    }

    // DNA analysis
    const dna = await analyzeDNA(validSamples);
    
    setTimeout(() => {
      setResult(dna);
      localStorage.setItem('koc_dna_profile', JSON.stringify(dna));
      setIsScanning(false);
      setScanLines([]);
    }, SCAN_LINES * 200 + 500);
  }, [samples]);

  const reset = useCallback(() => {
    setSamples(['', '', '']);
    setResult(null);
    setProgress(0);
  }, []);

  // Radar chart dimensions
  const radarSize = 280;
  const center = radarSize / 2;
  const radius = 100;
  const dimensions = ['幽默感', '情绪值', '专业度', '亲和力', '攻击性'];

  const getRadarPoints = (dna: DNAProfile) => {
    const values = [
      dna.dimensions.humor,
      dna.dimensions.emotionValue,
      dna.dimensions.professionalism,
      dna.dimensions.affinity,
      dna.dimensions.aggressiveness,
    ];
    const points = values.map((v, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const r = (v / 100) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    });
    return points.join(' ');
  };

  const getGridPoints = () => {
    return [20, 40, 60, 80, 100].map(pct => {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = (pct / 100) * radius;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      }).join(' ');
      return pts;
    });
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)' }}>
          <Dna size={16} className="text-neon-cyan" />
          <span className="text-xs text-neon-cyan font-medium">AI深度分析引擎</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-orbitron" style={{ color: '#00F0FF', textShadow: '0 0 20px rgba(0,240,255,0.3)' }}>
          人设DNA提取引擎
        </h2>
        <p className="text-sm text-text-secondary mt-2">粘贴你过往的内容文案，AI将提取你的人设基因并锁定风格</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Content Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <ScanLine size={14} className="text-neon-cyan" />
              内容喂料区（粘贴3段过往文案）
            </h3>
            <span className="text-[10px] text-text-muted">{samples.filter(s => s.trim().length > 10).length}/3 有效</span>
          </div>

          {samples.map((sample, i) => (
            <div key={i} className="relative">
              <div className="absolute top-2 left-3 text-[10px] font-mono text-text-muted">样本 {i + 1}</div>
              <textarea
                value={sample}
                onChange={(e) => handleSampleChange(i, e.target.value)}
                placeholder={`粘贴第${i + 1}段你发布过的文案...（建议100字以上）`}
                className="w-full h-28 p-3 pt-6 rounded-xl bg-surface border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50 resize-none"
              />
              {sample.trim().length > 10 && (
                <div className="absolute bottom-2 right-2 text-[10px] text-neon-green">✓ 有效</div>
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={startScan}
              disabled={isScanning}
              className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00F0FF, #0080FF)', color: '#0A0A0F' }}
            >
              {isScanning ? (
                <><Zap size={16} className="animate-pulse" /> 分析中 {progress}%</>
              ) : (
                <><Sparkles size={16} /> 提纯DNA</>
              )}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl text-sm border border-white/15 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Tips */}
          <div className="text-[11px] text-text-muted space-y-1 mt-2">
            <p>💡 建议粘贴你互动率最高的内容</p>
            <p>💡 文案越多样，DNA分析越精准</p>
          </div>
        </div>

        {/* RIGHT: Scanning + Result */}
        <div className="relative min-h-[400px] rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Scanning Overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                style={{ background: 'rgba(10,10,15,0.95)' }}
              >
                {/* Scan Lines */}
                {scanLines.map((line) => (
                  <motion.div
                    key={line}
                    initial={{ top: '0%' }}
                    animate={{ top: `${(line / SCAN_LINES) * 100}%` }}
                    className="absolute left-0 right-0 h-px"
                    style={{
                      background: line % 2 === 0 
                        ? 'linear-gradient(90deg, transparent, #39FF14, transparent)' 
                        : 'linear-gradient(90deg, transparent, #00F0FF, transparent)',
                      boxShadow: line % 2 === 0 ? '0 0 8px #39FF14' : '0 0 8px #00F0FF',
                    }}
                  />
                ))}

                <div className="text-center z-10">
                  <Dna size={48} className="mx-auto mb-4 text-neon-cyan animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="font-mono text-sm" style={{ color: '#39FF14' }}>
                    {'>'} 正在扫描文案基因序列...
                  </div>
                  <div className="font-mono text-xs mt-2 text-text-muted">
                    {'>'} 已分析 {samples.filter(s => s.trim().length > 0).reduce((a, b) => a + b.length, 0)} 个字符
                  </div>
                  <div className="w-48 h-1 mt-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #00F0FF, #39FF14)' }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!isScanning && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Dna size={64} className="text-text-muted/30 mb-4" />
              <p className="text-sm text-text-muted">在左侧粘贴文案后点击"提纯DNA"</p>
              <p className="text-xs text-text-muted mt-1">AI将为你生成专属人设雷达图</p>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {!isScanning && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 h-full"
              >
                {/* DNA Profile Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">你的人设基因</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,240,255,0.15)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)' }}>
                        {result.tone}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,42,109,0.15)', color: '#FF2A6D', border: '1px solid rgba(255,42,109,0.3)' }}>
                        {result.contentPillar}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: '#00F0FF' }}>{result.emojiDensity * 100}%</div>
                    <div className="text-[10px] text-text-muted">emoji密度</div>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="flex justify-center mb-4">
                  <svg width={radarSize} height={radarSize} className="drop-shadow-2xl">
                    {/* Grid */}
                    {getGridPoints().map((pts, i) => (
                      <polygon
                        key={i}
                        points={pts}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Axis lines */}
                    {Array.from({ length: 5 }, (_, i) => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                      const x2 = center + radius * Math.cos(angle);
                      const y2 = center + radius * Math.sin(angle);
                      return (
                        <line
                          key={i}
                          x1={center} y1={center}
                          x2={x2} y2={y2}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="1"
                        />
                      );
                    })}
                    {/* Data area */}
                    <polygon
                      points={getRadarPoints(result)}
                      fill="rgba(0,240,255,0.15)"
                      stroke="#00F0FF"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    {/* Data points */}
                    {[result.dimensions.humor, result.dimensions.emotionValue, result.dimensions.professionalism, result.dimensions.affinity, result.dimensions.aggressiveness].map((v, i) => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                      const r = (v / 100) * radius;
                      const x = center + r * Math.cos(angle);
                      const y = center + r * Math.sin(angle);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4" fill="#00F0FF" />
                          <text x={x} y={y - 8} textAnchor="middle" fill="#F0F0FF" fontSize="10" fontWeight="bold">{v}</text>
                        </g>
                      );
                    })}
                    {/* Labels */}
                    {dimensions.map((label, i) => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                      const x = center + (radius + 25) * Math.cos(angle);
                      const y = center + (radius + 25) * Math.sin(angle);
                      return (
                        <text
                          key={i}
                          x={x} y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#8A8AA0"
                          fontSize="11"
                        >
                          {label}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* Keywords */}
                <div className="mb-3">
                  <div className="text-[10px] text-text-muted mb-1.5">高频关键词</div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.map((kw) => (
                      <span key={kw} className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(255,42,109,0.1)', color: '#FF2A6D', border: '1px solid rgba(255,42,109,0.2)' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Writing Style */}
                <div className="mb-3 p-3 rounded-lg" style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)' }}>
                  <div className="text-[10px] text-neon-cyan mb-1">写作风格</div>
                  <p className="text-xs text-text-secondary">{result.writingStyle}</p>
                </div>

                {/* Audience */}
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,42,109,0.05)', border: '1px solid rgba(255,42,109,0.1)' }}>
                  <div className="text-[10px] text-neon-magenta mb-1">目标受众</div>
                  <p className="text-xs text-text-secondary">{result.targetAudience}</p>
                </div>

                {/* Save Status */}
                <div className="flex items-center gap-2 text-xs" style={{ color: '#39FF14' }}>
                  <Save size={14} />
                  <span>已保存到 localStorage('koc_dna_profile')，后续创作将自动带入</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
