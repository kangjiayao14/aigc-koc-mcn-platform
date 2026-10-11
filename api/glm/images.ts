const BASE_URL = (process.env.VITE_GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
const IMAGE_MODEL = process.env.VITE_GLM_IMAGE_MODEL || 'glm-image';

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
    body.model = IMAGE_MODEL;

    const upstream = await fetch(`${BASE_URL}/images/generations`, {
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

