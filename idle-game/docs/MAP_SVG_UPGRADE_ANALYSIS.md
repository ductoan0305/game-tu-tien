# MAP SVG UPGRADE — Phân Tích Chuyên Sâu & Cách Làm

> **Mục đích:** đánh giá chất lượng SVG map hiện tại so với mục tiêu "Painted Scroll Map" trong `WORLD_MAP_DESIGN.md` (mục 8), liệt kê kỹ thuật SVG nâng cao và roadmap thi công.
> **File liên quan:** `js/ui/world-map.js`, `js/ui/map-data.js`, `js/ui/starter-village.js`, `css/map.css`.

---

## 1. AUDIT HIỆN TRẠNG

### 1.1 Tầng 1 — Nhân Giới Toàn Đồ (`_buildNhanGioiSVG`)

| Thành phần | Hiện trạng | Vấn đề |
|---|---|---|
| Background | `radialGradient #0b1224 → #030710` | **Sci-fi tối**, không phải giấy cũ. WORLD_MAP_DESIGN yêu cầu parchment `#E8D5A3 + feTurbulence`. |
| Region polygon | Solid fill + pattern lines/dots | Cạnh là **đường thẳng cứng** giữa 10 điểm — coastline thật phải có wobble. |
| Mountain icon | 3 polygon (triangle + face + snow) | Quá đơn giản. Tất cả đều giống nhau → bản đồ trông cơ học. |
| Forest icon | 3 ellipse + 1 rect trunk | 1 cây đơn lẻ, không phải cụm rừng. |
| Cloud border | 4 cluster gồm 5 circle low-opacity ở 4 góc | Thiếu motif vân mây Trung Hoa (如意 swirl). |
| Stamps | Rect chữ Hán + tên Việt | OK nhưng cứng — border quá vuông vắn, không có hiệu ứng "ấn mộc" (ink bleed, lệch nhẹ). |
| Trade routes | **Không có**. Chỉ 3 river dashed ở Khuyết Vực. | Tầng 1 hoàn toàn thiếu đường giao thương dotted nối các vùng. |
| Filters | `feGaussianBlur` glow + radial fade | Không dùng `feTurbulence`, `feDisplacementMap`, `feColorMatrix sepia`. |
| Compass | Ring + 2 lines + 1 chữ N | Nhỏ, mờ, không có cảm giác la bàn cổ. |
| Stars | 60 circles ngẫu nhiên trên nền tối | **Sai concept** — parchment không có sao. Đây là vũ trụ chứ không phải bản đồ. |
| Animation | 1 marker pulse | OK nhưng đơn lẻ. |

### 1.2 Tầng 2 — Khuyết Vực Territory (`_buildKhuyetVucSVG`)

Tốt hơn Tầng 1 một chút (có nhiều pattern hơn, có rivers), nhưng vẫn cùng vấn đề:
- Background `#0c1422 → #040810` (dark space tone, không phải giấy)
- Pattern `kvp-mountain` = 2 diagonal lines — không phải texture mountain thật
- Forest cluster có nhiều điểm hơn nhưng dùng cùng 1 sprite tiny
- Stars 40 circles — **không nên có trên painted scroll**
- Stamp uses `feGaussianBlur` glow → giống neon hơn là mực Tàu

### 1.3 Tầng 3 — Territory Interior (`_renderTier2Territory`)

**Đây là chỗ tệ nhất — vẫn là node map cũ:**
```js
'<circle cx="' + loc.x + '" cy="' + loc.y + '" r="24" ...' />
'<text ...>' + loc.emoji + '</text>'   // 🏯 ⚔ 🏮 — emoji literal
```

- Mỗi địa điểm = 1 circle r=24 + 1 emoji text. **Không có building/icon SVG**.
- Background = CSS gradient từ `interior.bg` (vd `linear-gradient(160deg,#041828 0%,#082840 50%,#031220 100%)`) — không phải parchment.
- Không có dotted path nối các locations.
- Không có terrain decor (ngoại trừ `_buildTerritoryTerrainDecor` cần kiểm tra riêng).
- **Vi phạm rule "Không emoji trong SVG map mới"** (8.4 WORLD_MAP_DESIGN.md).

### 1.4 Gap matrix so với WORLD_MAP_DESIGN.md §8

| Yêu cầu spec | Tầng 1 | Tầng 2 | Tầng 3 |
|---|:---:|:---:|:---:|
| Parchment background (feTurbulence) | ❌ | ❌ | ❌ |
| Terrain illustrations đa dạng | ⚠ basic | ⚠ basic | ❌ |
| Cloud border (vân mây swirl) | ⚠ cluster cơ bản | ⚠ cluster cơ bản | ❌ |
| Con dấu chữ Hán theo phe | ✅ có (nhưng cứng) | ✅ có (nhưng cứng) | ❌ |
| Location labels trên SVG | ✅ | ✅ | ✅ |
| Dotted trade routes | ❌ | ⚠ 3 rivers | ❌ |
| Không emoji | ✅ | ✅ | ❌ **VI PHẠM** |
| Reusable `<symbol>` | ❌ | ❌ | ❌ |
| Không hard borders (terrain phân vùng) | ❌ stroke đậm | ❌ stroke đậm | ❌ |

**Kết luận:** SVG hiện tại đang ở style "node map sci-fi" thế hệ cũ. Để chạm đến Painted Scroll như spec, cần **rewrite gần như toàn bộ render layer** (không phải data layer — data đã sẵn sàng).

---

