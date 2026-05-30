// ============================================================
// ui/map-defs.js — Painted Scroll Map: defs library
// ------------------------------------------------------------
// Reusable SVG <defs> (filters, gradients, patterns, symbols)
// dùng chung cho Tầng 1/2/3 + helpers smoothPath, bezierFromWaypoints.
//
// ID prefix convention (tránh conflict toàn map):
//   m-filt-…   filter
//   m-grad-…   linear/radial gradient
//   m-pat-…    pattern (terrain fill)
//   m-sym-…    symbol (mountain, building, decorative)
//
// Cách dùng (ví dụ trong world-map.js):
//   import { MAP_DEFS, smoothPath, bezierFromWaypoints } from './map-defs.js';
//   const svg =
//     `<svg viewBox="0 0 700 520" xmlns="http://www.w3.org/2000/svg">` +
//     MAP_DEFS +                          // luôn đặt đầu
//     `<rect width="700" height="520" fill="url(#m-grad-parch)"/>` +
//     `<rect width="700" height="520" filter="url(#m-filt-grain)" opacity="0.7"/>` +
//     `<use href="#m-sym-mt-peak" x="120" y="40" width="32" height="28"/>` +
//     `</svg>`;
// ============================================================

// ─── 1. FILTERS ─────────────────────────────────────────────
const FILTERS = `
  <!-- Parchment grain (fine noise) -->
  <filter id="m-filt-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
    <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 0.30 0"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>

  <!-- Parchment paper texture (large pattern) -->
  <filter id="m-filt-paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="3" seed="3"/>
    <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.38  0 0 0 0 0.20  0 0 0 0.18 0"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>

  <!-- Coastline wobble (apply lên region polygons) -->
  <filter id="m-filt-coast" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="5"/>
    <feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>

  <!-- Ink bleed (cho stamps & calligraphy) -->
  <filter id="m-filt-ink" x="-20%" y="-20%" width="140%" height="140%">
    <feMorphology operator="dilate" radius="0.4"/>
    <feGaussianBlur stdDeviation="0.5"/>
    <feComposite in2="SourceGraphic" operator="over"/>
  </filter>

  <!-- Danger glow (cho trade route dangerLevel >= 4) -->
  <filter id="m-filt-danger" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="1.4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- Soft shadow under building icons -->
  <filter id="m-filt-soft" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="1.2"/>
  </filter>

  <!-- Region label drop shadow (ink-style halo) -->
  <filter id="m-filt-label" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur stdDeviation="0.6" result="b"/>
    <feColorMatrix in="b" values="0 0 0 0 0.95  0 0 0 0 0.87  0 0 0 0 0.72  0 0 0 0.8 0" result="halo"/>
    <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
`;

// ─── 2. GRADIENTS ───────────────────────────────────────────
const GRADIENTS = `
  <!-- Parchment base (warm cream) -->
  <linearGradient id="m-grad-parch" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#F2E0B8"/>
    <stop offset="45%" stop-color="#E6CA94"/>
    <stop offset="100%" stop-color="#CCAC7A"/>
  </linearGradient>

  <!-- Mountain rock face -->
  <linearGradient id="m-grad-mt-rock" x1="0" y1="0" x2="1" y2="0.7">
    <stop offset="0%" stop-color="#9A8060"/>
    <stop offset="100%" stop-color="#4A3A24"/>
  </linearGradient>

  <!-- Snow cap -->
  <linearGradient id="m-grad-mt-snow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFFFFF"/>
    <stop offset="100%" stop-color="#D5DAE0"/>
  </linearGradient>

  <!-- Volcano hot core -->
  <radialGradient id="m-grad-volcano" cx="0.5" cy="0.8" r="0.5">
    <stop offset="0%" stop-color="#F8C040"/>
    <stop offset="60%" stop-color="#C84020"/>
    <stop offset="100%" stop-color="#4A1808"/>
  </radialGradient>

  <!-- Water (sea/lake) -->
  <linearGradient id="m-grad-water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#7BA5B8"/>
    <stop offset="100%" stop-color="#4A6D80"/>
  </linearGradient>

  <!-- Ink stamps — 6 màu phe (warm cream contrast) -->
  <radialGradient id="m-grad-ink-chinh" cx="0.5" cy="0.5" r="0.6">
    <stop offset="0%" stop-color="#2A5890"/>
    <stop offset="100%" stop-color="#0A2848"/>
  </radialGradient>
  <radialGradient id="m-grad-ink-ma" cx="0.5" cy="0.5" r="0.6">
    <stop offset="0%" stop-color="#B82828"/>
    <stop offset="100%" stop-color="#6A0808"/>
  </radialGradient>
  <radialGradient id="m-grad-ink-trung" cx="0.5" cy="0.5" r="0.6">
    <stop offset="0%" stop-color="#208878"/>
    <stop offset="100%" stop-color="#0A4838"/>
  </radialGradient>
  <radialGradient id="m-grad-ink-hazard" cx="0.5" cy="0.5" r="0.6">
    <stop offset="0%" stop-color="#5A4858"/>
    <stop offset="100%" stop-color="#2A1828"/>
  </radialGradient>
  <radialGradient id="m-grad-ink-co-vuc" cx="0.5" cy="0.5" r="0.6">
    <stop offset="0%" stop-color="#6840A0"/>
    <stop offset="100%" stop-color="#281848"/>
  </radialGradient>
  <radialGradient id="m-grad-ink-gold" cx="0.5" cy="0.5" r="0.6">
    <stop offset="0%" stop-color="#B88028"/>
    <stop offset="100%" stop-color="#604008"/>
  </radialGradient>

  <!-- Region vignette mềm -->
  <radialGradient id="m-grad-vignette" cx="50%" cy="50%" r="65%">
    <stop offset="55%" stop-color="rgba(60,40,20,0)"/>
    <stop offset="100%" stop-color="rgba(60,40,20,0.55)"/>
  </radialGradient>

  <!-- Player marker glow -->
  <radialGradient id="m-grad-marker" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%" stop-color="#5EEAD4"/>
    <stop offset="100%" stop-color="rgba(20,80,70,0)"/>
  </radialGradient>
`;

