import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const ENV_KEY_VALID = !!GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_');

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  model = 'llama-3.3-70b-versatile',
  temperature = 0.7,
  maxTokens = 1024
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GROQ_${res.status}:${body}`);
  }

  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content ?? '';
}

function handleError(error: any, res: express.Response) {
  const msg: string = error?.message || 'Bilinmeyen hata';
  console.error('AI Error:', msg.slice(0, 200));
  if (msg.includes('GROQ_401') || msg.includes('invalid_api_key')) {
    return res.status(401).json({ error: 'API_KEY_INVALID' });
  }
  if (msg.includes('GROQ_429') || msg.includes('rate_limit')) {
    return res.status(429).json({ error: 'RATE_LIMIT' });
  }
  return res.status(500).json({ error: msg.slice(0, 300) });
}

app.get('/api/ai-status', (_req, res) => {
  res.json({ serverKeySet: ENV_KEY_VALID });
});

app.post('/api/product-specs', async (req, res) => {
  if (!ENV_KEY_VALID) return res.status(500).json({ error: 'API_KEY_MISSING' });
  try {
    const { productName, category } = req.body;
    const text = await callGroq([
      {
        role: 'system',
        content: 'You are a network hardware expert. Always respond with valid JSON only, no markdown, no explanation.',
      },
      {
        role: 'user',
        content: `Technical specs for network hardware "${productName}" (category: ${category || 'general'}).
Return ONLY this JSON structure:
{"brand":"maker name","model":"full model name","ports":"port configuration","throughput":"bandwidth spec","desc":"Turkish short description max 100 chars","whySelected":"Turkish reason to choose this max 120 chars"}`,
      }
    ], 'llama-3.1-8b-instant', 0.1, 400);

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new SyntaxError('No JSON in response');
    res.json(JSON.parse(text.slice(start, end + 1)));
  } catch (error: any) {
    if (error instanceof SyntaxError) return res.status(500).json({ error: 'AI yanıtı JSON formatında değil.' });
    handleError(error, res);
  }
});

app.post('/api/assistant', async (req, res) => {
  if (!ENV_KEY_VALID) return res.status(500).json({ error: 'API_KEY_MISSING' });
  try {
    const { message, context } = req.body;
    const text = await callGroq([
      {
        role: 'system',
        content: `Sen "NetSim-Architect" uygulamasının uzman yapay zeka çekirdeğisin. Ağ ve Veri Merkezi Mimarı olarak "Screw-to-Code" (Vidadan Koda) metodolojisini benimsersin. Kullanıcılara tamamen TÜRKÇE, profesyonel, açıklayıcı ve cesaretlendirici bir dille yanıt ver. Fiziksel ve mantıksal adımları, CLI komutlarını, subnetting hesaplarını detaylıca sun.`,
      },
      {
        role: 'user',
        content: `Ağ Altyapısı: Ofis=${context.officeEndpoints || 'Belirtilmemiş'}, OT=${context.otAssets || 'Yok'}, DC=${context.datacenterAssets || 'Standart'}, Faz=${context.currentPhase || 'Faz 1'}\n\n${message}`,
      }
    ], 'llama-3.3-70b-versatile', 0.7, 1024);

    res.json({ text });
  } catch (error: any) {
    handleError(error, res);
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`AI: Groq (llama-3.3-70b) — key ${ENV_KEY_VALID ? 'aktif ✓' : 'eksik ✗'}`);
  });
}

start();