## 2. KỸ THUẬT SVG NÂNG CAO CẦN ÁP DỤNG

### 2.1 Filter library (đặt 1 lần trong `<defs>` global)

```xml
<!-- Parchment paper: noise + sepia -->
<filter id="f-parchment" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
  <feColorMatrix values="0 0 0 0 0.85
                          0 0 0 0 0.73
                          0 0 0 0 0.55
                          0 0 0 0.12 0"/>
  <feComposite in2="SourceGraphic" operator="in"/>
  <feBlend in="SourceGraphic" mode="multiply"/>
</filter>

<!-- Coastline wobble (apply lên polygon land/sea) -->
<filter id="f-coast-wobble">
  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3"/>
  <feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/>
</filter>

<!-- Ink bleed (cho stamps & calligraphy) -->
<filter id="f-ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
  <feMorphology operator="dilate" radius="0.4"/>
  <feGaussianBlur stdDeviation="0.6"/>
  <feComposite in2="SourceGraphic" operator="over"/>
</filter>

<!-- Aged/sepia overlay toàn map -->
<filter id="f-aged">
  <feColorMatrix type="matrix"
    values="0.85 0.20 0.06 0 0
            0.30 0.75 0.10 0 0
            0.20 0.30 0.55 0 0
            0    0    0    1 0"/>
</filter>

<!-- Worn edge mask (vignette mềm, khác với rectangle hard) -->
<filter id="f-worn-edge">
  <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3"/>
  <feDisplacementMap in="SourceGraphic" scale="3"/>
</filter>
```

**Hiệu ứng:** giấy cũ có grain thật, coastline gợn sóng tự nhiên, stamp có viền mực thấm.

### 2.2 Gradient library

```xml
<!-- Parchment base (gold-cream) -->
<linearGradient id="g-parch-base" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#F0DDB0"/>
  <stop offset="45%" stop-color="#E5C994"/>
  <stop offset="100%" stop-color="#C8A876"/>
</linearGradient>

<!-- Mountain rock face (light → shadow) -->
<linearGradient id="g-mt-rock" x1="0" y1="0" x2="1" y2="0.6">
  <stop offset="0%" stop-color="#A89878"/>
  <stop offset="100%" stop-color="#564838"/>
</linearGradient>

<!-- Snow cap -->
<linearGradient id="g-mt-snow" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#FFFFFF"/>
  <stop offset="100%" stop-color="#D8DCE5"/>
</linearGradient>

<!-- Water (sea/lake) -->
<linearGradient id="g-water" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#7BA5B8"/>
  <stop offset="100%" stop-color="#4A6D80"/>
</linearGradient>

<!-- Ice (Vĩnh Dạ) -->
<linearGradient id="g-ice" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#E8F0F8"/>
  <stop offset="100%" stop-color="#A8B8C8"/>
</linearGradient>

<!-- Stamp red (ấn mộc Ma Đạo) -->
<radialGradient id="g-stamp-ma" cx="0.5" cy="0.5" r="0.6">
  <stop offset="0%" stop-color="#A82020"/>
  <stop offset="100%" stop-color="#6B1010"/>
</radialGradient>
```

### 2.3 Symbol library (REUSABLE — đây là điểm chính)

Thay vì inline mỗi mountain/forest/building, define trong `<defs>` rồi `<use href="#sym-...">`:

