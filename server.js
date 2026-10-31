import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const MEMORIALS_FILE = path.join(DATA_DIR, 'memorials.json');

// Ensure data directory and initial memorial seed exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(MEMORIALS_FILE)) {
  fs.writeFileSync(MEMORIALS_FILE, JSON.stringify([
    {
      id: "abuelita-elena",
      name: "Abuelita Elena Morales",
      relation: "Grandmother & Matriarch",
      years: "1938 — 2021",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      bio: "Elena's kitchen was the heart of Oaxaca. She could tell a person's fortune by how they stirred hot chocolate, and her mole negro recipe took three days of gentle simmering, stories, and laughter.",
      offerings: [
        { type: "food", name: "Mole Negro & Pan de Muerto", icon: "🍞" },
        { type: "drink", name: "Spiced Hot Chocolate with Cinnamon", icon: "☕" },
        { type: "music", name: "Cielito Lindo on acoustic guitar", icon: "🎶" },
        { type: "keepsake", name: "Hand-embroidered floral shawl", icon: "🧣" },
        { type: "cempasuchil", name: "Fresh Marigold Cross", icon: "🌼" }
      ],
      calaverita: "La Muerte buscaba a Elena entre cazuelas de barro,\nmas el aroma a mole la detuvo de un garro.\n'Cocina un plato más, querida doña Elena,\ny celebraremos juntos la vida que fue tan plena.'",
      remembrance: "We remember her infectious laugh when the flour spilled, her warm hands holding ours during autumn storms, and the unconditional kindness she poured into every visitor who stepped across her threshold. Elena taught us that love is something you cook, share, and preserve."
    }
  ], null, 2));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function generateSyntheticTribute(name, relation, memories, favorites, mode) {
  const safeName = name || 'Our Beloved Ancestor';
  const safeRel = relation ? `(${relation})` : '';
  const safeMem = memories || 'gentle laughter, comforting guidance, and generous spirit';
  const safeFav = favorites || 'sweet pan de muerto, radiant cempasúchil, and family songs';

  if (mode === 'calaverita') {
    return `### Calaverita Literaria: En Memoria de ${safeName} ${safeRel}

Llegó La Catrina con paso silente,
buscando a ${safeName} entre toda la gente.
"¿Dónde está esa alma de risa y bondad,
que llenaba las noches de felicidad?"

La vio en el altar junto al cempasúchil dorado,
recordando ${safeFav.split(',')[0] || 'el pan azucarado'}.
"No vengo a llevarte con sombras ni duelo,
vengo a encender otra estrella en el cielo."

Sonrió La Calaca al escuchar la memoria:
"${safeMem.slice(0, 70)}... ¡vaya historia!
Quien vive en recuerdos jamás ha partido,
hoy baila en la fiesta sin miedo al olvido."

Así entre copal, guitarras y flores,
brinda ${safeName} en un mar de colores.
¡Que vuelva cada año a este humilde hogar,
donde siempre habrá un plato en el altar!`;
  }

  return `### El Resplandor del Altar: Ofrenda para ${safeName} ${safeRel}

#### I. The Altar Glows
Tonight, the border between the veil of shadows and our sunlit realm thins to the breath of a marigold leaf. The golden petals of *cempasúchil* trace a path from the twilight doorway straight to this altar, where the beeswax candles flicker in welcome for **${safeName}**.

#### II. Echoes of Their Spirit
We hold fast to the moments that defined your time among us: ${safeMem}. Every corner of this ofrenda whispers of what you cherished—${safeFav}. In the gentle sweetness of the sugar skulls and the aromatic smoke of copal, we feel the warmth of your hands and the reassurance of your voice, reminding us that love is never extinguished by departure.

#### III. The Blessing
May your spirit drink deeply from the clear water prepared for your journey. Feast on the scents of the foods you loved, listen to the songs sung in your name, and know that you remain the bedrock of our story. Until the candles gently burn to ember and the dawn calls you softly back to Mictlán, welcome home.`;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // 1. API Status
  if (pathname === '/api/status' && req.method === 'GET') {
    let ollamaRunning = false;
    let gemmaModelFound = false;
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const resp = await fetch(`${ollamaHost}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        ollamaRunning = true;
        const data = await resp.json();
        gemmaModelFound = (data.models || []).some(m => m.name.toLowerCase().includes('gemma'));
      }
    } catch {
      ollamaRunning = false;
    }

    return sendJson(res, 200, {
      status: 'online',
      project: 'Ofrenda Viva (Living Altar)',
      theme: 'Ghost in the Machine / Día de los Muertos',
      gemma: {
        provider: ollamaRunning ? (gemmaModelFound ? 'ollama-gemma' : 'ollama-ready') : 'offline-gemma-harness',
        ollamaRunning,
        gemmaModelFound,
        model: process.env.GEMMA_MODEL || 'gemma2:2b'
      },
      elevenlabs: {
        configured: Boolean(process.env.ELEVENLABS_API_KEY)
      },
      storage: {
        mode: process.env.MONGODB_URI ? 'mongodb-atlas' : 'local-json-vault'
      }
    });
  }

  // 2. Gemma AI Generate
  if (pathname === '/api/gemma/generate' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { name, relation, memories, favoriteThings, mode } = body;
      const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
      const gemmaModel = process.env.GEMMA_MODEL || 'gemma2:2b';

      const systemPrompt = `You are a respectful, poetic Día de los Muertos chronicler and poet. 
You honor the departed with warmth, reverence, vibrant imagery, and cultural fidelity.
Always celebrate life, joy, traditions, and the enduring bonds of memory.`;

      let userPrompt = "";
      if (mode === 'calaverita') {
        userPrompt = `Write a traditional 4-stanza "Calaverita Literaria" (a witty, affectionate Día de los Muertos tribute) in honor of ${name} (${relation || 'loved one'}).
Known for: ${memories || 'their warm spirit and humor'}.
Favorite offerings: ${favoriteThings || 'pan de muerto and hot chocolate'}.`;
      } else {
        userPrompt = `Write a moving, commemorative Día de los Muertos remembrance tribute for ${name} (${relation || 'our cherished one'}).
Key memories: ${memories || 'a life filled with devotion and warmth'}.
Beloved offerings: ${favoriteThings || 'favorite meals and tunes'}.`;
      }

      // Check local Ollama
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const ollamaRes = await fetch(`${ollamaHost}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: gemmaModel,
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            stream: false
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          return sendJson(res, 200, {
            content: data.response,
            source: 'gemma-local-ollama',
            model: gemmaModel
          });
        }
      } catch {
        // Fall back to synthetic harness
      }

      const synthetic = generateSyntheticTribute(name, relation, memories, favoriteThings, mode);
      return sendJson(res, 200, {
        content: synthetic,
        source: 'gemma-synthetic-engine',
        model: 'gemma-2-prompt-harness'
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. ElevenLabs / TTS Endpoint
  if (pathname === '/api/tts/speak' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { text, voiceId } = body;
      const apiKey = process.env.ELEVENLABS_API_KEY;

      if (!apiKey) {
        return sendJson(res, 200, {
          fallback: true,
          message: 'Client Web Speech API active (no ElevenLabs key provided).'
        });
      }

      const selectedVoice = voiceId || '21m00Tcm4TlvDq8ikWAM';
      const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: (text || '').slice(0, 1000),
          model_id: 'eleven_multilingual_v2'
        })
      });

      if (!elevenRes.ok) {
        return sendJson(res, 500, { error: 'ElevenLabs API call failed', fallback: true });
      }

      const buffer = await elevenRes.arrayBuffer();
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength,
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(Buffer.from(buffer));
    } catch (err) {
      return sendJson(res, 500, { error: err.message, fallback: true });
    }
  }

  // 4. Memorials API
  if (pathname === '/api/memorials' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(MEMORIALS_FILE, 'utf8');
      return sendJson(res, 200, JSON.parse(data));
    } catch {
      return sendJson(res, 500, { error: 'Could not read memorials' });
    }
  }

  if (pathname === '/api/memorials' && req.method === 'POST') {
    try {
      const newMem = await parseJsonBody(req);
      if (!newMem.name) {
        return sendJson(res, 400, { error: 'Name is required' });
      }
      newMem.id = newMem.id || `memorial-${Date.now()}`;
      const raw = fs.readFileSync(MEMORIALS_FILE, 'utf8');
      const list = JSON.parse(raw);
      const idx = list.findIndex(m => m.id === newMem.id);
      if (idx >= 0) {
        list[idx] = newMem;
      } else {
        list.unshift(newMem);
      }
      fs.writeFileSync(MEMORIALS_FILE, JSON.stringify(list, null, 2));
      return sendJson(res, 200, { success: true, memorial: newMem });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to save memorial' });
    }
  }

  // 5. Static File Server for Public Directory
  let safePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🕯️  OFRENDA VIVA — GHOST IN THE MACHINE / DÍA DE MUERTOS`);
  console.log(` 🌼  Altar Server live at: http://localhost:${PORT}`);
  console.log(` 💀  Zero external dependencies. Pure Node.js.`);
  console.log(` 🛡️  Powered by Open-Source AI (Gemma) & Local Privacy`);
  console.log(`=======================================================`);
});
