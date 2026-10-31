# 🕯️ Ofrenda Viva — Living Altar
> **A Día de los Muertos Memorial Sanctuary Powered by Open-Source AI (Gemma 2)**  
> *Built for the DEV Hacktoberfest 2026: Ghost in the Machine Challenge* (`#devchallenge`, `#hf26challenge`)

![Día de los Muertos Theme](https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80)

---

## 🌺 The Inspiration

During *Día de los Muertos* (November 1–2), tradition tells us the boundary between the living and the spirit realm softens. We build *ofrendas* (altars) adorned with marigolds (*cempasúchil*), candles, photos, pan de muerto, and keepsakes to guide our loved ones home.

**Ofrenda Viva** is a digital memorial sanctuary built around a fundamental conviction:

> **Personal grief, family oral histories, and memories of departed ancestors are sacred.**  
> They should never be commodified, harvested to train corporate ad algorithms, or trapped behind a recurring subscription paywall that could vanish tomorrow.

By anchoring this sanctuary in **open-weight AI (Gemma 2)** running locally, **Ofrenda Viva** ensures every eulogy, poem, and memory remains **100% private, sovereign, and permanent.**

---

## ✨ Features

- **🕯️ Interactive 3-Tier Traditional Altar**:
  - *Tier I (Heavens)*: Portrait framed in glowing gold, flanked by interactive beeswax candles and biographical lore.
  - *Tier II (Earthly Joys)*: Offerings of favorite dishes (mole, pan de muerto), drinks, instruments, and personal keepsakes.
  - *Tier III (The Realm of Spirits)*: Calaveritas literarias, chronicled eulogies, and candlelight voice whispers.
- **💀 Gemma-Powered "Calaveritas Literarias"**:
  - Composes affectionate, rhyming traditional Día de los Muertos verse where *La Catrina / La Calaca* pays homage to the departed’s personality and passions.
- **📜 Memory Chronicler & Blessing**:
  - Weaves scattered family stories and favorite recipes into cohesive, poignant memorial narratives and journeys home.
- **🎙️ Ethereal Voice Narration**:
  - Candlelight audio reading powered by ElevenLabs (or client-side Web Speech synthesis with ceremonial cadence).
- **🛡️ 100% Local-First Privacy & Zero Dependencies**:
  - Built with pure, native Node.js. **No `npm install` required.**
  - One-click **Export Private Vault**: saves the entire memorial as an offline archive file that can be kept on a USB drive forever.

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- *(Optional)* [Ollama](https://ollama.ai) with `gemma2:2b` or `gemma:2b` if you want local open-weight inference. If Ollama is not installed, the built-in offline Gemma prompt harness runs automatically!

### Running the Altar

1. Clone or open the project folder:
   ```bash
   cd ofrenda-viva
   ```

2. Start the altar server (instantly, zero npm downloads needed!):
   ```bash
   node server.js
   ```

3. Open your browser:
   ```
   http://localhost:3000
   ```

---

## ⚙️ Configuration (Optional)

Create a `.env` file in the root directory to customize the experience:

```env
PORT=3000

# Gemma Local Ollama Configuration (Defaults to http://127.0.0.1:11434)
OLLAMA_HOST=http://127.0.0.1:11434
GEMMA_MODEL=gemma2:2b

# Optional: ElevenLabs API Key for high-fidelity ghostly voice narration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: MongoDB Atlas URI for multi-generational family sync
MONGODB_URI=
```

---

## 🏆 Hackathon Tracks & Badges

- **Theme**: *Ghost in the Machine* (Honoring the past in the spirit of Día de los Muertos)
- **Primary AI**: Google Gemma 2 (Open-weight model)
- **Partner Categories Targeted**:
  - **Best Use of Gemma ($200)**: Local inference via Ollama / Gemma 2 prompt harness.
  - **Best Use of ElevenLabs ($100)**: Ethereal audio tribute voice synthesis.
  - **Best Use of MongoDB Atlas ($100)**: Persistent family vault connector.
  - **DevRelay**: Built with open agent pairing and session logging.

---

## 📜 License
MIT License. Preserving memories freely for everyone.
