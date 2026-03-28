// ============================================================
// ui/portrait.js — SVG generative character portrait
// Thay đổi theo realmIdx (0-7) và spiritRoot (kim/mu/shui/huo/tu/yin_yang/hun)
// Không cần file ảnh — toàn bộ là SVG inline
// ============================================================

// ---- Realm configs ----
const REALM_PORTRAIT = [
  { // 0 - Luyện Khí
    bgFrom: '#0a0a14', bgTo: '#141428',
    auraColor: '#4040a0', auraOpacity: 0.25, auraSize: 68,
    robeColor: '#2a2a3a', robeTrim: '#4040a0',
    crownEmoji: null,
    auraRings: 1, auraAnim: 'slow',
    titleColor: '#888780',
    particles: 3,
  },
  { // 1 - Trúc Cơ
    bgFrom: '#0e0c06', bgTo: '#1e1a08',
    auraColor: '#c8a84b', auraOpacity: 0.3, auraSize: 72,
    robeColor: '#1a1808', robeTrim: '#c8a84b',
    crownEmoji: null,
    auraRings: 1, auraAnim: 'medium',
    titleColor: '#c8a84b',
    particles: 5,
  },
  { // 2 - Kim Đan
    bgFrom: '#100a00', bgTo: '#201400',
    auraColor: '#f0d47a', auraOpacity: 0.35, auraSize: 76,
    robeColor: '#1a1000', robeTrim: '#f0d47a',
    crownEmoji: '⚡',
    auraRings: 2, auraAnim: 'medium',
    titleColor: '#f0d47a',
    particles: 8,
  },
  { // 3 - Nguyên Anh
    bgFrom: '#140600', bgTo: '#280c00',
    auraColor: '#e05c1a', auraOpacity: 0.4, auraSize: 80,
    robeColor: '#180800', robeTrim: '#e05c1a',
    crownEmoji: '🔥',
    auraRings: 2, auraAnim: 'fast',
    titleColor: '#e05c1a',
    particles: 10,
  },
  { // 4 - Hóa Thần
    bgFrom: '#0a0020', bgTo: '#180040',
    auraColor: '#a89df5', auraOpacity: 0.45, auraSize: 84,
    robeColor: '#0e0020', robeTrim: '#a89df5',
    crownEmoji: '✨',
    auraRings: 3, auraAnim: 'fast',
    titleColor: '#a89df5',
    particles: 12,
  },
  { // 5 - Luyện Hư
    bgFrom: '#001a18', bgTo: '#003028',
    auraColor: '#56e8be', auraOpacity: 0.5, auraSize: 88,
    robeColor: '#001410', robeTrim: '#56e8be',
    crownEmoji: '💫',
    auraRings: 3, auraAnim: 'vfast',
    titleColor: '#56e8be',
    particles: 15,
  },
  { // 6 - Hợp Thể
    bgFrom: '#000a20', bgTo: '#001040',
    auraColor: '#6fc3f0', auraOpacity: 0.55, auraSize: 92,
    robeColor: '#000818', robeTrim: '#6fc3f0',
    crownEmoji: '🌌',
    auraRings: 4, auraAnim: 'vfast',
    titleColor: '#6fc3f0',
    particles: 18,
  },
  { // 7 - Đại Thừa
    bgFrom: '#100a00', bgTo: '#201000',
    auraColor: '#ffe9a0', auraOpacity: 0.65, auraSize: 96,
    robeColor: '#100800', robeTrim: '#ffe9a0',
    crownEmoji: '☀',
    auraRings: 4, auraAnim: 'vfast',
    titleColor: '#ffe9a0',
    particles: 22,
  },
];

// ---- Spirit root overlay configs ----
const ROOT_OVERLAY = {
  jin:     { symbol: '⚔', color: '#f0d47a', glow: '#f0d47a', markPos: 'forehead' },
  mu:      { symbol: '🌿', color: '#56c46a', glow: '#56c46a', markPos: 'chest'    },
  shui:    { symbol: '💧', color: '#3a9fd5', glow: '#3a9fd5', markPos: 'hand'     },
  huo:     { symbol: '🔥', color: '#e05c1a', glow: '#e05c1a', markPos: 'forehead' },
  tu:      { symbol: '🗿', color: '#a07850', glow: '#a07850', markPos: 'chest'    },
  yin_yang:{ symbol: '☯',  color: '#c8a84b', glow: '#c8a84b', markPos: 'forehead' },
  hun:     { symbol: '🌌', color: '#7b68ee', glow: '#a855f7', markPos: 'forehead' },
};