// ─── 3. PATTERNS ────────────────────────────────────────────
const PATTERNS = `
  <!-- Ice cracks (Vĩnh Dạ) -->
  <pattern id="m-pat-ice" width="30" height="30" patternUnits="userSpaceOnUse">
    <path d="M15,0 L15,12 M5,15 L25,15 M10,8 L18,22" stroke="rgba(120,150,180,0.32)" stroke-width="0.5" fill="none"/>
    <circle cx="15" cy="15" r="1" fill="rgba(180,200,220,0.3)"/>
  </pattern>

  <!-- Ocean waves (2-layer) -->
  <pattern id="m-pat-ocean" width="40" height="20" patternUnits="userSpaceOnUse">
    <path d="M0,10 Q10,5 20,10 Q30,15 40,10" stroke="rgba(74,109,128,0.35)" stroke-width="0.7" fill="none"/>
    <path d="M0,16 Q10,11 20,16 Q30,21 40,16" stroke="rgba(123,165,184,0.28)" stroke-width="0.5" fill="none"/>
  </pattern>

  <!-- Ruins columns (Cổ Vực) -->
  <pattern id="m-pat-ruins" width="36" height="36" patternUnits="userSpaceOnUse">
    <rect x="6" y="20" width="2" height="10" fill="rgba(95,70,55,0.4)"/>
    <rect x="18" y="14" width="2" height="16" fill="rgba(95,70,55,0.4)"/>
    <rect x="28" y="22" width="2" height="8" fill="rgba(95,70,55,0.4)"/>
    <rect x="6" y="20" width="6" height="1.5" fill="rgba(95,70,55,0.5)"/>
    <rect x="16" y="14" width="6" height="1.5" fill="rgba(95,70,55,0.5)"/>
  </pattern>

  <!-- Forest dense -->
  <pattern id="m-pat-forest" width="22" height="22" patternUnits="userSpaceOnUse">
    <polygon points="11,4 16,16 6,16" fill="rgba(58,90,52,0.45)"/>
    <polygon points="4,14 8,22 0,22" fill="rgba(58,90,52,0.35)"/>
    <polygon points="18,14 22,22 14,22" fill="rgba(58,90,52,0.35)"/>
  </pattern>

  <!-- Dunes (sa mạc) -->
  <pattern id="m-pat-dunes" width="40" height="14" patternUnits="userSpaceOnUse">
    <path d="M0,12 Q10,4 20,12 Q30,4 40,12" stroke="rgba(150,110,55,0.35)" stroke-width="0.7" fill="none"/>
    <path d="M-20,8 Q-10,0 0,8 Q10,0 20,8" stroke="rgba(150,110,55,0.25)" stroke-width="0.5" fill="none"/>
  </pattern>

  <!-- Swamp -->
  <pattern id="m-pat-swamp" width="28" height="20" patternUnits="userSpaceOnUse">
    <ellipse cx="8" cy="10" rx="5" ry="2" fill="rgba(60,80,50,0.40)"/>
    <ellipse cx="20" cy="14" rx="4" ry="1.5" fill="rgba(60,80,50,0.32)"/>
    <circle cx="14" cy="6" r="1.2" fill="rgba(180,120,100,0.40)"/>
  </pattern>

  <!-- Land (subtle warm dots) -->
  <pattern id="m-pat-land" width="26" height="26" patternUnits="userSpaceOnUse">
    <circle cx="13" cy="13" r="0.9" fill="rgba(120,90,55,0.18)"/>
    <circle cx="3" cy="22" r="0.5" fill="rgba(120,90,55,0.12)"/>
    <circle cx="22" cy="4" r="0.5" fill="rgba(120,90,55,0.12)"/>
  </pattern>

  <!-- Mountain shading (cross-hatch nhẹ) -->
  <pattern id="m-pat-mountain" width="20" height="20" patternUnits="userSpaceOnUse">
    <line x1="0" y1="20" x2="20" y2="0" stroke="rgba(90,68,38,0.20)" stroke-width="0.8"/>
    <line x1="-5" y1="15" x2="15" y2="-5" stroke="rgba(90,68,38,0.10)" stroke-width="0.5"/>
  </pattern>
`;

