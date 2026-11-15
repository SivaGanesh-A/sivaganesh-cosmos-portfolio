// Vercel Edge Function: POST /api/chat  →  streams the answer back as plain text.
// Works with any OpenAI-compatible provider. Defaults to Groq (free tier, fast).
//
// Environment variables (set in Vercel → Project → Settings → Environment Variables):
//   LLM_API_KEY   required   e.g. your Groq key (gsk_...)
//   LLM_BASE_URL  optional   default https://api.groq.com/openai/v1
//   LLM_MODEL     optional   default llama-3.3-70b-versatile
import { buildSystemPrompt } from '../src/lib/knowledge.js';

export const config = { runtime: 'edge' };

const MAX_TURNS = 10;
const MAX_CHARS = 800;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export default async function handler(req) {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const env = (typeof process !== 'undefined' && process.env) || {};
  const key = env.LLM_API_KEY;
  if (!key) return json(503, { error: 'not_configured' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'bad_json' });
  }

  const history = Array.isArray(body?.messages) ? body.messages : [];
  const messages = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json(400, { error: 'no_question' });

  const base = (env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
  const upstream = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: env.LLM_MODEL || 'llama-3.3-70b-versatile',
      stream: true,
      temperature: 0.3,
      max_tokens: 400,
      messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages],
    }),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    return json(502, { error: 'upstream_failed', status: upstream?.status ?? 0 });
  }

  // Convert the provider's SSE stream into a plain text stream of answer tokens.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  const stream = upstream.body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const data = t.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            /* ignore keep-alives and partial frames */
          }
        }
      },
    })
  );

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}
