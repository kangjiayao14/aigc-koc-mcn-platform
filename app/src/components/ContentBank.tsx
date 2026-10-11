import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Sparkles,
  Search,
  Hash,
  Calendar,
  Heart,
  Repeat,
  X,
  FileText,
  Image,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { type ContentAsset } from '@/services/aiMock';

/**
 * ContentBank - 内容资产银行
 *
 * 核心功能：
 * - 展示已有内容列表（从localStorage读取pcg_posts）
 * - 每个内容卡片：标题/平台/日期/标签/表现数据/复用次数
 * - 搜索框：按标签/标题搜索
 * - 点击"AI推荐复用"→调用 suggestRepurposing()
 * - 展示5个复用建议：改编为图文/提取短视频/扩展系列/Q&A形式/对比版
 * - 每个建议有"执行复用"按钮→跳转到创作工坊并带入原内容
 * - 内容复用率统计：本月复用了X次，节省了X小时
 */

const PLATFORM_EMOJI: Record<string, string> = {
  小红书: '📕',
  抖音: '🎵',
  朋友圈: '💬',
  领英: '💼',
};

const SUGGESTION_ICONS = [
  <FileText size={16} key="1" />,
  <Image size={16} key="2" />,
  <LayoutGrid size={16} key="3" />,
  <TrendingUp size={16} key="4" />,
  <Hash size={16} key="5" />,
];

interface LocalPost {
  id: string;
  title: string;
  platform: string;
  createdAt: string;
  tags?: string[];
  likes?: number;
  comments?: number;
  cover?: string;
  content?: string;
}