// ─── 4. SYMBOLS — TERRAIN ───────────────────────────────────
const SYM_TERRAIN = `
  <!-- Single mountain peak -->
  <symbol id="m-sym-mt-peak" viewBox="-20 -25 40 35">
    <polygon points="-18,8 -8,-12 0,-22 8,-12 18,8" fill="#3C2A18" opacity="0.45"/>
    <polygon points="-14,8 0,-22 14,8" fill="url(#m-grad-mt-rock)"/>
    <polygon points="-14,8 0,-22 -2,-8 -8,2" fill="rgba(0,0,0,0.32)"/>
    <path d="M-6,-10 L-3,-14 L0,-22 L3,-14 L6,-10 L3,-8 L0,-12 L-3,-8 Z" fill="url(#m-grad-mt-snow)"/>
    <path d="M-14,8 Q-8,5 -3,8 Q2,11 8,7 Q12,9 14,8" stroke="rgba(40,28,16,0.6)" fill="none" stroke-width="0.8" stroke-linecap="round"/>
  </symbol>

  <!-- Mountain ridge (3 peaks horizontal) -->
  <symbol id="m-sym-mt-ridge" viewBox="-30 -20 60 30">
    <polygon points="-26,8 -16,-8 -6,4 4,-12 14,2 24,-6 28,8" fill="url(#m-grad-mt-rock)"/>
    <polygon points="-26,8 -16,-8 -8,4 -2,8" fill="rgba(0,0,0,0.25)"/>
    <polygon points="-16,-8 -14,-5 -18,-5" fill="url(#m-grad-mt-snow)"/>
    <polygon points="4,-12 6,-9 2,-9" fill="url(#m-grad-mt-snow)"/>
    <polygon points="24,-6 26,-3 22,-3" fill="url(#m-grad-mt-snow)"/>
    <path d="M-26,8 Q-10,6 6,8 Q20,9 28,8" stroke="rgba(40,28,16,0.6)" fill="none" stroke-width="0.8"/>
  </symbol>

  <!-- Twin peaks -->
  <symbol id="m-sym-mt-twin" viewBox="-25 -25 50 35">
    <polygon points="-22,8 -14,-6 -8,-18 -2,-6 4,8" fill="url(#m-grad-mt-rock)"/>
    <polygon points="-2,8 4,-6 10,-22 16,-6 22,8" fill="url(#m-grad-mt-rock)"/>
    <polygon points="-22,8 -14,-6 -10,2 -16,8" fill="rgba(0,0,0,0.3)"/>
    <polygon points="-2,8 4,-6 8,2 0,8" fill="rgba(0,0,0,0.3)"/>
    <polygon points="-11,-13 -8,-18 -5,-13 -8,-11" fill="url(#m-grad-mt-snow)"/>
    <polygon points="7,-17 10,-22 13,-17 10,-15" fill="url(#m-grad-mt-snow)"/>
  </symbol>

  <!-- Volcano with smoke -->
  <symbol id="m-sym-volcano" viewBox="-18 -28 36 36">
    <polygon points="-16,8 -6,-14 0,-18 6,-14 16,8" fill="#4A2818"/>
    <polygon points="-16,8 -6,-14 -2,-6 -10,4" fill="rgba(0,0,0,0.4)"/>
    <polygon points="-6,-14 0,-18 6,-14 0,-12" fill="url(#m-grad-volcano)"/>
    <path d="M0,-18 Q-3,-22 -1,-26 Q1,-30 -2,-34 Q-4,-37 0,-40"
          stroke="rgba(120,100,90,0.55)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </symbol>

  <!-- Single pine tree -->
  <symbol id="m-sym-pine" viewBox="-6 -16 12 18">
    <polygon points="0,-15 5,-4 -5,-4" fill="#2F4A2A"/>
    <polygon points="0,-11 4,-1 -4,-1" fill="#3A5A35"/>
    <polygon points="0,-7 4,2 -4,2" fill="#456A40"/>
    <rect x="-0.7" y="2" width="1.4" height="3" fill="#3A2818"/>
  </symbol>

  <!-- Forest cluster (5 trees layered) -->
  <symbol id="m-sym-forest" viewBox="-22 -18 44 24">
    <use href="#m-sym-pine" x="-14" y="2" transform="scale(0.7)"/>
    <use href="#m-sym-pine" x="-5" y="0" transform="scale(0.85)"/>
    <use href="#m-sym-pine" x="6" y="2" transform="scale(0.75)"/>
    <use href="#m-sym-pine" x="14" y="0" transform="scale(0.8)"/>
    <use href="#m-sym-pine" x="0" y="-3" transform="scale(0.9)"/>
  </symbol>

  <!-- Small island (đảo nhỏ giữa biển) -->
  <symbol id="m-sym-island" viewBox="-14 -8 28 16">
    <ellipse cx="0" cy="3" rx="13" ry="4" fill="rgba(120,90,60,0.55)"/>
    <ellipse cx="0" cy="3" rx="10" ry="3" fill="rgba(180,140,90,0.7)"/>
    <use href="#m-sym-pine" x="-5" y="0" transform="scale(0.5)"/>
    <use href="#m-sym-pine" x="4" y="1" transform="scale(0.55)"/>
  </symbol>
`;

