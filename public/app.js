// Ofrenda Viva - Interactive Client Logic

let memorials = [];
let currentMemorial = null;
let currentAiMode = 'calaverita'; // 'calaverita' or 'remembrance'
let isPlayingVoice = false;

// 1. Initialize Canvas Falling Marigold Petals
function initPetalsCanvas() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const petals = [];
  const petalCount = 42;
  const colors = ['#FF9F1C', '#FFBF00', '#E85D04', '#F48C06', '#FAA307'];

  for (let i = 0; i < petalCount; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 1.5 - 0.75,
      speedY: Math.random() * 1.2 + 0.8,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.4
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let p of petals) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      // Realistic marigold petal curve
      ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * 0.8 + p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x > canvas.width + 20) p.x = -20;
      if (p.x < -20) p.x = canvas.width + 20;
    }

    requestAnimationFrame(render);
  }

  render();
}

// 2. Fetch Status & Setup
async function loadStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    const modelLabel = document.getElementById('model-name-label');
    if (modelLabel) {
      if (data.gemma.ollamaRunning && data.gemma.gemmaModelFound) {
        modelLabel.innerText = `Ollama (Gemma Local)`;
      } else if (data.gemma.ollamaRunning) {
        modelLabel.innerText = `Ollama (Ready)`;
      } else {
        modelLabel.innerText = `Gemma Prompt Harness (Local)`;
      }
    }
  } catch (err) {
    console.warn('Status endpoint unavailable, running offline');
  }
}

// 3. Load Memorials
async function loadMemorials() {
  try {
    const res = await fetch('/api/memorials');
    if (res.ok) {
      memorials = await res.json();
    }
  } catch (err) {
    // Local fallback sample
    memorials = [
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
    ];
  }

  populateSelect();
  if (memorials.length > 0) {
    renderMemorial(memorials[0]);
  }
}

function populateSelect() {
  const select = document.getElementById('memorial-select');
  if (!select) return;
  select.innerHTML = '';
  memorials.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.innerText = m.name;
    select.appendChild(opt);
  });

  select.onchange = (e) => {
    const found = memorials.find(m => m.id === e.target.value);
    if (found) renderMemorial(found);
  };
}

function renderMemorial(m) {
  currentMemorial = m;
  document.getElementById('altar-name').innerText = m.name || 'Cherished Soul';
  document.getElementById('altar-relation').innerText = m.relation || 'Departed Loved One';
  document.getElementById('altar-years').innerText = m.years || 'Forever in our hearts';
  document.getElementById('altar-bio').innerText = `"${m.bio || 'Whose spirit brings joy to this home tonight.'}"`;
  
  const photoEl = document.getElementById('altar-photo');
  photoEl.src = m.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

  // Render Offerings
  const container = document.getElementById('offerings-container');
  container.innerHTML = '';
  const list = m.offerings || [];
  list.forEach(item => {
    const pill = document.createElement('div');
    pill.className = 'offering-pill';
    pill.innerHTML = `<span>${item.icon || '🌼'}</span> <span>${item.name}</span>`;
    container.appendChild(pill);
  });

  // Render Calaverita & Remembrance
  document.getElementById('display-calaverita').innerText = m.calaverita || 'Click "Weave Calaverita Poem" above to compose verses with Gemma AI.';
  document.getElementById('display-remembrance').innerText = m.remembrance || 'Click "Chronicle Eulogy" above to compose a tribute with Gemma AI.';

  if (window.lucide) window.lucide.createIcons();
}

// 4. Interactive Candle Lighting
function toggleCandle(element) {
  const flame = element.querySelector('.candle-flame');
  if (flame) {
    flame.classList.toggle('extinguished');
    const label = element.querySelector('span');
    if (label) {
      label.innerText = flame.classList.contains('extinguished') ? 'Relight' : 'Light';
    }
  }
}

// 5. Offerings & Quick Add
function addQuickOffering() {
  const name = prompt("What was their favorite food, drink, or keepsake to place on the altar?");
  if (!name || !name.trim()) return;

  if (!currentMemorial.offerings) currentMemorial.offerings = [];
  currentMemorial.offerings.push({
    type: "custom",
    name: name.trim(),
    icon: "✨"
  });

  saveCurrentMemorial();
  renderMemorial(currentMemorial);
}

// 6. Modal Controls
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

document.getElementById('btn-new-altar').addEventListener('click', () => {
  openModal('modal-new-altar');
});

