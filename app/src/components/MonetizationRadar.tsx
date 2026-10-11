import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, X, Zap, Mail, Star, DollarSign, Clock, Award } from 'lucide-react';
import { matchBrandDeals, generatePitchLetter, type BrandDeal, type DNAProfile } from '@/services/aiMock';

/**
 * MonetizationRadar - 商业变现反向匹配器
 * 
 * 核心创新：
 * - 内容发布后自动触发
 * - 旋转雷达扫描动画（SVG CSS spin）
 * - 1-3个虚拟商单卡片瀑布流掉落
 * - 匹配度评分 + 匹配原因
 * - "⚡️ AI生成自荐信并投递"按钮
 * 
 * 触发机制：一键发布成功后弹出
 */

interface MonetizationRadarProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
}

export default function MonetizationRadar({ isOpen, onClose, content }: MonetizationRadarProps) {
  const [phase, setPhase] = useState<'scanning' | 'dropping' | 'result'>('scanning');
  const [deals, setDeals] = useState<BrandDeal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<BrandDeal | null>(null);
  const [pitchLetter, setPitchLetter] = useState('');
  const [showPitch, setShowPitch] = useState(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  const startMatching = useCallback(async () => {
    setPhase('scanning');
    setDeals([]);
    setSelectedDeal(null);
    setShowPitch(false);

    // Get DNA profile
    let dna: DNAProfile | undefined;
    try {
      const saved = localStorage.getItem('koc_dna_profile');
      if (saved) dna = JSON.parse(saved);
    } catch { /* ignore */ }

    // Simulate radar scanning (2 seconds)
    setTimeout(async () => {
      setPhase('dropping');
      const matched = await matchBrandDeals(content, dna);
      setDeals(matched);
      
      setTimeout(() => {
        setPhase('result');
      }, 800);
    }, 2000);
  }, [content]);

  const handleGeneratePitch = useCallback(async (deal: BrandDeal) => {
    setSelectedDeal(deal);
    setIsGeneratingPitch(true);
    
    let dna: DNAProfile | undefined;
    try {
      const saved = localStorage.getItem('koc_dna_profile');
      if (saved) dna = JSON.parse(saved);
    } catch { /* ignore */ }

    const letter = await generatePitchLetter(deal, dna || {
      tone: '温暖亲和',
      keywords: ['分享', '体验'],
      emojiDensity: 0.5,
      dimensions: { humor: 50, emotionValue: 60, professionalism: 50, affinity: 70, aggressiveness: 20 },
      writingStyle: '口语化表达',
      targetAudience: '年轻白领',
      contentPillar: '生活分享',
    });
    
    setPitchLetter(letter);
    setIsGeneratingPitch(false);
    setShowPitch(true);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: '#12121A', border: '1px solid rgba(0,240,255,0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-5 py-4"
            style={{ background: 'linear-gradient(90deg, rgba(0,240,255,0.08), transparent)' }}
          >
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-neon-gold" />
              <span className="text-base font-bold text-text-primary">商业变现雷达</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Scanning Phase */}
            {phase === 'scanning' && (
              <div className="flex flex-col items-center justify-center py-12">
                {/* Radar Animation */}
                <div className="relative w-32 h-32 mb-6">
                  {/* Outer rings */}
                  <div className="absolute inset-0 rounded-full border border-neon-cyan/20" />
                  <div className="absolute inset-2 rounded-full border border-neon-cyan/15" />
                  <div className="absolute inset-4 rounded-full border border-neon-cyan/10" />
                  <div className="absolute inset-6 rounded-full border border-neon-cyan/5" />
                  {/* Spinning radar line */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <div 
                      className="absolute top-0 left-1/2 w-px h-1/2 origin-bottom"
                      style={{ 
                        background: 'linear-gradient(to top, transparent, #00F0FF)',
                        transform: 'translateX(-50%)',
                      }}
                    />
                  </motion.div>
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan animate-pulse" />
                </div>
                <p className="text-sm text-text-secondary mb-1">正在分析内容商业价值...</p>
                <p className="text-xs text-text-muted">扫描品牌匹配数据库 · 评估粉丝变现潜力</p>
                {/* Progress dots */}
                <div className="flex gap-2 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-neon-cyan"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dropping Phase */}
            {phase === 'dropping' && (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Award size={48} className="text-neon-gold" />
                </motion.div>
                <p className="text-sm text-text-secondary mt-4">发现匹配商机！</p>
              </div>
            )}

            {/* Result Phase */}
            {phase === 'result' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-text-secondary">基于你的人设DNA和粉丝画像</div>
                  <div className="text-xs text-text-muted">为你匹配到 {deals.length} 个高潜商单</div>
                </div>

                {/* Deal Cards */}
                {deals.map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="p-4 rounded-xl relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {/* Urgency Badge */}
                    {deal.urgency === 'high' && (
                      <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,42,109,0.2)', color: '#FF2A6D' }}>
                        急招
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(255,42,109,0.2))', border: '1px solid rgba(0,240,255,0.2)' }}
                      >
                        {deal.brandName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-text-primary">{deal.brandName}</div>
                        <div className="text-[10px] text-text-muted">{deal.dealType}</div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${deal.matchScore}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: deal.matchScore >= 90 ? '#39FF14' : deal.matchScore >= 80 ? '#FFD700' : '#FF2A6D' }}
                        />
                      </div>
                      <span className="text-sm font-bold" style={{ color: deal.matchScore >= 90 ? '#39FF14' : deal.matchScore >= 80 ? '#FFD700' : '#FF2A6D' }}>
                        {deal.matchScore}%
                      </span>
                    </div>

                    {/* Match Reason */}
                    <div className="text-xs text-text-secondary leading-relaxed mb-3">
                      <Star size={12} className="inline mr-1 text-neon-gold" />
                      {deal.matchReason}
                    </div>

                    {/* Budget & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#FFD700' }}>
                        <DollarSign size={12} />
                        <span>{deal.budgetRange}</span>
                      </div>
                      <button
                        onClick={() => handleGeneratePitch(deal)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #00F0FF, #0080FF)', color: '#0A0A0F' }}
                      >
                        <Zap size={12} /> AI生成自荐信
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Pitch Letter Modal */}
                <AnimatePresence>
                  {showPitch && selectedDeal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-xl"
                      style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Mail size={16} className="text-neon-cyan" />
                        <span className="text-sm font-bold text-text-primary">AI生成的自荐信</span>
                        <span className="text-xs text-text-muted">→ {selectedDeal.brandName}</span>
                      </div>
                      
                      {isGeneratingPitch ? (
                        <div className="flex items-center gap-2 py-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap size={16} className="text-neon-cyan" />
                          </motion.div>
                          <span className="text-xs text-text-muted">AI正在根据你的人设DNA撰写个性化自荐信...</span>
                        </div>
                      ) : (
                        <>
                          <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-mono p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {pitchLetter}
                          </pre>
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]" style={{ background: '#00F0FF', color: '#0A0A0F' }}>
                              ✉️ 一键投递
                            </button>
                            <button 
                              onClick={() => { setShowPitch(false); setSelectedDeal(null); }}
                              className="px-3 py-2.5 rounded-lg text-xs border border-white/15 text-text-secondary"
                            >
                              关闭
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          {phase === 'result' && (
            <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <Clock size={12} />
                <span>数据每小时更新</span>
              </div>
              <button 
                onClick={startMatching}
                className="text-[10px] text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1"
              >
                <Radar size={12} /> 重新扫描
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