// ─── 5. SYMBOLS — BUILDINGS (Tầng 3) ────────────────────────
const SYM_BUILDINGS = `
  <!-- Pagoda (sect gate) -->
  <symbol id="m-sym-pagoda" viewBox="-18 -28 36 36">
    <path d="M-18,-6 Q-14,-8 -10,-7 L10,-7 Q14,-8 18,-6 L14,-4 L-14,-4 Z" fill="#6E3018"/>
    <rect x="-10" y="-4" width="20" height="6" fill="#A87038" stroke="#3A1808" stroke-width="0.6"/>
    <path d="M-14,-14 Q-10,-16 -7,-15 L7,-15 Q10,-16 14,-14 L11,-12 L-11,-12 Z" fill="#6E3018"/>
    <rect x="-8" y="-12" width="16" height="6" fill="#A87038" stroke="#3A1808" stroke-width="0.6"/>
    <path d="M-10,-22 Q-7,-24 -5,-23 L5,-23 Q7,-24 10,-22 L8,-20 L-8,-20 Z" fill="#6E3018"/>
    <rect x="-6" y="-20" width="12" height="6" fill="#A87038" stroke="#3A1808" stroke-width="0.6"/>
    <rect x="-0.4" y="-28" width="0.8" height="5" fill="#3A1808"/>
    <circle cx="0" cy="-28" r="1.2" fill="#D4A030"/>
  </symbol>

  <!-- Market (chợ với mái và 2 lồng đèn) -->
  <symbol id="m-sym-market" viewBox="-14 -18 28 22">
    <rect x="-12" y="-4" width="24" height="6" fill="#8A5028" stroke="#3A1808" stroke-width="0.5"/>
    <path d="M-14,-4 L-10,-12 L10,-12 L14,-4 Z" fill="#A8302A" stroke="#3A1808" stroke-width="0.6"/>
    <rect x="-9" y="-3" width="2" height="5" fill="#2A1808"/>
    <rect x="7" y="-3" width="2" height="5" fill="#2A1808"/>
    <ellipse cx="-8" cy="-1" rx="1.5" ry="2.2" fill="#E84020"/>
    <ellipse cx="8" cy="-1" rx="1.5" ry="2.2" fill="#E84020"/>
  </symbol>

  <!-- Altar (cultivate spot / alchemy / array) -->
  <symbol id="m-sym-altar" viewBox="-10 -22 20 26">
    <rect x="-8" y="0" width="16" height="3" fill="#5A4828"/>
    <rect x="-5" y="-14" width="2" height="14" fill="#8A7048"/>
    <rect x="3" y="-14" width="2" height="14" fill="#8A7048"/>
    <rect x="-7" y="-16" width="14" height="2.5" fill="#5A4828"/>
    <ellipse cx="0" cy="-9" rx="1.5" ry="5" fill="rgba(80,160,140,0.6)"/>
    <ellipse cx="0" cy="-9" rx="0.7" ry="3" fill="rgba(180,240,220,0.8)"/>
  </symbol>

  <!-- Cave / dungeon -->
  <symbol id="m-sym-cave" viewBox="-12 -16 24 20">
    <path d="M-10,4 Q-12,-6 -7,-12 Q0,-16 7,-12 Q12,-6 10,4 Z" fill="#1A0A05"/>
    <path d="M-7,4 Q-9,-3 -5,-8 Q0,-11 5,-8 Q9,-3 7,4 Z" fill="#08040A"/>
    <polygon points="-3,-8 -2.5,-5 -3.5,-5" fill="#2A1810"/>
    <polygon points="2,-8 2.5,-5 1.5,-5" fill="#2A1810"/>
  </symbol>

  <!-- Herb (gather zone / secret herb) -->
  <symbol id="m-sym-herb" viewBox="-10 -14 20 18">
    <path d="M0,3 Q-6,-2 -8,-10" stroke="#3A5A28" stroke-width="1.2" fill="none"/>
    <path d="M0,3 Q6,-2 8,-10" stroke="#3A5A28" stroke-width="1.2" fill="none"/>
    <path d="M0,3 L0,-12" stroke="#3A5A28" stroke-width="1.2"/>
    <ellipse cx="-7" cy="-9" rx="2" ry="3" fill="#5A8A38" transform="rotate(-30 -7 -9)"/>
    <ellipse cx="7" cy="-9" rx="2" ry="3" fill="#5A8A38" transform="rotate(30 7 -9)"/>
    <ellipse cx="0" cy="-11" rx="2" ry="3" fill="#5A8A38"/>
    <circle cx="0" cy="-11" r="1" fill="#D04848"/>
  </symbol>

  <!-- Person silhouette (NPC) -->
  <symbol id="m-sym-person" viewBox="-6 -14 12 16">
    <circle cx="0" cy="-10" r="2.5" fill="#3A2818"/>
    <path d="M-4,2 L-3,-6 Q0,-8 3,-6 L4,2 Z" fill="#3A2818"/>
    <path d="M-3,-6 L-5,-2 M3,-6 L5,-2" stroke="#3A2818" stroke-width="1.2"/>
  </symbol>

  <!-- Crossed swords (hunt / boss zone) -->
  <symbol id="m-sym-swords" viewBox="-12 -12 24 24">
    <path d="M-10,-10 L8,8 M-8,-10 L10,8" stroke="#7A6850" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M10,-10 L-8,8 M8,-10 L-10,8" stroke="#7A6850" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="1.6" fill="#A87038"/>
  </symbol>

  <!-- Treasure chest -->
  <symbol id="m-sym-treasure" viewBox="-10 -10 20 16">
    <rect x="-8" y="-2" width="16" height="7" fill="#6E4818" stroke="#3A2008" stroke-width="0.6"/>
    <path d="M-8,-2 Q-8,-9 0,-9 Q8,-9 8,-2" fill="#8A5828" stroke="#3A2008" stroke-width="0.6"/>
    <rect x="-1" y="-2" width="2" height="3" fill="#D4A030"/>
    <circle cx="0" cy="-1" r="0.6" fill="#3A2008"/>
  </symbol>

  <!-- Auction (gavel + podium) -->
  <symbol id="m-sym-auction" viewBox="-12 -16 24 20">
    <rect x="-10" y="0" width="20" height="4" fill="#6E4818" stroke="#3A2008" stroke-width="0.5"/>
    <rect x="-7" y="-10" width="14" height="10" fill="#8A5828" stroke="#3A2008" stroke-width="0.5"/>
    <rect x="3" y="-14" width="9" height="2.5" fill="#A87038" transform="rotate(-25 3 -14)"/>
    <rect x="8" y="-15.5" width="3" height="4" fill="#5A3818" transform="rotate(-25 8 -15.5)"/>
  </symbol>

  <!-- Ghost market -->
  <symbol id="m-sym-ghost" viewBox="-10 -14 20 18">
    <path d="M-8,3 Q-9,-8 -4,-12 Q0,-14 4,-12 Q9,-8 8,3 Q5,1 4,3 Q1,1 0,3 Q-1,1 -4,3 Q-5,1 -8,3 Z"
          fill="rgba(180,210,220,0.7)" stroke="rgba(80,120,140,0.5)" stroke-width="0.5"/>
    <circle cx="-2.5" cy="-6" r="1" fill="#1A2A3A"/>
    <circle cx="2.5" cy="-6" r="1" fill="#1A2A3A"/>
  </symbol>

  <!-- Lock indicator (góc trên phải của locked location) -->
  <symbol id="m-sym-lock" viewBox="-5 -7 10 12">
    <rect x="-3.5" y="-1" width="7" height="5" rx="0.6" fill="#3A2818" stroke="#0A0805" stroke-width="0.4"/>
    <path d="M-2.5,-1 V-3.5 Q-2.5,-6 0,-6 Q2.5,-6 2.5,-3.5 V-1" stroke="#3A2818" stroke-width="0.9" fill="none"/>
    <circle cx="0" cy="1.5" r="0.7" fill="#D4A030"/>
  </symbol>

  <!-- Secret/special glow (cho secret_gather, mystery) -->
  <symbol id="m-sym-glow" viewBox="-15 -15 30 30">
    <circle r="12" fill="none" stroke="#D4A030" stroke-width="0.6" opacity="0.45" stroke-dasharray="2,2">
      <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.45;0.15;0.45" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle r="8" fill="none" stroke="#D4A030" stroke-width="0.4" opacity="0.6"/>
  </symbol>

  <!-- "Hiện tại" marker — sao đỏ nhỏ kèm chỉ vị trí player -->
  <symbol id="m-sym-here" viewBox="-7 -7 14 14">
    <circle r="5.5" fill="#A82828" opacity="0.6">
      <animate attributeName="r" values="5.5;7;5.5" dur="1.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <polygon points="0,-4 1.2,-1.3 4,-1.3 1.8,0.5 2.6,3.2 0,1.6 -2.6,3.2 -1.8,0.5 -4,-1.3 -1.2,-1.3" fill="#F8E0B8" stroke="#5A0810" stroke-width="0.3"/>
  </symbol>

  <!-- Torii / village exit gate (simpler than pagoda) -->
  <symbol id="m-sym-gate" viewBox="-12 -16 24 20">
    <rect x="-10" y="-4" width="20" height="2.5" fill="#8A2820"/>
    <rect x="-11" y="-7" width="22" height="3" fill="#A82820" stroke="#3A0808" stroke-width="0.4"/>
    <path d="M-12,-12 L-9,-7 L9,-7 L12,-12 Z" fill="#8A2820" stroke="#3A0808" stroke-width="0.4"/>
    <rect x="-8" y="-4" width="2.5" height="8" fill="#5A1808"/>
    <rect x="5.5" y="-4" width="2.5" height="8" fill="#5A1808"/>
  </symbol>

  <!-- Well (giếng nước) — village landmark -->
  <symbol id="m-sym-well" viewBox="-8 -12 16 16">
    <ellipse cx="0" cy="3" rx="7" ry="1.5" fill="#3A2818" opacity="0.4"/>
    <rect x="-6" y="-2" width="12" height="6" fill="#6A5028" stroke="#2A1808" stroke-width="0.4"/>
    <ellipse cx="0" cy="-2" rx="6" ry="1.5" fill="#1A0808"/>
    <rect x="-5.5" y="-9" width="1.2" height="7" fill="#3A2818"/>
    <rect x="4.3" y="-9" width="1.2" height="7" fill="#3A2818"/>
    <rect x="-6" y="-10" width="12" height="1.2" fill="#5A3818"/>
  </symbol>

  <!-- Lantern (ngọn đèn) -->
  <symbol id="m-sym-lantern" viewBox="-5 -12 10 14">
    <rect x="-0.6" y="-12" width="1.2" height="3" fill="#3A2818"/>
    <path d="M0,-9 L4,-7 L4,-2 Q4,0 0,1 Q-4,0 -4,-2 L-4,-7 Z" fill="#E84020" stroke="#3A0808" stroke-width="0.4"/>
    <rect x="-3" y="-6" width="6" height="0.5" fill="#3A0808"/>
    <rect x="-3" y="-3" width="6" height="0.5" fill="#3A0808"/>
  </symbol>
`;

