/**
 * ESP32-S3 RadioOS • Core Frontend Engine
 */

let stations = [];
let currentStationIndex = 0;
let isPlaying = false;
let audioContext = null;
let audioElement = null;
let audioSourceNode = null;
let analyserNode = null;
let gainNode = null;
let eqFilters = [];
let visualizerRunning = false;
let sleepTimerId = null;
let sleepRemainingSeconds = 0;
let isMuted = false;
let previousVolume = 0.8;

// Dragging state
let activeDrag = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// EQ Frequencies
const EQ_FREQS = [60, 230, 910, 4000, 14000];
const EQ_PRESETS = {
  flat: [0, 0, 0, 0, 0],
  bass: [6, 4, 1, 0, -1],
  rock: [5, 2, -1, 3, 5],
  vocal: [-2, -1, 4, 3, 1],
  jazz: [4, 2, 0, 2, 3]
};

document.addEventListener('DOMContentLoaded', async () => {
  audioElement = document.getElementById('audio-engine');
  initClock();
  initDragEvents();
  initTelemetrySimulator();
  await loadStations();
  renderQuickPresets();
  renderStationsList();
  selectStation(0, false);
});

// CLOCK
function initClock() {
  const update = () => {
    const now = new Date();
    document.getElementById('top-clock').textContent = now.toLocaleTimeString('pt-BR');
  };
  update();
  setInterval(update, 1000);
}

// LOAD STATIONS
async function loadStations() {
  try {
    const res = await fetch('stations.json');
    stations = await res.json();
    const saved = localStorage.getItem('custom_stations');
    if (saved) {
      stations = stations.concat(JSON.parse(saved));
    }
  } catch (err) {
    console.error("Falha ao carregar stations.json, usando padrão", err);
    stations = [
      { id: "antena1", name: "Antena 1 FM", genre: "Pop / Adult Contemporary", url: "https://stream.zeno.fm/f3wvbbqmdg8uv", logo: "🎵", bitrate: "128 kbps", country: "Brasil" },
      { id: "kissfm", name: "Kiss FM (Rock)", genre: "Classic Rock", url: "https://ice.fabricahost.com.br/kissfmsp", logo: "🎸", bitrate: "128 kbps", country: "Brasil" }
    ];
  }
}

// RENDER PRESETS
function renderQuickPresets() {
  const container = document.getElementById('quick-preset-chips');
  container.innerHTML = '';
  stations.slice(0, 5).forEach((st, idx) => {
    const btn = document.createElement('button');
    btn.className = 'preset-chip-btn';
    btn.textContent = `${st.logo} ${st.name}`;
    btn.onclick = () => selectStation(idx, true);
    container.appendChild(btn);
  });
}