// 7. New Memorial Submission
document.getElementById('form-new-memorial').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('input-name').value;
  const relation = document.getElementById('input-relation').value;
  const years = document.getElementById('input-years').value;
  const photo = document.getElementById('input-photo').value;
  const bio = document.getElementById('input-bio').value;
  const offeringsRaw = document.getElementById('input-offerings').value;

  const offerings = offeringsRaw
    ? offeringsRaw.split(',').map(s => ({ type: 'favorite', name: s.trim(), icon: '🎁' }))
    : [
        { type: "cempasuchil", name: "Cempasúchil Flowers", icon: "🌼" },
        { type: "candle", name: "Beeswax Candle", icon: "🕯️" }
      ];

  const newMem = {
    id: `memorial-${Date.now()}`,
    name,
    relation,
    years: years || 'In Loving Memory',
    photo: photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio,
    offerings,
    calaverita: '',
    remembrance: ''
  };

  try {
    await fetch('/api/memorials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMem)
    });
  } catch (err) {
    console.warn('Saving locally');
  }

  memorials.unshift(newMem);
  populateSelect();
  renderMemorial(newMem);
  closeModal('modal-new-altar');
  document.getElementById('form-new-memorial').reset();
});

// 8. AI Generation with Gemma
async function openGenerateModal(mode) {
  currentAiMode = mode;
  const modal = document.getElementById('modal-ai-generate');
  const title = document.getElementById('ai-modal-title');
  const loading = document.getElementById('ai-loading');
  const resultContainer = document.getElementById('ai-result-container');
  const textArea = document.getElementById('ai-generated-text');
  const badge = document.getElementById('ai-source-badge');

  title.innerHTML = mode === 'calaverita'
    ? '<span>💀</span> Weave Calaverita Poem with Gemma'
    : '<span>🕯️</span> Chronicle Living Memory with Gemma';

  textArea.value = '';
  loading.classList.remove('hidden');
  resultContainer.classList.add('hidden');
  openModal('modal-ai-generate');

  const favorites = currentMemorial.offerings
    ? currentMemorial.offerings.map(o => o.name).join(', ')
    : '';

  try {
    const res = await fetch('/api/gemma/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: currentMemorial.name,
        relation: currentMemorial.relation,
        memories: currentMemorial.bio,
        favoriteThings: favorites,
        mode: mode
      })
    });

    const data = await res.json();
    loading.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    textArea.value = data.content;
    badge.innerText = `Engine: ${data.model || 'Gemma 2'} (${data.source || 'Local'})`;
  } catch (err) {
    loading.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    textArea.value = "Failed to connect to AI engine. Check your connection or local Ollama instance.";
  }
}

function applyGeneratedText() {
  const text = document.getElementById('ai-generated-text').value;
  if (!text) return;

  if (currentAiMode === 'calaverita') {
    currentMemorial.calaverita = text;
  } else {
    currentMemorial.remembrance = text;
  }

  saveCurrentMemorial();
  renderMemorial(currentMemorial);
  closeModal('modal-ai-generate');
}

async function saveCurrentMemorial() {
  try {
    await fetch('/api/memorials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentMemorial)
    });
  } catch (err) {
    console.warn('Saved in memory');
  }
}

// 9. Voice Tribute Player (ElevenLabs + Web Speech Audio Engine)
async function playVoiceTribute() {
  const icon = document.getElementById('play-icon');
  if (isPlayingVoice) {
    window.speechSynthesis.cancel();
    isPlayingVoice = false;
    if (window.lucide) {
      icon.setAttribute('data-lucide', 'volume-2');
      window.lucide.createIcons();
    }
    return;
  }

  const narrationText = currentMemorial.calaverita || currentMemorial.remembrance || currentMemorial.bio;
  if (!narrationText) {
    alert("Please generate a Calaverita or Remembrance tribute first!");
    return;
  }

  isPlayingVoice = true;
  if (window.lucide) {
    icon.setAttribute('data-lucide', 'square');
    window.lucide.createIcons();
  }

  // Attempt ElevenLabs backend stream
  try {
    const res = await fetch('/api/tts/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: narrationText.slice(0, 500) })
    });

    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('audio')) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        isPlayingVoice = false;
        icon.setAttribute('data-lucide', 'volume-2');
        if (window.lucide) window.lucide.createIcons();
      };
      audio.play();
      return;
    }
  } catch (err) {
    // Graceful fallback to client Web Speech API
  }

  // Client-side Web Speech API with rich ceremonial cadence
  const utterance = new SpeechSynthesisUtterance(narrationText.replace(/[#*]/g, ''));
  utterance.rate = 0.88; // Gentle, reverent pace
  utterance.pitch = 0.95; // Warm resonance
  utterance.onend = () => {
    isPlayingVoice = false;
    icon.setAttribute('data-lucide', 'volume-2');
    if (window.lucide) window.lucide.createIcons();
  };
  window.speechSynthesis.speak(utterance);
}

// 10. Private Vault Export (Complete Standalone Offline Archive)
document.getElementById('btn-export-vault').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memorials, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `ofrenda-viva-vault-${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  alert("✨ Vault exported! Keep this file safe on an external drive or USB stick. It contains your private memorial archive with zero external dependencies.");
});

// Bootstrap on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  initPetalsCanvas();
  loadStatus();
  loadMemorials();
  if (window.lucide) window.lucide.createIcons();
});
