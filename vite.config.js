import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Runs api/chat.js inside `npm run dev`, so the chatbot works locally with a .env file.
// In production Vercel serves api/chat.js as an Edge Function automatically.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      Object.assign(process.env, env);
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const request = new Request('http://localhost/api/chat', {
            method: req.method,
            headers: { 'content-type': 'application/json' },
            body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
          });
          const mod = await server.ssrLoadModule('/api/chat.js');
          const response = await mod.default(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          if (!response.body) return res.end();
          const reader = response.body.getReader();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (err) {
          console.error('[api/chat]', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'dev_server_error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