// ─── 6. SYMBOLS — DECORATIVE ────────────────────────────────
const SYM_DECOR = `
  <!-- Cloud swirl 如意 motif -->
  <symbol id="m-sym-cloud" viewBox="-32 -10 64 20">
    <path d="M-30,2 Q-22,-8 -14,-3 Q-8,-10 0,-5 Q8,-11 14,-4 Q20,-9 30,-1"
          stroke="#A88438" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.75"/>
    <path d="M-22,-3 Q-19,-1 -22,2 Q-25,5 -22,7"
          stroke="#A88438" stroke-width="1" fill="none" opacity="0.65"/>
    <path d="M14,-4 Q17,-2 14,1 Q11,4 14,6"
          stroke="#A88438" stroke-width="1" fill="none" opacity="0.65"/>
    <path d="M0,-5 Q3,-3 0,-1" stroke="#A88438" stroke-width="0.9" fill="none" opacity="0.6"/>
  </symbol>

  <!-- Compass rose chữ Hán 4 hướng -->
  <symbol id="m-sym-compass" viewBox="-30 -30 60 60">
    <circle r="26" fill="rgba(248,228,180,0.4)" stroke="#7A5018" stroke-width="0.9"/>
    <circle r="20" fill="none" stroke="#7A5018" stroke-width="0.5"/>
    <polygon points="0,-22 3,-3 0,0 -3,-3" fill="#8A2810"/>
    <polygon points="0,22 3,3 0,0 -3,3" fill="#3A1808"/>
    <polygon points="-22,0 -3,-3 0,0 -3,3" fill="#3A1808"/>
    <polygon points="22,0 3,-3 0,0 3,3" fill="#3A1808"/>
    <text x="0" y="-13" text-anchor="middle" font-size="6.5" fill="#3A1808" font-family="'STSong','SimSun',serif" font-weight="bold">北</text>
    <text x="0" y="18" text-anchor="middle" font-size="6.5" fill="#3A1808" font-family="'STSong','SimSun',serif" font-weight="bold">南</text>
    <text x="-14" y="2.5" text-anchor="middle" font-size="6.5" fill="#3A1808" font-family="'STSong','SimSun',serif" font-weight="bold">西</text>
    <text x="14" y="2.5" text-anchor="middle" font-size="6.5" fill="#3A1808" font-family="'STSong','SimSun',serif" font-weight="bold">東</text>
  </symbol>

  <!-- Caravan diamond (trade route waypoint marker) -->
  <symbol id="m-sym-caravan" viewBox="-4 -4 8 8">
    <polygon points="0,-3 3,0 0,3 -3,0" fill="#8A6020"/>
    <polygon points="0,-2 2,0 0,2 -2,0" fill="#D4A040"/>
  </symbol>

  <!-- Scale bar (decorative) -->
  <symbol id="m-sym-scalebar" viewBox="0 0 80 14">
    <rect x="0" y="4" width="80" height="3" fill="rgba(60,40,20,0.6)" stroke="#3A2818" stroke-width="0.4"/>
    <rect x="0" y="4" width="20" height="3" fill="rgba(255,240,210,0.7)"/>
    <rect x="40" y="4" width="20" height="3" fill="rgba(255,240,210,0.7)"/>
    <text x="40" y="13" text-anchor="middle" font-size="5" fill="#3A2818" font-family="serif">百 里</text>
  </symbol>
`;

