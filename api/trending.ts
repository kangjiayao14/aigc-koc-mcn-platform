type TrendingItem = {
  id: string;
  title: string;
  platform: string;
  category: string;
  heat: number;
  url: string;
  source: string;
};

function toInt(v: unknown, d: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function todayCN() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Accept: 'application/json,text/plain,*/*',
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  return text ? JSON.parse(text) : {};
}

async function getZhihuHot(limit: number): Promise<TrendingItem[]> {
  const url = `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=${clamp(limit, 1, 50)}&desktop=true`;
  const data = await fetchJson(url);
  const list: any[] = Array.isArray(data?.data) ? data.data : [];
  return list
    .map((it, idx) => {
      const target = it?.target || {};
      const title = String(target?.title || '').trim();
      if (!title) return null;
      const link = target?.url ? String(target.url) : target?.id ? `https://www.zhihu.com/question/${target.id}` : 'https://www.zhihu.com/';
      const heat = clamp(100 - idx * 2, 60, 99);
      return {
        id: `zhihu_${String(target?.id || idx)}`,
        title,
        platform: '知乎',
        category: '热榜',
        heat,
        url: link,
        source: 'zhihu',
      } satisfies TrendingItem;
    })
    .filter(Boolean) as TrendingItem[];
}

async function getBilibiliPopular(limit: number): Promise<TrendingItem[]> {
  const ps = clamp(limit, 1, 50);
  const url = `https://api.bilibili.com/x/web-interface/popular?ps=${ps}&pn=1`;
  const data = await fetchJson(url);
  const list: any[] = Array.isArray(data?.data?.list) ? data.data.list : [];
  return list
    .map((it, idx) => {
      const title = String(it?.title || '').trim();
      if (!title) return null;
      const bvid = String(it?.bvid || '').trim();
      const link = bvid ? `https://www.bilibili.com/video/${bvid}` : 'https://www.bilibili.com/';
      const heat = clamp(100 - idx * 2, 60, 99);
      const tname = String(it?.tname || '').trim();
      return {
        id: `bilibili_${bvid || String(it?.aid || idx)}`,
        title,
        platform: 'B站',
        category: tname || '热门',
        heat,
        url: link,
        source: 'bilibili',
      } satisfies TrendingItem;
    })
    .filter(Boolean) as TrendingItem[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const source = String(req.query?.source || 'all');
  const limit = clamp(toInt(req.query?.limit, 20), 1, 50);

  try {
    const tasks: Promise<TrendingItem[]>[] = [];
    if (source === 'zhihu' || source === 'all') tasks.push(getZhihuHot(limit));
    if (source === 'bilibili' || source === 'all') tasks.push(getBilibiliPopular(limit));

    const results = await Promise.allSettled(tasks);
    const items = results
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      .slice(0, limit);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ date: todayCN(), items });
  } catch (e: any) {
    res.status(200).json({ date: todayCN(), items: [], error: e?.message || 'fetch failed' });
  }
}