// ---- Deterministic pseudo-random từ seed (để particle positions stable) ----
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ---- Build SVG portrait ----
export function buildPortraitSVG(G) {
  const realmIdx = Math.min(G.realmIdx || 0, 7);
  const cfg = REALM_PORTRAIT[realmIdx];
  const root = ROOT_OVERLAY[G.spiritRoot] || ROOT_OVERLAY['shui'];

  const W = 160, H = 200;
  const cx = W / 2, cy = H / 2 - 10;

  // Aura animation duration
  const animDur = { slow: '4s', medium: '2.8s', fast: '1.8s', vfast: '1.2s' }[cfg.auraAnim];

  // Build aura rings
  const rings = [];
  for (let i = 0; i < cfg.auraRings; i++) {
    const r = cfg.auraSize + i * 10;
    const op = cfg.auraOpacity - i * 0.08;
    const dur = parseFloat(animDur) + i * 0.4 + 's';
    rings.push(`
      <circle cx="${cx}" cy="${cy + 15}" r="${r / 2}" fill="none"
        stroke="${cfg.auraColor}" stroke-width="${2 - i * 0.4}"
        opacity="${Math.max(0.05, op)}">
        <animate attributeName="r"
          values="${r / 2};${r / 2 + 4};${r / 2}"
          dur="${dur}" repeatCount="indefinite"/>
        <animate attributeName="opacity"
          values="${Math.max(0.05, op)};${Math.max(0.02, op - 0.15)};${Math.max(0.05, op)}"
          dur="${dur}" repeatCount="indefinite"/>
      </circle>
    `);
  }

  // Particles xung quanh aura
  const rand = seededRand(realmIdx * 100 + (G.spiritRoot?.charCodeAt(0) || 0));
  const particles = [];
  for (let i = 0; i < cfg.particles; i++) {
    const angle = rand() * Math.PI * 2;
    const dist  = 38 + rand() * 28;
    const px    = cx + Math.cos(angle) * dist;
    const py    = (cy + 15) + Math.sin(angle) * dist * 0.7;
    const size  = 1 + rand() * 2.5;
    const delay = rand() * 3;
    const dur2  = 1.5 + rand() * 2 + 's';
    particles.push(`
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${size.toFixed(1)}"
        fill="${cfg.auraColor}" opacity="0">
        <animate attributeName="opacity"
          values="0;${0.4 + rand() * 0.4};0"
          dur="${dur2}" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/>
        <animate attributeName="cy"
          values="${py.toFixed(1)};${(py - 6 - rand() * 6).toFixed(1)};${py.toFixed(1)}"
          dur="${dur2}" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/>
      </circle>
    `);
  }

  // Robe silhouette (body)
  const robePoints = `
    M${cx},${cy + 22}
    C${cx - 30},${cy + 30} ${cx - 38},${cy + 55} ${cx - 42},${H - 4}
    L${cx + 42},${H - 4}
    C${cx + 38},${cy + 55} ${cx + 30},${cy + 30} ${cx},${cy + 22}Z
  `;

  // Head circle
  const headR = 28;
  const headY = cy - 18;

  // Hair (dark mass on top)
  const hairPath = `
    M${cx - headR - 2},${headY + 2}
    Q${cx - headR},${headY - headR - 8} ${cx},${headY - headR - 12}
    Q${cx + headR},${headY - headR - 8} ${cx + headR + 2},${headY + 2}
    Q${cx + headR - 2},${headY - 8} ${cx},${headY - 10}
    Q${cx - headR + 2},${headY - 8} ${cx - headR - 2},${headY + 2}Z
  `;

  // Eyes
  const eyeY = headY + 4;
  const eyeLX = cx - 9, eyeRX = cx + 9;

  // Crown symbol nếu có
  const crownSVG = cfg.crownEmoji ? `
    <text x="${cx}" y="${headY - headR - 14}" text-anchor="middle"
      font-size="14" opacity="0.9"
      style="filter:drop-shadow(0 0 4px ${cfg.auraColor})">${cfg.crownEmoji}</text>
  ` : '';

  // Spirit root mark (forehead hoặc chest)
  const markY = root.markPos === 'forehead' ? headY - 8 : cy + 6;
  const markX = root.markPos === 'hand' ? cx + 36 : cx;
  const rootMarkSVG = `
    <text x="${markX}" y="${markY}" text-anchor="middle"
      font-size="${root.markPos === 'forehead' ? 10 : 13}"
      opacity="0.85" style="filter:drop-shadow(0 0 6px ${root.glow})">
      ${root.symbol}
    </text>
  `;

  // Glow filter defs
  const filterId = `glow-${realmIdx}`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg-grad-${realmIdx}" cx="50%" cy="55%" r="60%">
      <stop offset="0%" stop-color="${cfg.bgTo}"/>
      <stop offset="100%" stop-color="${cfg.bgFrom}"/>
    </radialGradient>
    <radialGradient id="aura-grad-${realmIdx}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${cfg.auraColor}" stop-opacity="${cfg.auraOpacity + 0.1}"/>
      <stop offset="100%" stop-color="${cfg.auraColor}" stop-opacity="0"/>
    </radialGradient>
    <filter id="${filterId}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${filterId}-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg-grad-${realmIdx})" rx="12"/>

  <!-- Aura glow blob -->
  <ellipse cx="${cx}" cy="${cy + 20}" rx="55" ry="45"
    fill="url(#aura-grad-${realmIdx})">
    <animate attributeName="ry" values="45;52;45" dur="${animDur}" repeatCount="indefinite"/>
  </ellipse>

  <!-- Aura rings -->
  ${rings.join('')}

  <!-- Particles -->
  ${particles.join('')}

  <!-- Robe body -->
  <path d="${robePoints.replace(/\n\s+/g, ' ')}"
    fill="${cfg.robeColor}" stroke="${cfg.robeTrim}" stroke-width="1.2" opacity="0.95"/>
  <!-- Robe trim line -->
  <line x1="${cx}" y1="${cy + 22}" x2="${cx}" y2="${H - 4}"
    stroke="${cfg.robeTrim}" stroke-width="0.8" opacity="0.4"/>

  <!-- Group: head + face, với glow filter -->
  <g filter="url(#${filterId}-soft)">
    <!-- Neck -->
    <rect x="${cx - 7}" y="${headY + headR - 4}" width="14" height="14"
      fill="#c8a070" rx="4"/>

    <!-- Hair back -->
    <circle cx="${cx}" cy="${headY}" r="${headR + 3}"
      fill="#1a1010"/>

    <!-- Face -->
    <circle cx="${cx}" cy="${headY}" r="${headR}"
      fill="#d4a070"/>

    <!-- Hair front -->
    <path d="${hairPath.replace(/\n\s+/g, ' ')}"
      fill="#1a1010"/>

    <!-- Eyes -->
    <ellipse cx="${eyeLX}" cy="${eyeY}" rx="4" ry="4.5" fill="#0a0a10"/>
    <ellipse cx="${eyeRX}" cy="${eyeY}" rx="4" ry="4.5" fill="#0a0a10"/>
    <!-- Eye shine -->
    <circle cx="${eyeLX + 1.5}" cy="${eyeY - 1.5}" r="1.2" fill="white" opacity="0.8"/>
    <circle cx="${eyeRX + 1.5}" cy="${eyeY - 1.5}" r="1.2" fill="white" opacity="0.8"/>
    <!-- Eye glow color theo spirit root -->
    <ellipse cx="${eyeLX}" cy="${eyeY}" rx="3" ry="3.5"
      fill="${root.color}" opacity="0.3"/>
    <ellipse cx="${eyeRX}" cy="${eyeY}" rx="3" ry="3.5"
      fill="${root.color}" opacity="0.3"/>
  </g>

  <!-- Crown emoji -->
  ${crownSVG}

  <!-- Spirit root mark -->
  ${rootMarkSVG}

  <!-- Realm title bar ở dưới -->
  <rect x="8" y="${H - 28}" width="${W - 16}" height="20" rx="4"
    fill="rgba(0,0,0,0.5)" stroke="${cfg.auraColor}" stroke-width="0.8" stroke-opacity="0.5"/>
  <text x="${cx}" y="${H - 14}" text-anchor="middle"
    font-size="11" fill="${cfg.titleColor}" font-weight="bold"
    font-family="serif" letter-spacing="1">
    ${_getRealmName(G.realmIdx)} · Tầng ${G.stage}
  </text>
</svg>
  `.trim();
}

function _getRealmName(idx) {
  const names = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
  return names[Math.min(idx, 7)] || 'Luyện Khí';
}

// ---- Render portrait vào container ----
// Gọi từ render-core.js mỗi khi tab cultivate active hoặc realm/stage thay đổi
export function renderPortrait(G) {
  const el = document.getElementById('char-portrait');
  if (!el) return;

  // Chỉ re-render nếu realm/stage/spiritRoot thay đổi (tránh flicker mỗi tick)
  const key = `${G.realmIdx}-${G.stage}-${G.spiritRoot}`;
  if (el.dataset.key === key) return;
  el.dataset.key = key;

  el.innerHTML = buildPortraitSVG(G);
}