// ─── 7. EXPORT ──────────────────────────────────────────────

/**
 * Toàn bộ defs (filters + gradients + patterns + symbols).
 * Inject vào đầu mỗi map SVG. IDs đã prefix `m-` nên unique giữa các tầng.
 */
export const MAP_DEFS = `<defs>${FILTERS}${GRADIENTS}${PATTERNS}${SYM_TERRAIN}${SYM_BUILDINGS}${SYM_DECOR}</defs>`;

// ─── 8. HELPERS ─────────────────────────────────────────────

/**
 * Catmull-Rom interpolation → SVG path "d" string cho closed polygon.
 * Smooth coastline mà không phá data layer.
 *
 * @param {string} pointsStr  — "x1,y1 x2,y2 …"
 * @param {number} tension    — 0 (góc cứng) → 1 (rất cong). Default 0.5.
 * @param {boolean} closed    — true (default) cho region, false cho path mở.
 * @returns {string} SVG path d-attribute
 */
export function smoothPath(pointsStr, tension = 0.5, closed = true) {
  const pts = String(pointsStr).trim().split(/\s+/).map(p => p.split(',').map(Number));
  if (pts.length < 2) return '';
  const n = pts.length;
  let d = `M${pts[0][0]},${pts[0][1]}`;

  const idx = (i) => {
    if (closed) return ((i % n) + n) % n;
    return Math.max(0, Math.min(n - 1, i));
  };

  const lastIter = closed ? n : n - 1;
  for (let i = 0; i < lastIter; i++) {
    const p0 = pts[idx(i - 1)];
    const p1 = pts[idx(i)];
    const p2 = pts[idx(i + 1)];
    const p3 = pts[idx(i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0]},${p2[1]}`;
  }
  return closed ? (d + ' Z') : d;
}

/**
 * Convert array of waypoints → smooth bezier SVG path (open path).
 * Dùng cho trade routes (TRADE_ROUTES.waypoints).
 *
 * @param {Array<[number,number]>} wps — [[x,y], …]
 * @param {number} tension              — 0.5 default
 * @returns {string} SVG path d
 */
export function bezierFromWaypoints(wps, tension = 0.5) {
  if (!wps || wps.length < 2) return '';
  if (wps.length === 2) return `M${wps[0][0]},${wps[0][1]} L${wps[1][0]},${wps[1][1]}`;
  const ptsStr = wps.map(p => `${p[0]},${p[1]}`).join(' ');
  return smoothPath(ptsStr, tension, false);
}

/**
 * Style mapping cho trade routes theo terrain.
 */
export const ROUTE_STYLE = {
  land:        { color: '#7A5018', dash: '3,4',  width: 1.0 },
  sea:         { color: '#3A6890', dash: '2,5',  width: 1.0 },
  mountain:    { color: '#5A4828', dash: '4,3',  width: 0.9 },
  underground: { color: '#583878', dash: '1,4',  width: 0.8 },
};

/**
 * Render 1 trade route → SVG fragment.
 * Animation: stroke-dashoffset (đường nét nhịp di chuyển) + animateMotion (caravan trail particle).
 *
 * @param {Object} route   — { id, waypoints, terrain, active, dangerLevel, name }
 * @param {Object} opts    — { animate?: boolean, idPrefix?: string, particle?: boolean }
 * @returns {string} SVG <g> fragment
 */
export function renderTradeRoute(route, opts = {}) {
  const animate  = opts.animate !== false;
  const particle = opts.particle !== false && route.active;
  const idPrefix = opts.idPrefix || 'tr';
  const style    = ROUTE_STYLE[route.terrain] || ROUTE_STYLE.land;
  const opacity  = route.active ? 0.78 : 0.32;
  const dangerFilter = route.dangerLevel >= 4 ? 'filter="url(#m-filt-danger)"' : '';
  const d        = bezierFromWaypoints(route.waypoints, 0.5);
  const pathId   = `${idPrefix}-${route.id}-path`;

  const dashAnim = animate && route.active
    ? `<animate attributeName="stroke-dashoffset" from="0" to="-200" dur="${8 + (route.dangerLevel || 0) * 0.5}s" repeatCount="indefinite"/>`
    : '';

  // Caravan particle moving dọc path (animateMotion <mpath>)
  // Travel duration: 12s base, +1s per dangerLevel (route nguy hiểm đi chậm hơn)
  const travelDur = 12 + (route.dangerLevel || 0) * 1;
  const particleSvg = animate && particle
    ? `<g class="m-route-particle">` +
        `<use href="#m-sym-caravan" x="-4" y="-4" width="8" height="8" opacity="${opacity + 0.15}">` +
          `<animateMotion dur="${travelDur}s" repeatCount="indefinite" rotate="auto">` +
            `<mpath href="#${pathId}"/>` +
          `</animateMotion>` +
        `</use>` +
      `</g>`
    : '';

  // Native browser tooltip (route name + danger + terrain)
  const dangerLabel = route.dangerLevel >= 4 ? ' ⚠ Nguy hiểm cao' : route.dangerLevel >= 2 ? ' (Có rủi ro)' : '';
  const inactiveLabel = route.active ? '' : ' — Đường cổ phế tích';
  const tooltipText = (route.name || route.id) + dangerLabel + inactiveLabel + ` · ${route.terrain}`;

  return (
    `<g class="m-trade-route" data-route="${route.id}" data-danger="${route.dangerLevel || 0}" pointer-events="visiblePainted">` +
      `<title>${tooltipText}</title>` +
      `<path id="${pathId}" d="${d}" fill="none" stroke="${style.color}" stroke-width="${style.width}"` +
        ` stroke-dasharray="${style.dash}" opacity="${opacity}" ${dangerFilter}>${dashAnim}</path>` +
      particleSvg +
    `</g>`
  );
}

/**
 * Render parchment background layers (3-layer: gradient + grain + paper).
 * @param {number} w viewport width
 * @param {number} h viewport height
 */
export function parchmentBackground(w, h) {
  return (
    `<rect width="${w}" height="${h}" fill="url(#m-grad-parch)"/>` +
    `<rect width="${w}" height="${h}" filter="url(#m-filt-grain)" opacity="0.7" pointer-events="none"/>` +
    `<rect width="${w}" height="${h}" filter="url(#m-filt-paper)" opacity="0.5" pointer-events="none"/>`
  );
}

/**
 * Render cloud border (4 cạnh, có drift animation tùy chọn).
 * Adaptive với viewport — w >= 600 dùng 3 segments mỗi cạnh, w < 600 dùng 2 segments.
 * @param {number} w viewport width
 * @param {number} h viewport height
 * @param {boolean} animate
 * @param {string} idPrefix — unique prefix để tránh ID conflict khi nhiều map đồng thời
 */
export function cloudBorder(w, h, animate = true, idPrefix = 'm-cloud') {
  const wAnim = (id, delay) => animate ? `
    <animateTransform href="#${id}" attributeName="transform" attributeType="XML"
      type="translate" values="0,0; 8,0; 0,0; -8,0; 0,0" dur="60s" begin="${delay}s" repeatCount="indefinite" additive="sum"/>` : '';

  const compact = w < 600;
  // Cloud segment widths scale theo viewport
  const segW    = compact ? Math.floor((w - 60) / 2) : 180;
  const segLast = compact ? Math.floor((w - 60) / 2) : 220;
  const cloudY  = 14, cloudH = 32;
  const botY    = h - 44;

  // Top edge — 2 or 3 segments tùy width
  const topSegs = compact
    ? [{ id:`${idPrefix}-top-1`, x:20,                width:segW },
       { id:`${idPrefix}-top-2`, x:w - 20 - segLast,  width:segLast }]
    : [{ id:`${idPrefix}-top-1`, x:20,                width:segW },
       { id:`${idPrefix}-top-2`, x:240,               width:segW },
       { id:`${idPrefix}-top-3`, x:w - 20 - segLast,  width:segLast }];

  const botSegs = compact
    ? [{ id:`${idPrefix}-bot-1`, x:20,                width:segW },
       { id:`${idPrefix}-bot-2`, x:w - 20 - segLast,  width:segLast }]
    : [{ id:`${idPrefix}-bot-1`, x:20,                width:segW },
       { id:`${idPrefix}-bot-2`, x:240,               width:segW },
       { id:`${idPrefix}-bot-3`, x:w - 20 - segLast,  width:segLast }];

  const top = topSegs.map(s => `<g id="${s.id}" class="m-cloud-seg"><use href="#m-sym-cloud" x="${s.x}" y="${cloudY}" width="${s.width}" height="${cloudH}"/></g>`).join('');
  const bot = botSegs.map(s => `<g id="${s.id}" class="m-cloud-seg"><use href="#m-sym-cloud" x="${s.x}" y="${botY}" width="${s.width}" height="${cloudH}"/></g>`).join('');

  // Left/right edges (rotated) — single segment, length theo height
  const sideW = Math.min(180, h - 40);
  const leftId  = `${idPrefix}-left`;
  const rightId = `${idPrefix}-right`;
  const left  = `<g id="${leftId}" class="m-cloud-seg" transform="translate(28,${h/2}) rotate(90)"><use href="#m-sym-cloud" x="${-sideW/2}" y="-12" width="${sideW}" height="${cloudH}"/></g>`;
  const right = `<g id="${rightId}" class="m-cloud-seg" transform="translate(${w - 28},${h/2}) rotate(-90)"><use href="#m-sym-cloud" x="${-sideW/2}" y="-12" width="${sideW}" height="${cloudH}"/></g>`;

  const anims = animate ? (
    topSegs.map((s, i) => wAnim(s.id, i * 6)).join('') +
    botSegs.map((s, i) => wAnim(s.id, i * 6 + 3)).join('')
  ) : '';

  return `<g class="m-cloud-border" pointer-events="none">${top}${bot}${left}${right}${anims}</g>`;
}

/**
 * Render aged spots (vết ố giấy cũ).
 * Deterministic — luôn cùng vị trí, không random per-render.
 */
export function agedSpots(w, h) {
  const spots = [
    [80, 120, 35, 22], [620, 80, 40, 18], [280, 480, 50, 25],
    [540, 320, 28, 15], [180, 380, 25, 12], [420, 130, 30, 18],
  ];
  return `<g class="m-aged-spots" pointer-events="none" opacity="0.18">` +
    spots.map(([x, y, rx, ry]) => {
      // Only render spots inside viewport
      if (x > w || y > h) return '';
      return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#8A6028"/>`;
    }).join('') +
    `</g>`;
}

