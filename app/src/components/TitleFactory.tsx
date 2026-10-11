import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  Eye,
  X,
  TrendingUp,
  MessageSquare,
  Hash,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { generateTitles, type TitleOption } from '@/services/aiMock';

/**
 * TitleFactory - 智能标题工厂
 *
 * 核心功能：
 * - 粘贴文案 → AI生成20个标题
 * - 爆款评分(0-100) + 类型标签 + 钩子说明
 * - 按评分从高到低排序展示
 * - 点击标题预览平台列表效果
 * - "使用此标题" 注入父组件
 */

interface TitleFactoryProps {
  onSelectTitle?: (title: string) => void;
}

const typeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  悬念型: { color: '#FF2A6D', icon: <Zap size={12} /> },
  数字型: { color: '#00F0FF', icon: <Hash size={12} /> },
  痛点型: { color: '#FFB800', icon: <TrendingUp size={12} /> },
  反常识型: { color: '#BD00FF', icon: <Lightbulb size={12} /> },
  对比型: { color: '#FF6B35', icon: <MessageSquare size={12} /> },
  疑问型: { color: '#00E5A0', icon: <MessageSquare size={12} /> },
  情绪型: { color: '#FF2A6D', icon: <Zap size={12} /> },
  权威型: { color: '#00F0FF', icon: <TrendingUp size={12} /> },
};

export default function TitleFactory({ onSelectTitle }: TitleFactoryProps) {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [titles, setTitles] = useState<TitleOption[]>([]);
  const [previewTitle, setPreviewTitle] = useState<TitleOption | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!content.trim() || content.trim().length < 5) {
      alert('请输入至少5个字的文案内容');
      return;
    }
    setIsGenerating(true);
    setTitles([]);
    setPreviewTitle(null);
    const result = await generateTitles(content, 20);
    setTitles(result);
    setIsGenerating(false);
  }, [content]);

  const handleCopy = useCallback((title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleSelectTitle = useCallback((title: string) => {
    onSelectTitle?.(title);
    // Visual feedback
    alert(`已选择标题：「${title}」`);
  }, [onSelectTitle]);

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#0A0A0F', border: '1px solid rgba(0,240,255,0.15)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.1)' }}>
          <Sparkles size={20} style={{ color: '#00F0FF' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#00F0FF' }}>智能标题工厂</h2>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>AI 生成20个爆款标题，智能评分排序</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 py-5">
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
          粘贴你的文案内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="将你的文案粘贴到这里，AI会分析内容并生成20个爆款标题..."
          className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
          style={{
            background: '#12121A',
            border: '1px solid rgba(0,240,255,0.15)',
            color: '#fff',
            minHeight: '100px',
          }}
          rows={4}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {content.length} 字
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            style={{
              background: isGenerating ? 'rgba(0,240,255,0.1)' : '#00F0FF',
              color: isGenerating ? 'rgba(0,240,255,0.5)' : '#0A0A0F',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
            }}
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Sparkles size={16} />
                </motion.div>
                AI 生成中...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                生成标题
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Results Grid */}
      <AnimatePresence>
        {titles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 pb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                共生成 {titles.length} 个标题 · 已按评分排序
              </h3>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF' }}>
                评分 70-100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {titles.map((item, index) => {
                const typeStyle = typeConfig[item.type] || { color: '#00F0FF', icon: <Sparkles size={12} /> };
                const isTop3 = index < 3;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                    className="relative rounded-xl p-4 cursor-pointer group transition-all hover:scale-[1.02]"
                    style={{
                      background: isTop3 ? 'rgba(0,240,255,0.06)' : '#12121A',
                      border: `1px solid ${isTop3 ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                    onClick={() => setPreviewTitle(item)}
                  >
                    {/* Rank badge */}
                    {isTop3 && (
                      <div
                        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: index === 0 ? '#FF2A6D' : index === 1 ? '#FFB800' : '#00F0FF', color: '#0A0A0F' }}
                      >
                        {index + 1}
                      </div>
                    )}

                    {/* Score */}
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-3xl font-black leading-none" style={{ color: typeStyle.color }}>
                        {item.score}
                      </span>
                      <span className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>分</span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium leading-snug mb-3" style={{ color: '#fff' }}>
                      {item.title}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: `${typeStyle.color}20`, color: typeStyle.color }}
                      >
                        {typeStyle.icon}
                        {item.type}
                      </span>
                    </div>

                    {/* Hook */}
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {item.hook}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item.title, index);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        {copiedId === index ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === index ? '已复制' : '复制'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTitle(item);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                        style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF' }}
                      >
                        <Eye size={12} />
                        预览
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setPreviewTitle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: '#12121A', border: '1px solid rgba(0,240,255,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Eye size={16} style={{ color: '#00F0FF' }} />
                  <span className="text-sm font-bold" style={{ color: '#00F0FF' }}>平台列表预览</span>
                </div>
                <button
                  onClick={() => setPreviewTitle(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                >
                  <X size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </button>
              </div>

              <div className="p-5">
                {/* Simulated platform list card */}
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold"
                      style={{ background: 'linear-gradient(135deg, #FF2A6D, #BD00FF)', color: '#fff' }}
                    >
                      📝
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold leading-snug mb-1" style={{ color: '#fff' }}>
                        {previewTitle.title}
                      </h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {content.slice(0, 60)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>🔥 {previewTitle.score}分爆款潜力</span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>💬 预计互动率 +{(previewTitle.score / 10).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>标题类型</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${typeConfig[previewTitle.type]?.color || '#00F0FF'}20`,
                        color: typeConfig[previewTitle.type]?.color || '#00F0FF',
                      }}
                    >
                      {previewTitle.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>爆款评分</span>
                    <span className="text-sm font-bold" style={{ color: '#00F0FF' }}>{previewTitle.score}/100</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>钩子说明</span>
                    <span className="text-xs text-right" style={{ color: 'rgba(255,255,255,0.7)' }}>{previewTitle.hook}</span>
                  </div>
                </div>

                {/* Use this title button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleSelectTitle(previewTitle.title);
                    setPreviewTitle(null);
                  }}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: '#00F0FF', color: '#0A0A0F' }}
                >
                  <Check size={16} />
                  使用此标题
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