```xml
<!-- ===== MOUNTAINS (4 variants) ===== -->
<symbol id="sym-mt-peak" viewBox="-20 -25 40 35">
  <!-- Back ridge shadow -->
  <polygon points="-18,8 -8,-12 0,-22 8,-12 18,8" fill="#3C2E20" opacity="0.5"/>
  <!-- Main face with gradient -->
  <polygon points="-14,8 0,-22 14,8" fill="url(#g-mt-rock)"/>
  <!-- Dark shadow side -->
  <polygon points="-14,8 0,-22 -2,-8 -8,2" fill="rgba(0,0,0,0.32)"/>
  <!-- Snow cap with notch -->
  <path d="M-6,-10 L-3,-14 L0,-22 L3,-14 L6,-10 L3,-8 L0,-12 L-3,-8 Z"
        fill="url(#g-mt-snow)"/>
  <!-- Base contour line (sumi-e style ink stroke) -->
  <path d="M-14,8 Q-8,5 -3,8 Q2,11 8,7 Q12,9 14,8" stroke="rgba(40,30,20,0.55)"
        fill="none" stroke-width="0.8" stroke-linecap="round"/>
</symbol>

<symbol id="sym-mt-twin" viewBox="-25 -25 50 35">
  <!-- 2 peaks side by side, overlap nhẹ -->
  <use href="#sym-mt-peak" x="-8" y="0" transform="scale(0.85)"/>
  <use href="#sym-mt-peak" x="8" y="2" transform="scale(0.95)"/>
</symbol>

<symbol id="sym-mt-ridge" viewBox="-30 -20 60 30">
  <!-- Dãy núi dài 3 đỉnh -->
  <polygon points="-26,8 -16,-8 -6,4 4,-12 14,2 24,-6 28,8" fill="url(#g-mt-rock)"/>
  <polygon points="-16,-8 -14,-5 -18,-5" fill="url(#g-mt-snow)"/>
  <polygon points="4,-12 6,-9 2,-9" fill="url(#g-mt-snow)"/>
  <polygon points="24,-6 26,-3 22,-3" fill="url(#g-mt-snow)"/>
  <path d="M-26,8 Q-10,6 6,8 Q20,9 28,8" stroke="rgba(40,30,20,0.5)" fill="none" stroke-width="0.8"/>
</symbol>

<symbol id="sym-volcano" viewBox="-18 -22 36 30">
  <polygon points="-16,8 -6,-14 0,-18 6,-14 16,8" fill="#4A2818"/>
  <polygon points="-6,-14 0,-18 6,-14 0,-12" fill="#8A2810" opacity="0.6"/>
  <!-- Smoke wisp -->
  <path d="M0,-18 Q-2,-22 0,-26 Q2,-30 0,-34"
        stroke="rgba(120,100,90,0.45)" stroke-width="1.5" fill="none"/>
</symbol>

<!-- ===== FOREST (clusters) ===== -->
<symbol id="sym-pine" viewBox="-6 -16 12 18">
  <polygon points="0,-15 5,-4 -5,-4" fill="#2F4A2A"/>
  <polygon points="0,-11 4,-1 -4,-1" fill="#3A5A35"/>
  <polygon points="0,-7 4,2 -4,2" fill="#456A40"/>
  <rect x="-0.8" y="2" width="1.6" height="3" fill="#3A2818"/>
</symbol>

<symbol id="sym-forest-cluster" viewBox="-20 -18 40 22">
  <use href="#sym-pine" x="-12" y="2" transform="scale(0.7)"/>
  <use href="#sym-pine" x="-4" y="0" transform="scale(0.85)"/>
  <use href="#sym-pine" x="6" y="2" transform="scale(0.75)"/>
  <use href="#sym-pine" x="13" y="0" transform="scale(0.8)"/>
  <use href="#sym-pine" x="0" y="-3" transform="scale(0.9)"/>
</symbol>

<!-- ===== BUILDINGS (tier 3) ===== -->
<symbol id="sym-pagoda" viewBox="-18 -28 36 36">
  <!-- 3 tầng mái cong Trung Hoa -->
  <path d="M-18,-6 Q-14,-8 -10,-7 L10,-7 Q14,-8 18,-6 L14,-4 L-14,-4 Z" fill="#6E3018"/>
  <rect x="-10" y="-4" width="20" height="6" fill="#A87038" stroke="#3A1808" stroke-width="0.6"/>
  <path d="M-14,-14 Q-10,-16 -7,-15 L7,-15 Q10,-16 14,-14 L11,-12 L-11,-12 Z" fill="#6E3018"/>
  <rect x="-8" y="-12" width="16" height="6" fill="#A87038" stroke="#3A1808" stroke-width="0.6"/>
  <path d="M-10,-22 Q-7,-24 -5,-23 L5,-23 Q7,-24 10,-22 L8,-20 L-8,-20 Z" fill="#6E3018"/>
  <rect x="-6" y="-20" width="12" height="6" fill="#A87038" stroke="#3A1808" stroke-width="0.6"/>
  <!-- Cờ đỉnh -->
  <rect x="-0.4" y="-28" width="0.8" height="5" fill="#3A1808"/>
  <circle cx="0" cy="-28" r="1.2" fill="#D4A030"/>
</symbol>

<symbol id="sym-market" viewBox="-14 -18 28 22">
  <rect x="-12" y="-4" width="24" height="6" fill="#8A5028" stroke="#3A1808" stroke-width="0.5"/>
  <path d="M-14,-4 L-10,-12 L10,-12 L14,-4 Z" fill="#A8302A" stroke="#3A1808" stroke-width="0.6"/>
  <!-- 2 lồng đèn -->
  <ellipse cx="-8" cy="-1" rx="1.5" ry="2.2" fill="#E84020"/>
  <ellipse cx="8" cy="-1" rx="1.5" ry="2.2" fill="#E84020"/>
</symbol>

<symbol id="sym-altar" viewBox="-10 -20 20 24">
  <rect x="-8" y="0" width="16" height="3" fill="#5A4828"/>
  <rect x="-5" y="-14" width="2" height="14" fill="#8A7048"/>
  <rect x="3" y="-14" width="2" height="14" fill="#8A7048"/>
  <rect x="-7" y="-16" width="14" height="2.5" fill="#5A4828"/>
  <!-- Linh khí glow -->
  <ellipse cx="0" cy="-7" rx="1.5" ry="4" fill="rgba(100,200,180,0.45)"/>
</symbol>

<symbol id="sym-cave" viewBox="-12 -16 24 20">
  <path d="M-10,4 Q-12,-6 -7,-12 Q0,-16 7,-12 Q12,-6 10,4 Z" fill="#1A0A05"/>
  <path d="M-7,4 Q-9,-3 -5,-8 Q0,-11 5,-8 Q9,-3 7,4 Z" fill="#08040A"/>
  <!-- Stalactite -->
  <polygon points="-3,-8 -2.5,-5 -3.5,-5" fill="#2A1810"/>
  <polygon points="2,-8 2.5,-5 1.5,-5" fill="#2A1810"/>
</symbol>

<symbol id="sym-herb" viewBox="-10 -14 20 18">
  <path d="M0,3 Q-6,-2 -8,-10" stroke="#3A5A28" stroke-width="1.2" fill="none"/>
  <path d="M0,3 Q6,-2 8,-10" stroke="#3A5A28" stroke-width="1.2" fill="none"/>
  <path d="M0,3 L0,-12" stroke="#3A5A28" stroke-width="1.2"/>
  <ellipse cx="-7" cy="-9" rx="2" ry="3" fill="#5A8A38" transform="rotate(-30 -7 -9)"/>
  <ellipse cx="7"  cy="-9" rx="2" ry="3" fill="#5A8A38" transform="rotate(30 7 -9)"/>
  <ellipse cx="0"  cy="-11" rx="2" ry="3" fill="#5A8A38"/>
  <circle cx="0" cy="-11" r="1" fill="#D04848"/>
</symbol>

<symbol id="sym-person" viewBox="-6 -14 12 16">
  <circle cx="0" cy="-10" r="2.5" fill="#3A2818"/>
  <path d="M-4,2 L-3,-6 Q0,-8 3,-6 L4,2 Z" fill="#3A2818"/>
  <path d="M-3,-6 L-5,-2 M3,-6 L5,-2" stroke="#3A2818" stroke-width="1.2"/>
</symbol>

<!-- ===== CLOUD SWIRL (如意 motif) ===== -->
<symbol id="sym-cloud-swirl" viewBox="-30 -10 60 20">
  <path d="M-28,0 Q-22,-8 -14,-4 Q-8,-10 0,-6 Q8,-12 14,-6 Q20,-10 28,-2"
        fill="none" stroke="#C8A858" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M-22,-4 Q-20,-2 -22,0 Q-24,2 -22,4"
        fill="none" stroke="#C8A858" stroke-width="0.9"/>
  <path d="M14,-6 Q16,-4 14,-2 Q12,0 14,2"
        fill="none" stroke="#C8A858" stroke-width="0.9"/>
</symbol>

<!-- ===== COMPASS ROSE ===== -->
<symbol id="sym-compass" viewBox="-30 -30 60 60">
  <circle r="26" fill="rgba(232,213,163,0.4)" stroke="#8A6830" stroke-width="0.8"/>
  <circle r="20" fill="none" stroke="#8A6830" stroke-width="0.5"/>
  <!-- 4 mũi nhọn -->
  <polygon points="0,-22 3,-3 0,0 -3,-3" fill="#8A2810"/>
  <polygon points="0,22  3,3  0,0  -3,3"  fill="#3A1808"/>
  <polygon points="-22,0 -3,-3 0,0 -3,3"  fill="#3A1808"/>
  <polygon points="22,0  3,-3  0,0 3,3"   fill="#3A1808"/>
  <!-- Chữ Hán 4 hướng -->
  <text x="0" y="-14" text-anchor="middle" font-size="6" fill="#3A1808"
        font-family="serif" font-weight="bold">北</text>
  <text x="0" y="18"  text-anchor="middle" font-size="6" fill="#3A1808"
        font-family="serif" font-weight="bold">南</text>
  <text x="-14" y="2" text-anchor="middle" font-size="6" fill="#3A1808"
        font-family="serif" font-weight="bold">西</text>
  <text x="14"  y="2" text-anchor="middle" font-size="6" fill="#3A1808"
        font-family="serif" font-weight="bold">東</text>
</symbol>
```