/**
 * Render vignette mềm (radial gradient mask).
 */
export function vignette(w, h) {
  return `<rect width="${w}" height="${h}" fill="url(#m-grad-vignette)" pointer-events="none"/>`;
}

/**
 * Render sect/region stamp (con dấu chữ Hán).
 * @param {Object} cfg — { x, y, chName, name, inkGrad, rotation, size, name }
 *   inkGrad: 'chinh' | 'ma' | 'trung' | 'hazard' | 'co-vuc' | 'gold'
 */
export function renderStamp(cfg) {
  const x = cfg.x, y = cfg.y;
  const ch = cfg.chName || '';
  const ink = `m-grad-ink-${cfg.inkGrad || 'chinh'}`;
  const rot = cfg.rotation ?? ((cfg.x + cfg.y) % 7 - 3); // pseudo-random từ x,y
  const sz = cfg.size || 22;
  const half = sz;
  const innerHalf = sz - 3;
  const fs = sz * 1.0;

  return (
    `<g class="m-stamp" data-stamp="${cfg.name || ''}" transform="translate(${x},${y}) rotate(${rot})" filter="url(#m-filt-ink)">` +
      `<rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="2"` +
        ` fill="url(#${ink})" stroke="rgba(40,16,8,0.85)" stroke-width="0.6"/>` +
      `<rect x="${-innerHalf}" y="${-innerHalf}" width="${innerHalf * 2}" height="${innerHalf * 2}" fill="none"` +
        ` stroke="rgba(248,228,180,0.85)" stroke-width="0.5"/>` +
      `<text x="0" y="${sz * 0.32}" text-anchor="middle" font-size="${fs}"` +
        ` fill="#F0E0B8" font-family="'Noto Serif SC','STSong','SimSun',serif" font-weight="900">${ch}</text>` +
    `</g>`
  );
}