// RENDER STATIONS LIST
function renderStationsList(filterText = '') {
  const container = document.getElementById('station-list-container');
  container.innerHTML = '';
  const filtered = stations.filter(s =>
    s.name.toLowerCase().includes(filterText.toLowerCase()) ||
    s.genre.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach((st) => {
    const globalIdx = stations.findIndex(s => s.id === st.id);
    const card = document.createElement('div');
    card.className = `station-card ${globalIdx === currentStationIndex ? 'active' : ''}`;
    card.onclick = () => selectStation(globalIdx, true);
    card.innerHTML = `
      <div class="card-left">
        <span class="card-logo">${st.logo || '📻'}</span>
        <div class="card-details">
          <h4>${st.name}</h4>
          <p>${st.genre} • ${st.bitrate || '128k'}</p>
        </div>
      </div>
      <button class="card-play-btn">${globalIdx === currentStationIndex && isPlaying ? '⏸️' : '▶️'}</button>
    `;
    container.appendChild(card);
  });
}

function filterStations(val) {
  renderStationsList(val);
}

// SELECT STATION
function selectStation(index, autoPlay = true) {
  if (index < 0 || index >= stations.length) return;
  currentStationIndex = index;
  const st = stations[index];

  document.getElementById('current-name').textContent = st.name;
  document.getElementById('current-genre').textContent = st.genre;
  document.getElementById('current-logo').textContent = st.logo || '📻';
  document.getElementById('current-bitrate').textContent = st.bitrate || '128 kbps';
  document.getElementById('current-country').textContent = st.country || 'Mundial';

  audioElement.src = st.url;
  renderStationsList();

  if (autoPlay) {
    playStream();
  }
}

// AUDIO ENGINE INIT
function initAudioEngine() {
  if (audioContext) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 128;

    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.8;

    // 5-band EQ
    eqFilters = EQ_FREQS.map((freq, i) => {
      const filter = audioContext.createBiquadFilter();
      if (i === 0) {
        filter.type = 'lowshelf';
      } else if (i === EQ_FREQS.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    audioSourceNode = audioContext.createMediaElementSource(audioElement);

    // Chain: Source -> EQ0 -> EQ1 -> ... -> Gain -> Analyser -> Destination
    let lastNode = audioSourceNode;
    eqFilters.forEach(f => {
      lastNode.connect(f);
      lastNode = f;
    });
    lastNode.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    startVisualizer();
  } catch (e) {
    console.warn("AudioContext setup error (user gesture required):", e);
  }
}

// PLAY / PAUSE
function togglePlay() {
  if (isPlaying) {
    pauseStream();
  } else {
    playStream();
  }
}

async function playStream() {
  initAudioEngine();
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  audioElement.play().then(() => {
    isPlaying = true;
    document.getElementById('play-icon').textContent = '⏸️';
    document.getElementById('player-status-badge').textContent = 'TOCANDO';
    document.getElementById('player-status-badge').style.background = 'rgba(16, 185, 129, 0.2)';
    renderStationsList();
  }).catch(err => {
    console.warn("Erro ao reproduzir stream:", err);
  });
}

function pauseStream() {
  audioElement.pause();
  isPlaying = false;
  document.getElementById('play-icon').textContent = '▶️';
  document.getElementById('player-status-badge').textContent = 'PAUSADO';
  document.getElementById('player-status-badge').style.background = 'rgba(239, 68, 68, 0.2)';
  renderStationsList();
}

function nextStation() {
  let next = (currentStationIndex + 1) % stations.length;
  selectStation(next, true);
}

function prevStation() {
  let prev = (currentStationIndex - 1 + stations.length) % stations.length;
  selectStation(prev, true);
}

// VOLUME
function changeVolume(val) {
  const norm = val / 100;
  document.getElementById('vol-text').textContent = `${val}%`;
  if (gainNode) {
    gainNode.gain.setValueAtTime(norm, audioContext.currentTime);
  }
  audioElement.volume = norm;
  if (val == 0) {
    document.getElementById('vol-icon').textContent = '🔇';
    isMuted = true;
  } else {
    document.getElementById('vol-icon').textContent = '🔊';
    isMuted = false;
  }
}

function toggleMute() {
  const slider = document.getElementById('volume-slider');
  if (isMuted) {
    slider.value = previousVolume * 100;
    changeVolume(previousVolume * 100);
  } else {
    previousVolume = slider.value / 100;
    slider.value = 0;
    changeVolume(0);
  }
}

// EQUALIZER
function setBandGain(bandIdx, val) {
  const gainVal = parseFloat(val);
  const ids = ['gain-60', 'gain-230', 'gain-910', 'gain-4000', 'gain-14000'];
  document.getElementById(ids[bandIdx]).textContent = `${gainVal > 0 ? '+' : ''}${gainVal}dB`;
  if (eqFilters[bandIdx] && audioContext) {
    eqFilters[bandIdx].gain.setValueAtTime(gainVal, audioContext.currentTime);
  }
}

function applyEqPreset(presetKey) {
  const gains = EQ_PRESETS[presetKey] || EQ_PRESETS.flat;
  const sliders = document.querySelectorAll('.vertical-slider');
  gains.forEach((g, idx) => {
    if (sliders[idx]) {
      sliders[idx].value = g;
      setBandGain(idx, g);
    }
  });
}

// VISUALIZER CANVAS
function startVisualizer() {
  if (visualizerRunning) return;
  visualizerRunning = true;

  const canvas = document.getElementById('visualizer-canvas');
  const ctx = canvas.getContext('2d');
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    if (!isPlaying) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    analyserNode.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);

      const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
      grad.addColorStop(0.6, 'rgba(0, 240, 255, 0.85)');
      grad.addColorStop(1, 'rgba(217, 70, 239, 1)');

      ctx.fillStyle = grad;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

      x += barWidth;
    }
  }
  draw();
}

