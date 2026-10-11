const BASE_URL = (process.env.VITE_GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
const MODEL = process.env.VITE_GLM_MODEL || 'glm-4.7-flashx';
const FALLBACK_MODEL = process.env.VITE_GLM_FALLBACK_MODEL || 'glm-4.7';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY || '';
  if (!apiKey) {
    res.status(500).json({ error: 'GLM_API_KEY 未配置' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const allowed = new Set([MODEL, FALLBACK_MODEL].filter(Boolean));
    const incomingModel = String(body?.model || '');
    if (!allowed.has(incomingModel)) body.model = MODEL;

    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || '代理请求失败' });
  }
}