**Cách dùng:**
```xml
<use href="#sym-mt-peak"     x="120" y="40"  width="32" height="28"/>
<use href="#sym-forest-cluster" x="248" y="168" width="32" height="22"/>
<use href="#sym-pagoda"      x="200" y="120" width="40" height="40"/>
```

Lợi ích: render data unchanged, chỉ chọn symbol khác nhau theo `mountain[]`/`forest[]`/`type` field.

### 2.4 Pattern library (terrain fill)

```xml
<!-- Dunes (sa mạc) -->
<pattern id="pat-dunes" width="40" height="14" patternUnits="userSpaceOnUse">
  <path d="M0,12 Q10,4 20,12 Q30,4 40,12" stroke="rgba(180,140,80,0.35)" fill="none"/>
</pattern>

<!-- Ice cracks -->
<pattern id="pat-ice" width="30" height="30" patternUnits="userSpaceOnUse">
  <path d="M15,0 L15,12 M5,15 L25,15 M10,8 L18,22" stroke="rgba(140,170,200,0.32)" stroke-width="0.6" fill="none"/>
  <circle cx="15" cy="15" r="1.2" fill="rgba(220,235,255,0.35)"/>
</pattern>

<!-- Ocean (2 layers: wave back + wave front) -->
<pattern id="pat-ocean" width="40" height="20" patternUnits="userSpaceOnUse">
  <path d="M0,10 Q10,5 20,10 Q30,15 40,10" stroke="rgba(74,109,128,0.4)" stroke-width="0.7" fill="none"/>
  <path d="M0,16 Q10,11 20,16 Q30,21 40,16" stroke="rgba(123,165,184,0.32)" stroke-width="0.5" fill="none"/>
</pattern>

<!-- Ruins (cổ vực) — broken column silhouettes -->
<pattern id="pat-ruins" width="36" height="36" patternUnits="userSpaceOnUse">
  <rect x="6"  y="20" width="2" height="10" fill="rgba(120,90,70,0.35)"/>
  <rect x="18" y="14" width="2" height="16" fill="rgba(120,90,70,0.35)"/>
  <rect x="28" y="22" width="2" height="8"  fill="rgba(120,90,70,0.35)"/>
  <rect x="6"  y="20" width="6" height="1.5" fill="rgba(120,90,70,0.45)"/>
</pattern>

<!-- Forest dense (xanh đậm dày) -->
<pattern id="pat-forest" width="22" height="22" patternUnits="userSpaceOnUse">
  <polygon points="11,4 16,16 6,16" fill="rgba(50,80,45,0.45)"/>
  <polygon points="4,14 8,22 0,22"  fill="rgba(50,80,45,0.35)"/>
  <polygon points="18,14 22,22 14,22" fill="rgba(50,80,45,0.35)"/>
</pattern>

<!-- Swamp (nước đọng + lily) -->
<pattern id="pat-swamp" width="28" height="20" patternUnits="userSpaceOnUse">
  <ellipse cx="8" cy="10" rx="5" ry="2" fill="rgba(60,80,50,0.40)"/>
  <ellipse cx="20" cy="14" rx="4" ry="1.5" fill="rgba(60,80,50,0.32)"/>
  <circle cx="14" cy="6" r="1.2" fill="rgba(180,120,100,0.40)"/>
</pattern>
```

