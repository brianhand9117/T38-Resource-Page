const STEP_ORDER = ['flights', 'comments', 'fuel', 'nasr', 'dcs', 'wb_list', 'kml', 'map'];

const overallStatus = document.getElementById('overallStatus');
const parseRow = document.getElementById('parseRow');
const parseFill = document.getElementById('parseFill');
const parsePct = document.getElementById('parsePct');
const parseStatus = document.getElementById('parseStatus');
const actionsRow = document.getElementById('actionsRow');
const openMapAgainBtn = document.getElementById('openMapAgainBtn');
const downloadKmlBtn = document.getElementById('downloadKmlBtn');
const runAgainBtn = document.getElementById('runAgainBtn');
const mapPanel = document.getElementById('mapPanel');
const mapStatus = document.getElementById('mapStatus');

const legendDialog = document.getElementById('legendDialog');
const creditsDialog = document.getElementById('creditsDialog');
const legendBtn = document.getElementById('legendBtn');
const creditsBtn = document.getElementById('creditsBtn');

const stepNodes = new Map(
  [...document.querySelectorAll('.step-row[data-step]')].map((row) => {
    const step = row.dataset.step;
    return [
      step,
      {
        row,
        fill: row.querySelector('.bar-fill'),
        pct: row.querySelector('.step-pct'),
        status: row.querySelector('.step-status')
      }
    ];
  })
);

let currentMapUrl = '';
let currentKmlUrl = '';
let mapInstance;
let markerLayer;
const kmlPath = './data/T38_Apts_09_Feb_2026.kml';
const guiMapFileUrl = 'file:///C:/Users/bjhand/Desktop/T38%20Planning%20Aid/KML_Output/T38%20Map%2019%20Feb%202026%20EXPIRES%2019%20Mar%202026.html';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setStepProgress = (step, pct, statusText) => {
  const node = stepNodes.get(step);
  if (!node) return;
  node.row.classList.remove('is-done', 'is-error');
  node.row.classList.add('is-running');
  node.fill.style.width = `${Math.min(pct, 99)}%`;
  node.pct.textContent = `${pct}%`;
  node.status.textContent = statusText;
};

const setStepDone = (step, cached = false) => {
  const node = stepNodes.get(step);
  if (!node) return;
  node.row.classList.remove('is-running', 'is-error');
  node.row.classList.add('is-done');
  node.fill.style.width = '100%';
  node.pct.textContent = '100%';
  node.status.textContent = cached ? 'Cached ✓' : 'Complete ✓';
};

const resetStep = (step) => {
  const node = stepNodes.get(step);
  if (!node) return;
  node.row.classList.remove('is-running', 'is-done', 'is-error');
  node.fill.style.width = '0%';
  node.pct.textContent = '';
  node.status.textContent = 'Waiting';
};

const resetAll = () => {
  STEP_ORDER.forEach(resetStep);
  parseRow.hidden = true;
  parseFill.style.width = '0%';
  parsePct.textContent = '';
  parseStatus.textContent = '';
  actionsRow.hidden = true;
  currentMapUrl = '';
  mapPanel.hidden = true;
  mapStatus.textContent = 'Loading interactive map...';
  if (currentKmlUrl) {
    URL.revokeObjectURL(currentKmlUrl);
    currentKmlUrl = '';
  }
  if (markerLayer) {
    markerLayer.clearLayers();
  }
};

const progressStep = async (step, phases) => {
  for (const phase of phases) {
    setStepProgress(step, phase.pct, phase.status);
    await wait(phase.ms);
  }
};

const runDcsParsingSubstep = async () => {
  parseRow.hidden = false;
  parseRow.classList.remove('is-done', 'is-error');
  parseRow.classList.add('is-running');
  const pubs = ['SE Region.pdf', 'SW Region.pdf', 'NW Region.pdf', 'NE Region.pdf'];
  for (let i = 0; i < pubs.length; i += 1) {
    const current = i + 1;
    const pct = Math.round((current / pubs.length) * 100);
    parseFill.style.width = `${Math.min(pct, 99)}%`;
    parsePct.textContent = `${pct}%`;
    parseStatus.textContent = `${current}/${pubs.length} ${pubs[i]}`;
    await wait(260);
  }
  parseFill.style.width = '100%';
  parsePct.textContent = '100%';
  parseStatus.textContent = 'Complete ✓';
  parseRow.classList.remove('is-running', 'is-error');
  parseRow.classList.add('is-done');
};