// SLEEP TIMER
function setSleepTimer(minutes) {
  if (sleepTimerId) clearInterval(sleepTimerId);
  sleepRemainingSeconds = minutes * 60;

  const updateDisplay = () => {
    const m = Math.floor(sleepRemainingSeconds / 60).toString().padStart(2, '0');
    const s = (sleepRemainingSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${m}:${s}`;
  };

  updateDisplay();
  sleepTimerId = setInterval(() => {
    sleepRemainingSeconds--;
    if (sleepRemainingSeconds <= 0) {
      clearInterval(sleepTimerId);
      document.getElementById('timer-display').textContent = 'Desligado';
      pauseStream();
    } else {
      updateDisplay();
    }
  }, 1000);
}

function cancelSleepTimer() {
  if (sleepTimerId) {
    clearInterval(sleepTimerId);
    sleepTimerId = null;
    document.getElementById('timer-display').textContent = 'Desativado';
  }
}

// ADD CUSTOM STATION
function toggleAddStationModal() {
  const form = document.getElementById('add-station-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveNewStation() {
  const name = document.getElementById('new-name').value.trim();
  const url = document.getElementById('new-url').value.trim();
  const genre = document.getElementById('new-genre').value.trim() || 'Geral';

  if (!name || !url) {
    alert('Por favor informe o Nome e a URL da rádio.');
    return;
  }

  const newStation = {
    id: `custom_${Date.now()}`,
    name,
    url,
    genre,
    logo: '🌐',
    bitrate: 'Custom',
    country: 'Web'
  };

  stations.push(newStation);
  const customList = stations.filter(s => s.id.startsWith('custom_'));
  localStorage.setItem('custom_stations', JSON.stringify(customList));

  toggleAddStationModal();
  renderStationsList();
  selectStation(stations.length - 1, true);
}

// THEME & SETTINGS
function setTheme(themeClass) {
  document.body.className = themeClass;
  document.querySelectorAll('.btn-theme').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function changeAudioMode(mode) {
  const hint = document.querySelector('.hint');
  if (mode === 'browser') {
    hint.textContent = 'Modo PC: Som tocando direto no alto-falante do seu computador!';
    hint.style.color = '#10b981';
  } else if (mode === 'i2s') {
    hint.textContent = 'Modo I2S: ESP32 enviará áudio digital nos pinos GPIO (necessita módulo DAC MAX98357A / PCM5102A).';
    hint.style.color = '#00f0ff';
  } else {
    hint.textContent = 'Modo Bluetooth: ESP32 transmitirá áudio para caixas Bluetooth pareadas.';
    hint.style.color = '#8b5cf6';
  }
}

// TELEMETRY SIMULATOR / LIVE ESP32 STATS
function initTelemetrySimulator() {
  let uptimeSec = 5024;
  setInterval(() => {
    uptimeSec++;
    const hrs = Math.floor(uptimeSec / 3600).toString().padStart(2, '0');
    const min = Math.floor((uptimeSec % 3600) / 60).toString().padStart(2, '0');
    const sec = (uptimeSec % 60).toString().padStart(2, '0');
    document.getElementById('sys-uptime').textContent = `0 dias, ${hrs}:${min}:${sec}`;

    // Flutuações realistas de medição
    const cpu = Math.floor(12 + Math.random() * 6);
    const temp = (41.0 + Math.random() * 0.8).toFixed(1);
    const rssi = -52 - Math.floor(Math.random() * 4);

    document.getElementById('cpu-val').textContent = `${cpu}%`;
    document.getElementById('cpu-bar').style.width = `${cpu}%`;
    document.getElementById('top-temp').textContent = `${temp} °C`;
    document.getElementById('sys-temp').textContent = `${temp} °C`;
    document.getElementById('top-wifi-rssi').textContent = `${rssi} dBm`;
    document.getElementById('rssi-val').textContent = `${rssi} dBm (Excelente)`;
  }, 2000);
}

// WINDOW MANAGEMENT (DRAG, MIN, MAX, CLOSE)
function openWindow(winId) {
  const win = document.getElementById(winId);
  win.style.display = 'flex';
  bringToFront(win);
  updateDockDot(winId, true);
}

function closeWindow(winId) {
  const win = document.getElementById(winId);
  win.style.display = 'none';
  updateDockDot(winId, false);
}

function minimizeWindow(winId) {
  closeWindow(winId);
}

function toggleWindow(winId) {
  const win = document.getElementById(winId);
  if (win.style.display === 'none' || !win.style.display) {
    openWindow(winId);
  } else {
    closeWindow(winId);
  }
}

function bringToFront(win) {
  document.querySelectorAll('.os-window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
}

function updateDockDot(winId, active) {
  const map = {
    'win-player': 0,
    'win-stations': 1,
    'win-equalizer': 2,
    'win-system': 3,
    'win-sleep': 4,
    'win-settings': 5
  };
  const dots = document.querySelectorAll('.dock-dot');
  if (dots[map[winId]]) {
    if (active) dots[map[winId]].classList.add('active');
    else dots[map[winId]].classList.remove('active');
  }
}

function startDrag(e, winId) {
  const win = document.getElementById(winId);
  bringToFront(win);
  activeDrag = win;
  dragOffsetX = e.clientX - win.offsetLeft;
  dragOffsetY = e.clientY - win.offsetTop;
}

function initDragEvents() {
  document.addEventListener('mousemove', (e) => {
    if (!activeDrag) return;
    const x = e.clientX - dragOffsetX;
    const y = e.clientY - dragOffsetY;
    activeDrag.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, x))}px`;
    activeDrag.style.top = `${Math.max(40, Math.min(window.innerHeight - 150, y))}px`;
  });

  document.addEventListener('mouseup', () => {
    activeDrag = null;
  });
}