### 2.5 Coastline / borders mềm hơn

Polygon hiện tại có cạnh thẳng giữa các điểm. Hai cách fix:

**Cách A — feDisplacementMap (filter):** apply lên `<polygon>` → biên gợn nhiễu tự nhiên. Rẻ, không đổi data.

**Cách B — Catmull-Rom interpolation:** transform `points` string thành smooth `<path>` ở render time. Tốt hơn (kiểm soát được mức smooth), nhưng cần helper JS:

```js
function smoothPath(pointsStr, tension = 0.5) {
  const pts = pointsStr.trim().split(/\s+/).map(p => p.split(',').map(Number));
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d + ' Z';
}
```

→ Coastline mượt như tay vẽ, không phá data layer.

### 2.6 Stamps "ấn mộc" thật

Thay rect cứng bằng:
```xml
<g class="stamp" transform="translate(562,185) rotate(-2.5)" filter="url(#f-ink-bleed)">
  <!-- Border kép (đặc trưng ấn Hán) -->
  <rect x="-22" y="-22" width="44" height="44" rx="2"
        fill="url(#g-stamp-ma)" stroke="#3A0808" stroke-width="0.6"/>
  <rect x="-19" y="-19" width="38" height="38" fill="none"
        stroke="rgba(255,220,180,0.8)" stroke-width="0.4"/>
  <!-- Chữ Hán center -->
  <text x="0" y="2" text-anchor="middle" font-size="22"
        fill="#F8E0B0" font-family="'STSong','SimSun',serif"
        font-weight="900">血</text>
</g>
```

Rotation 1-3° lệch + filter ink-bleed → stamp như đóng tay.

### 2.7 Trade routes (dotted paths)

```xml
<g class="trade-routes" pointer-events="none">
  <path d="M148,210 Q230,160 298,155 Q380,180 462,268"
        stroke="#8A6020" stroke-width="0.9" stroke-dasharray="2,4"
        fill="none" opacity="0.6"/>
  <path d="M298,155 Q400,180 562,185"
        stroke="#8A6020" stroke-width="0.9" stroke-dasharray="2,4"
        fill="none" opacity="0.55"/>
  <!-- Mini diamond markers tại midpoint -->
  <polygon points="230,170 233,167 236,170 233,173" fill="#8A6020" opacity="0.7"/>
</g>
```

### 2.8 Layered rendering order

```
z=0  Parchment base (linearGradient + feTurbulence overlay)
z=1  Aged spots (random ellipses màu nâu opacity 0.06)
z=2  Coastline shadow (offset 2px, dark, blurred)
z=3  Region polygons (smooth path) — fill = terrain base color
z=4  Pattern overlay (dunes/ice/forest/ocean) — opacity 0.4-0.7
z=5  Hero terrain symbols (mountains, forest clusters) via <use>
z=6  Rivers + lakes (path bezier blue gradient)
z=7  Trade routes (dotted gold)
z=8  Sect stamps (rotate, ink bleed)
z=9  Region calligraphic labels (chữ Hán big + Việt small)
z=10 Cloud border swirl (vân mây 4 edges)
z=11 Vignette / worn edges (radial dark)
z=12 Compass rose + scale bar
z=13 Player marker (animated pulse)
z=14 Interaction overlay (invisible hit areas)
```

Hiện tại các tầng đang xáo trộn thứ tự và thiếu một nửa.

### 2.9 Animations subtle (không lạm dụng)

- Stars → **xóa** (sai concept).
- Player marker: pulse OK.
- Cloud swirl: `<animateTransform>` drift ngang chậm (60s loop) → nhịp thở của map.
- Stamp glow on hover: CSS `:hover` → `filter: brightness(1.15)`.
- Trade route: `stroke-dashoffset` animation → caravan moving feel.

### 2.10 Typography

- Region chữ Hán: `Noto Serif SC`, `STSong`, `KaiTi`, fallback `serif` — đậm.
- Việt label: font hiện tại nhưng letter-spacing rộng.
- Subtle text-shadow trên parchment: `filter="url(#f-ink-bleed)"` cho chữ lớn.

---

## 3. ROADMAP IMPLEMENT (chia phase, không big-bang)

### Phase 0 — Defs library (không vỡ gì)
Tạo file `js/ui/map-defs.js` exports 2 string:
```js
export const MAP_DEFS_GLOBAL = `<defs>...</defs>`;   // filters, gradients, symbols
export const MAP_DEFS_PATTERNS = `<defs>...</defs>`; // patterns (separate vì có thể tier riêng)
```
Inject vào mọi SVG. Không gọi gì khác. **Test:** map cũ vẫn chạy, defs có sẵn nhưng chưa dùng.