const getNodeText = (node, tagName) => {
  const el = node.getElementsByTagNameNS('*', tagName)[0];
  return el ? el.textContent.trim() : '';
};

const styleToMarkerType = (iconHref, name) => {
  const href = (iconHref || '').toLowerCase();
  const airportName = (name || '').toLowerCase();
  if (href.includes('grn-pushpin')) return 'green';
  if (href.includes('blue-pushpin')) return 'blue';
  if (href.includes('ylw-pushpin')) return 'yellow';
  if (href.includes('red-diamond')) return 'red-diamond';
  if (href.includes('red-circle')) return 'red-circle';
  if (href.includes('red-pushpin') || airportName.includes('blacklisted')) return 'blacklist';
  return 'blue';
};

const markerStyle = (type) => {
  const palette = {
    green: '#27ae60',
    blue: '#2e86de',
    yellow: '#f1c40f',
    'red-diamond': '#e74c3c',
    'red-circle': '#c0392b',
    blacklist: '#922b21'
  };
  return {
    radius: type === 'blacklist' ? 8 : 7,
    fillColor: palette[type] || palette.blue,
    color: '#102039',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.92
  };
};

const initMap = () => {
  if (!mapInstance) {
    mapInstance = L.map('planningMap', {
      center: [39.0, -98.0],
      zoom: 5
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 13,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
    markerLayer = L.layerGroup().addTo(mapInstance);
  }
  return mapInstance;
};

const loadFunctionalMap = async () => {
  try {
    mapPanel.hidden = false;
    mapStatus.textContent = 'Rendering airport markers from KML...';

    const map = initMap();
    markerLayer.clearLayers();

    const response = await fetch(kmlPath, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Could not load KML (${response.status})`);
    }
    const kmlText = await response.text();
    const xml = new DOMParser().parseFromString(kmlText, 'application/xml');

    const styleNodes = [...xml.getElementsByTagNameNS('*', 'Style')];
    const styleIconMap = new Map();
    for (const styleNode of styleNodes) {
      const styleId = styleNode.getAttribute('id');
      const iconHref = getNodeText(styleNode, 'href');
      if (styleId && iconHref) {
        styleIconMap.set(`#${styleId}`, iconHref);
      }
    }

    const placemarks = [...xml.getElementsByTagNameNS('*', 'Placemark')];
    const bounds = L.latLngBounds();
    let count = 0;

    for (const placemark of placemarks) {
      const name = getNodeText(placemark, 'name');
      if (/^version\s+/i.test(name)) {
        continue;
      }

      const coordinates = getNodeText(placemark, 'coordinates');
      if (!coordinates) {
        continue;
      }
      const [lonRaw, latRaw] = coordinates.split(',');
      const lat = Number.parseFloat(latRaw);
      const lon = Number.parseFloat(lonRaw);
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        continue;
      }

      const styleUrl = getNodeText(placemark, 'styleUrl');
      const iconHref = styleIconMap.get(styleUrl) || '';
      const markerType = styleToMarkerType(iconHref, name);
      const descriptionHtml = getNodeText(placemark, 'description');

      const marker = L.circleMarker([lat, lon], markerStyle(markerType));
      marker.bindTooltip(name || 'Airport');
      marker.bindPopup(descriptionHtml || name || 'Airport', { maxWidth: 380 });
      marker.addTo(markerLayer);

      bounds.extend([lat, lon]);
      count += 1;
    }

    if (count > 0 && bounds.isValid()) {
      map.fitBounds(bounds.pad(0.08));
    }

    mapStatus.textContent = `Interactive map ready • ${count} airports loaded`;
    currentMapUrl = `${window.location.pathname}#mapPanel`;
    downloadKmlBtn.href = kmlPath;
    downloadKmlBtn.setAttribute('download', 'T38_Apts_09_Feb_2026.kml');
  } catch (error) {
    mapPanel.hidden = false;
    mapStatus.textContent = `Map failed to load automatically. Run via a local server (for example: python -m http.server 5500), then open planning-aid.html. ${error.message}`;
  }
};

