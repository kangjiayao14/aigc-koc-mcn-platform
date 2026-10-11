type GlmChatOptions = {
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
};

const MODEL = import.meta.env.VITE_GLM_MODEL || 'glm-4.7-flashx';
const FALLBACK_MODEL = import.meta.env.VITE_GLM_FALLBACK_MODEL || 'glm-4.7';
const IMAGE_MODEL = import.meta.env.VITE_GLM_IMAGE_MODEL || 'glm-image';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('响应 JSON 解析失败');
    }
  } finally {
    clearTimeout(timeout);
  }
}

function setLastGlmDebug(data: any) {
  if (typeof window === 'undefined') return;
  (window as any).__glm_last = {
    model: data?.model,
    request_id: data?.request_id,
    usage: data?.usage,
    at: Date.now(),
  };
}

export async function glmChat(
  systemPrompt: string,
  userPrompt: string,
  options?: GlmChatOptions
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: options?.jsonMode
        ? `${userPrompt}\n\n只输出可被 JSON.parse 解析的 JSON（不要任何额外解释，不要前后缀）。`
        : userPrompt,
    },
  ];

  const attempts = [MODEL, MODEL, FALLBACK_MODEL];
  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const model = attempts[i];
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        max_tokens: options?.max_tokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        thinking: { type: 'disabled' },
      };

      const data = await fetchJson(
        `/api/glm/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
        30000
      );
      setLastGlmDebug(data);
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('空内容');
      return content;
    } catch (err) {
      lastError = err;
      if (i < attempts.length - 1) await sleep(1000);
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('所有尝试失败'));
}

export async function glmImage(prompt: string, size = '1280x1280'): Promise<string> {
  const data = await fetchJson(
    `/api/glm/images`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: IMAGE_MODEL, prompt, size }),
    },
    60000
  );
  setLastGlmDebug(data);

  const url = data?.data?.[0]?.url;
  if (!url) throw new Error('空URL');
  return url;
}

export function extractJSON<T>(text: string): T {
  const raw = String(text ?? '').trim();
  if (!raw) throw new Error('JSON解析失败');

  try {
    return JSON.parse(raw) as T;
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim()) as T;
    }

    const firstObj = raw.indexOf('{');
    const lastObj = raw.lastIndexOf('}');
    if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
      return JSON.parse(raw.slice(firstObj, lastObj + 1)) as T;
    }

    const firstArr = raw.indexOf('[');
    const lastArr = raw.lastIndexOf(']');
    if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
      return JSON.parse(raw.slice(firstArr, lastArr + 1)) as T;
    }

    throw new Error('JSON解析失败');
  }
}
