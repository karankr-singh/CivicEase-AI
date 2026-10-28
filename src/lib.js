export const MAX_LEN = 8000;
export const KEYS = ['summary', 'dates', 'eligibility', 'documents', 'steps'];
const DATE_RE = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}(st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s+\d{4})\b/i;
const pick = (ss, re) => [...new Set(ss.filter((s) => re.test(s)))].slice(0, 8).map((s) => ({ text: s, quote: s, kind: 'source' }));

// Offline, rule-based extraction. Not AI: it only selects sentences that already exist in the notice.
export function fallbackExplain(text) {
  const ss = text.replace(/\s+/g, ' ').split(/(?<=[.!?।])\s+/).map((s) => s.trim()).filter((s) => s.length > 8);
  return {
    summary: ss.slice(0, 2).map((s) => ({ text: s, quote: s, kind: 'source' })),
    dates: pick(ss, new RegExp(`${DATE_RE.source}|last date|deadline|due`, 'i')),
    eligibility: pick(ss, /eligib|must|should|at least|not exceed|resident|age|income|minimum/i),
    documents: pick(ss, /certificate|card|passbook|marksheet|proof|document|photograph|upload|attach/i),
    steps: pick(ss, /apply|submit|register|visit|fill|pay|deposit/i)
  };
}

// Defensive check of any server response before rendering.
function validate(d) {
  if (!d || typeof d !== 'object') throw new Error('Unexpected response format');
  const out = {};
  for (const k of KEYS) {
    out[k] = (Array.isArray(d[k]) ? d[k] : []).slice(0, 8).map((it) => {
      const text = typeof it === 'string' ? it : it && typeof it.text === 'string' ? it.text : '';
      if (!text.trim()) return null;
      const quote = it && typeof it.quote === 'string' && it.quote ? it.quote : null;
      return { text: text.slice(0, 500), quote, kind: it && it.kind === 'source' && quote ? 'source' : 'inferred' };
    }).filter(Boolean);
  }
  return out;
}

export function safeUrl(u) {
  try { const x = new URL(u.trim()); return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : null; } catch { return null; }
}

export async function explain({ text, language, level, offline }) {
  if (!offline) {
    const endpoint = import.meta.env.VITE_AI_ENDPOINT || '/api/explain';
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 55000);
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, language, level }), signal: ctl.signal });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { msg = (await res.json()).error || msg; } catch { /* non-JSON error page */ }
        throw new Error(res.status === 404 ? 'AI endpoint not found (not deployed or not configured)' : msg);
      }
      return { ...validate(await res.json()), source: 'ai' };
    } catch (e) {
      return { ...fallbackExplain(text), source: 'fallback', error: e.name === 'AbortError' ? 'AI request timed out' : e.message };
    } finally { clearTimeout(timer); }
  }
  return { ...fallbackExplain(text), source: 'fallback' };
}

export const save = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ } };
