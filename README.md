# Sivaganesh — Cosmos portfolio

A 3D portfolio where scrolling flies a camera through one continuous universe:

| Section | Celestial body |
|---|---|
| Intro | Spiral galaxy (60k-star shader) |
| About | A living star with a boiling surface and corona |
| Skills | A planetary system — each orbit is a skill group, each moon a skill (hover a group to light it up) |
| Projects | One procedural planet per project (gas giant, ringed world, terrestrial, ice, lava) |
| Experience | Dwarf planet inside an asteroid belt |
| Credentials | A constellation — bright stars are certifications, faint ones hackathons |
| Contact | Black hole with an accretion disk and photon ring |

Plus **an AI guide that answers questions about you from your resume**, with an offline fallback so it never breaks.

Everything is generated in code (no 3D model or texture downloads), so it loads fast and deploys anywhere.

## Stack

- React 19 + Vite 7
- three.js, React Three Fiber, drei, @react-three/postprocessing (bloom, vignette, ACES tone mapping)
- Lenis for smooth scrolling
- Custom GLSL shaders for every body (`src/scene/*`)
- Vercel Edge Function for the chatbot (`api/chat.js`), any OpenAI-compatible LLM (Groq by default)

## Run locally

```bash
npm install
cp .env.example .env      # add LLM_API_KEY (optional — without it the bot uses offline answers)
npm run dev               # http://localhost:5173  (the chatbot API works in dev too)
```

## Deploy to Vercel

1. Push this folder to a GitHub repo (or replace the contents of your existing `SivaGanesh` repo).
2. On vercel.com → **Add New Project** → import the repo. Framework preset: **Vite** (auto-detected). No other settings needed.
3. Get a free key at https://console.groq.com/keys.
4. Vercel → Project → **Settings → Environment Variables** → add `LLM_API_KEY` = your key. Redeploy.
5. Optional: point your existing `siva-ganesh.vercel.app` domain at this project (Settings → Domains).

To use Gemini instead of Groq, also set:
```
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LLM_MODEL=gemini-2.5-flash
```

## Editing content

**All content lives in `src/data/profile.js`.** The page and the chatbot both read from it, so updating it updates both.

- Add a project: add an entry to `projects` with a `planet` (`type`: `gas | rocky | ice | lava`, three colors, radius, optional `rings: true`). A new planet and camera stop appear automatically.
- Real repo links: replace each project's `code` URL with the specific repo.
- Resume PDF: replace `public/Sivaganesh_Akula_Resume.pdf`.

## How the chatbot works

`src/lib/knowledge.js` turns `profile.js` into a compact text resume (~1.5k tokens) and puts it in the system prompt with strict rules (third person, never invent facts, point to email when unsure). Your whole resume fits in context, so no vector database / RAG pipeline is needed — that would only be worth it if you add long documents (blog posts, project write-ups).

`api/chat.js` streams the answer token-by-token. Guardrails: last 10 turns only, 800 characters per message, 400 output tokens. If the key is missing, the provider fails or the quota runs out, the widget falls back to `src/lib/localAnswer.js` (keyword answers from the same data).

If you ever get abuse, add Vercel Firewall rate limiting on `/api/chat`, or Upstash Ratelimit.

## Performance notes

- three.js is code-split and lazy-loaded: text paints first (~85 KB gzip), the universe (~280 KB gzip) streams in after.
- Lower particle counts and pixel ratio on phones / low-core devices; `PerformanceMonitor` drops resolution if frames slow down.
- Objects far from the camera are hidden; `prefers-reduced-motion` disables the intro flight, parallax and smooth scroll.
- Falls back to a static gradient if WebGL isn't available.