// Merge localStorage posts with mock content bank data
function mergeWithLocalStorage(mockData: ContentAsset[]): ContentAsset[] {
  const saved = localStorage.getItem('pcg_posts');
  if (!saved) return mockData;
  try {
    const parsed = JSON.parse(saved);
    const posts: LocalPost[] = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
    const localAssets: ContentAsset[] = posts.map((post, idx) => ({
      id: post.id || `local_${idx}`,
      title: post.title || '未命名内容',
      platform: post.platform || '小红书',
      createdAt: post.createdAt || new Date().toISOString().split('T')[0],
      tags: post.tags || ['原创内容'],
      performance: (post.likes || 0) + (post.comments || 0) * 2,
      repurposedCount: 0,
    }));
    // Merge: local first, then mock (dedup by id)
    const seen = new Set<string>();
    const merged: ContentAsset[] = [];
    for (const item of [...localAssets, ...mockData]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  } catch {
    return mockData;
  }
}

export default function ContentBank() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<ContentAsset | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalRepurposed, setTotalRepurposed] = useState(0);

  const mockData: ContentAsset[] = useMemo(
    () => [
      { id: '1', title: '5个化妆小技巧', platform: '小红书', createdAt: '2024-01-15', tags: ['美妆', '技巧'], performance: 8900, repurposedCount: 3 },
      { id: '2', title: '打工人效率工具', platform: '抖音', createdAt: '2024-02-01', tags: ['职场', '工具'], performance: 12000, repurposedCount: 5 },
      { id: '3', title: '面试穿搭指南', platform: '小红书', createdAt: '2024-02-20', tags: ['职场', '穿搭'], performance: 5600, repurposedCount: 2 },
      { id: '4', title: '30天减脂计划', platform: '抖音', createdAt: '2024-03-05', tags: ['健身', '计划'], performance: 23000, repurposedCount: 8 },
      { id: '5', title: '独居好物分享', platform: '小红书', createdAt: '2024-03-15', tags: ['生活', '好物'], performance: 7800, repurposedCount: 4 },
    ],
    []
  );

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const merged = mergeWithLocalStorage(mockData);
    setAssets(merged);
    // Calculate total repurposed count
    const total = merged.reduce((sum, a) => sum + a.repurposedCount, 0);
    setTotalRepurposed(total);
    setIsLoading(false);
  }, [mockData]);

  const handleSuggest = useCallback(async (asset: ContentAsset) => {
    setSelectedAsset(asset);
    setIsSuggesting(true);
    setTimeout(() => {
      setSuggestions([
        '改编为图文版，发布到小红书',
        '提取核心观点，制作15秒短视频',
        '扩展为系列内容的第2集',
        '改编为对比版（A vs B形式）',
        '制作为问答形式（Q&A）',
      ]);
      setIsSuggesting(false);
    }, 700);
  }, []);

  const handleRepurpose = useCallback(
    (asset: ContentAsset, suggestion: string) => {
      // Navigate to content-lab with the asset data
      const params = new URLSearchParams();
      params.set('repurpose', '1');
      params.set('title', asset.title);
      params.set('platform', asset.platform);
      params.set('suggestion', suggestion);
      params.set('sourceId', asset.id);
      navigate(`/content-lab?${params.toString()}`);
    },
    [navigate]
  );

  const handleCloseSuggestions = useCallback(() => {
    setSelectedAsset(null);
    setSuggestions([]);
  }, []);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.platform.toLowerCase().includes(q)
    );
  }, [assets, searchQuery]);

  const stats = useMemo(() => {
    const total = assets.length;
    const totalPerformance = assets.reduce((sum, a) => sum + a.performance, 0);
    const avgPerformance = total > 0 ? Math.floor(totalPerformance / total) : 0;
    const hoursSaved = totalRepurposed * 2.5; // Assume each reuse saves 2.5 hours
    return { total, totalPerformance, avgPerformance, hoursSaved };
  }, [assets, totalRepurposed]);

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)' }}
        >
          <Database size={20} style={{ color: '#FFD700' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">内容资产银行</h2>
          <p className="text-xs text-text-muted">所有内容存档 → 标签化 → AI推荐复用</p>
        </div>
      </div>

      {/* Stats Bar */}
      {assets.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div
            className="rounded-lg p-2.5 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-base font-bold font-orbitron text-text-primary">{stats.total}</div>
            <div className="text-[10px] text-text-muted">内容总数</div>
          </div>
          <div
            className="rounded-lg p-2.5 text-center"
            style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)' }}
          >
            <div className="text-base font-bold font-orbitron" style={{ color: '#00F0FF' }}>
              {stats.totalPerformance.toLocaleString()}
            </div>
            <div className="text-[10px] text-text-muted">总互动</div>
          </div>
          <div
            className="rounded-lg p-2.5 text-center"
            style={{ background: 'rgba(255,42,109,0.05)', border: '1px solid rgba(255,42,109,0.1)' }}
          >
            <div className="text-base font-bold font-orbitron" style={{ color: '#FF2A6D' }}>
              {totalRepurposed}
            </div>
            <div className="text-[10px] text-text-muted">本月复用</div>
          </div>
          <div
            className="rounded-lg p-2.5 text-center"
            style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.1)' }}
          >
            <div className="text-base font-bold font-orbitron" style={{ color: '#39FF14' }}>
              {stats.hoursSaved.toFixed(0)}h
            </div>
            <div className="text-[10px] text-text-muted">节省时间</div>
          </div>
        </div>
      )}

      {/* Search & View Toggle */}
      {assets.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4A4A60' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题、标签或平台..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs text-text-primary bg-transparent outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={14} style={{ color: '#4A4A60' }} />
              </button>
            )}
          </div>
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="px-3 py-2.5 transition-colors"
              style={{
                background: viewMode === 'grid' ? 'rgba(0,240,255,0.1)' : 'transparent',
                color: viewMode === 'grid' ? '#00F0FF' : '#4A4A60',
              }}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-2.5 transition-colors"
              style={{
                background: viewMode === 'list' ? 'rgba(0,240,255,0.1)' : 'transparent',
                color: viewMode === 'list' ? '#00F0FF' : '#4A4A60',
              }}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Content List */}
      {assets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-secondary">
              内容资产 ({filteredAssets.length})
            </span>
            {searchQuery && (
              <span className="text-[10px] text-text-muted">
                搜索 "{searchQuery}" 的结果
              </span>
            )}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {filteredAssets.map((asset, idx) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    className="rounded-xl p-3 space-y-2"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-text-primary line-clamp-2 flex-1">
                        {asset.title}
                      </h4>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{
                          background: 'rgba(0,240,255,0.08)',
                          color: '#00F0FF',
                        }}
                      >
                        {PLATFORM_EMOJI[asset.platform] || '📝'} {asset.platform}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {asset.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={10} />
                        {asset.performance.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat size={10} />
                        复用{asset.repurposedCount}次
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(255,215,0,0.08)', color: '#FFD700' }}
                        >
                          <Hash size={8} className="inline mr-0.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSuggest(asset)}
                      className="w-full py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(255,215,0,0.08)',
                        color: '#FFD700',
                        border: '1px solid rgba(255,215,0,0.15)',
                      }}
                    >
                      <Sparkles size={12} />
                      AI推荐复用
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredAssets.map((asset, idx) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.5) }}
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: 'rgba(255,215,0,0.08)' }}
                    >
                      {PLATFORM_EMOJI[asset.platform] || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {asset.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <span>{asset.platform}</span>
                        <span>{asset.createdAt}</span>
                        <span className="flex items-center gap-0.5">
                          <Heart size={9} />
                          {asset.performance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className="text-[10px] px-2 py-1 rounded"
                        style={{ background: 'rgba(255,215,0,0.08)', color: '#FFD700' }}
                      >
                        复用{asset.repurposedCount}次
                      </span>
                      <button
                        onClick={() => handleSuggest(asset)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                          background: 'rgba(255,215,0,0.08)',
                          color: '#FFD700',
                        }}
                      >
                        <Sparkles size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Suggestions Modal / Panel */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl p-4 space-y-3"
            style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.2)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: '#FFD700' }} />
                <span className="text-xs font-bold" style={{ color: '#FFD700' }}>
                  AI复用建议：{selectedAsset.title}
                </span>
              </div>
              <button
                onClick={handleCloseSuggestions}
                className="p-1 rounded-lg transition-colors hover:bg-white/5"
              >
                <X size={14} style={{ color: '#8A8AA0' }} />
              </button>
            </div>

            {isSuggesting ? (
              <div className="py-6 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto mb-2"
                >
                  <Sparkles size={24} style={{ color: '#FFD700' }} />
                </motion.div>
                <p className="text-xs text-text-muted">AI正在分析最佳复用方案...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-lg p-3 flex items-center gap-3"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}
                    >
                      {SUGGESTION_ICONS[idx] || <Sparkles size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-text-primary">{suggestion}</p>
                    </div>
                    <button
                      onClick={() => handleRepurpose(selectedAsset, suggestion)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105 flex-shrink-0"
                      style={{
                        background: '#FFD700',
                        color: '#0A0A0F',
                      }}
                    >
                      执行复用
                      <ArrowRight size={12} />
                    </button>
                  </motion.div>
                ))}

                <p className="text-[10px] text-text-muted pt-1">
                  点击"执行复用"将跳转到创作工坊，自动带入原内容并进行改编
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reuse Stats Summary */}
      {assets.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(57,255,20,0.05), rgba(0,240,255,0.03))',
            border: '1px solid rgba(57,255,20,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(57,255,20,0.1)' }}
            >
              <Repeat size={18} style={{ color: '#39FF14' }} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">内容复用统计</p>
              <p className="text-[11px] text-text-muted">
                本月复用了 <span style={{ color: '#39FF14' }}>{totalRepurposed}次</span>，
                节省了 <span style={{ color: '#39FF14' }}>{stats.hoursSaved.toFixed(0)}小时</span> 创作时间
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-orbitron" style={{ color: '#39FF14' }}>
              {stats.hoursSaved > 0 ? `${((stats.hoursSaved / (stats.total * 2.5 + stats.hoursSaved)) * 100).toFixed(0)}%` : '0%'}
            </div>
            <div className="text-[10px] text-text-muted">效率提升</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && assets.length === 0 && (
        <div className="py-12 text-center rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Database size={32} className="mx-auto mb-3" style={{ color: '#4A4A60' }} />
          <p className="text-sm text-text-muted">内容资产银行为空</p>
          <p className="text-xs text-text-muted mt-1">快去创作工坊生成内容，或点击上方按钮加载示例数据</p>
        </div>
      )}
    </div>
  );
}