const finishRun = async () => {
  await loadFunctionalMap();
  currentMapUrl = guiMapFileUrl;

  overallStatus.textContent = 'All done! · Interactive map loaded · KML → T38_Apts_09_Feb_2026.kml';
  overallStatus.style.color = '#27ae60';
  actionsRow.hidden = false;
};

const runPipeline = async () => {
  resetAll();
  overallStatus.textContent = 'Loading modules…';
  overallStatus.style.color = '#7889a0';
  await wait(450);
  overallStatus.textContent = '';

  await Promise.all([
    progressStep('flights', [
      { pct: 5, status: 'Checking…', ms: 210 },
      { pct: 20, status: 'Cache check', ms: 220 },
      { pct: 55, status: 'Downloading…', ms: 260 },
      { pct: 85, status: 'Deploying…', ms: 220 }
    ]),
    progressStep('comments', [
      { pct: 5, status: 'Checking…', ms: 240 },
      { pct: 20, status: 'Cache check', ms: 210 },
      { pct: 45, status: 'Downloading…', ms: 240 },
      { pct: 85, status: 'Deploying…', ms: 240 }
    ]),
    progressStep('fuel', [
      { pct: 5, status: 'Checking…', ms: 260 },
      { pct: 20, status: 'Cache check', ms: 210 },
      { pct: 55, status: 'Downloading…', ms: 290 },
      { pct: 85, status: 'Deploying…', ms: 250 }
    ])
  ]);
  setStepDone('flights');
  setStepDone('comments');
  setStepDone('fuel');

  await progressStep('nasr', [
    { pct: 5, status: 'Checking…', ms: 240 },
    { pct: 20, status: 'Cache check', ms: 220 },
    { pct: 35, status: 'Downloading…', ms: 230 },
    { pct: 55, status: 'Downloading…', ms: 230 },
    { pct: 75, status: 'Downloading…', ms: 230 },
    { pct: 85, status: 'Deploying…', ms: 240 }
  ]);
  setStepDone('nasr');

  await progressStep('dcs', [
    { pct: 5, status: 'Checking…', ms: 220 },
    { pct: 20, status: 'Cache check', ms: 220 },
    { pct: 55, status: 'Downloading…', ms: 250 },
    { pct: 85, status: 'Parsing pubs…', ms: 240 }
  ]);
  await runDcsParsingSubstep();
  setStepDone('dcs');

  await progressStep('wb_list', [
    { pct: 10, status: 'Updating…', ms: 340 },
    { pct: 70, status: 'Updating…', ms: 350 }
  ]);
  setStepDone('wb_list');

  await progressStep('kml', [
    { pct: 5, status: 'Loading data…', ms: 220 },
    { pct: 30, status: 'Loading data…', ms: 230 },
    { pct: 50, status: 'Building dict…', ms: 230 },
    { pct: 60, status: 'Writing KML…', ms: 230 },
    { pct: 85, status: '132 airports', ms: 260 }
  ]);
  setStepDone('kml');

  await progressStep('map', [
    { pct: 10, status: 'Rendering…', ms: 300 },
    { pct: 70, status: 'Rendering…', ms: 290 }
  ]);
  setStepDone('map');

  await finishRun();
};

legendBtn.addEventListener('click', () => legendDialog.showModal());
creditsBtn.addEventListener('click', () => creditsDialog.showModal());

openMapAgainBtn.addEventListener('click', () => {
  if (currentMapUrl) {
    window.open(currentMapUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  if (mapPanel.hidden) {
    mapPanel.hidden = false;
  }
  mapPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (mapInstance) {
    mapInstance.invalidateSize();
  }
});

runAgainBtn.addEventListener('click', () => {
  runPipeline();
});

window.addEventListener('DOMContentLoaded', () => {
  runPipeline();
});
