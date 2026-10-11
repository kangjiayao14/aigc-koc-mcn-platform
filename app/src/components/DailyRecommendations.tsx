import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, RefreshCw, ExternalLink } from 'lucide-react';
import { extractJSON, glmChat } from '@/services/glmClient';

interface Recommendation {
  id: string;
  title: string;
  platform: string;
  heat: number;
  category: string;
  url?: string;
  insight?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  '小红书': '#FF2442',
  '抖音': '#000000',
  'B站': '#00A1D6',
  '知乎': '#1772F6',
};

function getHeatColor(heat: number): string {
  if (heat >= 95) return 'from-[#FF2A6D] to-[#FF6B9D]';
  if (heat >= 85) return 'from-[#FF8C00] to-[#FFD700]';
  if (heat >= 75) return 'from-[#00F0FF] to-[#00D4FF]';
  return 'from-[#8A8AA0] to-[#4A4A60]';
}

function todayCN() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DailyRecommendations = memo(function DailyRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sourceNote, setSourceNote] = useState<string>('');

  const cacheKey = 'pcg_daily_recommendations_cache_v1';
  const hasDNA = useMemo(() => {
    try {
      return Boolean(localStorage.getItem('koc_dna_profile') || localStorage.getItem('pcg_user_profile'));
    } catch {
      return false;
    }
  }, []);

  const fetchTrending = useCallback(async (force: boolean) => {
    const today = todayCN();
    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached?.date === today && Array.isArray(cached?.items) && cached.items.length) {
            setRecommendations(cached.items);
            setSourceNote(String(cached?.sourceNote || ''));
            return;
          }
        }
      } catch {}
    }

    const res = await fetch(`/api/trending?source=all&limit=30`, { method: 'GET' });
    const data = await res.json().catch(() => ({}));
    const items: any[] = Array.isArray(data?.items) ? data.items : [];

    const base: Recommendation[] = items.slice(0, 30).map((it, idx) => ({
      id: String(it?.id || `t_${idx}`),
      title: String(it?.title || '').trim(),
      platform: String(it?.platform || '未知'),
      category: String(it?.category || ''),
      heat: Number(it?.heat || Math.max(70, 98 - idx * 2)),
      url: it?.url ? String(it.url) : undefined,
    })).filter((x) => x.title);

    let finalItems: Recommendation[] = base.slice(0, 10);
    let note = base.length ? `来源：${Array.from(new Set(base.map((x) => x.platform))).join(' / ')}（实时抓取）` : '来源：实时抓取失败，稍后再试';

    if (base.length && hasDNA) {
      try {
        const dnaRaw = localStorage.getItem('koc_dna_profile');
        const profileRaw = localStorage.getItem('pcg_user_profile');
        const system =
          '你是内容趋势策划师。你会基于用户的个人风格DNA与用户资料，从候选爆款标题中挑出今天最适合他跟进的10条，并给出跟进角度。只输出可被 JSON.parse 解析的 JSON 数组，每项字段：id,title,platform,category,heat,url,insight。insight 为1-2句可执行建议。';
        const user =
          `用户DNA：${dnaRaw || '无'}\n用户资料：${profileRaw || '无'}\n\n候选（最多30条）：\n${JSON.stringify(base)}`;
        const llm = await glmChat(system, user, { temperature: 0.4, max_tokens: 1800, jsonMode: true });
        const ranked = extractJSON<any[]>(llm);
        if (Array.isArray(ranked) && ranked.length) {
          finalItems = ranked.slice(0, 10).map((r, i) => ({
            id: String(r?.id || base[i]?.id || `rank_${i}`),
            title: String(r?.title || base[i]?.title || '').trim(),
            platform: String(r?.platform || base[i]?.platform || '未知'),
            category: String(r?.category || base[i]?.category || ''),
            heat: Number(r?.heat || base[i]?.heat || 80),
            url: r?.url ? String(r.url) : base[i]?.url,
            insight: r?.insight ? String(r.insight) : undefined,
          })).filter((x) => x.title);
          note = `来源：实时抓取 + 个性化排序（DNA）`;
        }
      } catch {
        note = `来源：实时抓取（DNA排序暂不可用）`;
      }
    }

    setRecommendations(finalItems);
    setSourceNote(note);
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ date: today, items: finalItems, sourceNote: note }));
    } catch {}
  }, [cacheKey, hasDNA]);

  useEffect(() => {
    void fetchTrending(false);
  }, [fetchTrending]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchTrending(true).finally(() => setIsRefreshing(false));
  };

  const list = recommendations.length ? recommendations : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="rounded-2xl border border-white/5 bg-[#12121A]/80 backdrop-blur-sm p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#FF2A6D]" />
          <h2 className="text-base font-medium text-[#F0F0FF]">今日爆款推荐</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-[#8A8AA0] text-xs hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-colors disabled:opacity-50"
          data-cursor="pointer"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {sourceNote && (
        <div className="text-[11px] text-[#8A8AA0] mb-3">
          {sourceNote}
        </div>
      )}

      {/* List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {list.map((rec, index) => (
            <motion.div
              key={rec.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="group"
            >
              <div
                onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0A0A0F]/40 border border-white/3 hover:border-white/10 hover:bg-[#0A0A0F]/60 transition-all cursor-pointer"
                data-cursor="pointer"
              >
                {/* Rank number */}
                <span className={`flex-shrink-0 w-5 text-center text-xs font-mono font-bold ${
                  index < 3 ? 'text-[#FFD700]' : 'text-[#4A4A60]'
                }`}>
                  {index + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F0F0FF] truncate group-hover:text-[#00F0FF] transition-colors">
                    {rec.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] px-1 py-0.5 rounded"
                      style={{
                        backgroundColor: `${PLATFORM_COLORS[rec.platform] ?? '#4A4A60'}20`,
                        color: PLATFORM_COLORS[rec.platform] ?? '#4A4A60',
                      }}
                    >
                      {rec.platform}
                    </span>
                    <span className="text-[10px] text-[#8A8AA0]">{rec.category}</span>
                  </div>
                </div>

                {/* Heat bar */}
                <div className="flex-shrink-0 w-12">
                  <div className="h-1 rounded-full bg-[#0A0A0F] overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${getHeatColor(rec.heat)}`} style={{ width: `${rec.heat}%` }} />
                  </div>
                  <p className="text-[9px] text-[#8A8AA0] text-right mt-0.5">{rec.heat}%</p>
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expandedId === rec.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 py-2 text-xs text-[#8A8AA0]">
                      <p className="mb-2">
                        {rec.insight || `这个话题在${rec.platform}上热度持续上升，适合${rec.category || '相关领域'}的创作者跟进。建议结合个人风格进行内容创作。`}
                      </p>
                      <button
                        className="flex items-center gap-1 text-[#00F0FF] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (rec.url) window.open(rec.url, '_blank', 'noopener,noreferrer');
                        }}
                        data-cursor="pointer"
                      >
                        <ExternalLink size={10} />
                        查看详情
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default DailyRecommendations;