### Phase 1 — Tầng 1 visual rewrite
1. Trong `_buildNhanGioiSVG`: thay `<rect fill="url(#ng-bg)">` bằng parchment layer.
2. Xóa stars (giữ marker pulse).
3. Thay region polygon → smooth path qua `smoothPath()`.
4. Thay icePeaks + islands cứng bằng `<use href="#sym-mt-peak">` + `<use href="#sym-forest-cluster">`.
5. Thêm 4 cloud swirl ở 4 cạnh (top, bottom, left, right midpoint).
6. Thay stamps style (rect → ink stamp với rotate).
7. Compass rose dùng `<use href="#sym-compass">`.
8. Thêm trade routes dotted nối 5 vùng.

Estimate: 1 session ~ 400-500 dòng.

### Phase 2 — Tầng 2 visual rewrite
Tương tự Phase 1 cho `_buildKhuyetVucSVG`. Reuse defs library.
- Thay `_svgMountain` → `<use href="#sym-mt-peak">` với variant theo random hoặc index.
- Thay `_svgForest` → `<use href="#sym-forest-cluster">`.
- Thêm trade routes giữa 12 territory.
- Stamps đã có → upgrade style.
- River paths đã có → giữ, chỉ đổi màu cho khớp parchment.

### Phase 3 — Fix MAP-1 (làng lân cận)
Xóa block village trong `_renderTier2Territory` theo spec WORLD_MAP_DESIGN.md §8.2. **Trước khi làm Phase 4**, vì Phase 4 sẽ rewrite phần đó.

### Phase 4 — Tầng 3 visual rewrite
Đây là phase tốn nhất vì cần xóa toàn bộ emoji + dùng symbol map:
```js
const TYPE_SYMBOL = {
  sect_gate:      'sym-pagoda',
  hunt_zone:      'sym-forest-cluster',
  market:         'sym-market',
  cultivate_spot: 'sym-altar',
  gather_zone:    'sym-herb',
  dungeon:        'sym-cave',
  npc:            'sym-person',
  alchemy:        'sym-altar', // hoặc sym-cauldron riêng
  auction:        'sym-market',
  freelance_quest:'sym-market',
  secret_gather:  'sym-herb',   // glow stronger
  mystery_cave:   'sym-cave',
  mystery_zone:   'sym-altar',
  boss_zone:      'sym-cave',
  ghost_market:   'sym-market', // tint xanh ma
  treasure:       'sym-cave',
};
```
Thêm:
- Bg parchment thay vì CSS gradient.
- Dotted path nối các locations (smooth bezier).
- Bỏ circles r=24 → bbox vô hình quanh `<use>` để click.
- Labels giữ qua `svgZoneLocLabel`.
- Locked icon: chấm khóa overlay nhỏ ở góc icon.

### Phase 5 — Polish & animation
- Cloud swirl animation.
- Trade route stroke-dashoffset.
- Stamps hover effect.
- Sepia overall via CSS `filter: sepia(0.15)` trên container nếu cần tone cuối.

### Phase 6 — Tầng 4 (Tân Thủ Thôn) — thấp ưu tiên
Apply cùng style cho `starter-village.js`.

---

## 4. RỦI RO & CÂN NHẮC

### 4.1 Performance
- `<symbol>` + `<use>` rất rẻ — browser cache.
- `feTurbulence` chỉ render 1 lần tại defs, không tốn frame.
- 60 stars hiện tại cũng OK, nhưng xóa giúp giảm noise.
- **Cảnh báo:** `feDisplacementMap` lên polygon lớn có thể chậm trên mobile cũ. Test trước, fallback off khi `prefers-reduced-motion`.

### 4.2 Backward compat
- Data layer (`NHAN_GIOI_REGIONS`, `KHUYETVUC_TERRITORIES`, `TERRITORY_INTERIORS`) **không đổi**.
- Click handlers, `_showingKhuyetVuc`, `_mapLevel` không đổi.
- Chỉ rewrite hàm `_buildXxxSVG`. Hàm caller giữ nguyên.

### 4.3 CSS map.css
Hiện có `.map-svg-t2`, `.map-side-t2`, `.kv-territory`, `.znode`, v.v. Phải kiểm để **không ghi đè** parchment background bằng CSS gradient cũ. Có thể cần thêm class mới như `.kv-painted` cho version mới, giữ class cũ làm fallback.

### 4.4 Filter ID conflict giữa các tầng
WORLD_MAP_DESIGN.md §8.4 đã cảnh báo: dùng prefix riêng (`f-parch-t1`, `f-parch-t2`...) hoặc dùng 1 defs global đặt trong SVG ngoài cùng.
→ Khuyến nghị: **1 defs global** đặt trong wrapper SVG cha (hoặc `<svg width="0" height="0">` hidden trong DOM tree), tất cả map SVG `<use>` chung.

### 4.5 Không emoji
WORLD_MAP_DESIGN.md §8.4 cấm. Tier 3 hiện vi phạm 50+ chỗ. Phase 4 sẽ fix toàn bộ.

---

## 5. ĐO LƯỜNG SUCCESS

Sau implement, kiểm bằng mắt + checklist:

- [ ] Map nhìn như giấy cũ (sepia tone, grain visible)
- [ ] Mountains có đỉnh tuyết + bóng + đa dạng variant
- [ ] Forest là cụm 5+ cây pine, không phải 1 ellipse
- [ ] Có vân mây swirl ở viền (≥4 vị trí)
- [ ] Coastline gợn, không thẳng tắp
- [ ] Stamps lệch nhẹ 1-3°, có ink bleed
- [ ] Dotted trade routes ≥6 đường ở Tầng 2
- [ ] Tầng 3 KHÔNG còn emoji literal
- [ ] Tầng 3 có path dotted nối locations
- [ ] Compass rose chữ Hán 4 hướng
- [ ] FPS ≥ 50 trên desktop, ≥ 30 mobile (test bằng DevTools)
- [ ] Click/hover hoạt động giống cũ

