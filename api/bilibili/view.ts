function extractBvid(input: string): string | null {
  const m = input.match(/BV[0-9A-Za-z]{10,}/);
  return m ? m[0] : null;
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Accept: 'application/json,text/plain,*/*',
      Referer: 'https://www.bilibili.com/',
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  return text ? JSON.parse(text) : {};
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const urlOrId = String(req.query?.url || req.query?.bvid || '');
  const bvid = extractBvid(urlOrId) || (urlOrId.startsWith('BV') ? urlOrId : null);
  if (!bvid) {
    res.status(400).json({ error: '缺少B站视频链接或BV号' });
    return;
  }

  try {
    const view = await fetchJson(`https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`);
    if (view?.code !== 0) throw new Error(String(view?.message || 'view failed'));
    const v = view?.data || {};
    const aid = Number(v?.aid || 0);

    const tagsP = aid
      ? fetchJson(`https://api.bilibili.com/x/tag/archive/tags?aid=${aid}`).catch(() => null)
      : Promise.resolve(null);
    const repliesP = aid
      ? fetchJson(`https://api.bilibili.com/x/v2/reply/main?type=1&oid=${aid}&ps=20&mode=3`).catch(() => null)
      : Promise.resolve(null);

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

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      bvid,
      aid,
      title: String(v?.title || '').trim(),
      desc: String(v?.desc || '').trim(),
      tname: String(v?.tname || '').trim(),
      pubdate: Number(v?.pubdate || 0),
      duration: Number(v?.duration || 0),
      owner: {
        mid: Number(v?.owner?.mid || 0),
        name: String(v?.owner?.name || '').trim(),
      },
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
    });
  } catch (e: any) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ bvid, error: e?.message || 'fetch failed' });
  }
}

