import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"

function glmProxyPlugin(): Plugin {
  return {
    name: 'glm-proxy',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '');
      const apiKey = env.GLM_API_KEY || env.VITE_GLM_API_KEY || '';
      const baseUrl = (env.VITE_GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
      const preferredModel = env.VITE_GLM_MODEL || '';
      const fallbackModel = env.VITE_GLM_FALLBACK_MODEL || '';
      const imageModel = env.VITE_GLM_IMAGE_MODEL || '';

      async function readJson(req: any) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const raw = Buffer.concat(chunks).toString('utf8');
        return raw ? JSON.parse(raw) : {};
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

      async function handle(req: any, res: any, upstreamPath: string) {
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'GLM_API_KEY 未配置' }));
          return;
        }

        try {
          const body = await readJson(req);
          if (upstreamPath === '/chat/completions' && preferredModel) {
            const m = String(body?.model || '');
            const allowed = new Set([preferredModel, fallbackModel].filter(Boolean));
            if (!allowed.has(m)) body.model = preferredModel;
          }
          if (upstreamPath === '/images/generations' && imageModel) {
            body.model = imageModel;
          }
          const upstream = await fetch(`${baseUrl}${upstreamPath}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
          });

          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
          res.end(text);
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e?.message || '代理请求失败' }));
        }
      }

      server.middlewares.use('/api/glm/chat', (req, res, next) => {
        if (req.method !== 'POST') return next();
        void handle(req, res, '/chat/completions');
      });

      server.middlewares.use('/api/glm/images', (req, res, next) => {
        if (req.method !== 'POST') return next();
        void handle(req, res, '/images/generations');
      });

      server.middlewares.use('/api/trending', async (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const source = String(url.searchParams.get('source') || 'all');
          const limit = clamp(Number(url.searchParams.get('limit') || 20), 1, 50);

          const headers = {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            Accept: 'application/json,text/plain,*/*',
          };

          const fetchJson = async (u: string) => {
            const r = await fetch(u, { headers });
            const t = await r.text();
            if (!r.ok) throw new Error(`HTTP ${r.status}: ${t || r.statusText}`);
            return t ? JSON.parse(t) : {};
          };

          const zhihu = async () => {
            const data = await fetchJson(`https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=${limit}&desktop=true`);
            const list: any[] = Array.isArray(data?.data) ? data.data : [];
            return list.map((it, idx) => {
              const target = it?.target || {};
              const title = String(target?.title || '').trim();
              if (!title) return null;
              const link = target?.url ? String(target.url) : target?.id ? `https://www.zhihu.com/question/${target.id}` : 'https://www.zhihu.com/';
              return { id: `zhihu_${String(target?.id || idx)}`, title, platform: '知乎', category: '热榜', heat: clamp(100 - idx * 2, 60, 99), url: link, source: 'zhihu' };
            }).filter(Boolean);
          };

          const bilibili = async () => {
            const data = await fetchJson(`https://api.bilibili.com/x/web-interface/popular?ps=${limit}&pn=1`);
            const list: any[] = Array.isArray(data?.data?.list) ? data.data.list : [];
            return list.map((it, idx) => {
              const title = String(it?.title || '').trim();
              if (!title) return null;
              const bvid = String(it?.bvid || '').trim();
              const link = bvid ? `https://www.bilibili.com/video/${bvid}` : 'https://www.bilibili.com/';
              const tname = String(it?.tname || '').trim();
              return { id: `bilibili_${bvid || String(it?.aid || idx)}`, title, platform: 'B站', category: tname || '热门', heat: clamp(100 - idx * 2, 60, 99), url: link, source: 'bilibili' };
            }).filter(Boolean);
          };

          const tasks: Promise<any[]>[] = [];
          if (source === 'zhihu' || source === 'all') tasks.push(zhihu());
          if (source === 'bilibili' || source === 'all') tasks.push(bilibili());
          const results = await Promise.allSettled(tasks);
          const items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).slice(0, limit);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ date: todayCN(), items }));
        } catch (e: any) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ date: todayCN(), items: [], error: e?.message || 'fetch failed' }));
        }
      });

      server.middlewares.use('/api/bilibili/view', async (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const urlOrId = String(url.searchParams.get('url') || url.searchParams.get('bvid') || '');
          const m = urlOrId.match(/BV[0-9A-Za-z]{10,}/);
          const bvid = m ? m[0] : urlOrId.startsWith('BV') ? urlOrId : '';
          if (!bvid) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: '缺少B站视频链接或BV号' }));
            return;
          }

          const headers = {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            Accept: 'application/json,text/plain,*/*',
            Referer: 'https://www.bilibili.com/',
          };

          const fetchJson = async (u: string) => {
            const r = await fetch(u, { headers });
            const t = await r.text();
            if (!r.ok) throw new Error(`HTTP ${r.status}: ${t || r.statusText}`);
            return t ? JSON.parse(t) : {};
          };

          const view = await fetchJson(`https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`);
          if (view?.code !== 0) throw new Error(String(view?.message || 'view failed'));
          const v = view?.data || {};
          const aid = Number(v?.aid || 0);

          const tagsP = aid ? fetchJson(`https://api.bilibili.com/x/tag/archive/tags?aid=${aid}`).catch(() => null) : Promise.resolve(null);
          const repliesP = aid ? fetchJson(`https://api.bilibili.com/x/v2/reply/main?type=1&oid=${aid}&ps=20&mode=3`).catch(() => null) : Promise.resolve(null);
          const [tagsRes, repliesRes] = await Promise.all([tagsP, repliesP]);

          const tags = Array.isArray(tagsRes?.data) ? tagsRes.data.map((t: any) => String(t?.tag_name || '').trim()).filter(Boolean).slice(0, 12) : [];
          const replies = Array.isArray(repliesRes?.data?.replies) ? repliesRes.data.replies : [];
          const comments = replies
            .map((r: any) => ({
              user: String(r?.member?.uname || '').trim(),
              like: Number(r?.like || 0),
              message: String(r?.content?.message || '').trim(),
            }))
            .filter((c: any) => c.message)
            .slice(0, 10);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({
            bvid,
            aid,
            title: String(v?.title || '').trim(),
            desc: String(v?.desc || '').trim(),
            tname: String(v?.tname || '').trim(),
            pubdate: Number(v?.pubdate || 0),
            duration: Number(v?.duration || 0),
            owner: { mid: Number(v?.owner?.mid || 0), name: String(v?.owner?.name || '').trim() },
            stat: {
              view: Number(v?.stat?.view || 0),
              danmaku: Number(v?.stat?.danmaku || 0),
              reply: Number(v?.stat?.reply || 0),
              favorite: Number(v?.stat?.favorite || 0),
              coin: Number(v?.stat?.coin || 0),
              share: Number(v?.stat?.share || 0),
              like: Number(v?.stat?.like || 0),
            },
            tags,
            comments,
          }));
        } catch (e: any) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ error: e?.message || 'fetch failed' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), glmProxyPlugin()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