---

## 6. DEMO FILE

Đã tạo `idle-game/docs/map-svg-demo.html` — mở trong browser để xem **side-by-side**: SVG kiểu hiện tại (trái) vs Painted Scroll mục tiêu (phải).

Mở: `idle-game/docs/map-svg-demo.html`

---

## 7. QUYẾT ĐỊNH ĐÃ CHỐT (2026-05-26)

| # | Câu hỏi | Quyết định | Implication |
|---|---|---|---|
| 1 | Tone parchment | **Trắng kem warm** (#F2E0B8 → #CCAC7A), không sepia đậm | Stamps & terrain phải có **đủ contrast** với parchment sáng — màu mực đậm hơn (deep crimson, ink black, navy thật sâu). Tránh pastel. |
| 2 | Trade routes | **Sẽ thành mechanic** (caravan, di chuyển, có thể rủi ro) | Cần **data layer riêng** — không inline path SVG. Tách thành `TRADE_ROUTES` constant trong `map-data.js`, render layer chỉ đọc từ data. |
| 3 | Animation | **Cho phép drift cloud/route**, pin tính sau | Animation tier 1 + tier 2 luôn bật. Có thể gate qua `prefers-reduced-motion` sau. |

### 7.1 Trade Routes — Data Model (chuẩn bị cho mechanic tương lai)

Thêm vào `map-data.js`:

```js
// ============================================================
// TRADE ROUTES — Đường giao thương (Painted Scroll dotted paths)
// Tương lai sẽ thành mechanic: caravan di chuyển, rủi ro cướp,
// tốc độ giao hàng, profit per route.
// Hiện tại: chỉ render dotted path trên map.
// ============================================================

/**
 * @typedef {Object} TradeRoute
 * @property {string} id
 * @property {'tier1'|'tier2'} tier — Tầng nào hiển thị
 * @property {string} fromId — region/territory id (tier1: NHAN_GIOI_REGIONS.id, tier2: KHUYETVUC_TERRITORIES.id)
 * @property {string} toId
 * @property {Array<[number,number]>} waypoints — control points cho bezier
 * @property {number} dangerLevel — 0-5, ảnh hưởng caravan future mechanic
 * @property {'land'|'sea'|'mountain'|'underground'} terrain
 * @property {boolean} active — hiện tại có giao thương không (false = đường cổ bỏ hoang)
 * @property {string} [name] — optional, tên đường (vd "Tây Phong Cổ Đạo")
 */

export const TRADE_ROUTES = [
  // ─── TẦNG 1 — Giữa 5 đại vùng ──────────────────────────────
  {
    id: 'tr_kv_tc',
    tier: 'tier1',
    fromId: 'khuyetvuc', toId: 'than_chau',
    waypoints: [[192,272],[300,210],[420,200],[530,240]],
    dangerLevel: 1, terrain: 'land', active: true,
    name: 'Đông Hành Đại Đạo',
  },
  {
    id: 'tr_kv_vd',
    tier: 'tier1',
    fromId: 'khuyetvuc', toId: 'vinh_da',
    waypoints: [[192,272],[230,200],[280,140],[350,90]],
    dangerLevel: 3, terrain: 'mountain', active: true,
    name: 'Bắc Hành Sương Đạo',
  },
  {
    id: 'tr_kv_tt',
    tier: 'tier1',
    fromId: 'khuyetvuc', toId: 'thien_tinh',
    waypoints: [[192,272],[260,360],[340,420],[418,445]],
    dangerLevel: 2, terrain: 'sea', active: true,
    name: 'Nam Hải Thương Lộ',
  },
  {
    id: 'tr_tc_tt',
    tier: 'tier1',
    fromId: 'than_chau', toId: 'thien_tinh',
    waypoints: [[530,240],[560,310],[580,380],[480,445]],
    dangerLevel: 1, terrain: 'sea', active: true,
  },
  {
    id: 'tr_cv_kv',
    tier: 'tier1',
    fromId: 'co_vuc', toId: 'khuyetvuc',
    waypoints: [[40,330],[80,300],[130,290],[192,272]],
    dangerLevel: 5, terrain: 'underground', active: false,  // đường cổ bỏ hoang
    name: 'Cổ Đạo Phế Tích',
  },

  // ─── TẦNG 2 — Giữa các territory trong Khuyết Vực ─────────
  {
    id: 'tr_tt_bv',
    tier: 'tier2',
    fromId: 'thai_thanh', toId: 'bach_van',
    waypoints: [[148,210],[220,180],[298,155]],
    dangerLevel: 0, terrain: 'land', active: true,
  },
  {
    id: 'tr_bv_vlh',
    tier: 'tier2',
    fromId: 'bach_van', toId: 'van_linh_hoi',
    waypoints: [[298,155],[380,200],[462,268]],
    dangerLevel: 1, terrain: 'land', active: true,
  },
  {
    id: 'tr_vlh_hn',
    tier: 'tier2',
    fromId: 'van_linh_hoi', toId: 'huyet_nguyet',
    waypoints: [[462,268],[510,220],[562,185]],
    dangerLevel: 4, terrain: 'land', active: true,  // chính-ma biên giới
    name: 'Huyết Đạo',
  },
  {
    id: 'tr_vlh_tl',
    tier: 'tier2',
    fromId: 'van_linh_hoi', toId: 'tuyet_linh',
    waypoints: [[462,268],[360,280],[262,288]],
    dangerLevel: 1, terrain: 'land', active: true,
  },
  {
    id: 'tr_tl_hpd',
    tier: 'tier2',
    fromId: 'tuyet_linh', toId: 'huyen_phu_duong',
    waypoints: [[262,288],[260,340],[262,398]],
    dangerLevel: 2, terrain: 'swamp', active: true,
  },
  {
    id: 'tr_hpd_dpl',
    tier: 'tier2',
    fromId: 'huyen_phu_duong', toId: 'doc_phong_linh',
    waypoints: [[262,398],[420,380],[572,352]],
    dangerLevel: 4, terrain: 'land', active: true,
    name: 'Độc Vụ Lộ',
  },
  {
    id: 'tr_tt_lbt',
    tier: 'tier2',
    fromId: 'thai_thanh', toId: 'luyen_bao_tong',
    waypoints: [[148,210],[120,310],[102,455]],
    dangerLevel: 2, terrain: 'mountain', active: true,
  },
];
```

### 7.2 Style mapping cho trade route render

```js
// Trong world-map.js
const ROUTE_STYLE = {
  land:        { color: '#7A5018', dash: '3,4',  width: 1.0 },
  sea:         { color: '#3A6890', dash: '2,5',  width: 1.0 },
  mountain:    { color: '#5A4828', dash: '4,3',  width: 0.9 },
  underground: { color: '#583878', dash: '1,4',  width: 0.8 },  // đứt nét nhiều = đường cổ
};

function renderTradeRoute(route) {
  const style = ROUTE_STYLE[route.terrain];
  const opacity = route.active ? 0.78 : 0.35;  // không active = mờ
  const dangerGlow = route.dangerLevel >= 4 ? 'filter="url(#f-danger-glow)"' : '';
  // ... build path từ waypoints qua bezier smoothing
  // Animation drift: stroke-dashoffset từ 0 → -100 trong 8s loop
}
```

### 7.3 Animation specs (đã được phép)

| Element | Animation | Duration | Notes |
|---|---|---|---|
| Cloud swirl border | `animateTransform translate ±8px x` | 60s loop ease-in-out | Subtle, không gây giật |
| Trade routes | `stroke-dashoffset` từ 0 → -200 | 8s linear infinite | Caravan moving feel |
| Player marker | `r` pulse 5→9, `opacity` 0.6→0.1 | 2.4s | Đã có, giữ |
| Sect stamps | CSS `:hover filter:brightness(1.18)` | instant | Tương tác |
| Region label (active) | CSS `:hover opacity` | instant | Tương tác |
| Region polygon (locked) | Tĩnh hoàn toàn | — | |
| feTurbulence parchment | **KHÔNG animate** (chỉ render static) | — | Đã có grain texture đủ |

### 7.4 Color palette chốt (warm cream parchment)

```css
/* Parchment 3-stop gradient */
--parch-light: #F2E0B8;   /* highlight, top-left */
--parch-mid:   #E6CA94;   /* base 45% */
--parch-dark:  #CCAC7A;   /* shadow, bottom-right */

/* Aged marks */
--age-spot:    #8A6028;   /* opacity 0.15-0.25 */
--age-edge:    #604020;   /* vignette outer */

/* Ink colors per faction (5 stamps) */
--ink-chinh:   #1E4878;   /* navy royal (Chính Đạo) */
--ink-ma:      #A82828;   /* deep crimson (Ma Đạo) */
--ink-trung:   #208070;   /* deep teal (Trung Lập) */
--ink-hazard:  #4A3848;   /* muted plum (Hiểm Địa) */
--ink-co-vuc:  #583878;   /* violet (Cổ Vực) */
--ink-gold:    #A87018;   /* warm gold (Thiên Tinh sea trung lập) */

/* Terrain on parchment */
--terr-land:    #B8D098;   /* xanh nhạt warm */
--terr-mountain:#9A8060;   /* rock warm */
--terr-snow:    #FFFFFF;
--terr-water:   #7BA5B8;   /* teal soft */
--terr-ice:     #D8E0E8;   /* nhạt hơn water */
--terr-desert:  #E0C088;   /* warm sand */
--terr-forest:  #4A6038;   /* xanh đậm warm */
--terr-swamp:   #6A6840;   /* olive */
--terr-ruins:   #8A6850;   /* warm clay */

/* Text */
--text-ink:     #3A2818;   /* primary text trên parchment */
--text-ink-mid: #5A4028;
--text-ink-fade:#7A6048;
```

---

## 8. ĐỀ XUẤT BƯỚC TIẾP

**Khuyến nghị:** Gộp **Phase 0 + Phase 1** thành 1 session (defs library + Tầng 1 cùng lúc).

Lý do:
- Tầng 1 ít data (5 region) → test nhanh, thấy kết quả ngay.
- Defs library nếu tạo riêng mà không có consumer ngay sẽ khó verify đúng/sai.
- Trade routes data ở `map-data.js` không phá gì (chỉ thêm export mới).

Sau Phase 0+1 chạy ổn → tiếp Phase 2 (Tầng 2 reuse defs), rồi Phase 3 (fix MAP-1) → Phase 4 (Tầng 3, lớn nhất).

---

*Tài liệu này đi kèm `WORLD_MAP_DESIGN.md` §8 — bổ sung phần kỹ thuật chi tiết, không thay thế phần lore/design.*
